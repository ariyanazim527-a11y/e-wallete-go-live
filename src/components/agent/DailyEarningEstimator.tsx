import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  Calculator,
  Sliders,
  Award,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Flame,
  ArrowUpRight,
  RefreshCw,
  Building2,
  Check,
  Percent,
  Calendar,
  Layers,
  ChevronRight,
  DollarSign,
  Wallet,
} from 'lucide-react';
import { AgentProfile } from '../../types/agentMerchant.ts';
import { INCENTIVE_TIERS, IncentiveTier } from './DailyEarningsDashboard.tsx';

interface DailyEarningEstimatorProps {
  language: 'bn' | 'en';
  agent: AgentProfile;
  onOpenDepositModal?: (recommendedTierAmount?: number) => void;
  onNavigateToTerminal?: () => void;
  isCompact?: boolean;
}

// Preset volume shortcut buttons (in BDT)
const VOLUME_PRESETS = [
  { volume: 30000, labelBn: '৳৩০,০০০ (বেসিক)', labelEn: '৳30k (Basic)' },
  { volume: 50000, labelBn: '৳৫০,০০০ (টিয়ার ১ - ৫ হাজার জামানত)', labelEn: '৳50k (Tier 1 - 5k Dep)' },
  { volume: 80000, labelBn: '৳৮০,০০০ (গ্রোথ)', labelEn: '৳80k (Growth)' },
  { volume: 100000, labelBn: '৳১,০০,০০০ (টিয়ার ২ - ১০ হাজার জামানত)', labelEn: '৳100k (Tier 2 - 10k Dep)' },
  { volume: 150000, labelBn: '৳১,৫০,০০০ (টিয়ার ৩ - ১৫ হাজার জামানত)', labelEn: '৳150k (Tier 3 - 15k Dep)' },
  { volume: 250000, labelBn: '৳২,৫০,০০০ (ভিআইপি সুপার হাব)', labelEn: '৳250k (VIP Hub)' },
];

