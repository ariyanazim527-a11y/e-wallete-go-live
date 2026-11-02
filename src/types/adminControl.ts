import { ManagedUser } from './admin.ts';
import { INITIAL_MANAGED_USERS } from '../data/adminMockData.ts';

export type AdminActionType = 'deposit' | 'bonus' | 'deduct' | 'lock' | 'unlock';

export interface AdminAuditLog {
  id: string;
  actionType: AdminActionType;
  targetUserId: string;
  targetUserName: string;
  targetUserPhone: string;
  amount?: number;
  bonusCategory?: 'volume_incentive' | 'welcome_bonus' | 'festival_bonus' | 'special_reward';
  depositChannel?: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash_office';
  reason: string;
  adminEmail: string;
  timestamp: string;
}

export const MANAGED_USERS_STORAGE_KEY = 'uwallet_managed_users_v2';
export const ADMIN_AUDIT_LOGS_STORAGE_KEY = 'uwallet_admin_audit_logs_v1';

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-1',
    actionType: 'bonus',
    targetUserId: 'usr-1',
    targetUserName: 'Ariyan Azim',
    targetUserPhone: '01712-345678',
    amount: 1500,
    bonusCategory: 'volume_incentive',
    reason: '১ লক্ষ টাকার অধিক সাপ্তাহিক লেনদেন ইনসেন্টিভ বোনাস',
    adminEmail: 'ariyanazim527@gmail.com',
    timestamp: 'Today, 10:15 AM',
  },
  {
    id: 'log-2',
    actionType: 'deposit',
    targetUserId: 'usr-3',
    targetUserName: 'Tanvir Ahmed',
    targetUserPhone: '01711-223344',
    amount: 10000,
    depositChannel: 'bkash',
    reason: 'ব্যাংক ভেরিফাইড ফ্লোট রিচার্জ ও ম্যানুয়াল ডিপোজিট',
    adminEmail: 'ariyanazim527@gmail.com',
    timestamp: 'Today, 09:30 AM',
  },
  {
    id: 'log-3',
    actionType: 'lock',
    targetUserId: 'usr-5',
    targetUserName: 'Suspicious Account #89',
    targetUserPhone: '01600-998877',
    reason: 'হারানো সিম ও বারবার ভুল পিন প্রবেশ - নিরাপত্তা লক',
    adminEmail: 'ariyanazim527@gmail.com',
    timestamp: 'Yesterday, 04:45 PM',
  },
];

export function loadManagedUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(MANAGED_USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading managed users:', e);
  }

  // Default seed
  try {
    localStorage.setItem(MANAGED_USERS_STORAGE_KEY, JSON.stringify(INITIAL_MANAGED_USERS));
  } catch (e) {
    console.error(e);
  }
  return INITIAL_MANAGED_USERS;
}

export function saveManagedUsers(users: ManagedUser[]): void {
  try {
    localStorage.setItem(MANAGED_USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('uwallet_managed_users_updated'));
  } catch (e) {
    console.error('Error saving managed users:', e);
  }
}

export function loadAuditLogs(): AdminAuditLog[] {
  try {
    const raw = localStorage.getItem(ADMIN_AUDIT_LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading audit logs:', e);
  }

  try {
    localStorage.setItem(ADMIN_AUDIT_LOGS_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
  } catch (e) {
    console.error(e);
  }
  return INITIAL_AUDIT_LOGS;
}

export function saveAuditLogs(logs: AdminAuditLog[]): void {
  try {
    localStorage.setItem(ADMIN_AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('uwallet_audit_logs_updated'));
  } catch (e) {
    console.error('Error saving audit logs:', e);
  }
}
