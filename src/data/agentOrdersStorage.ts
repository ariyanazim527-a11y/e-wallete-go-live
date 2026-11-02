/**
 * Agent Customer Orders Stream & 24-Hour Auto-Purge Management
 * Persists customer orders from Bangladeshi districts (e.g., Bhola, Kodpara, Hader Bill).
 * Automatically purges orders older than 24 hours.
 */

export interface AgentCustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  thana: string;
  district: string;
  location: string;
  phoneMasked: string;
  productName: string;
  productEmoji: string;
  productImageUrl?: string;
  amountBDT: number;
  tokenPaidBDT: number;
  commissionEarnedBDT: number;
  paymentMethodBn: string;
  orderStatus: 'confirmed' | 'processing' | 'delivered';
  smsNoticeBn: string;
  timestampMs: number;
  formattedTime: string;
}

export const AGENT_ORDERS_STORAGE_KEY = 'uwallet_agent_live_orders_v2';
export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const INITIAL_SEED_ORDERS: AgentCustomerOrder[] = [
  {
    id: 'ord-bhola-01',
    orderNumber: 'DZ-BHL-9921',
    customerName: 'সুফিয়ান',
    thana: 'কোদপাড়া',
    district: 'ভোলা',
    location: 'হাদের বিল',
    phoneMasked: '01712-***890',
    productName: 'ভিন্টেজ টি৯ হেয়ার কাটিং মেশিন প্রফেশনাল ট্রিমার',
    productEmoji: '✂️',
    productImageUrl: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=600&q=80',
    amountBDT: 315,
    tokenPaidBDT: 50,
    commissionEarnedBDT: 15,
    paymentMethodBn: 'দারাজ পে / বিকাশ অগ্রিম (ভেরিফাইড)',
    orderStatus: 'confirmed',
    smsNoticeBn: '🔔 [লাইভ এসএমএস] কাস্টমার সুফিয়ান, ভোলা (কোদপাড়া - হাদের বিল) থেকে ৳৩১৫ এর দারাজ ট্রিমার অর্ডার সফল হয়েছে।',
    timestampMs: Date.now() - 3 * 60 * 1000, // 3 mins ago
    formattedTime: '৩ মিনিট আগে',
  },
  {
    id: 'ord-bhola-02',
    orderNumber: 'DZ-BHL-8841',
    customerName: 'মো: তানভীর আহমেদ',
    thana: 'দৌলতখান',
    district: 'ভোলা',
    location: 'বাংলাবাজার ঘাট',
    phoneMasked: '01899-***543',
    productName: 'আড়ং স্টাইল প্রিমিয়াম কটন কাবলি পাঞ্জাবি সেট',
    productEmoji: '👔',
    productImageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    amountBDT: 4850,
    tokenPaidBDT: 500,
    commissionEarnedBDT: 105,
    paymentMethodBn: 'ক্যাশ অন ডেলিভারি (টোকেন পেইড)',
    orderStatus: 'confirmed',
    smsNoticeBn: '🔔 [লাইভ এসএমএস] তানভীর আহমেদ, ভোলা (দৌলতখান) থেকে ৳৪,৮৫০ টাকার কাবলি সেট অর্ডার কনফার্ম করেছেন।',
    timestampMs: Date.now() - 12 * 60 * 1000, // 12 mins ago
    formattedTime: '১২ মিনিট আগে',
  },
  {
    id: 'ord-bhola-03',
    orderNumber: 'DZ-BHL-7732',
    customerName: 'মোছা: মরিয়ম বেগম',
    thana: 'চরফ্যাশন',
    district: 'ভোলা',
    location: 'দক্ষিণ আইচা বাজার',
    phoneMasked: '01739-***712',
    productName: 'অরিজিনাল দুবাই চেরি ফেব্রিক লাক্সারি কটি বোরকা ও হিজাব',
    productEmoji: '🧕',
    amountBDT: 5200,
    tokenPaidBDT: 500,
    commissionEarnedBDT: 115,
    paymentMethodBn: 'বিকাশ ডিপোজিট কনফার্মড',
    orderStatus: 'confirmed',
    smsNoticeBn: '🔔 [লাইভ এসএমএস] মরিয়ম বেগম, ভোলা (চরফ্যাশন) থেকে ৳৫,২০০ এর লাক্সারি বোরকা অর্ডার করেছেন।',
    timestampMs: Date.now() - 28 * 60 * 1000, // 28 mins ago
    formattedTime: '২৮ মিনিট আগে',
  },
  {
    id: 'ord-dhaka-04',
    orderNumber: 'DZ-DHK-4419',
    customerName: 'মো: আরিয়ান আজিম',
    thana: 'মিরপুর',
    district: 'ঢাকা',
    location: 'মিরপুর ১০ সার্কেল',
    phoneMasked: '01739-***736',
    productName: 'ক্যাসিও এডিফিস ক্রোনোগ্রাফ ব্ল্যাক ডায়াল ছেলেদের হাতঘড়ি',
    productEmoji: '⌚',
    productImageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
    amountBDT: 7850,
    tokenPaidBDT: 800,
    commissionEarnedBDT: 195,
    paymentMethodBn: 'অনলাইন পেইড (অফিসিয়াল ওয়ারেন্টি)',
    orderStatus: 'confirmed',
    smsNoticeBn: '🔔 [লাইভ এসএমএস] আরিয়ান আজিম, ঢাকা (মিরপুর ১০) থেকে ৳৭,৮৫০ এর প্রিমিয়াম হাতঘড়ি অর্ডার করেছেন।',
    timestampMs: Date.now() - 45 * 60 * 1000, // 45 mins ago
    formattedTime: '৪৫ মিনিট আগে',
  },
  {
    id: 'ord-ctg-05',
    orderNumber: 'DZ-CTG-3301',
    customerName: 'মো: কামাল হোসেন',
    thana: 'বোরহানউদ্দিন',
    district: 'ভোলা',
    location: 'কুঞ্জেরহাট বাজার',
    phoneMasked: '01911-***455',
    productName: 'নোকিয়া ১০৫ (২০২৪ এডিশন) ডুয়াল সিম বাটন ফোন',
    productEmoji: '📞',
    amountBDT: 2500,
    tokenPaidBDT: 300,
    commissionEarnedBDT: 65,
    paymentMethodBn: 'নগদ ক্যাশ অন ডেলিভারি',
    orderStatus: 'confirmed',
    smsNoticeBn: '🔔 [লাইভ এসএমএস] কামাল হোসেন, ভোলা (বোরহানউদ্দিন) থেকে ৳২,৫০০ এর বাটন ফোন অর্ডার করেছেন।',
    timestampMs: Date.now() - 75 * 60 * 1000, // 1h 15m ago
    formattedTime: '১ ঘণ্টা আগে',
  },
  {
    id: 'ord-syl-06',
    orderNumber: 'DZ-SYL-1109',
    customerName: 'তাসলিমা নাসরিন বৃষ্টি',
    thana: 'দক্ষিণ সুরমা',
    district: 'সিলেট',
    location: 'কদমতলী পয়েন্ট',
    phoneMasked: '01712-***678',
    productName: 'ফসিল জ্যাকলিন রোজ গোল্ড মেশ ব্যান্ড মেয়েদের হাতঘড়ি',
    productEmoji: '✨',
    amountBDT: 12500,
    tokenPaidBDT: 1250,
    commissionEarnedBDT: 280,
    paymentMethodBn: 'ব্যাংক কার্ড পেমেন্ট (১০০% ভেরিফাইড)',
    orderStatus: 'confirmed',
    smsNoticeBn: '🔔 [লাইভ এসএমএস] তাসলিমা নাসরিন, সিলেট থেকে ৳১২,৫০০ এর ফ্যাশন হাতঘড়ি বুকিং করেছেন।',
    timestampMs: Date.now() - 110 * 60 * 1000, // ~2h ago
    formattedTime: '২ ঘণ্টা আগে',
  },
];

