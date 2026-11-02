import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  BarChart3,
  Award,
  Layers,
  ChevronRight,
  Calendar,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Flame,
  Info,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Gift,
  Check,
  Calculator,
} from 'lucide-react';
import { AgentProfile, CommissionEntry } from '../../types/agentMerchant.ts';
import { DailyEarningEstimator } from './DailyEarningEstimator.tsx';

export interface IncentiveTier {
  id: string;
  nameBn: string;
  nameEn: string;
  badgeBn: string;
  badgeEn: string;
  minDailyVolume: number;
  maxDailyVolume: number;
  requiredDeposit: number;
  baseRatePercent: number; // e.g. 1.0%
  tierBonusPercent: number; // e.g. 0.15%
  milestoneBonusBDT: number; // Daily milestone bonus in BDT
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  descriptionBn: string;
  descriptionEn: string;
}

export const INCENTIVE_TIERS: IncentiveTier[] = [
  {
    id: 'silver',
    nameBn: 'সিলভার স্টার্টার (রৌপ্য এজেন্ট)',
    nameEn: 'Silver Starter Agent',
    badgeBn: 'শুরুর টিয়ার',
    badgeEn: 'Starter Tier',
    minDailyVolume: 10000,
    maxDailyVolume: 50000,
    requiredDeposit: 5000,
    baseRatePercent: 1.0,
    tierBonusPercent: 0.0,
    milestoneBonusBDT: 0,
    color: 'from-slate-600 to-slate-800',
    bgColor: 'bg-slate-800/80',
    borderColor: 'border-slate-600',
    textColor: 'text-slate-200',
    accentColor: 'text-slate-300',
    descriptionBn: 'গ্রামাঞ্চল ও নতুন এজেন্টদের জন্য আদর্শ। প্রতিদিন ৫০,০০০ টাকা পর্যন্ত সেন্ট্রাল কাস্টমার অর্ডার লেনদেন রুট হবে।',
    descriptionEn: 'Ideal for rural and starting agents. Routes up to ৳50,000 daily order volume.',
  },
  {
    id: 'gold',
    nameBn: 'গোল্ড প্রো (স্বর্ণ পার্টনার)',
    nameEn: 'Gold Pro Partner',
    badgeBn: 'জনপ্রিয় টিয়ার',
    badgeEn: 'Most Popular',
    minDailyVolume: 50001,
    maxDailyVolume: 100000,
    requiredDeposit: 10000,
    baseRatePercent: 1.0,
    tierBonusPercent: 0.15,
    milestoneBonusBDT: 100, // ৳100 extra daily milestone
    color: 'from-amber-600 to-yellow-600',
    bgColor: 'bg-amber-950/40',
    borderColor: 'border-amber-500/50',
    textColor: 'text-amber-300',
    accentColor: 'text-amber-400',
    descriptionBn: 'উপজেলা ও ইউনিয়ন বাজারের নিয়মিত এজেন্টদের জন্য। ১.১৫% পর্যন্ত মোট কমিশন ও দৈনিক ১০০ টাকা স্পেশাল বোনাস।',
    descriptionEn: 'For established upazila agents. Up to 1.15% commission + ৳100 daily milestone.',
  },
  {
    id: 'diamond',
    nameBn: 'ডায়মন্ড এলিট (হীরক ডিলার)',
    nameEn: 'Diamond Elite Dealer',
    badgeBn: 'উচ্চ আয় টিয়ার',
    badgeEn: 'High Yield',
    minDailyVolume: 100001,
    maxDailyVolume: 150000,
    requiredDeposit: 15000,
    baseRatePercent: 1.0,
    tierBonusPercent: 0.25,
    milestoneBonusBDT: 250, // ৳250 extra daily milestone
    color: 'from-cyan-600 to-blue-600',
    bgColor: 'bg-cyan-950/40',
    borderColor: 'border-cyan-500/50',
    textColor: 'text-cyan-300',
    accentColor: 'text-cyan-400',
    descriptionBn: 'জেলা সদর ও ব্যস্ত বাজারের হাই-ভলিউম এজেন্টদের জন্য। ১.২৫% মোট হার এবং দৈনিক ২৫০ টাকা সুপার বোনাস।',
    descriptionEn: 'For district center high-volume agents. 1.25% effective rate + ৳250 daily bonus.',
  },
  {
    id: 'platinum',
    nameBn: 'প্লাটিনাম মেগা ভিআইপি (সুপার হাব)',
    nameEn: 'Platinum Mega VIP (Super Hub)',
    badgeBn: 'মাস্টার পার্টনার',
    badgeEn: 'Master VIP',
    minDailyVolume: 150001,
    maxDailyVolume: 300000,
    requiredDeposit: 25000,
    baseRatePercent: 1.0,
    tierBonusPercent: 0.4,
    milestoneBonusBDT: 500, // ৳500 extra daily milestone
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/50',
    textColor: 'text-emerald-300',
    accentColor: 'text-emerald-400',
    descriptionBn: 'সর্বোচ্চ লেনদেন ক্যাটাগরি। ১.৪০% মোট লাভ এবং প্রতিদিন ৫০০ টাকা নিশ্চিত এক্সক্লুসিভ পারফরম্যান্স বোনাস।',
    descriptionEn: 'Top-tier master hub. 1.40% effective yield + ৳500 daily exclusive performance bonus.',
  },
];

