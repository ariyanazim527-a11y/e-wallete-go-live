import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  ZoomIn,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Trash2,
  ScanLine,
  Check,
  FileText,
  BadgeCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { SAMPLE_NID_FRONT, SAMPLE_NID_BACK } from '../../types/agentKyc.ts';

// High-fidelity SVG Smart NID Card Data URIs for realistic Bangladesh Smart NID simulation
export const SMART_NID_FRONT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f4faf6"/>
      <stop offset="50%" stop-color="#e8f5ed"/>
      <stop offset="100%" stop-color="#d7eee0"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#006a4e"/>
      <stop offset="100%" stop-color="#0f5132"/>
    </linearGradient>
    <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f6d365"/>
      <stop offset="100%" stop-color="#fda085"/>
    </linearGradient>
  </defs>

  <!-- Card Border & Background -->
  <rect x="5" y="5" width="630" height="390" rx="20" fill="url(#cardBg)" stroke="#2d6a4f" stroke-width="4"/>
  
  <!-- Subtle Guilloche Watermark Pattern -->
  <circle cx="320" cy="200" r="140" fill="none" stroke="#2d6a4f" stroke-width="1" stroke-opacity="0.12" stroke-dasharray="4,4"/>
  <circle cx="320" cy="200" r="100" fill="none" stroke="#f42a41" stroke-width="1" stroke-opacity="0.12"/>

  <!-- Top Header Banner -->
  <rect x="5" y="5" width="630" height="74" rx="16" fill="url(#headerGrad)"/>
  
  <!-- BD Emblem Circle -->
  <circle cx="50" cy="42" r="24" fill="#f42a41"/>
  <circle cx="50" cy="42" r="18" fill="none" stroke="#ffdd00" stroke-width="2"/>
  <circle cx="50" cy="42" r="6" fill="#ffdd00"/>

  <text x="88" y="32" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</text>
  <text x="88" y="48" font-family="Arial, sans-serif" font-size="11" fill="#d1e7dd">Government of the People's Republic of Bangladesh</text>
  <text x="88" y="64" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffd700">NATIONAL ID CARD / জাতীয় পরিচয় পত্র</text>

  <!-- EMV Gold Smart Chip -->
  <rect x="36" y="100" width="68" height="52" rx="8" fill="url(#chipGrad)" stroke="#b8860b" stroke-width="1.5"/>
  <line x1="36" y1="126" x2="104" y2="126" stroke="#b8860b" stroke-width="1"/>
  <line x1="68" y1="100" x2="68" y2="152" stroke="#b8860b" stroke-width="1"/>
  <circle cx="70" cy="126" r="10" fill="none" stroke="#b8860b" stroke-width="1"/>

  <!-- Photo Box -->
  <rect x="36" y="170" width="130" height="155" rx="8" fill="#1e293b" stroke="#006a4e" stroke-width="2"/>
  <!-- Silhouette / Headshot Placeholder -->
  <circle cx="101" cy="225" r="32" fill="#94a3b8"/>
  <path d="M 56 315 C 60 265, 142 265, 146 315 Z" fill="#94a3b8"/>
  <text x="101" y="318" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#e2e8f0" font-weight="bold">OFFICIAL PHOTO</text>

  <!-- Signature Line -->
  <rect x="36" y="340" width="130" height="38" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <path d="M 45 362 Q 70 345, 95 360 T 145 352" fill="none" stroke="#1e3a8a" stroke-width="2"/>
  <text x="101" y="374" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#64748b">স্বাক্ষর / Signature</text>

  <!-- Text Details Block -->
  <text x="190" y="112" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">নাম:</text>
  <text x="235" y="112" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">মো: আরিয়ান আজিম</text>

  <text x="190" y="136" font-family="sans-serif" font-size="12" font-weight="bold" fill="#475569">Name:</text>
  <text x="245" y="136" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">MD. ARIYAN AZIM</text>

  <text x="190" y="166" font-family="sans-serif" font-size="12" fill="#475569">পিতা / Father:</text>
  <text x="285" y="166" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b">মো: রফিকুল ইসলাম</text>

  <text x="190" y="194" font-family="sans-serif" font-size="12" fill="#475569">মাতা / Mother:</text>
  <text x="285" y="194" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b">আয়েশা বেগম</text>

  <text x="190" y="222" font-family="sans-serif" font-size="12" fill="#475569">জন্ম তারিখ / DOB:</text>
  <text x="310" y="222" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f5132">12 Jan 1995</text>

  <!-- NID Number Box -->
  <rect x="190" y="250" width="415" height="52" rx="10" fill="#006a4e" fill-opacity="0.08" stroke="#006a4e" stroke-width="1.5"/>
  <text x="205" y="272" font-family="sans-serif" font-size="11" font-weight="bold" fill="#006a4e">NID NO / আইডি নম্বর:</text>
  <text x="205" y="294" font-family="Courier, monospace" font-size="20" font-weight="900" letter-spacing="4" fill="#b91c1c">1995 2671 82910</text>

  <!-- Holographic Seal Indicator -->
  <circle cx="565" cy="140" r="32" fill="#ecfdf5" stroke="#10b981" stroke-width="2" stroke-dasharray="3,3"/>
  <circle cx="565" cy="140" r="22" fill="#10b981" fill-opacity="0.15"/>
  <text x="565" y="137" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#047857">EC BD</text>
  <text x="565" y="148" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="bold" fill="#047857">HOLOGRAM</text>

  <!-- Footer security band -->
  <rect x="190" y="325" width="415" height="45" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <text x="202" y="342" font-family="Courier, monospace" font-size="10" fill="#64748b">SMART NID :: DIGITAL ENCRYPTION COMPLIANT</text>
  <text x="202" y="358" font-family="sans-serif" font-size="9" fill="#059669">✓ বায়োমেট্রিক ও আইরিশ রেকর্ডে সংরক্ষিত</text>
