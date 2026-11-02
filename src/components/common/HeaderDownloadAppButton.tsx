import React, { useState } from 'react';
import { Download, CheckCircle2, Smartphone, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';
import { AppDownloadCenterModal } from './AppDownloadCenterModal.tsx';

interface HeaderDownloadAppButtonProps {
  language: 'bn' | 'en';
  variant?: 'customer' | 'agent' | 'admin';
  className?: string;
}

export const HeaderDownloadAppButton: React.FC<HeaderDownloadAppButtonProps> = ({
  language,
  variant = 'customer',
  className = '',
}) => {
  const { isInstallable, isInstalled, triggerInstallPrompt } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running in standalone mode (already installed), hide or show subtle confirmation
  if (isInstalled && !justInstalled) {
    return null;
  }

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleDownloadClick = async () => {
    if (!isInIframe && isInstallable) {
      const outcome = await triggerInstallPrompt();
      if (outcome === 'accepted') {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 4000);
      } else {
        setIsModalOpen(true);
      }
    } else {
      // In iframe or non-Chromium browser, open the rich download & install center
      setIsModalOpen(true);
    }
  };

  const buttonStyle =
    variant === 'agent'
      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white shadow-md'
      : variant === 'admin'
      ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md'
      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm ring-1 ring-emerald-500/30';

  return (
    <>
      {justInstalled ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'bn' ? 'ইনস্টল সম্পন্ন হয়েছে!' : 'App Installed!'}</span>
        </div>
      ) : (
        <button
          onClick={handleDownloadClick}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all active:scale-95 group ${buttonStyle} ${className}`}
          title={
            language === 'bn'
              ? 'মোবাইলে সরাসরি অ্যাপ ডাউনলোড ও ইনস্টল করুন'
              : 'Download and Install App to your device'
          }
        >
          <Download className="w-3.5 h-3.5 animate-bounce group-hover:scale-110 transition-transform" />
          <span>{language === 'bn' ? 'অ্যাপ ডাউনলোড' : 'Download App'}</span>
          {isInstallable && (
            <span className="hidden md:inline-flex text-[9px] bg-white/25 px-1 rounded uppercase tracking-wider font-mono">
              PWA
            </span>
          )}
        </button>
      )}

      {/* Fallback Install Center & Step-by-Step Guide Modal */}
      <AppDownloadCenterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
        defaultApp={variant}
      />
    </>
  );
};
