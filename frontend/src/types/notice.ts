export type NoticeCategory =
  | 'GENERAL'
  | 'IMPORTANT'
  | 'EVENT'
  | 'URGENT'
  | 'ACADEMIC'
  | 'EXAMINATION'
  | 'MAINTENANCE';

export type NoticePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  priority: NoticePriority;
  published: boolean;
  pinned: boolean;
  createdAt: string;
  publishedAt: string;
  expiresAt?: string;
  createdBy: string;
  attachmentUrl?: string;
  viewsCount?: number;
}
