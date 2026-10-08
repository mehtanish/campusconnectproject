import { Notice } from '@/types/notice';

const NOTICES_STORAGE_KEY = 'campus_connect_notices_v1';

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice-1',
    title: 'End Semester Examination Schedule',
    description:
      'The final examination timetable for Semester II (AY 2025-26) has been officially released by the Controller of Examinations. All undergraduate and postgraduate students must check their department portals for detailed seat number allocations, hall tickets, and classroom assignments.',
    category: 'EXAMINATION',
    priority: 'HIGH',
    published: true,
    pinned: true,
    createdAt: '2026-09-28T10:00:00.000Z',
    publishedAt: '2026-10-01T08:30:00.000Z',
    createdBy: 'SUPER ADMIN',
    attachmentUrl: '/docs/exam-schedule-2026.pdf',
    viewsCount: 1420,
  },
  {
    id: 'notice-2',
    title: 'PICT Technical Symposium 2026',
    description:
      'Registrations are officially open for Impetus & Concepts 2026! National-level project competition and flagship tech fest featuring AI hackathons, autonomous robotics, web3 security challenges, and guest keynotes from global tech leaders.',
    category: 'EVENT',
    priority: 'NORMAL',
    published: true,
    pinned: false,
    createdAt: '2026-09-29T14:15:00.000Z',
    publishedAt: '2026-09-30T09:00:00.000Z',
    createdBy: 'SUPER ADMIN',
    attachmentUrl: '/docs/inc-2026-brochure.pdf',
    viewsCount: 890,
  },
  {
    id: 'notice-3',
    title: 'Campus Maintenance & Network Power Cut',
    description:
      'Scheduled electrical & high-speed optic fiber maintenance in Academic Block B & Central Library on October 4th (09:00 AM to 02:00 PM). Primary server nodes will automatically failover to generator power.',
    category: 'MAINTENANCE',
    priority: 'NORMAL',
    published: true,
    pinned: false,
    createdAt: '2026-09-30T16:00:00.000Z',
    publishedAt: '2026-10-01T06:00:00.000Z',
    createdBy: 'SUPER ADMIN',
    viewsCount: 640,
  },
  {
    id: 'notice-4',
    title: 'Library 24/7 Extended Hours & Quiet Zones',
    description:
      'In view of the upcoming mid & end semester examinations, the Central Digital Library will remain open 24 hours a day, 7 days a week starting tonight. AC Study Rooms 3 & 4 are reserved for quiet group study.',
    category: 'URGENT',
    priority: 'CRITICAL',
    published: true,
    pinned: true,
    createdAt: '2026-09-30T18:30:00.000Z',
    publishedAt: '2026-10-01T07:15:00.000Z',
    createdBy: 'SUPER ADMIN',
    viewsCount: 2150,
  },
  {
    id: 'notice-5',
    title: 'Wi-Fi 6 Mesh Network Upgrade Completed',
    description:
      'Hostel Blocks 1-4 and the Main Auditorium have been upgraded with high-density Wi-Fi 6 access points. Authenticate using your college PRN credentials to access speeds up to 1Gbps.',
    category: 'GENERAL',
    priority: 'LOW',
    published: true,
    pinned: false,
    createdAt: '2026-09-25T11:00:00.000Z',
    publishedAt: '2026-09-26T10:00:00.000Z',
    createdBy: 'SUPER ADMIN',
    viewsCount: 1100,
  },
];

function notifyNoticeUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('campus-notices-updated'));
  }
}

export function getAllNotices(): Notice[] {
  if (typeof window === 'undefined') return INITIAL_NOTICES;
  try {
    const raw = localStorage.getItem(NOTICES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(INITIAL_NOTICES));
      return INITIAL_NOTICES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored notices:', err);
    return INITIAL_NOTICES;
  }
}

export function getPublishedNotices(): Notice[] {
  const all = getAllNotices();
  return all
    .filter((n) => n.published)
    .sort((a, b) => {
      // Pinned notices first
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      // Then by publishedAt date descending
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
}

export function saveNotice(noticeData: Omit<Notice, 'id' | 'createdAt' | 'publishedAt'> & { id?: string }): Notice {
  const all = getAllNotices();
  const now = new Date().toISOString();

  let updatedNotice: Notice;

  if (noticeData.id) {
    const index = all.findIndex((n) => n.id === noticeData.id);
    if (index !== -1) {
      updatedNotice = {
        ...all[index],
        ...noticeData,
      };
      all[index] = updatedNotice;
    } else {
      updatedNotice = {
        ...noticeData,
        id: `notice-${Date.now()}`,
        createdAt: now,
        publishedAt: now,
      } as Notice;
      all.unshift(updatedNotice);
    }
  } else {
    updatedNotice = {
      ...noticeData,
      id: `notice-${Date.now()}`,
      createdAt: now,
      publishedAt: now,
      viewsCount: 0,
    } as Notice;
    all.unshift(updatedNotice);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(all));
    notifyNoticeUpdate();
  }

  return updatedNotice;
}

export function deleteNotice(id: string): void {
  const all = getAllNotices();
  const filtered = all.filter((n) => n.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(filtered));
    notifyNoticeUpdate();
  }
}

export function toggleNoticePublished(id: string): void {
  const all = getAllNotices();
  const notice = all.find((n) => n.id === id);
  if (notice) {
    notice.published = !notice.published;
    if (notice.published && !notice.publishedAt) {
      notice.publishedAt = new Date().toISOString();
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(all));
      notifyNoticeUpdate();
    }
  }
}

export function toggleNoticePinned(id: string): void {
  const all = getAllNotices();
  const notice = all.find((n) => n.id === id);
  if (notice) {
    notice.pinned = !notice.pinned;
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(all));
      notifyNoticeUpdate();
    }
  }
}