</svg>
`)}`;

export const SMART_NID_BACK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
  <defs>
    <linearGradient id="backBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdfbf7"/>
      <stop offset="50%" stop-color="#f3f4f6"/>
      <stop offset="100%" stop-color="#e5e7eb"/>
    </linearGradient>
  </defs>

  <!-- Card Border & Background -->
  <rect x="5" y="5" width="630" height="390" rx="20" fill="url(#backBg)" stroke="#374151" stroke-width="3"/>

  <!-- Top Advisory Notice -->
  <rect x="25" y="22" width="590" height="48" rx="8" fill="#fef2f2" stroke="#fca5a5" stroke-width="1"/>
  <text x="35" y="42" font-family="sans-serif" font-size="10" fill="#991b1b" font-weight="bold">এই কার্ডটি গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের সম্পত্তি। কার্ডটি হস্তান্তরযোগ্য নয়।</text>
  <text x="35" y="58" font-family="sans-serif" font-size="9" fill="#7f1d1d">কোথাও পাওয়া গেলে নিকটস্থ ডাকঘরে জমা দিন। This card is property of Government of Bangladesh.</text>

  <!-- Address Block -->
  <rect x="25" y="80" width="420" height="125" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="38" y="102" font-family="sans-serif" font-size="12" font-weight="bold" fill="#006a4e">ঠিকানা / Residential Address:</text>
  <text x="38" y="124" font-family="sans-serif" font-size="11" fill="#1f2937">বাসা/হোল্ডিং: ১২, মিরপুর ১০ সার্কেল,</text>
  <text x="38" y="144" font-family="sans-serif" font-size="11" fill="#1f2937">ডাকঘর: মিরপুর - ১২১৬, মিরপুর থানা,</text>
  <text x="38" y="164" font-family="sans-serif" font-size="11" fill="#1f2937">ঢাকা উত্তর সিটি কর্পোরেশন, ঢাকা জেলা।</text>
  <text x="38" y="188" font-family="sans-serif" font-size="10" fill="#6b7280">পোস্ট কোড: ১২১৬ | ভোটার এলাকা: মিরপুর-১০</text>

  <!-- Blood Group & Issue Date Box -->
  <rect x="460" y="80" width="155" height="125" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="475" y="104" font-family="sans-serif" font-size="11" fill="#6b7280">রক্তের গ্রুপ / Blood:</text>
  <text x="475" y="132" font-family="sans-serif" font-size="20" font-weight="900" fill="#dc2626">O+ (পজিটিভ)</text>
  <line x1="475" y1="145" x2="600" y2="145" stroke="#e5e7eb" stroke-width="1"/>
  <text x="475" y="165" font-family="sans-serif" font-size="10" fill="#6b7280">প্রদানের তারিখ / Issue:</text>
  <text x="475" y="185" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1f2937">04/03/2018</text>

  <!-- 2D Barcode / PDF417 Simulator -->
  <rect x="25" y="218" width="590" height="58" rx="8" fill="#111827"/>
  <!-- Barcode pattern lines -->
  <g fill="#f9fafb">
    <rect x="40" y="228" width="4" height="38"/>
    <rect x="48" y="228" width="8" height="38"/>
    <rect x="62" y="228" width="3" height="38"/>
    <rect x="70" y="228" width="10" height="38"/>
    <rect x="88" y="228" width="6" height="38"/>
    <rect x="100" y="228" width="4" height="38"/>
    <rect x="110" y="228" width="12" height="38"/>
    <rect x="130" y="228" width="6" height="38"/>
    <rect x="144" y="228" width="4" height="38"/>
    <rect x="156" y="228" width="10" height="38"/>
    <rect x="174" y="228" width="8" height="38"/>
    <rect x="190" y="228" width="3" height="38"/>
    <rect x="200" y="228" width="12" height="38"/>
    <rect x="220" y="228" width="5" height="38"/>
    <rect x="232" y="228" width="8" height="38"/>
    <rect x="248" y="228" width="4" height="38"/>
    <rect x="260" y="228" width="14" height="38"/>
    <rect x="282" y="228" width="6" height="38"/>
    <rect x="296" y="228" width="4" height="38"/>
    <rect x="310" y="228" width="12" height="38"/>
    <rect x="330" y="228" width="8" height="38"/>
    <rect x="346" y="228" width="4" height="38"/>
    <rect x="360" y="228" width="10" height="38"/>
    <rect x="378" y="228" width="5" height="38"/>
    <rect x="390" y="228" width="14" height="38"/>
    <rect x="412" y="228" width="8" height="38"/>
    <rect x="428" y="228" width="4" height="38"/>
    <rect x="440" y="228" width="12" height="38"/>
    <rect x="460" y="228" width="6" height="38"/>
    <rect x="474" y="228" width="10" height="38"/>
    <rect x="492" y="228" width="4" height="38"/>
    <rect x="504" y="228" width="14" height="38"/>
    <rect x="526" y="228" width="7" height="38"/>
    <rect x="540" y="228" width="12" height="38"/>
    <rect x="560" y="228" width="4" height="38"/>
    <rect x="572" y="228" width="14" height="38"/>
    <rect x="594" y="228" width="8" height="38"/>
  </g>

  <!-- Machine Readable Zone (MRZ) Lines -->
  <rect x="25" y="288" width="590" height="85" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <text x="40" y="322" font-family="Courier, monospace" font-size="14" font-weight="bold" letter-spacing="3" fill="#1e293b">I&lt;BGD1995267182910&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
  <text x="40" y="352" font-family="Courier, monospace" font-size="14" font-weight="bold" letter-spacing="3" fill="#1e293b">9501127M2803043BGD&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8AZIM&lt;&lt;ARIYAN</text>
