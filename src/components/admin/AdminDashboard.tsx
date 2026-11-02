import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  ShieldAlert,
  Settings,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Sliders,
  Save,
  LogOut,
  RefreshCw,
  Plus,
  Minus,
  Smartphone,
  Eye,
  Ship,
  Car,
  HardHat,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Building2,
  UserCheck,
  Gift,
  PlusCircle,
  MinusCircle,
  History,
  LifeBuoy,
  Download,
  Pencil,
  Trash2,
  Briefcase,
  Upload,
  Image as ImageIcon,
  Zap,
  Tag,
  Star,
  Sparkles,
} from 'lucide-react';
import { AppDownloadCenterModal } from '../common/AppDownloadCenterModal.tsx';
import { HeaderDownloadAppButton } from '../common/HeaderDownloadAppButton.tsx';
import { ManagedUser, KycRequest, SystemFeeConfig } from '../../types/admin.ts';
import { Transaction } from '../../types/wallet.ts';
import {
  AdminActionType,
  AdminAuditLog,
  loadManagedUsers,
  saveManagedUsers,
  loadAuditLogs,
  saveAuditLogs,
} from '../../types/adminControl.ts';
import {
  INITIAL_MANAGED_USERS,
  INITIAL_KYC_REQUESTS,
  INITIAL_FEE_CONFIG,
} from '../../data/adminMockData.ts';
import {
  loadMfsConfig,
  saveMfsConfig,
  MfsSystemConfig,
} from '../../data/mfsConfig.ts';
import {
  AgentKycRecord,
  loadAgentApplications,
  saveAgentApplications,
} from '../../types/agentKyc.ts';
import {
  loadCatalog,
  saveCatalog,
  resetCatalogToDefault,
  formatBDT,
  HIGH_VALUE_CATALOG,
  HighValueProduct,
} from '../../data/highValueProducts.ts';
import {
  loadAgentsList,
  saveAgentsList,
  updateAgentFloat,
  updateAgentBonus,
  updateAgentDailyLimit,
  approvePendingAgent,
} from '../../data/agentStorage.ts';
import { AgentProfile } from '../../types/agentMerchant.ts';

interface AdminDashboardProps {
  language: 'bn' | 'en';
  onExitAdmin?: () => void;
  systemTransactions?: Transaction[];
  onManualBalanceUpdate?: (userPhone: string, amountDiff: number) => void;
  isStandalone?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  onExitAdmin,
  systemTransactions = [],
  onManualBalanceUpdate,
  isStandalone = true,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('uwallet_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'agent_control' | 'mfs_control' | 'agent_kyc' | 'users' | 'links'>('catalog');

  // MFS Control State
  const [mfsConfig, setMfsConfig] = useState<MfsSystemConfig>(loadMfsConfig());
  const [bkashNumberInput, setBkashNumberInput] = useState<string>(mfsConfig.bkash.number);
  const [nagadNumberInput, setNagadNumberInput] = useState<string>(mfsConfig.nagad.number);
  const [rocketNumberInput, setRocketNumberInput] = useState<string>(mfsConfig.rocket.number);
  const [bankNoticeBnInput, setBankNoticeBnInput] = useState<string>(mfsConfig.bankNotice.messageBn);
  const [mfsSavedSuccess, setMfsSavedSuccess] = useState<boolean>(false);

  // Agent NID KYC Applications State
  const [agentApps, setAgentApps] = useState<AgentKycRecord[]>(loadAgentApplications());
  const [selectedKycForReview, setSelectedKycForReview] = useState<AgentKycRecord | null>(null);
  const [inspectImageModal, setInspectImageModal] = useState<{ title: string; url: string } | null>(null);

  // Sync Agent KYC live when an agent submits from Agent Portal
  useEffect(() => {
    const handleKycEvent = () => {
      setAgentApps(loadAgentApplications());
    };
    window.addEventListener('uwallet_agent_applications_updated', handleKycEvent);
    return () => window.removeEventListener('uwallet_agent_applications_updated', handleKycEvent);
  }, []);

  // Catalog State with CRUD and Live Sync
  const [catalogItems, setCatalogItems] = useState<HighValueProduct[]>(() => loadCatalog());
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<HighValueProduct | 'new' | null>(null);
  const [editForm, setEditForm] = useState<{
    id: string;
    name: string;
    nameBn: string;
    brand: string;
    category: HighValueProduct['category'];
    priceBDT: number;
    originalPriceBDT: number;
    depositPct: number;
    agentCommissionRate: number;
    inStock: boolean;
    warrantyBn: string;
    imageEmoji: string;
    imageUrl: string;
    badgeBn: string;
    shortDescriptionBn: string;
    darazRating: number;
    darazReviewsCount: number;
    darazFlashSale: boolean;
    darazFastShipping: boolean;
  }>({
    id: '',
    name: '',
    nameBn: '',
    brand: '',
    category: 'daraz_grooming_electronics',
    priceBDT: 315,
    originalPriceBDT: 2200,
    depositPct: 10,
    agentCommissionRate: 2.1,
    inStock: true,
    warrantyBn: '১ বছর অফিসিয়াল বাংলাদেশ ওয়ারেন্টি',
    imageEmoji: '✂️',
    imageUrl: '',
    badgeBn: 'ফ্ল্যাশ সেল -৮৬%',
    shortDescriptionBn: 'জেনুইন অফিসিয়াল পণ্য ও ১০০% গুণমান নিশ্চিত।',
    darazRating: 4.8,
    darazReviewsCount: 1747,
    darazFlashSale: true,
    darazFastShipping: true,
  });

  // Sync catalog updates
  useEffect(() => {
    const handleCatalogEvent = () => {
      setCatalogItems(loadCatalog());
    };
    window.addEventListener('uwallet_catalog_updated', handleCatalogEvent);
    return () => window.removeEventListener('uwallet_catalog_updated', handleCatalogEvent);
  }, []);

  // Agents Management & Float Balance State
  const [agentsList, setAgentsList] = useState<AgentProfile[]>(() => loadAgentsList());
  const [agentSearch, setAgentSearch] = useState<string>('');
  const [agentBalanceModal, setAgentBalanceModal] = useState<{
    agent: AgentProfile;
    action: 'add' | 'deduct';
  } | null>(null);
  const [agentBalanceAmount, setAgentBalanceAmount] = useState<string>('10000');
  const [agentPaymentChannel, setAgentPaymentChannel] = useState<'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash_office' | 'admin_credit'>('bkash');
  const [agentBalanceNote, setAgentBalanceNote] = useState<string>('');
  const [agentTrxId, setAgentTrxId] = useState<string>('');
  const [newAgentModalOpen, setNewAgentModalOpen] = useState<boolean>(false);
  const [newAgentForm, setNewAgentForm] = useState<{
    agentName: string;
    agentPhone: string;
    outletName: string;
    outletLocation: string;
    initialFloat: number;
    initialDeposit: number;
  }>({
    agentName: '',
    agentPhone: '',
    outletName: '',
    outletLocation: 'ঢাকা উত্তর',
    initialFloat: 25000,
    initialDeposit: 5000,
  });

  // Agent Approval & Permission Controls State
  const [approvingAgent, setApprovingAgent] = useState<AgentProfile | null>(null);
  const [approvalInitialFloat, setApprovalInitialFloat] = useState<string>('10000');
  const [approvalBonus, setApprovalBonus] = useState<string>('2000');
  const [approvalDailyLimit, setApprovalDailyLimit] = useState<string>('50000');

  // Agent Bonus Credit Modal State
  const [bonusAgent, setBonusAgent] = useState<AgentProfile | null>(null);
  const [bonusAmountInput, setBonusAmountInput] = useState<string>('2000');
  const [bonusReasonInput, setBonusReasonInput] = useState<string>('দৈনিক লেনদেন ভলিউম ইনসেন্টিভ বোনাস');

  // Agent Daily Limit Adjustment Modal State
  const [limitAgent, setLimitAgent] = useState<AgentProfile | null>(null);
  const [limitAmountInput, setLimitAmountInput] = useState<string>('50000');

  // Sync Agents updates live
  useEffect(() => {
    const handleAgentsUpdate = () => {
      setAgentsList(loadAgentsList());
    };
    window.addEventListener('uwallet_agents_updated', handleAgentsUpdate);
    window.addEventListener('uwallet_agent_balance_updated', handleAgentsUpdate);
    return () => {
      window.removeEventListener('uwallet_agents_updated', handleAgentsUpdate);
      window.removeEventListener('uwallet_agent_balance_updated', handleAgentsUpdate);
    };
  }, []);

  // Users, Balances & Security Control State
  const [users, setUsers] = useState<ManagedUser[]>(() => loadManagedUsers());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => loadAuditLogs());
  const [searchUser, setSearchUser] = useState<string>('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'frozen'>('all');
  const [usersSubTab, setUsersSubTab] = useState<'list' | 'audit_logs'>('list');

  // Advanced Action Modal State (Deposit, Bonus, Deduct, Lock, Unlock)
  const [actionModalUser, setActionModalUser] = useState<ManagedUser | null>(null);
  const [actionType, setActionType] = useState<AdminActionType>('deposit');
  const [actionAmount, setActionAmount] = useState<string>('');
  const [depositChannel, setDepositChannel] = useState<'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash_office'>('bkash');
  const [bonusCategory, setBonusCategory] = useState<'volume_incentive' | 'welcome_bonus' | 'festival_bonus' | 'special_reward'>('volume_incentive');
  const [deductReason, setDeductReason] = useState<string>('ভুল ট্রানজেকশন প্রত্যাহার / রিভার্সাল');
  const [lockReason, setLockReason] = useState<string>('মোবাইল/সিম কার্ড হারিয়ে গেছে (কাস্টমার জরুরি আবেদন)');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [trxRef, setTrxRef] = useState<string>('');

  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  // Sync users and logs live across components & tabs
  useEffect(() => {
    const handleUsersUpdate = () => {
      setUsers(loadManagedUsers());
    };
    const handleLogsUpdate = () => {
      setAuditLogs(loadAuditLogs());
    };
    window.addEventListener('uwallet_managed_users_updated', handleUsersUpdate);
    window.addEventListener('uwallet_audit_logs_updated', handleLogsUpdate);
    return () => {
      window.removeEventListener('uwallet_managed_users_updated', handleUsersUpdate);
      window.removeEventListener('uwallet_audit_logs_updated', handleLogsUpdate);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Auto fill credentials helper
  const handleAutoFill = () => {
    setAdminEmail('ariyanazim527@gmail.com');
    setAdminPassword('Admin@739420736');
    setAuthError(null);
  };

  // Instant 1-Click Direct Admin Login (Bypass manual typing)
  const handleOneClickDirectLogin = () => {
    setAdminEmail('ariyanazim527@gmail.com');
    setAdminPassword('Admin@739420736');
    setIsAuthenticated(true);
    localStorage.setItem('uwallet_admin_auth', 'true');
    setAuthError(null);
  };

  // Logout Handler
  const handleAdminLogout = () => {
    localStorage.removeItem('uwallet_admin_auth');
    setIsAuthenticated(false);
  };

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validEmails = ['ariyanazim527@gmail.com', 'admin@payflowbd.com'];
    const validPass = 'Admin@739420736';

    if (validEmails.includes(adminEmail.trim().toLowerCase()) && adminPassword === validPass) {
      setIsAuthenticated(true);
      localStorage.setItem('uwallet_admin_auth', 'true');
      setAuthError(null);
    } else {
      setAuthError(
        language === 'bn'
          ? 'ভুল ইমেইল বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।'
          : 'Invalid email or password. Please use registered admin credentials.'
      );
    }
  };

  // Save MFS Config
  const handleSaveMfsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: MfsSystemConfig = {
      ...mfsConfig,
      bkash: { ...mfsConfig.bkash, number: bkashNumberInput.trim() },
      nagad: { ...mfsConfig.nagad, number: nagadNumberInput.trim() },
      rocket: { ...mfsConfig.rocket, number: rocketNumberInput.trim() },
      bankNotice: {
        ...mfsConfig.bankNotice,
        messageBn: bankNoticeBnInput.trim(),
      },
    };

    saveMfsConfig(updated);
    setMfsConfig(updated);
    setMfsSavedSuccess(true);
    triggerToast(language === 'bn' ? 'সেন্ড মানি নম্বর ও ব্যাংক নোটিশ সফলভাবে সংরক্ষিত হয়েছে!' : 'MFS numbers updated successfully!');
    setTimeout(() => setMfsSavedSuccess(false), 3000);
  };

  // KYC Approve / Reject
  const handleApproveAgentKyc = (id: string) => {
    const updated = agentApps.map((a) =>
      a.id === id ? { ...a, status: 'approved' as const, reviewedAt: 'Just now' } : a
    );
    setAgentApps(updated);
    saveAgentApplications(updated);
    setSelectedKycForReview(null);
    triggerToast(language === 'bn' ? 'এজেন্টের NID ও জামানত অনুমোদন করা হয়েছে!' : 'Agent KYC approved!');
  };

  const handleRejectAgentKyc = (id: string) => {
    const updated = agentApps.map((a) =>
      a.id === id ? { ...a, status: 'rejected' as const, reviewedAt: 'Just now' } : a
    );
    setAgentApps(updated);
    saveAgentApplications(updated);
    setSelectedKycForReview(null);
    triggerToast(language === 'bn' ? 'এজেন্টের আবেদন বাতিল করা হয়েছে।' : 'Agent KYC rejected.');
  };

  // Open Action Modal with Preset
  const openActionModal = (user: ManagedUser, type: AdminActionType) => {
    setActionModalUser(user);
    setActionType(type);
    setActionAmount('');
    setActionNotes('');
    setTrxRef('');
    if (type === 'deposit') {
      setActionAmount('5000');
    } else if (type === 'bonus') {
      setActionAmount('1000');
    } else if (type === 'deduct') {
      setActionAmount('500');
    }
  };

  // Execute Deposit, Bonus, Deduct, Lock, or Unlock Action
  const handleExecuteAdminAction = () => {
    if (!actionModalUser) return;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logDate = `Today, ${timeFormatted}`;

    let updatedUsers = [...users];
    let newLog: AdminAuditLog | null = null;

    if (actionType === 'deposit') {
      const num = parseFloat(actionAmount);
      if (!num || num <= 0) {
        alert(language === 'bn' ? 'সঠিক ডিপোজিট পরিমাণ লিখুন' : 'Enter valid deposit amount');
        return;
      }
      updatedUsers = updatedUsers.map((u) =>
        u.id === actionModalUser.id ? { ...u, balance: u.balance + num } : u
      );
      newLog = {
        id: `log-${Date.now()}`,
        actionType: 'deposit',
        targetUserId: actionModalUser.id,
        targetUserName: actionModalUser.name,
        targetUserPhone: actionModalUser.phone,
        amount: num,
        depositChannel,
        reason: `${depositChannel.toUpperCase()} ডিপোজিট${trxRef ? ` (TrxID: ${trxRef})` : ''}${actionNotes ? ` - ${actionNotes}` : ''}`,
        adminEmail: adminEmail || 'ariyanazim527@gmail.com',
        timestamp: logDate,
      };
      if (onManualBalanceUpdate) onManualBalanceUpdate(actionModalUser.phone, num);
      triggerToast(
        language === 'bn'
          ? `৳${num.toLocaleString()} ডিপোজিট সফলভাবে যুক্ত হয়েছে (${actionModalUser.name})!`
          : `Deposit of ৳${num} added to ${actionModalUser.name}`
      );
    } else if (actionType === 'bonus') {
      const num = parseFloat(actionAmount);
      if (!num || num <= 0) {
        alert(language === 'bn' ? 'সঠিক বোনাস পরিমাণ লিখুন' : 'Enter valid bonus amount');
        return;
      }
      updatedUsers = updatedUsers.map((u) =>
        u.id === actionModalUser.id ? { ...u, balance: u.balance + num } : u
      );
      const catLabel =
        bonusCategory === 'volume_incentive'
          ? 'দৈনিক ভলিউম ইনসেন্টিভ বোনাস'
          : bonusCategory === 'welcome_bonus'
          ? 'সাইন-আপ ও জামানত ক্যাশব্যাক'
          : bonusCategory === 'festival_bonus'
          ? 'উৎসব স্পেশাল বোনাস'
          : 'বিশেষ পারফরম্যান্স রিওয়ার্ড';
      newLog = {
        id: `log-${Date.now()}`,
        actionType: 'bonus',
        targetUserId: actionModalUser.id,
        targetUserName: actionModalUser.name,
        targetUserPhone: actionModalUser.phone,
        amount: num,
        bonusCategory,
        reason: `${catLabel}${actionNotes ? `: ${actionNotes}` : ''}`,
        adminEmail: adminEmail || 'ariyanazim527@gmail.com',
        timestamp: logDate,
      };
      if (onManualBalanceUpdate) onManualBalanceUpdate(actionModalUser.phone, num);
      triggerToast(
        language === 'bn'
          ? `৳${num.toLocaleString()} বোনাস সফলভাবে প্রদান করা হয়েছে (${actionModalUser.name})!`
          : `Bonus of ৳${num} credited to ${actionModalUser.name}`
      );
    } else if (actionType === 'deduct') {
      const num = parseFloat(actionAmount);
      if (!num || num <= 0) {
        alert(language === 'bn' ? 'সঠিক কর্তনের পরিমাণ লিখুন' : 'Enter valid deduction amount');
        return;
      }
      if (num > actionModalUser.balance) {
        alert(
          language === 'bn'
            ? `ব্যবহারকারীর বর্তমান ব্যালেন্স ৳${actionModalUser.balance}। এর বেশি কর্তন করা সম্ভব নয়।`
            : `Cannot deduct more than current balance (৳${actionModalUser.balance})`
        );
        return;
      }
      updatedUsers = updatedUsers.map((u) =>
        u.id === actionModalUser.id ? { ...u, balance: Math.max(0, u.balance - num) } : u
      );
      newLog = {
        id: `log-${Date.now()}`,
        actionType: 'deduct',
        targetUserId: actionModalUser.id,
        targetUserName: actionModalUser.name,
        targetUserPhone: actionModalUser.phone,
        amount: num,
        reason: `${deductReason}${actionNotes ? `: ${actionNotes}` : ''}`,
        adminEmail: adminEmail || 'ariyanazim527@gmail.com',
        timestamp: logDate,
      };
      if (onManualBalanceUpdate) onManualBalanceUpdate(actionModalUser.phone, -num);
      triggerToast(
        language === 'bn'
          ? `৳${num.toLocaleString()} ব্যালেন্স কর্তন করা হয়েছে (${actionModalUser.name})!`
          : `Balance deducted by ৳${num} from ${actionModalUser.name}`
      );
    } else if (actionType === 'lock') {
      updatedUsers = updatedUsers.map((u) =>
        u.id === actionModalUser.id ? { ...u, status: 'frozen' as const } : u
      );
      newLog = {
        id: `log-${Date.now()}`,
        actionType: 'lock',
        targetUserId: actionModalUser.id,
        targetUserName: actionModalUser.name,
        targetUserPhone: actionModalUser.phone,
        reason: `${lockReason}${actionNotes ? `: ${actionNotes}` : ''}`,
        adminEmail: adminEmail || 'ariyanazim527@gmail.com',
        timestamp: logDate,
      };
      triggerToast(
        language === 'bn'
          ? `🚨 ${actionModalUser.name} এর অ্যাকাউন্ট সফলভাবে লক/ফ্রিজ করা হয়েছে (নিরাপত্তা নিশ্চিত)!`
          : `Account locked successfully!`
      );
    } else if (actionType === 'unlock') {
      updatedUsers = updatedUsers.map((u) =>
        u.id === actionModalUser.id ? { ...u, status: 'active' as const } : u
      );
      newLog = {
        id: `log-${Date.now()}`,
        actionType: 'unlock',
        targetUserId: actionModalUser.id,
        targetUserName: actionModalUser.name,
        targetUserPhone: actionModalUser.phone,
        reason: actionNotes ? actionNotes : 'যাচাই শেষে পুনরায় অ্যাকাউন্ট সক্রিয় ও আনলক করা হয়েছে',
        adminEmail: adminEmail || 'ariyanazim527@gmail.com',
        timestamp: logDate,
      };
      triggerToast(
        language === 'bn'
          ? `🔓 ${actionModalUser.name} এর অ্যাকাউন্ট সফলভাবে আনলক ও সক্রিয় করা হয়েছে!`
          : `Account unlocked successfully!`
      );
    }

    setUsers(updatedUsers);
    saveManagedUsers(updatedUsers);

    if (newLog) {
      const updatedLogs = [newLog, ...auditLogs];
      setAuditLogs(updatedLogs);
      saveAuditLogs(updatedLogs);
    }

    setActionModalUser(null);
    setActionAmount('');
    setActionNotes('');
    setTrxRef('');
  };

  const DARAZ_SAMPLE_PHOTOS = [
    {
      title: 'ভিন্টেজ টি৯ ট্রিমার',
      url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=600&q=80',
      emoji: '✂️',
      nameBn: 'ভিন্টেজ টি৯ হেয়ার কাটিং মেশিন প্রফেশনাল ট্রিমার',
      nameEn: 'Vintage T9 Hair Cutting Machine Professional Trimmer',
      origPrice: 2200,
      salePrice: 315,
      category: 'daraz_grooming_electronics' as const,
      badge: 'দারাজ ফ্ল্যাশ সেল -৮৬%',
    },
    {
      title: 'গোল্ডেন লাক্সারি ঘড়ি',
      url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
      emoji: '⌚',
      nameBn: 'কারেন লাক্সারি গোল্ডেন ওয়াটারপ্রুফ ওয়াচ',
      nameEn: 'Curren Luxury Golden Waterproof Watch',
      origPrice: 3500,
      salePrice: 1250,
      category: 'daraz_watches' as const,
      badge: 'বেস্টসেলার -৬৪%',
    },
    {
      title: 'অ্যাপল আইফোন ১৬ প্রো',
      url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
      emoji: '📱',
      nameBn: 'অ্যাপল আইফোন ১৬ প্রো ১২৮জিবি ন্যাচারাল টাইটানিয়াম',
      nameEn: 'Apple iPhone 16 Pro 128GB Natural Titanium',
      origPrice: 185000,
      salePrice: 165000,
      category: 'smartphones' as const,
      badge: 'টপ রেটেড ফ্ল্যাগশিপ',
    },
    {
      title: 'ওয়্যারলেস ব্লুটুথ ইয়ারবাডস',
      url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
      emoji: '🎧',
      nameBn: 'এম১০ ট্রু ওয়্যারলেস ব্লুটুথ ৫.৩ ইয়ারবাডস',
      nameEn: 'M10 TWS Bluetooth 5.3 Earbuds LED Display',
      origPrice: 1500,
      salePrice: 420,
      category: 'daraz_grooming_electronics' as const,
      badge: 'ফ্ল্যাশ সেল -৭২%',
    },
    {
      title: 'প্রিমিয়াম সুতি পাঞ্জাবি',
      url: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80',
      emoji: '👔',
      nameBn: 'ডিজাইনার সেমি-ফিটেড সুতি আরামদায়ক পাঞ্জাবি',
      nameEn: 'Designer Semi-Fitted Cotton Men Panjabi',
      origPrice: 3200,
      salePrice: 1350,
      category: 'daraz_mens_fashion' as const,
      badge: 'উৎসব অফার -৫৮%',
    },
  ];

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'bn' ? 'ছবির সাইজ সর্বোচ্চ 5MB হতে পারে।' : 'Image size limit is 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setEditForm((prev) => ({ ...prev, imageUrl: base64 }));
        triggerToast(language === 'bn' ? '📷 ছবি সফলভাবে যুক্ত হয়েছে!' : 'Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (p: HighValueProduct) => {
    setEditingProduct(p);
    const depositPct = Math.round((p.bookingDepositBDT / p.priceBDT) * 100) || 10;
    const origPrice = p.originalPriceBDT || Math.round(p.priceBDT * 1.35);
    setEditForm({
      id: p.id,
      name: p.name,
      nameBn: p.nameBn,
      brand: p.brand || 'Daraz',
      category: p.category,
      priceBDT: p.priceBDT,
      originalPriceBDT: origPrice,
      depositPct: depositPct > 0 ? depositPct : 10,
      agentCommissionRate: p.agentCommissionRate,
      inStock: p.inStock,
      warrantyBn: p.warrantyBn || '১ বছর অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি',
      imageEmoji: p.imageEmoji || '📱',
      imageUrl: p.imageUrl || '',
      badgeBn: p.badgeBn || '',
      shortDescriptionBn: p.shortDescriptionBn || 'জেনুইন অফিসিয়াল পণ্য ও ১০০% গুণমান নিশ্চিত।',
      darazRating: p.darazRating || p.rating || 4.8,
      darazReviewsCount: p.darazReviewsCount || p.reviewsCount || 147,
      darazFlashSale: p.darazFlashSale ?? true,
      darazFastShipping: p.darazFastShipping ?? true,
    });
  };

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    const newId = `EWG-PRD-${Date.now().toString().slice(-4)}`;
    setEditingProduct('new');
    setEditForm({
      id: newId,
      name: 'Vintage T9 Hair Cutting Machine Professional Trimmer',
      nameBn: 'ভিন্টেজ টি৯ হেয়ার কাটিং মেশিন হেয়ার ট্রিমার রিচার্জেবল',
      brand: 'Vintage T9',
      category: 'daraz_grooming_electronics',
      priceBDT: 315,
      originalPriceBDT: 2200,
      depositPct: 10,
      agentCommissionRate: 2.1,
      inStock: true,
      warrantyBn: '১ বছর ওয়ারেন্টি ও ৭ দিনের রিপ্লেসমেন্ট',
      imageEmoji: '✂️',
      imageUrl: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=600&q=80',
      badgeBn: 'দারাজ ফ্ল্যাশ সেল -৮৬%',
      shortDescriptionBn: 'ভিন্টেজ টি৯ ড্রাগন খোদাই করা অল-মেটাল বডি হেয়ার ক্লিপার ও দাড়ি ট্রিমার। ইউএসবি ফাস্ট চার্জিং ও সেলুন ফিনিশ।',
      darazRating: 4.8,
      darazReviewsCount: 1747,
      darazFlashSale: true,
      darazFastShipping: true,
    });
  };

  // Save Product (Create or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.nameBn.trim() || editForm.priceBDT <= 0) {
      alert(language === 'bn' ? 'সঠিক নাম ও মূল্য প্রদান করুন!' : 'Please enter valid name and price!');
      return;
    }