/**
 * Loads orders with strict 24-hour expiration filter.
 * Any order older than 24 hours is automatically pruned from localStorage.
 */
export function loadAgentCustomerOrders(): AgentCustomerOrder[] {
  try {
    const raw = localStorage.getItem(AGENT_ORDERS_STORAGE_KEY);
    const now = Date.now();
    if (raw) {
      const list: AgentCustomerOrder[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        // Strict 24-hour retention check
        const activeOrders = list.filter((item) => now - item.timestampMs < TWENTY_FOUR_HOURS_MS);
        if (activeOrders.length !== list.length) {
          localStorage.setItem(AGENT_ORDERS_STORAGE_KEY, JSON.stringify(activeOrders));
        }
        if (activeOrders.length > 0) {
          return activeOrders;
        }
      }
    }
  } catch (e) {
    console.error('Error loading agent customer orders:', e);
  }

  // Seed default orders if empty
  try {
    localStorage.setItem(AGENT_ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_ORDERS));
  } catch (e) {
    console.error(e);
  }
  return INITIAL_SEED_ORDERS;
}

/**
 * Save orders and dispatch update event
 */
export function saveAgentCustomerOrders(orders: AgentCustomerOrder[]): void {
  try {
    const now = Date.now();
    const filtered = orders.filter((o) => now - o.timestampMs < TWENTY_FOUR_HOURS_MS);
    localStorage.setItem(AGENT_ORDERS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('uwallet_agent_orders_updated', { detail: filtered }));
  } catch (e) {
    console.error('Error saving agent customer orders:', e);
  }
}