export const DailyEarningEstimator: React.FC<DailyEarningEstimatorProps> = ({
  language,
  agent,
  onOpenDepositModal,
  onNavigateToTerminal,
  isCompact = false,
}) => {
  const currentDeposit = agent.securityDeposit || 5000;

  // Anticipated daily transaction volume state (defaults to ৳50,000 standard tier)
  const [anticipatedVolume, setAnticipatedVolume] = useState<number>(50000);
  const [inputValue, setInputValue] = useState<string>('50000');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [averageOrderSize, setAverageOrderSize] = useState<number>(2500); // ৳2,500 avg delivery order

  // Determine current active tier based on agent's actual security deposit
  const currentActiveTier = useMemo(() => {
    if (currentDeposit >= 25000) return INCENTIVE_TIERS[3];
    if (currentDeposit >= 15000) return INCENTIVE_TIERS[2];
    if (currentDeposit >= 10000) return INCENTIVE_TIERS[1];
    return INCENTIVE_TIERS[0];
  }, [currentDeposit]);

  // Determine which tier covers the anticipated volume
  const matchedTier: IncentiveTier = useMemo(() => {
    for (let i = INCENTIVE_TIERS.length - 1; i >= 0; i--) {
      if (anticipatedVolume > (i === 0 ? 0 : INCENTIVE_TIERS[i - 1].maxDailyVolume)) {
        return INCENTIVE_TIERS[i];
      }
    }
    return INCENTIVE_TIERS[0];
  }, [anticipatedVolume]);

  // Handle typing inside text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(rawVal);
    const num = parseInt(rawVal, 10);
    if (!isNaN(num)) {
      setAnticipatedVolume(Math.min(500000, Math.max(0, num)));
    } else {
      setAnticipatedVolume(0);
    }
  };

  // Quick increment/decrement
  const adjustVolume = (delta: number) => {
    const nextVal = Math.min(500000, Math.max(5000, anticipatedVolume + delta));
    setAnticipatedVolume(nextVal);
    setInputValue(nextVal.toString());
  };

  const selectPreset = (vol: number) => {
    setAnticipatedVolume(vol);
    setInputValue(vol.toString());
  };

  // Calculate detailed dynamic projections
  const projections = useMemo(() => {
    const vol = anticipatedVolume;
    const baseRate = matchedTier.baseRatePercent; // usually 1.0%
    const tierBonusRate = matchedTier.tierBonusPercent; // 0.0%, 0.15%, 0.25%, 0.40%
    const baseIncome = (vol * baseRate) / 100;
    const bonusIncome = (vol * tierBonusRate) / 100;

    // Milestone bonus unlocked if volume reaches minDailyVolume + 15k or 60% of tier cap
    const milestoneBonus = vol >= matchedTier.minDailyVolume ? matchedTier.milestoneBonusBDT : 0;

    const dailyTotal = baseIncome + bonusIncome + milestoneBonus;
    const monthlyTotal = dailyTotal * 30;
    const yearlyTotal = monthlyTotal * 12;

    const effectivePercent = vol > 0 ? ((dailyTotal / vol) * 100).toFixed(2) : '1.00';
    const estimatedDailyOrders = averageOrderSize > 0 ? Math.ceil(vol / averageOrderSize) : 0;

    const requiredDeposit = matchedTier.requiredDeposit;
    const isDepositSufficient = currentDeposit >= requiredDeposit;
    const depositShortfall = isDepositSufficient ? 0 : requiredDeposit - currentDeposit;

    // ROI on security deposit (Monthly income / required deposit)
    const monthlyDepositRoi = requiredDeposit > 0 ? Math.round((monthlyTotal / requiredDeposit) * 100) : 0;
    const dailyDepositRoi = requiredDeposit > 0 ? ((dailyTotal / requiredDeposit) * 100).toFixed(1) : '0';

    return {
      baseIncome,
      bonusIncome,
      milestoneBonus,
      dailyTotal,
      monthlyTotal,
      yearlyTotal,
      effectivePercent,
      estimatedDailyOrders,
      requiredDeposit,
      isDepositSufficient,
      depositShortfall,
      monthlyDepositRoi,
      dailyDepositRoi,
    };
  }, [anticipatedVolume, matchedTier, currentDeposit, averageOrderSize]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 rounded-3xl p-6 border border-indigo-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold">
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'bn' ? 'দৈনিক ইনকাম ও ইনসেন্টিভ এস্টিমেটর' : 'Daily Earning Estimator'}</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-md font-black">
                {language === 'bn' ? 'লাইভ ক্যালকুলেটর' : 'LIVE'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{language === 'bn' ? 'প্রত্যাশিত দৈনিক ভলিউম দিয়ে আয় যাচাই করুন' : 'Project Your Earnings by Transaction Volume'}</span>
              <Sparkles className="w-5 h-5 text-amber-400 hidden sm:inline" />
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'bn'
                ? 'আপনার এলাকায় প্রতিদিন যত টাকার কাস্টমার ডেলিভারি লেনদেন হবে তা টাইপ করুন। ৫ হাজারে ৫০ হাজার, ১০ হাজারে ১ লাখ এবং ১৫ হাজারে ১.৫ লাখ ভলিউমের ওপর আপনার নিশ্চিত কমিশন ও জামানতের রিটার্ন দেখুন।'
                : 'Input your anticipated daily customer transaction volume. See projected returns based on our official ৳5k for ৳50k, ৳10k for ৳100k, and ৳15k for ৳150k volume tiers.'}
            </p>
          </div>

          {/* Current Agent Deposit Status Badge */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-end sm:items-start min-w-[210px] shadow-inner">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              {language === 'bn' ? 'আপনার বর্তমান জামানত' : 'Your Security Deposit'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-teal-300">৳{currentDeposit.toLocaleString('en-IN')}</span>
              <span className="text-[11px] text-slate-400 font-medium">({currentActiveTier.nameBn.split(' ')[0]})</span>
            </div>
            <span className="text-[10px] text-teal-400/80 mt-1">
              {language === 'bn'
                ? `অনুমোদিত ভলিউম: ৳${currentActiveTier.maxDailyVolume.toLocaleString('en-IN')}/দিন`
                : `Allowed Cap: ৳${currentActiveTier.maxDailyVolume.toLocaleString('en-IN')}/day`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Interactive Input & Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Input Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {language === 'bn' ? 'দৈনিক লেনদেন ভলিউম ইনপুট (টাকায়)' : 'Daily Volume Input (in BDT)'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {language === 'bn' ? 'সরাসরি সংখ্যা লিখুন বা স্লাইডার টানুন' : 'Type exact BDT or slide tactile bar'}
                </p>
              </div>
            </div>

            {/* Quick +/- Stepper buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => adjustVolume(-10000)}
                className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                title="-10,000"
              >
                -১০k
              </button>
              <button
                type="button"
                onClick={() => adjustVolume(-5000)}
                className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                title="-5,000"
              >
                -৫k
              </button>
              <div className="w-px h-4 bg-slate-800 mx-0.5" />
              <button
                type="button"
                onClick={() => adjustVolume(5000)}
                className="px-2.5 py-1 text-xs font-bold text-teal-300 hover:text-white hover:bg-teal-700/40 rounded-lg transition-all"
                title="+5,000"
              >
                +৫k
              </button>
              <button
                type="button"
                onClick={() => adjustVolume(10000)}
                className="px-2.5 py-1 text-xs font-bold text-teal-300 hover:text-white hover:bg-teal-700/40 rounded-lg transition-all"
                title="+10,000"
              >
                +১০k
              </button>
            </div>
          </div>

          {/* Direct BDT Numeric Input Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>{language === 'bn' ? 'প্রত্যাশিত দৈনিক ভলিউম অ্যামাউন্ট' : 'Anticipated Daily Volume Amount'}</span>
              <span className="text-[11px] text-teal-400 font-bold">
                {language === 'bn' ? 'সক্রিয় টিয়ার: ' : 'Active Tier: '}
                {language === 'bn' ? matchedTier.nameBn : matchedTier.nameEn}
              </span>
            </label>

            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center pointer-events-none">
                <span className="text-2xl font-black text-amber-400">৳</span>
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="50000"
                className="w-full bg-slate-950 border-2 border-indigo-500/40 focus:border-amber-400 focus:outline-none rounded-2xl py-3.5 pl-12 pr-28 text-2xl md:text-3xl font-black text-white tracking-wide shadow-inner transition-all"
              />
              <div className="absolute right-3 flex items-center gap-1.5">
                <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-1 rounded-lg border border-slate-700">
                  {language === 'bn' ? 'টাকা / দিন' : 'BDT / day'}
                </span>
              </div>
            </div>
          </div>

          {/* Tactile Range Slider with Custom Tiers */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>৳১০,০০০</span>
              <span className="text-amber-400 font-bold">৳৫০,০০০ (টিয়ার ১)</span>
              <span className="text-amber-300 font-bold">৳১,০০,০০০ (টিয়ার ২)</span>
              <span className="text-cyan-400 font-bold">৳১,৫০,০০০ (টিয়ার ৩)</span>
              <span>৳৩,০০,০০০+</span>
            </div>

            <div className="relative">
              <input
                type="range"
                min={10000}
                max={300000}
                step={5000}
                value={anticipatedVolume}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setAnticipatedVolume(val);
                  setInputValue(val.toString());
                }}
                className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-slate-800"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>{language === 'bn' ? 'গ্রাম বা ছোট বাজার' : 'Village Market'}</span>
              <span>{language === 'bn' ? 'উপজেলা বাজার' : 'Upazila Center'}</span>
              <span>{language === 'bn' ? 'জেলা সদর ও বাণিজ্যিক হাব' : 'District Mega Hub'}</span>
            </div>
          </div>

          {/* Quick Preset Shortcut Chips */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {language === 'bn' ? 'দ্রুত সিলেক্ট করুন (প্রস্তাবিত টিয়ারসমূহ):' : 'Quick Presets (Suggested Tiers):'}
            </span>
            <div className="flex flex-wrap gap-2">
              {VOLUME_PRESETS.map((preset) => {
                const isSelected = anticipatedVolume === preset.volume;
                return (
                  <button
                    key={preset.volume}
                    type="button"
                    onClick={() => selectPreset(preset.volume)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                    <span>{language === 'bn' ? preset.labelBn : preset.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Order Simulation Parameter (Average Order BDT) */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                {language === 'bn' ? 'গড় অর্ডার সাইজ সিমুলেশন:' : 'Average Order Size Simulation:'}
              </span>
              <span className="text-teal-300 font-bold">
                ৳{averageOrderSize.toLocaleString('en-IN')} / {language === 'bn' ? 'অর্ডার' : 'order'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[1500, 2500, 5000, 10000].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setAverageOrderSize(size)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    averageOrderSize === size
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  ৳{size.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? `৳${anticipatedVolume.toLocaleString('en-IN')} ভলিউম সম্পন্ন করতে প্রতিদিন গড়ে প্রায় ${projections.estimatedDailyOrders}টি কাস্টমার অর্ডার আপনার এজেন্ট নাম্বারে পেমেন্ট হবে।`
                : `Reaching ৳${anticipatedVolume.toLocaleString('en-IN')} volume corresponds to ~${projections.estimatedDailyOrders} customer delivery payments routed through your number daily.`}
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Projected Earnings Output (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-3xl p-5 md:p-6 space-y-5 shadow-2xl relative overflow-hidden flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                  {language === 'bn' ? 'সম্ভাব্য মোট উপার্জন' : 'Projected Earnings'}
                </span>
              </div>

              {/* Timeframe selector: Daily / Monthly / Yearly */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTimeframe('daily')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedTimeframe === 'daily'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'bn' ? 'দৈনিক' : 'Daily'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTimeframe('monthly')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedTimeframe === 'monthly'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'bn' ? 'মাসিক' : 'Monthly'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTimeframe('yearly')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedTimeframe === 'yearly'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'bn' ? 'বাৎসরিক' : 'Yearly'}
                </button>
              </div>
            </div>

            {/* Main Big Number Display */}
            <div className="bg-slate-950/80 rounded-2xl p-5 border border-indigo-500/20 text-center space-y-1 shadow-inner relative">
              <span className="text-xs font-semibold text-slate-400">
                {selectedTimeframe === 'daily'
                  ? language === 'bn' ? 'প্রত্যাশিত প্রতিদিনের নেট আয়' : 'Projected Daily Net Income'
                  : selectedTimeframe === 'monthly'
                  ? language === 'bn' ? 'প্রত্যাশিত ৩০ দিনের মোট আয়' : 'Projected 30-Day Monthly Income'
                  : language === 'bn' ? 'প্রত্যাশিত বাৎসরিক আয় (৩৬৫ দিন)' : 'Projected 1-Year Total Income'}
              </span>

              <div className="flex items-center justify-center gap-1.5 py-1">
                <span className="text-2xl font-black text-amber-400">৳</span>
                <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                  {selectedTimeframe === 'daily'
                    ? Math.round(projections.dailyTotal).toLocaleString('en-IN')
                    : selectedTimeframe === 'monthly'
                    ? Math.round(projections.monthlyTotal).toLocaleString('en-IN')
                    : Math.round(projections.yearlyTotal).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 font-bold self-end mb-1">
                  {selectedTimeframe === 'daily'
                    ? language === 'bn' ? '/দিন' : '/day'
                    : selectedTimeframe === 'monthly'
                    ? language === 'bn' ? '/মাস' : '/mo'
                    : language === 'bn' ? '/বছর' : '/yr'}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-400/10 border border-amber-400/30 rounded-full text-[11px] font-bold text-amber-300">
                <Percent className="w-3 h-3 text-amber-400" />
                <span>
                  {language === 'bn' ? 'কার্যকর রিটার্ন রেট: ' : 'Effective Rate: '}
                  {projections.effectivePercent}%
                </span>
              </div>
            </div>

            {/* Income Stream Breakdown */}
            <div className="space-y-2.5 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'bn' ? 'দৈনিক আয়ের বিস্তারিত হিসাব:' : 'Daily Earnings Breakdown:'}
              </span>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    {language === 'bn' ? 'মূল কমিশন (১.০০%)' : 'Base Commission (1.00%)'}
                  </span>
                  <span className="font-bold text-white">৳{Math.round(projections.baseIncome).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {language === 'bn'
                      ? `টিয়ার বোনাস (+${matchedTier.tierBonusPercent}%)`
                      : `Tier Bonus (+${matchedTier.tierBonusPercent}%)`}
                  </span>
                  <span className="font-bold text-amber-300">
                    ৳{Math.round(projections.bonusIncome).toLocaleString('en-IN')}
                  </span>
                </div>

                {projections.milestoneBonus > 0 && (
                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {language === 'bn' ? 'দৈনিক মাইলস্টোন ক্যাশ বোনাস' : 'Daily Milestone Cash Bonus'}
                    </span>
                    <span className="font-bold text-cyan-300">+৳{projections.milestoneBonus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Security Deposit Verification & Collateral Status */}
            <div
              className={`rounded-2xl p-4 border transition-all ${
                projections.isDepositSufficient
                  ? 'bg-teal-950/40 border-teal-500/40'
                  : 'bg-amber-950/40 border-amber-500/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    projections.isDepositSufficient ? 'bg-teal-500/20 text-teal-400' : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {projections.isDepositSufficient ? (
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">
                      {language === 'bn' ? 'প্রয়োজনীয় নিরাপত্তা জামানত' : 'Required Security Deposit'}
                    </h4>
                    <span className="text-sm font-black text-amber-300">
                      ৳{projections.requiredDeposit.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {projections.isDepositSufficient
                      ? language === 'bn'
                        ? `✅ আপনার বর্তমান জামানত (৳${currentDeposit.toLocaleString('en-IN')}) এই ভলিউমের জন্য সম্পূর্ণ উপযুক্ত!`
                        : `✅ Your current deposit (৳${currentDeposit.toLocaleString('en-IN')}) covers this volume tier!`
                      : language === 'bn'
                      ? `⚠️ আপনার বর্তমান জামানত ৳${currentDeposit.toLocaleString('en-IN')}। এই ভলিউমে পৌঁছাতে আরও ৳${projections.depositShortfall.toLocaleString('en-IN')} জামানত প্রয়োজন।`
                      : `⚠️ Current deposit: ৳${currentDeposit.toLocaleString('en-IN')}. Need ৳${projections.depositShortfall.toLocaleString('en-IN')} more to unlock this tier.`}
                  </p>

                  {/* Monthly ROI on deposit explanation */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
                    <span>{language === 'bn' ? 'জামানতের ওপর মাসিক লাভ (ROI):' : 'Monthly ROI on Collateral:'}</span>
                    <span className="text-emerald-400 font-black">{projections.monthlyDepositRoi}% / মাস</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Upgrade Deposit if Shortfall */}
              {!projections.isDepositSufficient && onOpenDepositModal && (
                <button
                  type="button"
                  onClick={() => onOpenDepositModal(projections.requiredDeposit)}
                  className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Coins className="w-4 h-4 text-slate-950" />
                  <span>
                    {language === 'bn'
                      ? `৳${projections.requiredDeposit.toLocaleString('en-IN')} জামানত আপগ্রেড করুন`
                      : `Upgrade to ৳${projections.requiredDeposit.toLocaleString('en-IN')} Deposit`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Side-by-Side Official Incentive Tiers Comparison (5k/50k, 10k/100k, 15k/150k, 25k/300k) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>{language === 'bn' ? 'অফিসিয়াল জামানত ও ভলিউম টিয়ার তুলনা' : 'Official Deposit & Volume Tier Matrix'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? '৫ হাজারে ৫০ হাজার, ১০ হাজারে ১ লাখ এবং ১৫ হাজারে ১.৫ লাখ ভলিউমের গ্যারান্টিযুক্ত কাঠামো'
                : 'Official structured tiers: 5k deposit for 50k vol, 10k for 100k vol, 15k for 150k vol'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-teal-300">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
              {language === 'bn' ? 'আপনার বর্তমান টিয়ার' : 'Your Tier'}
            </span>
            <span className="flex items-center gap-1 text-amber-300 ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              {language === 'bn' ? 'এস্টিমেটর সিলেক্টেড' : 'Selected'}
            </span>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {INCENTIVE_TIERS.map((tier) => {
            const isCurrentlyActive = currentActiveTier.id === tier.id;
            const isEstimatorMatched = matchedTier.id === tier.id;
            const maxDailyEarning = Math.round(
              (tier.maxDailyVolume * (tier.baseRatePercent + tier.tierBonusPercent)) / 100 + tier.milestoneBonusBDT
            );
            const monthlyEarningAtMax = maxDailyEarning * 30;

            return (
              <div
                key={tier.id}
                onClick={() => selectPreset(tier.maxDailyVolume)}
                className={`relative rounded-2xl p-4 transition-all cursor-pointer border flex flex-col justify-between ${
                  isEstimatorMatched
                    ? 'ring-2 ring-amber-400 border-amber-400/80 bg-slate-950 shadow-lg shadow-amber-950/20'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
                }`}
              >
                {/* Active Badges */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isCurrentlyActive
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isCurrentlyActive
                      ? language === 'bn' ? '✓ আপনার বর্তমান টিয়ার' : '✓ Active Now'
                      : language === 'bn' ? tier.badgeBn : tier.badgeEn}
                  </span>

                  {isEstimatorMatched && (
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md">
                      {language === 'bn' ? 'সিলেক্টেড' : 'ACTIVE'}
                    </span>
                  )}
                </div>

                {/* Tier Name */}
                <div className="space-y-1 mb-3">
                  <h4 className="text-sm font-black text-white">
                    {language === 'bn' ? tier.nameBn : tier.nameEn}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {language === 'bn' ? tier.descriptionBn : tier.descriptionEn}
                  </p>
                </div>

                {/* Tier Key Figures */}
                <div className="space-y-2 py-2 border-y border-slate-800/80 my-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'জামানত:' : 'Deposit:'}</span>
                    <span className="font-black text-teal-300">৳{tier.requiredDeposit.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'দৈনিক ভলিউম সিলিং:' : 'Daily Vol Cap:'}</span>
                    <span className="font-black text-white">৳{tier.maxDailyVolume.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'মোট কমিশন হার:' : 'Total Rate:'}</span>
                    <span className="font-bold text-amber-300">
                      {(tier.baseRatePercent + tier.tierBonusPercent).toFixed(2)}%
                      {tier.milestoneBonusBDT > 0 && ` + ৳${tier.milestoneBonusBDT}`}
                    </span>
                  </div>
                </div>

                {/* Max Potential Earning Highlight */}
                <div className="mt-2 pt-1 text-center bg-slate-900/90 rounded-xl p-2 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">
                    {language === 'bn' ? 'সর্বোচ্চ সম্ভাব্য মাসিক লাভ:' : 'Max Potential Monthly Profit:'}
                  </span>
                  <span className="text-base font-black text-amber-400">
                    ৳{monthlyEarningAtMax.toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">/মাস</span>
                  </span>
                </div>

                {/* Select button */}
                <button
                  type="button"
                  className={`mt-3 w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    isEstimatorMatched
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isEstimatorMatched
                    ? language === 'bn' ? '✓ ক্যালকুলেটরে সক্রিয়' : '✓ Active in Estimator'
                    : language === 'bn' ? 'এই ভলিউম হিসাব করুন' : 'Test This Volume'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Rural Agent Business Logic & Why This Works Explanation */}
      <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 rounded-3xl p-5 md:p-6 border border-teal-500/20 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              {language === 'bn'
                ? 'এজেন্টদের জন্য প্রতিদিন নিশ্চিত ইনকাম মডেল কীভাবে কাজ করে?'
                : 'How Does the Daily Guaranteed Income Model Work for Agents?'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'bn'
                ? 'আপনার এলাকার গ্রাহকরা প্ল্যাটফর্ম থেকে মোবাইল, পণ্য বা যানবাহন বুকিং দিলে পেমেন্ট সরাসরি আপনার বিকাশ, নগদ বা রকেট নাম্বারে রুট হবে। আপনাকে পণ্য বিক্রি করতে হবে না বা কাস্টমার খুঁজতে হবে না; সেন্ট্রাল ডেলিভারির টাকা আপনার নাম্বারে নিয়মিত ঢুকবে এবং প্রতি ট্রানজেকশনে আপনার কমিশন যোগ হবে।'
                : 'When customers in your region order products or vehicles, central payments are routed through your bKash, Nagad, or Rocket agent number. You don’t need to sell products; money flows directly to your number and you earn guaranteed commission on every transaction.'}
            </p>
          </div>
        </div>

        {/* 3 Pillars Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-teal-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {language === 'bn' ? '১০০% রিফান্ডেবল জামানত' : '100% Refundable Collateral'}
            </span>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? 'আপনার জামানতের টাকা কোনো ফি নয়, এটি আপনার অ্যাকাউন্টে সুরক্ষিত সিকিউরিটি ডিপোজিট যা যেকোনো সময় ফেরতযোগ্য।'
                : 'Your collateral is not a fee; it is held securely in your account and 100% refundable anytime.'}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              {language === 'bn' ? 'অটোমেটিক অর্ডার রাউটিং' : 'Automated Order Routing'}
            </span>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? 'সেন্ট্রাল ডেলিভারি সিস্টেম প্রতিদিন আপনার নির্ধারিত সিলিং (৫০হাজার/১লাখ/১.৫লাখ) অনুযায়ী কাস্টমার পেমেন্ট পাঠাবে।'
                : 'System routes customer orders directly to your number up to your daily volume cap.'}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              {language === 'bn' ? 'তাত্ক্ষণিক কমিশন উত্তোলন' : 'Instant Commission Payout'}
            </span>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? 'প্রতিদিনের কমিশন সাথে সাথে এজেন্ট ওয়ালেটে জমা হবে এবং যেকোনো সময় বিকাশ/নগদে ক্যাশ আউট করা যাবে।'
                : 'Daily commissions credit instantly to your agent balance and can be withdrawn anytime.'}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {language === 'bn'
              ? 'আরও বিস্তারিত জানতে বা জামানত জমা দিতে অ্যাডমিন প্যানেল বা হটলাইনে যোগাযোগ করুন।'
              : 'Contact admin support or upgrade your security deposit anytime.'}
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToTerminal && (
              <button
                type="button"
                onClick={onNavigateToTerminal}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                <span>{language === 'bn' ? 'সিম টার্মিনালে যান' : 'Go to Terminal'}</span>
              </button>
            )}

            {onOpenDepositModal && (
              <button
                type="button"
                onClick={() => onOpenDepositModal(matchedTier.requiredDeposit)}
                className="py-2 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>
                  {language === 'bn'
                    ? `৳${matchedTier.requiredDeposit.toLocaleString('en-IN')} জামানত জমা দিন`
                    : `Deposit ৳${matchedTier.requiredDeposit.toLocaleString('en-IN')}`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