    const price = Number(editForm.priceBDT);
    const origPrice = Number(editForm.originalPriceBDT) || Math.round(price * 1.35);
    const discountPercent = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : undefined;
    const formatted = formatBDT(price);
    const depositPct = editForm.depositPct / 100;
    const bookingDepositBDT = price < 1000 
      ? Math.min(price, Math.max(50, Math.round(price * depositPct)))
      : Math.max(500, Math.round(price * depositPct));
    const agentCommissionBDT = Math.round((price * editForm.agentCommissionRate) / 100);

    const categoryLabels: Record<string, { en: string; bn: string }> = {
      smartphones: { en: 'Smartphones', bn: 'স্মার্টফোন' },
      button_phones: { en: 'Button Phones', bn: 'বাটন ফোন' },
      used_phones: { en: 'Certified Pre-Owned', bn: 'পুরাতন ফোন' },
      laptops_computers: { en: 'Laptops & Computers', bn: 'ল্যাপটপ ও কম্পিউটার' },
      tvs_monitors: { en: 'TVs & Monitors', bn: 'টিভি ও মনিটর' },
      projectors: { en: 'Projectors', bn: 'প্রজেক্টর' },
      refrigerators_appliances: { en: 'Refrigerators & Appliances', bn: 'ফ্রিজ ও হোম অ্যাপ্লায়েন্স' },
      daraz_watches: { en: 'Watches', bn: 'হাতঘড়ি' },
      daraz_grooming_electronics: { en: 'Grooming & Trimmers', bn: 'হেয়ার ট্রিমার ও গ্রুমিং' },
      daraz_mens_fashion: { en: "Men's Fashion", bn: 'ছেলেদের পোশাক' },
      daraz_womens_fashion: { en: "Women's Fashion", bn: 'মেয়েদের পোশাক' },
      luxury_vehicles: { en: 'Luxury Vehicles', bn: 'লাক্সারি গাড়ি ও ডিলারশিপ' },
      ocean_cargo: { en: 'Ocean Cargo Ships', bn: 'মহাসাগরীয় কার্গো জাহাজ' },
      heavy_machinery: { en: 'Heavy Machinery', bn: 'ভারী শিল্প যন্ত্রপাতি' },
    };

    const catLabel = categoryLabels[editForm.category] || { en: 'General', bn: 'সাধারণ' };

    let updatedList = [...catalogItems];

