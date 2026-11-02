import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Percent,
  Clock,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  ChevronRight,
  Lock,
  Layers,
  ArrowRight,
  Info,
  Send,
  MessageCircle,
  ExternalLink,
  Headphones,
} from 'lucide-react';
import {
  DEPOSIT_RATIO_RULES,
  DEPOSIT_PILLARS,
  AGENT_CUSTOMER_EXPLAINER_SCRIPT,
} from '../../data/depositPolicy.ts';

export const COMMON_SUPPORT_ISSUES = [
  {
    id: 'deposit_issue',
    titleBn: 'ডিপোজিট সমস্যা (টাকা কেটেছে কিন্তু ওয়ালেটে আসেনি)',
    titleEn: 'Deposit Issues (Debited but not in wallet)',
    defaultMsgBn: 'আসসালামু আলাইকুম, আমি ডিপোজিট করেছি কিন্তু আমার ব্যালেন্সে এখনো টাকা জমা হয়নি। অনুগ্রহ করে দ্রুত ফ্লোট/ব্যালেন্স যুক্ত করুন। TrxID: ',
    defaultMsgEn: 'Hello, my deposited funds were deducted but not credited to wallet. Please resolve. TrxID: ',
  },
  {
    id: 'withdrawal_issue',
    titleBn: 'উত্তোলন করতে পারছি না / ক্যাশ-আউট সমস্যা',
    titleEn: 'Withdrawal Failed / Unable to Cash-Out',
    defaultMsgBn: 'আসসালামু আলাইকুম, আমি ওয়ালেট থেকে টাকা উত্তোলন / ক্যাশ-আউট করতে পারছি না। অনুগ্রহ করে সমাধান দিন।',
    defaultMsgEn: 'Hello, I am unable to withdraw funds from my wallet. Please check and assist.',
  },
  {
    id: 'booking_inquiry',
    titleBn: 'বুকিং টোকেন ও ডিলারশিপ পণ্য ডেলিভারি তথ্য',
    titleEn: 'Booking Token & Luxury Delivery Inquiry',
    defaultMsgBn: 'আসসালামু আলাইকুম, আমি পণ্যের বুকিং জামানত দিয়েছি। আমার ডেলিভারি ও ভেরিফিকেশন স্ট্যাটাস জানতে চাই। বুকিং রেফারেন্স: ',
    defaultMsgEn: 'Hello, I submitted product booking deposit and need delivery status. Ref: ',
  },
  {
    id: 'refund_request',
    titleBn: 'টাকা ফেরত / ১০০% জামানত রিফান্ড আবেদন',
    titleEn: 'Refund Request / 100% Escrow Return',
    defaultMsgBn: 'আসসালামু আলাইকুম, আমি আমার সিকিউরিটি ডিপোজিট ১০০% রিফান্ড পাওয়ার আবেদন করতে চাই। রেজিস্টার্ড ফোন: ',
    defaultMsgEn: 'Hello, I want to request 100% refund of my security deposit. Registered phone: ',
  },
  {
    id: 'other_help',
    titleBn: 'অন্যান্য জরুরি কারিগরি ও কাস্টমার সহায়তা',
    titleEn: 'Other Urgent Customer Assistance',
    defaultMsgBn: 'আসসালামু আলাইকুম, uWallet সেন্ট্রাল হেল্পলাইন সাপোর্ট থেকে আমার একটি জরুরি সহায়তা প্রয়োজন।',
    defaultMsgEn: 'Hello, I need urgent assistance from the uWallet helpline.',
  },
];

interface CustomerDepositPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
  sendMoneyNumber?: string;
}

