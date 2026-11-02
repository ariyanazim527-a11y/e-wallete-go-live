import React, { useState } from 'react';
import { CreditCard, Lock, Unlock, Copy, Check, Eye, EyeOff, Shield } from 'lucide-react';

interface VirtualCardViewProps {
  language: 'bn' | 'en';
  userName: string;
  balance?: number;
}

export const VirtualCardView: React.FC<VirtualCardViewProps> = ({ language, userName }) => {
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [showCvv, setShowCvv] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [dailyLimit, setDailyLimit] = useState<number>(50000);

  const cardNumber = '4532 8920 1192 8821';
  const expiry = '08/29';
  const cvv = '482';

  const handleCopy = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            {language === 'bn' ? 'uWallet ডিজিটাল ভার্চুয়াল কার্ড' : 'uWallet Digital Card'}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'বিশ্বব্যাপী অনলাইন পেমেন্ট ও শপিংয়ের জন্য' : 'For online shopping & global subscriptions'}
          </p>
        </div>

        <button
          onClick={() => setIsFrozen(!isFrozen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            isFrozen
              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isFrozen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{isFrozen ? (language === 'bn' ? 'কার্ড লক করা' : 'Card Frozen') : (language === 'bn' ? 'লক করুন' : 'Freeze Card')}</span>
        </button>
      </div>

      {/* Realistic Virtual Card UI */}
      <div
        className={`relative aspect-[1.586/1] w-full max-w-sm mx-auto rounded-2xl p-5 text-white shadow-xl overflow-hidden transition-all duration-300 ${
          isFrozen
            ? 'bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-900 grayscale'
            : 'bg-gradient-to-tr from-rose-600 via-purple-700 to-indigo-900'
        }`}
      >
        {/* Background decorative patterns */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-pink-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Card Top */}
          <div className="flex items-center justify-between">
            <span className="font-bold tracking-wider text-sm font-mono text-white/90">uWallet Platinum</span>
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
              <span className="text-[10px] font-bold">VISA</span>
            </div>
          </div>

          {/* Card Chip & Contactless */}
          <div className="my-2 flex items-center justify-between">
            <div className="w-9 h-7 rounded-md bg-amber-300/80 border border-amber-400 flex items-center justify-center">
              <div className="w-6 h-4 border border-amber-600/40 rounded-xs" />
            </div>
            {isFrozen && (
              <span className="text-xs bg-rose-900/80 px-2 py-0.5 rounded text-rose-200 font-semibold">
                FROZEN
              </span>
            )}
          </div>

          {/* Card Number */}
          <div>
            <div className="text-lg md:text-xl font-mono tracking-widest font-bold tabular-nums">
              {cardNumber}
            </div>

            {/* Card Holder & Expiry */}
            <div className="flex items-end justify-between mt-3 text-xs text-white/90 font-mono">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/60 block">Card Holder</span>
                <span className="font-semibold uppercase">{userName}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/60 block">Expires</span>
                <span className="font-semibold">{expiry}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/60 block">CVV</span>
                <span className="font-semibold">{showCvv ? cvv : '•••'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
        <button
          onClick={handleCopy}
          className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied!') : (language === 'bn' ? 'নম্বর কপি' : 'Copy Number')}</span>
        </button>

        <button
          onClick={() => setShowCvv(!showCvv)}
          className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showCvv ? (language === 'bn' ? 'CVV লুকান' : 'Hide CVV') : (language === 'bn' ? 'CVV দেখুন' : 'Show CVV')}</span>
        </button>
      </div>

      {/* Daily Online Limit Control */}
      <div className="max-w-sm mx-auto p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
        <div className="flex justify-between font-medium text-slate-700">
          <span>{language === 'bn' ? 'দৈনিক অনলাইন লিমিট' : 'Daily Online Limit'}</span>
          <span className="font-bold text-slate-900 font-mono">৳{dailyLimit.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="5000"
          max="200000"
          step="5000"
          value={dailyLimit}
          onChange={(e) => setDailyLimit(parseInt(e.target.value, 10))}
          className="w-full accent-rose-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>৳5,000</span>
          <span>৳2,00,000</span>
        </div>
      </div>
    </div>
  );
};