    if (editingProduct === 'new') {
      const newItem: HighValueProduct = {
        id: editForm.id.trim() || `PRD-${Date.now()}`,
        name: editForm.name.trim() || editForm.nameBn.trim(),
        nameBn: editForm.nameBn.trim(),
        brand: editForm.brand.trim() || 'Daraz',
        category: editForm.category,
        categoryLabel: catLabel.en,
        categoryLabelBn: catLabel.bn,
        priceBDT: price,
        originalPriceBDT: origPrice,
        discountPercent,
        imageUrl: editForm.imageUrl.trim() || undefined,
        darazRating: Number(editForm.darazRating) || 4.8,
        darazReviewsCount: Number(editForm.darazReviewsCount) || 120,
        darazFlashSale: editForm.darazFlashSale,
        darazFastShipping: editForm.darazFastShipping,
        priceFormattedBn: formatted.bn,
        priceFormattedEn: formatted.en,
        bookingDepositBDT,
        agentCommissionRate: editForm.agentCommissionRate,
        agentCommissionBDT,
        rating: Number(editForm.darazRating) || 5.0,
        reviewsCount: Number(editForm.darazReviewsCount) || 12,
        imageEmoji: editForm.imageEmoji || '✨',
        badge: editForm.badgeBn,
        badgeBn: editForm.badgeBn,
        specs: {},
        specsBn: {},
        shortDescription: editForm.name,
        shortDescriptionBn: editForm.shortDescriptionBn,
        dealerLocation: 'দারাজ অথোরাইজড ইনভেন্টরি হাব',
        inStock: editForm.inStock,
        warranty: editForm.warrantyBn,
        warrantyBn: editForm.warrantyBn,
      };
      updatedList = [newItem, ...updatedList];
      triggerToast(language === 'bn' ? '✅ নতুন দারাজ প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!' : 'Product added successfully!');
    } else if (editingProduct) {
      updatedList = updatedList.map((item) => {
        if (item.id === editingProduct.id) {
          return {
            ...item,
            name: editForm.name.trim() || editForm.nameBn.trim(),
            nameBn: editForm.nameBn.trim(),
            brand: editForm.brand.trim() || item.brand,
            category: editForm.category,
            categoryLabel: catLabel.en,
            categoryLabelBn: catLabel.bn,
            priceBDT: price,
            originalPriceBDT: origPrice,
            discountPercent,
            imageUrl: editForm.imageUrl.trim() || undefined,
            darazRating: Number(editForm.darazRating) || item.darazRating || 4.8,
            darazReviewsCount: Number(editForm.darazReviewsCount) || item.darazReviewsCount || 120,
            darazFlashSale: editForm.darazFlashSale,
            darazFastShipping: editForm.darazFastShipping,
            priceFormattedBn: formatted.bn,
            priceFormattedEn: formatted.en,
            bookingDepositBDT,
            agentCommissionRate: editForm.agentCommissionRate,
            agentCommissionBDT,
            inStock: editForm.inStock,
            warrantyBn: editForm.warrantyBn,
            imageEmoji: editForm.imageEmoji || item.imageEmoji,
            badgeBn: editForm.badgeBn,
            shortDescriptionBn: editForm.shortDescriptionBn,
          };
        }
        return item;
      });
      triggerToast(language === 'bn' ? '✅ প্রোডাক্ট ও ছবি সফলভাবে সংরক্ষিত হয়েছে!' : 'Product & photo updated successfully!');
    }

