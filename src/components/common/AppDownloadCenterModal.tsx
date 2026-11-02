import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Sparkles,
  Info,
  ArrowRight,
  Briefcase,
  ShieldAlert,
  Wallet,
  Globe,
  Layers,
  X,
  Plus,
  AlertTriangle,
  Compass,
} from 'lucide-react';

interface AppDownloadCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
  defaultApp?: 'agent' | 'admin' | 'customer';
}

export const AppDownloadCenterModal: React.FC<AppDownloadCenterModalProps> = ({
  isOpen,
  onClose,
  language,
  defaultApp = 'agent',
}) => {
  const [selectedApp, setSelectedApp] = useState<'agent' | 'admin' | 'customer'>(defaultApp);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed'>('idle');

  // Detect if user is viewing inside Google AI Studio / Cloud preview iframe
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    setSelectedApp(defaultApp);
  }, [defaultApp]);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  // Compute canonical direct preview URL (outside AI Studio iframe)
  const isAiStudioHost = typeof window !== 'undefined' && window.location.hostname.includes('aistudio.google.com');
  const baseHost = isAiStudioHost
    ? 'https://ais-pre-vc3mlwkn7oittgjo5q32e5-120062176811.asia-east1.run.app'
    : window.location.origin + window.location.pathname;

  const agentUrl = `${baseHost}#/agent`;
  const adminUrl = `${baseHost}#/admin`;
  const customerUrl = `${baseHost}#/customer`;

  const currentUrl =
    selectedApp === 'agent' ? agentUrl : selectedApp === 'admin' ? adminUrl : customerUrl;

  const currentDownloadApi = `/api/download-app?type=${selectedApp}`;

  const copyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setInstallStatus('installing');
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstallStatus('installed');
        } else {
          setInstallStatus('idle');
        }
      } catch (err) {
        console.warn('Install error:', err);
        setInstallStatus('idle');
      }
      setDeferredPrompt(null);
    } else {
      // Trigger download via real server endpoint
      window.open(currentDownloadApi, '_blank');
      setInstallStatus('installed');
      setTimeout(() => setInstallStatus('idle'), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-teal-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative text-white my-auto max-h-[94vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white font-bold transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg ring-2 ring-teal-400/30 shrink-0">
            <Download className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight text-white">
                {language === 'bn' ? 'E-wallet Go অ্যাপ ডাউনলোড ও ইনস্টল কেন্দ্র' : 'E-wallet Go App Download Center'}
              </h3>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold border border-teal-500/30">
                PWA / APK
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {language === 'bn'
                ? 'সরাসরি অনলাইন থেকে ফোন ও ট্যাবলেটে ইনস্টল করুন (প্লে-স্টোর ছাড়াই সরাসরি ফুলস্ক্রিন মোবাইল অ্যাপ)।'
                : 'Install standalone apps directly to your mobile homescreen without app store delays.'}
            </p>
          </div>
        </div>

        {/* Iframe Notice & One-Tap Direct Browser Launcher */}
        {isInIframe && (
          <div className="mt-3 p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                {language === 'bn'
                  ? 'কেন সরাসরি এই স্ক্রিনে ডাউনলোড হয় না?'
                  : 'Why downloads are blocked in this view?'}
              </span>
            </div>
            <p className="text-[11px] text-amber-100/90 leading-relaxed">
              {language === 'bn'
                ? 'আপনি বর্তমানে গুগল এআই স্টুডিও-এর প্রিভিউ স্ক্রিনে আছেন। ব্রাউজারের সিকিউরিটি পলিসির কারণে আইফ্রেমের ভেতরে ফাইল ডাউনলোড ও ইনস্টল ব্লক থাকে। অ্যাপটি মোবাইলে ইনস্টল করতে নিচের বাটনে চাপ দিয়ে সরাসরি গুগল ক্রোমে খুলুন:'
                : 'You are currently inside an iframe. Chrome security blocks install prompts inside iframes. Open directly in Chrome to install to your phone homescreen.'}
            </p>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>
                {language === 'bn'
                  ? '🌐 সরাসরি গুগল ক্রোমে ফুলস্ক্রিন ওপেন করুন (Open in Chrome)'
                  : 'Open Directly in Full Chrome Window'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* 3 App Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 pt-3">
          <button
            type="button"
            onClick={() => setSelectedApp('agent')}
            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
              selectedApp === 'agent'
                ? 'bg-teal-950/70 border-teal-500 ring-2 ring-teal-500/30 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <Briefcase className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedApp === 'agent' ? 'text-teal-400' : 'text-slate-500'}`} />
              <span className="text-[9px] sm:text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded font-bold">
                এজেন্ট
              </span>
            </div>
            <div className="font-extrabold text-[11px] sm:text-xs text-white mt-1.5 leading-tight">
              E-wallet Go Agent Apps
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">টার্মিনাল ও ডিলার</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedApp('admin')}
            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
              selectedApp === 'admin'
                ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <ShieldAlert className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedApp === 'admin' ? 'text-rose-400' : 'text-slate-500'}`} />
              <span className="text-[9px] sm:text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold">
                অ্যাডমিন
              </span>
            </div>
            <div className="font-extrabold text-[11px] sm:text-xs text-white mt-1.5 leading-tight">
              E-wallet Admin
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">মাস্টার কনসোল</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedApp('customer')}
            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
              selectedApp === 'customer'
                ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <Wallet className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedApp === 'customer' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                কাস্টমার
              </span>
            </div>
            <div className="font-extrabold text-[11px] sm:text-xs text-white mt-1.5 leading-tight">
              E-wallet Go Wallet
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">ডিজিটাল ওয়ালেট</div>
          </button>
        </div>

        {/* Selected App Details & Download CTA Box */}
        <div className="mt-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3.5 overflow-y-auto flex-1">
          {selectedApp === 'agent' && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                  💼 অথোরাইজড এজেন্ট অ্যাপ
                </span>
                <h4 className="text-sm sm:text-base font-black text-white">
                  E-wallet Go Agent Apps (এজেন্ট টার্মিনাল)
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  ভোটার আইডি কার্ড (NID) ভেরিফিকেশন, ফ্লোট রিচার্জ (৳৫k-১৫k), ১.০০%-১.৪০% দৈনিক ভলিউম ইনসেন্টিভ আয়, জাহাজ ও গাড়ির ডিলারশিপ বুকিং এবং ২৪/৭ ডিসপিউট হেল্পলাইন।
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={agentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Compass className="w-4 h-4" />
                  <span>ক্রোমে ওপেন করুন</span>
                </a>

                <a
                  href="/api/download-app?type=agent"
                  download="E-wallet-Go-Agent-App.html"
                  target="_blank"
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>ফাইল ডাউনলোড</span>
                </a>

                <button
                  type="button"
                  onClick={() => copyUrl(agentUrl, 'agent')}
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  {copiedLink === 'agent' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
                  <span>{copiedLink === 'agent' ? 'কপি হয়েছে!' : 'লিঙ্ক কপি'}</span>
                </button>
              </div>
            </div>
          )}

          {selectedApp === 'admin' && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                  🛡️ সুপার অ্যাডমিন কন্ট্রোল অ্যাপ
                </span>
                <h4 className="text-sm sm:text-base font-black text-white">
                  E-wallet Admin Control App
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  বিকাশ, নগদ ও রকেট সেন্ড মানি নম্বর নিয়ন্ত্রণ (01739-420736), এজেন্টদের NID ফটোকপি অনুমোদন, ব্যালেন্সে ডিপোজিট যোগ, বোনাস যোগ, ব্যালেন্স কর্তন এবং হারানো মোবাইল অ্যাকাউন্ট লক/আনলক।
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Compass className="w-4 h-4" />
                  <span>ক্রোমে ওপেন করুন</span>
                </a>

                <a
                  href="/api/download-app?type=admin"
                  download="E-wallet-Admin-App.html"
                  target="_blank"
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>ফাইল ডাউনলোড</span>
                </a>

                <button
                  type="button"
                  onClick={() => copyUrl(adminUrl, 'admin')}
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  {copiedLink === 'admin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{copiedLink === 'admin' ? 'কপি হয়েছে!' : 'লিঙ্ক কপি'}</span>
                </button>
              </div>
            </div>
          )}

          {selectedApp === 'customer' && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  📱 সাধারণ গ্রাহক অ্যাপস
                </span>
                <h4 className="text-sm sm:text-base font-black text-white">
                  E-wallet Go Customer Wallet
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  কাস্টমারদের জন্য সম্পূর্ণ সুরক্ষিত ও আলাদা লিংক। ওয়ালেট ব্যালেন্স, সেন্ড মানি, ক্যাশ-আউট, শপিং এবং সরাসরি টেলিগ্রাম সাপোর্ট (t.me/Ewallatehelpline)।
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={customerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Compass className="w-4 h-4" />
                  <span>ক্রোমে ওপেন করুন</span>
                </a>

                <a
                  href="/api/download-app?type=customer"
                  download="E-wallet-Customer-App.html"
                  target="_blank"
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>ফাইল ডাউনলোড</span>
                </a>

                <button
                  type="button"
                  onClick={() => copyUrl(customerUrl, 'customer')}
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  {copiedLink === 'customer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{copiedLink === 'customer' ? 'কপি হয়েছে!' : 'লিঙ্ক কপি'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Android Step-by-Step Visual Walkthrough (How to add real app icon to phone) */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-teal-500/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-teal-300">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-teal-400" />
                <span>মোবাইলে বিকাশ/নগদের মতো হোম স্ক্রিন অ্যাপ হিসেবে ইনস্টল করার নিয়ম:</span>
              </span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono">
                ৩ সহজ ধাপ
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-black flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  ১
                </span>
                <div>
                  <strong className="text-white">ক্রোমে খুলুন:</strong> উপরের <strong>'ক্রোমে ওপেন করুন'</strong> বাটনে চাপ দিন (বা লিঙ্কটি কপি করে গুগল ক্রোম ব্রাউজারে পেস্ট করুন)।
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-black flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  ২
                </span>
                <div>
                  <strong className="text-white">৩-ডট মেনু চাপুন:</strong> ক্রোম ব্রাউজারের উপরে ডানদিকের <strong>তিনটি ডট (⋮)</strong> মেনু চাপুন।
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-black flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  ৩
                </span>
                <div>
                  <strong className="text-emerald-400 font-black">"Install app" বা "Add to Home screen":</strong> অপশনে চাপ দিন। সাথে সাথে আপনার মোবাইলে সরাসরি অ্যাপ ইনস্টল হয়ে যাবে!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>অফিসিয়াল সুরক্ষিত PWA প্যাকেজ</span>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
