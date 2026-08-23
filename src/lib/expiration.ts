/**
 * Utility functions for calculating post expiration & auto-hide dates (30 days default)
 * IMPORTANT: Expiration count & days remaining are STRICTLY for Admin dashboard and the Post Owner's private dashboard.
 * Public users will only see active (non-expired) posts and never see private countdown clocks.
 */

export interface ExpiryInfo {
  isExpired: boolean;
  daysRemaining: number;
  daysPassed: number;
  expiresAtFormatted: string;
  postDateFormatted: string;
  archiveDaysLeft: number;
  statusBadge: 'active' | 'expiring_soon' | 'expired';
}

export function calculateExpiryInfo(
  item: {
    createdAt?: string;
    pushedAt?: string;
    expiresAt?: string;
    durationDays?: number;
  },
  defaultDurationDays = 30
): ExpiryInfo {
  const duration = item.durationDays || defaultDurationDays;
  const now = new Date();
  
  let baseDate: Date;
  if (item.pushedAt) {
    baseDate = new Date(item.pushedAt);
  } else if (item.createdAt) {
    baseDate = new Date(item.createdAt);
  } else {
    baseDate = new Date();
  }

  if (isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }

  let expiryDate: Date;
  if (item.expiresAt) {
    expiryDate = new Date(item.expiresAt);
    if (isNaN(expiryDate.getTime())) {
      expiryDate = new Date(baseDate.getTime() + duration * 24 * 60 * 60 * 1000);
    }
  } else {
    expiryDate = new Date(baseDate.getTime() + duration * 24 * 60 * 60 * 1000);
  }

  const diffMs = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const isExpired = now.getTime() > expiryDate.getTime();
  const daysPassed = Math.max(0, Math.floor((now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)));
  const archiveDaysLeft = Math.max(0, (duration + 30) - daysPassed);

  const postDateFormatted = `${String(baseDate.getDate()).padStart(2, '0')}/${String(baseDate.getMonth() + 1).padStart(2, '0')}/${baseDate.getFullYear()}`;
  const expiresAtFormatted = `${String(expiryDate.getDate()).padStart(2, '0')}/${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${expiryDate.getFullYear()}`;

  let statusBadge: 'active' | 'expiring_soon' | 'expired' = 'active';
  if (isExpired) {
    statusBadge = 'expired';
  } else if (daysRemaining <= 5) {
    statusBadge = 'expiring_soon';
  }

  return {
    isExpired,
    daysRemaining,
    daysPassed,
    expiresAtFormatted,
    postDateFormatted,
    archiveDaysLeft,
    statusBadge
  };
}
