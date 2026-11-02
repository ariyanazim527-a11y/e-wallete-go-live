/**
 * Centralized MFS Configuration for uWallet
 * Default Send Money Number: 01739420736 for bKash, Nagad, Rocket
 * Allows live updates from Admin Panel and persists to localStorage.
 */

export interface MfsAccountConfig {
  id: 'bkash' | 'nagad' | 'rocket';
  name: string;
  nameBn: string;
  number: string;
  accountType: 'Personal (Send Money)' | 'Agent (Cash In)' | 'Merchant';
  accountTypeBn: string;
  brandColor: string;
  brandBg: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  active: boolean;
  sampleTrx: string;
}

export interface MfsSystemConfig {
  bkash: MfsAccountConfig;
  nagad: MfsAccountConfig;
  rocket: MfsAccountConfig;
  bankNotice: {
    titleBn: string;
    messageBn: string;
    titleEn: string;
    messageEn: string;
  };
}

export const DEFAULT_MFS_CONFIG: MfsSystemConfig = {
  bkash: {
    id: 'bkash',
    name: 'bKash',
    nameBn: 'বিকাশ',
    number: '01739420736',
    accountType: 'Personal (Send Money)',
    accountTypeBn: 'পার্সোনাল (সেন্ড মানি নম্বর)',
    brandColor: '#E2136E',
    brandBg: 'bg-pink-50',
    borderColor: 'border-[#E2136E]',
    textColor: 'text-[#E2136E]',
    badgeBg: 'bg-[#E2136E] text-white',
    active: true,
    sampleTrx: 'BK994821A',
  },
  nagad: {
    id: 'nagad',
    name: 'Nagad',
    nameBn: 'নগদ',
    number: '01739420736',
    accountType: 'Personal (Send Money)',
    accountTypeBn: 'পার্সোনাল (সেন্ড মানি নম্বর)',
    brandColor: '#F7941D',
    brandBg: 'bg-orange-50',
    borderColor: 'border-[#F7941D]',
    textColor: 'text-[#F7941D]',
    badgeBg: 'bg-[#F7941D] text-white',
    active: true,
    sampleTrx: 'NG771920B',
  },
  rocket: {
    id: 'rocket',
    name: 'Rocket',
    nameBn: 'রকেট',
    number: '01739420736',
    accountType: 'Personal (Send Money)',
    accountTypeBn: 'পার্সোনাল (সেন্ড মানি নম্বর)',
    brandColor: '#8C3494',
    brandBg: 'bg-purple-50',
    borderColor: 'border-[#8C3494]',
    textColor: 'text-[#8C3494]',
    badgeBg: 'bg-[#8C3494] text-white',
    active: true,
    sampleTrx: 'RK551029C',
  },
  bankNotice: {
    titleBn: 'ব্যাংকের দৈনিক লিমিট শেষ!',
    messageBn: 'ব্যাংকের লিমিট শেষ, এই মুহূর্তে ব্যাংক সার্ভার দিয়ে পেমেন্ট করা সম্ভব হচ্ছে না। অনুগ্রহ করে দ্রুত ও নিশ্চিন্তে বিকাশ, নগদ অথবা রকেটে সেন্ড মানি করুন।',
    titleEn: 'Bank Daily Limit Exhausted',
    messageEn: 'Bank daily limit reached. Payment via bank is temporarily unavailable. Please make Send Money using bKash, Nagad or Rocket.',
  },
};

const STORAGE_KEY = 'uwallet_mfs_system_config_v2';

export function loadMfsConfig(): MfsSystemConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_MFS_CONFIG,
        ...parsed,
        bkash: { ...DEFAULT_MFS_CONFIG.bkash, ...parsed.bkash },
        nagad: { ...DEFAULT_MFS_CONFIG.nagad, ...parsed.nagad },
        rocket: { ...DEFAULT_MFS_CONFIG.rocket, ...parsed.rocket },
        bankNotice: { ...DEFAULT_MFS_CONFIG.bankNotice, ...parsed.bankNotice },
      };
    }
  } catch (e) {
    console.error('Failed to parse stored MFS config', e);
  }
  return DEFAULT_MFS_CONFIG;
}

export function saveMfsConfig(config: MfsSystemConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('uwallet_mfs_config_updated', { detail: config }));
  } catch (e) {
    console.error('Failed to save MFS config', e);
  }
}
