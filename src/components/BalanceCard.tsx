import React, { useState } from 'react';
import { Eye, EyeOff, PlusCircle, ArrowUpRight, Sparkles, QrCode } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  points: number;
  language: 'bn' | 'en';
  onQuickAction: (action: 'add_money' | 'send_money' | 'qr_scan') => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  points,
  language,
  onQuickAction,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 text-white p-5 md:p-6 shadow-md border border-slate-800">
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top row: Balance status & Rewards */}
      <div className="flex items-center justify-between relative z-10 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium">
            {language === 'bn' ? 'বর্তমান ব্যালেন্স' : 'Available Balance'}
          </span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title={showBalance ? 'Hide Balance' : 'Show Balance'}
          >
            {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-full text-xs font-medium text-amber-300 backdrop-blur-xs transition-colors">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{points} {language === 'bn' ? 'পয়েন্ট' : 'pts'}</span>
        </div>
      </div>

      {/* Center: Main Balance */}
      <div className="relative z-10 my-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight">৳</span>
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums font-mono">
            {showBalance ? formatCurrency(balance) : '••••••'}
          </span>
          <span className="text-xs text-slate-400 font-mono ml-1">BDT</span>
        </div>
        {showBalance && (
          <div className="text-xs text-slate-400 mt-0.5">
            ≈ ${(balance / 120).toFixed(2)} USD
          </div>
        )}
      </div>

      {/* Bottom: Quick Shortcuts */}
      <div className="relative z-10 pt-4 mt-3 border-t border-white/10 flex items-center justify-between gap-3">
        <button
          onClick={() => onQuickAction('add_money')}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 active:scale-[0.98] rounded-xl text-xs font-semibold text-white transition-all backdrop-blur-xs"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>{language === 'bn' ? 'টাকা যোগ' : 'Add Money'}</span>
        </button>

        <button
          onClick={() => onQuickAction('send_money')}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 active:scale-[0.98] rounded-xl text-xs font-semibold text-white transition-all backdrop-blur-xs"
        >
          <ArrowUpRight className="w-4 h-4 text-rose-400" />
          <span>{language === 'bn' ? 'টাকা পাঠান' : 'Send Money'}</span>
        </button>

        <button
          onClick={() => onQuickAction('qr_scan')}
          className="flex items-center justify-center py-2 px-3 bg-white/10 hover:bg-white/20 active:scale-[0.98] rounded-xl text-xs font-semibold text-white transition-all backdrop-blur-xs"
          title="QR Scanner"
        >
          <QrCode className="w-4 h-4 text-cyan-300" />
        </button>
      </div>
    </div>
  );
};