export const CustomerDepositPolicyModal: React.FC<CustomerDepositPolicyModalProps> = ({
  isOpen,
  onClose,
  language,
  sendMoneyNumber = '01739420736',
}) => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'ratios' | 'refund' | 'agent_script' | 'telegram_support'>('pillars');
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string>('deposit_issue');
  const [trxInput, setTrxInput] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [copiedTelegramMsg, setCopiedTelegramMsg] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentIssue = COMMON_SUPPORT_ISSUES.find((i) => i.id === selectedIssueId) || COMMON_SUPPORT_ISSUES[0];
  const prefilledBase = language === 'bn' ? currentIssue.defaultMsgBn : currentIssue.defaultMsgEn;
  const fullSupportMessage = `${prefilledBase}${trxInput ? ` ${trxInput}` : ''}${customNote ? `\nবিবরণ: ${customNote}` : ''}\n(uWallet কাস্টমার সাপোর্ট - ফোন: 01712-345678)`;

  const telegramUrl = `https://t.me/Ewallatehelpline?text=${encodeURIComponent(fullSupportMessage)}`;

  const handleCopyTelegramMessage = () => {
    navigator.clipboard.writeText(fullSupportMessage);
    setCopiedTelegramMsg(true);
    setTimeout(() => setCopiedTelegramMsg(false), 2000);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(sendMoneyNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleCopyScript = () => {
    const text = AGENT_CUSTOMER_EXPLAINER_SCRIPT.scriptLinesBn.join('\n• ');
    navigator.clipboard.writeText('• ' + text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative my-auto">
        {/* Modal Header */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition-all"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white ring-2 ring-white/30 shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-300/30">
                  {language === 'bn' ? 'বাংলাদেশ ট্রেড পলিসি গাইড' : 'Official Trade Policy'}
                </span>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                  ১০০% রিফান্ডেবল
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight mt-1">
                {language === 'bn'
                  ? 'কাস্টমার নিরাপত্তা জামানতের ভিত্তি ও নীতিমালা'
                  : 'Customer Security Deposit Policy & Foundation'}
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {language === 'bn'
                  ? 'উচ্চমূল্যের পণ্য বুকিংয়ে জামানত কেন এবং কিসের ভিত্তিতে নেওয়া হয়'
                  : 'Detailed breakdown of high-value asset deposit ratios and customer guarantees'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pillars')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'pillars'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'bn' ? '📌 জামানতের ৫টি মূল ভিত্তি' : '5 Core Pillars'}
          </button>
          <button
            onClick={() => setActiveTab('ratios')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'ratios'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'bn' ? '📊 পণ্য ক্যাটাগরি ও হার' : 'Category Ratios'}
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'refund'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'bn' ? '🔄 সমন্বয় ও ১০০% রিফান্ড' : 'Adjustment & Refund'}
          </button>
          <button
            onClick={() => setActiveTab('agent_script')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'agent_script'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-2xs font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'bn' ? '🗣️ কাস্টমার ব্যাখ্যা গাইড' : 'Customer Script'}
          </button>
          <button
            onClick={() => setActiveTab('telegram_support')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
              activeTab === 'telegram_support'
                ? 'border-sky-500 text-sky-700 bg-white shadow-2xs font-black'
                : 'border-transparent text-sky-600 hover:text-sky-800'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-sky-500" />
            <span>{language === 'bn' ? '💬 টেলিগ্রাম হেল্পলাইন' : 'Telegram Support'}</span>
            <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.2 rounded-full font-bold">
              ২৪/৭
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-slate-700 text-xs leading-relaxed flex-1">
          {/* TAB 1: 5 Core Pillars */}
          {activeTab === 'pillars' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-emerald-900 font-medium">
                  {language === 'bn'
                    ? 'আমাদের অ্যাপে ২১০+ অতি-উচ্চমূল্যের পণ্য (ফ্ল্যাগশিপ মোবাইল, লাক্সারি ভেহিকল, সমুদ্রগামী কন্টেইনার জাহাজ, হেভি ক্রেন ও ওয়্যারহাউস) তালিকাভুক্ত রয়েছে। এই পণ্যগুলোর ক্রয়-বিক্রয়ে জামানত গ্রহণের মূল ভিত্তি নিচে দেওয়া হলো:'
                    : 'All catalog items are high-value certified assets. Security deposits ensure transparent, zero-risk transactions for both buyers and dealerships:'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {DEPOSIT_PILLARS.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/90 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-xs md:text-sm">
                        {language === 'bn' ? pillar.titleBn : pillar.titleEn}
                      </h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        {language === 'bn' ? pillar.badgeBn : pillar.badgeEn}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {language === 'bn' ? pillar.descriptionBn : pillar.descriptionEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Category Ratios */}
          {activeTab === 'ratios' && (
            <div className="space-y-3">
              <p className="text-slate-600 text-[11px]">
                {language === 'bn'
                  ? 'পণ্যের ধরণ ও বাজার মূল্যের ওপর ভিত্তি করে জামানতের নির্দিষ্ট অনুপাত নির্ধারিত রয়েছে। কোনো কাস্টমার থেকেই অতিরিক্ত অর্থ আদায় করা হয় না:'
                  : 'Deposit ratios are mathematically proportioned to inventory holding costs:'}
              </p>

              <div className="space-y-2.5">
                {DEPOSIT_RATIO_RULES.map((rule) => (
                  <div
                    key={rule.categoryId}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 pb-1.5 border-b border-slate-100">
                      <span className="font-black text-slate-900 text-xs">
                        {language === 'bn' ? rule.categoryNameBn : rule.categoryNameEn}
                      </span>
                      <span className="text-[11px] font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {language === 'bn' ? rule.ratioRangeBn : rule.ratioRangeEn}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      <strong className="text-slate-800">{language === 'bn' ? 'যৌক্তিক ভিত্তি: ' : 'Rationale: '}</strong>
                      {language === 'bn' ? rule.rationaleBn : rule.rationaleEn}
                    </p>
                    <div className="bg-slate-50 p-2 rounded-xl text-[10px] text-slate-500 font-mono flex items-center justify-between">
                      <span>{language === 'bn' ? 'উদাহরণ: ' + rule.exampleBn : 'Example: ' + rule.exampleEn}</span>
                      <span className="text-emerald-700 font-bold">{language === 'bn' ? '✓ সমন্বয়যোগ্য' : 'Deductible'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Refund & Escrow Protection */}
          {activeTab === 'refund' && (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h4 className="font-black text-emerald-950 text-sm">
                    {language === 'bn' ? '১০০% নিশ্চিত রিফান্ড ও মূল্য সমন্বয় পলিসি' : '100% Refund & Price Deduction Terms'}
                  </h4>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {language === 'bn'
                    ? 'গ্রাহক যখন বুকিং নিশ্চিত করবেন, তখন প্রাপ্ত বুকিং জামানত সরাসরি কেন্দ্রীয় এসক্রো লেজারে সংরক্ষিত থাকে। পণ্য যখন গ্রাহকের আউটলেটে বা ঠিকানায় ডেলিভারি হবে:'
                    : 'The booking deposit is escrow-locked until physical handover:'}
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>
                      {language === 'bn'
                        ? 'মূল পণ্য ডেলিভারির সময় মোট ইনভয়েস থেকে এই জামানতের সম্পূর্ণ টাকা বাদ দেওয়া হবে।'
                        : 'At delivery, deposit amount is completely deducted from total invoice.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>
                      {language === 'bn'
                        ? 'যদি গ্রাহক পণ্য গ্রহণ করতে অপারগ হন বা মডেল পরিবর্তন করতে চান, তবে কোনো প্রশ্ন ছাড়াই ২৪ থেকে ৪৮ ঘণ্টার মধ্যে সম্পূর্ণ টাকা রিফান্ড পাবেন।'
                        : 'If order is cancelled or modified prior to delivery, 100% full refund is issued within 24-48 hours.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>
                      {language === 'bn'
                        ? 'রিফান্ডের টাকা গ্রাহকের যে বিকাশ, নগদ অথবা রকেট নম্বর থেকে দেওয়া হয়েছিল সরাসরি সেখানেই স্বয়ংক্রিয়ভাবে জমা হবে।'
                        : 'Refund is credited back automatically to source bKash, Nagad or Rocket number.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Send Money Info */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    {language === 'bn' ? 'অফিসিয়াল জামানত সেন্ড মানি নম্বর (বিকাশ / নগদ / রকেট):' : 'Official Escrow Number:'}
                  </span>
                  <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-bold">
                    সরাসরি সেন্ড মানি
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="font-black font-mono text-lg text-emerald-400">
                    {sendMoneyNumber}
                  </span>
                  <button
                    onClick={handleCopyNumber}
                    className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNumber ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'নম্বর কপি' : 'Copy')}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'bn'
                    ? 'ব্যাংক লিমিট শেষ থাকলে বা ব্যর্থ হলে অবিলম্বে বিকাশ, নগদ অথবা রকেট সেন্ড মানি করে ট্রানজেকশন আইডি (TrxID) সংরক্ষণ করুন।'
                    : 'When bank limits apply, use bKash, Nagad or Rocket Send Money and preserve TrxID.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Agent Script */}
          {activeTab === 'agent_script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">
                    {language === 'bn' ? AGENT_CUSTOMER_EXPLAINER_SCRIPT.headlineBn : AGENT_CUSTOMER_EXPLAINER_SCRIPT.headlineEn}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {language === 'bn' ? 'কাস্টমারকে সহজে বোঝাতে এই লাইনগুলো হুবহু পড়ে শোনান বা মেসেজে পাঠান' : 'Use this exact pitch to build instant customer trust:'}
                  </p>
                </div>
                <button
                  onClick={handleCopyScript}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'স্ক্রিপ্ট কপি' : 'Copy Script')}</span>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                {AGENT_CUSTOMER_EXPLAINER_SCRIPT.scriptLinesBn.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Telegram Support & Helpline */}
          {activeTab === 'telegram_support' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Telegram Official Header Banner */}
              <div className="p-4 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white ring-2 ring-white/30">
                      <Send className="w-5 h-5 text-sky-100" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">
                        {language === 'bn' ? 'অফিসিয়াল টেলিগ্রাম হেল্পলাইন সাপোর্ট' : 'Official Telegram Support Desk'}
                      </h4>
                      <p className="text-[11px] text-sky-100">
                        {language === 'bn' ? '২৪/৭ সরাসরি অ্যাডমিন ও কাস্টমার কেয়ার সার্ভিস' : '24/7 Dedicated Support Desk'}
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://t.me/Ewallatehelpline"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white text-sky-700 hover:bg-sky-50 font-black text-xs rounded-xl shadow flex items-center gap-1 transition-all"
                  >
                    <span>t.me/Ewallatehelpline</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 4 Step Guidance Breakdown */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800">
                  {language === 'bn' ? 'সহায়তা পাওয়ার ৪টি সহজ ধাপ:' : '4 Steps to Fast Resolution:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-black text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded-md">ধাপ ১</span>
                    <p className="text-[11px] font-bold text-slate-800">সমস্যা নির্বাচন</p>
                    <p className="text-[10px] text-slate-500">ড্রপডাউন থেকে আপনার বিষয়টি সিলেক্ট করুন</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-black text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded-md">ধাপ ২</span>
                    <p className="text-[11px] font-bold text-slate-800">TrxID ও তথ্য</p>
                    <p className="text-[10px] text-slate-500">টাকা কেটে থাকলে ট্রানজেকশন আইডি দিন</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-black text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded-md">ধাপ ৩</span>
                    <p className="text-[11px] font-bold text-slate-800">টেলিগ্রামে সেন্ড</p>
                    <p className="text-[10px] text-slate-500">সরাসরি টেলিগ্রাম চ্যাটে পাঠিয়ে দিন</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">ধাপ ৪</span>
                    <p className="text-[11px] font-bold text-emerald-800">১০-১৫ মিনিটে সমাধান</p>
                    <p className="text-[10px] text-slate-500">অ্যাডমিন টিম তৎক্ষণাৎ সমাধান নিশ্চিত করবে</p>
                  </div>
                </div>
              </div>

              {/* Quick-Select Issue Dropdown & Inputs */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">
                    {language === 'bn' ? '১. আপনার সমস্যা নির্বাচন করুন (Quick-Select Dropdown):' : '1. Select Your Issue:'}
                  </label>
                  <select
                    value={selectedIssueId}
                    onChange={(e) => setSelectedIssueId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 shadow-2xs"
                  >
                    {COMMON_SUPPORT_ISSUES.map((issue) => (
                      <option key={issue.id} value={issue.id}>
                        {language === 'bn' ? issue.titleBn : issue.titleEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID) - ঐচ্ছিক:' : 'Transaction ID (TrxID):'}
                    </label>
                    <input
                      type="text"
                      value={trxInput}
                      onChange={(e) => setTrxInput(e.target.value)}
                      placeholder="e.g. 9M882109BK / NG771920"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      {language === 'bn' ? 'অতিরিক্ত মন্তব্য বা নম্বর:' : 'Additional Notes / Phone:'}
                    </label>
                    <input
                      type="text"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder={language === 'bn' ? 'উদা: ১০ মিনিট ধরে পেন্ডিং' : 'e.g. Pending for 10 mins'}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Pre-filled Message Preview Box */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 text-[11px]">
                      {language === 'bn' ? 'টেলিগ্রাম মেসেজ প্রিভিউ (Pre-filled Message):' : 'Pre-filled Telegram Message:'}
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyTelegramMessage}
                      className="text-sky-600 hover:text-sky-800 text-[11px] font-bold flex items-center gap-1"
                    >
                      {copiedTelegramMsg ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTelegramMsg ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'মেসেজ কপি করুন' : 'Copy Message')}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-sans whitespace-pre-wrap leading-relaxed shadow-2xs">
                    {fullSupportMessage}
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 text-center"
                  >
                    <Send className="w-4 h-4 text-white" />
                    <span>{language === 'bn' ? 'টেলিগ্রামে সরাসরি যোগাযোগ করুন (@Ewallatehelpline)' : 'Contact Support on Telegram (@Ewallatehelpline)'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyTelegramMessage}
                    className="w-full sm:w-auto py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all shrink-0"
                  >
                    {copiedTelegramMsg ? '✓ মেসেজ কপি সম্পন্ন' : 'টেক্সট কপি'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Always-Visible Telegram Support CTA */}
        <div className="p-3.5 md:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href="https://t.me/Ewallatehelpline"
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-black shadow flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'টেলিগ্রাম সাপোর্ট: t.me/Ewallatehelpline' : 'Telegram: t.me/Ewallatehelpline'}</span>
              <ExternalLink className="w-3 h-3 text-sky-100" />
            </a>

            <button
              onClick={() => setActiveTab('telegram_support')}
              className="hidden sm:inline-flex py-2 px-3 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200"
            >
              {language === 'bn' ? 'সমস্যা নির্বাচন করুন' : 'Select Issue'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
          >
            {language === 'bn' ? 'বুঝেছি / বন্ধ করুন' : 'Got it / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
