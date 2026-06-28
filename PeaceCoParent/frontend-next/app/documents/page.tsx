'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Document, DocCategory } from '@/types/shared';
import AppLayout from '@/components/AppLayout';
import { PageHero, Card, Btn, Icon } from '@/components/V3';
import { fmtDate } from '@/lib/format';
import { apiFetchRaw } from '@/lib/api';
import { useToast } from '@/components/ui';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic',
  'text/plain',
]);
const ALLOWED_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.heic,.txt';
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — must match backend multer limit

const CATEGORIES: Record<DocCategory, string> = {
  legal: 'Legal',
  medical: 'Medical',
  school: 'School',
  financial: 'Financial',
  other: 'Other',
};

const CAT_COLORS: Record<DocCategory, string> = {
  legal:     'oklch(52% 0.12 280)',
  medical:   'oklch(52% 0.12 25)',
  school:    'oklch(52% 0.12 230)',
  financial: 'oklch(52% 0.12 75)',
  other:     'var(--ink-soft)',
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Documents() {
  const { familyMember } = useAuth();
  const toast = useToast();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [s3Available, setS3Available] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCategoryRef = useRef<DocCategory>('other');

  void familyMember;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statusData, docsData] = await Promise.all([
        apiFetch<{ available: boolean }>('/documents/status'),
        apiFetch<{ documents: Document[] }>('/documents'),
      ]);
      setS3Available(statusData.available);
      setDocs(docsData.documents);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handlePickCategory(cat: DocCategory) {
    uploadCategoryRef.current = cat;
    setShowCategoryPicker(false);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_MIME.has(file.type)) {
      toast.error('File type not supported. Please upload PDF, Word, Excel, image, or text files.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('File too large. Maximum size is 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', uploadCategoryRef.current);
      // Use apiFetchRaw so the token-refresh logic in api.ts handles 401s
      // (the plain fetch() path had no refresh and would silently fail on expiry)
      const res = await apiFetchRaw('/documents/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
      }
      await load();
      toast.success('Document uploaded.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDownload(id: string) {
    try {
      const { downloadUrl } = await apiFetch<{ downloadUrl: string | null }>(`/documents/${id}/download`);
      if (downloadUrl) window.open(downloadUrl, '_blank');
      else toast.info('Download temporarily unavailable. Please try again later.');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Download failed');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this document?')) return;
    try {
      await apiFetch(`/documents/${id}`, { method: 'DELETE' });
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast.success('Document deleted.');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  const grouped = docs.reduce((acc, d) => {
    const cat = d.category as DocCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(d);
    return acc;
  }, {} as Record<DocCategory, Document[]>);

  return (
    <AppLayout>
      <input ref={fileInputRef} type="file" aria-label="Upload document" accept={ALLOWED_ACCEPT} className="hidden" onChange={handleFileChange} />

      <PageHero
        eyebrow="Storage · tamper-proof"
        title={<>Documents — <em>safer than email.</em></>}
        subtitle="Custody agreements, medical records, school files, court orders. Shared with your co-parent, locked from edits."
        action={
          <div className="relative">
            <Btn
              kind="primary"
              tone="dark"
              icon={Icon.upload(12)}
              onClick={() => setShowCategoryPicker(v => !v)}
              disabled={uploading || s3Available === false}
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </Btn>
            {showCategoryPicker && (
              <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-[14px] border shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="px-3 pb-1.5 pt-2.5 text-[11px] font-bold uppercase tracking-[0.06em]"
                  style={{ color: 'var(--ink-soft)' }}>Select category</div>
                {(Object.entries(CATEGORIES) as [DocCategory, string][]).map(([cat, label]) => (
                  <button key={cat} onClick={() => handlePickCategory(cat)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[14px] transition-colors hover:bg-[var(--bg)]"
                    style={{ background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: CAT_COLORS[cat] }} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      {s3Available === false && (
        <div className="mb-4 flex items-start gap-3 rounded-[16px] px-5 py-4"
          style={{ background: 'oklch(94% 0.05 75)', border: '1px solid oklch(88% 0.08 75)' }}>
          <svg width="18" height="18" fill="none" stroke="oklch(52% 0.12 75)" strokeWidth="2" viewBox="0 0 24 24" className="mt-0.5 flex-shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: 'oklch(42% 0.12 75)' }}>
              File uploads are temporarily unavailable
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: 'oklch(52% 0.12 75)' }}>
              Document storage is being set up. Your existing documents are safe. Uploads will be re-enabled shortly.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl px-4 py-3 text-[13px]"
          style={{ background: 'oklch(95% 0.03 25)', color: 'oklch(40% 0.12 25)', border: '1px solid oklch(88% 0.06 25)' }}>
          {error}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .doc-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="doc-layout" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {/* Left: docs list / empty state */}
        <div>
          {loading ? (
            <Card>
              <div className="flex flex-col gap-3">
                {[0,1,2].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-xl" style={{ background: 'var(--bg-deep)' }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-2/3 animate-pulse rounded" style={{ background: 'var(--bg-deep)' }} />
                      <div className="h-2.5 w-1/3 animate-pulse rounded" style={{ background: 'var(--bg-deep)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : docs.length === 0 ? (
            <Card style={{ padding: 48, textAlign: 'center', minHeight: 420 }}>
              <div style={{ width: 84, height: 84, borderRadius: 999, background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div className="pcp-display" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>
                Your <em>secure document vault.</em>
              </div>
              <p style={{ marginTop: 12, fontSize: 14.5, color: 'var(--ink-soft)', maxWidth: 420, margin: '12px auto 0' }}>
                Most parents start with a custody agreement and school enrollment form. Once uploaded, documents can't be edited or deleted — ensuring 100% integrity if they're ever needed in court.
              </p>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 380, margin: '20px auto 0', textAlign: 'left' }}>
                {['Custody agreement', 'School enrollment', 'Medical records', 'Court orders'].map(doc => (
                  <div key={doc} style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, fontSize: 12.5, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 6, border: '1px dashed var(--border)' }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
                    {doc}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Btn kind="primary" big icon={Icon.upload(13)} onClick={() => setShowCategoryPicker(v => !v)}>Upload first document</Btn>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              {(Object.entries(grouped) as [DocCategory, Document[]][]).map(([cat, catDocs]) => (
                <div key={cat}>
                  <div className="mb-2.5 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: CAT_COLORS[cat] }} />
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--ink-soft)' }}>
                      {CATEGORIES[cat]}
                    </h2>
                    <span className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>({catDocs.length})</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {catDocs.map(d => (
                      <div key={d.id} className="flex items-center gap-3 rounded-[16px] border p-4 transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                          style={{ background: 'var(--bg)', color: CAT_COLORS[cat] }}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-semibold" style={{ color: 'var(--ink)' }}>{d.name}</div>
                          <div className="mt-0.5 text-[12px]" style={{ color: 'var(--ink-soft)' }}>
                            <span style={{ color: d.uploaderColor, fontWeight: 600 }}>{d.uploaderName}</span>
                            {' · '}{formatBytes(d.fileSize)}{' · '}{fmtDate(d.createdAt)}
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 gap-1.5">
                          <button onClick={() => handleDownload(d.id)} className="pcp-btn-secondary rounded-lg px-3 py-1.5 text-[12px] font-semibold">↓ Download</button>
                          <button onClick={() => handleDelete(d.id)}
                            className="cursor-pointer rounded-lg border-[1.5px] px-3 py-1.5 text-[12px] font-semibold"
                            style={{ background: 'none', borderColor: 'oklch(88% 0.06 25)', color: 'oklch(55% 0.18 25)', fontFamily: 'inherit' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: category list */}
        <Card>
          <div className="pcp-eyebrow" style={{ color: 'var(--clay)' }}>Most-uploaded categories</div>
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            {[
              { n: 'Custody agreements', d: 'Court order, parenting plan, consent decree' },
              { n: 'School records', d: 'Enrollment, IEP, report cards' },
              { n: 'Medical', d: 'Insurance card, vaccination, allergies' },
              { n: 'Identification', d: 'Birth certificate, passport copies' },
              { n: 'Financial', d: 'Child support order, tax filings' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-soft)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.n}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>{c.d}</div>
                </div>
                <span style={{ color: 'var(--ink-mute)', cursor: 'pointer' }} onClick={() => setShowCategoryPicker(v => !v)}>
                  {Icon.plus(12)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
