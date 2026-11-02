import React, { useState } from 'react';
import {
  Store,
  Key,
  Code2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Send,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  Smartphone,
  Lock,
} from 'lucide-react';
import { MerchantProfile, GatewayCheckoutSession } from '../../types/agentMerchant.ts';

interface MerchantPortalProps {
  language: 'bn' | 'en';
  onExitPortal: () => void;
}

const INITIAL_MERCHANT: MerchantProfile = {
  id: 'mer-109',
  storeName: 'BD E-Commerce SuperShop',
  businessType: 'Retail & Consumer Goods',
  apiKey: 'pk_live_uwallet_982910382910',
  apiSecret: 'sk_live_sec_8849201938201',
  webhookUrl: 'https://myshop.com.bd/api/uwallet/ipn',
  collectedBalance: 82500,
  pendingPayout: 34000,
  status: 'live',
};

export const MerchantPortal: React.FC<MerchantPortalProps> = ({ language, onExitPortal }) => {
  const [merchant, setMerchant] = useState<MerchantProfile>(INITIAL_MERCHANT);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Gateway Checkout Simulator State
  const [simAmount, setSimAmount] = useState<string>('1850');
  const [simCustomerPhone, setSimCustomerPhone] = useState<string>('01712-345678');
  const [simStep, setSimStep] = useState<'idle' | 'popup' | 'otp' | 'success'>('idle');
  const [simOtp, setSimOtp] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartSimulatedCheckout = () => {
    setSimStep('popup');
  };

  const handleSendSimOtp = () => {
    setSimStep('otp');
    setSimOtp('8492');
  };

  const handleConfirmSimPayment = () => {
    setSimStep('success');
    const amt = parseFloat(simAmount) || 0;
    setMerchant((prev) => ({
      ...prev,
      collectedBalance: prev.collectedBalance + amt,
    }));
    triggerToast(
      language === 'bn'
        ? `পেমেন্ট সফল! মার্চেন্ট ব্যালেন্সে ৳${amt.toLocaleString()} যুক্ত হয়েছে এবং Webhook ট্রিগার হয়েছে।`
        : `Payment successful! ৳${amt.toLocaleString()} credited & Webhook dispatched.`
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans pb-12">
      {/* 1. Merchant Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">{merchant.storeName}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  API GATEWAY LIVE
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Merchant ID: {merchant.id} · {merchant.businessType}
              </span>
            </div>
          </div>

          <button
            onClick={onExitPortal}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            {language === 'bn' ? 'ইউজার অ্যাপে ফিরুন' : 'Exit to App'}
          </button>
        </div>
      </header>

      {/* 2. Main Merchant Content */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Settlement Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-slate-800 shadow-sm">
            <span className="text-xs text-indigo-300 block mb-1">
              {language === 'bn' ? 'মার্চেন্ট সেটেলমেন্ট ব্যালেন্স' : 'Settlement Vault Balance'}
            </span>
            <div className="text-3xl font-extrabold font-mono tabular-nums tracking-tight my-1">
              ৳{merchant.collectedBalance.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {language === 'bn' ? 'ওয়েবসাইট থেকে স্বয়ংক্রিয়ভাবে সংগৃহীত মোট ফান্ড' : 'Live checkout revenue ready for MFS payout'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 block mb-1">
                {language === 'bn' ? 'পরবর্তী বিকাশ / নগদ ট্রান্সফার (T+1)' : 'Next Payout to bKash / Nagad (T+1)'}
              </span>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 my-1">
                ৳{merchant.pendingPayout.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400">
                bKash Merchant (01712-345678) · Today midnight
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 block mb-1">
                {language === 'bn' ? 'সিস্টেম গেটওয়ে ফি' : 'Payment Processing Fee'}
              </span>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-indigo-600 my-1">
                1.2%
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'কোনো হিডেন চার্জ নেই, ইনস্ট্যান্ট IPN কনফার্মেশন' : 'Standard merchant MDR with zero setup charges'}
              </p>
            </div>
          </div>
        </div>

        {/* API Credentials Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                {language === 'bn' ? 'মার্চেন্ট API ক্রেডেনশিয়াল ও কী' : 'Merchant API Credentials'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'আপনার ওয়েবসাইটে এই API Key বসিয়ে uWallet পেমেন্ট গেটওয়ে ইন্টিগ্রেশন করুন।'
                  : 'Integrate these credentials into your website checkout backend.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Public API Key */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Public Key (Client Side)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={merchant.apiKey}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-800 text-xs"
                />
                <button
                  onClick={() => copyToClipboard(merchant.apiKey, 'public')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'public' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Secret API Key */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Secret Key (Server Side Only)</label>
              <div className="flex gap-2">
                <input
                  type={showSecret ? 'text' : 'password'}
                  readOnly
                  value={merchant.apiSecret}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-800 text-xs"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1 transition-colors"
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSecret ? 'Hide' : 'Show'}</span>
                </button>
                <button
                  onClick={() => copyToClipboard(merchant.apiSecret, 'secret')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Webhook IPN Endpoint */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Webhook / IPN URL (Instant Payment Notification)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={merchant.webhookUrl}
                  onChange={(e) => setMerchant({ ...merchant, webhookUrl: e.target.value })}
                  placeholder="https://yourwebsite.com/api/payment-callback"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-800 text-xs"
                />
                <button
                  onClick={() => triggerToast(language === 'bn' ? 'Webhook URL সংরক্ষিত হয়েছে!' : 'Webhook URL saved!')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
                >
                  Save URL
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Payment Gateway Sandbox Simulator */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                {language === 'bn' ? 'পেমেন্ট গেটওয়ে ইন্টিগ্রেশন সিমুলেটর (Live Test Widget)' : 'Payment Gateway Sandbox Simulator'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'আপনার ওয়েবসাইটে গ্রাহক যেভাবে পেমেন্ট করবেন তা সরাসরি টেস্ট করে দেখুন।'
                  : 'Test the end-to-end customer checkout flow directly in this sandbox.'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              SANDBOX TEST
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pt-2">
            {/* Simulation Controller */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-800 block">
                {language === 'bn' ? '১. টেস্ট অর্ডার তথ্য দিন' : '1. Enter Simulated Order Details'}
              </span>

              <div>
                <label className="block text-slate-600 mb-1">Order Amount (৳)</label>
                <input
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Customer Mobile Number</label>
                <input
                  type="text"
                  value={simCustomerPhone}
                  onChange={(e) => setSimCustomerPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono"
                />
              </div>

              <button
                onClick={handleStartSimulatedCheckout}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>{language === 'bn' ? 'গেটওয়ে পপ-আপ চালু করুন' : 'Trigger uWallet Gateway'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Simulated uWallet Gateway Checkout Window */}
            <div className="p-5 bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-xs text-white">
                    u
                  </div>
                  <span className="font-bold text-sm">uWallet Secure Gateway</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Order #BD-9982</span>
              </div>

              {simStep === 'idle' && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Click "Trigger uWallet Gateway" to open customer checkout dialog.
                </div>
              )}

              {simStep === 'popup' && (
                <div className="space-y-3 text-xs animate-in fade-in">
                  <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Merchant</span>
                      <span className="font-bold text-white">{merchant.storeName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Total Amount</span>
                      <span className="font-bold text-rose-400 text-base font-mono">৳{simAmount}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Enter your uWallet Account</label>
                    <input
                      type="text"
                      readOnly
                      value={simCustomerPhone}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 font-mono text-white text-xs"
                    />
                  </div>

                  <button
                    onClick={handleSendSimOtp}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-colors"
                  >
                    Confirm & Send OTP
                  </button>
                </div>
              )}

              {simStep === 'otp' && (
                <div className="space-y-3 text-xs animate-in fade-in">
                  <div className="text-center">
                    <span className="font-bold text-sm block">Enter Verification Code</span>
                    <span className="text-slate-400 text-[11px]">OTP sent to {simCustomerPhone}</span>
                  </div>

                  <div className="flex justify-center gap-2 my-2">
                    {['8', '4', '9', '2'].map((digit, i) => (
                      <div
                        key={i}
                        className="w-9 h-10 rounded-lg bg-slate-900 border border-slate-600 flex items-center justify-center font-bold text-white text-base"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleConfirmSimPayment}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors"
                  >
                    Authorize ৳{simAmount} Payment
                  </button>
                </div>
              )}

              {simStep === 'success' && (
                <div className="py-4 text-center space-y-2 animate-in zoom-in-95">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm block text-emerald-400">Payment Completed!</span>
                  <p className="text-[11px] text-slate-300">
                    Webhook delivered 200 OK to your store endpoint.
                  </p>
                  <button
                    onClick={() => setSimStep('idle')}
                    className="mt-2 text-xs text-slate-400 hover:text-white underline"
                  >
                    Reset Simulator
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
