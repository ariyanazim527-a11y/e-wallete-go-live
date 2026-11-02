import React from 'react';
import { ShieldCheck, Globe, Bell, Sparkles, Send, ExternalLink } from 'lucide-react';
import { HeaderDownloadAppButton } from './common/HeaderDownloadAppButton.tsx';

interface WalletHeaderProps {
  language: 'bn' | 'en';
  onToggleLanguage: () => void;
  userName: string;
  userPhone: string;
  showAdminAndAgentLinks?: boolean;
  onOpenAdmin?: () => void;
  onOpenAgent?: () => void;
}

export const WalletHeader: React.FC<WalletHeaderProps> = ({
  language,
  onToggleLanguage,
  userName,
  userPhone,
  showAdminAndAgentLinks = false,
  onOpenAdmin,
  onOpenAgent,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 shadow-2xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* User Profile Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-rose-100">
              {userName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Verified Customer Account">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm tracking-tight">{userName}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                {language === 'bn' ? 'ভেরিফাইড ওয়ালেট' : 'Verified Wallet'}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">{userPhone}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* If explicitly allowed to show admin/agent links */}
          {showAdminAndAgentLinks && onOpenAgent && onOpenAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              <button
                onClick={onOpenAgent}
                className="px-2.5 py-1 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl"
              >
                {language === 'bn' ? 'এজেন্ট পোর্টাল' : 'Agent'}
              </button>
              <button
                onClick={onOpenAdmin}
                className="px-2.5 py-1 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl"
              >
                {language === 'bn' ? 'অ্যাডমিন' : 'Admin'}
              </button>
            </div>
          )}

          {/* Download App Button (triggers PWA install prompt for uninstalled users) */}
          <HeaderDownloadAppButton language={language} variant="customer" />

          {/* Telegram Customer Support Button */}
          <a
            href="https://t.me/Ewallatehelpline"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 active:scale-95 rounded-xl shadow-xs transition-all"
            title="Telegram 24/7 Helpline"
          >
            <Send className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">{language === 'bn' ? 'টেলিগ্রাম সাপোর্ট' : 'Telegram Support'}</span>
            <span className="sm:hidden">সাপোর্ট</span>
          </a>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-200 rounded-xl transition-colors"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'bn' ? 'EN' : 'বাং'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
