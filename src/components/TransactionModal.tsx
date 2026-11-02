import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Building,
  Smartphone,
  Lock,
  Share2,
  Copy,
  Check,
  Receipt,
  User,
  Zap,
  Info,
  HelpCircle,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TransactionType, Transaction, Contact, Biller } from '../types/wallet.ts';
import { INITIAL_CONTACTS, BILLERS, MOBILE_OPERATORS } from '../data/walletData.ts';

export interface MfsDailyLimitConfig {
  id: 'bkash' | 'nagad' | 'rocket';
  name: string;
  nameBn: string;
  brandColor: string;
  brandBg: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  dailyTxnCountCap: number;
  usedTxnCount: number;
  singleTxnLimit: number;
  monthlyLimit: number;
  officialFee: string;
  resetTime: string;
}

export const MFS_SEND_MONEY_LIMITS: Record<'bkash' | 'nagad' | 'rocket', MfsDailyLimitConfig> = {
  bkash: {
    id: 'bkash',
    name: 'bKash',
    nameBn: 'বিকাশ',
    brandColor: '#E2136E',
    brandBg: 'bg-[#FFF0F6]',
    borderColor: 'border-[#E2136E]',
    textColor: 'text-[#E2136E]',
    badgeBg: 'bg-[#E2136E] text-white',
    dailyLimit: 25000,
    usedToday: 7500,
    remainingToday: 17500,
    dailyTxnCountCap: 50,
    usedTxnCount: 3,
    singleTxnLimit: 25000,
    monthlyLimit: 200000,
    officialFee: '৳৫ (৫টি প্রিয় নম্বরে ফ্রি)',
    resetTime: '১২:০০ AM মিডনাইট',
  },
  nagad: {
    id: 'nagad',
    name: 'Nagad',
    nameBn: 'নগদ',
    brandColor: '#F7941D',
    brandBg: 'bg-[#FFF7ED]',
    borderColor: 'border-[#F7941D]',
    textColor: 'text-[#F7941D]',
    badgeBg: 'bg-[#F7941D] text-white',
    dailyLimit: 25000,
    usedToday: 2000,
    remainingToday: 23000,
    dailyTxnCountCap: 50,
    usedTxnCount: 1,
    singleTxnLimit: 25000,
    monthlyLimit: 200000,
    officialFee: '৳৫ (অ্যাপ ও ইউএসএসডি)',
    resetTime: '১২:০০ AM মিডনাইট',
  },
  rocket: {
    id: 'rocket',
    name: 'Rocket',
    nameBn: 'রকেট',
    brandColor: '#8C3494',
    brandBg: 'bg-[#FAF5FF]',
    borderColor: 'border-[#8C3494]',
    textColor: 'text-[#8C3494]',
    badgeBg: 'bg-[#8C3494] text-white',
    dailyLimit: 25000,
    usedToday: 10000,
    remainingToday: 15000,
    dailyTxnCountCap: 50,
    usedTxnCount: 2,
    singleTxnLimit: 25000,
    monthlyLimit: 200000,
    officialFee: '৳৪ (ডিবিবিএল নেটওয়ার্ক)',
    resetTime: '১২:০০ AM মিডনাইট',
  },
};

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: TransactionType | 'savings' | 'request' | null;
  currentBalance: number;
  language: 'bn' | 'en';
  onCompleteTransaction: (newTx: Transaction, amountDiff: number) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  actionType,
  currentBalance,
  language,
  onCompleteTransaction,
}) => {
  const [step, setStep] = useState<'input' | 'review' | 'pin' | 'success'>('input');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [selectedBiller, setSelectedBiller] = useState<Biller | null>(BILLERS[0]);
  const [selectedOperator, setSelectedOperator] = useState<string>('Grameenphone');
  const [selectedMfsProvider, setSelectedMfsProvider] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [showLimitTooltip, setShowLimitTooltip] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  if (!isOpen || !actionType) return null;

  const numAmount = parseFloat(amount) || 0;
  const currentMfsLimit = MFS_SEND_MONEY_LIMITS[selectedMfsProvider];
  const isSendMoneyOverLimit = actionType === 'send_money' && numAmount > currentMfsLimit.remainingToday;

  const fee = actionType === 'send_money' ? 5 : actionType === 'cash_out' ? Math.round(numAmount * 0.015) : 0;
  const totalDeduction = numAmount + fee;

  const isBankSelected =
    actionType === 'add_money' &&
    Boolean(
      recipient &&
        (recipient.toLowerCase().includes('bank') ||
          recipient.includes('সিটি ব্যাংক') ||
          recipient.includes('ব্র্যাক ব্যাংক') ||
          recipient.includes('ডিবিবিএল') ||
          recipient.includes('ইসলামী ব্যাংক'))
    );

  const handleNextToReview = () => {
    setError(null);
    if (actionType === 'add_money' && isBankSelected) {
      setError(
        language === 'bn'
          ? 'ব্যাংকের লিমিট শেষ! এই মুহূর্তে পেমেন্ট করা সম্ভব হচ্ছে না, অনুগ্রহ করে সেন্ড মানি করুন।'
          : 'Bank limit exhausted! Payments via bank are currently unavailable. Please send money via bKash, Nagad or Rocket.'
      );
      return;
    }
    if (actionType === 'send_money' && numAmount > currentMfsLimit.remainingToday) {
      setError(
        language === 'bn'
          ? `${currentMfsLimit.nameBn}-এ দৈনিক সেন্ড মানি বাকি আছে মাত্র ৳${currentMfsLimit.remainingToday.toLocaleString()}। আপনার কাঙ্ক্ষিত ৳${numAmount.toLocaleString()} এর জন্য দৈনিক লিমিট অতিক্রম করেছে। অনুগ্রহ করে পরিমাণ কমান বা অন্য মাধ্যমে পাঠান।`
          : `Exceeds ${currentMfsLimit.name} remaining daily send money limit of ৳${currentMfsLimit.remainingToday.toLocaleString()}. Please reduce amount or use another provider.`
      );
      return;
    }
    if (!amount || numAmount <= 0) {
      setError(language === 'bn' ? 'অনুগ্রহ করে সঠিক পরিমাণ লিখুন।' : 'Please enter a valid amount.');
      return;
    }
    if (actionType !== 'add_money' && actionType !== 'request' && totalDeduction > currentBalance) {
      setError(language === 'bn' ? 'আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।' : 'Insufficient balance.');
      return;
    }
    if (!recipient && actionType !== 'add_money') {
      setError(language === 'bn' ? 'অনুগ্রহ করে প্রাপক বা নম্বর নির্বাচন করুন।' : 'Please specify a recipient.');
      return;
    }
    setStep('review');
  };

  const handleProceedToPin = () => {
    setStep('pin');
    setPin('');
  };

  const handleConfirmWithPin = () => {
    if (pin.length !== 4) {
      setError(language === 'bn' ? '৪ ডিজিটের গোপন পিন দিন।' : 'Please enter 4-digit PIN.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    setTimeout(() => {
      setIsProcessing(false);
      const isDeposit = actionType === 'add_money' || actionType === 'request';
      const balanceChange = isDeposit ? numAmount : -totalDeduction;

      let titleEn = 'Transaction';
      let titleBn = 'লেনদেন';

      if (actionType === 'send_money') {
        titleEn = `Sent Money to ${recipient}`;
        titleBn = `${recipient}-কে টাকা পাঠানো হয়েছে`;
      } else if (actionType === 'add_money') {
        titleEn = 'Added Money to Wallet';
        titleBn = 'ওয়ালেটে টাকা যোগ হয়েছে';
      } else if (actionType === 'mobile_recharge') {
        titleEn = `Recharge (${selectedOperator})`;
        titleBn = `মোবাইল রিচার্জ (${selectedOperator})`;
      } else if (actionType === 'merchant_pay') {
        titleEn = `Payment to ${recipient}`;
        titleBn = `${recipient}-এ পেমেন্ট`;
      } else if (actionType === 'bill_pay') {
        titleEn = `Bill: ${selectedBiller?.name}`;
        titleBn = `বিল: ${selectedBiller?.nameBn}`;
      } else if (actionType === 'cash_out') {
        titleEn = 'Cash Out to Agent';
        titleBn = 'এজেন্ট ক্যাশ আউট';
      }

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: actionType === 'savings' || actionType === 'request' ? 'send_money' : actionType,
        title: titleEn,
        titleBn: titleBn,
        recipientOrSource: recipient || 'Self Deposit',
        amount: numAmount,
        fee: fee,
        timestamp: 'Just now',
        status: 'completed',
        category: actionType === 'bill_pay' ? 'utility' : actionType === 'add_money' ? 'deposit' : 'transfer',
        referenceId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      setCompletedTx(newTx);
      onCompleteTransaction(newTx, balanceChange);
      setStep('success');
    }, 900);
  };

  const handleResetAndClose = () => {
    setStep('input');
    setRecipient('');
    setAmount('');
    setNote('');
    setPin('');
    setError(null);
    setCompletedTx(null);
    onClose();
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'send_money':
        return language === 'bn' ? 'সেন্ড মানি' : 'Send Money';
      case 'add_money':
        return language === 'bn' ? 'অ্যাড মানি (টাকা যোগ)' : 'Add Money';
      case 'mobile_recharge':
        return language === 'bn' ? 'মোবাইল রিচার্জ' : 'Mobile Recharge';
      case 'merchant_pay':
        return language === 'bn' ? 'মার্চেন্ট পেমেন্ট' : 'Make Payment';
      case 'bill_pay':
        return language === 'bn' ? 'ইউটিলিটি বিল পে' : 'Pay Utility Bill';
      case 'cash_out':
        return language === 'bn' ? 'ক্যাশ আউট' : 'Cash Out';
      default:
        return language === 'bn' ? 'লেনদেন' : 'Transaction';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">{getActionTitle()}</h3>
            <span className="text-xs text-slate-500">
              {language === 'bn' ? 'বর্তমান ব্যালেন্স:' : 'Balance:'} ৳{currentBalance.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content by Step */}
        <div className="p-6">
          {/* ================= STEP 1: INPUT ================= */}
          {step === 'input' && (
            <div className="space-y-4">
              {/* Recipient Selection for Send Money / Recharge */}
              {(actionType === 'send_money' || actionType === 'cash_out' || actionType === 'merchant_pay') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {actionType === 'merchant_pay'
                      ? language === 'bn'
                        ? 'মার্চেন্ট নাম বা নম্বর'
                        : 'Merchant Name or Number'
                      : language === 'bn'
                      ? 'প্রাপকের মোবাইল নম্বর'
                      : 'Recipient Mobile Number'}
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. 01712-345678"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />

                  {/* Quick Contacts */}
                  <div className="mt-2.5">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      {language === 'bn' ? 'সাম্প্রতিক পরিচিতি:' : 'Quick Contacts:'}
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {INITIAL_CONTACTS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setRecipient(`${c.name} (${c.phone})`)}
                          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs text-slate-700 transition-colors"
                        >
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                            style={{ backgroundColor: c.avatarColor }}
                          >
                            {c.name[0]}
                          </div>
                          <span>{c.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MFS SEND MONEY DAILY LIMIT & TOOLTIP COMPONENT */}
              {actionType === 'send_money' && (
                <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                  {/* Section Title & Tooltip Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        {language === 'bn' ? 'সেন্ড মানি মাধ্যম ও দৈনিক লিমিট' : 'Send Money Provider & Daily Cap'}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                        BB MFS
                      </span>
                    </div>

                    {/* Interactive Regulatory Tooltip Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setShowLimitTooltip(!showLimitTooltip)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg transition-colors border border-rose-200/60"
                      title="Bangladesh Bank MFS Daily Limit Regulations"
                    >
                      <Info className="w-3 h-3 text-rose-600" />
                      <span>{showLimitTooltip ? (language === 'bn' ? 'সংক্ষেপ করুন' : 'Hide Limits') : (language === 'bn' ? 'দৈনিক লিমিট নির্দেশিকা' : 'Limit Rules')}</span>
                      {showLimitTooltip ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Provider Tabs (bKash, Nagad, Rocket) with Remaining Cap Badges */}
                  <div className="grid grid-cols-3 gap-2">
                    {(['bkash', 'nagad', 'rocket'] as const).map((provKey) => {
                      const cfg = MFS_SEND_MONEY_LIMITS[provKey];
                      const isSelected = selectedMfsProvider === provKey;
                      return (
                        <button
                          key={cfg.id}
                          type="button"
                          onClick={() => {
                            setSelectedMfsProvider(provKey);
                            setError(null);
                          }}
                          className={`p-2 rounded-xl border text-left transition-all relative ${
                            isSelected
                              ? `${cfg.borderColor} ${cfg.brandBg} shadow-xs ring-2 ring-slate-900/10`
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">
                              {language === 'bn' ? cfg.nameBn : cfg.name}
                            </span>
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: cfg.brandColor }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {language === 'bn' ? 'অবশিষ্ট সীমা:' : 'Remaining:'}
                          </div>
                          <div className="text-xs font-extrabold font-mono text-slate-900">
                            ৳{cfg.remainingToday.toLocaleString()}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Provider Remaining Limit Summary Card */}
                  <div
                    className={`p-3 rounded-2xl border transition-all ${currentMfsLimit.brandBg} ${currentMfsLimit.borderColor}/40`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-extrabold text-white"
                          style={{ backgroundColor: currentMfsLimit.brandColor }}
                        >
                          {currentMfsLimit.name}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700">
                          {language === 'bn' ? 'আজকের ব্যবহৃত কোটা:' : 'Used Quota Today:'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 font-mono">
                        ৳{currentMfsLimit.usedToday.toLocaleString()} / ৳{currentMfsLimit.dailyLimit.toLocaleString()} (
                        {Math.round((currentMfsLimit.usedToday / currentMfsLimit.dailyLimit) * 100)}%)
                      </span>
                    </div>

                    {/* Progress Bar of Daily Limit */}
                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(currentMfsLimit.usedToday / currentMfsLimit.dailyLimit) * 100}%`,
                          backgroundColor: currentMfsLimit.brandColor,
                        }}
                      />
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-200/60 text-[10px]">
                      <div>
                        <span className="text-slate-500 block">{language === 'bn' ? 'আজকের বাকি:' : 'Remaining:'}</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          ৳{currentMfsLimit.remainingToday.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">{language === 'bn' ? 'লেনদেন বাকি:' : 'Txns Left:'}</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {currentMfsLimit.dailyTxnCountCap - currentMfsLimit.usedTxnCount}/50
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">{language === 'bn' ? 'রিসেট সময়:' : 'Cap Resets:'}</span>
                        <span className="font-bold text-slate-900 font-mono">12:01 AM</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Regulatory Tooltip Popover / Banner */}
                  {showLimitTooltip && (
                    <div className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl text-xs space-y-2 shadow-lg animate-in fade-in slide-in-from-top-1 border border-slate-700">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <div className="flex items-center gap-1.5 font-bold text-rose-300 text-[11px]">
                          <Shield className="w-3.5 h-3.5 text-rose-400" />
                          <span>
                            {language === 'bn'
                              ? 'বাংলাদেশ ব্যাংক এমএফএস সেন্ড মানি নিয়মাবলী'
                              : 'Bangladesh Bank MFS Send Money Guidelines'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowLimitTooltip(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-300">
                        <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                          <span>{language === 'bn' ? 'দৈনিক সর্বোচ্চ সেন্ড মানি সীমা:' : 'Daily Send Money Max Cap:'}</span>
                          <span className="font-bold text-white font-mono">৳২৫,০০০ (প্রতি অ্যাকাউন্টে)</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                          <span>{language === 'bn' ? 'দৈনিক লেনদেন সংখ্যা সীমা:' : 'Max Daily Transactions:'}</span>
                          <span className="font-bold text-white font-mono">সর্বোচ্চ ৫০ বার</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                          <span>{language === 'bn' ? 'মাসিক মোট সেন্ড মানি সীমা:' : 'Monthly Send Money Cap:'}</span>
                          <span className="font-bold text-white font-mono">৳২,০০,০০০ (সর্বোচ্চ ১০০ বার)</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span>{language === 'bn' ? 'একক লেনদেন সর্বোচ্চ:' : 'Single Transaction Limit:'}</span>
                          <span className="font-bold text-white font-mono">৳২৫,০০০</span>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-slate-800 text-[10px] text-amber-300 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                        <span>
                          {language === 'bn'
                            ? 'টিপস: কোনো একটি এমএফএস (যেমন বিকাশ)-এ দৈনিক লিমিট শেষ হয়ে গেলে আপনি নগদ বা রকেট নির্বাচন করে অবলীলায় টাকা পাঠাতে পারবেন।'
                            : 'Tip: If you hit the cap on one provider (e.g. bKash), you can switch to Nagad or Rocket to continue sending money.'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Over-Limit Reactive Warning Banner */}
                  {isSendMoneyOverLimit && (
                    <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2 text-xs text-amber-950 animate-in fade-in">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-bold text-xs text-amber-900">
                            {language === 'bn' ? 'দৈনিক লিমিট অতিক্রম করছে!' : 'Daily Cap Exceeded!'}
                          </h5>
                          <p className="text-[11px] text-amber-900 mt-0.5 leading-tight">
                            {language === 'bn'
                              ? `${currentMfsLimit.nameBn}-এ আজকের অবশিষ্ট লিমিট মাত্র ৳${currentMfsLimit.remainingToday.toLocaleString()}। আপনার কাঙ্ক্ষিত ৳${numAmount.toLocaleString()} এর জন্য লিমিট পর্যাপ্ত নয়।`
                              : `${currentMfsLimit.name} remaining daily cap is only ৳${currentMfsLimit.remainingToday.toLocaleString()}. You cannot send ৳${numAmount.toLocaleString()}.`}
                          </p>
                        </div>
                      </div>

                      {/* Alternate Provider Suggestion Button */}
                      {selectedMfsProvider !== 'nagad' && MFS_SEND_MONEY_LIMITS.nagad.remainingToday >= numAmount && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMfsProvider('nagad');
                            setError(null);
                          }}
                          className="w-full py-1.5 bg-[#F7941D] hover:bg-orange-600 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                        >
                          <span>{language === 'bn' ? 'নগদ-এ সুইচ করুন (আজকের বাকি ৳২৩,০০০)' : 'Switch to Nagad (৳23,000 remaining)'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {selectedMfsProvider === 'nagad' && MFS_SEND_MONEY_LIMITS.rocket.remainingToday >= numAmount && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMfsProvider('rocket');
                            setError(null);
                          }}
                          className="w-full py-1.5 bg-[#8C3494] hover:bg-purple-800 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                        >
                          <span>{language === 'bn' ? 'রকেট-এ সুইচ করুন (আজকের বাকি ৳১৫,০০০)' : 'Switch to Rocket (৳15,000 remaining)'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Recharge: Operator Selection */}
              {actionType === 'mobile_recharge' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'bn' ? 'অপারেটর নির্বাচন' : 'Select Operator'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {MOBILE_OPERATORS.map((op) => (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => setSelectedOperator(op.name)}
                          className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all text-center ${
                            selectedOperator === op.name
                              ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {op.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bill Pay: Biller Selection */}
              {actionType === 'bill_pay' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'bn' ? 'বিল প্রতিষ্ঠান নির্বাচন করুন' : 'Select Utility Biller'}
                    </label>
                    <select
                      value={selectedBiller?.id}
                      onChange={(e) => {
                        const found = BILLERS.find((b) => b.id === e.target.value);
                        if (found) setSelectedBiller(found);
                      }}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    >
                      {BILLERS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {language === 'bn' ? b.nameBn : b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'bn' ? 'গ্রাহক / মিটার নম্বর' : 'Account / Meter Number'}
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder={`e.g. ${selectedBiller?.accountNumberSample}`}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Add Money: Source Selection */}
              {actionType === 'add_money' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'bn' ? 'সেন্ড মানি মাধ্যম বা ব্যাংক নির্বাচন করুন' : 'Select Payment Method / Bank'}
                    </label>
                    <select
                      value={recipient || 'bKash (01712-345678)'}
                      onChange={(e) => {
                        setRecipient(e.target.value);
                        setError(null);
                      }}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                    >
                      <optgroup label={language === 'bn' ? 'মোবাইল ব্যাংকিং (সক্রিয় - সেন্ড মানি)' : 'Mobile Banking (Active Send Money)'}>
                        <option value="bKash (01712-345678)">bKash (বিকাশ - 01712-345678)</option>
                        <option value="Nagad (01899-876543)">Nagad (নগদ - 01899-876543)</option>
                        <option value="Rocket (01911-223344-9)">Rocket (রকেট - 01911-223344-9)</option>
                        <option value="Upay (01677-556677)">Upay (উপায় - 01677-556677)</option>
                      </optgroup>
                      <optgroup label={language === 'bn' ? 'ব্যাংক ট্রান্সফার (দৈনিক লিমিট শেষ ⚠️)' : 'Bank Transfer (Limit Reached ⚠️)'}>
                        <option value="City Bank Ltd (সিটি ব্যাংক - A/C 4821)">City Bank Ltd (সিটি ব্যাংক)</option>
                        <option value="BRAC Bank (ব্র্যাক ব্যাংক - A/C 9102)">BRAC Bank (ব্র্যাক ব্যাংক)</option>
                        <option value="Dutch-Bangla Bank (ডিবিবিএল)">Dutch-Bangla Bank (ডিবিবিএল)</option>
                        <option value="Islami Bank Bangladesh (ইসলামী ব্যাংক)">Islami Bank Bangladesh</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Bank Limit Notice or MFS Send Money Display Card */}
                  {isBankSelected ? (
                    <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-3 text-xs animate-in fade-in">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-rose-100 rounded-xl text-rose-700 shrink-0 mt-0.5">
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-rose-950">
                              {language === 'bn' ? 'ব্যাংকের লিমিট শেষ!' : 'Bank Daily Limit Exhausted!'}
                            </h4>
                            <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                              {language === 'bn' ? 'অচল' : 'Temporarily Unavailable'}
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-900 leading-relaxed font-semibold">
                            {language === 'bn'
                              ? 'ব্যাংকের লিমিট শেষ! এই মুহূর্তে পেমেন্ট করা সম্ভব হচ্ছে না, অনুগ্রহ করে সেন্ড মানি করুন।'
                              : 'Bank daily limit reached! Payments via bank are currently unavailable. Please send money via bKash, Nagad or Rocket.'}
                          </p>
                          <p className="text-[10px] text-slate-600">
                            {language === 'bn'
                              ? 'বাংলাদেশ ব্যাংকের আরটিজিএস ও এনপিএসবি কোটা শেষ হওয়ায় সরাসরি ব্যাংক অ্যাকাউন্ট থেকে টাকা অ্যাড করা যাচ্ছে না।'
                              : 'Central bank daily transfer quota exhausted. Please use MFS Send Money instead.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setRecipient('bKash (01712-345678)');
                          setError(null);
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-[#E2136E] to-[#F7941D] hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>{language === 'bn' ? 'বিকাশ / নগদে সেন্ড মানি করুন (সক্রিয়)' : 'Switch to bKash / Nagad Send Money'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/90 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-rose-900 font-semibold">
                        <span>{language === 'bn' ? 'অফিসিয়াল সেন্ড মানি নম্বর:' : 'Official Send Money Number:'}</span>
                        <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">Personal</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-rose-200 shadow-2xs">
                        <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider">
                          {recipient ? recipient.split('(')[1]?.replace(')', '') || '01712-345678' : '01712-345678'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const num = recipient ? recipient.split('(')[1]?.replace(')', '') || '01712-345678' : '01712-345678';
                            navigator.clipboard.writeText(num);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{language === 'bn' ? 'কপি নম্বর' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-tight">
                        {language === 'bn'
                          ? 'আপনার বিকাশ, নগদ বা রকেট অ্যাপ ওপেন করে উপরের নম্বরে টাকা "সেন্ড মানি" করুন।'
                          : 'Open your bKash, Nagad or Rocket app and "Send Money" to the receiver number above.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {language === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    min="10"
                    className="w-full text-xl font-bold font-mono pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                {/* Quick amount chips */}
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000, 2500, 5000].map((quickAmt) => (
                    <button
                      key={quickAmt}
                      type="button"
                      onClick={() => setAmount(quickAmt.toString())}
                      className="px-2.5 py-1 text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                    >
                      ৳{quickAmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note / Reference */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {language === 'bn' ? 'রেফারেন্স / নোট (ঐচ্ছিক)' : 'Reference / Note (Optional)'}
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Lunch bill, rent, gift"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextToReview}
                disabled={isBankSelected}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isBankSelected
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                    : 'bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white'
                }`}
              >
                {isBankSelected ? (
                  <span>{language === 'bn' ? 'ব্যাংকের লিমিট শেষ - সেন্ড মানি করুন' : 'Bank Limit Exhausted - Use Send Money'}</span>
                ) : (
                  <>
                    <span>{language === 'bn' ? 'পরবর্তী ধাপে যান' : 'Proceed to Review'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ================= STEP 2: REVIEW ================= */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{language === 'bn' ? 'প্রাপক / লক্ষ্য:' : 'Recipient / Target:'}</span>
                  <span className="font-semibold text-slate-900">{recipient || 'Self'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{language === 'bn' ? 'পরিমাণ:' : 'Amount:'}</span>
                  <span className="font-bold text-slate-900 font-mono">৳{numAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{language === 'bn' ? 'চার্জ / ফি:' : 'Charge / Fee:'}</span>
                  <span className="font-mono text-slate-900">{fee > 0 ? `৳${fee}` : '৳0 (Free)'}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>{language === 'bn' ? 'সর্বমোট কর্তন:' : 'Total Payable:'}</span>
                  <span className="text-rose-600 font-mono">
                    ৳{actionType === 'add_money' ? numAmount.toLocaleString() : totalDeduction.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  {language === 'bn'
                    ? `লেনদেন পরবর্তী ব্যালেন্স হবে ৳${(actionType === 'add_money' ? currentBalance + numAmount : currentBalance - totalDeduction).toLocaleString()}`
                    : `Estimated balance after: ৳${(actionType === 'add_money' ? currentBalance + numAmount : currentBalance - totalDeduction).toLocaleString()}`}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  {language === 'bn' ? 'পেছনে যান' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPin}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পিন দিন' : 'Enter PIN'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PIN ================= */}
          {step === 'pin' && (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {language === 'bn' ? 'আপনার ৪ ডিজিটের পিন নম্বর লিখুন' : 'Enter Your 4-Digit Wallet PIN'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'bn' ? 'নিরাপত্তার স্বার্থে গোপন পিন কারও সাথে শেয়ার করবেন না' : 'Demo PIN: Type any 4 numbers (e.g. 1234)'}
                </p>
              </div>

              {/* PIN Display Dots */}
              <div className="flex justify-center gap-3 my-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all ${
                      pin.length > idx
                        ? 'border-rose-600 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    {pin.length > idx ? '●' : ''}
                  </div>
                ))}
              </div>

              {/* Virtual Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (k === 'C') setPin('');
                      else if (k === '⌫') setPin((p) => p.slice(0, -1));
                      else if (pin.length < 4) setPin((p) => p + k);
                    }}
                    className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl font-bold text-slate-800 text-sm transition-colors"
                  >
                    {k}
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmWithPin}
                disabled={pin.length !== 4 || isProcessing}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{language === 'bn' ? 'লেনদেন সম্পন্ন হচ্ছে...' : 'Processing Transaction...'}</span>
                  </>
                ) : (
                  <span>{language === 'bn' ? 'লেনদেন নিশ্চিত করুন' : 'Confirm Transaction'}</span>
                )}
              </button>
            </div>
          )}

          {/* ================= STEP 4: SUCCESS RECEIPT ================= */}
          {step === 'success' && completedTx && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-lg">
                  {language === 'bn' ? 'লেনদেন সফল হয়েছে!' : 'Transaction Successful!'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {completedTx.timestamp}
                </p>
              </div>

              {/* Receipt Ticket */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">{language === 'bn' ? 'লেনদেনের ধরন:' : 'Type:'}</span>
                  <span className="font-semibold text-slate-900">
                    {language === 'bn' ? completedTx.titleBn : completedTx.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'পরিমাণ:' : 'Amount:'}</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">৳{completedTx.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'চার্জ:' : 'Fee:'}</span>
                  <span className="font-mono text-slate-900">৳{completedTx.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'রেফারেন্স আইডি:' : 'Trx ID:'}</span>
                  <span className="font-mono font-bold text-rose-600">{completedTx.referenceId}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all"
              >
                {language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
