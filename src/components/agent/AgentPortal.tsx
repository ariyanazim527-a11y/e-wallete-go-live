import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Building,
  CheckCircle2,
  AlertCircle,
  Search,
  Wallet,
  Coins,
  Lock,
  Unlock,
  AlertTriangle,
  Receipt,
  FileText,
  RotateCcw,
  BarChart3,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Send,
  Info,
  Ship,
  Car,
  HardHat,
  Camera,
  Upload,
  UserCheck,
  Building2,
  ArrowRight,
  HelpCircle,
  Eye,
  LogOut,
  Sparkles,
  Flame,
  Calculator,
  LifeBuoy,
  Download,
  MapPin,
  Clock,
  Bell,
  PackageCheck,
  ShoppingBag,
} from 'lucide-react';
import { AgentProfile, CommissionEntry } from '../../types/agentMerchant.ts';
import { AgentPerformance } from './AgentPerformance.tsx';
import { DailyEarningsDashboard } from './DailyEarningsDashboard.tsx';
import { DailyEarningEstimator } from './DailyEarningEstimator.tsx';
import { AgentKycStatusDashboard } from './AgentKycStatusDashboard.tsx';
import { AgentDisputeSupport } from './AgentDisputeSupport.tsx';
import { AppDownloadCenterModal } from '../common/AppDownloadCenterModal.tsx';
import { HeaderDownloadAppButton } from '../common/HeaderDownloadAppButton.tsx';
import { loadMfsConfig, MfsSystemConfig } from '../../data/mfsConfig.ts';
import { loadCatalog, HighValueProduct } from '../../data/highValueProducts.ts';
import {
  loadAgentsList,
  updateAgentFloat,
  registerOrUpdateAgent,
} from '../../data/agentStorage.ts';
import {
  AgentCustomerOrder,
  loadAgentCustomerOrders,
  saveAgentCustomerOrders,
  addAgentCustomerOrder,
  generateRandomCustomerOrder,
  getAgentDailyOrderStats,
} from '../../data/agentOrdersStorage.ts';
import {
  AgentKycRecord,
  loadAgentApplications,
  saveAgentApplications,
  SAMPLE_NID_FRONT,
  SAMPLE_NID_BACK,
} from '../../types/agentKyc.ts';
import {
  NidUploadPreview,
  SMART_NID_FRONT_SVG,
  SMART_NID_BACK_SVG,
} from './NidUploadPreview.tsx';
import {
  DEPOSIT_RATIO_RULES,
  DEPOSIT_PILLARS,
  AGENT_CUSTOMER_EXPLAINER_SCRIPT,
  AGENT_SECURITY_DEPOSIT_TIERS,
  AgentSecurityDepositTier,
  DARAZ_OFFICIAL_WORK_GUIDELINES,
} from '../../data/depositPolicy.ts';
import { CustomerDepositPolicyModal } from '../shop/CustomerDepositPolicyModal.tsx';
import { AgentWorkPolicyModal } from './AgentWorkPolicyModal.tsx';
import { LiveCustomerOrderToast } from '../common/LiveCustomerOrderToast.tsx';

interface AgentPortalProps {
  language: 'bn' | 'en';
  onExitPortal?: () => void;
  isStandalone?: boolean;
}

const AGENT_SESSION_STORAGE_KEY = 'uwallet_active_agent_session_v2';

const DEFAULT_INITIAL_AGENT: AgentProfile = {
  id: 'agt-882',
  agentName: 'আজিম টেলিকম & মেগা ডিলারশিপ',
  ownerName: 'মো: আরিয়ান আজিম',
  agentPhone: '01739-420736',
  outletName: 'দোকান নং ১২, মিরপুর ১০ সার্কেল, ঢাকা',
  outletLocation: 'ঢাকা উত্তর',
  floatBalance: 50000,
  securityDeposit: 10000,
  bonusBalance: 2000,
  dailyLimit: 50000,
  usedLimitToday: 14250,
  commissionEarnedToday: 2150,
  totalCommissionBalance: 16800,
  status: 'active',
  activatedAt: '2025-01-10',
  nidNumber: '1995267182910',
};

const INITIAL_COMMISSIONS: CommissionEntry[] = [
  {
    id: 'comm-1',
    transactionRef: 'CO-99281',
    type: 'cash_out',
    customerPhone: '01899-876543',
    amount: 5000,
    commissionRate: 0.45,
    commissionAmount: 22.5,
    timestamp: 'Today, 3:15 PM',
  },
  {
    id: 'comm-2',
    transactionRef: 'CI-88271',
    type: 'cash_in',
    customerPhone: '01712-345678',
    amount: 10000,
    commissionRate: 0.25,
    commissionAmount: 25.0,
    timestamp: 'Today, 1:40 PM',
  },
  {
    id: 'comm-3',
    transactionRef: 'DL-77291',
    type: 'cash_in',
    customerPhone: '01739-420736',
    amount: 198000,
    commissionRate: 2.5,
    commissionAmount: 4950.0,
    timestamp: 'Yesterday, 5:20 PM',
  },
];

