export interface AgentProfile {
  id: string;
  agentName: string;
  ownerName?: string;
  agentPhone: string;
  outletName: string;
  outletLocation: string;
  floatBalance: number;
  securityDeposit: number;
  bonusBalance?: number;
  dailyLimit?: number; // e.g. 50,000 BDT
  usedLimitToday?: number;
  commissionEarnedToday: number;
  totalCommissionBalance: number;
  status: 'active' | 'suspended' | 'pending_approval' | 'pending_deposit';
  activatedAt?: string;
  nidNumber?: string;
  nidFrontPhoto?: string;
  nidBackPhoto?: string;
  pin?: string;
  depositSubmitted?: boolean;
  depositAmount?: number;
  depositTrxId?: string;
  depositProvider?: 'bkash' | 'nagad' | 'rocket' | 'bank';
  depositSenderPhone?: string;
}

export interface CommissionEntry {
  id: string;
  transactionRef: string;
  type: 'cash_in' | 'cash_out';
  customerPhone: string;
  amount: number;
  commissionRate: number; // e.g. 0.45%
  commissionAmount: number;
  timestamp: string;
}

export interface MerchantProfile {
  id: string;
  storeName: string;
  businessType: string;
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  collectedBalance: number;
  pendingPayout: number;
  status: 'live' | 'sandbox';
}

export interface GatewayCheckoutSession {
  orderId: string;
  amount: number;
  customerPhone: string;
  storeName: string;
  status: 'created' | 'completed' | 'failed';
}
