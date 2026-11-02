export type TransactionType =
  | 'send_money'
  | 'add_money'
  | 'mobile_recharge'
  | 'merchant_pay'
  | 'bill_pay'
  | 'cash_out';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  titleBn: string;
  recipientOrSource: string;
  amount: number;
  fee: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  category: 'transfer' | 'utility' | 'shopping' | 'deposit' | 'telecom';
  referenceId: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
}

export interface Biller {
  id: string;
  name: string;
  nameBn: string;
  category: 'electricity' | 'gas' | 'water' | 'internet';
  icon: string;
  accountNumberSample: string;
}

export interface MobileOperator {
  id: string;
  name: string;
  color: string;
  prefix: string[];
}