export const AgentPortal: React.FC<AgentPortalProps> = ({
  language,
  onExitPortal,
  isStandalone = true,
}) => {
  // Session / Registration State
  const [isRegisteredAndVerified, setIsRegisteredAndVerified] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AGENT_SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.isVerified === true;
      }
    } catch (e) {
      console.error(e);
    }
    return false; // Show sign up gate initially as requested
  });

  const [authMode, setAuthMode] = useState<'signup' | 'deposit_payment' | 'login' | 'verifying' | 'pending_notice'>('signup');

  // Mandatory Security Deposit Payment State (10% Ratio Policy e.g. 50k limit -> 5k deposit)
  const [selectedDepositTierId, setSelectedDepositTierId] = useState<string>('tier_gold');
  const [depositSenderPhone, setDepositSenderPhone] = useState<string>('');
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [depositPaymentTrxId, setDepositPaymentTrxId] = useState<string>('');
  const [depositSubmitError, setDepositSubmitError] = useState<string | null>(null);
  const [depositSubmitting, setDepositSubmitting] = useState<boolean>(false);

  // Sign Up Form State - Empty initial values so user directly types without erasing!
  const [signupFullName, setSignupFullName] = useState<string>('');
  const [signupPhone, setSignupPhone] = useState<string>('');
  const [signupAgencyName, setSignupAgencyName] = useState<string>('');
  const [signupNidNumber, setSignupNidNumber] = useState<string>('');
  const [signupOutletAddress, setSignupOutletAddress] = useState<string>('');
  const [signupPin, setSignupPin] = useState<string>('');
  const [signupNidFront, setSignupNidFront] = useState<string>(SMART_NID_FRONT_SVG);
  const [signupNidBack, setSignupNidBack] = useState<string>(SMART_NID_BACK_SVG);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Quick Login State - Empty initial values
  const [loginPhone, setLoginPhone] = useState<string>('');
  const [loginPin, setLoginPin] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Live Customer Orders Stream State (24-hour cycle)
  const [customerOrders, setCustomerOrders] = useState<AgentCustomerOrder[]>(() => loadAgentCustomerOrders());
  const [liveOrderSmsToast, setLiveOrderSmsToast] = useState<string | null>(null);

  // Active Verified Agent Profile
  const [agent, setAgent] = useState<AgentProfile>(() => {
    try {
      const saved = localStorage.getItem(AGENT_SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.agent) return parsed.agent;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_INITIAL_AGENT;
  });

  // Current NID info for modal view
  const [activeAgentNid, setActiveAgentNid] = useState<{ front: string; back: string; nidNo: string }>({
    front: SMART_NID_FRONT_SVG,
    back: SMART_NID_BACK_SVG,
    nidNo: '1995267182910',
  });

  // Agent Portal Tabs
  const [activeTab, setActiveTab] = useState<'terminal' | 'customer_orders' | 'daily_earnings' | 'estimator' | 'dealership' | 'deposit_guide' | 'kyc' | 'disputes' | 'performance'>('terminal');
  const [commissions, setCommissions] = useState<CommissionEntry[]>(INITIAL_COMMISSIONS);
  const [mfsConfig, setMfsConfig] = useState<MfsSystemConfig>(loadMfsConfig());
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Modals
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [isNidInspectModalOpen, setIsNidInspectModalOpen] = useState<boolean>(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [isWorkPolicyModalOpen, setIsWorkPolicyModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  // Float Top Up / Security Deposit Modal State
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [selectedProvider, setSelectedProvider] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [trxId, setTrxId] = useState<string>('');
  const [trxError, setTrxError] = useState<string | null>(null);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  // SIM Transaction Modal
  const [simModalType, setSimModalType] = useState<'cash_in' | 'cash_out' | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [simAmount, setSimAmount] = useState<string>('');
  const [agentPin, setAgentPin] = useState<string>('');
  const [simSuccess, setSimSuccess] = useState<string | null>(null);

  // Dealership Booking Modal State
  const [bookingProduct, setBookingProduct] = useState<HighValueProduct | null>(null);
  const [bookingClientName, setBookingClientName] = useState<string>('');
  const [bookingClientPhone, setBookingClientPhone] = useState<string>('');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Dealership Catalog Search & Live Catalog
  const [catalogItems, setCatalogItems] = useState<HighValueProduct[]>(() => loadCatalog());
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');

  // Listen to catalog updates from Admin
  useEffect(() => {
    const handleCatalogUpdate = () => {
      setCatalogItems(loadCatalog());
    };
    window.addEventListener('uwallet_catalog_updated', handleCatalogUpdate);
    return () => window.removeEventListener('uwallet_catalog_updated', handleCatalogUpdate);
  }, []);

  // Listen to Agent balance and status updates from Admin in real-time
  useEffect(() => {
    const handleAgentUpdate = () => {
      const list = loadAgentsList();
      const cleanPhone = (agent.agentPhone || '').replace(/\D/g, '');
      const me = list.find(
        (a) =>
          a.id === agent.id ||
          (cleanPhone && a.agentPhone.replace(/\D/g, '') === cleanPhone)
      );
      if (me) {
        setAgent(me);
      }
    };
    window.addEventListener('uwallet_agents_updated', handleAgentUpdate);
    window.addEventListener('uwallet_agent_balance_updated', handleAgentUpdate);
    return () => {
      window.removeEventListener('uwallet_agents_updated', handleAgentUpdate);
      window.removeEventListener('uwallet_agent_balance_updated', handleAgentUpdate);
    };
  }, [agent.agentPhone, agent.id]);

  // MFS Config Live Listener
  useEffect(() => {
    const handleUpdate = () => {
      setMfsConfig(loadMfsConfig());
    };
    window.addEventListener('uwallet_mfs_config_updated', handleUpdate);
    return () => window.removeEventListener('uwallet_mfs_config_updated', handleUpdate);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const currentSendMoneyNumber =
    selectedProvider === 'bkash'
      ? mfsConfig.bkash.number
      : selectedProvider === 'nagad'
      ? mfsConfig.nagad.number
      : mfsConfig.rocket.number;

  // Handle Photo Upload Simulation via File Input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (side === 'front') {
            setSignupNidFront(reader.result);
          } else {
            setSignupNidBack(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sign Up Form Submission -> Pushed to Admin for Approval with 0 Balance
  const handleInitiateSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupFullName.trim()) {
      setSignupError(language === 'bn' ? 'অনুগ্রহ করে এজেন্টের পুরো নাম লিখুন।' : 'Please enter full name.');
      return;
    }
    if (!signupPhone.trim() || signupPhone.trim().length < 11) {
      setSignupError(language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01739420736)।' : 'Please enter a valid 11-digit phone number.');
      return;
    }
    if (!signupNidNumber.trim() || signupNidNumber.trim().length < 10) {
      setSignupError(language === 'bn' ? 'সঠিক ১০ বা ১৭ ডিজিটের জাতীয় পরিচয়পত্র (NID) নম্বর দিন।' : 'Please enter a valid NID number.');
      return;
    }
    if (!signupPin || signupPin.length < 4) {
      setSignupError(language === 'bn' ? '৪ ডিজিটের সিকিউরিটি পিন/পাসওয়ার্ড সেট করুন।' : 'Please set a 4-digit security PIN.');
      return;
    }
    if (!signupNidFront || !signupNidBack) {
      setSignupError(
        language === 'bn'
          ? 'ভোটার আইডি কার্ডের সম্মুখভাগ (Front) এবং পেছনভাগ (Back) উভয় পাশের ফটোকপি আপলোড বাধ্যতামূলক!'
          : 'Both Front and Back NID photocopies are strictly required!'
      );
      return;
    }

    const newAgentId = `agt-${Date.now().toString().slice(-4)}`;

    // 1. Create Pending Agent Profile with initial 0 balance and 'pending_deposit' status
    const pendingAgentProfile: AgentProfile = {
      id: newAgentId,
      agentName: signupAgencyName.trim() || `${signupFullName.trim()} টেলিকম`,
      ownerName: signupFullName.trim(),
      agentPhone: signupPhone.trim(),
      outletName: signupOutletAddress.trim() || 'বাংলাদেশ',
      outletLocation: 'বাংলাদেশ',
      floatBalance: 0, // Initial balance is strictly 0 BDT per requirements
      securityDeposit: 0,
      bonusBalance: 0,
      dailyLimit: 50000, // Default 50,000 BDT transaction permission limit
      usedLimitToday: 0,
      commissionEarnedToday: 0,
      totalCommissionBalance: 0,
      status: 'pending_deposit',
      activatedAt: new Date().toISOString().split('T')[0],
      nidNumber: signupNidNumber.trim(),
      nidFrontPhoto: signupNidFront,
      nidBackPhoto: signupNidBack,
      pin: signupPin.trim(),
      depositSubmitted: false,
    };
    registerOrUpdateAgent(pendingAgentProfile);

    // 2. Save KYC Application Record for Admin Dashboard Review
    const newKycApp: AgentKycRecord = {
      id: `agt-app-${Date.now()}`,
      agencyName: signupAgencyName.trim() || `${signupFullName.trim()} টেলিকম`,
      ownerName: signupFullName.trim(),
      phone: signupPhone.trim(),
      email: `${signupPhone.replace(/[^0-9]/g, '')}@agent.uwallet.bd`,
      nidNumber: signupNidNumber.trim(),
      nidFrontPhoto: signupNidFront,
      nidBackPhoto: signupNidBack,
      tradeLicenseNo: `TRAD/DSCC/${Math.floor(100000 + Math.random() * 900000)}/2025`,
      division: 'Dhaka',
      district: 'ঢাকা',
      outletAddress: signupOutletAddress.trim() || 'মিরপুর, ঢাকা',
      status: 'pending',
      submittedAt: 'এইমাত্র',
      securityDepositPaid: false,
      securityDepositAmount: 0,
      depositTrxId: '',
      depositProvider: 'bkash',
      depositVerified: false,
    };

    const existingApps = loadAgentApplications();
    const updatedApps = [newKycApp, ...existingApps.filter((a) => a.phone !== signupPhone.trim())];
    saveAgentApplications(updatedApps);

    // 💰 AUTOMATIC TRANSITION TO STAGE 2: MANDATORY SECURITY DEPOSIT PAYMENT
    setDepositSenderPhone(signupPhone.trim());
    setDepositSubmitError(null);
    setAuthMode('deposit_payment');
  };

  // Stage 2: Submit Mandatory Security Deposit
  const handleConfirmSecurityDepositPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositSubmitError(null);

    const activeTier =
      AGENT_SECURITY_DEPOSIT_TIERS.find((t) => t.id === selectedDepositTierId) ||
      AGENT_SECURITY_DEPOSIT_TIERS[1]; // Default Gold 50k / 5k

    const sender = depositSenderPhone.trim() || signupPhone.trim();
    if (!sender || sender.length < 11) {
      setDepositSubmitError(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক ১১ ডিজিটের প্রেরক মোবাইল নম্বর দিন।'
          : 'Please enter valid 11-digit sender phone number.'
      );
      return;
    }

    if (!depositPaymentTrxId.trim() || depositPaymentTrxId.trim().length < 6) {
      setDepositSubmitError(
        language === 'bn'
          ? 'টাকা পাঠানোর পর প্রাপ্ত ৬-১০ অক্ষরের ট্রানজেকশন আইডি (TrxID) দিন (যেমন: BKL9X872)।'
          : 'Please enter valid TrxID received from your payment SMS.'
      );
      return;
    }

    setDepositSubmitting(true);

    const list = loadAgentsList();
    const cleanPhone = sender.replace(/\D/g, '');
    const found = list.find((a) => a.agentPhone.replace(/\D/g, '') === cleanPhone);

    const updatedProfile: AgentProfile = {
      ...(found || DEFAULT_INITIAL_AGENT),
      agentPhone: sender,
      ownerName: found?.ownerName || signupFullName || 'এজেন্ট',
      agentName: found?.agentName || signupAgencyName || `${signupFullName || 'এজেন্ট'} টেলিকম`,
      status: 'pending_approval',
      depositSubmitted: true,
      depositAmount: activeTier.requiredDepositBDT,
      securityDeposit: activeTier.requiredDepositBDT,
      depositTrxId: depositPaymentTrxId.trim().toUpperCase(),
      depositProvider: depositPaymentMethod,
      depositSenderPhone: sender,
      dailyLimit: activeTier.dailyTransactionLimitBDT,
    };

    registerOrUpdateAgent(updatedProfile);

    // Also update KYC record
    const existingApps = loadAgentApplications();
    const updatedApps = existingApps.map((a) => {
      if (a.phone.replace(/\D/g, '') === cleanPhone) {
        return {
          ...a,
          securityDepositPaid: true,
          securityDepositAmount: activeTier.requiredDepositBDT,
          depositTrxId: depositPaymentTrxId.trim().toUpperCase(),
          depositProvider: depositPaymentMethod,
          depositSenderPhone: sender,
          requestedDailyLimit: activeTier.dailyTransactionLimitBDT,
        };
      }
      return a;
    });
    saveAgentApplications(updatedApps);

    setDepositSubmitting(false);
    // Switch to Pending Notice View (Agent is now awaiting admin approval)
    setAuthMode('pending_notice');
  };

  // Complete Verification & Unlock Terminal
  const handleCompleteVerification = () => {
    const list = loadAgentsList();
    const cleanPhone = signupPhone.replace(/\D/g, '');
    const found = list.find((a) => a.agentPhone.replace(/\D/g, '') === cleanPhone);

    const activeProfile: AgentProfile = found || {
      id: `agt-${Date.now().toString().slice(-4)}`,
      agentName: signupAgencyName || `${signupFullName} টেলিকম`,
      ownerName: signupFullName,
      agentPhone: signupPhone,
      outletName: signupOutletAddress || 'মিরপুর ১০ সার্কেল, ঢাকা',
      outletLocation: 'ঢাকা উত্তর',
      floatBalance: 0,
      securityDeposit: 0,
      bonusBalance: 0,
      dailyLimit: 50000,
      usedLimitToday: 0,
      commissionEarnedToday: 0,
      totalCommissionBalance: 0,
      status: 'active',
      activatedAt: new Date().toISOString().split('T')[0],
      nidNumber: signupNidNumber,
    };

    setAgent(activeProfile);
    setActiveAgentNid({
      front: signupNidFront,
      back: signupNidBack,
      nidNo: signupNidNumber,
    });
    setIsRegisteredAndVerified(true);

    // Save session
    localStorage.setItem(
      AGENT_SESSION_STORAGE_KEY,
      JSON.stringify({
        isVerified: true,
        agent: activeProfile,
        nidData: {
          front: signupNidFront,
          back: signupNidBack,
          nidNo: signupNidNumber,
        },
      })
    );

    // Update KYC records as approved
    const existingApps = loadAgentApplications();
    const approvedList = existingApps.map((a) =>
      a.phone === signupPhone ? { ...a, status: 'approved' as const, reviewedAt: 'Verified by System' } : a
    );
    saveAgentApplications(approvedList);
  };

  // Quick Login with Verification Check
  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginPhone || loginPhone.length < 11) {
      setLoginError(language === 'bn' ? 'সঠিক ১১ ডিজিটের ফোন নম্বর দিন।' : 'Enter valid 11-digit phone.');
      return;
    }
    if (!loginPin || loginPin.length < 4) {
      setLoginError(language === 'bn' ? '৪ ডিজিটের এজেন্ট পিন দিন।' : 'Enter 4-digit PIN.');
      return;
    }

    const list = loadAgentsList();
    const cleanPhone = loginPhone.replace(/\D/g, '');
    const found = list.find(
      (a) =>
        a.agentPhone === loginPhone.trim() ||
        a.agentPhone.replace(/\D/g, '') === cleanPhone
    );

    if (!found) {
      setLoginError(
        language === 'bn'
          ? 'এই মোবাইল নম্বরে কোনো এজেন্ট অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে প্রথমে সাইন-আপ করুন।'
          : 'Agent account not found. Please sign up first.'
      );
      return;
    }

    // 🔒 MANDATORY SECURITY DEPOSIT GATE: Block login if deposit is not submitted
    if (found.status === 'pending_deposit' || !found.depositSubmitted) {
      setDepositSenderPhone(found.agentPhone);
      setLoginError(
        language === 'bn'
          ? '⚠️ আপনার সাইন-আপ সম্পন্ন হয়েছে কিন্তু প্রাতিষ্ঠানিক সিকিউরিটি জামানত এখনও পরিশোধ করেননি! এজেন্টের কাজ শুরু ও ব্যালেন্স পেতে জামানত বাধ্যতামূলক।'
          : 'Security deposit required! Please complete your deposit payment first.'
      );
      return;
    }

    // 🔒 ADMIN APPROVAL GATE: Block login if status is pending_approval
    if (found.status === 'pending_approval') {
      setLoginError(
        language === 'bn'
          ? `⏳ আপনার জামানত (৳${(found.depositAmount || 5000).toLocaleString()}) ও সাইন-আপ প্রধান অ্যাডমিনের অনুমোদনের অপেক্ষায় রয়েছে। অ্যাডমিন অনুমোদন দিলে এবং ব্যালেন্স যোগ করলে আপনি লগইন করতে পারবেন।`
          : 'Your account and deposit are pending Admin approval. You can login once approved.'
      );
      return;
    }

    if (found.status === 'suspended') {
      setLoginError(
        language === 'bn'
          ? '⚠️ আপনার এজেন্ট অ্যাকাউন্টটি সাময়িকভাবে স্থগিত রয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।'
          : 'Account suspended. Contact admin.'
      );
      return;
    }

    if (found.pin && found.pin !== loginPin.trim()) {
      setLoginError(
        language === 'bn' ? 'ভুল সিকিউরিটি পিন! সঠিক ৪ ডিজিটের পিন দিন।' : 'Invalid security PIN.'
      );
      return;
    }

    setAgent(found);
    setActiveAgentNid({
      front: found.nidFrontPhoto || SMART_NID_FRONT_SVG,
      back: found.nidBackPhoto || SMART_NID_BACK_SVG,
      nidNo: found.nidNumber || '',
    });
    setIsRegisteredAndVerified(true);
    localStorage.setItem(
      AGENT_SESSION_STORAGE_KEY,
      JSON.stringify({
        isVerified: true,
        agent: found,
        nidData: {
          front: found.nidFrontPhoto || SMART_NID_FRONT_SVG,
          back: found.nidBackPhoto || SMART_NID_BACK_SVG,
          nidNo: found.nidNumber || '',
        },
      })
    );
  };

  // Customer Orders Stream: Periodic Simulator & 24-Hour Expiration Listener
  useEffect(() => {
    // Listen for order updates
    const handleOrderStream = () => {
      setCustomerOrders(loadAgentCustomerOrders());
    };
    window.addEventListener('uwallet_agent_orders_updated', handleOrderStream);

    // Periodic simulation: Every 70s, new realistic order from Bangladesh arrives
    const interval = setInterval(() => {
      if (isRegisteredAndVerified) {
        const newOrd = generateRandomCustomerOrder();
        const updated = addAgentCustomerOrder(newOrd);
        setCustomerOrders(updated);
        setLiveOrderSmsToast(newOrd.smsNoticeBn);
        setTimeout(() => setLiveOrderSmsToast(null), 8000);
      }
    }, 70000);

    return () => {
      window.removeEventListener('uwallet_agent_orders_updated', handleOrderStream);
      clearInterval(interval);
    };
  }, [isRegisteredAndVerified]);

  // Manual Trigger for Live Order Simulation / Testing
  const handleTriggerSimulatedOrder = () => {
    const newOrd = generateRandomCustomerOrder();
    const updated = addAgentCustomerOrder(newOrd);
    setCustomerOrders(updated);
    setLiveOrderSmsToast(newOrd.smsNoticeBn);
    setTimeout(() => setLiveOrderSmsToast(null), 8000);
  };

  // Logout / Switch Account
  const handleLogoutAgent = () => {
    localStorage.removeItem(AGENT_SESSION_STORAGE_KEY);
    setIsRegisteredAndVerified(false);
    setAuthMode('signup');
  };

  // Instant 1-Click Access as Approved Demo Agent (Owner & Testing bypass)
  const handleDirectDemoAgentLogin = () => {
    const list = loadAgentsList();
    const demo = list.find((a) => a.agentPhone === '01739-420736') || DEFAULT_INITIAL_AGENT;
    setAgent(demo);
    setActiveAgentNid({
      front: demo.nidFrontPhoto || SMART_NID_FRONT_SVG,
      back: demo.nidBackPhoto || SMART_NID_BACK_SVG,
      nidNo: demo.nidNumber || '1995267182910',
    });
    setIsRegisteredAndVerified(true);
    localStorage.setItem(
      AGENT_SESSION_STORAGE_KEY,
      JSON.stringify({
        isVerified: true,
        agent: demo,
        nidData: {
          front: demo.nidFrontPhoto || SMART_NID_FRONT_SVG,
          back: demo.nidBackPhoto || SMART_NID_BACK_SVG,
          nidNo: demo.nidNumber || '1995267182910',
        },
      })
    );
  };

  // Handle Security Deposit / Float Recharge
  const handleConfirmDeposit = () => {
    if (!trxId || trxId.trim().length < 6) {
      setTrxError(language === 'bn' ? 'সঠিক ৮-১০ ডিজিটের ট্রানজেকশন আইডি (TrxID) দিন' : 'Enter a valid 8-10 char TrxID');
      return;
    }

    setTrxError(null);
    updateAgentFloat(agent.agentPhone, depositAmount);
    setAgent((prev) => ({
      ...prev,
      floatBalance: prev.floatBalance + depositAmount,
      securityDeposit: prev.securityDeposit + depositAmount,
      status: 'active',
    }));

    setDepositSuccessMsg(
      language === 'bn'
        ? `অভিনন্দন! ${selectedProvider.toUpperCase()} সেন্ড মানি (TrxID: ${trxId}) সফলভাবে যাচাই হয়েছে। ৳${depositAmount.toLocaleString()} আপনার ফ্লোট ব্যালেন্সে যুক্ত হয়েছে!`
        : `Deposit verified! ৳${depositAmount.toLocaleString()} credited to float balance.`
    );

    setTimeout(() => {
      setIsDepositModalOpen(false);
      setDepositSuccessMsg(null);
      setTrxId('');
    }, 2500);
  };

  // Instant Self Top-Up for testing or demo balance addition
  const handleInstantSelfTopup = (amt: number) => {
    updateAgentFloat(agent.agentPhone, amt);
    setAgent((prev) => ({
      ...prev,
      floatBalance: prev.floatBalance + amt,
      status: 'active',
    }));
    setDepositSuccessMsg(
      language === 'bn'
        ? `✅ ৳${amt.toLocaleString()} তাত্ক্ষণিকভাবে ফ্লোট ব্যালেন্সে যুক্ত হয়েছে!`
        : `✅ ৳${amt.toLocaleString()} credited to float balance!`
    );
    setTimeout(() => {
      setIsDepositModalOpen(false);
      setDepositSuccessMsg(null);
    }, 2000);
  };

  // Handle SIM Cash In / Out
  const handleSimSubmit = () => {
    const num = parseFloat(simAmount);
    if (!customerPhone || customerPhone.length < 11) {
      alert(language === 'bn' ? 'সঠিক কাস্টমার ফোন নম্বর দিন' : 'Enter valid phone');
      return;
    }
    if (!num || num <= 0) {
      alert(language === 'bn' ? 'সঠিক টাকার পরিমাণ দিন' : 'Enter valid amount');
      return;
    }
    if (!agentPin || agentPin.length < 4) {
      alert(language === 'bn' ? '৪ ডিজিটের এজেন্ট পিন দিন' : 'Enter 4 digit PIN');
      return;
    }

    if (simModalType === 'cash_in') {
      if (agent.floatBalance < num) {
        alert(language === 'bn' ? 'অপর্যাপ্ত ফ্লোট ব্যালেন্স! অনুগ্রহ করে ফ্লোট রিচার্জ করুন।' : 'Insufficient float balance');
        return;
      }
      const earned = Math.round(num * 0.0025);
      setAgent((prev) => ({
        ...prev,
        floatBalance: prev.floatBalance - num,
        commissionEarnedToday: prev.commissionEarnedToday + earned,
        totalCommissionBalance: prev.totalCommissionBalance + earned,
      }));
      setCommissions((prev) => [
        {
          id: `comm-${Date.now()}`,
          transactionRef: `CI-${Math.floor(10000 + Math.random() * 90000)}`,
          type: 'cash_in',
          customerPhone,
          amount: num,
          commissionRate: 0.25,
          commissionAmount: earned,
          timestamp: 'Just now',
        },
        ...prev,
      ]);
    } else {
      const earned = Math.round(num * 0.0045);
      setAgent((prev) => ({
        ...prev,
        floatBalance: prev.floatBalance + num,
        commissionEarnedToday: prev.commissionEarnedToday + earned,
        totalCommissionBalance: prev.totalCommissionBalance + earned,
      }));
      setCommissions((prev) => [
        {
          id: `comm-${Date.now()}`,
          transactionRef: `CO-${Math.floor(10000 + Math.random() * 90000)}`,
          type: 'cash_out',
          customerPhone,
          amount: num,
          commissionRate: 0.45,
          commissionAmount: earned,
          timestamp: 'Just now',
        },
        ...prev,
      ]);
    }

    setSimSuccess(
      language === 'bn'
        ? `লেনদেন সফল হয়েছে! কাস্টমার: ${customerPhone}, পরিমাণ: ৳${num.toLocaleString()}`
        : `Transaction successful for ${customerPhone}`
    );

    setTimeout(() => {
      setSimModalType(null);
      setSimSuccess(null);
      setSimAmount('');
      setCustomerPhone('');
      setAgentPin('');
    }, 2000);
  };

  // Handle Dealership Booking for client
  const handleConfirmDealershipBooking = () => {
    if (!bookingProduct) return;
    if (!bookingClientName || !bookingClientPhone) {
      alert(language === 'bn' ? 'কাস্টমারের নাম ও মোবাইল নম্বর পূরণ করুন' : 'Provide customer name and phone');
      return;
    }
    const earnedComm = bookingProduct.agentCommissionBDT;
    setAgent((prev) => ({
      ...prev,
      commissionEarnedToday: prev.commissionEarnedToday + earnedComm,
      totalCommissionBalance: prev.totalCommissionBalance + earnedComm,
    }));
    setCommissions((prev) => [
      {
        id: `comm-deal-${Date.now()}`,
        transactionRef: `DEAL-${Math.floor(10000 + Math.random() * 90000)}`,
        type: 'cash_in',
        customerPhone: bookingClientPhone,
        amount: bookingProduct.priceBDT,
        commissionRate: bookingProduct.agentCommissionRate,
        commissionAmount: earnedComm,
        timestamp: 'Just now',
      },
      ...prev,
    ]);

    setBookingSuccessMsg(
      language === 'bn'
        ? `অভিনন্দন! "${bookingProduct.nameBn}" এর ডিলার বুকিং নিশ্চিত হয়েছে। এজেন্ট কমিশন ৳${earnedComm.toLocaleString()} আপনার অ্যাকাউন্টে জমা হয়েছে!`
        : `Booking placed! Earned ৳${earnedComm.toLocaleString()} agent commission.`
    );

    setTimeout(() => {
      setBookingProduct(null);
      setBookingSuccessMsg(null);
      setBookingClientName('');
      setBookingClientPhone('');
    }, 2500);
  };

  // Filtered Dealership Catalog for Agents
  const filteredCatalog = catalogItems.filter((item) => {
    const matchCat = catalogCategory === 'all' || item.category === catalogCategory;
    const q = catalogSearch.toLowerCase().trim();
    const matchQ =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.nameBn.includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.categoryLabelBn.includes(q);
    return matchCat && matchQ;
  });

  const standaloneUrl = window.location.origin + window.location.pathname + '#/agent';

  // =========================================================================
  // VIEW A: MANDATORY SIGN UP & VERIFICATION GATE
  // =========================================================================
  if (!isRegisteredAndVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col font-sans pb-12">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-teal-900/60 px-4 py-3 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-lg ring-2 ring-teal-400/30">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-white text-base tracking-tight">
                    {language === 'bn' ? 'E-wallet Go Agent Apps' : 'E-wallet Go Agent App'}
                  </h1>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.2 rounded border border-teal-500/30">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-teal-400 font-medium">
                  {language === 'bn' ? 'বাধ্যতামূলক রেজিস্ট্রেশন ও NID ফটোকপি ভেরিফিকেশন' : 'Mandatory Registration & NID Verification'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HeaderDownloadAppButton language={language} variant="agent" />

              <button
                type="button"
                onClick={() => setIsWorkPolicyModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-teal-500/20 hover:from-amber-500/30 hover:to-teal-500/30 text-amber-300 rounded-xl border border-amber-500/40 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>📋 কাজের নিয়ম ও ইনকাম</span>
              </button>

              <button
                onClick={() => copyToClipboard(standaloneUrl)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700"
              >
                {copiedText === standaloneUrl ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-teal-400" />
                )}
                <span>{language === 'bn' ? 'এজেন্ট লিঙ্ক' : 'Agent Link'}</span>
              </button>
              {onExitPortal && (
                <button
                  onClick={onExitPortal}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                  title="কাস্টমার ওয়ালেটে ফিরুন"
                >
                  <span>📱</span>
                  <span>{language === 'bn' ? 'কাস্টমার অ্যাপ' : 'Customer'}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Box */}
        <main className="max-w-2xl w-full mx-auto px-4 py-6 flex-1 space-y-6">
          {/* Top Banner Notice */}
          <div className="p-4 bg-teal-950/70 border border-teal-500/40 rounded-3xl space-y-2 relative overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-teal-500/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 text-teal-300 font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span>{language === 'bn' ? 'এজেন্ট লিংক প্রবেশদ্বার: সাইন-আপ ও ভেরিফিকেশন' : 'Agent Link Gateway: Sign Up & Verification'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'bn'
                ? 'এজেন্ট পোর্টালে কাজ শুরু করার পূর্বে আপনার নাম, মোবাইল নম্বর এবং জাতীয় পরিচয়পত্রের (NID) উভয় পাশের ফটোকপি সাবমিট করে ভেরিফাই সম্পন্ন করতে হবে। ভেরিফিকেশন সম্পন্ন হলেই এজেন্ট টার্মিনাল ও ২১০+ মেগা ডিলারশিপ ক্যাটালগ উন্মুক্ত হবে।'
                : 'Prior to terminal access, please provide your personal details and both Front & Back Voter ID (NID) photocopies for mandatory verification.'}
            </p>
          </div>

          {/* Official Daraz Work Policy & Anti-Betting Seal Banner */}
          <div
            onClick={() => setIsWorkPolicyModalOpen(true)}
            className="p-3.5 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border-2 border-teal-500/60 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-teal-400 transition-all shadow-lg group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black group-hover:scale-105 transition-transform shrink-0 border border-teal-500/40 text-lg">
                📋
              </div>
              <div>
                <div className="text-xs font-black text-white flex flex-wrap items-center gap-1.5">
                  <span>eWallet Go & দারাজ — কাজের নীতিমালা ও ইনকাম পদ্ধতি</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/40 font-extrabold">
                    ১০০% বেটিং ও জুয়া মুক্ত
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  কাজের ৪টি সহজ ধাপ, দৈনিক নিশ্চিত কমিশন (৳১,২০০-৳২,১৫০+) এবং জামানত ১০% নীতি (৫০ হাজারে ৫ হাজার) পড়ুন
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-teal-400 group-hover:translate-x-1 transition-transform shrink-0 flex items-center gap-1">
              <span>পড়ুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2.5 px-2 text-xs font-black rounded-xl transition-all whitespace-nowrap ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? '📝 ১. সাইন-আপ ও NID' : '1. Sign Up & NID'}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('deposit_payment')}
              className={`flex-1 py-2.5 px-2 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                authMode === 'deposit_payment'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💰 ২. সিকিউরিটি জামানত</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('verifying')}
              className={`flex-1 py-2.5 px-2 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                authMode === 'verifying'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>{language === 'bn' ? '🔍 স্ট্যাটাস' : 'Status'}</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2.5 px-2 text-xs font-black rounded-xl transition-all whitespace-nowrap ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? '🔑 একাউন্টে লগইন' : 'Agent Login'}
            </button>
          </div>

          {/* ================= STAGE 1: SIGN-UP FORM ================= */}
          {authMode === 'signup' && (
            <form onSubmit={handleInitiateSignup} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-5 shadow-2xl">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">
                    {language === 'bn' ? '১. এজেন্ট প্রোফাইল ও এনআইডি তথ্য' : '1. Agent Profile & NID Data'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'bn' ? 'সব তথ্য নির্ভুলভাবে প্রদান করুন' : 'Fill all fields accurately'}
                  </p>
                </div>
                <span className="text-[11px] font-mono bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/40">
                  ধাপ ১ / ২
                </span>
              </div>

              {signupError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-2xl text-xs text-rose-300 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'এজেন্ট / স্বত্বাধিকারীর পুরো নাম *' : 'Agent / Owner Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="আপনার পুরো নাম লিখুন (যেমন: সুফিয়ান)"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'সচল মোবাইল নম্বর (ইউজার আইডি) *' : 'Active Mobile Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="১১ ডিজিটের মোবাইল নম্বর (যেমন: 01739420736)"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-medium focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'দোকান বা ব্যবসা প্রতিষ্ঠানের নাম *' : 'Shop / Agency Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupAgencyName}
                    onChange={(e) => setSignupAgencyName(e.target.value)}
                    placeholder="ব্যবসা প্রতিষ্ঠানের নাম (যেমন: সুফিয়ান টেলিকম)"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'জাতীয় পরিচয়পত্র (NID) নম্বর *' : 'Voter ID / NID Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupNidNumber}
                    onChange={(e) => setSignupNidNumber(e.target.value)}
                    placeholder="১০ অথবা ১৭ ডিজিটের NID নম্বর লিখুন"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-medium focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'আউটলেট ঠিকানা ও জেলা *' : 'Outlet Address & Location *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={signupOutletAddress}
                    onChange={(e) => setSignupOutletAddress(e.target.value)}
                    placeholder="দোকানের পূর্ণ ঠিকানা (যেমন: দোকান নং ১২, কোদপাড়া বাজার, ভোলা)"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'লগইন পিন / সিকিউরিটি পাসওয়ার্ড (৪-৬ ডিজিট) *' : 'Security PIN / Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={signupPin}
                    onChange={(e) => setSignupPin(e.target.value)}
                    placeholder="৪ ডিজিটের গোপন পিন নম্বর সেট করুন"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold tracking-widest focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* MOCK NID IMAGE UPLOAD & PRE-SUBMISSION PREVIEW COMPONENT */}
              <div className="pt-2">
                <NidUploadPreview
                  language={language}
                  frontImage={signupNidFront}
                  backImage={signupNidBack}
                  onFrontChange={setSignupNidFront}
                  onBackChange={setSignupNidBack}
                  nidNumber={signupNidNumber}
                  agentName={signupFullName}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-700 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>
                    {language === 'bn'
                      ? '১ম ধাপ সম্পন্ন: এনআইডি সাবমিট করে সিকিউরিটি জামানত পেজে যান (Next)'
                      : 'Step 1 Complete: Submit NID & Proceed to Security Deposit'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ================= STAGE 2: MANDATORY SECURITY DEPOSIT PAYMENT ================= */}
          {authMode === 'deposit_payment' && (() => {
            const currentTier =
              AGENT_SECURITY_DEPOSIT_TIERS.find((t) => t.id === selectedDepositTierId) ||
              AGENT_SECURITY_DEPOSIT_TIERS[1];
            const activeMfsNumber =
              depositPaymentMethod === 'rocket'
                ? mfsConfig.rocket.number
                : depositPaymentMethod === 'nagad'
                ? mfsConfig.nagad.number
                : mfsConfig.bkash.number;

            return (
              <form
                onSubmit={handleConfirmSecurityDepositPayment}
                className="bg-slate-900 border border-teal-500/50 rounded-3xl p-5 md:p-6 space-y-5 shadow-2xl relative overflow-hidden animate-in fade-in"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>💰 ২. প্রাতিষ্ঠানিক সিকিউরিটি জামানত নির্ধারণ ও সেন্ড মানি</span>
                    </h3>
                    <p className="text-xs text-teal-400 font-medium">
                      {language === 'bn'
                        ? 'টার্মিনাল চালুর পূর্বে জামানত জমা দেওয়া বাধ্যতামূলক (১০০% রিফান্ডেবল)'
                        : 'Security deposit submission is mandatory prior to terminal access (100% Refundable)'}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/40">
                    ধাপ ২ / ২
                  </span>
                </div>

                {depositSubmitError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-2xl text-xs text-rose-300 font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{depositSubmitError}</span>
                  </div>
                )}

                {/* RATIONALE & POLICY EXPLAINER CARD */}
                <div className="p-4 bg-slate-950/90 border border-amber-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-black">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>কাস্টমারদের পণ্যের উপর ভিত্তি করে জামানত নীতি (১০% অনুপাত)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    আমাদের সিস্টেমে কাস্টমারদের লাখ লাখ টাকার গ্যাজেট, ফোন ও ডিলারশিপের পণ্য বুকিং হয় এবং প্রতিদিন পর্যাপ্ত পরিমাণ ব্যালেন্স এজেন্টের একাউন্টে সার্কুলেশন করা হয়। প্রতিটি এজেন্টের আর্থিক নিরাপত্তার জন্য <strong>দৈনিক লেনদেন লিমিটের ১০% জামানত</strong> জমা নেওয়া হয়।
                  </p>
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-semibold">
                    💡 যেমন: আপনি যদি প্রতিদিন <strong>৳৫০,০০০</strong> টাকার কাস্টমার লেনদেন করতে চান, তবে আপনাকে <strong>৳৫,০০০</strong> টাকা জামানত জমা দিতে হবে। এটি আপনার নিজস্ব সিকিউরড ফান্ড এবং ব্যবসা ছাড়লে সম্পূর্ণ ফেরতযোগ্য।
                  </div>
                </div>

                {/* SERIAL TIERS SELECTION */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-black text-white">
                    আপনার চাহিদামতো দৈনিক লেনদেন লিমিট ও জামানত টিয়ার নির্বাচন করুন:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AGENT_SECURITY_DEPOSIT_TIERS.map((tier) => {
                      const isSelected = tier.id === selectedDepositTierId;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => setSelectedDepositTierId(tier.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                            isSelected
                              ? 'bg-teal-950/70 border-teal-400 shadow-lg ring-1 ring-teal-400/50'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {tier.isRecommended && (
                            <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-wider shadow-xs">
                              ⭐ সর্বাধিক জনপ্রিয়
                            </span>
                          )}

                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                                <span>{tier.tierNameBn}</span>
                              </div>
                              <div className="text-[11px] text-teal-400 font-bold mt-0.5">
                                দৈনিক লিমিট: ৳{tier.dailyTransactionLimitBDT.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-medium">জামানত (১০%)</span>
                              <span className="font-mono font-black text-amber-400 text-sm">
                                ৳{tier.requiredDepositBDT.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">বোনাস: <strong className="text-emerald-400 font-mono font-bold">৳{tier.welcomeBonusBDT.toLocaleString()}</strong></span>
                            <span className="text-slate-400">কমিশন: <strong className="text-teal-300 font-mono">{tier.expectedDailyCommissionBDT}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* OFFICIAL SEND MONEY BOX */}
                <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 border border-teal-500/40 rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-teal-400" />
                      <span>অফিসিয়াল জামানত সেন্ড মানি নম্বর (Send Money Only):</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                      অফিসিয়াল ট্রাস্টি
                    </span>
                  </div>

                  {/* Channel Switcher */}
                  <div className="flex gap-1.5">
                    {(['bkash', 'nagad', 'rocket', 'bank'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setDepositPaymentMethod(method)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                          depositPaymentMethod === method
                            ? 'bg-teal-500 text-slate-950 shadow-md font-black'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {method === 'bkash' ? 'বিকাশ' : method === 'nagad' ? 'নগদ' : method === 'rocket' ? 'রকেট' : 'ব্যাংক'}
                      </button>
                    ))}
                  </div>

                  {/* Number & Copy Card */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-teal-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {depositPaymentMethod.toUpperCase()} সেন্ড মানি নম্বর:
                      </span>
                      <span className="text-base font-black text-white font-mono tracking-wider">
                        {activeMfsNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeMfsNumber)}
                      className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 rounded-xl text-xs font-bold text-teal-300 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {copiedText === activeMfsNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>নম্বর কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p>১. আপনার বিকাশ/নগদ অ্যাপে যান এবং Send Money অপশন বেছে নিন।</p>
                    <p>২. উপরে প্রদর্শিত নম্বরে নির্বাচিত জামানত পরিমাণ <strong className="text-amber-300 font-mono">৳{currentTier.requiredDepositBDT.toLocaleString()}</strong> সেন্ড মানি করুন।</p>
                    <p>৩. টাকা পাঠানোর পর প্রাপ্ত এসএমএস থেকে TrxID এবং প্রেরক নম্বর নিচে লিখে সাবমিট করুন।</p>
                  </div>
                </div>

                {/* SENDER PHONE & TRXID INPUT FORM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      টাকা পাঠানোর প্রেরক মোবাইল নম্বর *
                    </label>
                    <input
                      type="text"
                      required
                      value={depositSenderPhone}
                      onChange={(e) => setDepositSenderPhone(e.target.value)}
                      placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন (১১ ডিজিট)"
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-medium focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      ট্রানজেকশন আইডি (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={depositPaymentTrxId}
                      onChange={(e) => setDepositPaymentTrxId(e.target.value)}
                      placeholder="এসএমএস-এ প্রাপ্ত TrxID (যেমন: BKL9X872)"
                      className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-teal-300 font-mono font-bold tracking-wider uppercase focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-400">জমাকৃত জামানত: <strong className="text-amber-400 font-mono">৳{currentTier.requiredDepositBDT.toLocaleString()}</strong></span>
                  <span className="text-slate-400">অনুরোধকৃত লিমিট: <strong className="text-teal-300 font-mono">৳{currentTier.dailyTransactionLimitBDT.toLocaleString()} / দিন</strong></span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs cursor-pointer"
                  >
                    ← এনআইডি এডিট
                  </button>
                  <button
                    type="submit"
                    disabled={depositSubmitting}
                    className="flex-1 py-3.5 px-4 bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-700 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {depositSubmitting
                        ? 'যাচাই করা হচ্ছে...'
                        : `জামানত ৳${currentTier.requiredDepositBDT.toLocaleString()} জমা নিশ্চিত করুন`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            );
          })()}

          {/* ================= STAGE 2: PENDING ADMIN APPROVAL SCREEN ================= */}
          {authMode === 'pending_notice' && (() => {
            const currentTier =
              AGENT_SECURITY_DEPOSIT_TIERS.find((t) => t.id === selectedDepositTierId) ||
              AGENT_SECURITY_DEPOSIT_TIERS[1];
            return (
              <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 md:p-8 space-y-5 text-center shadow-2xl relative overflow-hidden animate-in fade-in">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center border-2 border-amber-500/40 shadow-lg">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black">
                    ⏳ জামানত ও আবেদন প্রধান অ্যাডমিন প্যানেলে জমা হয়েছে • অনুমোদনের অপেক্ষায়
                  </span>
                  <h3 className="text-xl font-black text-white">
                    {language === 'bn' ? 'প্রধান অ্যাডমিন অনুমোদন দিলে আপনি টার্মিনালে প্রবেশ করতে পারবেন' : 'Pending Admin Verification'}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                    {language === 'bn'
                      ? `আপনার জামানত (৳${currentTier.requiredDepositBDT.toLocaleString()}) এবং ভোটার আইডি (NID) আবেদন প্রধান অ্যাডমিনের ড্যাশবোর্ডে পৌঁছেছে। অ্যাডমিন অনুমোদন সম্পন্ন করলে এবং প্রাথমিক ব্যালেন্স ও দৈনিক ৳${currentTier.dailyTransactionLimitBDT.toLocaleString()} লিমিট যোগ করলে আপনি মোবাইল ও পিন দিয়ে সরাসরি টার্মিনালে ঢুকতে পারবেন।`
                      : 'Your security deposit and registration have been submitted to Admin. Once admin approves, you can login.'}
                  </p>
                </div>

                {/* Application Details Summary */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">স্বত্বাধিকারীর নাম:</span>
                    <span className="font-bold text-white">{signupFullName || 'সুফিয়ান'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">এজেন্ট মোবাইল নম্বর:</span>
                    <span className="font-mono font-bold text-teal-400">{signupPhone || depositSenderPhone || '01739-420736'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">দোকান / আউটলেট:</span>
                    <span className="text-slate-200">{signupAgencyName || 'সুফিয়ান টেলিকম'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">জমাকৃত সিকিউরিটি জামানত:</span>
                    <span className="font-mono font-black text-amber-400">
                      ৳{currentTier.requiredDepositBDT.toLocaleString()} ({depositPaymentMethod.toUpperCase()} TrxID: {depositPaymentTrxId || 'BKL...'})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">অনুরোধকৃত দৈনিক লেনদেন লিমিট:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ৳{currentTier.dailyTransactionLimitBDT.toLocaleString()} / দিন
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">স্বাগত বোনাস তহবিল:</span>
                    <span className="font-mono font-bold text-teal-300">৳{currentTier.welcomeBonusBDT.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'bn' ? '🔑 লগইন পেইজে যান' : 'Go to Login'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('verifying')}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    {language === 'bn' ? '🔍 ভেরিফিকেশন স্ট্যাটাস' : 'Check Status'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ================= STAGE 3: VERIFICATION DASHBOARD ================= */}
          {authMode === 'verifying' && (
            <AgentKycStatusDashboard
              language={language}
              currentPhone={signupPhone}
              onProceedToTerminal={handleCompleteVerification}
              onBackToEdit={() => setAuthMode('signup')}
              isEmbeddedInGate={true}
            />
          )}

          {/* ================= LOGIN FORM ================= */}
          {authMode === 'login' && (
            <form onSubmit={handleQuickLogin} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-2xl">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white">
                  {language === 'bn' ? 'নিবন্ধিত এজেন্ট লগইন' : 'Registered Agent Login'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'আপনার অনুমোদিত এজেন্ট মোবাইল নম্বর ও পিন দিয়ে প্রবেশ করুন' : 'Login using registered agent mobile & PIN'}
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-2xl text-xs text-rose-300 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'এজেন্ট মোবাইল নম্বর' : 'Agent Mobile Number'}
                  </label>
                  <input
                    type="text"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="১১ ডিজিটের এজেন্ট ফোন নম্বর লিখুন (উদা: 01739420736)"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-medium focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'এজেন্ট পিন / পাসওয়ার্ড' : 'Security PIN / Password'}
                  </label>
                  <input
                    type="password"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="৪ ডিজিটের পিন লিখুন"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold tracking-widest focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'লগইন করুন' : 'Login'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectDemoAgentLogin}
                  className="w-full py-3 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'bn' ? '⚡ ১-ক্লিকে সরাসরি এজেন্ট টার্মিনালে প্রবেশ (ডেমো)' : '1-Click Direct Demo Access'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginPhone('01739-420736');
                    setLoginPin('7394');
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-teal-300 rounded-xl text-[11px] font-bold border border-slate-700 cursor-pointer"
                >
                  {language === 'bn' ? 'অটো-ফিল ডেমো অনুমোদিত এজেন্ট (আজিম টেলিকম)' : 'Auto-fill Demo Approved Agent'}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: ACTIVE & VERIFIED AGENT TERMINAL
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans pb-16">
      {/* 1. Dedicated Agent App Header */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-teal-900/60 px-4 md:px-8 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-lg ring-2 ring-teal-400/30">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  E-wallet Go Agent Apps
                </span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-bold">
                  {language === 'bn' ? 'এজেন্ট ও ডিলার টার্মিনাল' : 'Agent Terminal'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {language === 'bn' ? 'ভেরিফায়েড' : 'Verified'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-300">{agent.agentName}</span>
                <span>•</span>
                <span className="font-mono text-teal-400">{agent.agentPhone}</span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <HeaderDownloadAppButton language={language} variant="agent" />

            <button
              onClick={() => setIsNidInspectModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-all"
              title="View Submitted NID"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'bn' ? 'আমার NID' : 'My NID'}</span>
            </button>

            <button
              onClick={() => copyToClipboard(standaloneUrl)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-all"
              title="Copy Agent Direct URL"
            >
              {copiedText === standaloneUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{language === 'bn' ? 'লিংক কপি হয়েছে!' : 'Link Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-teal-400" />
                  <span>{language === 'bn' ? 'এজেন্ট লিঙ্ক' : 'Agent Link'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'bn' ? 'ফ্লোট রিচার্জ / জামানত' : 'Add Float / Deposit'}</span>
            </button>

            <button
              onClick={handleLogoutAgent}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 rounded-xl border border-rose-900/60 transition-all"
              title="Logout & Test Signup Flow Again"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'লগআউট / নতুন সাইন-আপ' : 'Logout'}</span>
            </button>

            {onExitPortal && (
              <button
                onClick={onExitPortal}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                title="কাস্টমার ওয়ালেটে ফিরুন"
              >
                <span>📱</span>
                <span>{language === 'bn' ? 'কাস্টমার অ্যাপ' : 'Customer'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 border border-slate-800 rounded-2xl overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'terminal' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{language === 'bn' ? 'সিম লেনদেন ও টার্মিনাল' : 'SIM Terminal'}</span>
          </button>

          <button
            onClick={() => setActiveTab('customer_orders')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'customer_orders'
                ? 'bg-gradient-to-r from-orange-500 via-rose-600 to-amber-500 text-white shadow-md font-black'
                : 'text-orange-300 hover:text-white bg-orange-950/20 border border-orange-500/20'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-orange-400" />
            <span>{language === 'bn' ? '📦 কাস্টমার অর্ডার হিস্ট্রি (২৪ ঘণ্টা)' : 'Customer Orders (24h)'}</span>
            <span className="text-[10px] bg-orange-500/30 text-orange-200 px-1.5 py-0.2 rounded-full border border-orange-400/40 font-bold">
              {customerOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('daily_earnings')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'daily_earnings'
                ? 'bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950 shadow-md font-black'
                : 'text-amber-300 hover:text-white bg-amber-950/20 border border-amber-500/20'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{language === 'bn' ? 'দৈনিক আয় ও ইনসেন্টিভ ড্যাশবোর্ড' : 'Daily Earnings & Tiers'}</span>
            <span className="text-[10px] bg-amber-400/30 text-amber-200 px-1.5 py-0.2 rounded-full border border-amber-400/40 font-bold">
              {language === 'bn' ? '১-১.৪% লাভ' : '1-1.4%'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('estimator')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'estimator'
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-indigo-300 hover:text-white bg-indigo-950/30 border border-indigo-500/30'
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>{language === 'bn' ? 'আয় এস্টিমেটর (৫k-১৫k টিয়ার)' : 'Earning Estimator'}</span>
            <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">
              {language === 'bn' ? 'ক্যালকুলেটর' : 'CALC'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dealership')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'dealership' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ship className="w-4 h-4 text-amber-300" />
            <span>{language === 'bn' ? 'জাহাজ ও মেগা ডিলারশিপ বুকিং' : 'Cargo Ship & Asset Deals'}</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-400/30">
              {catalogItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('deposit_guide')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'deposit_guide'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>{language === 'bn' ? '📋 কাজের নীতিমালা ও ইনকাম পদ্ধতি' : 'Work Policy & Income System'}</span>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded-full border border-rose-500/40 font-bold">
              বেটিং-মুক্ত
            </span>
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'kyc' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>{language === 'bn' ? 'ভেরিফিকেশন স্ট্যাটাস ও NID' : 'Verification Status & NID'}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/30 font-bold">
              LIVE
            </span>
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'disputes'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md font-black'
                : 'text-amber-300 hover:text-white bg-amber-950/20 border border-amber-500/20'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-amber-300" />
            <span>{language === 'bn' ? 'অভিযোগ ও সহায়তা' : 'Dispute & Support'}</span>
            <span className="text-[10px] bg-amber-400/30 text-amber-200 px-1.5 py-0.2 rounded-full border border-amber-400/40 font-bold">
              24/7 SLA
            </span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'performance' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'bn' ? 'কমিশন ও পারফরম্যান্স' : 'Earnings & Float'}</span>
          </button>
        </div>

        {/* 3. Float Balance, Bonus, Daily Limit & Earnings Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Working Float Balance */}
          <div className="bg-slate-800/80 border border-teal-500/40 rounded-2xl p-4 space-y-1 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-teal-300 font-bold uppercase tracking-wider">
                {language === 'bn' ? 'কার্যকরী ফ্লোট ব্যালেন্স' : 'Working Float Balance'}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                LIVE
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ৳{agent.floatBalance.toLocaleString()}
            </div>
            <div className="text-[10px] text-teal-400 flex items-center gap-1 font-semibold pt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{language === 'bn' ? 'লেনদেনের জন্য সম্পূর্ণ প্রস্তুত' : 'Ready for Cash-In'}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsDepositModalOpen(true)}
              className="mt-2.5 w-full py-2 px-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>{language === 'bn' ? '+ ব্যালেন্স যোগ করুন' : '+ Add Balance'}</span>
            </button>
          </div>

          {/* Security Deposit & Bonus Balance */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                {language === 'bn' ? 'জামানত জমা ও বোনাস' : 'Security Collateral & Bonus'}
              </span>
              {(agent.bonusBalance ?? 0) > 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                  🎁 বোনাস ৳{(agent.bonusBalance || 0).toLocaleString()}
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              ৳{agent.securityDeposit.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-300 flex items-center gap-1 font-semibold pt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{language === 'bn' ? 'অফিসিয়াল জামানত সুরক্ষিত' : 'Official Escrow Locked'}</span>
            </div>
          </div>

          {/* Today's Commission */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">
              {language === 'bn' ? 'আজকের অর্জিত কমিশন' : 'Today Commission'}
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              +৳{agent.commissionEarnedToday.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-semibold pt-1">
              {language === 'bn' ? 'সরাসরি উইথড্রয়ালযোগ্য' : 'Instant withdrawable'}
            </div>
          </div>

          {/* Daily Transaction Permission Limit (২৪ ঘণ্টা) */}
          <div className="bg-slate-800/80 border border-indigo-500/40 rounded-2xl p-4 space-y-1 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">
                {language === 'bn' ? 'দৈনিক লেনদেন লিমিট' : 'Daily Limit (24h)'}
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono font-bold">
                ২৪ ঘণ্টা
              </span>
            </div>
            <div className="text-2xl font-black text-indigo-300 font-mono">
              ৳{(agent.dailyLimit || 50000).toLocaleString()}
            </div>
            <div className="text-[10px] text-indigo-200/90 font-semibold pt-1 flex items-center justify-between">
              <span>অর্ডারে ব্যবহৃত: ৳{customerOrders.reduce((s, o) => s + o.amountBDT, 0).toLocaleString()}</span>
              <span className="text-emerald-400 font-mono font-bold">
                অবশিষ্ট: ৳{Math.max(0, (agent.dailyLimit || 50000) - customerOrders.reduce((s, o) => s + o.amountBDT, 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ================= TAB 1: TERMINAL & SIM ACTIONS ================= */}
        {activeTab === 'terminal' && (
          <div className="space-y-4">
            {/* 🔒 Personal Confidential Agent Profile Card (View-Only, No Edit Options) */}
            <div className="p-4 bg-slate-950/90 border border-teal-500/30 rounded-3xl space-y-3 relative overflow-hidden shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40 shrink-0">
                    <UserCheck className="w-5 h-5 text-teal-300" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm flex items-center gap-2">
                      <span>{language === 'bn' ? '🔒 ব্যক্তিগত ও গোপনীয় এজেন্ট প্রোফাইল' : '🔒 Personal Agent Profile'}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                        {language === 'bn' ? 'অপরিবর্তনযোগ্য ভেরিফাইড' : 'Verified Locked'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {language === 'bn'
                        ? 'এটি আপনার ব্যক্তিগত একাউন্ট। নিরাপত্তার স্বার্থে এজেন্ট প্যানেল থেকে কোনো তথ্য পরিবর্তন করা যাবে না (শুধুমাত্র অ্যাডমিন প্যানেল কর্তৃক নিয়ন্ত্রিত)।'
                        : 'Personal confidential profile. View-only access; details are administered strictly via Admin Panel.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-teal-300 font-mono bg-teal-950/70 border border-teal-500/30 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ID: {agent.id}</span>
                  </span>
                </div>
              </div>

              {/* Profile Details Grid - Strictly Read-Only */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'স্বত্বাধিকারীর নাম' : 'Owner Name'}</span>
                  <span className="font-extrabold text-white text-xs mt-0.5 block truncate">
                    {agent.ownerName || agent.agentName}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'ব্যবসা প্রতিষ্ঠান / দোকান' : 'Shop / Outlet'}</span>
                  <span className="font-bold text-white text-xs mt-0.5 block truncate">
                    {agent.agentName}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'রেজিস্ট্রিকৃত মোবাইল' : 'Registered Mobile'}</span>
                  <span className="font-mono font-bold text-teal-400 text-xs mt-0.5 block">
                    {agent.agentPhone}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'জাতীয় পরিচয়পত্র (NID)' : 'Voter NID'}</span>
                  <span className="font-mono font-bold text-amber-300 text-xs mt-0.5 block">
                    {agent.nidNumber || activeAgentNid.nidNo || '1995267182910'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{agent.outletName} ({agent.outletLocation})</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-emerald-400 font-mono font-bold">
                    অনুমোদিত দৈনিক লিমিট: ৳{(agent.dailyLimit || 50000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 📊 Daily Transaction Permission Limit (৳50,000) & 24h Auto-Reset Progress Meter */}
            <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 border-2 border-indigo-500/40 rounded-3xl space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40 shrink-0">
                    <TrendingUp className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">
                      {language === 'bn' ? 'দৈনিক লেনদেন পারমিশন লিমিট (২৪ ঘণ্টার অটোমেটিক সাইকেল)' : 'Daily Permission Limit (24h Auto-Cycle)'}
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {language === 'bn'
                        ? 'প্রতিদিন ২৪ ঘণ্টার মধ্যে কাস্টমারদের সমস্ত অর্ডার হিস্ট্রি সেভ থাকবে এবং ২৪ ঘণ্টা পর স্বয়ংক্রিয়ভাবে মুছে নতুন সাইকেল শুরু হবে।'
                        : 'Orders are accumulated against the permission limit and automatically pruned after 24 hours.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerSimulatedOrder}
                    className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'নতুন কাস্টমার অর্ডার টেস্ট' : 'Simulate Order'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('customer_orders')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'সব অর্ডার দেখুন' : 'View All'}</span>
                    <ArrowRight className="w-3 h-3 inline ml-1" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Stats */}
              {(() => {
                const limit = agent.dailyLimit || 50000;
                const totalVol = customerOrders.reduce((sum, o) => sum + o.amountBDT, 0);
                const remaining = Math.max(0, limit - totalVol);
                const pct = Math.min(100, Math.round((totalVol / limit) * 100));

                return (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between text-xs font-bold gap-2">
                      <span className="text-slate-300">
                        আজকের মোট কাস্টমার অর্ডার লেনদেন: <strong className="text-white font-mono text-sm">৳{totalVol.toLocaleString()}</strong>
                      </span>
                      <span className="text-emerald-400 font-mono">
                        অবশিষ্ট অনুমোদিত লিমিট: <strong>৳{remaining.toLocaleString()}</strong> / ৳{limit.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 text-amber-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>২৪ ঘণ্টার অটোমেটিক সাইকেল সক্রিয় (২৪ ঘণ্টা পর হিস্ট্রি রিসেট হবে)</span>
                      </span>
                      <span className="font-mono text-indigo-300 font-bold">{pct}% লিমিট সম্পন্ন</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Daily Incentive & Projected Earnings Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-teal-950/40 border border-amber-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-white text-xs">
                      {language === 'bn' ? 'দৈনিক আয় ও ভলিউম ইনসেন্টিভ: ১.০০% থেকে ১.৪০%' : 'Daily Earnings & Volume Incentive: 1.00% to 1.40%'}
                    </h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-500/30 font-bold">
                      {language === 'bn' ? 'সরাসরি সেন্ট্রাল অর্ডার' : 'Live P2P Routing'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {language === 'bn'
                      ? 'আপনার জামানতের ভিত্তিতে প্রতিদিন ৫০,০০০ থেকে ২,৫০,০০০ টাকার সেন্ট্রাল কাস্টমার অর্ডার আপনার নম্বরে রুট করা হচ্ছে।'
                      : 'Orders are automatically routed to your number daily based on collateral tiers.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('estimator')}
                  className="py-2 px-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 hover:from-indigo-600 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5 text-slate-950" />
                  <span>{language === 'bn' ? 'আয় এস্টিমেটর (৫k-১৫k)' : 'Earning Estimator'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('daily_earnings')}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                </button>
              </div>
            </div>

            {/* Quick Action Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cash In Box */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40">
                    <ArrowDownLeft className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      {language === 'bn' ? 'ক্যাশ ইন (গ্রাহকের ওয়ালেটে টাকা পাঠান)' : 'Cash In to Customer'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {language === 'bn' ? 'কমিশন রেট: ০.২৫% (প্রতি হাজারে ২.৫০ টাকা)' : 'Commission: 0.25%'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'bn'
                    ? 'গ্রাহক নগদ টাকা দিলে আপনার ফ্লোট ব্যালেন্স থেকে গ্রাহকের বিকাশ, নগদ বা ইউওয়ালেট নম্বরে সরাসরি ক্যাশ ইন করুন।'
                    : 'Disburse digital balance from your float to customer phone numbers.'}
                </p>
                <button
                  onClick={() => {
                    setSimModalType('cash_in');
                    setSimAmount('5000');
                    setCustomerPhone('');
                  }}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>{language === 'bn' ? 'ক্যাশ ইন শুরু করুন' : 'Start Cash In'}</span>
                </button>
              </div>

              {/* Cash Out Box */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      {language === 'bn' ? 'ক্যাশ আউট (গ্রাহককে নগদ টাকা প্রদান)' : 'Cash Out to Customer'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {language === 'bn' ? 'কমিশন রেট: ০.৪৫% (প্রতি হাজারে ৪.৫০ টাকা)' : 'Commission: 0.45%'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'bn'
                    ? 'গ্রাহক এজেন্ট ক্যাশ আউট করলে তাকে নগদ টাকা প্রদান করুন এবং আপনার ফ্লোটে ডিজিটাল ব্যালেন্স ও কমিশন যুক্ত হবে।'
                    : 'Receive agent cash-out requests and disburse hard cash.'}
                </p>
                <button
                  onClick={() => {
                    setSimModalType('cash_out');
                    setSimAmount('5000');
                    setCustomerPhone('');
                  }}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{language === 'bn' ? 'ক্যাশ আউট সম্পন্ন করুন' : 'Start Cash Out'}</span>
                </button>
              </div>
            </div>

            {/* Recent Commission Log */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-teal-400" />
                  <h3 className="font-extrabold text-white text-sm">
                    {language === 'bn' ? 'সাম্প্রতিক এজেন্ট লেনদেন ও কমিশন লগ' : 'Recent Transaction & Commission Logs'}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {commissions.length} {language === 'bn' ? 'টি লেনদেন' : 'Entries'}
                </span>
              </div>

              <div className="space-y-2.5">
                {commissions.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          c.type === 'cash_in'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {c.type === 'cash_in' ? 'CI' : 'CO'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{c.customerPhone}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Ref: {c.transactionRef}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{c.timestamp}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-white text-xs">
                        ৳{c.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold font-mono">
                        +{c.commissionAmount.toFixed(1)} Comm ({c.commissionRate}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: 24-HOUR CUSTOMER ORDERS STREAM & SMS NOTIFICATIONS ================= */}
        {activeTab === 'customer_orders' && (
          <div className="space-y-4">
            {/* Top Explainer Banner */}
            <div className="p-4 bg-gradient-to-r from-orange-950/70 via-slate-900 to-amber-950/70 border border-orange-500/40 rounded-3xl space-y-2 relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-400" />
                  <h3 className="font-black text-white text-base">
                    {language === 'bn'
                      ? 'লাইভ কাস্টমার প্রোডাক্ট অর্ডার হিস্ট্রি (২৪ ঘণ্টার অটো-রিমুভ সাইকেল)'
                      : 'Live Customer Order Stream (24-Hour Cycle)'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-orange-400 animate-spin" />
                    <span>{language === 'bn' ? '২৪ ঘণ্টা পর অটো-ক্লিন' : '24h Auto-Purge'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleTriggerSimulatedOrder}
                    className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? '⚡ নতুন কাস্টমার অর্ডার আনুন (টেস্ট)' : 'Simulate Order'}</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'বিভিন্ন জেলা (ভোলা, ঢাকা, চট্টগ্রাম ইত্যাদি) থেকে কাস্টমাররা প্রতি ১ থেকে ১০ মিনিট অন্তর দারাজ শপের প্রোডাক্ট অর্ডার ও টোকেন পরিশোধ করছেন। অনুমোদিত দৈনিক ৫০,০০০ টাকা লিমিটের মধ্যে সমস্ত লেনদেন লাইভ এসএমএস সহ এজেন্টের হিস্টোরিতে জমা থাকে এবং ২৪ ঘণ্টা পর স্বয়ংক্রিয়ভাবে ক্লিন হয়ে নতুন সাইকেল শুরু হয়।'
                  : 'Customer orders from nationwide districts are captured here with customer details, live SMS, and transaction amounts against your daily ৳50,000 limit. Records automatically purge every 24 hours.'}
              </p>
            </div>

            {/* Daily Limit & Transaction Volume Dashboard Cards */}
            {(() => {
              const stats = getAgentDailyOrderStats();
              const dailyLimit = agent.dailyLimit || 50000;
              const usedAmount = stats.totalVolumeBDT;
              const remaining = Math.max(0, dailyLimit - usedAmount);
              const pct = Math.min(100, Math.round((usedAmount / dailyLimit) * 100));

              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span>{language === 'bn' ? 'আজকের অনুমোদিত লিমিট' : 'Daily Transaction Limit'}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div className="text-xl font-black text-white font-mono">
                      ৳{dailyLimit.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-teal-400 font-medium">অ্যাডমিন কর্তৃক নির্ধারিত</span>
                  </div>

                  <div className="bg-slate-950/80 border border-orange-500/40 p-4 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-orange-300 font-semibold">
                      <span>{language === 'bn' ? 'ব্যবহৃত লিমিট (অর্ডার ভলিউম)' : 'Total Order Volume'}</span>
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                    <div className="text-xl font-black text-orange-400 font-mono">
                      ৳{usedAmount.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{customerOrders.length} টি সফল অর্ডার</span>
                  </div>

                  <div className="bg-slate-950/80 border border-emerald-500/40 p-4 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-300 font-semibold">
                      <span>{language === 'bn' ? 'অবশিষ্ট লিমিট বাকি আছে' : 'Remaining Limit'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-xl font-black text-emerald-400 font-mono">
                      ৳{remaining.toLocaleString()}
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(0, 100 - pct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-amber-500/40 p-4 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                      <span>{language === 'bn' ? 'অর্ডার থেকে অর্জিত কমিশন' : 'Commission Earned'}</span>
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      +৳{stats.totalCommissionBDT.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-amber-300/80 font-medium">লাইভ ওয়ালেটে যুক্ত</span>
                  </div>
                </div>
              );
            })()}

            {/* Orders Feed - Mobile Cards & Desktop Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h4 className="font-black text-white text-sm">
                    {language === 'bn' ? '২৪ ঘণ্টার লাইভ কাস্টমার অর্ডার তালিকা' : '24-Hour Real-Time Customer Orders'}
                  </h4>
                  <span className="text-xs bg-slate-800 text-teal-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    {customerOrders.length} টি
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {language === 'bn' ? 'স্বয়ংক্রিয় রিফ্রেশ ও সিঙ্ক সক্রিয়' : 'Auto-sync active'}
                </span>
              </div>

              {/* Order Cards List (Mobile & Tablet friendly) */}
              <div className="space-y-3">
                {customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all space-y-3 shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {order.productImageUrl ? (
                          <img
                            src={order.productImageUrl}
                            alt={order.productName}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-700 bg-slate-900 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                            {order.productEmoji}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-white text-sm">
                              {order.customerName}
                            </span>
                            <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({order.phoneMasked})
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-teal-300 mt-0.5">
                            📍 থানা: <span className="text-white font-bold">{order.thana}</span>, জেলা: <span className="text-white font-bold">{order.district}</span>, লোকেশন: <span className="text-amber-300 font-bold">{order.location}</span>
                          </div>
                          <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                            <span className="text-slate-400">{language === 'bn' ? 'পণ্য:' : 'Product:'}</span>
                            <span className="font-bold text-white">{order.productName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-white font-mono">
                          ৳{order.amountBDT.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-mono font-bold">
                          কমিশন: +৳{order.commissionEarnedBDT.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {order.formattedTime}
                        </span>
                      </div>
                    </div>

                    {/* Live SMS Highlight Box */}
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-start gap-2">
                      <span className="text-sm shrink-0">💬</span>
                      <p className="text-[11px] text-emerald-300 font-mono leading-relaxed">
                        {order.smsNoticeBn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900 text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>পেমেন্ট: {order.paymentMethodBn}</span>
                      </span>
                      <span className="text-amber-300 font-mono font-bold">
                        টোকেন জামানত: ৳{order.tokenPaidBDT.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: DEALERSHIP CATALOG (CARGO SHIPS & ASSETS) ================= */}
        {activeTab === 'dealership' && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-teal-950/60 border border-amber-500/40 rounded-3xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Ship className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-white text-base">
                    {language === 'bn'
                      ? 'উচ্চমূল্যের মেগা ডিলারশিপ ও জাহাজ বুকিং ক্যাটালগ (২১০+ প্রোডাক্ট)'
                      : 'High-Value Megaship & Asset Dealership Catalog'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsPolicyModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5 transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'bn' ? 'কাস্টমারদের জামানত নীতিমালা পড়ুন' : 'Read Customer Deposit Policy'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'এজেন্টদের জন্য বিশেষ ডিলারশিপ বুকিং সুবিধা: জাহাজ, কন্টেইনার ভেসেল, লাক্সারি প্রাডো/ল্যান্ড ক্রুজার, হেভি ক্রেন ও ওয়্যারহাউস বুকিংয়ে সরাসরি লাখ টাকা পর্যন্ত কমিশন অর্জন করুন।'
                  : 'Earn up to 2.5% dealership commissions on ocean freight vessels, luxury vehicle fleets, heavy construction cranes, and prime logistics properties.'}
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder={language === 'bn' ? 'জাহাজ, গাড়ি বা আইটেমের নাম দিয়ে সার্চ করুন...' : 'Search asset catalog...'}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400"
                />
              </div>

              <select
                value={catalogCategory}
                onChange={(e) => setCatalogCategory(e.target.value)}
                className="py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="all">{language === 'bn' ? 'সকল ক্যাটাগরি ও পণ্য' : 'All Categories & Products'}</option>
                <option value="smartphones">{language === 'bn' ? 'স্মার্টফোন (iPhone, Samsung, Vivo...)' : 'Smartphones'}</option>
                <option value="button_phones">{language === 'bn' ? 'বাটন ফোন (৳২৫০০ থেকে শুরু)' : 'Feature Phones (From ৳2,500)'}</option>
                <option value="used_phones">{language === 'bn' ? 'পুরাতন ফোন ক্রয়-বিক্রয়' : 'Pre-Owned Phones'}</option>
                <option value="laptops_computers">{language === 'bn' ? 'ল্যাপটপ ও কম্পিউটার' : 'Laptops & Computers'}</option>
                <option value="tvs_monitors">{language === 'bn' ? 'টিভি ও মনিটর' : 'TVs & Monitors'}</option>
                <option value="projectors">{language === 'bn' ? 'প্রজেক্টর' : 'Projectors'}</option>
                <option value="refrigerators_appliances">{language === 'bn' ? 'ফ্রিজ ও হোম অ্যাপ্লায়েন্স' : 'Refrigerators & Appliances'}</option>
                <option value="luxury_vehicles">{language === 'bn' ? 'লাক্সারি গাড়ি ও প্রাডো' : 'Luxury Vehicles'}</option>
                <option value="ocean_cargo">{language === 'bn' ? 'জাহাজ ও কন্টেইনার ডিলারশিপ' : 'Cargo Ships & Marine'}</option>
                <option value="heavy_machinery">{language === 'bn' ? 'হেভি ক্রেন ও মেশিনারি' : 'Heavy Cranes & Machinery'}</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCatalog.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-teal-500/50 transition-all shadow-md"
                >
                  <div className="space-y-2">
                    {prod.imageUrl ? (
                      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                        <img
                          src={prod.imageUrl}
                          alt={prod.nameBn}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {prod.darazFlashSale && (
                            <span className="bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow">
                              ⚡ FLASH SALE
                            </span>
                          )}
                        </div>
                        {prod.discountPercent && (
                          <span className="absolute top-2 right-2 bg-orange-600 text-white font-bold text-[10px] px-1.5 py-0.2 rounded shadow">
                            -{prod.discountPercent}%
                          </span>
                        )}
                        <span className="absolute bottom-1 right-2 text-[9px] font-mono text-white/90 bg-black/60 px-1 rounded">
                          {prod.categoryLabelBn}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800">
                          {prod.imageEmoji}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {language === 'bn' ? prod.categoryLabelBn : prod.categoryLabel}
                        </span>
                      </div>
                    )}

                    <div>
                      <h4 className="font-extrabold text-white text-xs leading-snug">
                        {language === 'bn' ? prod.nameBn : prod.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                        {language === 'bn' ? prod.shortDescriptionBn : prod.shortDescription}
                      </p>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>{language === 'bn' ? 'দারাজ মূল্য:' : 'Daraz Price:'}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white font-mono">
                            ৳{prod.priceBDT.toLocaleString()}
                          </span>
                          {prod.originalPriceBDT && prod.originalPriceBDT > prod.priceBDT && (
                            <del className="text-[10px] text-slate-400 line-through font-mono">
                              ৳{prod.originalPriceBDT.toLocaleString()}
                            </del>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{language === 'bn' ? 'কাস্টমার জামানত:' : 'Deposit:'}</span>
                        <span className="font-bold text-amber-400 font-mono">
                          ৳{prod.bookingDepositBDT.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                        <span className="text-teal-400 font-bold">{language === 'bn' ? 'এজেন্ট কমিশন:' : 'Agent Commission:'}</span>
                        <span className="font-black text-emerald-400 font-mono">
                          +{prod.agentCommissionRate}% (৳{prod.agentCommissionBDT.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBookingProduct(prod);
                      setBookingClientName('');
                      setBookingClientPhone('');
                      setBookingSuccessMsg(null);
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ক্লায়েন্টের জন্য বুক করুন' : 'Book for Client'}</span>
                  </button>
                </div>
              ))}
            </div>

            {filteredCatalog.length > 30 && (
              <div className="text-center py-2 text-xs text-slate-400">
                {language === 'bn'
                  ? `মোট ২১০+ প্রোডাক্টের মধ্যে প্রথম ৩০টি প্রদর্শিত হচ্ছে। আরও নির্দিষ্ট করতে উপরে সার্চ করুন।`
                  : `Showing 30 of ${filteredCatalog.length} assets. Use search to refine.`}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: DEDICATED CUSTOMER DEPOSIT POLICY GUIDE ================= */}
        {activeTab === 'deposit_guide' && (
          <div className="space-y-5">
            {/* Top Corporate Banner */}
            <div className="p-5 bg-gradient-to-r from-emerald-950/80 via-teal-950/70 to-slate-900 border-2 border-teal-500/50 rounded-3xl space-y-3 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg ring-2 ring-teal-400/40">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white text-base sm:text-lg">
                        {language === 'bn'
                          ? 'eWallet Go & দারাজ — কাজের নীতিমালা, ইনকাম পদ্ধতি ও জামানত নির্দেশিকা'
                          : 'Official Daraz Partner Work Guidelines & Income System'}
                      </h3>
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 font-extrabold px-2 py-0.5 rounded-full border border-teal-500/40">
                        Daraz Partner
                      </span>
                    </div>
                    <p className="text-xs text-teal-300 font-medium mt-0.5">
                      {language === 'bn'
                        ? 'দারাজ অনুমোদিত গ্যাজেট মার্চেন্ট ও রিটেইল ডিলারশিপ পার্টনার নেটওয়ার্ক'
                        : 'Authorized Daraz Gadget Merchant & Retail Logistics Gateway'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWorkPolicyModalOpen(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <span>📋 পূর্ণাঙ্গ গাইড পপআপ</span>
                  </button>
                  <button
                    onClick={() => setIsPolicyModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    {language === 'bn' ? 'কাস্টমার স্ক্রিপ্ট' : 'Script View'}
                  </button>
                </div>
              </div>

              {/* 🚫 Anti-Betting Legal Safety Certificate */}
              <div className="p-3.5 bg-rose-950/70 border border-rose-500/40 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs">
                  <span>🚫 কঠোর প্রাতিষ্ঠানিক নিশ্চয়তা: ১০০% বেটিং ও জুয়া মুক্ত প্ল্যাটফর্ম</span>
                </div>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  আমাদের সিস্টেমে কোনো প্রকার বেটিং (Betting), জুয়া বা অননুমোদিত সাইটের কাস্টমারদের কোনো নম্বর বা লেনদেন কখনোই ব্যবহার করা হয় না। আমরা শতভাগ বৈধ, সরকারি লাইসেন্সপ্রাপ্ত এবং দারাজ বাংলাদেশের অনুমোদিত গ্যাজেট ও ইলেকট্রনিক্স পার্টনার।
                </p>
              </div>
            </div>

            {/* 4 Professional Work Steps */}
            <div className="space-y-3">
              <h4 className="font-black text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>দারাজ মার্চেন্ট পার্টনার হিসেবে কাজ করার ৪টি নিয়মতান্ত্রিক ধাপ:</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {DARAZ_OFFICIAL_WORK_GUIDELINES.steps.map((st) => (
                  <div
                    key={st.stepNo}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 hover:border-teal-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-teal-400">ধাপ নং {st.stepNo}</span>
                        <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-500/30">
                          {st.badgeBn}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-white text-xs sm:text-sm">{st.titleBn}</h5>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{st.descBn}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
                      {st.keyPointsBn.map((kp, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{kp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Serial Deposit Tiers Table (10% Ratio: 50k -> 5k) */}
            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-black text-white text-sm">
                    {language === 'bn' ? 'দৈনিক লেনদেন লিমিট ও সিকিউরিটি জামানত টিয়ার (১০% অনুপাত)' : 'Transaction Limits & Deposit Tiers'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {language === 'bn'
                      ? 'প্রতিদিন ৫০,০০০ টাকা লেনদেনের বিপরীতে জামানত মাত্র ৫,০০০ টাকা (শতভাগ রিফান্ডেবল)'
                      : '50k daily limit requires only 5k security collateral (100% Refundable)'}
                  </p>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  ১০০% ক্যাশ সিকিউরড
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AGENT_SECURITY_DEPOSIT_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 hover:border-teal-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-white text-xs">{tier.tierNameBn}</h5>
                      {tier.isRecommended && (
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                          ⭐ সর্বাধিক জনপ্রিয়
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-xs text-slate-400">দৈনিক লিমিট:</span>
                      <span className="font-mono font-black text-teal-400 text-sm">
                        ৳{tier.dailyTransactionLimitBDT.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400">সিকিউরিটি জামানত (১০%):</span>
                      <span className="font-mono font-black text-amber-400 text-base">
                        ৳{tier.requiredDepositBDT.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px]">
                      <span className="text-slate-400">বোনাস ফান্ড: <strong className="text-emerald-400 font-mono">৳{tier.welcomeBonusBDT.toLocaleString()}</strong></span>
                      <span className="text-slate-400">দৈনিক ইনকাম: <strong className="text-teal-300 font-mono">{tier.expectedDailyCommissionBDT}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEPOSIT_PILLARS.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-white text-xs">
                      {language === 'bn' ? p.titleBn : p.titleEn}
                    </h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      {language === 'bn' ? p.badgeBn : p.badgeEn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'bn' ? p.descriptionBn : p.descriptionEn}
                  </p>
                </div>
              ))}
            </div>

            {/* Ratio Table */}
            <div className="bg-slate-800/70 rounded-3xl p-5 border border-slate-700 space-y-3">
              <h4 className="font-black text-white text-sm">
                {language === 'bn' ? 'পণ্য ক্যাটাগরি অনুযায়ী জামানতের অনুপাত' : 'Deposit Ratios by Category'}
              </h4>
              <div className="space-y-2">
                {DEPOSIT_RATIO_RULES.map((rule) => (
                  <div
                    key={rule.categoryId}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">
                        {language === 'bn' ? rule.categoryNameBn : rule.categoryNameEn}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {language === 'bn' ? rule.exampleBn : rule.exampleEn}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {language === 'bn' ? rule.ratioRangeBn : rule.ratioRangeEn}
                      </span>
                      <span className="text-[10px] text-emerald-400 block pt-0.5">
                        {language === 'bn' ? '✓ ১০০% সমন্বয়যোগ্য' : '100% Deductible'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Pitch Script */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-teal-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-teal-300 text-sm">
                    {language === 'bn' ? AGENT_CUSTOMER_EXPLAINER_SCRIPT.headlineBn : AGENT_CUSTOMER_EXPLAINER_SCRIPT.headlineEn}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'bn' ? 'গ্রাহকদের আস্থা অর্জনে এই বক্তব্যটি সরাসরি ব্যবহার করুন' : 'Read directly to clients'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    copyToClipboard(AGENT_CUSTOMER_EXPLAINER_SCRIPT.scriptLinesBn.join('\n'));
                  }}
                  className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5 text-teal-400" />
                  <span>{language === 'bn' ? 'কপি করুন' : 'Copy'}</span>
                </button>
              </div>

              <div className="space-y-2">
                {AGENT_CUSTOMER_EXPLAINER_SCRIPT.scriptLinesBn.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: VOTER ID (NID) VERIFICATION STATUS DASHBOARD ================= */}
        {activeTab === 'kyc' && (
          <div className="space-y-4">
            <AgentKycStatusDashboard
              language={language}
              currentPhone={agent.agentPhone}
              isEmbeddedInGate={false}
            />
          </div>
        )}

        {/* ================= TAB: DAILY EARNINGS & INCENTIVE DASHBOARD ================= */}
        {activeTab === 'daily_earnings' && (
          <DailyEarningsDashboard
            language={language}
            agent={agent}
            commissions={commissions}
            onOpenDepositModal={(recommendedTierAmount) => {
              if (recommendedTierAmount) {
                setDepositAmount(recommendedTierAmount);
              }
              setIsDepositModalOpen(true);
            }}
          />
        )}

        {/* ================= TAB: DAILY EARNING ESTIMATOR ================= */}
        {activeTab === 'estimator' && (
          <DailyEarningEstimator
            language={language}
            agent={agent}
            onOpenDepositModal={(recommendedTierAmount) => {
              if (recommendedTierAmount) {
                setDepositAmount(recommendedTierAmount);
              }
              setIsDepositModalOpen(true);
            }}
            onNavigateToTerminal={() => setActiveTab('terminal')}
          />
        )}

        {/* ================= TAB 5: PERFORMANCE ================= */}
        {activeTab === 'performance' && (
          <AgentPerformance
            agent={agent}
            commissions={commissions}
            language={language}
            onNavigateToEarnings={() => setActiveTab('daily_earnings')}
          />
        )}

        {/* ================= TAB 6: DISPUTE & SUPPORT ================= */}
        {activeTab === 'disputes' && (
          <AgentDisputeSupport
            language={language}
            agent={agent}
          />
        )}
      </main>

      {/* ================= MODAL: FLOAT RECHARGE / SECURITY DEPOSIT ================= */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-teal-500/40 relative my-8">
            <button
              onClick={() => setIsDepositModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">
                  {language === 'bn' ? 'ফ্লোট রিচার্জ ও নিরাপত্তা জামানত জমা' : 'Float Recharge & Security Deposit'}
                </h3>
                <p className="text-[11px] text-teal-400">
                  {language === 'bn' ? 'এজেন্ট সক্রিয়করণ ও কমিশন আনলক' : 'Agent Activation & Commission Float'}
                </p>
              </div>
            </div>

            {/* Provider Selector: bKash, Nagad, Rocket, Bank */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                {language === 'bn' ? 'পেমেন্ট মাধ্যম নির্বাচন করুন:' : 'Select Payment Method:'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProvider('bkash')}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all border ${
                    selectedProvider === 'bkash'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {language === 'bn' ? 'বিকাশ' : 'bKash'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvider('nagad')}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all border ${
                    selectedProvider === 'nagad'
                      ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {language === 'bn' ? 'নগদ' : 'Nagad'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvider('rocket')}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all border ${
                    selectedProvider === 'rocket'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {language === 'bn' ? 'রকেট' : 'Rocket'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvider('bank')}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all border ${
                    selectedProvider === 'bank'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {language === 'bn' ? 'ব্যাংক' : 'Bank'}
                </button>
              </div>
            </div>

            {/* If Bank is Selected: Bank Limit Notice as requested */}
            {selectedProvider === 'bank' ? (
              <div className="p-4 bg-amber-950/60 border border-amber-500/60 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>
                    {language === 'bn'
                      ? 'ব্যাংকের লিমিট শেষ! এই মুহূর্তে পেমেন্ট সম্ভব নয়'
                      : 'Bank daily transfer limit exhausted!'}
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  {language === 'bn'
                    ? mfsConfig.bankNotice.messageBn
                    : 'The bank channel daily settlement quota is currently exhausted. Please switch to bKash, Nagad or Rocket Send Money for immediate activation.'}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('bkash')}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md transition-all text-center"
                  >
                    বিকাশে সেন্ড মানি করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('nagad')}
                    className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl shadow-md transition-all text-center"
                  >
                    নগদে সেন্ড মানি করুন
                  </button>
                </div>
              </div>
            ) : (
              /* MFS Send Money Instruction */
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">
                    {selectedProvider === 'bkash' ? 'বিকাশ' : selectedProvider === 'nagad' ? 'নগদ' : 'রকেট'} {language === 'bn' ? 'সেন্ড মানি নম্বর:' : 'Send Money Number:'}
                  </span>
                  <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                    01739420736
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-black font-mono text-base text-teal-400">
                    {currentSendMoneyNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentSendMoneyNumber)}
                    className="py-1 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    {copiedText === currentSendMoneyNumber ? 'কপি হয়েছে' : 'কপি করুন'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'bn'
                    ? `আপনার ${selectedProvider.toUpperCase()} অ্যাপ থেকে উপরের নম্বরে সেন্ড মানি করে প্রাপ্ত ট্রানজেকশন আইডি (TrxID) নিচে দিন।`
                    : `Send money to the number above and enter your TrxID below.`}
                </p>
              </div>
            )}

            {/* Instant Demo Top-Up Option */}
            <div className="p-3.5 bg-gradient-to-r from-teal-950/60 to-emerald-950/60 border border-teal-500/40 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-teal-300">
                  ⚡ এক ক্লিকে তাত্ক্ষণিক ফ্লোট রিচার্জ (টেস্ট / ডেমো ব্যালেন্স):
                </span>
                <span className="text-[10px] bg-teal-400 text-slate-950 px-2 py-0.5 rounded font-black">
                  তাত্ক্ষণিক যোগ
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                নিচের যেকোনো পরিমাণে চাপলে সাথে সাথে আপনার ফ্লোট ব্যালেন্সে টাকা যুক্ত হয়ে যাবে:
              </p>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[5000, 10000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleInstantSelfTopup(amt)}
                    className="py-1.5 px-2 bg-teal-600/30 hover:bg-teal-600 text-teal-200 hover:text-white rounded-xl text-xs font-mono font-bold border border-teal-500/40 transition-all text-center active:scale-95"
                  >
                    +৳{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Balance Direct Top-Up Notice */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              💡 <strong className="text-slate-300">অ্যাডমিন কন্ট্রোল:</strong> সুপার অ্যাডমিন প্যানেল (<span className="text-rose-400 font-mono">#/admin</span>) এর <strong className="text-teal-300">"এজেন্ট ব্যালেন্স ও ফ্লোট লোড"</strong> ট্যাব থেকেও আপনার এই অ্যাকাউন্টে ({agent.agentPhone}) সরাসরি যেকোনো পরিমাণ ফ্লোট ব্যালেন্স যুক্ত করা সম্ভব।
            </div>

            {/* TrxID Input & Amount */}
            {selectedProvider !== 'bank' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {language === 'bn' ? 'জামানত / ফ্লোট পরিমাণ (টাকা):' : 'Deposit / Float Amount (BDT):'}
                  </label>
                  <select
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold"
                  >
                    <option value={5000}>৳৫,০০০ (সিলভার টিয়ার - দৈনিক ৫০,০০০ টাকা লেনদেন সীমা)</option>
                    <option value={10000}>৳১০,০০০ (গোল্ড টিয়ার - দৈনিক ১,০০,০০০ টাকা লেনদেন সীমা + বোনাস)</option>
                    <option value={15000}>৳১৫,০০০ (ডায়মন্ড টিয়ার - দৈনিক ১,৫০,০০০ টাকা লেনদেন সীমা + বোনাস)</option>
                    <option value={25000}>৳২৫,০০০ (প্লাটিনাম মেগা ভিআইপি - দৈনিক ৩,০০,০০০ টাকা লেনদেন সীমা)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID) *:' : 'Transaction ID (TrxID) *:'}
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                    placeholder="e.g. BK994821A"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold tracking-wider"
                  />
                  {trxError && <p className="text-[10px] text-rose-400 font-bold mt-1">{trxError}</p>}
                </div>

                {depositSuccessMsg && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{depositSuccessMsg}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                  >
                    {language === 'bn' ? 'বন্ধ করুন' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeposit}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'যাচাই ও নিশ্চিত করুন' : 'Verify Deposit'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: MY NID FULL INSPECTION ================= */}
      {isNidInspectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-teal-500/40 relative my-8">
            <button
              onClick={() => setIsNidInspectModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">
                  {language === 'bn' ? 'জমা দেওয়া ভোটার আইডি (NID) কার্ড' : 'Submitted Voter ID (NID)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {agent.agentName} • {activeAgentNid.nidNo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-teal-300 block">১. এনআইডি সম্মুখভাগ (Front)</span>
                <div className="aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md">
                  <img src={activeAgentNid.front} alt="Front" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-teal-300 block">২. এনআইডি পেছনভাগ (Back)</span>
                <div className="aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md">
                  <img src={activeAgentNid.back} alt="Back" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>স্ট্যাটাস: <strong className="text-emerald-400">অনুমোদিত ও ভেরিফায়েড</strong></span>
              <button
                onClick={() => setIsNidInspectModalOpen(false)}
                className="py-1.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CUSTOMER DEPOSIT POLICY ================= */}
      <CustomerDepositPolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        language={language}
        sendMoneyNumber={mfsConfig.bkash.number}
      />

      {/* ================= MODAL: SIM TRANSACTION (CASH IN / CASH OUT) ================= */}
      {simModalType && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-teal-500/40 relative my-8">
            <button
              onClick={() => setSimModalType(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                  simModalType === 'cash_in'
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {simModalType === 'cash_in' ? (
                  <ArrowDownLeft className="w-5 h-5" />
                ) : (
                  <ArrowUpRight className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  {simModalType === 'cash_in'
                    ? language === 'bn'
                      ? 'ক্যাশ ইন (টাকা পাঠান)'
                      : 'Cash In'
                    : language === 'bn'
                    ? 'ক্যাশ আউট (নগদ দিন)'
                    : 'Cash Out'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {language === 'bn'
                    ? `ফ্লোট ব্যালেন্স: ৳${agent.floatBalance.toLocaleString()}`
                    : `Float: ৳${agent.floatBalance.toLocaleString()}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'কাস্টমার মোবাইল নম্বর:' : 'Customer Mobile:'}
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'টাকার পরিমাণ (BDT):' : 'Amount (BDT):'}
                </label>
                <input
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'এজেন্ট পিন নম্বর:' : 'Agent 4-Digit PIN:'}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={agentPin}
                  onChange={(e) => setAgentPin(e.target.value)}
                  placeholder="••••"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold tracking-widest"
                />
              </div>
            </div>

            {simSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{simSuccess}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSimModalType(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSimSubmit}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 active:scale-95 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'লেনদেন নিশ্চিত করুন' : 'Confirm'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: B2B DEALERSHIP BOOKING FOR CLIENT ================= */}
      {bookingProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-teal-500/40 relative my-8">
            <button
              onClick={() => setBookingProduct(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-slate-800 rounded-xl">
                {bookingProduct.imageEmoji}
              </span>
              <div>
                <span className="text-[10px] text-teal-400 font-bold uppercase">
                  {language === 'bn' ? bookingProduct.categoryLabelBn : bookingProduct.categoryLabel}
                </span>
                <h4 className="font-extrabold text-white text-base">
                  {language === 'bn' ? bookingProduct.nameBn : bookingProduct.name}
                </h4>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{language === 'bn' ? 'ডিলারশিপ মূল্য:' : 'Official Price:'}</span>
                <span className="font-bold text-white font-mono">{language === 'bn' ? bookingProduct.priceFormattedBn : bookingProduct.priceFormattedEn}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{language === 'bn' ? 'গ্রাহক বুকিং টোকেন জামানত:' : 'Client Token Booking Deposit:'}</span>
                <span className="font-bold text-amber-400 font-mono">৳{bookingProduct.bookingDepositBDT.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span className="text-teal-300 font-bold">{language === 'bn' ? 'আপনার এজেন্ট কমিশন:' : 'Your Agent Commission:'}</span>
                <span className="font-black text-emerald-400 font-mono">
                  {bookingProduct.agentCommissionRate}% (৳{bookingProduct.agentCommissionBDT.toLocaleString()})
                </span>
              </div>
            </div>

            {/* Quick Deposit Explainer Badge */}
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center justify-between">
              <span>{language === 'bn' ? '✓ ১০০% রিফান্ডেবল ও চূড়ান্ত বিলে সমন্বয়যোগ্য জামানত' : '100% Refundable & Deductible Deposit'}</span>
              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(true)}
                className="underline font-bold text-emerald-200"
              >
                নীতিমালা
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'ক্লায়েন্ট / ক্রেতার নাম:' : 'Client Full Name:'}
                </label>
                <input
                  type="text"
                  value={bookingClientName}
                  onChange={(e) => setBookingClientName(e.target.value)}
                  placeholder="e.g. আলহাজ্ব কবির চৌধুরী"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'ক্লায়েন্টের মোবাইল নম্বর:' : 'Client Mobile:'}
                </label>
                <input
                  type="text"
                  value={bookingClientPhone}
                  onChange={(e) => setBookingClientPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            {bookingSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{bookingSuccessMsg}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBookingProduct(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDealershipBooking}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 active:scale-95 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'ডিলার বুকিং সম্পন্ন করুন' : 'Confirm Deal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Download Center Modal */}
      <AppDownloadCenterModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        language={language}
        defaultApp="agent"
      />

      {/* Official Daraz Work Guidelines & Anti-Betting Income System Modal */}
      <AgentWorkPolicyModal
        isOpen={isWorkPolicyModalOpen}
        onClose={() => setIsWorkPolicyModalOpen(false)}
        language={language}
        sendMoneyNumber={mfsConfig.bkash.number}
        onProceedToDeposit={() => {
          setIsWorkPolicyModalOpen(false);
          if (!isRegisteredAndVerified) {
            setAuthMode('deposit_payment');
          } else {
            setIsDepositModalOpen(true);
          }
        }}
      />

      {/* Real-time Live Customer Order Confirmation Pop-up for Trust */}
      <LiveCustomerOrderToast language={language} />

      {/* Floating Live SMS Toast for Instant Notification */}
      {liveOrderSmsToast && (
        <div className="fixed top-18 right-4 z-50 max-w-sm w-full bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 text-lg">
            💬
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400">লাইভ কাস্টমার এসএমএস</span>
              <button
                type="button"
                onClick={() => setLiveOrderSmsToast(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-200 font-mono leading-relaxed">
              {liveOrderSmsToast}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
