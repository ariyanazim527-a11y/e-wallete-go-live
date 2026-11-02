import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Eye,
  X,
  FileText,
  Phone,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Building2,
  CreditCard,
  UserCheck,
  Info,
  Calendar,
  Lock,
} from 'lucide-react';
import {
  AgentKycRecord,
  loadAgentApplications,
  saveAgentApplications,
  SAMPLE_NID_FRONT,
  SAMPLE_NID_BACK,
} from '../../types/agentKyc.ts';

interface AgentKycStatusDashboardProps {
  language: 'bn' | 'en';
  currentPhone?: string;
  currentAppId?: string;
  onProceedToTerminal?: () => void;
  onBackToEdit?: () => void;
  isEmbeddedInGate?: boolean;
}

export const AgentKycStatusDashboard: React.FC<AgentKycStatusDashboardProps> = ({
  language,
  currentPhone = '01739-420736',
  currentAppId,
  onProceedToTerminal,
  onBackToEdit,
  isEmbeddedInGate = false,
}) => {
  const [applications, setApplications] = useState<AgentKycRecord[]>(() => loadAgentApplications());
  const [searchQuery, setSearchQuery] = useState<string>(currentPhone || currentAppId || '');
  const [selectedAppId, setSelectedAppId] = useState<string>(() => {
    const apps = loadAgentApplications();
    if (currentAppId) {
      const match = apps.find((a) => a.id === currentAppId);
      if (match) return match.id;
    }
    if (currentPhone) {
      const match = apps.find((a) => a.phone === currentPhone);
      if (match) return match.id;
    }
    return apps[0]?.id || 'agt-app-101';
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [inspectImage, setInspectImage] = useState<{ title: string; src: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync with global custom event
  useEffect(() => {
    const handleUpdate = () => {
      setApplications(loadAgentApplications());
    };
    window.addEventListener('uwallet_agent_applications_updated', handleUpdate);
    return () => window.removeEventListener('uwallet_agent_applications_updated', handleUpdate);
  }, []);

  const triggerNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find currently viewed application
  const activeApp: AgentKycRecord | undefined =
    applications.find((a) => a.id === selectedAppId) ||
    applications.find((a) => a.phone.includes(searchQuery.trim())) ||
    applications[0];

  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setApplications(loadAgentApplications());
      setIsRefreshing(false);
      triggerNotice(
        language === 'bn'
          ? 'স্ট্যাটাস ডাটাবেজ সফলভাবে রিফ্রেশ করা হয়েছে।'
          : 'Status database refreshed successfully.'
      );
    }, 600);
  };

  // Simulation: Quick Admin Approval for testing
  const handleSimulateApproval = () => {
    if (!activeApp) return;
    const updated = applications.map((app) =>
      app.id === activeApp.id
        ? {
            ...app,
            status: 'approved' as const,
            depositVerified: true,
            reviewedAt: language === 'bn' ? 'অ্যাডমিন দ্বারা অনুমোদিত (এইমাত্র)' : 'Approved by Admin (Just now)',
          }
        : app
    );
    saveAgentApplications(updated);
    setApplications(updated);
    triggerNotice(
      language === 'bn'
        ? '✓ অভিনন্দন! আবেদনটি সেন্ট্রাল অ্যাডমিন দ্বারা অনুমোদিত হয়েছে।'
        : '✓ Congratulations! Application approved by Admin.'
    );
  };

  // Simulation: Toggle Pending / Revision request
  const handleSimulateRevision = () => {
    if (!activeApp) return;
    const updated = applications.map((app) =>
      app.id === activeApp.id
        ? {
            ...app,
            status: 'rejected' as const,
            rejectionReason:
              language === 'bn'
                ? 'ভোটার আইডির পেছনের অংশের বারকোডটি কিছুটা অস্পষ্ট এবং সিকিউরিটি জামানতের ট্রানজাকশন আইডি (TrxID) মিলছে না। অনুগ্রহ করে পুনরায় পরিষ্কার ছবি ও সঠিক TrxID সাবমিট করুন।'
                : 'Backside barcode is blurred and deposit TrxID does not match records. Please resubmit clear photo.',
          }
        : app
    );
    saveAgentApplications(updated);
    setApplications(updated);
    triggerNotice(
      language === 'bn'
        ? 'আবেদনে সংশোধনের অনুরোধ পাঠানো হয়েছে।'
        : 'Revision request simulated.'
    );
  };

  // Reset to pending
  const handleResetToPending = () => {
    if (!activeApp) return;
    const updated = applications.map((app) =>
      app.id === activeApp.id
        ? {
            ...app,
            status: 'pending' as const,
            rejectionReason: undefined,
            depositVerified: false,
            submittedAt: 'Today, 2:15 PM',
          }
        : app
    );
    saveAgentApplications(updated);
    setApplications(updated);
    triggerNotice(
      language === 'bn'
        ? 'আবেদনের স্ট্যাটাস পুনরায় পর্যালোচনায় সেট করা হয়েছে।'
        : 'Status reset to pending review.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-teal-500/20 border border-teal-500/50 rounded-2xl text-xs text-teal-300 font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <Sparkles className="w-4 h-4 shrink-0 text-teal-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Header & Live Application Tracker Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/60 border border-teal-500/30 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base">
                  {language === 'bn' ? 'এজেন্ট এনআইডি ভেরিফিকেশন স্ট্যাটাস' : 'Agent NID Verification Status'}
                </h3>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30 font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'আপনার জমা দেওয়া জাতীয় পরিচয়পত্র (NID) ও জামানত অনুমোদন ট্র্যাকিং ড্যাশবোর্ড'
                  : 'Monitor document processing pipeline, OCR audit, and deposit clearance in real-time'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{language === 'bn' ? 'স্ট্যাটাস রিফ্রেশ' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Application Selector & Search Pill */}
        <div className="pt-2 border-t border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-slate-400 text-[11px] whitespace-nowrap font-medium">
              {language === 'bn' ? 'আবেদন তালিকা:' : 'Applications:'}
            </span>
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedAppId(app.id)}
                className={`px-2.5 py-1 rounded-xl font-medium text-[11px] whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  activeApp?.id === app.id
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold shadow-xs'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    app.status === 'approved'
                      ? 'bg-emerald-400'
                      : app.status === 'rejected'
                      ? 'bg-rose-400'
                      : 'bg-amber-400 animate-pulse'
                  }`}
                />
                <span>{app.ownerName}</span>
                <span className="text-[10px] text-slate-500 font-mono">({app.phone.slice(-4)})</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder={language === 'bn' ? 'ফোন বা আইডি সার্চ...' : 'Search by phone or ID...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-56 py-1.5 pl-7 pr-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
          </div>
        </div>
      </div>

      {activeApp ? (
        <>
          {/* 2. Primary Status Hero Card with Diagnostics */}
          <div
            className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
              activeApp.status === 'approved'
                ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/80 border-emerald-500/50'
                : activeApp.status === 'rejected'
                ? 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-950 border-rose-500/50'
                : 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border-amber-500/40'
            }`}
          >
            {/* Background ambient glow */}
            <div
              className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
                activeApp.status === 'approved'
                  ? 'bg-emerald-500/10'
                  : activeApp.status === 'rejected'
                  ? 'bg-rose-500/10'
                  : 'bg-amber-500/10'
              }`}
            />

            <div className="relative space-y-4">
              {/* Badge & Meta header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {language === 'bn' ? 'আবেদন ট্র্যাকিং আইডি:' : 'Application Ref:'}
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono font-bold text-teal-300">
                    <span>{activeApp.id.toUpperCase()}</span>
                    <button
                      onClick={() => copyToClipboard(activeApp.id)}
                      className="text-slate-400 hover:text-white"
                      title="Copy ID"
                    >
                      {copiedId === activeApp.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Status Pill */}
                {activeApp.status === 'approved' && (
                  <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-black text-xs flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'bn' ? 'অনুমোদিত ও সক্রিয় (Approved & Live)' : 'Approved & Verified'}</span>
                  </div>
                )}

                {activeApp.status === 'pending' && (
                  <div className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 font-black text-xs flex items-center gap-2 shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <span>{language === 'bn' ? 'পর্যালোচনাধীন (In Verification Queue)' : 'Pending Review'}</span>
                  </div>
                )}

                {activeApp.status === 'rejected' && (
                  <div className="px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 font-black text-xs flex items-center gap-1.5 shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>{language === 'bn' ? 'সংশোধন প্রয়োজন (Revision Required)' : 'Action Required'}</span>
                  </div>
                )}
              </div>

              {/* Title & Headline */}
              <div>
                <h4 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                  <span>{activeApp.agencyName}</span>
                  <span className="text-xs font-normal text-slate-400">({activeApp.ownerName})</span>
                </h4>
                <p className="text-xs text-slate-300 pt-0.5">
                  <span className="text-slate-400">{language === 'bn' ? 'আউটলেট:' : 'Outlet:'} </span>
                  {activeApp.outletAddress} • <span className="font-mono text-teal-300 font-bold">{activeApp.phone}</span>
                </p>
              </div>

              {/* Status Message / Pending Diagnostics Banner */}
              {activeApp.status === 'pending' && (
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      {language === 'bn' ? 'আবেদনের বর্তমান অবস্থান:' : 'Current Pipeline Status:'}
                    </span>
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {language === 'bn' ? 'কিউ অবস্থান: #২ • আনুমানিক সময়: ১৫-৩০ মিনিট' : 'Queue: #2 • Est. 15-30 mins'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {language === 'bn'
                      ? 'আপনার জাতীয় পরিচয়পত্রের উভয় পাশের ফটোকপি ও সিকিউরিটি জামানতের ট্রানজাকশন আইডি রিসিভ করা হয়েছে। স্বয়ংক্রিয় এআই অপটিক্যাল ভেরিফিকেশন সফল হয়েছে। বর্তমানে কেন্দ্রীয় সুপার-অ্যাডমিন দ্বারা ব্যাংক এসক্রো রিকনসিলিয়েশন ও আউটলেট অথেন্টিকেশন যাচাই করা হচ্ছে।'
                      : 'Your Front & Back NID photocopies have passed optical pre-checks. Currently awaiting Central Admin Escrow Reconciliation.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      <span>{language === 'bn' ? 'জমা দেওয়ার সময়:' : 'Submitted:'} </span>
                      <span className="text-white font-medium">{activeApp.submittedAt}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'bn' ? 'সিকিউরিটি জামানত:' : 'Security Deposit:'} </span>
                      <span className="text-amber-300 font-bold font-mono">
                        ৳{activeApp.securityDepositAmount?.toLocaleString() || '5,000'} ({activeApp.depositProvider?.toUpperCase() || 'MFS'})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeApp.status === 'approved' && (
                <div className="p-4 bg-emerald-950/80 rounded-2xl border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {language === 'bn' ? 'যাচাই সম্পূর্ণ সফল হয়েছে' : 'Verification Successful'}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {activeApp.reviewedAt || 'Approved Today'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {language === 'bn'
                      ? 'অভিনন্দন! আপনার জাতীয় পরিচয়পত্র ও আউটলেট লাইসেন্স নির্বাচন কমিশন ও কেন্দ্রীয় ব্যাংক গেটওয়েতে শতভাগ যাচাই হয়েছে। আপনার ফ্লোট ব্যালেন্স ও ২১০+ মেগা ডিলারশিপ টার্মিনাল এখন সম্পূর্ণ আনলক।'
                      : 'Congratulations! Your NID and outlet documentation are fully verified. Terminal unlocked.'}
                  </p>
                  {onProceedToTerminal && (
                    <button
                      onClick={onProceedToTerminal}
                      className="mt-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <span>{language === 'bn' ? 'টার্মিনালে প্রবেশ করুন' : 'Proceed to Terminal'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {activeApp.status === 'rejected' && (
                <div className="p-4 bg-rose-950/80 rounded-2xl border border-rose-500/50 space-y-3">
                  <div className="flex items-center gap-2 text-rose-300 font-black text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>{language === 'bn' ? 'আবেদনে সংশোধন আবশ্যক' : 'Document Correction Required'}</span>
                  </div>
                  <p className="text-xs text-rose-200 leading-relaxed bg-rose-900/40 p-3 rounded-xl border border-rose-800">
                    <strong className="text-white block mb-0.5">{language === 'bn' ? 'অডিট কারণ:' : 'Audit Note:'}</strong>
                    {activeApp.rejectionReason ||
                      (language === 'bn'
                        ? 'এনআইডি পেছনের পাতার বারকোড ঝাপসা অথবা ট্রানজাকশন আইডি মিলছে না।'
                        : 'NID back barcode is unreadable or TrxID could not be verified.')}
                  </p>
                  {onBackToEdit && (
                    <button
                      onClick={onBackToEdit}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ডকুমেন্ট পুনরায় আপলোড করুন' : 'Resubmit Documents'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. Multi-Stage Progress Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-black text-white text-sm">
                  {language === 'bn' ? '৪-ধাপ ভেরিফিকেশন প্রসেস টাইমলাইন' : '4-Stage Verification Pipeline'}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'প্রতিটি ধাপের রিয়েল-টাইম অডিট অগ্রগতি' : 'Real-time progression of your KYC audit'}
                </p>
              </div>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                {activeApp.status === 'approved' ? '৪/৪ সম্পন্ন' : activeApp.status === 'rejected' ? 'ধাপ ৩ এ স্থগিত' : '৩/৪ প্রসেসিং'}
              </span>
            </div>

            {/* Steps Container */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 font-bold" />
                </div>
                <div className="flex-1 pb-4 border-b border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-xs">
                      {language === 'bn' ? 'ধাপ ১: নথি ও আবেদন ফরম জমাদান' : 'Step 1: Document Submission'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded">
                      {language === 'bn' ? '✓ সম্পন্ন' : 'Completed'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {language === 'bn'
                      ? 'এজেন্টের নাম, মোবাইল নম্বর, আউটলেট ঠিকানা এবং ভোটার আইডির সম্মুখ ও পেছনভাগ ডিজিটাল ফাইলে আপলোড ও সংরক্ষিত হয়েছে।'
                      : 'Full profile, outlet metadata, and dual-side NID photos submitted.'}
                  </p>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {activeApp.submittedAt} • Ref: {activeApp.id}
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 font-bold" />
                </div>
                <div className="flex-1 pb-4 border-b border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-xs">
                      {language === 'bn' ? 'ধাপ ২: স্বয়ংক্রিয় এআই OCR ও অপটিক্যাল অডিট' : 'Step 2: AI OCR & Optical Integrity'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded">
                      {language === 'bn' ? '✓ ৯৯.৪% স্কোর' : 'Passed (99.4%)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {language === 'bn'
                      ? 'ভোটার আইডির ৪ কোণা স্ক্যান, নির্বাচন কমিশনের গোল সিল ও চিপ ডিটেকশন সম্পন্ন। NID নম্বর ' +
                        activeApp.nidNumber +
                        ' স্বয়ংক্রিয়ভাবে এক্সট্র্যাক্ট হয়েছে।'
                      : 'Edge detection, official seal verification, and OCR extraction verified.'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                    activeApp.depositVerified || activeApp.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : activeApp.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  }`}
                >
                  {activeApp.depositVerified || activeApp.status === 'approved' ? (
                    <Check className="w-4 h-4" />
                  ) : activeApp.status === 'rejected' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 pb-4 border-b border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-xs">
                      {language === 'bn' ? 'ধাপ ৩: সিকিউরিটি জামানত এসক্রো রিকনসিলিয়েশন' : 'Step 3: Security Deposit Escrow Clearance'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        activeApp.depositVerified || activeApp.status === 'approved'
                          ? 'text-emerald-400 bg-emerald-400/10'
                          : activeApp.status === 'rejected'
                          ? 'text-rose-400 bg-rose-400/10'
                          : 'text-amber-400 bg-amber-400/10 animate-pulse'
                      }`}
                    >
                      {activeApp.depositVerified || activeApp.status === 'approved'
                        ? language === 'bn'
                          ? '✓ জামানত লকড'
                          : 'Deposit Cleared'
                        : activeApp.status === 'rejected'
                        ? language === 'bn'
                          ? 'TrxID অমিল'
                          : 'TrxID Mismatch'
                        : language === 'bn'
                        ? 'অপেক্ষমাণ (Pending)'
                        : 'Pending Clearance'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {language === 'bn'
                      ? `জামানত পরিমাণ ৳${(activeApp.securityDepositAmount || 5000).toLocaleString()} (${activeApp.depositProvider?.toUpperCase() || 'MFS'})। TrxID: `
                      : `Security deposit of BDT ${(activeApp.securityDepositAmount || 5000).toLocaleString()}. TrxID: `}
                    <span className="font-mono text-teal-300 font-bold">{activeApp.depositTrxId || 'N/A'}</span>
                  </p>
                  {(!activeApp.depositVerified && activeApp.status === 'pending') && (
                    <p className="text-[11px] text-amber-300/90 pt-0.5">
                      {language === 'bn'
                        ? 'ℹ️ ব্যাংক গেটওয়ে থেকে ট্রানজাকশন ভ্যালিডেশন কনফার্মেশন প্রসেস হচ্ছে।'
                        : 'ℹ️ Validating transaction record against bank escrow gateway.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                    activeApp.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {activeApp.status === 'approved' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">৪</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-xs">
                      {language === 'bn' ? 'ধাপ ৪: সুপার-অ্যাডমিন অডিট ও টার্মিনাল আনলক' : 'Step 4: Final Admin Audit & Terminal Unlock'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        activeApp.status === 'approved'
                          ? 'text-emerald-400 bg-emerald-400/10'
                          : 'text-slate-500 bg-slate-800'
                      }`}
                    >
                      {activeApp.status === 'approved'
                        ? language === 'bn'
                          ? '✓ সক্রিয়'
                          : 'Active'
                        : language === 'bn'
                        ? 'কিউতে অপেক্ষমাণ'
                        : 'Awaiting Sign-off'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {language === 'bn'
                      ? 'অ্যাডমিন চূড়ান্ত অনুমোদনের পর এজেন্টের জন্য সিম পেমেন্ট রাউটিং ও দৈনিক ১.০০%-১.৪০% কমিশন টার্মিনাল সক্রিয় করা হয়।'
                      : 'Terminal issuance, float balance setup, and daily incentive system activation.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Dedicated Diagnostic Panel: "Why is your application pending?" */}
          <div className="bg-slate-900 border border-teal-500/30 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <h4 className="font-black text-white text-sm">
                {language === 'bn'
                  ? '🔍 আবেদনটি কেন পেন্ডিং বা অপেক্ষমাণ? বিস্তারিত কারণ ও সমাধান'
                  : '🔍 Why is your application pending? Live Diagnostics & Help'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Diagnostic Card 1: Deposit Clearance */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">১. সিকিউরিটি জামানত</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      activeApp.depositVerified
                        ? 'text-emerald-400 bg-emerald-400/10'
                        : 'text-amber-400 bg-amber-400/10'
                    }`}
                  >
                    {activeApp.depositVerified ? '✓ ম্যাচ করেছে' : 'ম্যাচিং চলছে'}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {activeApp.depositVerified
                    ? 'আপনার ট্রানজাকশন আইডি ' +
                      (activeApp.depositTrxId || 'TRX') +
                      ' সেন্ট্রাল এসক্রোতে মিলেছে এবং জামানত জমা হয়েছে।'
                    : 'ব্যাংক ও এমএফএস (বিকাশ/নগদ/রকেট) স্টেটমেন্টের সাথে TrxID মেলাতে সাধারণত ১০-৩০ মিনিট প্রয়োজন হয়।'}
                </p>
              </div>

              {/* Diagnostic Card 2: Dual NID Clarity */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">২. এনআইডি ফটোকপি</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-400/10 font-bold px-1.5 py-0.5 rounded">
                    ✓ উভয় পাশ প্রাপ্ত
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {language === 'bn'
                    ? 'সামনে ও পেছনের ফটোকপি স্পষ্ট। ঠিকানা ও জাতীয় পরিচয়পত্র নম্বর ' +
                      activeApp.nidNumber +
                      ' ভেরিফায়ারের রিভিউর জন্য প্রস্তুত।'
                    : 'Front and Back NID images are verified for sharpness and election commission barcodes.'}
                </p>
              </div>

              {/* Diagnostic Card 3: Queue & Business Verification */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">৩. ম্যানুয়াল অফিসার কিউ</span>
                  <span className="text-[10px] text-teal-400 bg-teal-400/10 font-bold px-1.5 py-0.5 rounded">
                    #২ নম্বরে আছে
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {language === 'bn'
                    ? 'সেন্ট্রাল অ্যাডমিন অফিসার প্রতিটি এজেন্টের দোকান ও ট্রেড লাইসেন্স নম্বর ক্রস-চেক করে অনুমোদন দিয়ে থাকেন।'
                    : 'Human KYC supervisor verifies outlet address to prevent multiple agent duplicates in same area.'}
                </p>
              </div>
            </div>

            {/* Quick Action Hotline Help */}
            <div className="p-3.5 bg-teal-950/40 rounded-2xl border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">
                    {language === 'bn' ? 'জরুরি অনুমোদন বা সরাসরি সহায়তা প্রয়োজন?' : 'Need urgent approval assistance?'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {language === 'bn'
                      ? 'এজেন্ট অনবোর্ডিং হেল্পলাইন: 01739-420736 (সকাল ৯টা - রাত ১১টা)'
                      : 'Hotline: 01739-420736 (Direct Agent Onboarding Desk)'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard('01739420736')}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                {copiedId === '01739420736' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'নম্বর কপি করুন' : 'Copy Number'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5. Submitted Documents Viewer (Front & Back NID Cards) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <div>
                  <h4 className="font-black text-white text-sm">
                    {language === 'bn' ? 'জমা দেওয়া ভোটার আইডি (NID) ডকুমেন্টস প্রিভিউ' : 'Submitted NID Documents Preview'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {language === 'bn' ? 'যাচাইয়ের জন্য পাঠানো সম্মুখ ও পেছনের ফটোকপি' : 'Front and Back photocopies under review'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-teal-300 font-mono bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                OCR CHECK: PASS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Front Photo Card */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    {language === 'bn' ? '১. এনআইডি সম্মুখভাগ (Front Photo)' : '1. NID Front Side'}
                  </span>
                  <button
                    onClick={() =>
                      setInspectImage({
                        title: language === 'bn' ? 'এনআইডি সম্মুখভাগ (উচ্চ রেজোলিউশন)' : 'NID Front (High-Res)',
                        src: activeApp.nidFrontPhoto || SAMPLE_NID_FRONT,
                      })
                    }
                    className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'বড় করে দেখুন' : 'Inspect'}</span>
                  </button>
                </div>
                <div
                  onClick={() =>
                    setInspectImage({
                      title: language === 'bn' ? 'এনআইডি সম্মুখভাগ' : 'NID Front',
                      src: activeApp.nidFrontPhoto || SAMPLE_NID_FRONT,
                    })
                  }
                  className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 cursor-pointer group relative shadow-md"
                >
                  <img
                    src={activeApp.nidFrontPhoto || SAMPLE_NID_FRONT}
                    alt="Front NID"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{language === 'bn' ? 'ফুল স্ক্রিন' : 'Zoom'}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>নাম: {activeApp.ownerName}</span>
                  <span className="font-mono text-teal-400">NID: {activeApp.nidNumber}</span>
                </div>
              </div>

              {/* Back Photo Card */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    {language === 'bn' ? '২. এনআইডি পেছনের অংশ (Back Photo)' : '2. NID Back Side'}
                  </span>
                  <button
                    onClick={() =>
                      setInspectImage({
                        title: language === 'bn' ? 'এনআইডি পেছনের অংশ (উচ্চ রেজোলিউশন)' : 'NID Back (High-Res)',
                        src: activeApp.nidBackPhoto || SAMPLE_NID_BACK,
                      })
                    }
                    className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'বড় করে দেখুন' : 'Inspect'}</span>
                  </button>
                </div>
                <div
                  onClick={() =>
                    setInspectImage({
                      title: language === 'bn' ? 'এনআইডি পেছনের অংশ' : 'NID Back',
                      src: activeApp.nidBackPhoto || SAMPLE_NID_BACK,
                    })
                  }
                  className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 cursor-pointer group relative shadow-md"
                >
                  <img
                    src={activeApp.nidBackPhoto || SAMPLE_NID_BACK}
                    alt="Back NID"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{language === 'bn' ? 'ফুল স্ক্রিন' : 'Zoom'}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>আউটলেট: {activeApp.outletAddress.slice(0, 25)}...</span>
                  <span className="text-emerald-400 font-bold">✓ বারকোড ভেরিফাইড</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Testing / Developer Simulation Toolbar */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-3xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                {language === 'bn' ? 'টেস্টিং ও ডেমো সিমুলেশন কন্ট্রোল:' : 'Live Simulation & Test Controls:'}
              </span>
              <span className="text-[10px] text-slate-500">
                {language === 'bn' ? 'অ্যাডমিন ছাড়া সরাসরি ট্রাই করার জন্য' : 'Test various KYC outcomes'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSimulateApproval}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'অনুমোদন সিমুলেট করুন (Approve)' : 'Simulate Approval'}</span>
              </button>

              <button
                onClick={handleSimulateRevision}
                className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সংশোধন সিমুলেট করুন (Request Revision)' : 'Simulate Revision'}</span>
              </button>

              <button
                onClick={handleResetToPending}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'রিসেট পেন্ডিং (Reset)' : 'Reset to Pending'}</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-white font-bold text-sm">
            {language === 'bn' ? 'কোনো আবেদন পাওয়া যায়নি' : 'No Application Found'}
          </h4>
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? 'উপরে সার্চ বক্সে সঠিক ফোন নম্বর বা আবেদন রেফারেন্স আইডি দিন।'
              : 'Search by valid phone number or application reference ID.'}
          </p>
        </div>
      )}

      {/* 7. Fullscreen Image Inspection Modal */}
      {inspectImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <h4 className="text-sm font-black text-white">{inspectImage.title}</h4>
              </div>
              <button
                onClick={() => setInspectImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
              <img
                src={inspectImage.src}
                alt={inspectImage.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>{language === 'bn' ? 'রেজোলিউশন: হাই-রেজ অপটিক্যাল ভিউ' : 'Resolution: Optical Scan'}</span>
              <button
                onClick={() => setInspectImage(null)}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-colors"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
