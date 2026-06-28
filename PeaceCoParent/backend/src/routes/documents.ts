import { Router, Response, NextFunction, Request } from 'express';
import { S3Client, GetObjectCommand, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import multer, { MulterError } from 'multer';
import pool from '../db/index';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

// 10 MB hard limit — enforced at both frontend and backend
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

// Multer error handler — converts multer errors to clean JSON 400 responses
// instead of letting Express fall through to a generic 500.
function handleMulterError(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File too large. Maximum size is 10 MB.' });
      return;
    }
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }
  if (err instanceof Error && err.message.startsWith('File type not allowed')) {
    res.status(400).json({ error: 'File type not supported. Please upload PDF, Word, image, or text files.' });
    return;
  }
  next(err);
}

const router = Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  } : undefined,
});
const BUCKET = process.env.AWS_S3_BUCKET || 'peacecoparent-docs';

// GET /api/documents/status — check if S3 is configured
router.get('/status', requireAuth, (_req, res: Response) => {
  res.json({ available: !!process.env.AWS_ACCESS_KEY_ID });
});

async function getFamilyId(userId: string): Promise<string | null> {
  const r = await pool.query('SELECT family_id FROM family_members WHERE user_id = $1 LIMIT 1', [userId]);
  return r.rows[0]?.family_id ?? null;
}

function rowToDoc(r: Record<string, unknown>) {
  return {
    id: r.id,
    familyId: r.family_id,
    uploadedBy: r.uploaded_by,
    uploaderName: r.uploader_name,
    uploaderColor: r.uploader_color,
    name: r.name,
    category: r.category,
    s3Key: r.s3_key,
    fileSize: r.file_size,
    mimeType: r.mime_type,
    version: r.version,
    notes: r.notes,
    createdAt: r.created_at,
  };
}

// GET /api/documents
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const result = await pool.query(
    `SELECT d.*, u.name as uploader_name, fm.color as uploader_color
     FROM documents d
     JOIN users u ON u.id = d.uploaded_by
     JOIN family_members fm ON fm.user_id = d.uploaded_by AND fm.family_id = d.family_id
     WHERE d.family_id = $1
     ORDER BY d.created_at DESC`,
    [familyId]
  );

  res.json({ documents: result.rows.map(rowToDoc) });
});

// POST /api/documents/upload — server-side upload to S3
router.post('/upload', requireAuth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  if (!req.file) { res.status(400).json({ error: 'No file provided' }); return; }

  if (!process.env.AWS_ACCESS_KEY_ID) {
    res.status(503).json({ error: 'Document storage is not available yet. Please check back soon.' });
    return;
  }

  const { category, notes } = req.body as { category?: string; notes?: string };
  const documentId = uuidv4();
  const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
  const s3Key = `families/${familyId}/docs/${documentId}/${safeName}`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    Metadata: { familyId, uploadedBy: req.userId!, documentId },
  }));

  await pool.query(
    `INSERT INTO documents (id, family_id, uploaded_by, name, category, s3_key, file_size, mime_type, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [documentId, familyId, req.userId, safeName, category || 'other', s3Key, req.file.size, req.file.mimetype, notes ?? null]
  );

  res.json({ documentId, s3Key, name: safeName });
});

// GET /api/documents/:id/download — get a presigned download URL
router.get('/:id/download', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const result = await pool.query(
    'SELECT * FROM documents WHERE id = $1 AND family_id = $2',
    [req.params.id, familyId]
  );
  if (result.rows.length === 0) { res.status(404).json({ error: 'Document not found' }); return; }

  const doc = result.rows[0];

  if (!process.env.AWS_ACCESS_KEY_ID) {
    res.json({ downloadUrl: null, message: 'AWS not configured' });
    return;
  }

  const command = new GetObjectCommand({ Bucket: BUCKET, Key: doc.s3_key });
  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 86400 }); // 24 hours

  res.json({ downloadUrl });
});

// DELETE /api/documents/:id
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const familyId = await getFamilyId(req.userId!);
  if (!familyId) { res.status(403).json({ error: 'Not in a family' }); return; }

  const result = await pool.query(
    'DELETE FROM documents WHERE id = $1 AND family_id = $2 RETURNING s3_key',
    [req.params.id, familyId]
  );
  if (result.rows.length === 0) { res.status(404).json({ error: 'Document not found' }); return; }

  if (process.env.AWS_ACCESS_KEY_ID) {
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: result.rows[0].s3_key }));
    } catch (e) {
      console.error('S3 delete failed:', e);
    }
  }

  res.json({ message: 'Document deleted' });
});

export default router;