/**
 * Add a new live order to agent history
 */
export function addAgentCustomerOrder(order: AgentCustomerOrder): AgentCustomerOrder[] {
  const current = loadAgentCustomerOrders();
  const updated = [order, ...current];
  saveAgentCustomerOrders(updated);
  return updated;
}

/**
 * Calculate total order transaction volume and commission in the past 24 hours
 */
export function getAgentDailyOrderStats(): {
  totalOrdersCount: number;
  totalVolumeBDT: number;
  totalCommissionBDT: number;
  oldestOrderAgeMs: number;
} {
  const orders = loadAgentCustomerOrders();
  const totalVolumeBDT = orders.reduce((sum, o) => sum + o.amountBDT, 0);
  const totalCommissionBDT = orders.reduce((sum, o) => sum + o.commissionEarnedBDT, 0);
  const now = Date.now();
  const oldestOrderAgeMs = orders.length > 0 ? Math.max(...orders.map((o) => now - o.timestampMs)) : 0;

  return {
    totalOrdersCount: orders.length,
    totalVolumeBDT,
    totalCommissionBDT,
    oldestOrderAgeMs,
  };
}

const DISTRICT_POOL = [
  { district: 'ভোলা', thana: 'কোদপাড়া', location: 'হাদের বিল', name: 'সুফিয়ান' },
  { district: 'ভোলা', thana: 'দৌলতখান', location: 'বাংলাবাজার', name: 'মোঃ তানভীর' },
  { district: 'ভোলা', thana: 'চরফ্যাশন', location: 'দক্ষিণ আইচা', name: 'মোঃ সোহাগ' },
  { district: 'ভোলা', thana: 'বোরহানউদ্দিন', location: 'কুঞ্জেরহাট', name: 'মোঃ রনি' },
  { district: 'ভোলা', thana: 'লালমোহন', location: 'গজারিয়া', name: 'মোঃ রাসেল' },
  { district: 'পাবনা', thana: 'ঈশ্বরদী', location: 'রূপপুর মোড়', name: 'মো: তানভীর আহমেদ' },
  { district: 'গাজীপুর', thana: 'গাজীপুর সদর', location: 'শিমুলতলী', name: 'নুসরাত জাহান' },
  { district: 'ময়মনসিংহ', thana: 'কোতোয়ালী', location: 'কান্দিপাড়া', name: 'সাবরিনা আক্তার' },
  { district: 'চট্টগ্রাম', thana: 'পটিয়া', location: 'পটিয়া সদর', name: 'শাহরিয়ার কবির' },
  { district: 'সিরাজগঞ্জ', thana: 'উল্লাপাড়া', location: 'ফুলবাড়ী বাজার', name: 'ফারহানা পারভীন' },
  { district: 'কুমিল্লা', thana: 'কোতোয়ালী', location: 'চকবাজার মোড়', name: 'কামরুজ্জামান রনি' },
  { district: 'ঝিনাইদহ', thana: 'কালীগঞ্জ', location: 'কালীগঞ্জ বাজার', name: 'মাহিনুর রহমান' },
  { district: 'বগুড়া', thana: 'শিবগঞ্জ', location: 'মোকামতলা', name: 'কামরুল হাসান' },
];

