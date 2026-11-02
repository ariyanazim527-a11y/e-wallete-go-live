import React from 'react';
import { PieChart, TrendingDown, ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react';
import { Transaction } from '../types/wallet.ts';

interface SpendingAnalyticsProps {
  transactions: Transaction[];
  language: 'bn' | 'en';
}

export const SpendingAnalytics: React.FC<SpendingAnalyticsProps> = ({ transactions, language }) => {
  const outgoingTx = transactions.filter((t) => t.type !== 'add_money');
  const totalSpent = outgoingTx.reduce((acc, t) => acc + t.amount, 0);

  const categories = [
    { name: 'Transfer & Family', nameBn: 'স্থানান্তর ও পরিবার', amount: 5500, color: 'bg-rose-500' },
    { name: 'Shopping & Daraz', nameBn: 'শপিং ও কেনাকাটা', amount: 1840, color: 'bg-purple-500' },
    { name: 'Electricity & Gas Bills', nameBn: 'বিদ্যুৎ ও গ্যাস বিল', amount: 1200, color: 'bg-amber-500' },
    { name: 'Mobile Recharge', nameBn: 'মোবাইল রিচার্জ', amount: 200, color: 'bg-blue-500' },
  ];

  const highestExpense = categories.reduce((prev, current) => (prev.amount > current.amount ? prev : current));

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            {language === 'bn' ? 'মাসিক খরচের হিসাব ও বিশ্লেষণ' : 'Monthly Spending Analytics'}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'অক্টোবর ২০২৬ এর বাজেট ট্র্যাকিং' : 'Budget tracking for October 2026'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            {language === 'bn' ? 'মোট ব্যয়' : 'Total Outflow'}
          </span>
          <span className="text-base font-bold font-mono text-rose-600">
            ৳{totalSpent.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="space-y-3">
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
          {categories.map((c, i) => {
            const pct = Math.round((c.amount / totalSpent) * 100);
            return (
              <div
                key={i}
                className={`${c.color} h-full`}
                style={{ width: `${pct}%` }}
                title={`${c.name}: ৳${c.amount} (${pct}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          {categories.map((c, i) => {
            const pct = Math.round((c.amount / totalSpent) * 100);
            return (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.color} shrink-0`} />
                  <span className="text-slate-700 truncate font-medium">
                    {language === 'bn' ? c.nameBn : c.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 shrink-0 ml-1">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight Callout */}
      <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
        <TrendingDown className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">
            {language === 'bn' ? 'স্মার্ট খরচ পরামর্শ' : 'Smart Budget Insight'}
          </span>
          <p className="text-indigo-700 mt-0.5 leading-relaxed">
            {language === 'bn'
              ? `আপনার ব্যয়ের প্রধান অংশ (${highestExpense.nameBn}) খাতে হয়েছে। ইউটিলিটি বিলে অটো-পে চালু করে ২% ক্যাশব্যাক উপভোগ করতে পারেন।`
              : `Your largest expense category was ${highestExpense.name}. Enable Auto-Pay on utility bills to save 2% in monthly cashback.`}
          </p>
        </div>
      </div>
    </div>
  );
};
