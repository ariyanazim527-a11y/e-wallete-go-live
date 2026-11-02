export type DisputeCategory =
  | 'failed_transaction'
  | 'payout_delay'
  | 'float_mismatch'
  | 'customer_dispute'
  | 'technical_issue';

export type DisputeStatus = 'pending' | 'investigating' | 'resolved';

export type DisputePriority = 'normal' | 'high' | 'urgent';

export interface DisputeNote {
  id: string;
  sender: 'agent' | 'admin' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface AgentDisputeTicket {
  id: string;
  ticketNumber: string; // e.g. "DSP-84920"
  agentPhone: string;
  outletName: string;
  agentName: string;
  category: DisputeCategory;
  title: string;
  description: string;
  status: DisputeStatus;
  priority: DisputePriority;
  trxId?: string;
  orderId?: string;
  amount?: number;
  channel?: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'system';
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
  notes: DisputeNote[];
  resolutionSummary?: string;
  creditedFloatAmount?: number;
}

export const DISPUTE_STORAGE_KEY = 'uwallet_agent_disputes_v1';

export const INITIAL_DISPUTES: AgentDisputeTicket[] = [
  {
    id: 'dsp-101',
    ticketNumber: 'DSP-84920',
    agentPhone: '01700-112233',
    outletName: 'Shop #12, Mirpur 10 Circle, Dhaka',
    agentName: 'Mayer Doa Telecom & Enterprise',
    category: 'failed_transaction',
    title: 'বিকাশ ক্যাশ-আউট গ্রাহকের অ্যাকাউন্ট থেকে কাটা হয়েছে কিন্তু এজেন্ট ওয়ালেটে আসেনি',
    description: 'গ্রাহক 01899-876543 দোকান থেকে ৳১০,০০০ ক্যাশ-আউট করেছেন। তার অ্যাকাউন্ট থেকে টাকা কেটে গেছে (TrxID: 9M481028), কিন্তু আমার এজেন্ট টার্মিনাল ফ্লোটে টাকা জমা হয়নি। গ্রাহক দোকানে অপেক্ষা করছেন। অবিলম্বে যাচাই করে ফ্লোট অ্যাডজাস্ট করুন।',
    status: 'investigating',
    priority: 'urgent',
    trxId: '9M481028',
    amount: 10000,
    channel: 'bkash',
    customerPhone: '01899-876543',
    createdAt: '2025-05-18 11:30 AM',
    updatedAt: '2025-05-18 12:15 PM',
    notes: [
      {
        id: 'n-1',
        sender: 'system',
        senderName: 'সেন্ট্রাল টিকিট সিস্টেম',
        text: 'অভিযোগ নথিভুক্ত হয়েছে এবং অগ্রাধিকার ভিত্তিতে ইনভেস্টিগেশন টিমে পাঠানো হয়েছে।',
        timestamp: '11:30 AM',
      },
      {
        id: 'n-2',
        sender: 'admin',
        senderName: 'কেন্দ্রীয় সাপোর্ট অ্যাডমিন (তানভীর)',
        text: 'আমরা বিকাশ নোটিফিকেশন গেটওয়ে লগ ও বাংলাদেশ ব্যাংক সুইফট কানেক্টিভিটি চেক করছি। সাময়িক নেটওয়ার্ক ল্যাগের কারণে সার্ভারে পেন্ডিং আছে। আগামী ২০ মিনিটের মধ্যে ফ্লোট আপডেট হবে।',
        timestamp: '12:15 PM',
      },
    ],
  },
  {
    id: 'dsp-102',
    ticketNumber: 'DSP-84918',
    agentPhone: '01700-112233',
    outletName: 'Shop #12, Mirpur 10 Circle, Dhaka',
    agentName: 'Mayer Doa Telecom & Enterprise',
    category: 'payout_delay',
    title: 'দৈনিক ভলিউম বোনাস ও ইনসেন্টিভ পে-আউট বিলম্ব',
    description: 'গতকালকের ১ লক্ষ টাকার বেশি ডিলার লেনদেনের ১.২০% স্পেশাল ইনসেন্টিভ (৳১,২০০) কমিশন ওয়ালেটে এখনো জমা দেখাচ্ছে না। হিসাব চেক করে সমাধান করার অনুরোধ।',
    status: 'pending',
    priority: 'high',
    amount: 1200,
    channel: 'system',
    createdAt: '2025-05-18 09:45 AM',
    updatedAt: '2025-05-18 09:45 AM',
    notes: [
      {
        id: 'n-3',
        sender: 'system',
        senderName: 'সিস্টেম অটোমেশন',
        text: 'আপনার টিকিট কিউতে আছে (অপেক্ষমাণ নম্বর #২)। একজন অ্যাডমিন খুব শীঘ্রই এটি পর্যালোচনা করবেন।',
        timestamp: '09:45 AM',
      },
    ],
  },
  {
    id: 'dsp-103',
    ticketNumber: 'DSP-84882',
    agentPhone: '01700-112233',
    outletName: 'Shop #12, Mirpur 10 Circle, Dhaka',
    agentName: 'Mayer Doa Telecom & Enterprise',
    category: 'float_mismatch',
    title: 'নগদ সেন্ড মানির মাধ্যমে ৫,০০০ টাকা জামানত জমা সংক্রান্ত রিকনসিলিয়েশন',
    description: 'নগদ থেকে 01739-420736 নম্বরে ৫০০০ টাকা সেন্ড মানি করে ট্রানজেকশন আইডি NG882910 দিয়েছিলাম। অ্যাডমিন থেকে ভেরিফাই করে ফ্লোটে ক্রেডিট করা হয়েছে কিনা কনফার্মেশন প্রয়োজন।',
    status: 'resolved',
    priority: 'normal',
    trxId: 'NG882910',
    amount: 5000,
    channel: 'nagad',
    createdAt: '2025-05-17 02:10 PM',
    updatedAt: '2025-05-17 03:00 PM',
    resolutionSummary: 'অ্যাডমিন অ্যাকাউন্ট্যান্ট দ্বারা নগদ স্টেটমেন্ট ভেরিফাই করা হয়েছে এবং এজেন্ট ফ্লোটে ৫,০০০ টাকা ক্রেডিট নিশ্চিত করা হয়েছে।',
    creditedFloatAmount: 5000,
    notes: [
      {
        id: 'n-4',
        sender: 'admin',
        senderName: 'হেড অফিস অ্যাকাউন্টস ডেস্ক',
        text: 'নগদ ডিপোজিট সফলভাবে ভেরিফাই সম্পন্ন হয়েছে। এজেন্ট ফ্লোট ব্যালেন্সে ৳৫,০০০ যোগ করা হয়েছে।',
        timestamp: '03:00 PM',
      },
    ],
  },
];

export function loadDisputeTickets(): AgentDisputeTicket[] {
  try {
    const raw = localStorage.getItem(DISPUTE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading disputes from localStorage:', e);
  }
  // Initialize with initial records if empty
  try {
    localStorage.setItem(DISPUTE_STORAGE_KEY, JSON.stringify(INITIAL_DISPUTES));
  } catch (e) {
    console.error(e);
  }
  return INITIAL_DISPUTES;
}

export function saveDisputeTickets(tickets: AgentDisputeTicket[]): void {
  try {
    localStorage.setItem(DISPUTE_STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new CustomEvent('uwallet_disputes_updated'));
  } catch (e) {
    console.error('Error saving disputes to localStorage:', e);
  }
}
