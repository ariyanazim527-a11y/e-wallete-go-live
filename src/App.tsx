/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  History,
  PieChart,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Share2,
  Lock,
  Smartphone,
  Briefcase,
  Sliders,
} from 'lucide-react';
import { WalletHeader } from './components/WalletHeader.tsx';
import { BalanceCard } from './components/BalanceCard.tsx';
import { ActionGrid } from './components/ActionGrid.tsx';
import { TransactionHistory } from './components/TransactionHistory.tsx';
import { VirtualCardView } from './components/VirtualCardView.tsx';
import { SpendingAnalytics } from './components/SpendingAnalytics.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AgentPortal } from './components/agent/AgentPortal.tsx';
import { MerchantPortal } from './components/merchant/MerchantPortal.tsx';
import { StoreView } from './components/shop/StoreView.tsx';
import { CustomerDepositPolicyModal } from './components/shop/CustomerDepositPolicyModal.tsx';
import { Transaction, TransactionType } from './types/wallet.ts';
import { INITIAL_TRANSACTIONS } from './data/walletData.ts';
import { HIGH_VALUE_CATALOG, HighValueProduct } from './data/highValueProducts.ts';
import { loadMfsConfig, MfsSystemConfig } from './data/mfsConfig.ts';
import { loadManagedUsers } from './types/adminControl.ts';

type AppRoute = 'customer' | 'agent' | 'admin' | 'merchant';

// Comprehensive URL route resolver supporting hash (#/admin, #/agent), pathname (/admin, /agent), and search params (?admin, ?route=agent)
function parseAppRoute(): AppRoute {
  try {
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();

    if (hash.includes('admin') || path.endsWith('/admin') || path.includes('/admin/') || search.includes('admin')) {
      return 'admin';
    }
    if (hash.includes('agent') || path.endsWith('/agent') || path.includes('/agent/') || search.includes('agent')) {
      return 'agent';
    }
    if (hash.includes('merchant') || path.endsWith('/merchant') || search.includes('merchant')) {
      return 'merchant';
    }
  } catch (e) {
    console.error(e);
  }
  return 'customer';
}

