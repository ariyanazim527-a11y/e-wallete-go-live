export interface ManagedUser {
  id: string;
  name: string;
  phone: string;
  nidNumber: string;
  balance: number;
  status: 'active' | 'frozen' | 'pending_kyc';
  registeredDate: string;
  kycDocType: 'NID' | 'Passport' | 'Birth Certificate';
  totalTransactions: number;
}

export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  docType: string;
  docNumber: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SystemFeeConfig {
  sendMoneyFee: number;
  cashOutFeePercentage: number;
  merchantPayFeePercentage: number;
  dailyTransactionLimit: number;
  maintenanceMode: boolean;
}
