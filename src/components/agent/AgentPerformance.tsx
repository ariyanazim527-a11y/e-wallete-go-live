import React, { useState } from 'react';
import {
  TrendingUp,
  Smartphone,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Zap,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { AgentProfile, CommissionEntry } from '../../types/agentMerchant.ts';

export interface AgentSimPerformance {
  simNumber: string;
  operator: string;
  slotLabel: string;
  totalVolume: number;
  cashInVolume: number;
  cashOutVolume: number;
  transactionsCount: number;
  commissionsEarned: number;
  status: 'online' | 'idle';
  lastActive: string;
}

interface AgentPerformanceProps {
  language: 'bn' | 'en';
  agent: AgentProfile;
  commissions: CommissionEntry[];
  onNavigateToEarnings?: () => void;
}

export const AgentPerformance: React.FC<AgentPerformanceProps> = ({
  language,
  agent,
  commissions,
  onNavigateToEarnings,
}) => {
  const [selectedSim, setSelectedSim] = useState<string>('all');

  // Realistic SIM performance profiles for this agent terminal
  const simPerformances: AgentSimPerformance[] = [
    {
      simNumber: agent.agentPhone, // e.g. 01700-112233
      operator: 'Grameenphone MFS',
      slotLabel: language === 'bn' ? 'সিম ১ (প্রধান সিম)' : 'SIM Slot 1 (Primary)',
      totalVolume: 165000,
      cashInVolume: 95000,
      cashOutVolume: 70000,
      transactionsCount: 28,
      commissionsEarned: 552.5,
      status: 'online',
      lastActive: '5 mins ago',
    },
    {
      simNumber: '01899-334455',
      operator: 'Robi MFS Express',
      slotLabel: language === 'bn' ? 'সিম ২ (সেকেন্ডারি সিম)' : 'SIM Slot 2 (Secondary)',
      totalVolume: 88000,
      cashInVolume: 48000,
      cashOutVolume: 40000,
      transactionsCount: 16,
      commissionsEarned: 300.0,
      status: 'online',
      lastActive: '18 mins ago',
    },
  ];

  const totalSimVolume = simPerformances.reduce((acc, s) => acc + s.totalVolume, 0);
  const totalSimTxCount = simPerformances.reduce((acc, s) => acc + s.transactionsCount, 0);

  // 7-day weekly commission earnings trend
  const weeklyEarnings = [
    { day: 'Sat', dayBn: 'শনি', amount: 340, volume: 82000 },
    { day: 'Sun', dayBn: 'রবি', amount: 480, volume: 115000 },
    { day: 'Mon', dayBn: 'সোম', amount: 520, volume: 124000 },
    { day: 'Tue', dayBn: 'মঙ্গল', amount: 390, volume: 92000 },
    { day: 'Wed', dayBn: 'বুধ', amount: 610, volume: 145000 },
    { day: 'Thu', dayBn: 'বৃহ', amount: 720, volume: 168000 },
    { day: 'Fri', dayBn: 'শুক্র', amount: 890, volume: 210000 },
  ];

  const maxDailyCommission = Math.max(...weeklyEarnings.map((w) => w.amount));

  return (
    <div className="space-y-6">
      {/* Dynamic Tier Incentive & Daily Projections Callout */}
      {onNavigateToEarnings && (
        <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-teal-950/40 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-xs">
                  {language === 'bn' ? 'দৈনিক আয় ও ইনসেন্টিভ ড্যাশবোর্ড' : 'Daily Earnings & Incentive Projector'}
                </h4>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-500/30 font-bold">
                  {language === 'bn' ? '১.০০% - ১.৪০% ইনসেন্টিভ' : '1.00% - 1.40% Yield'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {language === 'bn'
                  ? 'আপনার দৈনন্দিন ভলিউম অনুযায়ী মাসিক আয় ও জামানত টিয়ার প্রজেকশন সরাসরি ক্যালকুলেট করুন।'
                  : 'Calculate projected daily/monthly earnings based on volume and deposit tiers.'}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToEarnings}
            className="py-2 px-3.5 bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>{language === 'bn' ? 'আয় প্রজেকশন ড্যাশবোর্ড' : 'View Earnings Dashboard'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Commissions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{language === 'bn' ? 'মোট অর্জিত কমিশন' : 'Total Commission Earnings'}</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <Coins className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
              ৳{(agent.totalCommissionBalance + 3950).toFixed(2)}
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{language === 'bn' ? 'আজকের আয়:' : "Today's:"}</span>
            <span className="font-bold text-emerald-700 font-mono">+৳{agent.commissionEarnedToday}</span>
          </div>
        </div>

        {/* Current Float Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{language === 'bn' ? 'বর্তমান ফ্লোট ব্যালেন্স' : 'Current Float Balance'}</span>
              <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              ৳{agent.floatBalance.toLocaleString()}
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{language === 'bn' ? 'ফ্লোট সক্ষমতা:' : 'Utilization:'}</span>
            <span className="font-semibold text-teal-700 font-mono">78% Optimal</span>
          </div>
        </div>

        {/* Total Terminal Volume */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{language === 'bn' ? 'মোট প্রসেসকৃত ভলিউম' : 'Total Terminal Volume'}</span>
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              ৳{totalSimVolume.toLocaleString()}
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{language === 'bn' ? 'সফল লেনদেন:' : 'Transactions:'}</span>
            <span className="font-semibold text-slate-700 font-mono">{totalSimTxCount} transfers</span>
          </div>
        </div>

        {/* Security Escrow Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{language === 'bn' ? 'জামানত স্থিতি' : 'Security Deposit'}</span>
              <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              ৳{agent.securityDeposit.toLocaleString()}
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {language === 'bn' ? 'এসক্রোতে সুরক্ষিত' : 'Committed & Active'}
            </span>
            <span className="font-mono text-slate-400">Refundable</span>
          </div>
        </div>
      </div>

      {/* 2. Breakdown of Transactions Completed with Their SIM Numbers */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-teal-600" />
              {language === 'bn'
                ? 'এজেন্ট সিম নম্বরভিত্তিক লেনদেন ও পারফরম্যান্স বিশ্লেষণ'
                : 'SIM-Level Transaction Breakdown & Performance'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'আপনার টার্মিনালের নিবন্ধিত সিমগুলো দিয়ে সম্পন্ন হওয়া সকল ক্যাশ ইন ও ক্যাশ আউট হিসাব'
                : 'Performance metrics and volume generated across each authorized SIM slot'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500">{language === 'bn' ? 'সিম ফিল্টার:' : 'Filter:'}</span>
            <select
              value={selectedSim}
              onChange={(e) => setSelectedSim(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-800 focus:outline-none"
            >
              <option value="all">{language === 'bn' ? 'সকল সিম নম্বর' : 'All SIM Numbers'}</option>
              {simPerformances.map((s) => (
                <option key={s.simNumber} value={s.simNumber}>
                  {s.simNumber} ({s.operator})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SIM Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {simPerformances
            .filter((s) => selectedSim === 'all' || s.simNumber === selectedSim)
            .map((sim, idx) => {
              const volumePct = Math.round((sim.totalVolume / totalSimVolume) * 100);
              const cashInPct = Math.round((sim.cashInVolume / sim.totalVolume) * 100);
              const cashOutPct = 100 - cashInPct;

              return (
                <div
                  key={sim.simNumber}
                  className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4 hover:border-slate-300 transition-colors"
                >
                  {/* SIM Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm font-mono">{sim.simNumber}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            ONLINE
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {sim.slotLabel} · {sim.operator}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Commissions</span>
                      <span className="text-base font-bold font-mono text-emerald-600">
                        +৳{sim.commissionsEarned.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Volume Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{language === 'bn' ? 'মোট লেনদেন ভলিউম' : 'Total Volume Processed'}</span>
                      <span className="font-mono font-bold text-slate-900">
                        ৳{sim.totalVolume.toLocaleString()} ({volumePct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden flex">
                      <div
                        className="bg-teal-600 h-full"
                        style={{ width: `${cashInPct}%` }}
                        title={`Cash In: ৳${sim.cashInVolume.toLocaleString()} (${cashInPct}%)`}
                      />
                      <div
                        className="bg-indigo-600 h-full"
                        style={{ width: `${cashOutPct}%` }}
                        title={`Cash Out: ৳${sim.cashOutVolume.toLocaleString()} (${cashOutPct}%)`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-0.5">
                      <span className="text-teal-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-teal-600" />
                        Cash In: ৳{sim.cashInVolume.toLocaleString()} ({cashInPct}%)
                      </span>
                      <span className="text-indigo-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        Cash Out: ৳{sim.cashOutVolume.toLocaleString()} ({cashOutPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Detailed Metric Chips */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block">Total Transfers</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">{sim.transactionsCount}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block">Avg / Transfer</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        ৳{Math.round(sim.totalVolume / sim.transactionsCount).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 block">Last Active</span>
                      <span className="font-semibold text-slate-700 text-[11px] truncate block">{sim.lastActive}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 3. Weekly 7-Day Commission Earnings Trend */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'গত ৭ দিনের কমিশন উপার্জনের গ্রাফ' : '7-Day Commission Earnings Velocity'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'প্রতিদিনের ক্যাশ ইন ও ক্যাশ আউটের ওপর স্বয়ংক্রিয় কমিশন জেনারেশন ট্রেন্ড'
                : 'Daily commission progression accumulated across all terminal SIM numbers'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Week Total: ৳{weeklyEarnings.reduce((acc, w) => acc + w.amount, 0).toLocaleString()}
          </span>
        </div>

        {/* Visual Bar Graph */}
        <div className="pt-4">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pb-2 border-b border-slate-200">
            {weeklyEarnings.map((item, i) => {
              const heightPct = Math.round((item.amount / maxDailyCommission) * 100);

              return (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ৳{item.amount}
                  </span>
                  <div
                    className="w-full max-w-[42px] bg-gradient-to-t from-teal-700 to-emerald-500 rounded-t-xl group-hover:from-teal-600 group-hover:to-emerald-400 transition-all shadow-xs"
                    style={{ height: `${heightPct}%` }}
                    title={`${item.day}: ৳${item.amount} commissions generated from ৳${item.volume.toLocaleString()} volume`}
                  />
                  <span className="text-xs font-semibold text-slate-700 mt-1">
                    {language === 'bn' ? item.dayBn : item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
            <span>{language === 'bn' ? 'সাপ্তাহিক গড় কমিশন: ৳৫৬৭ / দিন' : 'Average daily commission: ৳567 / day'}</span>
            <span className="text-teal-700 font-semibold">{language === 'bn' ? 'সবচেয়ে লাভজনক দিন: শুক্রবার' : 'Peak volume day: Friday'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