export default function App() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(parseAppRoute);

  // Customer Wallet State
  const [activeTab, setActiveTab] = useState<'wallet' | 'store' | 'cards' | 'history' | 'analytics'>('wallet');
  const [balance, setBalance] = useState<number>(24850);
  const [rewardPoints, setRewardPoints] = useState<number>(1420);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [mfsConfig, setMfsConfig] = useState<MfsSystemConfig>(loadMfsConfig());
  const [isAccountFrozen, setIsAccountFrozen] = useState<boolean>(false);

  // Sync customer balance & frozen status live when admin deposits, credits bonus, deducts, or locks account
  useEffect(() => {
    const handleManagedUsersUpdate = () => {
      const list = loadManagedUsers();
      const me = list.find((u) => u.phone === '01712-345678');
      if (me) {
        setBalance(me.balance);
        setIsAccountFrozen(me.status === 'frozen');
      }
    };
    handleManagedUsersUpdate();
    window.addEventListener('uwallet_managed_users_updated', handleManagedUsersUpdate);
    return () => window.removeEventListener('uwallet_managed_users_updated', handleManagedUsersUpdate);
  }, []);

  // Customer Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [currentActionType, setCurrentActionType] = useState<TransactionType | 'savings' | 'request' | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bookingProductModal, setBookingProductModal] = useState<HighValueProduct | null>(null);
  const [isCustomerDepositPolicyOpen, setIsCustomerDepositPolicyOpen] = useState<boolean>(false);
  const [bookingSuccessReceipt, setBookingSuccessReceipt] = useState<{
    product: HighValueProduct;
    depositPaid: number;
    trxId: string;
  } | null>(null);

  // Link Copier State
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const userName = 'Ariyan Azim';
  const userPhone = '01712-345678';

  // Listen to both hashchange and popstate for direct link navigation: #/customer, #/agent, #/admin
  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentRoute(parseAppRoute());
    };

    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Listen to MFS Config updates
  useEffect(() => {
    const handleMfsUpdate = () => {
      setMfsConfig(loadMfsConfig());
    };
    window.addEventListener('uwallet_mfs_config_updated', handleMfsUpdate);
    return () => window.removeEventListener('uwallet_mfs_config_updated', handleMfsUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const navigateTo = (route: AppRoute) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
  };

  const handleSelectAction = (action: TransactionType | 'savings' | 'request') => {
    if (isAccountFrozen) {
      showToast(
        language === 'bn'
          ? '⚠️ আপনার অ্যাকাউন্ট সাময়িকভাবে লক/ফ্রিজ করা হয়েছে (হারানো মোবাইল সুরক্ষা)। আনলক করতে সাপোর্ট 01739-420736 এ যোগাযোগ করুন।'
          : '⚠️ Account is temporarily locked for security. Contact admin at 01739-420736.'
      );
      return;
    }
    if (action === 'savings') {
      showToast(language === 'bn' ? 'uWallet মাসিক সঞ্চয় স্কিম (৯% মুনাফা) শুরু হচ্ছে...' : 'Opening uWallet 9% DPS Scheme...');
      return;
    }
    if (action === 'request') {
      setCurrentActionType('send_money');
      setIsTxModalOpen(true);
      return;
    }
    setCurrentActionType(action);
    setIsTxModalOpen(true);
  };

  const handleQuickAction = (action: 'add_money' | 'send_money' | 'qr_scan') => {
    if (isAccountFrozen) {
      showToast(
        language === 'bn'
          ? '⚠️ আপনার অ্যাকাউন্ট সাময়িকভাবে লক/ফ্রিজ করা হয়েছে (হারানো মোবাইল সুরক্ষা)। আনলক করতে সাপোর্ট 01739-420736 এ যোগাযোগ করুন।'
          : '⚠️ Account is temporarily locked for security. Contact admin at 01739-420736.'
      );
      return;
    }
    if (action === 'qr_scan') {
      showToast(language === 'bn' ? 'কিউআর স্ক্যানার প্রস্তুত হচ্ছে...' : 'Opening QR Scanner...');
    } else {
      setCurrentActionType(action);
      setIsTxModalOpen(true);
    }
  };

  const handleCompleteTransaction = (newTx: Transaction, amountDiff: number) => {
    setBalance((prev) => Math.max(0, prev + amountDiff));
    setTransactions((prev) => [newTx, ...prev]);
    if (amountDiff < 0) {
      setRewardPoints((prev) => prev + Math.floor(Math.abs(amountDiff) / 100) * 2);
    }
    showToast(language === 'bn' ? 'লেনদেন সফলভাবে সম্পন্ন হয়েছে!' : 'Transaction completed successfully!');
  };

  // High-Value Dealership Booking from Customer Shop
  const handleConfirmCustomerBooking = (product: HighValueProduct) => {
    const deposit = product.bookingDepositBDT;
    if (balance >= deposit) {
      // Pay from balance
      setBalance((prev) => prev - deposit);
      const newTx: Transaction = {
        id: `book-${Date.now()}`,
        type: 'merchant_pay',
        title: `Booking: ${product.name}`,
        titleBn: `বুকিং টোকেন: ${product.nameBn}`,
        recipientOrSource: 'uWallet Dealership Escrow',
        amount: deposit,
        fee: 0,
        timestamp: 'Just now',
        status: 'completed',
        category: 'shopping',
        referenceId: `DEAL-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      setBookingProductModal(null);
      setBookingSuccessReceipt({
        product,
        depositPaid: deposit,
        trxId: newTx.referenceId || 'DEAL-889120',
      });
      showToast(language === 'bn' ? 'বুকিং টোকেন সফল হয়েছে! কনফার্মেশন রসিদ প্রস্তুত।' : 'Booking token paid successfully!');
    } else {
      // Prompt Send Money to official number 01739420736
      setBookingProductModal(product);
    }
  };

  const copyUrl = (hashRoute: string, label: string) => {
    const url = window.location.origin + window.location.pathname + hashRoute;
    navigator.clipboard.writeText(url);
    setCopiedLinkType(label);
    showToast(language === 'bn' ? `${label} লিংক কপি হয়েছে!` : `${label} URL copied to clipboard!`);
    setTimeout(() => setCopiedLinkType(null), 2500);
  };

  const originUrl = window.location.origin + window.location.pathname;

  // ================= 1. ROUTE: STANDALONE AGENT PORTAL =================
  if (currentRoute === 'agent') {
    return (
      <AgentPortal
        language={language}
        onExitPortal={() => navigateTo('customer')}
        isStandalone={true}
      />
    );
  }

  // ================= 2. ROUTE: STANDALONE ADMIN CONSOLE =================
  if (currentRoute === 'admin') {
    return (
      <AdminDashboard
        language={language}
        onExitAdmin={() => navigateTo('customer')}
        systemTransactions={transactions}
        isStandalone={true}
      />
    );
  }

  // ================= 3. ROUTE: STANDALONE MERCHANT =================
  if (currentRoute === 'merchant') {
    return (
      <MerchantPortal
        language={language}
        onExitPortal={() => navigateTo('customer')}
      />
    );
  }

  // ================= 4. ROUTE: STANDALONE CUSTOMER APP (NO ADMIN/AGENT LINKS!) =================
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans pb-20 md:pb-10 selection:bg-rose-100 selection:text-rose-900">
      {/* Discreet App Owner Route Switcher Bar (Only visible when user toggles or for owner preview) */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-3 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">
            {language === 'bn' ? 'কাস্টমার ভিউ (গ্রাহকদের জন্য সম্পূর্ণ পৃথক লিংক)' : 'Customer App View (Isolated)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded font-bold flex items-center gap-1 transition-all"
          >
            <Share2 className="w-3 h-3" />
            <span>{language === 'bn' ? 'আলাদা আলাদা লিংক কপি করুন' : 'Copy Isolated Links'}</span>
          </button>
          <button
            onClick={() => navigateTo('agent')}
            className="px-2 py-0.5 bg-teal-900/60 hover:bg-teal-800 text-teal-300 rounded font-bold transition-all"
          >
            {language === 'bn' ? 'এজেন্ট অ্যাপ' : 'Agent App'}
          </button>
          <button
            onClick={() => navigateTo('admin')}
            className="px-2 py-0.5 bg-rose-900/60 hover:bg-rose-800 text-rose-300 rounded font-bold transition-all"
          >
            {language === 'bn' ? 'অ্যাডমিন অ্যাপ' : 'Admin App'}
          </button>
        </div>
      </div>

      {/* 1. Wallet Top Navigation Bar (CLEAN FOR CUSTOMERS, NO ADMIN/AGENT BUTTONS) */}
      <WalletHeader
        language={language}
        onToggleLanguage={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
        userName={userName}
        userPhone={userPhone}
        showAdminAndAgentLinks={false}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-4 z-50 p-3.5 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 space-y-4">
        {/* Security Frozen Banner if Admin Locked Account for Lost Phone */}
        {isAccountFrozen && (
          <div className="bg-rose-950/95 border-2 border-rose-500 rounded-3xl p-5 shadow-2xl flex items-start gap-3.5 animate-in fade-in text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg ring-4 ring-rose-500/20">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-rose-200 text-sm">
                  {language === 'bn' ? '⚠️ আপনার অ্যাকাউন্ট সাময়িকভাবে লক/ফ্রিজ করা হয়েছে' : '⚠️ Account Temporarily Locked'}
                </h4>
                <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  হারানো মোবাইল সুরক্ষা
                </span>
              </div>
              <p className="text-xs text-rose-100/90 leading-relaxed">
                {language === 'bn'
                  ? `আপনার মোবাইল বা সিম কার্ড হারানোর আবেদনের পরিপ্রেক্ষিতে সুরক্ষা নিশ্চিত করতে সেন্ট্রাল অ্যাডমিন প্যানেল থেকে এই অ্যাকাউন্টটি ফ্রিজ করা হয়েছে। আপনার জমানো অর্থ (৳${balance.toLocaleString()}) সম্পূর্ণ নিরাপদ। পুনরায় আনলক করতে অ্যাডমিন হটলাইন 01739-420736 নম্বরে যোগাযোগ করুন।`
                  : `This account was locked by the admin for lost device security. Your balance (৳${balance.toLocaleString()}) is 100% secure. Contact admin at 01739-420736 to unlock.`}
              </p>
            </div>
          </div>
        )}
        {/* Navigation Tabs (Desktop & Tablet Pill Bar) */}
        <div className="hidden md:flex items-center justify-between p-1.5 bg-slate-200/60 rounded-2xl">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'wallet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4 text-rose-600" />
            <span>{language === 'bn' ? 'ওয়ালেট' : 'Wallet Home'}</span>
          </button>

          {/* Store Tab with Daraz Online Shop */}
          <button
            onClick={() => setActiveTab('store')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'store' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-orange-600" />
            <span>{language === 'bn' ? 'দারাজ অনলাইন শপ' : 'Daraz Online Shop'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>{language === 'bn' ? 'ডিজিটাল কার্ড' : 'Virtual Card'}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? 'স্টেটমেন্ট' : 'History'}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4 text-amber-600" />
            <span>{language === 'bn' ? 'হিসাব ও বাজেট' : 'Analytics'}</span>
          </button>
        </div>

        {/* ================= TAB 1: WALLET HOME ================= */}
        {activeTab === 'wallet' && (
          <div className="space-y-4">
            {/* Balance Card */}
            <BalanceCard
              balance={balance}
              points={rewardPoints}
              language={language}
              onQuickAction={handleQuickAction}
            />

            {/* Quick 200+ Dealership Products Teaser Card */}
            <div
              onClick={() => setActiveTab('store')}
              className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-4 md:p-5 text-white flex items-center justify-between cursor-pointer hover:shadow-lg transition-all border border-indigo-900/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 bg-white/10 rounded-2xl">
                  🚢
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full uppercase">
                      ২০০+ প্রোডাক্ট
                    </span>
                    <span className="text-xs text-indigo-300 font-bold">
                      {language === 'bn' ? 'ডিলারশিপ মার্কেটপ্লেস' : 'Dealership Marketplace'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm md:text-base text-white mt-0.5">
                    {language === 'bn'
                      ? 'মোবাইল, প্রাডো গাড়ি ও সমুদ্র কন্টেইনার জাহাজ ডিলারশিপ'
                      : 'Flagship Mobiles, Prado Cars & Container Ships'}
                  </h4>
                  <span className="text-[11px] text-slate-300">
                    {language === 'bn' ? 'ক্যাটালগ দেখতে ও বুকিং করতে এখানে ক্লিক করুন' : 'Click to explore 200+ verified luxury items'}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-indigo-300 shrink-0" />
            </div>

            {/* Main Action Grid (Send Money, Cash In, Bill Pay) */}
            <ActionGrid language={language} onSelectAction={handleSelectAction} />

            {/* Recent Statement Section */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}
                </h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  {language === 'bn' ? 'সব দেখুন' : 'View All'}
                </button>
              </div>
              <TransactionHistory
                transactions={transactions.slice(0, 5)}
                language={language}
                onSelectTransaction={(tx) => setSelectedReceipt(tx)}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 2: 200+ LUXURY & DEALERSHIP STORE ================= */}
        {activeTab === 'store' && (
          <StoreView
            language={language}
            userBalance={balance}
            onBuyProduct={(prod) => handleConfirmCustomerBooking(prod)}
            onOpenBookingModal={(prod) => setBookingProductModal(prod)}
          />
        )}

        {/* ================= TAB 3: VIRTUAL CARD ================= */}
        {activeTab === 'cards' && (
          <VirtualCardView
            userName={userName}
            balance={balance}
            language={language}
          />
        )}

        {/* ================= TAB 4: HISTORY ================= */}
        {activeTab === 'history' && (
          <TransactionHistory
            transactions={transactions}
            language={language}
            onSelectTransaction={(tx) => setSelectedReceipt(tx)}
          />
        )}

        {/* ================= TAB 5: ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <SpendingAnalytics transactions={transactions} language={language} />
        )}
      </main>

      {/* 3. Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 md:hidden flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'wallet' ? 'text-rose-600 scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-bold">{language === 'bn' ? 'ওয়ালেট' : 'Wallet'}</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'store' ? 'text-orange-600 scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-bold">{language === 'bn' ? 'দারাজ শপ' : 'Daraz'}</span>
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'cards' ? 'text-purple-600 scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] font-bold">{language === 'bn' ? 'কার্ড' : 'Card'}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'history' ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-bold">{language === 'bn' ? 'স্টেটমেন্ট' : 'History'}</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'analytics' ? 'text-amber-600 scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] font-bold">{language === 'bn' ? 'হিসাব' : 'Analytics'}</span>
        </button>
      </nav>

      {/* ================= MODAL: TRANSACTION MODAL (SEND MONEY, CASH IN, BILL PAY) ================= */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        actionType={currentActionType}
        currentBalance={balance}
        language={language}
        onCompleteTransaction={handleCompleteTransaction}
      />

      {/* ================= MODAL: TRANSACTION RECEIPT ================= */}
      {selectedReceipt && (
        <ReceiptModal
          transaction={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          language={language}
        />
      )}

      {/* ================= MODAL: HIGH-VALUE DEALERSHIP BOOKING MODAL ================= */}
      {bookingProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setBookingProductModal(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <span className="text-3xl p-2.5 bg-slate-100 rounded-2xl">
                {bookingProductModal.imageEmoji}
              </span>
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                  {language === 'bn' ? bookingProductModal.categoryLabelBn : bookingProductModal.categoryLabel}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  {language === 'bn' ? bookingProductModal.nameBn : bookingProductModal.name}
                </h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{language === 'bn' ? 'অফিসিয়াল মূল্য:' : 'Official Price:'}</span>
                <span className="font-black text-slate-900 font-mono text-sm">
                  {language === 'bn' ? bookingProductModal.priceFormattedBn : bookingProductModal.priceFormattedEn}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-800">{language === 'bn' ? 'বুকিং টোকেন জামানত:' : 'Token Booking Deposit:'}</span>
                <span className="font-black text-rose-600 font-mono text-sm">
                  ৳{bookingProductModal.bookingDepositBDT.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Customer Deposit Policy & Escrow Guarantee Highlight */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  {language === 'bn' ? 'জামানতের ভিত্তি ও ১০০% রিফান্ড গ্যারান্টি:' : 'Deposit Basis & Escrow Safety:'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomerDepositPolicyOpen(true)}
                  className="text-[11px] text-emerald-800 font-black underline hover:text-emerald-900"
                >
                  {language === 'bn' ? 'বিস্তারিত নীতিমালা' : 'View Policy'}
                </button>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                {language === 'bn'
                  ? 'এই জামানতের টাকা কোনো অতিরিক্ত ফি বা চার্জ নয়। ডেলিভারির সময় মোট মূল্য থেকে বাদ যাবে। ডেলিভারি পূর্বে বাতিল করতে চাইলে কোনো কর্তন ছাড়াই সম্পূর্ণ টাকা ২৪ ঘণ্টার মধ্যে ফেরতযোগ্য।'
                  : '100% of the deposit is deducted from your final bill at delivery, and 100% refundable within 24 hours prior to delivery.'}
              </p>
            </div>

            {/* Payment instructions with Send Money Number 01739420736 */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-950">
                  {language === 'bn' ? 'অফিসিয়াল সেন্ড মানি নম্বর (বিকাশ / নগদ / রকেট):' : 'Official Send Money Number:'}
                </span>
                <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-bold">
                  01739420736
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-rose-200">
                <span className="font-black font-mono text-base text-rose-700">
                  {mfsConfig.bkash.number}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(mfsConfig.bkash.number);
                    showToast(language === 'bn' ? 'সেন্ড মানি নম্বর কপি হয়েছে!' : 'Number copied!');
                  }}
                  className="py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                >
                  {language === 'bn' ? 'কপি করুন' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার বিকাশ, নগদ অথবা রকেট থেকে উপরের নম্বরে সেন্ড মানি করে বুকিং নিশ্চিত করুন। ব্যাংক লিমিট থাকলে সেন্ড মানি ব্যবহার করুন।'
                  : 'Send Money to the official number from your bKash, Nagad or Rocket to confirm booking.'}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBookingProductModal(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCustomerBooking(bookingProductModal)}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'ওয়ালেট থেকে টোকেন পরিশোধ' : 'Pay Deposit with Wallet'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Deposit Policy Modal */}
      <CustomerDepositPolicyModal
        isOpen={isCustomerDepositPolicyOpen}
        onClose={() => setIsCustomerDepositPolicyOpen(false)}
        language={language}
        sendMoneyNumber={mfsConfig.bkash.number}
      />

      {/* ================= MODAL: ISOLATED SHAREABLE LINKS GENERATOR ================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-white shadow-2xl relative">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 font-bold"
            >
              ✕
            </button>

            <div className="space-y-1">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-rose-400" />
                <span>{language === 'bn' ? 'আলাদা আলাদা ডিরেক্ট অ্যাপ লিংক' : 'Dedicated Standalone Links'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'কাস্টমার, এজেন্ট ও অ্যাডমিনের লিংক সম্পূর্ণ আলাদা করা হয়েছে যাতে কাস্টমাররা অ্যাডমিন বা এজেন্টের অপশন না দেখে।'
                  : 'Direct links isolated by portal to prevent customers from seeing admin/agent controls.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* 1. Customer Link */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>📱 ১. সাধারণ কাস্টমার লিংক (কোনো এডমিন/এজেন্ট বাটন নেই)</span>
                  <button
                    onClick={() => copyUrl('#/customer', 'Customer')}
                    className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    {copiedLinkType === 'Customer' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLinkType === 'Customer' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono text-slate-400 break-all select-all bg-slate-900 p-2 rounded-xl">
                  {originUrl}#/customer
                </div>
              </div>

              {/* 2. Agent Link */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-teal-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-teal-400">
                  <span>💼 ২. এজেন্ট পোর্টাল লিংক (ভোটার আইডি NID ফটোকপি ও ফ্লোট)</span>
                  <button
                    onClick={() => copyUrl('#/agent', 'Agent')}
                    className="py-1 px-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    {copiedLinkType === 'Agent' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLinkType === 'Agent' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono text-slate-400 break-all select-all bg-slate-900 p-2 rounded-xl">
                  {originUrl}#/agent
                </div>
              </div>

              {/* 3. Admin Link */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-rose-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                  <span>🛡️ ৩. সুপার অ্যাডমিন কন্ট্রোল লিংক (পাসওয়ার্ড সুরক্ষিত)</span>
                  <button
                    onClick={() => copyUrl('#/admin', 'Admin')}
                    className="py-1 px-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    {copiedLinkType === 'Admin' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLinkType === 'Admin' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono text-slate-400 break-all select-all bg-slate-900 p-2 rounded-xl">
                  {originUrl}#/admin
                </div>
                <div className="text-[10px] text-slate-400">
                  Login Email: <strong className="text-white">ariyanazim527@gmail.com</strong> | Password: <strong className="text-white">Admin@739420736</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Route Switcher on mobile for App Owner */}
      <div className="fixed bottom-18 md:bottom-6 right-4 z-40">
        <div className="bg-slate-950/95 border border-slate-700 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md flex items-center gap-1.5">
          <button
            onClick={() => navigateTo('agent')}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <span>💼</span>
            <span>এজেন্ট অ্যাপ</span>
          </button>
          <button
            onClick={() => navigateTo('admin')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <span>🛡️</span>
            <span>অ্যাডমিন অ্যাপ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