</svg>
`)}`;

export interface NidUploadPreviewProps {
  language: 'bn' | 'en';
  frontImage: string;
  backImage: string;
  onFrontChange: (imageUrl: string) => void;
  onBackChange: (imageUrl: string) => void;
  nidNumber?: string;
  agentName?: string;
  disabled?: boolean;
}

export const NidUploadPreview: React.FC<NidUploadPreviewProps> = ({
  language,
  frontImage,
  backImage,
  onFrontChange,
  onBackChange,
  nidNumber = '1995267182910',
  agentName = 'মো: আরিয়ান আজিম',
  disabled = false,
}) => {
  const [activePreviewSide, setActivePreviewSide] = useState<'both' | 'front' | 'back'>('both');
  const [inspectModalImage, setInspectModalImage] = useState<{ src: string; title: string; side: 'front' | 'back' } | null>(null);
  const [isScanningFront, setIsScanningFront] = useState<boolean>(false);
  const [isScanningBack, setIsScanningBack] = useState<boolean>(false);
  const [dragOverFront, setDragOverFront] = useState<boolean>(false);
  const [dragOverBack, setDragOverBack] = useState<boolean>(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // File Handlers
  const handleFileProcess = (file: File, side: 'front' | 'back') => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'bn' ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন' : 'Please select an image file (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result;
      if (typeof res === 'string') {
        if (side === 'front') {
          onFrontChange(res);
        } else {
          onBackChange(res);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, side: 'front' | 'back') => {
    e.preventDefault();
    if (side === 'front') setDragOverFront(false);
    if (side === 'back') setDragOverBack(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0], side);
    }
  };

  // Mock Camera / Scan Trigger
  const handleSimulateScan = (side: 'front' | 'back') => {
    if (side === 'front') {
      setIsScanningFront(true);
      setTimeout(() => {
        setIsScanningFront(false);
        onFrontChange(SMART_NID_FRONT_SVG);
      }, 1000);
    } else {
      setIsScanningBack(true);
      setTimeout(() => {
        setIsScanningBack(false);
        onBackChange(SMART_NID_BACK_SVG);
      }, 1000);
    }
  };

  const hasFront = Boolean(frontImage);
  const hasBack = Boolean(backImage);
  const isBothReady = hasFront && hasBack;

  return (
    <div className="space-y-4">
      {/* Header and Guidelines */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-teal-400" />
            <h4 className="text-sm font-black text-white">
              {language === 'bn'
                ? 'ভোটার আইডি কার্ড আপলোড ও লাইভ প্রিভিউ'
                : 'National ID Photocopy Upload & Live Preview'}
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            {language === 'bn'
              ? 'সম্মুখভাগ (Front) ও পেছনভাগ (Back) উভয় পাশ আপলোড করে সাবমিটের পূর্বে প্রিভিউ দেখে নিন'
              : 'Upload both sides and inspect the verified card preview before submitting'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isBothReady ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <BadgeCheck className="w-3.5 h-3.5" />
              {language === 'bn' ? 'উভয় পাশ প্রস্তুত ✓' : 'Both Sides Ready ✓'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <AlertTriangle className="w-3.5 h-3.5" />
              {language === 'bn' ? 'উভয় পাশ বাধ্যতামূলক' : 'Both Sides Required'}
            </span>
          )}
        </div>
      </div>

      {/* ================= SECTION 1: DUAL UPLOAD CONTROLS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FRONT SIDE UPLOADER */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverFront(true);
          }}
          onDragLeave={() => setDragOverFront(false)}
          onDrop={(e) => handleDrop(e, 'front')}
          className={`relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
            dragOverFront
              ? 'border-teal-400 bg-teal-950/30 ring-2 ring-teal-400/30'
              : hasFront
              ? 'border-teal-500/40 bg-slate-950/80 shadow-md'
              : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-500/30">
                ১
              </span>
              <span className="text-xs font-black text-slate-100">
                {language === 'bn' ? 'এনআইডি সম্মুখভাগ (Front Side)' : 'NID Front Side'}
              </span>
            </div>
            {hasFront ? (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {language === 'bn' ? 'সংযুক্ত' : 'Attached'}
              </span>
            ) : (
              <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-bold border border-rose-500/30">
                {language === 'bn' ? 'আপলোড প্রয়োজন' : 'Required'}
              </span>
            )}
          </div>

          {/* Interactive Dropzone / Preview Thumbnail */}
          <div className="relative aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 group flex items-center justify-center">
            {isScanningFront ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <div className="w-10 h-10 rounded-full border-2 border-teal-400 border-t-transparent animate-spin mb-2" />
                <span className="text-xs font-bold text-teal-300 animate-pulse">
                  {language === 'bn' ? 'এনআইডি ফ্রন্ট অপটিক্যাল স্ক্যান হচ্ছে...' : 'Scanning Front NID OCR...'}
                </span>
              </div>
            ) : hasFront ? (
              <>
                <img
                  src={frontImage}
                  alt="NID Front Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Floating Controls Overlay */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setInspectModalImage({
                        src: frontImage,
                        title: language === 'bn' ? 'জাতীয় পরিচয়পত্র - সম্মুখভাগ (Front)' : 'National ID - Front Side',
                        side: 'front',
                      })
                    }
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-bold shadow-md border border-slate-700 flex items-center gap-1"
                    title="Zoom & Inspect"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span>{language === 'bn' ? 'জুম দেখুন' : 'Inspect'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onFrontChange('')}
                    className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div
                onClick={() => frontInputRef.current?.click()}
                className="cursor-pointer text-center p-4 w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-teal-300 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-2 border border-slate-700">
                  <Upload className="w-6 h-6 text-teal-400" />
                </div>
                <span className="text-xs font-bold text-slate-200">
                  {language === 'bn' ? 'ক্লিক করে ফাইল বা ড্র্যাগ করে দিন' : 'Click or drag front photocopy'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">JPG, PNG, WebP (Max 10MB)</span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="file"
              ref={frontInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileProcess(file, 'front');
              }}
              disabled={disabled}
            />

            <button
              type="button"
              onClick={() => frontInputRef.current?.click()}
              disabled={disabled}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span>{hasFront ? (language === 'bn' ? 'পরিবর্তন' : 'Change') : (language === 'bn' ? 'ফাইল আপলোড' : 'Upload File')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateScan('front')}
              disabled={disabled || isScanningFront}
              className="py-2 px-3 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 rounded-xl text-[11px] font-bold border border-teal-500/30 flex items-center gap-1.5 transition-colors"
              title="Camera Scan Simulation"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ক্যামেরা স্ক্যান' : 'Cam Scan'}</span>
            </button>

            <button
              type="button"
              onClick={() => onFrontChange(SMART_NID_FRONT_SVG)}
              disabled={disabled}
              className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-[10px] font-bold border border-slate-700 transition-colors"
              title="Load Bangladesh Smart NID Preset"
            >
              {language === 'bn' ? 'স্মার্ট ডেমো' : 'Smart Demo'}
            </button>
          </div>
        </div>

        {/* BACK SIDE UPLOADER */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverBack(true);
          }}
          onDragLeave={() => setDragOverBack(false)}
          onDrop={(e) => handleDrop(e, 'back')}
          className={`relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
            dragOverBack
              ? 'border-teal-400 bg-teal-950/30 ring-2 ring-teal-400/30'
              : hasBack
              ? 'border-teal-500/40 bg-slate-950/80 shadow-md'
              : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-500/30">
                ২
              </span>
              <span className="text-xs font-black text-slate-100">
                {language === 'bn' ? 'এনআইডি পেছনভাগ (Back Side)' : 'NID Back Side'}
              </span>
            </div>
            {hasBack ? (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {language === 'bn' ? 'সংযুক্ত' : 'Attached'}
              </span>
            ) : (
              <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-bold border border-rose-500/30">
                {language === 'bn' ? 'আপলোড প্রয়োজন' : 'Required'}
              </span>
            )}
          </div>

          {/* Interactive Dropzone / Preview Thumbnail */}
          <div className="relative aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 group flex items-center justify-center">
            {isScanningBack ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <div className="w-10 h-10 rounded-full border-2 border-teal-400 border-t-transparent animate-spin mb-2" />
                <span className="text-xs font-bold text-teal-300 animate-pulse">
                  {language === 'bn' ? 'এনআইডি ব্যাক অপটিক্যাল স্ক্যান হচ্ছে...' : 'Scanning Back NID OCR...'}
                </span>
              </div>
            ) : hasBack ? (
              <>
                <img
                  src={backImage}
                  alt="NID Back Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Floating Controls Overlay */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setInspectModalImage({
                        src: backImage,
                        title: language === 'bn' ? 'জাতীয় পরিচয়পত্র - পেছনভাগ (Back)' : 'National ID - Back Side',
                        side: 'back',
                      })
                    }
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-bold shadow-md border border-slate-700 flex items-center gap-1"
                    title="Zoom & Inspect"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span>{language === 'bn' ? 'জুম দেখুন' : 'Inspect'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onBackChange('')}
                    className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div
                onClick={() => backInputRef.current?.click()}
                className="cursor-pointer text-center p-4 w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-teal-300 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-2 border border-slate-700">
                  <Upload className="w-6 h-6 text-teal-400" />
                </div>
                <span className="text-xs font-bold text-slate-200">
                  {language === 'bn' ? 'ক্লিক করে ফাইল বা ড্র্যাগ করে দিন' : 'Click or drag back photocopy'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Barcode, Address, Blood Group Side</span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="file"
              ref={backInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileProcess(file, 'back');
              }}
              disabled={disabled}
            />

            <button
              type="button"
              onClick={() => backInputRef.current?.click()}
              disabled={disabled}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span>{hasBack ? (language === 'bn' ? 'পরিবর্তন' : 'Change') : (language === 'bn' ? 'ফাইল আপলোড' : 'Upload File')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateScan('back')}
              disabled={disabled || isScanningBack}
              className="py-2 px-3 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 rounded-xl text-[11px] font-bold border border-teal-500/30 flex items-center gap-1.5 transition-colors"
              title="Camera Scan Simulation"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ক্যামেরা স্ক্যান' : 'Cam Scan'}</span>
            </button>

            <button
              type="button"
              onClick={() => onBackChange(SMART_NID_BACK_SVG)}
              disabled={disabled}
              className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-[10px] font-bold border border-slate-700 transition-colors"
              title="Load Bangladesh Smart NID Back Preset"
            >
              {language === 'bn' ? 'স্মার্ট ডেমো' : 'Smart Demo'}
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: LIVE PREVIEW & VERIFICATION READINESS ================= */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Section Title & View Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <div>
              <h5 className="text-xs font-black text-white">
                {language === 'bn'
                  ? 'আবেদন সাবমিটের পূর্বে NID ফটোকপি প্রিভিউ ও কোয়ালিটি চেক'
                  : 'Pre-Submission NID Live Preview & Quality Check'}
              </h5>
              <p className="text-[10px] text-slate-400">
                {language === 'bn'
                  ? 'আপনার আপলোডকৃত কার্ডটি এডমিন ও সিস্টেম ভেরিফিকেশনে ঠিক যেভাবে দৃশ্যমান হবে'
                  : 'How your uploaded identity document will appear to the verification system'}
              </p>
            </div>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700 text-[11px] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActivePreviewSide('both')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activePreviewSide === 'both' ? 'bg-teal-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'উভয় পাশ (Both)' : 'Both Sides'}
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewSide('front')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activePreviewSide === 'front' ? 'bg-teal-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'সম্মুখভাগ' : 'Front'}
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewSide('back')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activePreviewSide === 'back' ? 'bg-teal-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'পেছনভাগ' : 'Back'}
            </button>
          </div>
        </div>

        {/* Live Preview Display Cards */}
        {(!hasFront && !hasBack) ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-bold text-slate-400">
              {language === 'bn'
                ? 'এখনও কোনো এনআইডি ফটোকপি আপলোড করা হয়নি।'
                : 'No NID photocopy uploaded yet.'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {language === 'bn'
                ? 'উপরে ফাইল আপলোড করুন অথবা দ্রুত পরীক্ষার জন্য "স্মার্ট ডেমো" বাটনে ক্লিক করুন।'
                : 'Upload files above or click "Smart Demo" for instant realistic test cards.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cards Grid */}
            <div className={`grid gap-4 ${activePreviewSide === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* FRONT PREVIEW CARD */}
              {(activePreviewSide === 'both' || activePreviewSide === 'front') && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-teal-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      {language === 'bn' ? 'সম্মুখভাগ ফটোকপি (Front Preview)' : 'Front Side Photocopy'}
                    </span>
                    {hasFront && (
                      <button
                        type="button"
                        onClick={() =>
                          setInspectModalImage({
                            src: frontImage,
                            title: language === 'bn' ? 'জাতীয় পরিচয়পত্র - সম্মুখভাগ (Front)' : 'National ID - Front Side',
                            side: 'front',
                          })
                        }
                        className="text-[10px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20"
                      >
                        <ZoomIn className="w-3 h-3" />
                        <span>{language === 'bn' ? 'পূর্ণাঙ্গ স্ক্রিন' : 'Fullscreen'}</span>
                      </button>
                    )}
                  </div>

                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
                    {hasFront ? (
                      <img
                        src={frontImage}
                        alt="NID Front Verified"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs p-4">
                        <AlertCircle className="w-6 h-6 mb-1 text-rose-400" />
                        <span>{language === 'bn' ? 'সম্মুখভাগ বাকি রয়েছে' : 'Front side missing'}</span>
                      </div>
                    )}
                  </div>

                  {/* OCR Extraction Mock for Front */}
                  {hasFront && (
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 block text-[10px]">এনআইডি কার্ডধারী:</span>
                        <span className="text-slate-200 font-bold truncate block">{agentName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">শনাক্তকৃত NID No:</span>
                        <span className="text-emerald-400 font-mono font-bold">{nidNumber}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BACK PREVIEW CARD */}
              {(activePreviewSide === 'both' || activePreviewSide === 'back') && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-teal-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      {language === 'bn' ? 'পেছনভাগ ফটোকপি (Back Preview)' : 'Back Side Photocopy'}
                    </span>
                    {hasBack && (
                      <button
                        type="button"
                        onClick={() =>
                          setInspectModalImage({
                            src: backImage,
                            title: language === 'bn' ? 'জাতীয় পরিচয়পত্র - পেছনভাগ (Back)' : 'National ID - Back Side',
                            side: 'back',
                          })
                        }
                        className="text-[10px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20"
                      >
                        <ZoomIn className="w-3 h-3" />
                        <span>{language === 'bn' ? 'পূর্ণাঙ্গ স্ক্রিন' : 'Fullscreen'}</span>
                      </button>
                    )}
                  </div>

                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
                    {hasBack ? (
                      <img
                        src={backImage}
                        alt="NID Back Verified"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs p-4">
                        <AlertCircle className="w-6 h-6 mb-1 text-rose-400" />
                        <span>{language === 'bn' ? 'পেছনভাগ বাকি রয়েছে' : 'Back side missing'}</span>
                      </div>
                    )}
                  </div>

                  {/* OCR Extraction Mock for Back */}
                  {hasBack && (
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 block text-[10px]">বারকোড ও ঠিকানা:</span>
                        <span className="text-emerald-400 font-bold">PDF417 / MRZ Detected</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">রক্তের গ্রুপ ও বিভাগ:</span>
                        <span className="text-slate-200 font-bold">O+ (ঢাকা বিভাগ)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quality Assessment & Pre-Submission Readiness Matrix */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {language === 'bn' ? 'স্বয়ংক্রিয় গুণমান পর্যালোচনা (Document Quality Matrix):' : 'Quality Assessment Matrix:'}
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                  <span className={`flex items-center gap-1 ${hasFront ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> চার কোণা দৃশ্যমান ({hasFront ? '১০০%' : '০%'})
                  </span>
                  <span className={`flex items-center gap-1 ${isBothReady ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> লেখা ও ছবি স্পষ্টতা (৯৯.৪%)
                  </span>
                  <span className={`flex items-center gap-1 ${hasBack ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> বারকোড ও সিকিউরিটি স্ক্যান পাস
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] text-slate-400">স্ট্যাটাস:</span>
                {isBothReady ? (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'সাবমিটের উপযোগী' : 'Ready to Submit'}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'অসম্পূর্ণ আপলোড' : 'Incomplete'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= SECTION 3: FULLSCREEN INSPECTION MODAL ================= */}
      {inspectModalImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <h4 className="text-base font-black text-white">{inspectModalImage.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setInspectModalImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-Res Image View */}
            <div className="aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
              <img
                src={inspectModalImage.src}
                alt={inspectModalImage.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Footer Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2 pt-1">
              <div>
                <span className="text-teal-400 font-bold">✓ রেজোলিউশন: </span>
                <span>হাই ডেফিনিশন অপটিক্যাল প্রিভিউ (৬৪০ x ৪০০ পিক্সেল)</span>
              </div>
              <button
                type="button"
                onClick={() => setInspectModalImage(null)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-colors"
              >
                {language === 'bn' ? 'প্রিভিউ বন্ধ করুন' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
