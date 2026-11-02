export interface AgentKycRecord {
  id: string;
  agencyName: string;
  ownerName: string;
  phone: string;
  email?: string;
  nidNumber: string;
  nidFrontPhoto: string; // Base64 or sample photo URL
  nidBackPhoto: string;  // Base64 or sample photo URL
  tradeLicenseNo: string;
  division: string;
  district: string;
  outletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  securityDepositPaid: boolean;
  securityDepositAmount: number;
  depositTrxId?: string;
  depositProvider?: 'bkash' | 'nagad' | 'rocket' | 'bank';
  depositVerified: boolean;
  depositSenderPhone?: string;
  requestedDailyLimit?: number;
}

const AGENT_KYC_STORAGE_KEY = 'uwallet_agent_kyc_applications_v2';

export const SAMPLE_NID_FRONT = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80';
export const SAMPLE_NID_BACK = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';

export const INITIAL_AGENT_APPLICATIONS: AgentKycRecord[] = [
  {
    id: 'agt-app-101',
    agencyName: 'Mayer Doa Telecom & Enterprise',
    ownerName: 'Ariyan Azim',
    phone: '01700-112233',
    email: 'ariyanazim527@gmail.com',
    nidNumber: '1995267182910',
    nidFrontPhoto: SAMPLE_NID_FRONT,
    nidBackPhoto: SAMPLE_NID_BACK,
    tradeLicenseNo: 'TRAD/DSCC/029182/2024',
    division: 'Dhaka',
    district: 'Dhaka North',
    outletAddress: 'Shop #12, Mirpur 10 Circle, Dhaka',
    status: 'pending',
    submittedAt: 'Today, 11:20 AM',
    securityDepositPaid: true,
    securityDepositAmount: 5000,
    depositTrxId: 'BK994821A',
    depositProvider: 'bkash',
    depositVerified: true,
  },
  {
    id: 'agt-app-102',
    agencyName: 'Chittagong Port Logistics & Marine Dealership',
    ownerName: 'Mohammad Faruk Hossain',
    phone: '01819-334455',
    email: 'ctg.faruk@gmail.com',
    nidNumber: '1987152910293',
    nidFrontPhoto: SAMPLE_NID_FRONT,
    nidBackPhoto: SAMPLE_NID_BACK,
    tradeLicenseNo: 'TRAD/CCCC/883920/2023',
    division: 'Chittagong',
    district: 'Chittagong',
    outletAddress: 'Agrabad Commercial Area, Near Port Gate #4, Chittagong',
    status: 'approved',
    submittedAt: '2 days ago',
    reviewedAt: 'Yesterday, 4:00 PM',
    securityDepositPaid: true,
    securityDepositAmount: 25000,
    depositTrxId: 'NG771920B',
    depositProvider: 'nagad',
    depositVerified: true,
  },
  {
    id: 'agt-app-103',
    agencyName: 'Uttara Auto Fleet & Rentals Agency',
    ownerName: 'Sultan Mahmud',
    phone: '01711-889900',
    nidNumber: '1990261928374',
    nidFrontPhoto: SAMPLE_NID_FRONT,
    nidBackPhoto: SAMPLE_NID_BACK,
    tradeLicenseNo: 'TRAD/DNCC/192837/2024',
    division: 'Dhaka',
    district: 'Dhaka',
    outletAddress: 'Sector 7, Road 12, Uttara, Dhaka',
    status: 'pending',
    submittedAt: 'Today, 2:10 PM',
    securityDepositPaid: true,
    securityDepositAmount: 5000,
    depositTrxId: 'RK551029C',
    depositProvider: 'rocket',
    depositVerified: false,
  },
];

export function loadAgentApplications(): AgentKycRecord[] {
  try {
    const raw = localStorage.getItem(AGENT_KYC_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse agent applications', e);
  }
  return INITIAL_AGENT_APPLICATIONS;
}

export function saveAgentApplications(apps: AgentKycRecord[]): void {
  try {
    localStorage.setItem(AGENT_KYC_STORAGE_KEY, JSON.stringify(apps));
    window.dispatchEvent(new CustomEvent('uwallet_agent_applications_updated', { detail: apps }));
  } catch (e) {
    console.error('Failed to save agent applications', e);
  }
}