    setCatalogItems(updatedList);
    saveCatalog(updatedList);
    setEditingProduct(null);
  };

  // Delete Product
  const handleDeleteProduct = (id: string, nameBn: string) => {
    if (confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে "${nameBn}" প্রোডাক্টটি মুছে ফেলতে চান?` : `Are you sure you want to delete "${nameBn}"?`)) {
      const updatedList = catalogItems.filter((p) => p.id !== id);
      setCatalogItems(updatedList);
      saveCatalog(updatedList);
      triggerToast(language === 'bn' ? '🗑️ প্রোডাক্ট মুছে ফেলা হয়েছে।' : 'Product deleted.');
    }
  };

  // Reset Catalog to Default
  const handleResetCatalog = () => {
    if (confirm(language === 'bn' ? 'আপনি কি আসল ডিফল্ট প্রোডাক্ট ক্যাটালগে ফিরে যেতে চান?' : 'Reset to default product catalog?')) {
      const def = resetCatalogToDefault();
      setCatalogItems(def);
      triggerToast(language === 'bn' ? '🔄 ক্যাটালগ সফলভাবে রিসেট করা হয়েছে।' : 'Catalog reset to default.');
    }
  };

  // Open Agent Balance Modal
  const handleOpenAgentBalanceModal = (agent: AgentProfile, action: 'add' | 'deduct') => {
    setAgentBalanceModal({ agent, action });
    setAgentBalanceAmount('10000');
    setAgentBalanceNote('');
    setAgentTrxId('');
  };

  // Execute Agent Balance Update (Add or Deduct)
  const handleExecuteAgentBalanceAction = () => {
    if (!agentBalanceModal) return;
    const num = parseFloat(agentBalanceAmount);
    if (!num || num <= 0) {
      alert(language === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন!' : 'Please enter valid amount!');
      return;
    }

    const { agent, action } = agentBalanceModal;
    const diff = action === 'add' ? num : -num;

    if (action === 'deduct' && num > agent.floatBalance) {
      alert(language === 'bn' ? `এজেন্টের বর্তমান ফ্লোট ব্যালেন্স ৳${agent.floatBalance.toLocaleString()}। এর বেশি কর্তন সম্ভব নয়!` : 'Cannot deduct more than agent float balance!');
      return;
    }

    const updated = updateAgentFloat(agent.agentPhone, diff);
    setAgentsList(loadAgentsList());

    // Record in Audit Trail
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logDate = `Today, ${timeFormatted}`;
    const newLog: AdminAuditLog = {
      id: `log-agent-${Date.now()}`,
      actionType: action === 'add' ? 'deposit' : 'deduct',
      targetUserId: agent.id,
      targetUserName: `${agent.agentName} (এজেন্ট)`,
      targetUserPhone: agent.agentPhone,
      amount: num,
      depositChannel: agentPaymentChannel === 'admin_credit' ? 'bank' : agentPaymentChannel,
      reason: `${action === 'add' ? 'এজেন্ট ফ্লোট রিচার্জ' : 'এজেন্ট ফ্লোট কর্তন'} (${agentPaymentChannel.toUpperCase()})${agentTrxId ? ` TrxID: ${agentTrxId}` : ''}${agentBalanceNote ? ` - ${agentBalanceNote}` : ''}`,
      adminEmail: adminEmail || 'ariyanazim527@gmail.com',
      timestamp: logDate,
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveAuditLogs(updatedLogs);

    triggerToast(
      language === 'bn'
        ? `৳${num.toLocaleString()} সফলভাবে ${agent.agentName} (${agent.agentPhone}) এর ফ্লোট ব্যালেন্সে ${action === 'add' ? 'যুক্ত' : 'কর্তন'} হয়েছে!`
        : `Agent float updated by ৳${num} for ${agent.agentName}`
    );

    setAgentBalanceModal(null);
  };

  // Toggle Agent Status (Active / Suspended)
  const handleToggleAgentStatus = (agent: AgentProfile) => {
    const newStatus: 'active' | 'suspended' = agent.status === 'active' ? 'suspended' : 'active';
    const updatedList = agentsList.map((a) =>
      a.id === agent.id ? { ...a, status: newStatus } : a
    );
    setAgentsList(updatedList);
    saveAgentsList(updatedList);
    triggerToast(
      language === 'bn'
        ? `${agent.agentName} এর স্ট্যাটাস "${newStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'}" করা হয়েছে!`
        : `Agent status updated to ${newStatus}`
    );
  };

  // Approve Pending Agent (Initial float, bonus, and daily limit)
  const handleConfirmAgentApproval = () => {
    if (!approvingAgent) return;
    const floatNum = parseFloat(approvalInitialFloat) || 0;
    const bonusNum = parseFloat(approvalBonus) || 0;
    const limitNum = parseFloat(approvalDailyLimit) || 50000;

    approvePendingAgent(approvingAgent.agentPhone, floatNum, bonusNum, limitNum);
    setAgentsList(loadAgentsList());
    triggerToast(
      language === 'bn'
        ? `✅ ${approvingAgent.agentName} এর অ্যাকাউন্ট অনুমোদিত হয়েছে! (ফ্লোট: ৳${floatNum.toLocaleString()}, বোনাস: ৳${bonusNum.toLocaleString()}, দৈনিক লিমিট: ৳${limitNum.toLocaleString()})`
        : `Agent approved with ৳${limitNum} limit!`
    );
    setApprovingAgent(null);
  };

  // Add Bonus to Agent
  const handleConfirmAgentBonus = () => {
    if (!bonusAgent) return;
    const num = parseFloat(bonusAmountInput);
    if (!num || num <= 0) {
      alert(language === 'bn' ? 'সঠিক বোনাস পরিমাণ লিখুন' : 'Enter valid bonus');
      return;
    }
    updateAgentBonus(bonusAgent.agentPhone, num);
    setAgentsList(loadAgentsList());
    triggerToast(
      language === 'bn'
        ? `🎁 ৳${num.toLocaleString()} বোনাস ${bonusAgent.agentName} এর অ্যাকাউন্টে সফলভাবে যোগ করা হয়েছে!`
        : `Bonus credited to agent!`
    );
    setBonusAgent(null);
  };

  // Set Agent Daily Limit
  const handleConfirmAgentDailyLimit = () => {
    if (!limitAgent) return;
    const num = parseFloat(limitAmountInput);
    if (!num || num < 1000) {
      alert(language === 'bn' ? 'সঠিক দৈনিক লিমিট লিখুন (সর্বনিম্ন ১,০০০ টাকা)' : 'Enter valid daily limit');
      return;
    }
    updateAgentDailyLimit(limitAgent.agentPhone, num);
    setAgentsList(loadAgentsList());
    triggerToast(
      language === 'bn'
        ? `⚡ ${limitAgent.agentName} এর দৈনিক লেনদেন লিমিট ৳${num.toLocaleString()} নির্ধারণ করা হয়েছে!`
        : `Agent daily limit updated!`
    );
    setLimitAgent(null);
  };

  // Create New Agent
  const handleCreateNewAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentForm.agentName.trim() || !newAgentForm.agentPhone.trim()) {
      alert(language === 'bn' ? 'এজেন্টের নাম ও মোবাইল নম্বর দিন!' : 'Please enter agent name and phone!');
      return;
    }

    const newAgent: AgentProfile = {
      id: `agt-${Date.now().toString().slice(-4)}`,
      agentName: newAgentForm.agentName.trim(),
      agentPhone: newAgentForm.agentPhone.trim(),
      outletName: newAgentForm.outletName.trim() || `${newAgentForm.agentName} আউটলেট`,
      outletLocation: newAgentForm.outletLocation.trim() || 'বাংলাদেশ',
      floatBalance: Number(newAgentForm.initialFloat) || 0,
      securityDeposit: Number(newAgentForm.initialDeposit) || 5000,
      commissionEarnedToday: 0,
      totalCommissionBalance: 0,
      status: 'active',
      activatedAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newAgent, ...agentsList];
    setAgentsList(updated);
    saveAgentsList(updated);
    setNewAgentModalOpen(false);
    setNewAgentForm({
      agentName: '',
      agentPhone: '',
      outletName: '',
      outletLocation: 'ঢাকা উত্তর',
      initialFloat: 25000,
      initialDeposit: 5000,
    });
    triggerToast(language === 'bn' ? '✅ নতুন এজেন্ট সফলভাবে যুক্ত হয়েছে!' : 'New agent added successfully!');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    triggerToast(language === 'bn' ? `${label} লিংক কপি হয়েছে!` : `${label} copied to clipboard!`);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const origin = window.location.origin + window.location.pathname;
  const customerLink = origin + '#/customer';
  const agentLink = origin + '#/agent';
  const adminLink = origin + '#/admin';

  // If not authenticated, render Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white mx-auto shadow-lg ring-4 ring-rose-500/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {language === 'bn' ? 'E-wallet Admin (এ ওয়ালেট অ্যাডমিন)' : 'E-wallet Admin Console'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? 'সিস্টেম সুপার অ্যাডমিন মাস্টার কন্ট্রোল প্যানেল'
                : 'Secure Super-Admin Master Control Portal'}
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {language === 'bn' ? 'অ্যাডমিন জিমেইল (Email)' : 'Admin Email'}
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="ariyanazim527@gmail.com"
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {language === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Admin Password'}
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono tracking-widest"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              {language === 'bn' ? 'লগইন করুন' : 'Sign In as Super Admin'}
            </button>

            <button
              type="button"
              onClick={handleOneClickDirectLogin}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ring-2 ring-emerald-400/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{language === 'bn' ? '⚡ ১-ক্লিকে সরাসরি অ্যাডমিন প্যানেলে প্রবেশ করুন' : '1-Click Direct Admin Access'}</span>
            </button>
          </form>

          {/* Quick Auto-Fill Credentials Helper Box */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">{language === 'bn' ? 'অ্যাডমিন অ্যাকাউন্ট তথ্য:' : 'Admin Credentials:'}</span>
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold hover:bg-rose-500/30 cursor-pointer"
              >
                {language === 'bn' ? 'এক ক্লিকে অটো-ফিল' : 'Auto-Fill Details'}
              </button>
            </div>
            <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
              <div>Email: <strong className="text-white">ariyanazim527@gmail.com</strong></div>
              <div>Password: <strong className="text-white">Admin@739420736</strong></div>
            </div>
          </div>

          {/* Quick App Download Link & Back to Customer View */}
          <div className="pt-1 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-rose-300 rounded-xl border border-slate-700 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '📲 এ ওয়ালেট অ্যাপস ডাউনলোড করুন' : 'Download E-wallet Apps'}</span>
            </button>

            {onExitAdmin && (
              <button
                type="button"
                onClick={onExitAdmin}
                className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition-colors pt-1"
              >
                <span>📱</span>
                <span>{language === 'bn' ? 'কাস্টমার ওয়ালেটে ফিরে যান' : 'Back to Customer Wallet'}</span>
              </button>
            )}
          </div>
        </div>

        <AppDownloadCenterModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          language={language}
          defaultApp="admin"
        />
      </div>
    );
  }

  // Authenticated Admin Dashboard View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* 1. Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight">E-wallet Admin</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                  {language === 'bn' ? 'এ ওয়ালেট অ্যাডমিন' : 'MASTER CONTROL'}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Logged in: ariyanazim527@gmail.com
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeaderDownloadAppButton language={language} variant="admin" />

            <button
              onClick={() => setActiveTab('links')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{language === 'bn' ? 'আলাদা লিঙ্কসমূহ' : 'Isolated App Links'}</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>

            {onExitAdmin && (
              <button
                onClick={onExitAdmin}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 rounded-xl border border-slate-700"
              >
                {language === 'bn' ? 'প্রস্থান' : 'Exit'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-4 z-50 p-3.5 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 2. Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'catalog' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ship className="w-4 h-4 text-amber-300" />
            <span>{language === 'bn' ? 'দারাজ প্রোডাক্ট ও এডিট' : 'Products & Edit'}</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold">
              {catalogItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('agent_control')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'agent_control' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 ring-2 ring-teal-400/30' : 'text-teal-300 hover:text-white bg-teal-950/30 border border-teal-500/30'
            }`}
          >
            <Briefcase className="w-4 h-4 text-teal-300" />
            <span>{language === 'bn' ? 'এজেন্ট ব্যালেন্স ও ফ্লোট লোড' : 'Agent Balance & Float'}</span>
            <span className="text-[10px] bg-teal-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">
              {agentsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mfs_control')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'mfs_control' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{language === 'bn' ? 'সেন্ড মানি নম্বর ও ব্যাংক' : 'MFS Send Money'}</span>
          </button>

          <button
            onClick={() => setActiveTab('agent_kyc')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'agent_kyc' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{language === 'bn' ? 'এজেন্ট NID আবেদন' : 'Agent NID KYC'}</span>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded-full border border-rose-500/30">
              {agentApps.filter((a) => a.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'users' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'bn' ? 'ইউজার খতিয়ান' : 'Users Ledger'}</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'links' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>{language === 'bn' ? 'আলাদা অ্যাপ লিঙ্ক' : 'App Links'}</span>
          </button>
        </div>

        {/* ================= TAB 1: MFS NUMBER MANAGER ================= */}
        {activeTab === 'mfs_control' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {language === 'bn' ? 'লাইভ সেন্ড মানি নম্বর কন্ট্রোল প্যানেল' : 'Live MFS Send Money Numbers'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'bn'
                      ? 'এখান থেকে বিকাশ, নগদ এবং রকেটের সেন্ড মানি নম্বর পরিবর্তন করতে পারবেন। পরিবর্তন করলে তা সরাসরি কাস্টমার এবং এজেন্ট পোর্টালে সাথে সাথে কার্যকর হবে।'
                      : 'Update default Send Money numbers for bKash, Nagad & Rocket in real time.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-teal-400 font-bold block">বর্তমান সক্রিয় নম্বর:</span>
                  <span className="text-base font-black font-mono text-white">
                    {mfsConfig.bkash.number}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveMfsConfig} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* bKash Number */}
                  <div className="p-4 bg-slate-950 border-2 border-[#E2136E]/60 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#E2136E]">bKash (বিকাশ)</span>
                      <span className="text-[10px] bg-[#E2136E]/20 text-[#E2136E] px-2 py-0.5 rounded font-bold">
                        পার্সোনাল
                      </span>
                    </div>
                    <label className="block text-[11px] text-slate-400 font-semibold">
                      {language === 'bn' ? 'সেন্ড মানি নম্বর:' : 'Send Money Number:'}
                    </label>
                    <input
                      type="text"
                      value={bkashNumberInput}
                      onChange={(e) => setBkashNumberInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-[#E2136E]"
                      required
                    />
                    <span className="text-[10px] text-slate-500 block">
                      ডিফল্ট: 01739420736
                    </span>
                  </div>

                  {/* Nagad Number */}
                  <div className="p-4 bg-slate-950 border-2 border-[#F7941D]/60 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#F7941D]">Nagad (নগদ)</span>
                      <span className="text-[10px] bg-[#F7941D]/20 text-[#F7941D] px-2 py-0.5 rounded font-bold">
                        পার্সোনাল
                      </span>
                    </div>
                    <label className="block text-[11px] text-slate-400 font-semibold">
                      {language === 'bn' ? 'সেন্ড মানি নম্বর:' : 'Send Money Number:'}
                    </label>
                    <input
                      type="text"
                      value={nagadNumberInput}
                      onChange={(e) => setNagadNumberInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-[#F7941D]"
                      required
                    />
                    <span className="text-[10px] text-slate-500 block">
                      ডিফল্ট: 01739420736
                    </span>
                  </div>

                  {/* Rocket Number */}
                  <div className="p-4 bg-slate-950 border-2 border-[#8C3494]/60 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#8C3494]">Rocket (রকেট)</span>
                      <span className="text-[10px] bg-[#8C3494]/20 text-[#8C3494] px-2 py-0.5 rounded font-bold">
                        পার্সোনাল
                      </span>
                    </div>
                    <label className="block text-[11px] text-slate-400 font-semibold">
                      {language === 'bn' ? 'সেন্ড মানি নম্বর:' : 'Send Money Number:'}
                    </label>
                    <input
                      type="text"
                      value={rocketNumberInput}
                      onChange={(e) => setRocketNumberInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-[#8C3494]"
                      required
                    />
                    <span className="text-[10px] text-slate-500 block">
                      ডিফল্ট: 01739420736
                    </span>
                  </div>
                </div>

                {/* Bank Limit Exhaustion Message Config */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <label className="block text-xs font-bold text-slate-300">
                      {language === 'bn' ? 'ব্যাংক সিলেক্ট করলে প্রদর্শিত নোটিশ মেসেজ:' : 'Notice when user selects Bank:'}
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    value={bankNoticeBnInput}
                    onChange={(e) => setBankNoticeBnInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 leading-relaxed"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    কাস্টমার বা এজেন্ট যখন ব্যাংকে ক্লিক করবে, তখন এই নোটিশটি দেখাবে যাতে তারা ব্যাংকের পরিবর্তে সরাসরি বিকাশ, নগদ বা রকেটে সেন্ড মানি করে।
                  </span>
                </div>

                {mfsSavedSuccess && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'নম্বরসমূহ সফলভাবে আপডেট হয়েছে এবং সর্বত্র প্রযোজ্য হয়েছে!' : 'All numbers updated and synced!'}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="py-3 px-6 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-95 text-white font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সকল নম্বর ও নোটিশ সংরক্ষণ করুন' : 'Save & Sync Numbers'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 2: AGENT NID PHOTOCOPY KYC REVIEW ================= */}
        {activeTab === 'agent_kyc' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {language === 'bn' ? 'এজেন্ট ভোটার আইডি (NID) ফটোকপি ও জামানত অনুমোদন' : 'Agent Voter ID (NID) KYC Verification'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'bn'
                      ? 'এজেন্টরা রেজিস্ট্রেশন করার সময় জমা দেওয়া ভোটার আইডি কার্ডের সম্মুখভাগ ও পেছনের ফটোকপি যাচাই করে অনুমোদন বা বাতিল করুন।'
                      : 'Review agent submitted NID front and back photocopies, security deposit TrxID, and approve/reject applications.'}
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 bg-slate-800 text-slate-300 rounded-xl border border-slate-700">
                  Total: {agentApps.length}
                </span>
              </div>

              {/* List of KYC applications */}
              <div className="space-y-3">
                {agentApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-white text-sm">{app.agencyName}</h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              app.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : app.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {app.status === 'approved'
                              ? 'অনুমোদিত (Verified)'
                              : app.status === 'rejected'
                              ? 'বাতিলকৃত (Rejected)'
                              : 'অপেক্ষমাণ (Pending Review)'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2 font-mono">
                          <span>প্রোপাইটর: <strong className="text-slate-200">{app.ownerName}</strong></span>
                          <span>•</span>
                          <span>ফোন: <strong className="text-slate-200">{app.phone}</strong></span>
                          <span>•</span>
                          <span>NID: <strong className="text-teal-400">{app.nidNumber}</strong></span>
                          <span>•</span>
                          <span>ট্রেড লাইসেন্স: <strong className="text-slate-200">{app.tradeLicenseNo}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveAgentKyc(app.id)}
                              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>অনুমোদন করুন</span>
                            </button>
                            <button
                              onClick={() => handleRejectAgentKyc(app.id)}
                              className="py-1.5 px-3 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 transition-all flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>বাতিল</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* NID Photocopy Previews */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                      {/* Front NID */}
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                          <span>১. ভোটার আইডি কার্ডের সম্মুখভাগ ফটোকপি:</span>
                          <button
                            type="button"
                            onClick={() => setInspectImageModal({ title: `Front NID - ${app.ownerName}`, url: app.nidFrontPhoto })}
                            className="text-[10px] text-teal-400 hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>বড় করে দেখুন</span>
                          </button>
                        </div>
                        <div
                          onClick={() => setInspectImageModal({ title: `Front NID - ${app.ownerName}`, url: app.nidFrontPhoto })}
                          className="h-28 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 cursor-pointer relative group"
                        >
                          <img
                            src={app.nidFrontPhoto}
                            alt="NID Front"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                            🔍 জুম করুন
                          </div>
                        </div>
                      </div>

                      {/* Back NID */}
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                          <span>২. ভোটার আইডি কার্ডের পেছনের অংশ ফটোকপি:</span>
                          <button
                            type="button"
                            onClick={() => setInspectImageModal({ title: `Back NID - ${app.ownerName}`, url: app.nidBackPhoto })}
                            className="text-[10px] text-teal-400 hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>বড় করে দেখুন</span>
                          </button>
                        </div>
                        <div
                          onClick={() => setInspectImageModal({ title: `Back NID - ${app.ownerName}`, url: app.nidBackPhoto })}
                          className="h-28 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 cursor-pointer relative group"
                        >
                          <img
                            src={app.nidBackPhoto}
                            alt="NID Back"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                            🔍 জুম করুন
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deposit Info */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                      <span>ঠিকানা: {app.outletAddress}</span>
                      <span className="text-amber-400 font-bold">
                        জামানত: ৳{app.securityDepositAmount.toLocaleString()} ({app.depositProvider?.toUpperCase()} TrxID: {app.depositTrxId})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: 200+ HIGH VALUE PRODUCTS MANAGER ================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">
                      {language === 'bn' ? 'বাংলাদেশি অনলাইন প্রোডাক্ট ও গ্যাজেট ইনভেন্টরি' : 'Bangladeshi Products & Gadgets Inventory'}
                    </h3>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold">
                      {catalogItems.length} টি সক্রিয় পণ্য
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'bn'
                      ? 'যেকোনো পণ্যের মূল্য, বুকিং টোকেন, এজেন্ট কমিশন, নাম বা স্টক এডিট করতে ডানপাশের "এডিট" বাটনে চাপুন।'
                      : 'Edit any product price, booking token deposit, agent commission, or stock status.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenAddProduct}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'bn' ? '+ নতুন প্রোডাক্ট যুক্ত করুন' : '+ Add New Product'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetCatalog}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
                    title="আসল ডিফল্ট ক্যাটালগে রিসেট করুন"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
                  </button>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="ব্র্যান্ড, মডেল বা আইডি খুঁজুন..."
                      className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 w-full sm:w-52"
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
                {[
                  { id: 'all', label: 'সকল প্রোডাক্ট' },
                  { id: 'smartphones', label: 'স্মার্টফোন' },
                  { id: 'button_phones', label: 'বাটন ফোন (৳২৫০০+)' },
                  { id: 'used_phones', label: 'পুরাতন ফোন' },
                  { id: 'laptops_computers', label: 'ল্যাপটপ' },
                  { id: 'tvs_monitors', label: 'টিভি ও মনিটর' },
                  { id: 'projectors', label: 'প্রজেক্টর' },
                  { id: 'refrigerators_appliances', label: 'ফ্রিজ ও এসি' },
                  { id: 'luxury_vehicles', label: 'গাড়ি ও ডিলারশিপ' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCatalogCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-[11px] ${
                      catalogCategory === tab.id
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* High Visibility Instruction Banner */}
              <div className="p-3 bg-gradient-to-r from-rose-950/70 via-slate-900 to-indigo-950/70 border-2 border-rose-500/50 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">
                      {language === 'bn' ? '⚡ প্রতিটি প্রোডাক্ট এডিট বা পরিবর্তন করার অপশন চালু আছে!' : 'Direct Product Editing is Active!'}
                    </span>
                    <span className="text-[11px] text-slate-300">
                      {language === 'bn'
                        ? 'নিচের প্রতিটা প্রোডাক্টের নিচে লাল "✏️ এডিট করুন" বাটনে চাপুন। সাথে সাথে মূল্য, কমিশন, স্টক ও নাম পরিবর্তন করার মডাল ওপেন হবে।'
                        : 'Click "Edit" under any product below to update price, stock, name, and commission.'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ নতুন প্রোডাক্ট যোগ করুন</span>
                </button>
              </div>

              {/* Table of products with Edit Action Buttons */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs min-w-[760px]">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">আইটেম ও মডেল (এডিট বাটন সহ)</th>
                      <th className="p-3">ক্যাটাগরি</th>
                      <th className="p-3">মূল্য (BDT)</th>
                      <th className="p-3">বুকিং টোকেন</th>
                      <th className="p-3">এজেন্ট কমিশন</th>
                      <th className="p-3">স্টক অবস্থা</th>
                      <th className="p-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                    {catalogItems
                      .filter((p) => {
                        const matchCat =
                          catalogCategory === 'all' ||
                          p.category === catalogCategory ||
                          (catalogCategory === 'luxury_vehicles' &&
                            (p.category === 'luxury_vehicles' ||
                              p.category === 'ocean_cargo' ||
                              p.category === 'heavy_machinery'));
                        const q = catalogSearch.toLowerCase().trim();
                        const matchQ =
                          !q ||
                          p.name.toLowerCase().includes(q) ||
                          p.nameBn.includes(q) ||
                          p.id.toLowerCase().includes(q) ||
                          p.brand?.toLowerCase().includes(q) ||
                          p.categoryLabel.toLowerCase().includes(q) ||
                          p.categoryLabelBn.includes(q);
                        return matchCat && matchQ;
                      })
                      .map((p) => {
                        const origPrice = p.originalPriceBDT || (p.discountPercent ? Math.round(p.priceBDT / (1 - p.discountPercent / 100)) : undefined);
                        const discountPct = p.discountPercent || (origPrice && origPrice > p.priceBDT ? Math.round(((origPrice - p.priceBDT) / origPrice) * 100) : undefined);
                        return (
                        <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-start gap-3">
                              {p.imageUrl ? (
                                <div className="relative shrink-0">
                                  <img
                                    src={p.imageUrl}
                                    alt={p.nameBn}
                                    className="w-14 h-14 object-cover rounded-xl border border-slate-700 shadow-md bg-slate-950"
                                  />
                                  {p.darazFlashSale && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[9px] font-black px-1 rounded-full shadow-xs">
                                      ⚡
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-2xl shrink-0 p-2 bg-slate-950 rounded-xl border border-slate-800 shadow-inner mt-0.5">
                                  {p.imageEmoji}
                                </span>
                              )}
                              <div className="space-y-1">
                                <div className="font-extrabold text-white text-[13px] leading-tight">
                                  {p.nameBn}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                                  <span className="text-teal-400 font-mono font-bold">{p.id}</span>
                                  <span>•</span>
                                  <span className="text-slate-400">{p.brand}</span>
                                  {p.badgeBn && (
                                    <>
                                      <span>•</span>
                                      <span className="bg-amber-500/20 text-amber-300 px-1 rounded font-bold">
                                        {p.badgeBn}
                                      </span>
                                    </>
                                  )}
                                  {p.darazRating && (
                                    <>
                                      <span>•</span>
                                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                        ★ {p.darazRating} ({p.darazReviewsCount || 100}+)
                                      </span>
                                    </>
                                  )}
                                </div>

                                {/* Unmissable Edit Button right in Column 1 */}
                                <div className="pt-1 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditProduct(p)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs rounded-lg shadow-md transition-all active:scale-95 cursor-pointer ring-2 ring-rose-400/30"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-white" />
                                    <span>✏️ এডিট করুন</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(p.id, p.nameBn)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-[10px] font-bold border border-rose-800/40 transition-all"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="w-3 h-3 text-rose-400" />
                                    <span>মুছুন</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 font-semibold text-[11px]">
                              {p.categoryLabelBn}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-black text-white text-[13px]">
                                ৳{p.priceBDT.toLocaleString()}
                              </span>
                              {origPrice && origPrice > p.priceBDT && (
                                <del className="text-slate-400 text-[10px] line-through font-mono">
                                  ৳{origPrice.toLocaleString()}
                                </del>
                              )}
                              {discountPct && discountPct > 0 && (
                                <span className="bg-orange-600 text-white font-extrabold px-1.5 py-0.2 rounded text-[10px]">
                                  -{discountPct}%
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{p.priceFormattedBn}</div>
                            {p.darazFlashSale && (
                              <span className="inline-flex items-center gap-1 text-[9px] text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded mt-0.5 border border-orange-500/20">
                                ⚡ ফ্ল্যাশ সেল
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold text-amber-400">
                            ৳{p.bookingDepositBDT.toLocaleString()}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            {p.agentCommissionRate}% (৳{p.agentCommissionBDT.toLocaleString()})
                          </td>
                          <td className="p-3">
                            {p.inStock ? (
                              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
                                সক্রিয় স্টক
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-full font-bold">
                                স্টক শেষ
                              </span>
                            )}
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                              {p.warrantyBn}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(p)}
                                className="px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg text-xs font-bold border border-indigo-500/40 transition-all flex items-center gap-1 shadow-xs"
                                title="এডিট করুন"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>এডিট</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id, p.nameBn)}
                                className="p-1.5 bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-xs border border-rose-800/50 transition-all"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: AGENT MANAGEMENT & FLOAT BALANCE CONTROL ================= */}
        {activeTab === 'agent_control' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-5">
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg ring-2 ring-teal-400/30">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">
                        {language === 'bn' ? 'এজেন্ট ম্যানেজমেন্ট ও ফ্লোট ব্যালেন্স কন্ট্রোল সেন্টার' : 'Agent Float & Balance Control Center'}
                      </h3>
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-bold">
                        সরাসরি ক্রেডিট
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {language === 'bn'
                        ? 'অনুমোদিত এজেন্টদের ফ্লোট ব্যালেন্স যুক্ত করুন, কর্তন করুন এবং জামানত তহবিল নিয়ন্ত্রণ করুন। যুক্ত করার সাথে সাথে এজেন্টের অ্যাপে লাইভ যুক্ত হবে।'
                        : 'Credit or adjust agent float balance, monitor security collateral, and manage SIM access in real time.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAgentModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'bn' ? '+ নতুন এজেন্ট যুক্ত করুন' : '+ Add New Agent'}</span>
                  </button>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={agentSearch}
                      onChange={(e) => setAgentSearch(e.target.value)}
                      placeholder="এজেন্ট নাম, ফোন বা আউটলেট..."
                      className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 w-full sm:w-56"
                    />
                  </div>
                </div>
              </div>

              {/* Agent Overview Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">নিবন্ধিত এজেন্ট সংখ্যা</span>
                  <div className="text-xl font-black text-white font-mono">{agentsList.length} জন</div>
                  <span className="text-[10px] text-teal-400 block font-semibold">সক্রিয়: {agentsList.filter(a => a.status === 'active').length} জন</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">মোট ফ্লোট ব্যালেন্স</span>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    ৳{agentsList.reduce((acc, a) => acc + (a.floatBalance || 0), 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400 block">সার্কুলেশন রেডি</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">মোট জামানত ফান্ড</span>
                  <div className="text-xl font-black text-amber-400 font-mono">
                    ৳{agentsList.reduce((acc, a) => acc + (a.securityDeposit || 0), 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-amber-400/80 block">১০০% ক্যাশ সিকিউরড</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">আজকের এজেন্ট কমিশন</span>
                  <div className="text-xl font-black text-teal-300 font-mono">
                    ৳{agentsList.reduce((acc, a) => acc + (a.commissionEarnedToday || 0), 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-teal-400/80 block">লাইভ আর্নিং</span>
                </div>
              </div>

              {/* 🔒 PENDING AGENT REGISTRATION & APPROVAL BANNER */}
              {(() => {
                const pendingAgents = agentsList.filter((a) => a.status === 'pending_approval');
                if (pendingAgents.length === 0) return null;
                return (
                  <div className="p-4 bg-amber-950/70 border-2 border-amber-500 rounded-3xl space-y-3 shadow-2xl animate-in fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                        <h4 className="font-black text-amber-200 text-sm">
                          {language === 'bn'
                            ? `🔔 ${pendingAgents.length} টি নতুন এজেন্ট সাইন-আপ আবেদন অনুমোদনের অপেক্ষায় রয়েছে!`
                            : `${pendingAgents.length} Agent Registrations Pending Approval`}
                        </h4>
                      </div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                        অনুমোদন ব্যতীত এজেন্ট লগইন বন্ধ
                      </span>
                    </div>
                    <div className="space-y-2">
                      {pendingAgents.map((pa) => (
                        <div
                          key={pa.id}
                          className="p-3 bg-slate-950/90 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-white text-xs">{pa.agentName}</span>
                              <span className="font-mono text-teal-400 text-xs">({pa.agentPhone})</span>
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded font-bold">
                                জমাকৃত জামানত: ৳{(pa.depositAmount || pa.securityDeposit || 5000).toLocaleString()}
                              </span>
                              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.2 rounded font-bold font-mono">
                                {pa.depositProvider ? pa.depositProvider.toUpperCase() : 'BKASH'} ({pa.depositTrxId || 'BKL9X872'})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-x-2">
                              <span>আউটলেট: {pa.outletName}</span>
                              <span>• NID: {pa.nidNumber || 'জমাকৃত'}</span>
                              <span>• অনুরোধকৃত দৈনিক লিমিট: <strong className="text-emerald-400 font-mono">৳{(pa.dailyLimit || 50000).toLocaleString()}</strong></span>
                              {pa.depositSenderPhone && <span>• প্রেরক নম্বর: <strong className="text-teal-300 font-mono">{pa.depositSenderPhone}</strong></span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setApprovingAgent(pa);
                              setApprovalInitialFloat('10000');
                              setApprovalBonus('2000');
                              setApprovalDailyLimit(String(pa.dailyLimit || 50000));
                            }}
                            className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>অনুমোদন ও ব্যালেন্স দিন (Approve)</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Agents List Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs min-w-[880px]">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">এজেন্ট ও আউটলেট</th>
                      <th className="p-3">মোবাইল নম্বর</th>
                      <th className="p-3">ফ্লোট ব্যালেন্স</th>
                      <th className="p-3">বোনাস ফান্ড</th>
                      <th className="p-3">দৈনিক লিমিট</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-center">ব্যালেন্স, বোনাস ও লিমিট কন্ট্রোল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                    {agentsList
                      .filter((a) => {
                        const q = agentSearch.toLowerCase().trim();
                        if (!q) return true;
                        return (
                          a.agentName.toLowerCase().includes(q) ||
                          a.agentPhone.includes(q) ||
                          a.outletName.toLowerCase().includes(q) ||
                          a.outletLocation.toLowerCase().includes(q)
                        );
                      })
                      .map((agent) => (
                        <tr key={agent.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3">
                            <div className="font-extrabold text-white text-[13px]">
                              {agent.agentName}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>{agent.outletName}</span>
                              <span>•</span>
                              <span className="text-teal-400 font-mono">{agent.outletLocation}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-white text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                              {agent.agentPhone}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-mono font-black text-emerald-400 text-sm">
                              ৳{agent.floatBalance.toLocaleString()}
                            </div>
                            <span className="text-[10px] text-slate-400">কার্যকরী ফ্লোট</span>
                          </td>
                          <td className="p-3">
                            <div className="font-mono font-bold text-amber-400 text-xs">
                              ৳{(agent.bonusBalance || 0).toLocaleString()}
                            </div>
                            <span className="text-[10px] text-slate-400">বোনাস ফান্ড</span>
                          </td>
                          <td className="p-3">
                            <div className="font-mono font-bold text-teal-300 text-xs">
                              ৳{(agent.dailyLimit || 50000).toLocaleString()}
                            </div>
                            <span className="text-[10px] text-teal-400/80 font-medium">প্রতিদিন</span>
                          </td>
                          <td className="p-3">
                            {agent.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                সক্রিয়
                              </span>
                            ) : agent.status === 'pending_approval' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                                ⏳ অপেক্ষমাণ অনুমোদন
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                <Lock className="w-3 h-3" />
                                স্থগিত / লক
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {agent.status === 'pending_approval' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setApprovingAgent(agent);
                                  setApprovalInitialFloat('10000');
                                  setApprovalBonus('2000');
                                  setApprovalDailyLimit('50000');
                                }}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>অনুমোদন ও ব্যালেন্স দিন</span>
                              </button>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAgentBalanceModal(agent, 'add')}
                                  className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                                  title="ফ্লোট ব্যালেন্স যোগ করুন"
                                >
                                  <PlusCircle className="w-3 h-3" />
                                  <span>+ ব্যালেন্স</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setBonusAgent(agent);
                                    setBonusAmountInput('2000');
                                  }}
                                  className="px-2.5 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 font-bold text-[11px] rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                  title="এজেন্টকে বোনাস দিন"
                                >
                                  <span>🎁 বোনাস</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setLimitAgent(agent);
                                    setLimitAmountInput(String(agent.dailyLimit || 50000));
                                  }}
                                  className="px-2.5 py-1.5 bg-teal-950/60 hover:bg-teal-900 text-teal-300 border border-teal-500/40 font-bold text-[11px] rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                  title="দৈনিক লেনদেন লিমিট পরিবর্তন করুন"
                                >
                                  <span>⚡ লিমিট</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenAgentBalanceModal(agent, 'deduct')}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
                                  title="ব্যালেন্স কর্তন"
                                >
                                  <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleAgentStatus(agent)}
                                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                    agent.status === 'active'
                                      ? 'bg-rose-950/40 text-rose-300 border-rose-800/40 hover:bg-rose-900/60'
                                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/60'
                                  }`}
                                  title={agent.status === 'active' ? 'অ্যাকাউন্ট লক করুন' : 'আনলক করুন'}
                                >
                                  {agent.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ISOLATED APP LINKS (CUSTOMER, AGENT, ADMIN) ================= */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
              <div className="pb-3 border-b border-slate-800 space-y-1">
                <h3 className="text-lg font-black text-white">
                  {language === 'bn' ? 'আলাদা আলাদা ডিরেক্ট অ্যাপ লিংক ও শেয়ারিং' : 'Isolated Standalone App URLs'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'bn'
                    ? 'কাস্টমার, এজেন্ট এবং অ্যাডমিনের লিঙ্ক সম্পূর্ণ আলাদা করা হয়েছে। কাস্টমারকে যখন কাস্টমার লিংক দিবেন, তখন তাদের পেইজে কোনো এজেন্ট বা এডমিন প্যানেলের বাটন থাকবে না।'
                    : 'Customer, Agent, and Admin links are completely isolated. Customer link has ZERO admin or agent buttons.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Customer Link Card */}
                <div className="p-5 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                        📱 কাস্টমার অ্যাপ লিংক
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                        ১০০% নিরাপদ
                      </span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm">
                      {language === 'bn' ? 'সাধারণ গ্রাহকদের জন্য' : 'For General Customers'}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {language === 'bn'
                        ? 'এই লিংকে প্রবেশ করলে কাস্টমার শুধু তার ওয়ালেট ও ২০০+ দামি প্রোডাক্টের শপ দেখতে পারবে। কোনো এজেন্ট বা এডমিন প্যানেল দেখা যাবে না।'
                        : 'Pure customer view with zero agent/admin clutter.'}
                    </p>
                    <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-300 break-all select-all border border-slate-800">
                      {customerLink}
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(customerLink, 'Customer')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    {copiedLink === 'Customer' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink === 'Customer' ? 'কপি সম্পন্ন হয়েছে!' : 'কাস্টমার লিংক কপি করুন'}</span>
                  </button>
                </div>

                {/* 2. Agent Link Card */}
                <div className="p-5 bg-slate-950 border-2 border-teal-500/50 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-teal-400 uppercase tracking-wider">
                        💼 এজেন্ট টার্মিনাল লিংক
                      </span>
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-bold">
                        NID ভেরিফাইড
                      </span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm">
                      {language === 'bn' ? 'অনুমোদিত এজেন্টদের জন্য' : 'For Authorized Agents'}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {language === 'bn'
                        ? 'এই লিংকে এজেন্টরা ভোটার আইডি কার্ডের ফটোকপি জমা দিয়ে রেজিস্ট্রেশন, ফ্লোট রিচার্জ এবং জাহাজ ও গাড়ির মেগা ডিলারশিপ বুকিং করবে।'
                        : 'Dedicated agent SIM terminal with NID photocopy upload and float management.'}
                    </p>
                    <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-teal-300 break-all select-all border border-slate-800">
                      {agentLink}
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(agentLink, 'Agent')}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    {copiedLink === 'Agent' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink === 'Agent' ? 'কপি সম্পন্ন হয়েছে!' : 'এজেন্ট লিংক কপি করুন'}</span>
                  </button>
                </div>

                {/* 3. Admin Link Card */}
                <div className="p-5 bg-slate-950 border-2 border-rose-500/50 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
                        🛡️ অ্যাডমিন কন্ট্রোল লিংক
                      </span>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold">
                        পাসওয়ার্ড প্রটেক্টেড
                      </span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm">
                      {language === 'bn' ? 'সিস্টেম অ্যাডমিন প্যানেল' : 'Super Admin Panel'}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {language === 'bn'
                        ? 'ইমেইল ও পাসওয়ার্ড দিয়ে সংরক্ষিত। এখান থেকে বিকাশ/নগদ/রকেট নম্বর পরিবর্তন ও এজেন্টদের NID ফটোকপি অনুমোদন করা যাবে।'
                        : 'Protected by admin credentials to manage MFS numbers and approve agent NID.'}
                    </p>
                    <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-rose-300 break-all select-all border border-slate-800">
                      {adminLink}
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(adminLink, 'Admin')}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    {copiedLink === 'Admin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink === 'Admin' ? 'কপি সম্পন্ন হয়েছে!' : 'অ্যাডমিন লিংক কপি করুন'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: USERS, DEPOSITS, BONUSES & SECURITY LOCKS ================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Top Control Header with Overview Stats */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950/70 border border-slate-700/80 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg ring-2 ring-rose-500/30">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {language === 'bn' ? 'অ্যাকাউন্ট ও ব্যালেন্স সুপার কন্ট্রোল সেন্টার' : 'Accounts & Balance Super Control Center'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {language === 'bn'
                        ? 'সরাসরি ডিপোজিট যোগ, ইনসেন্টিভ বোনাস প্রদান, ব্যালেন্স কর্তন এবং হারানো মোবাইল অ্যাকাউন্টে তাৎক্ষণিক লক ও আনলক কন্ট্রোল।'
                        : 'Direct deposit credit, volume bonus, balance deduction, and lost account lock/unlock.'}
                    </p>
                  </div>
                </div>

                {/* Sub Tab Switcher: User List vs Audit Trail */}
                <div className="flex p-1 bg-slate-950 border border-slate-700/80 rounded-2xl gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setUsersSubTab('list')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      usersSubTab === 'list'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ইউজার তালিকা ও অ্যাকশন' : 'User Ledger'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsersSubTab('audit_logs')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      usersSubTab === 'audit_logs'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'অ্যাকশন হিস্ট্রি ও অডিট' : 'Audit Logs'}</span>
                    <span className="text-[10px] bg-slate-800 text-rose-300 px-1.5 py-0.2 rounded-full font-mono">
                      {auditLogs.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* 4 Summary Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {language === 'bn' ? 'মোট নিবন্ধিত ইউজার' : 'Total Accounts'}
                  </span>
                  <div className="text-xl font-black text-white font-mono">{users.length} জন</div>
                  <div className="text-[10px] text-slate-400">কাস্টমার ও এজেন্ট</div>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {language === 'bn' ? 'সক্রিয় অ্যাকাউন্ট' : 'Active Accounts'}
                  </span>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {users.filter((u) => u.status === 'active').length} জন
                  </div>
                  <div className="text-[10px] text-emerald-400/80">লেনদেন সক্রিয়</div>
                </div>

                <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-rose-300 font-bold">
                      {language === 'bn' ? '🚨 হারানো ও লকড' : 'Locked / Frozen'}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <div className="text-xl font-black text-rose-400 font-mono">
                    {users.filter((u) => u.status === 'frozen').length} জন
                  </div>
                  <div className="text-[10px] text-rose-300/80">নিরাপত্তা ব্লকেড কার্যকর</div>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[11px] text-teal-300 font-medium">
                    {language === 'bn' ? 'মোট সিস্টেম ব্যালেন্স' : 'Total System Liquidity'}
                  </span>
                  <div className="text-xl font-black text-teal-300 font-mono">
                    ৳{users.reduce((acc, u) => acc + u.balance, 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-teal-400/80">ইউজার ওয়ালেট জমা</div>
                </div>
              </div>
            </div>

            {/* VIEW A: USERS LIST & ADVANCED ACTION BUTTONS */}
            {usersSubTab === 'list' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      placeholder={
                        language === 'bn'
                          ? 'নাম, মোবাইল নম্বর বা NID নম্বর দিয়ে ইউজার খুঁজুন...'
                          : 'Search by user name, phone, or NID...'
                      }
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => setUserStatusFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        userStatusFilter === 'all'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {language === 'bn' ? 'সকল' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserStatusFilter('active')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        userStatusFilter === 'active'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {language === 'bn' ? 'সক্রিয়' : 'Active'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserStatusFilter('frozen')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        userStatusFilter === 'frozen'
                          ? 'bg-rose-600 text-white font-black'
                          : 'text-rose-400 hover:text-white'
                      }`}
                    >
                      {language === 'bn' ? '🚨 হারানো / লকড' : 'Frozen / Locked'}
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">ইউজার ও ফোন</th>
                        <th className="p-3">ভোটার আইডি (NID)</th>
                        <th className="p-3">বর্তমান ব্যালেন্স</th>
                        <th className="p-3">অ্যাকাউন্ট স্ট্যাটাস</th>
                        <th className="p-3 text-right">সুপার অ্যাডমিন অ্যাকশন কন্ট্রোল</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {users
                        .filter((u) => {
                          const matchSearch =
                            !searchUser ||
                            u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                            u.phone.includes(searchUser) ||
                            u.nidNumber.includes(searchUser);
                          const matchStatus =
                            userStatusFilter === 'all' || u.status === userStatusFilter;
                          return matchSearch && matchStatus;
                        })
                        .map((u) => {
                          const isFrozen = u.status === 'frozen';

                          return (
                            <tr
                              key={u.id}
                              className={`hover:bg-slate-800/40 transition-colors ${
                                isFrozen ? 'bg-rose-950/20' : ''
                              }`}
                            >
                              <td className="p-3">
                                <div className="font-bold text-white text-sm">{u.name}</div>
                                <div className="font-mono text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                                  <span>{u.phone}</span>
                                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-normal">
                                    {u.kycDocType}
                                  </span>
                                </div>
                              </td>

                              <td className="p-3 font-mono text-slate-300">
                                <div>{u.nidNumber}</div>
                                <div className="text-[10px] text-slate-500">
                                  মোট {u.totalTransactions} লেনদেন
                                </div>
                              </td>

                              <td className="p-3">
                                <div className="font-mono font-black text-base text-emerald-400">
                                  ৳{u.balance.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {isFrozen ? 'লেনদেন স্থগিত' : 'উত্তোলনযোগ্য'}
                                </div>
                              </td>

                              <td className="p-3">
                                {isFrozen ? (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                                    <span>
                                      {language === 'bn' ? '🔒 হারানো / লকড' : 'Frozen / Locked'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>
                                      {language === 'bn' ? 'সক্রিয় (Active)' : 'Active'}
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Direct Action Control Buttons */}
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  {/* 1. Deposit Add */}
                                  <button
                                    type="button"
                                    onClick={() => openActionModal(u, 'deposit')}
                                    className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 hover:text-white rounded-lg text-xs font-bold border border-emerald-500/40 flex items-center gap-1 transition-all"
                                    title="অ্যাকাউন্টে ডিপোজিট যোগ করুন"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>{language === 'bn' ? '+ ডিপোজিট' : '+ Deposit'}</span>
                                  </button>

                                  {/* 2. Bonus Add */}
                                  <button
                                    type="button"
                                    onClick={() => openActionModal(u, 'bonus')}
                                    className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-800 text-amber-300 hover:text-white rounded-lg text-xs font-bold border border-amber-500/40 flex items-center gap-1 transition-all"
                                    title="ইনসেন্টিভ বা বিশেষ বোনাস প্রদান করুন"
                                  >
                                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{language === 'bn' ? '🎁 বোনাস' : '🎁 Bonus'}</span>
                                  </button>

                                  {/* 3. Balance Deduct */}
                                  <button
                                    type="button"
                                    onClick={() => openActionModal(u, 'deduct')}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1 transition-all"
                                    title="ব্যালেন্স কর্তন বা রিভার্সাল"
                                  >
                                    <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
                                    <span>{language === 'bn' ? '- কর্তন' : '- Deduct'}</span>
                                  </button>

                                  {/* 4. Lost Account Lock / Unlock Toggle */}
                                  {isFrozen ? (
                                    <button
                                      type="button"
                                      onClick={() => openActionModal(u, 'unlock')}
                                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-black shadow-md flex items-center gap-1 transition-all active:scale-95"
                                      title="অ্যাকাউন্ট আনলক করুন"
                                    >
                                      <Unlock className="w-3.5 h-3.5" />
                                      <span>{language === 'bn' ? '🔓 আনলক' : 'Unlock'}</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => openActionModal(u, 'lock')}
                                      className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-bold border border-rose-500/50 flex items-center gap-1 transition-all"
                                      title="মোবাইল হারিয়ে গেলে অ্যাকাউন্ট সাময়িক লক করুন"
                                    >
                                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                                      <span>{language === 'bn' ? '🚨 হারানো লক' : 'Lock Account'}</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW B: AUDIT LOGS & ACTION HISTORY */}
            {usersSubTab === 'audit_logs' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">
                      {language === 'bn' ? 'সুপার অ্যাডমিন অ্যাকশন হিস্ট্রি ও অডিট ট্রেইল' : 'Admin Operations Audit Trail'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {language === 'bn'
                        ? 'সকল ডিপোজিট যোগ, বোনাস প্রদান, ব্যালেন্স কর্তন ও অ্যাকাউন্ট লক/আনলকের পূর্ণাঙ্গ রেকর্ড।'
                        : 'Tamper-evident logs of all balance and security modifications.'}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-xl border border-teal-500/30">
                    {auditLogs.length} Records
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                  {auditLogs.map((log) => {
                    const isDeposit = log.actionType === 'deposit';
                    const isBonus = log.actionType === 'bonus';
                    const isDeduct = log.actionType === 'deduct';
                    const isLock = log.actionType === 'lock';
                    const isUnlock = log.actionType === 'unlock';

                    return (
                      <div
                        key={log.id}
                        className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                          isLock
                            ? 'bg-rose-950/30 border-rose-500/40 text-rose-100'
                            : isUnlock
                            ? 'bg-teal-950/30 border-teal-500/40 text-teal-100'
                            : isBonus
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-100'
                            : isDeposit
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                                isDeposit
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : isBonus
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : isDeduct
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : isLock
                                  ? 'bg-rose-600 text-white font-black'
                                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              }`}
                            >
                              {isDeposit
                                ? `+৳${log.amount?.toLocaleString()} ডিপোজিট`
                                : isBonus
                                ? `+৳${log.amount?.toLocaleString()} বোনাস`
                                : isDeduct
                                ? `-৳${log.amount?.toLocaleString()} ব্যালেন্স কর্তন`
                                : isLock
                                ? '🚨 হারানো অ্যাকাউন্ট লক'
                                : '🔓 অ্যাকাউন্ট আনলক'}
                            </span>

                            <span className="font-bold text-white">
                              {log.targetUserName} ({log.targetUserPhone})
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400 font-mono">
                            {log.timestamp}
                          </span>
                        </div>

                        <div className="text-slate-300 pl-1">
                          <span className="text-slate-400 text-[11px] font-medium">কারণ / বিবরণ:</span>{' '}
                          {log.reason}
                        </div>

                        <div className="text-[10px] text-slate-500 pl-1 font-mono">
                          অপারেটর: {log.adminEmail}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= COMPREHENSIVE ACTION MODAL: DEPOSIT, BONUS, DEDUCT, LOCK, UNLOCK ================= */}
      {actionModalUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-700 shadow-2xl relative my-6">
            <button
              onClick={() => setActionModalUser(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 font-bold"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  actionType === 'deposit'
                    ? 'bg-emerald-600'
                    : actionType === 'bonus'
                    ? 'bg-amber-600'
                    : actionType === 'deduct'
                    ? 'bg-rose-700'
                    : actionType === 'lock'
                    ? 'bg-rose-600 ring-4 ring-rose-500/20'
                    : 'bg-teal-600'
                }`}
              >
                {actionType === 'deposit' && <PlusCircle className="w-6 h-6" />}
                {actionType === 'bonus' && <Gift className="w-6 h-6" />}
                {actionType === 'deduct' && <MinusCircle className="w-6 h-6" />}
                {actionType === 'lock' && <Lock className="w-6 h-6" />}
                {actionType === 'unlock' && <Unlock className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">
                  {actionType === 'deposit' && (language === 'bn' ? 'অ্যাকাউন্টে ডিপোজিট যোগ করুন' : 'Add Deposit to Account')}
                  {actionType === 'bonus' && (language === 'bn' ? 'বিশেষ বোনাস / ইনসেন্টিভ প্রদান' : 'Credit Incentive Bonus')}
                  {actionType === 'deduct' && (language === 'bn' ? 'ব্যালেন্স কর্তন বা রিভার্সাল' : 'Deduct / Reduce Balance')}
                  {actionType === 'lock' && (language === 'bn' ? '🚨 হারানো অ্যাকাউন্ট লক ও ফ্রিজ' : 'Lock / Freeze Lost Account')}
                  {actionType === 'unlock' && (language === 'bn' ? '🔓 অ্যাকাউন্ট আনলক ও পুনরায় সক্রিয়' : 'Unlock Account')}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {actionModalUser.name} • {actionModalUser.phone}
                </p>
              </div>
            </div>

            {/* Target Account Overview Card */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">{language === 'bn' ? 'বর্তমান ব্যালেন্স:' : 'Current Balance:'}</span>
                <span className="font-mono font-black text-white text-base">
                  ৳{actionModalUser.balance.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">{language === 'bn' ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'}</span>
                <span className={`font-bold ${actionModalUser.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {actionModalUser.status === 'active' ? 'সক্রিয় (Active)' : '🔒 লকড (Frozen)'}
                </span>
              </div>
            </div>

            {/* ACTION 1: DEPOSIT ADD */}
            {actionType === 'deposit' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'পেমেন্ট চ্যানেল / মাধ্যম:' : 'Payment Channel:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bkash', 'nagad', 'rocket', 'bank', 'cash_office'] as const).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setDepositChannel(ch)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all capitalize ${
                          depositChannel === ch
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {ch === 'cash_office' ? 'ক্যাশ অফিস' : ch}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'ডিপোজিট পরিমাণ (টাকা):' : 'Deposit Amount (BDT):'}
                  </label>
                  <input
                    type="number"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'ট্রানজেকশন রেফারেন্স ID (ঐচ্ছিক):' : 'Transaction Ref ID (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={trxRef}
                    onChange={(e) => setTrxRef(e.target.value)}
                    placeholder="e.g. 9M882109BK"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>

                {/* Impact Preview */}
                {parseFloat(actionAmount) > 0 && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] font-bold">
                    নতুন ব্যালেন্স হবে: ৳{(actionModalUser.balance + parseFloat(actionAmount)).toLocaleString()} (+৳{parseFloat(actionAmount).toLocaleString()})
                  </div>
                )}
              </div>
            )}

            {/* ACTION 2: BONUS ADD */}
            {actionType === 'bonus' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'বোনাসের বিভাগ / কারণ নির্বাচন করুন:' : 'Bonus Category:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'volume_incentive', labelBn: 'ভলিউম ইনসেন্টিভ (১-১.৪%)', labelEn: 'Volume Incentive' },
                      { id: 'welcome_bonus', labelBn: 'জামানত ক্যাশব্যাক বোনাস', labelEn: 'Welcome/Deposit' },
                      { id: 'festival_bonus', labelBn: 'উৎসব / ঈদ বোনাস', labelEn: 'Festival Bonus' },
                      { id: 'special_reward', labelBn: 'বিশেষ পারফরম্যান্স রিওয়ার্ড', labelEn: 'Special Reward' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setBonusCategory(cat.id as any)}
                        className={`p-2 rounded-xl text-left text-xs font-bold border transition-all ${
                          bonusCategory === cat.id
                            ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {language === 'bn' ? cat.labelBn : cat.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'বোনাস পরিমাণ (টাকা):' : 'Bonus Amount (BDT):'}
                  </label>
                  <input
                    type="number"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder="1000"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'বোনাস নোট / বিবরণ:' : 'Bonus Remarks:'}
                  </label>
                  <input
                    type="text"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder={language === 'bn' ? 'উদা: ১ লক্ষ টাকার ডিলার বিক্রয়ে ইনসেন্টিভ' : 'e.g. Turnover bonus'}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                {parseFloat(actionAmount) > 0 && (
                  <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] font-bold">
                    নতুন ব্যালেন্স হবে: ৳{(actionModalUser.balance + parseFloat(actionAmount)).toLocaleString()} (🎁 +৳{parseFloat(actionAmount).toLocaleString()})
                  </div>
                )}
              </div>
            )}

            {/* ACTION 3: BALANCE DEDUCT */}
            {actionType === 'deduct' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'কর্তনের কারণ:' : 'Deduction Reason:'}
                  </label>
                  <select
                    value={deductReason}
                    onChange={(e) => setDeductReason(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="ভুল ট্রানজেকশন প্রত্যাহার / রিভার্সাল">ভুল ট্রানজেকশন প্রত্যাহার / রিভার্সাল</option>
                    <option value="সিস্টেম চার্জ বা সার্ভিস ফি কর্তন">সিস্টেম চার্জ বা সার্ভিস ফি কর্তন</option>
                    <option value="নিয়ম লঙ্ঘন / পেনাল্টি জরিমানা">নিয়ম লঙ্ঘন / পেনাল্টি জরিমানা</option>
                    <option value="কাস্টমার বিরোধ বা রিফান্ড অ্যাডজাস্টমেন্ট">কাস্টমার বিরোধ বা রিফান্ড অ্যাডজাস্টমেন্ট</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'কর্তনের পরিমাণ (টাকা):' : 'Deduction Amount (BDT):'}
                  </label>
                  <input
                    type="number"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder="500"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'অতিরিক্ত মন্তব্য:' : 'Additional Notes:'}
                  </label>
                  <input
                    type="text"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Audit reason note..."
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                {parseFloat(actionAmount) > 0 && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-[11px] font-bold">
                    নতুন ব্যালেন্স হবে: ৳{Math.max(0, actionModalUser.balance - parseFloat(actionAmount)).toLocaleString()} (-৳{parseFloat(actionAmount).toLocaleString()})
                  </div>
                )}
              </div>
            )}

            {/* ACTION 4: LOCK LOST ACCOUNT */}
            {actionType === 'lock' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-300 font-black">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{language === 'bn' ? 'জরুরি নিরাপত্তা সতর্কতা: অ্যাকাউন্ট লক' : 'Urgent Security Lock'}</span>
                  </div>
                  <p className="text-[11px] text-rose-100/90 leading-relaxed">
                    {language === 'bn'
                      ? 'অ্যাকাউন্ট লক করলে গ্রাহক বা অননুমোদিত কেউ এই অ্যাকাউন্ট থেকে কোনো সেন্ড মানি, ক্যাশ-আউট বা কেনাকাটা করতে পারবে না। তার জমানো টাকা সম্পূর্ণ নিরাপদ থাকবে।'
                      : 'Locking blocks all outgoing transactions and withdrawals immediately.'}
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'লক করার সুনির্দিষ্ট কারণ:' : 'Lock Reason:'}
                  </label>
                  <select
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="মোবাইল/সিম কার্ড হারিয়ে গেছে (কাস্টমার জরুরি আবেদন)">
                      📱 মোবাইল/সিম কার্ড হারিয়ে গেছে (গ্রাহকের জরুরি আবেদন)
                    </option>
                    <option value="সন্দেহজনক জালিয়াতি বা ফ্রড লেনদেনের অভিযোগ">
                      ⚠️ সন্দেহজনক জালিয়াতি বা ফ্রড লেনদেনের অভিযোগ
                    </option>
                    <option value="বারবার ভুল পিন প্রবেশ / অ্যাকাউন্ট সুরক্ষায় অটো-লক">
                      🔒 বারবার ভুল পিন প্রবেশ / অ্যাকাউন্ট সুরক্ষায় অটো-লক
                    </option>
                    <option value="এনআইডি অসঙ্গতি বা অ্যাডমিন তদন্তাধীন স্থগিতাদেশ">
                      📋 এনআইডি অসঙ্গতি বা অ্যাডমিন তদন্তাধীন স্থগিতাদেশ
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'তদন্ত নোট বা বিবরণ:' : 'Investigation Notes:'}
                  </label>
                  <textarea
                    rows={2}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder={language === 'bn' ? 'গ্রাহকের আবেদনের বিস্তারিত বা রেফারেন্স...' : 'Notes...'}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* ACTION 5: UNLOCK ACCOUNT */}
            {actionType === 'unlock' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-teal-950/70 border border-teal-500/50 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-teal-300 font-black">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{language === 'bn' ? 'অ্যাকাউন্ট পুনঃসক্রিয় ও আনলক' : 'Reactivate & Unlock'}</span>
                  </div>
                  <p className="text-[11px] text-teal-100/90 leading-relaxed">
                    {language === 'bn'
                      ? 'গ্রাহকের হারানো সিম পুনরুদ্ধার বা পরিচয় নিশ্চিত হওয়ার পর এই অ্যাকাউন্টটি আনলক করা হচ্ছে। আনলক করার পর গ্রাহক পূর্বের মতোই সকল সেবা ব্যবহার করতে পারবেন।'
                      : 'Unlocking will restore full operational access and transaction ability.'}
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {language === 'bn' ? 'ভেরিফিকেশন ও আনলক নোট:' : 'Verification Remarks:'}
                  </label>
                  <input
                    type="text"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder={language === 'bn' ? 'উদা: এনআইডি ও অল্টারনেট ফোন যাচাই সম্পন্ন' : 'e.g. Identity verified'}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModalUser(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleExecuteAdminAction}
                className={`flex-1 py-2.5 text-white font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 ${
                  actionType === 'deposit'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : actionType === 'bonus'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : actionType === 'deduct'
                    ? 'bg-rose-700 hover:bg-rose-600'
                    : actionType === 'lock'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-teal-600 hover:bg-teal-500'
                }`}
              >
                {actionType === 'deposit' && (language === 'bn' ? 'ডিপোজিট যুক্ত করুন' : 'Confirm Deposit')}
                {actionType === 'bonus' && (language === 'bn' ? 'বোনাস প্রদান করুন' : 'Confirm Bonus')}
                {actionType === 'deduct' && (language === 'bn' ? 'ব্যালেন্স কর্তন করুন' : 'Confirm Deduct')}
                {actionType === 'lock' && (language === 'bn' ? 'নিশ্চিত করে লক করুন' : 'Confirm Lock')}
                {actionType === 'unlock' && (language === 'bn' ? 'নিশ্চিত করে আনলক করুন' : 'Confirm Unlock')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: FULLSCREEN NID PHOTO INSPECTION ================= */}
      {inspectImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-3 relative">
            <button
              onClick={() => setInspectImageModal(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
            >
              ✕
            </button>
            <h4 className="font-extrabold text-white text-sm">{inspectImageModal.title}</h4>
            <div className="rounded-2xl overflow-hidden max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={inspectImageModal.url}
                alt="Enlarged Document"
                className="w-full h-auto max-h-[65vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRODUCT EDIT & ADD (CRUD) ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              {editForm.imageUrl ? (
                <img
                  src={editForm.imageUrl}
                  alt="Product preview"
                  className="w-14 h-14 object-cover rounded-2xl border-2 border-orange-500 shadow-md bg-slate-950 shrink-0"
                />
              ) : (
                <span className="text-3xl p-2 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
                  {editForm.imageEmoji || '📱'}
                </span>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-[10px] rounded uppercase tracking-wider">
                    DARAZ STORE
                  </span>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: <span className="text-teal-400">{editForm.id}</span>
                  </p>
                </div>
                <h3 className="font-black text-white text-base">
                  {editingProduct === 'new'
                    ? language === 'bn'
                      ? 'নতুন দারাজ প্রোডাক্ট যুক্ত করুন (ছবি ও অফার মূল্য সহ)'
                      : 'Add New Daraz Product (With Photo & Offer Price)'
                    : language === 'bn'
                    ? 'দারাজ প্রোডাক্ট তথ্য, ছবি ও মূল্য সম্পাদনা'
                    : 'Edit Product Details & Photo'}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* ================= SECTION 1: PRODUCT PHOTO UPLOAD ================= */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-orange-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-orange-400 font-extrabold text-xs">
                    <ImageIcon className="w-4 h-4 text-orange-400" />
                    <span>প্রোডাক্টের আসল ছবি (Product Photo)</span>
                  </div>
                  {editForm.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, imageUrl: '' })}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>ছবি মুছুন</span>
                    </button>
                  )}
                </div>

                {/* Photo Preview & Upload Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  {/* Preview Box */}
                  <div className="sm:col-span-1 flex flex-col items-center justify-center p-2 bg-slate-900 rounded-xl border border-slate-800 min-h-[110px] relative overflow-hidden group">
                    {editForm.imageUrl ? (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={editForm.imageUrl}
                          alt="Uploaded product"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <span className="absolute bottom-1 right-1 bg-emerald-600/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                          ✓ আপলোডকৃত
                        </span>
                      </div>
                    ) : (
                      <div className="text-center p-2">
                        <Upload className="w-7 h-7 text-slate-500 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-400 block font-medium">কোনো ছবি নেই</span>
                      </div>
                    )}
                  </div>

                  {/* Upload from device / URL buttons */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="cursor-pointer py-2 px-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition-all active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>📷 ফোন বা কম্পিউটার থেকে ছবি আপলোড করুন</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="relative">
                      <input
                        type="url"
                        value={editForm.imageUrl}
                        onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                        placeholder="অথবা ছবির অনলাইন লিঙ্ক (URL) পেস্ট করুন..."
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-[11px] font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 1-Click Daraz Presets */}
                <div className="pt-2 border-t border-slate-900 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    ⚡ দ্রুত দারাজ আইটেমের ছবি ও তথ্য নির্বাচন করুন (১-ক্লিক ডেমো):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DARAZ_SAMPLE_PHOTOS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            nameBn: item.nameBn,
                            name: item.nameEn,
                            imageUrl: item.url,
                            imageEmoji: item.emoji,
                            priceBDT: item.salePrice,
                            originalPriceBDT: item.origPrice,
                            category: item.category,
                            badgeBn: item.badge,
                          });
                          triggerToast(language === 'bn' ? `✓ "${item.title}" সিলেক্ট করা হয়েছে!` : 'Preset applied!');
                        }}
                        className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-orange-500/50 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
                      >
                        <span>{item.emoji}</span>
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ================= SECTION 2: PRODUCT NAMES & CATEGORY ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">প্রোডাক্টের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={editForm.nameBn}
                    onChange={(e) => setEditForm({ ...editForm, nameBn: e.target.value })}
                    placeholder="উদা: ভিন্টেজ টি৯ হেয়ার কাটিং মেশিন"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Product Name (English)</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="e.g. Vintage T9 Hair Clipper Trimmer"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ক্যাটাগরি</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none"
                  >
                    <option value="daraz_grooming_electronics">হেয়ার ট্রিমার ও গ্রুমিং (Trimmers)</option>
                    <option value="daraz_watches">হাতঘড়ি (Watches)</option>
                    <option value="daraz_mens_fashion">ছেলেদের পোশাক</option>
                    <option value="daraz_womens_fashion">মেয়েদের পোশাক</option>
                    <option value="smartphones">স্মার্টফোন (Smartphones)</option>
                    <option value="button_phones">বাটন ফোন (Button Phones)</option>
                    <option value="used_phones">পুরাতন ফোন (Pre-Owned)</option>
                    <option value="laptops_computers">ল্যাপটপ ও কম্পিউটার</option>
                    <option value="tvs_monitors">টিভি ও মনিটর</option>
                    <option value="projectors">প্রজেক্টর</option>
                    <option value="refrigerators_appliances">ফ্রিজ ও এসি</option>
                    <option value="luxury_vehicles">লাক্সারি গাড়ি ও ডিলারশিপ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">ব্র্যান্ড (Brand)</label>
                  <input
                    type="text"
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    placeholder="Vintage T9, Apple, Daraz..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">ইমোজি আইকন</label>
                  <input
                    type="text"
                    value={editForm.imageEmoji}
                    onChange={(e) => setEditForm({ ...editForm, imageEmoji: e.target.value })}
                    placeholder="✂️, 📱, ⌚, 💻..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none text-center text-base"
                  />
                </div>
              </div>

              {/* ================= SECTION 3: DARAZ PRICING & DISCOUNT SYSTEM ================= */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-orange-400" />
                    <span>দারাজ স্টাইল মূল্য ও ডিসকাউন্ট সিস্টেম (Daraz Pricing)</span>
                  </span>
                  {editForm.originalPriceBDT > editForm.priceBDT && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-[11px] rounded-full shadow-xs">
                      🔥 -{Math.round(((editForm.originalPriceBDT - editForm.priceBDT) / editForm.originalPriceBDT) * 100)}% ছাড়
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      পূর্বের মূল দাম (MSRP)
                    </label>
                    <input
                      type="number"
                      min={10}
                      value={editForm.originalPriceBDT}
                      onChange={(e) => setEditForm({ ...editForm, originalPriceBDT: Number(e.target.value) })}
                      placeholder="2200"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 line-through font-mono font-bold text-sm focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">কেটে দেখানো হবে</span>
                  </div>

                  <div>
                    <label className="block text-orange-400 font-bold mb-1">
                      দারাজ অফার মূল্য (BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={editForm.priceBDT}
                      onChange={(e) => setEditForm({ ...editForm, priceBDT: Number(e.target.value) })}
                      placeholder="315"
                      className="w-full p-2.5 bg-slate-900 border-2 border-orange-500/80 rounded-xl text-emerald-400 font-mono font-black text-sm focus:outline-none"
                    />
                    <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">বিক্রয় মূল্য</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">বুকিং জামানত (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={editForm.depositPct}
                      onChange={(e) => setEditForm({ ...editForm, depositPct: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none"
                    />
                    <span className="text-[10px] text-amber-300/80 block mt-0.5">
                      = ৳{Math.max(50, Math.round((editForm.priceBDT * editForm.depositPct) / 100)).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">এজেন্ট কমিশন (%)</label>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      max={50}
                      value={editForm.agentCommissionRate}
                      onChange={(e) => setEditForm({ ...editForm, agentCommissionRate: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-teal-400 font-mono font-bold text-sm focus:outline-none"
                    />
                    <span className="text-[10px] text-teal-300/80 block mt-0.5">
                      = ৳{Math.round((editForm.priceBDT * editForm.agentCommissionRate) / 100).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Savings Summary Banner */}
                {editForm.originalPriceBDT > editForm.priceBDT && (
                  <div className="p-2 bg-orange-950/40 border border-orange-500/30 rounded-xl text-[11px] text-orange-200 flex items-center justify-between">
                    <span>
                      গ্রাহক সাশ্রয় করছেন: <strong>৳{(editForm.originalPriceBDT - editForm.priceBDT).toLocaleString()}</strong>
                    </span>
                    <span className="font-bold text-orange-400">
                      ডিসকাউন্ট: -{Math.round(((editForm.originalPriceBDT - editForm.priceBDT) / editForm.originalPriceBDT) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* ================= SECTION 4: BADGES & RATINGS ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-300 block">দারাজ প্রচারমূলক ব্যাজ</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={editForm.darazFlashSale}
                        onChange={(e) => setEditForm({ ...editForm, darazFlashSale: e.target.checked })}
                        className="rounded accent-orange-600"
                      />
                      <span>⚡ ১০.১০ ফ্ল্যাশ সেল (Flash Sale)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={editForm.darazFastShipping}
                        onChange={(e) => setEditForm({ ...editForm, darazFastShipping: e.target.checked })}
                        className="rounded accent-emerald-600"
                      />
                      <span>🚚 ফাস্ট শিপিং (Fast Shipping)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">স্টার রেটিং (★)</label>
                    <input
                      type="number"
                      step={0.1}
                      min={1}
                      max={5}
                      value={editForm.darazRating}
                      onChange={(e) => setEditForm({ ...editForm, darazRating: Number(e.target.value) })}
                      placeholder="4.8"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-bold text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">রিভিউ সংখ্যা</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.darazReviewsCount}
                      onChange={(e) => setEditForm({ ...editForm, darazReviewsCount: Number(e.target.value) })}
                      placeholder="1747"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">অফিসিয়াল ওয়্যারেন্টি বিবরণ</label>
                  <input
                    type="text"
                    value={editForm.warrantyBn}
                    onChange={(e) => setEditForm({ ...editForm, warrantyBn: e.target.value })}
                    placeholder="১ বছর অফিসিয়াল বাংলাদেশ ওয়ারেন্টি"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">হাইলাইট ব্যাজ (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={editForm.badgeBn}
                    onChange={(e) => setEditForm({ ...editForm, badgeBn: e.target.value })}
                    placeholder="টপ রেটেড, বেস্টসেলার, অফার..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">স্টক স্ট্যাটাস</span>
                  <span className="text-[11px] text-slate-400">
                    {editForm.inStock ? 'গ্রাহক ও এজেন্টরা প্রোডাক্টটি বুকিং করতে পারবে' : 'স্টক শেষ হিসেবে প্রদর্শিত হবে'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, inStock: !editForm.inStock })}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    editForm.inStock ? 'bg-emerald-600 text-white' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {editForm.inStock ? '✓ ইন স্টক (In Stock)' : '✕ স্টক শেষ'}
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 via-rose-600 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct === 'new' ? 'দারাজ প্রোডাক্ট সংরক্ষণ করুন' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: AGENT FLOAT BALANCE CREDIT / DEDUCT ================= */}
      {agentBalanceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-teal-500/50 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              onClick={() => setAgentBalanceModal(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                  agentBalanceModal.action === 'add' ? 'bg-teal-600 shadow-teal-500/20' : 'bg-rose-600'
                }`}
              >
                {agentBalanceModal.action === 'add' ? <PlusCircle className="w-6 h-6" /> : <MinusCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-black text-white text-base">
                  {agentBalanceModal.action === 'add'
                    ? 'এজেন্ট ফ্লোট ব্যালেন্স যুক্ত করুন'
                    : 'এজেন্ট ফ্লোট ব্যালেন্স কর্তন করুন'}
                </h3>
                <p className="text-xs text-slate-400">
                  {agentBalanceModal.agent.agentName} ({agentBalanceModal.agent.agentPhone})
                </p>
              </div>
            </div>

            {/* Current Balance Box */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">বর্তমান কার্যকরী ফ্লোট ব্যালেন্স:</span>
              <span className="text-base font-black font-mono text-emerald-400">
                ৳{agentBalanceModal.agent.floatBalance.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Preset Chips */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">দ্রুত টাকার পরিমাণ নির্বাচন করুন:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[5000, 10000, 25000, 50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAgentBalanceAmount(String(amt))}
                      className={`py-1.5 px-2 rounded-xl font-bold font-mono text-xs border transition-all ${
                        agentBalanceAmount === String(amt)
                          ? 'bg-teal-600 text-white border-teal-400 shadow-xs'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      +৳{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {agentBalanceModal.action === 'add' ? 'টাকার পরিমাণ (BDT) *' : 'কর্তনের পরিমাণ (BDT) *'}
                </label>
                <input
                  type="number"
                  value={agentBalanceAmount}
                  onChange={(e) => setAgentBalanceAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">পেমেন্ট মেথড / মাধ্যম</label>
                <select
                  value={agentPaymentChannel}
                  onChange={(e) => setAgentPaymentChannel(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none"
                >
                  <option value="bkash">বিকাশ (bKash Send Money)</option>
                  <option value="nagad">নগদ (Nagad Send Money)</option>
                  <option value="rocket">রকেট (Rocket)</option>
                  <option value="bank">ব্যাংক ডিপোজিট (Bank Transfer)</option>
                  <option value="cash_office">ক্যাশ অফিস ডিপোজিট</option>
                  <option value="admin_credit">সরাসরি অ্যাডমিন স্পেশাল ক্রেডিট</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ট্রানজেকশন রেফারেন্স / TrxID (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={agentTrxId}
                  onChange={(e) => setAgentTrxId(e.target.value)}
                  placeholder="e.g. BK7729108"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">অ্যাডমিন নোট / মন্তব্য</label>
                <input
                  type="text"
                  value={agentBalanceNote}
                  onChange={(e) => setAgentBalanceNote(e.target.value)}
                  placeholder="উদা: দৈনিক ক্যাশ-ইন ফ্লোট বৃদ্ধি"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAgentBalanceModal(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleExecuteAgentBalanceAction}
                  className={`flex-1 py-3 text-white font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                    agentBalanceModal.action === 'add'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700'
                      : 'bg-rose-700 hover:bg-rose-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{agentBalanceModal.action === 'add' ? 'ব্যালেন্স নিশ্চিত করুন' : 'কর্তন নিশ্চিত করুন'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEW AGENT ONBOARDING ================= */}
      {newAgentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-teal-500/50 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              onClick={() => setNewAgentModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">নতুন অনুমোদিত এজেন্ট যুক্ত করুন</h3>
                <p className="text-xs text-slate-400">এজেন্ট টার্মিনাল এক্সেস ও প্রাথমিক ফ্লোট বরাদ্দ</p>
              </div>
            </div>

            <form onSubmit={handleCreateNewAgent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">এজেন্ট / মালিকের নাম *</label>
                <input
                  type="text"
                  required
                  value={newAgentForm.agentName}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, agentName: e.target.value })}
                  placeholder="উদা: আরিয়ান আজিম"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">এজেন্ট মোবাইল নম্বর (১১ ডিজিট) *</label>
                <input
                  type="text"
                  required
                  value={newAgentForm.agentPhone}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, agentPhone: e.target.value })}
                  placeholder="01739-420736"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">আউটলেট / দোকানের নাম</label>
                  <input
                    type="text"
                    value={newAgentForm.outletName}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, outletName: e.target.value })}
                    placeholder="আজিম টেলিকম"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">এলাকা / লোকেশন</label>
                  <input
                    type="text"
                    value={newAgentForm.outletLocation}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, outletLocation: e.target.value })}
                    placeholder="মিরপুর ১০, ঢাকা"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">প্রাথমিক ফ্লোট ব্যালেন্স (BDT)</label>
                  <input
                    type="number"
                    value={newAgentForm.initialFloat}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, initialFloat: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">জামানত তহবিল (Deposit)</label>
                  <input
                    type="number"
                    value={newAgentForm.initialDeposit}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, initialDeposit: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewAgentModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>এজেন্ট তৈরি করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* App Download Center Modal */}
      <AppDownloadCenterModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        language={language}
        defaultApp="admin"
      />

      {/* ================= MODAL: APPROVE PENDING AGENT & ASSIGN LIMIT ================= */}
      {approvingAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              onClick={() => setApprovingAgent(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">এজেন্ট সাইন-আপ অনুমোদন ও লিমিট সেট</h3>
                <p className="text-xs text-slate-400">অনুমোদন সম্পন্ন হলে এজেন্ট তার অ্যাকাউন্টে ঢুকতে পারবে</p>
              </div>
            </div>

            {/* Agent Summary Card */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">এজেন্টের নাম:</span>
                <span className="font-bold text-white">{approvingAgent.agentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">মোবাইল নম্বর:</span>
                <span className="font-mono font-bold text-teal-400">{approvingAgent.agentPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">দোকান / আউটলেট:</span>
                <span className="text-slate-200">{approvingAgent.outletName} ({approvingAgent.outletLocation})</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1">
                <span className="text-slate-400">জমাকৃত জামানত:</span>
                <span className="font-mono font-black text-amber-400">
                  ৳{(approvingAgent.depositAmount || approvingAgent.securityDeposit || 5000).toLocaleString()} ({approvingAgent.depositProvider?.toUpperCase() || 'BKASH'})
                </span>
              </div>
              {approvingAgent.depositTrxId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">ট্রানজেকশন TrxID:</span>
                  <span className="font-mono font-bold text-emerald-400">{approvingAgent.depositTrxId}</span>
                </div>
              )}
              {approvingAgent.depositSenderPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-400">প্রেরক মোবাইল নম্বর:</span>
                  <span className="font-mono font-bold text-teal-300">{approvingAgent.depositSenderPhone}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  প্রাথমিক ফ্লোট ব্যালেন্স প্রদান (BDT) *
                </label>
                <input
                  type="number"
                  value={approvalInitialFloat}
                  onChange={(e) => setApprovalInitialFloat(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">এজেন্টের অ্যাকাউন্ট ৳০ থেকে শুরু করে এই ব্যালেন্স লোড হবে</span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  স্বাগত বোনাস তহবিল (Welcome Bonus BDT)
                </label>
                <input
                  type="number"
                  value={approvalBonus}
                  onChange={(e) => setApprovalBonus(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  দৈনিক লেনদেন পারমিশন লিমিট (Daily Limit BDT) *
                </label>
                <input
                  type="number"
                  value={approvalDailyLimit}
                  onChange={(e) => setApprovalDailyLimit(e.target.value)}
                  placeholder="50000"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-teal-300 font-mono font-bold text-sm focus:outline-none focus:border-teal-500"
                />
                <span className="text-[10px] text-teal-400/80 mt-0.5 block">কাস্টমার অর্ডারের বিপরীতে ৫০,০০০ টাকা পর্যন্ত স্বয়ংক্রিয় লেনদেন চলবে</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApprovingAgent(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmAgentApproval}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>অনুমোদন ও সেট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREDIT AGENT BONUS ================= */}
      {bonusAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              onClick={() => setBonusAgent(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
                🎁
              </div>
              <div>
                <h3 className="font-black text-white text-base">এজেন্টকে বোনাস প্রদান</h3>
                <p className="text-xs text-slate-400">{bonusAgent.agentName} ({bonusAgent.agentPhone})</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">বোনাস পরিমাণ (BDT) *</label>
                <input
                  type="number"
                  value={bonusAmountInput}
                  onChange={(e) => setBonusAmountInput(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">বোনাসের কারণ / ক্যাটাগরি</label>
                <input
                  type="text"
                  value={bonusReasonInput}
                  onChange={(e) => setBonusReasonInput(e.target.value)}
                  placeholder="উদা: দৈনিক ভলিউম ইনসেন্টিভ বোনাস"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBonusAgent(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmAgentBonus}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🎁 বোনাস ক্রেডিট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SET AGENT DAILY LIMIT ================= */}
      {limitAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border-2 border-teal-500 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              onClick={() => setLimitAgent(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xl border border-teal-500/30">
                ⚡
              </div>
              <div>
                <h3 className="font-black text-white text-base">দৈনিক লেনদেন পারমিশন লিমিট নির্ধারণ</h3>
                <p className="text-xs text-slate-400">{limitAgent.agentName} ({limitAgent.agentPhone})</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">অনুমোদিত দৈনিক লিমিট (BDT) *</label>
                <input
                  type="number"
                  value={limitAmountInput}
                  onChange={(e) => setLimitAmountInput(e.target.value)}
                  placeholder="50000"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-teal-300 font-mono font-bold text-sm focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  কাস্টমাররা যে প্রোডাক্ট অর্ডার দিচ্ছে, তা এই লিমিটের ভেতরে লাইভ যুক্ত থাকবে। ডিফল্ট: ৳৫০,০০০ টাকা।
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLimitAgent(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmAgentDailyLimit}
                className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>⚡ লিমিট সেভ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
