import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues ?? (result.error as { errors?: { message: string }[] }).errors;
      res.status(400).json({
        error: issues?.[0]?.message ?? 'Invalid request',
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const expenseSchema = z.object({
  title: z.string().min(1).max(500),
  amount: z.number().positive('Amount must be positive').max(1_000_000),
  currency: z.string().length(3).optional(),
  category: z.string().optional(),
  notes: z.string().max(1000).optional(),
  splitPercent: z.number().min(0).max(100).default(50),
  receiptUrl: z.string().url().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(1).max(200),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  eventType: z.enum(['pickup', 'dropoff', 'medical', 'school', 'holiday', 'activity', 'other']).default('other'),
  notes: z.string().max(1000).optional(),
});

export const messageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(5000),
  conversationId: z.string().uuid().optional(),
});
