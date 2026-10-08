// ======================
// CampusPulse TypeScript Types
// ======================

// ---- Enums ----
export type Role =
  | 'STUDENT'
  | 'ADMIN_WIFI'
  | 'ADMIN_MAINTENANCE'
  | 'ADMIN_MESS'
  | 'ADMIN_ACADEMIC'
  | 'SUPER_ADMIN';

export type ComplaintStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export type ItemStatus = 'LISTED' | 'CLAIM_PENDING' | 'RETURNED';

export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ---- Auth ----
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  rollNo: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  rollNo: string;
  role: Role;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  rollNo: string;
  role: Role;
}

// ---- Categories ----
export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  adminRole: string;
  hasChildren: boolean;
  children?: Category[];
}

// ---- Issue Types (controlled vocabulary for deduplication) ----
export interface IssueType {
  /** Stable key stored in Complaint.issueTag — never changes */
  stableKey: string;
  /** Human-readable label shown in the UI */
  displayLabel: string;
  /** Domain group (e.g. "wifi", "washroom", "mess") */
  groupKey: string;
}

// ---- Complaints ----
export interface ComplaintRequest {
  title: string;
  description: string;
  categoryId: string;
  locationPath: string;
  issueTag?: string;
}

export interface ComplaintResponse {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  locationPath: string;
  /** Stable key from the controlled vocabulary */
  issueTag: string;
  /** Human-readable label for the issueTag */
  issueTagLabel: string;
  studentId: string;
  studentName: string;
  status: ComplaintStatus;
  adminNote: string | null;
  upvoteCount: number;
  priorityScore: number;
  /** Derived: upvoteCount >= 15 — computed on the server, never stored */
  highPriority: boolean;
  hasUpvoted: boolean;
  upvotedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateCheckRequest {
  locationPath: string;
  issueTag: string;
}

export interface DuplicateCheckResponse {
  isDuplicate: boolean;
  existingComplaint?: ComplaintResponse;
}

export interface StatusUpdateRequest {
  status: ComplaintStatus;
  adminNote?: string;
}

export interface UpvoteResponse {
  success: boolean;
  message: string;
  upvoteCount: number;
  priorityScore: number;
  /** True when upvoteCount >= 15 */
  highPriority: boolean;
  hasUpvoted: boolean;
}

// ---- Lost & Found ----
export interface LostFoundResponse {
  id: string;
  title: string;
  category: string;
  foundLocation: string;
  foundDate: string;
  imageUrl: string | null;
  status: ItemStatus;
  finderName: string;
  finderId: string;
  hiddenDetails: string | null;
  createdAt: string;
}

export interface ClaimRequest {
  itemId: string;
  proofDescription: string;
}

export interface ClaimResponse {
  id: string;
  itemId: string;
  itemTitle: string;
  claimantId: string;
  claimantName: string;
  claimantRollNo: string;
  proofDescription: string;
  status: ClaimStatus;
  claimCode: string | null;
  createdAt: string;
}

// ---- Admin Stats ----
export interface AdminStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  totalLostFound: number;
}

// ---- Status Config ----
export const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  PENDING: { label: 'Pending', color: 'text-slate-400', bgColor: 'bg-slate-500/10', dotColor: 'bg-slate-400' },
  APPROVED: { label: 'Approved', color: 'text-blue-400', bgColor: 'bg-blue-500/10', dotColor: 'bg-blue-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-400', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-400' },
  RESOLVED: { label: 'Resolved', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', dotColor: 'bg-emerald-400' },
  REJECTED: { label: 'Rejected', color: 'text-rose-400', bgColor: 'bg-rose-500/10', dotColor: 'bg-rose-400' },
};

export const ITEM_STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; bgColor: string }> = {
  LISTED: { label: 'Listed', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  CLAIM_PENDING: { label: 'Claim Pending', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  RETURNED: { label: 'Returned', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
};
