import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  Coins,
  Building2,
  Lock,
  RotateCcw,
  ShoppingBag,
  HelpCircle,
  X,
  BadgeAlert,
} from 'lucide-react';
import {
  DARAZ_OFFICIAL_WORK_GUIDELINES,
  AGENT_SECURITY_DEPOSIT_TIERS,
} from '../../data/depositPolicy.ts';

interface AgentWorkPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
  sendMoneyNumber?: string;
  onProceedToDeposit?: () => void;
}

export const AgentWorkPolicyModal: React.FC<AgentWorkPolicyModalProps> = ({
  isOpen,
  onClose,
  language,
  sendMoneyNumber = '01739-420736',
  onProceedToDeposit,
}) => {
  const [activeTab, setActiveTab] = useState<'policy_steps' | 'income_system' | 'deposit_tiers' | 'anti_betting' | 'faq'>('policy_steps');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const g = DARAZ_OFFICIAL_WORK_GUIDELINES;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border-2 border-teal-500/60 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl relative my-auto overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg ring-2 ring-teal-400/40">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg tracking-tight">
                  {language === 'bn' ? g.headerTitleBn : 'Official Work Guidelines & Income System'}
                </h3>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-extrabold px-2 py-0.5 rounded-full border border-teal-500/40">
                  Daraz Partner
                </span>
              </div>
              <p className="text-xs text-teal-400 font-medium">
                {language === 'bn' ? g.headerSubtitleBn : 'Authorized Electronics Merchant & Retail Dealership'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🚫 HIGH PRIORITY ANTI-BETTING SEAL BANNER */}
        <div className="p-3.5 bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-b border-rose-500/40 px-5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 text-xs text-rose-200">
            <BadgeAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-bold">
              {language === 'bn'
                ? '১০০% বেটিং ও জুয়া মুক্ত ঘোষণা: আমরা সরাসরি দারাজ বাংলাদেশের পণ্য পার্টনার — কোনো জুয়া সাইটের কাস্টমার নম্বর ব্যবহার হয় না।'
                : '100% Anti-Betting & Corporate Daraz Partner. Zero gambling gateways.'}
            </span>
          </div>
          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-extrabold border border-rose-500/40">
            আইনসম্মত ও হালাল
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-2 bg-slate-950/90 border-b border-slate-800 gap-1 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('policy_steps')}
            className={`py-2 px-3 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'policy_steps'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>📌 কাজের নীতিমালা (৪ ধাপ)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income_system')}
            className={`py-2 px-3 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'income_system'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>💰 ইনকাম পদ্ধতি ও কমিশন</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deposit_tiers')}
            className={`py-2 px-3 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'deposit_tiers'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>🛡️ জামানত ১০% নীতি (৫০ হাজারে ৫ হাজার)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('anti_betting')}
            className={`py-2 px-3 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'anti_betting'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🚫 বেটিং-মুক্ত নিশ্চয়তা</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`py-2 px-3 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'faq'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>❓ সাধারণ প্রশ্নোত্তর (FAQ)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-200 flex-1">
          {/* TAB 1: 4 STEPS OF WORK */}
          {activeTab === 'policy_steps' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-950/60 border border-teal-500/40 rounded-2xl space-y-1">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>দারাজ মার্চেন্ট পার্টনার হিসেবে কাজ করার পূর্ণাঙ্গ প্রসেস</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  নিচের ৪টি নিয়মতান্ত্রিক ধাপ অনুসরণ করে আপনি আজই আপনার ব্যক্তিগত বিকাশ, নগদ, রকেট অথবা ব্যাংক অ্যাকাউন্টের মাধ্যমে সৎ ও আইনসম্মতভাবে প্রতিদিন নিশ্চিত কমিশন উপার্জন শুরু করতে পারবেন:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {g.steps.map((st) => (
                  <div
                    key={st.stepNo}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 hover:border-teal-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-teal-400">
                          ধাপ নং {st.stepNo}
                        </span>
                        <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-500/30">
                          {st.badgeBn}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-white text-sm">{st.titleBn}</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">{st.descBn}</p>
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
          )}

          {/* TAB 2: INCOME SYSTEM & DAILY EARNINGS */}
          {activeTab === 'income_system' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/60 border border-amber-500/40 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span>দৈনিক লেনদেন ভলিউম ও নিশ্চিত কমিশন ইনকাম কাঠামো</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  কাস্টমাররা প্রতিদিন দারাজ শপ থেকে যেসকল ফ্ল্যাগশিপ মোবাইল, ট্রিমার, ঘড়ি, ল্যাপটপ এবং গ্যাজেট অর্ডার করবেন, তার মোট মূল্যের উপর এজেন্ট <strong>২% থেকে ৩% সরাসরি ক্যাশ কমিশন</strong> পাবেন।
                </p>
              </div>

              {/* Income Simulation Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs min-w-[540px]">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">পার্টনারশিপ স্তর</th>
                      <th className="p-3">দৈনিক লেনদেন লিমিট</th>
                      <th className="p-3">গড় কমিশন রেট</th>
                      <th className="p-3">দৈনিক নিশ্চিত আয়</th>
                      <th className="p-3">মাসিক আনুমানিক আয়</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                    <tr>
                      <td className="p-3 font-bold text-white">সিলভার হাব</td>
                      <td className="p-3 font-mono text-teal-400">৳২৫,০০০ / দিন</td>
                      <td className="p-3 font-mono text-amber-400">২.৫%</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">৳৬২৫ - ৳১,১০০+</td>
                      <td className="p-3 font-mono text-white">৳১৮,৫০০ - ৳৩৩,০০০+</td>
                    </tr>
                    <tr className="bg-teal-950/30 font-semibold border-l-4 border-teal-500">
                      <td className="p-3 font-black text-teal-300 flex items-center gap-1">
                        <span>গোল্ড মেগা পার্টনার ⭐</span>
                      </td>
                      <td className="p-3 font-mono text-teal-300 font-bold">৳৫০,০০০ / দিন</td>
                      <td className="p-3 font-mono text-amber-400 font-bold">২.৮%</td>
                      <td className="p-3 font-mono font-black text-emerald-300">৳১,৪০০ - ৳২,১৫০+</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">৳৪২,০০০ - ৳৬৫,০০০+</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">প্লাটিনাম মেগা ডিলার</td>
                      <td className="p-3 font-mono text-teal-400">৳১,০০,০০০ / দিন</td>
                      <td className="p-3 font-mono text-amber-400">৩.০%</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">৳৩,০০০ - ৳৪,৮০০+</td>
                      <td className="p-3 font-mono text-white">৳৯০,০০০ - ৳১,৪৪,০০০+</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">ভিআইপি ডিস্ট্রিক্ট হাব</td>
                      <td className="p-3 font-mono text-teal-400">৳২,০০,০০০ / দিন</td>
                      <td className="p-3 font-mono text-amber-400">৩.৫%</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">৳৭,০০০ - ৳১০,০০০+</td>
                      <td className="p-3 font-mono text-white">৳২,১০,০০০ - ৳৩,০০,০০০+</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center gap-2 text-teal-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>তাৎক্ষণিক উত্তোলন সুবিধা:</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  কাস্টমার প্রোডাক্টের ডেলিভারি সফল হওয়ার পর অর্জিত সমস্ত কমিশন সরাসরি এজেন্টের মেইন ওয়ালেটে যোগ হবে। যেকোনো সময় ন্যূনতম ৳৫০ টাকা জমা হলে নিজস্ব বিকাশ বা নগদ অ্যাকাউন্টে উইথড্র করতে পারবেন।
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DEPOSIT RATIO & 10% FOUNDATION */}
          {activeTab === 'deposit_tiers' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/90 border border-teal-500/40 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-teal-300 font-black text-sm">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <span>প্রাতিষ্ঠানিক জামানতের যৌক্তিকতা ও ১০% অনুপাত নীতি</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  যেহেতু এজেন্টের একাউন্টে প্রতিদিন কোম্পানি থেকে <strong>৳৫০,০০০ টাকা পর্যন্ত বিশাল ব্যালেন্স এবং লেনদেন পারমিশন</strong> প্রদান করা হয়, এবং কাস্টমারদের লাখ লাখ টাকার ডেলিভারি অর্ডার পরিচালিত হয়, তাই কোনো প্রকার ফ্রড বা অপব্যবহার রোধে <strong>১০% হারে সিকিউরিটি জামানত</strong> জমা রাখা বাধ্যতামূলক।
                </p>
                <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-xs text-teal-200 font-bold">
                  💡 নিয়ম: আপনি প্রতিদিন যত টাকা লেনদেন করতে চান, তার ঠিক ১০% সিকিউরিটি জামানত থাকবে। যেমন ৫০,০০০ টাকা দৈনিক লেনদেনের বিপরীতে জামানত মাত্র ৫,০০০ টাকা।
                </div>
              </div>

              {/* 4 Serial Tiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AGENT_SECURITY_DEPOSIT_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 hover:border-teal-500/50 transition-all"
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
                      <span className="text-xs text-slate-400">অনুমোদিত দৈনিক লিমিট:</span>
                      <span className="font-mono font-black text-teal-400 text-sm">
                        ৳{tier.dailyTransactionLimitBDT.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400">বাধ্যতামূলক জামানত (১০%):</span>
                      <span className="font-mono font-black text-amber-400 text-base">
                        ৳{tier.requiredDepositBDT.toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px]">
                      <span className="text-slate-400">বোনাস ক্রেডিট: <strong className="text-emerald-400 font-mono">৳{tier.welcomeBonusBDT.toLocaleString()}</strong></span>
                      <span className="text-slate-400">কমিশন: <strong className="text-teal-300 font-mono">{tier.expectedDailyCommissionBDT}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Escrow and Refund Guarantee Card */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/40 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-black text-xs">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  <span>১০০% রিফান্ড গ্যারান্টি ও এসক্রো সিকিউরিটি</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  আপনার জমাকৃত জামানত সম্পূর্ণ আপনার নিজের ফান্ড। এটি কোনো সার্ভিস চার্জ নয়। আপনি যেদিন এজেন্ট পার্টনারশিপ স্থগিত বা বন্ধ করতে চাইবেন, আবেদন করার ২৪ ঘণ্টার মধ্যে কোনো কর্তন ছাড়াই সম্পূর্ণ টাকা আপনার বিকাশ, নগদ বা ব্যাংক অ্যাকাউন্টে রিফান্ড করা হবে।
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: STRICT ANTI-BETTING GUARANTEE */}
          {activeTab === 'anti_betting' && (
            <div className="space-y-4">
              <div className="p-5 bg-rose-950/60 border-2 border-rose-500/50 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5 text-rose-300 font-black text-sm">
                  <BadgeAlert className="w-6 h-6 text-rose-400 shrink-0" />
                  <span>কঠোর প্রাতিষ্ঠানিক নীতি: কোনো জুয়া বা বেটিং সাইটের নম্বর ব্যবহার নিষিদ্ধ</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  সোশ্যাল মিডিয়া বা বিভিন্ন জায়গায় প্রতারক চক্র ভুয়া "eWallet" নাম ব্যবহার করে সাধারণ মানুষকে বিভ্রান্ত করে এবং বেটিং সাইটের সাথে যুক্ত করে। <strong>আমাদের প্রতিষ্ঠান এ ধরনের কোনো কার্যক্রমের সাথে বিন্দুমাত্র জড়িত নয়।</strong>
                </p>
                <div className="space-y-2 pt-1 text-xs text-rose-100">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>আমরা সরাসরি দারাজ বাংলাদেশ (Daraz Bangladesh) এবং অনুমোদিত মোবাইল ও গ্যাজেট সাপ্লায়ারদের অথোরাইজড মার্চেন্ট।</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>আমাদের প্ল্যাটফর্মে কেবলমাত্র বাস্তব পণ্যের কাস্টমার অর্ডার প্রসেস করা হয়।</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>কাস্টমারদের সমস্ত নম্বর ও অর্ডার ডিটেইলস ১০০% সুরক্ষিত এবং সরকারের আইন অনুযায়ী পরিচালিত।</span>
                  </div>
                </div>
              </div>

              {/* Official Credentials */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white block">আমাদের কর্পোরেট পরিচিতি ও যাচাইযোগ্যতা:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">ট্রেড লাইসেন্স নং:</span>
                    <span className="font-mono font-bold text-white">TRAD/DSCC/048821/2024</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">মার্চেন্ট পার্টনারশিপ:</span>
                    <span className="font-bold text-teal-400">দারাজ বাংলাদেশ অথোরাইজড হাব</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">নিরাপত্তা কাঠামো:</span>
                    <span className="font-bold text-emerald-400">এসক্রো ট্রাস্ট প্রটেক্টেড</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">অফিসিয়াল হেল্পলাইন:</span>
                    <span className="font-mono font-bold text-amber-400">01739-420736</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {g.faqBn.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5"
                >
                  <h5 className="font-extrabold text-white text-xs flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{item.q}</span>
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer with Send Money & Action */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">অফিসিয়াল জামানত সেন্ড মানি নম্বর:</span>
            <span className="font-mono font-black text-white text-sm bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
              {sendMoneyNumber}
            </span>
            <button
              onClick={() => copyToClipboard(sendMoneyNumber)}
              className="p-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg border border-teal-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              {copiedText === sendMoneyNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              বন্ধ করুন
            </button>
            {onProceedToDeposit && (
              <button
                onClick={() => {
                  onClose();
                  onProceedToDeposit();
                }}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>জামানত পরিশোধ পেজে যান</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