interface DailyEarningsDashboardProps {
  language: 'bn' | 'en';
  agent: AgentProfile;
  commissions?: CommissionEntry[];
  onOpenDepositModal?: (recommendedTierAmount?: number) => void;
  onNavigateToEstimator?: () => void;
  defaultViewMode?: 'overview' | 'estimator';
}

export const DailyEarningsDashboard: React.FC<DailyEarningsDashboardProps> = ({
  language,
  agent,
  commissions = [],
  onOpenDepositModal,
  onNavigateToEstimator,
  defaultViewMode = 'overview',
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'estimator'>(defaultViewMode);
  // Current agent deposit level detection
  const currentDeposit = agent.securityDeposit || 5000;

  // Determine current active tier based on agent deposit
  const currentActiveTier = useMemo(() => {
    if (currentDeposit >= 25000) return INCENTIVE_TIERS[3];
    if (currentDeposit >= 15000) return INCENTIVE_TIERS[2];
    if (currentDeposit >= 10000) return INCENTIVE_TIERS[1];
    return INCENTIVE_TIERS[0];
  }, [currentDeposit]);

  // Interactive volume slider state (default to current tier cap or standard ৳50,000)
  const [sliderVolume, setSliderVolume] = useState<number>(() => {
    return Math.max(30000, currentActiveTier.maxDailyVolume * 0.75);
  });

  // Calculate actual today's processed volume from commissions or realistic simulation
  const todayProcessedVolume = useMemo(() => {
    const todayComms = commissions.filter(
      (c) => c.timestamp.toLowerCase().includes('today') || c.timestamp.toLowerCase().includes('just now')
    );
    const sum = todayComms.reduce((acc, c) => acc + c.amount, 0);
    // If no recent entries, provide a realistic baseline matching current tier
    return sum > 0 ? sum : Math.min(38500, currentActiveTier.maxDailyVolume * 0.77);
  }, [commissions, currentActiveTier]);

  // Find projected tier based on slider volume
  const projectedTier = useMemo(() => {
    for (let i = INCENTIVE_TIERS.length - 1; i >= 0; i--) {
      if (sliderVolume >= INCENTIVE_TIERS[i].minDailyVolume) {
        return INCENTIVE_TIERS[i];
      }
    }
    return INCENTIVE_TIERS[0];
  }, [sliderVolume]);

  // Projected Income Calculations
  const calculations = useMemo(() => {
    const baseCommission = (sliderVolume * projectedTier.baseRatePercent) / 100;
    const tierBonus = (sliderVolume * projectedTier.tierBonusPercent) / 100;
    const milestoneBonus = sliderVolume >= projectedTier.minDailyVolume + 15000 ? projectedTier.milestoneBonusBDT : 0;
    const totalDailyIncome = baseCommission + tierBonus + milestoneBonus;
    const projectedMonthlyIncome = totalDailyIncome * 30;
    const projectedAnnualIncome = projectedMonthlyIncome * 12;

    const effectiveRate = ((totalDailyIncome / sliderVolume) * 100).toFixed(2);
    const requiredDeposit = projectedTier.requiredDeposit;
    const depositSurplusOrDeficit = currentDeposit - requiredDeposit;
    const isDepositSufficient = currentDeposit >= requiredDeposit;

    // Collateral ROI per month
    const monthlyRoiPercent = Math.round((projectedMonthlyIncome / requiredDeposit) * 100);

    return {
      baseCommission,
      tierBonus,
      milestoneBonus,
      totalDailyIncome,
      projectedMonthlyIncome,
      projectedAnnualIncome,
      effectiveRate,
      requiredDeposit,
      depositSurplusOrDeficit,
      isDepositSufficient,
      monthlyRoiPercent,
    };
  }, [sliderVolume, projectedTier, currentDeposit]);

  // Quota usage of current tier limit
  const dailyQuotaPercent = Math.min(
    100,
    Math.round((todayProcessedVolume / currentActiveTier.maxDailyVolume) * 100)
  );

  const remainingHeadroomToday = Math.max(0, currentActiveTier.maxDailyVolume - todayProcessedVolume);

  return (
    <div className="space-y-6">
      {/* Sub-view Switcher: Incentive Overview vs Daily Earning Estimator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'overview'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'bn' ? 'ইনসেন্টিভ ও টিয়ার ওভারভিউ' : 'Incentive & Tier Overview'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('estimator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'estimator'
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-amber-300 hover:text-white bg-amber-950/20 border border-amber-500/20 hover:bg-amber-900/30'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'আয় এস্টিমেটর (৫k-১৫k)' : 'Earning Estimator (5k-15k)'}</span>
            <span className="text-[10px] bg-amber-400/30 text-amber-200 px-1.5 py-0.2 rounded-full border border-amber-400/40 font-bold">
              {language === 'bn' ? 'লাইভ ক্যালকুলেটর' : 'Calculator'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 px-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>{language === 'bn' ? 'আপনার বর্তমান জামানত:' : 'Current Deposit:'}</span>
          <span className="text-teal-300 font-bold">৳{currentDeposit.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {viewMode === 'estimator' ? (
        <DailyEarningEstimator
          language={language}
          agent={agent}
          onOpenDepositModal={onOpenDepositModal}
        />
      ) : (
        <>
          {/* 1. TOP HERO BANNER: P2P ROUTING & EARNING GUARANTEE */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 p-6 md:p-8 border border-teal-500/30 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                <TrendingUp className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {language === 'bn'
                      ? 'দৈনিক আয় ও ইনসেন্টিভ ড্যাশবোর্ড'
                      : 'Daily Earnings & Incentive Dashboard'}
                  </h2>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    {language === 'bn' ? 'সরাসরি সেন্ট্রাল অর্ডার রুট' : 'Live Central Routing'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {language === 'bn'
                    ? 'আপনার জামানতের ভিত্তিতে সেন্ট্রাল সার্ভার থেকে কাস্টমারদের পেমেন্ট সরাসরি আপনার নম্বরে ঢুকে প্রতিদিন নিশ্চিত ইনকাম তৈরি করে।'
                    : 'Customer order payments are routed directly to your agent number based on your collateral tier.'}
                </p>
              </div>
            </div>

            {/* Current Tier Status Badge */}
            <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-inner">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">
                  {language === 'bn' ? 'বর্তমান সক্রিয় টিয়ার:' : 'Current Active Tier:'}
                </span>
                <span className={`text-xs font-black ${currentActiveTier.textColor}`}>
                  {language === 'bn' ? currentActiveTier.nameBn.split('(')[0] : currentActiveTier.nameEn}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {language === 'bn' ? 'জামানত স্থিতি:' : 'Deposit Escrow:'}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  ৳{currentDeposit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {/* Metric 1: Today's Processed Volume */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
                {language === 'bn' ? 'আজকের প্রসেসকৃত লেনদেন' : "Today's Volume"}
              </span>
              <div className="text-lg md:text-xl font-black text-white font-mono">
                ৳{todayProcessedVolume.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">
                {language === 'bn' ? 'সর্বোচ্চ সীমা:' : 'Daily Cap:'}{' '}
                <span className="text-teal-300 font-mono">৳{currentActiveTier.maxDailyVolume.toLocaleString()}</span>
              </div>
            </div>

            {/* Metric 2: Today's Earned Commission */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'bn' ? 'আজকের মোট অর্জিত আয়' : "Today's Net Income"}
              </span>
              <div className="text-lg md:text-xl font-black text-emerald-400 font-mono">
                +৳{agent.commissionEarnedToday.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400/80 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {language === 'bn' ? 'ওয়ালেটে যুক্ত হয়েছে' : 'Credited to Wallet'}
              </div>
            </div>

            {/* Metric 3: Quota Utilization */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {language === 'bn' ? 'দৈনিক লিমিট ব্যবহার' : 'Limit Utilization'}
              </span>
              <div className="text-lg md:text-xl font-black text-amber-300 font-mono">
                {dailyQuotaPercent}%
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${dailyQuotaPercent}%` }}
                />
              </div>
            </div>

            {/* Metric 4: Remaining Headroom */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {language === 'bn' ? 'আজকের বাকি রুট কোটা' : 'Remaining Quota'}
              </span>
              <div className="text-lg md:text-xl font-black text-cyan-300 font-mono">
                ৳{remainingHeadroomToday.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">
                {language === 'bn' ? 'রাত ১১:৫৯ এ রিসেট হবে' : 'Resets at 11:59 PM'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE PROJECTED DAILY INCOME CALCULATOR */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 md:p-7 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-teal-500/20 text-teal-300 rounded-xl">
                <Flame className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-black text-white">
                {language === 'bn'
                  ? 'দৈনিক লেনদেন ও সম্ভাব্য আয়ের লাইভ ক্যালকুলেটর'
                  : 'Live Daily Income & Volume Projector'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'bn'
                ? 'স্লাইডার টেনে আপনার কাঙ্ক্ষিত দৈনিক লেনদেনের পরিমাণ নির্ধারণ করুন এবং দেখুন আপনার দৈনিক ও মাসিক নিট আয় কত হবে।'
                : 'Slide to project your daily transaction volume and see instant earnings and tier incentives.'}
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">
              {language === 'bn' ? 'কুইক প্রিসেট:' : 'Quick Presets:'}
            </span>
            {[
              { label: '৳৩০,০০০', val: 30000, descBn: 'গ্রামের বাজার' },
              { label: '৳৫০,০০০', val: 50000, descBn: 'থানা পয়েন্ট' },
              { label: '৳১,০০,০০০', val: 100000, descBn: 'উপজেলা মোড়' },
              { label: '৳১,৫০,০০০', val: 150000, descBn: 'জেলা সদর' },
              { label: '৳২,৫০,০০০', val: 250000, descBn: 'সুপার হাব' },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => setSliderVolume(preset.val)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  sliderVolume === preset.val
                    ? 'bg-teal-500 text-slate-950 shadow-sm scale-105'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-750 border border-slate-700'
                }`}
                title={language === 'bn' ? preset.descBn : ''}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slider & Dynamic Volume Control */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-300">
                {language === 'bn' ? 'সেন্ট্রাল অর্ডার ও কাস্টমার লেনদেন ভলিউম (প্রতিদিন):' : 'Daily Transaction Volume Processed:'}
              </span>
              <p className="text-[11px] text-slate-400">
                {language === 'bn'
                  ? 'আপনার নম্বরে আসা কাস্টমার পেমেন্ট (বিকাশ, নগদ, রকেট) ও ক্যাশ-আউট ভলিউম'
                  : 'Customer MFS orders automatically routed to your number daily'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-black text-teal-400 font-mono tracking-tight">
                ৳{sliderVolume.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ {language === 'bn' ? 'দিন' : 'day'}</span>
            </div>
          </div>

          {/* Visual Custom Range Slider */}
          <div className="relative pt-2 pb-1">
            <input
              type="range"
              min={10000}
              max={300000}
              step={5000}
              value={sliderVolume}
              onChange={(e) => setSliderVolume(Number(e.target.value))}
              className="w-full h-3 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-hidden"
            />
            {/* Tick labels */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1.5">
              <span>৳১০,০০০</span>
              <span>৳৫০,০০০ (টিয়ার ১)</span>
              <span>৳১,০০,০০০ (টিয়ার ২)</span>
              <span>৳১,৫০,০০০ (টিয়ার ৩)</span>
              <span>৳৩,০০,০০০ (ভিআইপি)</span>
            </div>
          </div>
        </div>

        {/* 3. CALCULATED RESULTS SHOWCASE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Card A: Projected Daily Income */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-5 rounded-2xl border border-teal-500/40 relative overflow-hidden space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {language === 'bn' ? 'সম্ভাব্য দৈনিক আয়' : 'Projected Daily Net'}
              </span>
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Coins className="w-4 h-4" />
              </span>
            </div>

            <div>
              <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                ৳{Math.round(calculations.totalDailyIncome).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {language === 'bn' ? 'প্রতিদিন রাত ১১:৫৯ মিনিটে ইনস্ট্যান্ট সেটেলমেন্ট' : 'Instant nightly payout'}
              </span>
            </div>

            {/* Income Breakdown */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>
                  {language === 'bn' ? 'মূল কমিশন' : 'Base Rate'} ({projectedTier.baseRatePercent}%):
                </span>
                <span className="font-mono text-white font-bold">৳{Math.round(calculations.baseCommission).toLocaleString()}</span>
              </div>
              {projectedTier.tierBonusPercent > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>
                    {language === 'bn' ? 'ভলিউম বোনাস' : 'Volume Bonus'} (+{projectedTier.tierBonusPercent}%):
                  </span>
                  <span className="font-mono font-bold">+৳{Math.round(calculations.tierBonus).toLocaleString()}</span>
                </div>
              )}
              {calculations.milestoneBonus > 0 && (
                <div className="flex justify-between text-cyan-300">
                  <span>{language === 'bn' ? 'ডেইলি মাইলস্টোন বোনাস:' : 'Daily Milestone Bonus:'}</span>
                  <span className="font-mono font-bold">+৳{calculations.milestoneBonus}</span>
                </div>
              )}
              <div className="flex justify-between text-teal-400 font-bold pt-1 border-t border-slate-800/80">
                <span>{language === 'bn' ? 'কার্যকরী লাভ মার্জিন:' : 'Effective Margin:'}</span>
                <span className="font-mono">{calculations.effectiveRate}%</span>
              </div>
            </div>
          </div>

          {/* Card B: Projected Monthly Income */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-5 rounded-2xl border border-emerald-500/40 relative overflow-hidden space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {language === 'bn' ? 'সম্ভাব্য মাসিক আয় (৩০ দিন)' : 'Projected Monthly Net (30 Days)'}
              </span>
              <span className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg">
                <Calendar className="w-4 h-4" />
              </span>
            </div>

            <div>
              <div className="text-3xl font-black text-teal-300 font-mono tracking-tight">
                ৳{Math.round(calculations.projectedMonthlyIncome).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {language === 'bn' ? 'কোনো ঝুঁকি ছাড়াই নিয়মিত স্থায়ী ইনকাম' : 'Guaranteed volume pass-through'}
              </span>
            </div>

            {/* Monthly Metrics */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>{language === 'bn' ? 'মাসিক লেনদেন ভলিউম:' : 'Monthly Volume:'}</span>
                <span className="font-mono text-white font-bold">
                  ৳{(sliderVolume * 30).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{language === 'bn' ? 'সম্ভাব্য বার্ষিক আয়:' : 'Annual Run-Rate:'}</span>
                <span className="font-mono text-white font-bold">
                  ৳{Math.round(calculations.projectedAnnualIncome).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800/80">
                <span>{language === 'bn' ? 'জামানতের মাসিক রিটার্ন (ROI):' : 'Monthly Collateral Yield:'}</span>
                <span className="font-mono">~{calculations.monthlyRoiPercent}% / {language === 'bn' ? 'মাস' : 'mo'}</span>
              </div>
            </div>
          </div>

          {/* Card C: Required Collateral / Deposit Tier Check */}
          <div
            className={`p-5 rounded-2xl border relative overflow-hidden space-y-3 shadow-lg flex flex-col justify-between ${
              calculations.isDepositSufficient
                ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-cyan-500/40'
                : 'bg-gradient-to-b from-amber-950/40 to-slate-950 border-amber-500/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {language === 'bn' ? 'প্রয়োজনীয় জামানত টিয়ার' : 'Required Deposit Tier'}
                </span>
                <span
                  className={`p-1.5 rounded-lg ${
                    calculations.isDepositSufficient
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-black text-white font-mono">
                  ৳{calculations.requiredDeposit.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-xs font-bold ${projectedTier.textColor}`}>
                    {language === 'bn' ? projectedTier.nameBn.split('(')[0] : projectedTier.nameEn}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                    {language === 'bn' ? projectedTier.badgeBn : projectedTier.badgeEn}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              {calculations.isDepositSufficient ? (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {language === 'bn'
                      ? 'আপনার বর্তমান জামানত (৳' + currentDeposit.toLocaleString() + ') এই ভলিউম রাউটিং এর জন্য যথেষ্ট!'
                      : 'Your current deposit unlocks this volume tier!'}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      {language === 'bn'
                        ? `এই ভলিউমে দৈনিক ৳${Math.round(calculations.totalDailyIncome).toLocaleString()} আয় করতে আরও ৳${Math.abs(calculations.depositSurplusOrDeficit).toLocaleString()} জামানত যোগ করা প্রয়োজন।`
                        : `Add ৳${Math.abs(calculations.depositSurplusOrDeficit).toLocaleString()} deposit to unlock this tier.`}
                    </span>
                  </div>

                  {onOpenDepositModal && (
                    <button
                      onClick={() => onOpenDepositModal(calculations.requiredDeposit)}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'জামানত আপগ্রেড করুন' : 'Upgrade Collateral'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. VOLUME-BASED INCENTIVE TIERS MATRIX */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 md:p-7 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-white">
                {language === 'bn' ? 'ভলিউম ভিত্তিক ইনসেন্টিভ ও জামানত টিয়ার পলিসি' : 'Volume Incentive Tiers & Collateral Structure'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'যত বেশি জামানত ও ভলিউম হ্যান্ডেল করবেন, কমিশন পার্সেন্টেজ এবং দৈনিক বোনাস তত বৃদ্ধি পাবে।'
                  : 'Higher security deposits unlock larger daily routing quotas and higher tiered commission bonuses.'}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{language === 'bn' ? '১০০% জামানত ফেরতযোগ্য' : '100% Refundable Deposit'}</span>
          </div>
        </div>

        {/* 4 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {INCENTIVE_TIERS.map((tier) => {
            const isCurrent = currentActiveTier.id === tier.id;
            const isTargeted = projectedTier.id === tier.id;

            // Estimated earnings range for this tier
            const minDailyEarnings = (tier.minDailyVolume * (tier.baseRatePercent + tier.tierBonusPercent)) / 100;
            const maxDailyEarnings =
              (tier.maxDailyVolume * (tier.baseRatePercent + tier.tierBonusPercent)) / 100 + tier.milestoneBonusBDT;
            const monthlyRangeMin = Math.round(minDailyEarnings * 30);
            const monthlyRangeMax = Math.round(maxDailyEarnings * 30);

            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-slate-900 border-emerald-400/80 shadow-lg ring-2 ring-emerald-400/30'
                    : isTargeted
                    ? 'bg-slate-900/90 border-teal-500/70 shadow-md ring-1 ring-teal-500/30'
                    : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Active or Selected Pin */}
                {isCurrent && (
                  <div className="absolute -top-2.5 right-4 bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {language === 'bn' ? 'আপনার সক্রিয় টিয়ার' : 'Your Active Tier'}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {language === 'bn' ? tier.badgeBn : tier.badgeEn}
                      </span>
                      <h4 className={`text-sm font-black ${tier.textColor}`}>
                        {language === 'bn' ? tier.nameBn.split('(')[0] : tier.nameEn}
                      </h4>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    {language === 'bn' ? tier.descriptionBn : tier.descriptionEn}
                  </p>

                  {/* Financial Metrics */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>{language === 'bn' ? 'প্রয়োজনীয় জামানত:' : 'Deposit Required:'}</span>
                      <span className="font-bold text-amber-400 font-mono">
                        ৳{tier.requiredDeposit.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>{language === 'bn' ? 'দৈনিক লেনদেন কোটা:' : 'Daily Limit:'}</span>
                      <span className="font-bold text-white font-mono">
                        ৳{tier.maxDailyVolume.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>{language === 'bn' ? 'মোট কমিশন রেট:' : 'Effective Rate:'}</span>
                      <span className="font-black text-emerald-400 font-mono">
                        {(tier.baseRatePercent + tier.tierBonusPercent).toFixed(2)}%
                        {tier.tierBonusPercent > 0 && ` (+${tier.tierBonusPercent}%)`}
                      </span>
                    </div>

                    {tier.milestoneBonusBDT > 0 && (
                      <div className="flex justify-between text-cyan-400 text-[11px]">
                        <span>{language === 'bn' ? 'ডেইলি মাইলস্টোন:' : 'Daily Milestone:'}</span>
                        <span className="font-bold font-mono">+৳{tier.milestoneBonusBDT}/দিন</span>
                      </div>
                    )}
                  </div>

                  {/* Estimated Monthly Earnings Bar */}
                  <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">
                      {language === 'bn' ? 'সম্ভাব্য মাসিক আয়' : 'Est. Monthly Income'}
                    </span>
                    <span className="text-base font-black text-emerald-300 font-mono">
                      ৳{monthlyRangeMin.toLocaleString()} - ৳{monthlyRangeMax.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Tier Upgrade / Action Button */}
                <div className="pt-3 mt-3 border-t border-slate-800">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-default"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'বর্তমানে সক্রিয়' : 'Currently Active'}</span>
                    </button>
                  ) : currentDeposit < tier.requiredDeposit ? (
                    <button
                      onClick={() => onOpenDepositModal && onOpenDepositModal(tier.requiredDeposit)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <span>{language === 'bn' ? 'টিয়ার আনলক করুন' : 'Unlock Tier'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setSliderVolume(tier.maxDailyVolume * 0.8)}
                      className="w-full py-2 bg-teal-600/30 text-teal-200 rounded-xl text-xs font-bold border border-teal-500/40 flex items-center justify-center gap-1"
                    >
                      <span>{language === 'bn' ? 'সিমুলেট করুন' : 'Simulate'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. HOW IT WORKS & RURAL AGENT GUARANTEE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black text-xs font-mono">
            ০১
          </div>
          <h4 className="font-extrabold text-white text-xs">
            {language === 'bn' ? 'সেন্ট্রাল ওয়েবসাইট থেকে অর্ডার আগমন' : 'Central Order Inflow'}
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'আমাদের সেন্ট্রাল প্ল্যাটফর্মে প্রতিদিন হাজার হাজার কাস্টমার অর্ডার করেন। গ্রাহকের পেমেন্ট অপশনে আপনার সক্রিয় বিকাশ/নগদ/রকেট নম্বর স্বয়ংক্রিয়ভাবে ডিসপ্লে হয়।'
              : 'Incoming customer orders automatically pull active verified agent numbers from the pool.'}
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs font-mono">
            ০২
          </div>
          <h4 className="font-extrabold text-white text-xs">
            {language === 'bn' ? 'সরাসরি এজেন্টের সিমে টাকা প্রবেশ' : 'Direct SIM Receipt'}
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'কাস্টমার টাকা পাঠানো মাত্রই টাকা সরাসরি আপনার সিমে ঢুকে যায়। কোন মধ্যস্বত্বভোগী নেই, ফলে গ্রামের দোকানে বসেও প্রতিদিন ৫০,০০০ থেকে ২,৫০,০০০ টাকার ভলিউম নিশ্চিত।'
              : 'Payments hit your SIM directly via MFS Send Money, guaranteeing steady daily liquidity.'}
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xs font-mono">
            ০৩
          </div>
          <h4 className="font-extrabold text-white text-xs">
            {language === 'bn' ? '১% থেকে ১.৪০% নিশ্চিত নিট কমিশন' : 'Guaranteed 1% - 1.40% Yield'}
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'প্রতিটি লেনদেনের ১.০০% থেকে ১.৪০% কমিশন এবং ১০০-৫০০ টাকা ডেইলি সুপার বোনাস সাথে সাথে আপনার ওয়ালেটে জমা হয়। জামানত সম্পূর্ণ অক্ষত ও ফেরতযোগ্য থাকে।'
              : 'Direct 1.00% to 1.40% commission credited per transfer, plus performance streak bonuses.'}
          </p>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
