export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
}

export interface FamilyMember {
  userId: string;
  familyId: string;
  role: 'parent1' | 'parent2';
  color: string;
  joinedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  family: Family | null;
  familyMember: FamilyMember | null;
  tokens: AuthTokens;
}

// API request/response shapes
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateFamilyRequest {
  familyName: string;
}

export interface JoinFamilyRequest {
  inviteCode: string;
}

export interface ApiError {
  error: string;
}

// Calendar
export type EventType = 'custody' | 'pickup' | 'dropoff' | 'appointment' | 'activity' | 'holiday' | 'other';

export interface CalendarEvent {
  id: string;
  familyId: string;
  title: string;
  startDate: string; // ISO date string
  endDate: string;
  allDay: boolean;
  type: EventType;
  createdBy: string; // userId
  color?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  type: EventType;
  color?: string;
  notes?: string;
}

export interface UpdateEventRequest {
  title?: string;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  type?: EventType;
  color?: string;
  notes?: string;
}

// Messaging
export interface Message {
  id: string;
  familyId: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  body: string;
  readAt: string | null;
  aiFlag: 'ok' | 'warning' | 'blocked' | null;
  aiFlagReason: string | null;
  createdAt: string;
}

export interface SendMessageRequest {
  body: string;
}

export interface AiReviewResponse {
  flag: 'ok' | 'warning' | 'blocked';
  reason: string | null;
  suggestion: string | null;
}

// Expenses
export type ExpenseCategory = 'medical' | 'education' | 'childcare' | 'clothing' | 'food' | 'activities' | 'transport' | 'other';

export interface Expense {
  id: string;
  familyId: string;
  submittedBy: string;
  submitterName: string;
  submitterColor: string;
  title: string;
  amount: number; // in cents
  currency: string;
  category: ExpenseCategory;
  receiptUrl: string | null;
  notes: string | null;
  splitPercent: number; // 0–100, what % the OTHER parent owes
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  title: string;
  amount: number; // in cents
  currency?: string;
  category: ExpenseCategory;
  notes?: string;
  splitPercent?: number; // default 50
}

export interface RespondExpenseRequest {
  action: 'approve' | 'reject';
}

// Documents
export type DocCategory = 'legal' | 'medical' | 'school' | 'financial' | 'other';

export interface Document {
  id: string;
  familyId: string;
  uploadedBy: string;
  uploaderName: string;
  uploaderColor: string;
  name: string;
  category: DocCategory;
  s3Key: string;
  fileSize: number;
  mimeType: string;
  version: number;
  notes: string | null;
  createdAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  documentId: string;
  s3Key: string;
}