const PRODUCT_POOL = [
  { name: 'ভিন্টেজ টি৯ হেয়ার কাটিং মেশিন প্রফেশনাল ট্রিমার', emoji: '✂️', price: 315, token: 50, comm: 15 },
  { name: 'আড়ং স্টাইল প্রিমিয়াম কটন কাবলি পাঞ্জাবি সেট', emoji: '👔', price: 4850, token: 500, comm: 105 },
  { name: 'অরিজিনাল দুবাই চেরি ফেব্রিক লাক্সারি বোরকা', emoji: '🧕', price: 5200, token: 500, comm: 115 },
  { name: 'ক্যাসিও এডিফিস ক্রোনোগ্রাফ ব্ল্যাক ডায়াল হাতঘড়ি', emoji: '⌚', price: 7850, token: 800, comm: 195 },
  { name: 'নোকিয়া ১০৫ (২০২৪ এডিশন) ডুয়াল সিম বাটন ফোন', emoji: '📞', price: 2500, token: 300, comm: 65 },
  { name: 'ফসিল জ্যাকলিন রোজ গোল্ড মেশ ব্যান্ড হাতঘড়ি', emoji: '✨', price: 12500, token: 1250, comm: 280 },
  { name: 'স্যামসাং গ্যালাক্সি এ১৫ ৫জি ৬জিবি/১২৮জিবি', emoji: '📱', price: 19500, token: 1950, comm: 585 },
];

/**
 * Generate a new random Bangladeshi customer order for live stream
 */
export function generateRandomCustomerOrder(): AgentCustomerOrder {
  const loc = DISTRICT_POOL[Math.floor(Math.random() * DISTRICT_POOL.length)];
  const prod = PRODUCT_POOL[Math.floor(Math.random() * PRODUCT_POOL.length)];
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const now = Date.now();

  return {
    id: `ord-live-${now}-${randNum}`,
    orderNumber: `DZ-${randNum}`,
    customerName: loc.name,
    thana: loc.thana,
    district: loc.district,
    location: loc.location,
    phoneMasked: `017${Math.floor(10 + Math.random() * 89)}-***${randNum.toString().slice(-3)}`,
    productName: prod.name,
    productEmoji: prod.emoji,
    amountBDT: prod.price,
    tokenPaidBDT: prod.token,
    commissionEarnedBDT: prod.comm,
    paymentMethodBn: 'দারাজ পে / বিকাশ অগ্রিম (ভেরিফাইড)',
    orderStatus: 'confirmed',
    smsNoticeBn: `🔔 [লাইভ এসএমএস] ${loc.name}, ${loc.district} (${loc.thana} - ${loc.location}) থেকে ৳${prod.price.toLocaleString()} টাকার ${prod.name} অর্ডার করেছেন।`,
    timestampMs: now,
    formattedTime: 'এইমাত্র',
  };
}
