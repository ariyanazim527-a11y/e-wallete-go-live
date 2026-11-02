import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  AlertCircle,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  Filter,
  MessageSquare,
  ShieldAlert,
  FileText,
  Send,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CreditCard,
  PhoneCall,
  ExternalLink,
  Paperclip,
  Check,
  Copy,
  Zap,
  Info,
  ShieldCheck,
  AlertTriangle,
  X,
  Upload,
} from 'lucide-react';
import {
  AgentDisputeTicket,
  DisputeCategory,
  DisputeStatus,
  DisputePriority,
  loadDisputeTickets,
  saveDisputeTickets,
} from '../../types/agentDispute.ts';
import { AgentProfile } from '../../types/agentMerchant.ts';

interface AgentDisputeSupportProps {
  language: 'bn' | 'en';
  agent: AgentProfile;
}

export const AgentDisputeSupport: React.FC<AgentDisputeSupportProps> = ({
  language,
  agent,
}) => {
  const [tickets, setTickets] = useState<AgentDisputeTicket[]>(() => loadDisputeTickets());
  const [statusFilter, setStatusFilter] = useState<'all' | DisputeStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | DisputeCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<AgentDisputeTicket | null>(null);

  // New Ticket Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<DisputeCategory>('failed_transaction');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newTrxId, setNewTrxId] = useState<string>('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newChannel, setNewChannel] = useState<'bkash' | 'nagad' | 'rocket' | 'bank' | 'system'>('bkash');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>('');
  const [newPriority, setNewPriority] = useState<DisputePriority>('high');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // New Note State inside Modal/Details
  const [agentReplyText, setAgentReplyText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync when storage updates
  useEffect(() => {
    const handleUpdate = () => {
      const updated = loadDisputeTickets();
      setTickets(updated);
      if (selectedTicket) {
        const found = updated.find((t) => t.id === selectedTicket.id);
        if (found) setSelectedTicket(found);
      }
    };
    window.addEventListener('uwallet_disputes_updated', handleUpdate);
    return () => window.removeEventListener('uwallet_disputes_updated', handleUpdate);
  }, [selectedTicket]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Mock Image Upload for Attachment
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Create New Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTitle.trim()) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে সমস্যার সংক্ষিপ্ত শিরোনাম দিন।' : 'Please enter a ticket title.');
      return;
    }
    if (!newDescription.trim() || newDescription.trim().length < 15) {
      setFormError(
        language === 'bn'
          ? 'অনুগ্রহ করে বিস্তারিত বিবরণ লিখুন (কমপক্ষে ১৫ অক্ষর)।'
          : 'Please provide detailed description (min 15 chars).'
      );
      return;
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newId = `dsp-${Date.now()}`;
    const ticketNo = `DSP-${randomNum}`;

    const now = new Date();
    const formattedDate = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newTicket: AgentDisputeTicket = {
      id: newId,
      ticketNumber: ticketNo,
      agentPhone: agent.agentPhone,
      outletName: agent.outletName,
      agentName: agent.agentName,
      category: newCategory,
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: 'pending',
      priority: newPriority,
      trxId: newTrxId.trim() || undefined,
      amount: newAmount ? parseFloat(newAmount) : undefined,
      channel: newChannel,
      customerPhone: newCustomerPhone.trim() || undefined,
      createdAt: formattedDate,
      updatedAt: formattedDate,
      notes: [
        {
          id: `note-${Date.now()}`,
          sender: 'system',
          senderName: 'সেন্ট্রাল টিকিট সিস্টেম',
          text: language === 'bn' 
            ? 'অভিযোগটি সফলভাবে নথিভুক্ত হয়েছে। অ্যাডমিন পর্যালোচনা কিউতে যুক্ত করা হয়েছে।'
            : 'Ticket registered successfully and queued for admin investigation.',
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    const updatedList = [newTicket, ...tickets];
    setTickets(updatedList);
    saveDisputeTickets(updatedList);

    setFormSuccess(
      language === 'bn'
        ? `অভিযোগটি সফলভাবে জমা হয়েছে! টিকিট নম্বর #${ticketNo}। অ্যাডমিন দ্রুত পর্যালোচনা করবেন।`
        : `Dispute filed! Ticket #${ticketNo} has been assigned to admin desk.`
    );

    setTimeout(() => {
      setIsCreateModalOpen(false);
      setFormSuccess(null);
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewTrxId('');
      setNewAmount('');
      setNewCustomerPhone('');
      setAttachedImage(null);
      setSelectedTicket(newTicket);
    }, 1800);
  };

  // Add agent comment / follow up to an open ticket
  const handleAddAgentNote = (ticketId: string) => {
    if (!agentReplyText.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedList = tickets.map((t) => {
      if (t.id === ticketId) {
        const newNotes = [
          ...t.notes,
          {
            id: `reply-${Date.now()}`,
            sender: 'agent' as const,
            senderName: agent.agentName || 'এজেন্ট',
            text: agentReplyText.trim(),
            timestamp: timeStr,
          },
        ];
        return {
          ...t,
          notes: newNotes,
          updatedAt: `${now.toISOString().slice(0, 10)} ${timeStr}`,
        };
      }
      return t;
    });

    setTickets(updatedList);
    saveDisputeTickets(updatedList);
    setAgentReplyText('');

    const current = updatedList.find((t) => t.id === ticketId);
    if (current) setSelectedTicket(current);
  };

  // Count summaries
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const investigatingCount = tickets.filter((t) => t.status === 'investigating').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  // Filtered tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchCat = categoryFilter === 'all' || ticket.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      ticket.ticketNumber.toLowerCase().includes(q) ||
      ticket.title.toLowerCase().includes(q) ||
      ticket.description.toLowerCase().includes(q) ||
      (ticket.trxId && ticket.trxId.toLowerCase().includes(q)) ||
      (ticket.customerPhone && ticket.customerPhone.includes(q));

    return matchStatus && matchCat && matchSearch;
  });

  const getStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {language === 'bn' ? 'অপেক্ষমাণ (Pending)' : 'Pending'}
          </span>
        );
      case 'investigating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <Search className="w-3.5 h-3.5 text-blue-400" />
            {language === 'bn' ? 'তদন্তাধীন (Investigating)' : 'Investigating'}
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {language === 'bn' ? 'সমাধানকৃত (Resolved)' : 'Resolved'}
          </span>
        );
    }
  };

  const getCategoryLabel = (category: DisputeCategory) => {
    switch (category) {
      case 'failed_transaction':
        return language === 'bn' ? 'লেনদেন ব্যর্থ / টাকা কাটা' : 'Transaction Failure';
      case 'payout_delay':
        return language === 'bn' ? 'কমিশন / পে-আউট বিলম্ব' : 'Payout Delay';
      case 'float_mismatch':
        return language === 'bn' ? 'ফ্লোট / জামানত গরমিল' : 'Float Mismatch';
      case 'customer_dispute':
        return language === 'bn' ? 'গ্রাহক বিরোধ / রিফান্ড' : 'Customer Dispute';
      case 'technical_issue':
        return language === 'bn' ? 'কারিগরি / সিম নেটওয়ার্ক' : 'Technical Issue';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* 1. Header Banner & Action Button */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-teal-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg ring-2 ring-amber-400/30 shrink-0">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {language === 'bn' ? 'এজেন্ট অভিযোগ ও সহায়তা ডেস্ক' : 'Agent Dispute & Support Desk'}
                </h2>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30 font-bold uppercase">
                  Direct Admin SLA
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                {language === 'bn'
                  ? 'লেনদেন ব্যর্থ হলে, গ্রাহকের টাকা কাটা গেলে বা কমিশন/ফ্লোট জমা না হলে সরাসরি সেন্ট্রাল অ্যাডমিন টিমের কাছে রিপোর্ট করুন। প্রতিটি অভিযোগ পেন্ডিং, তদন্তাধীন ও সমাধান ধাপে রিয়েল-টাইমে ট্র্যাক করুন।'
                  : 'Report failed transactions, float mismatches, or payout delays directly to the central admin. Track real-time status across Pending, Investigating, and Resolved.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন অভিযোগ দাখিল করুন' : 'Report Issue / File Dispute'}</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-5 border-t border-slate-700/60">
          <button
            onClick={() => setStatusFilter('all')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-800 border-teal-500 shadow-md'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <span className="text-[11px] text-slate-400 block font-medium">
              {language === 'bn' ? 'মোট টিকিট' : 'Total Tickets'}
            </span>
            <div className="text-xl font-black text-white font-mono mt-0.5">{tickets.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {language === 'bn' ? 'সকল অভিযোগ রেকর্ড' : 'All dispute records'}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-amber-300 block font-medium">
                {language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{pendingCount}</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">
              {language === 'bn' ? 'অ্যাডমিন রিভিউ কিউ' : 'Awaiting review'}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('investigating')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              statusFilter === 'investigating'
                ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-blue-300 block font-medium">
                {language === 'bn' ? 'তদন্তাধীন' : 'Investigating'}
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <div className="text-xl font-black text-blue-400 font-mono mt-0.5">{investigatingCount}</div>
            <div className="text-[10px] text-blue-300/80 mt-0.5">
              {language === 'bn' ? 'গেটওয়ে ও লগ যাচাই' : 'Gateway audit in progress'}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('resolved')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              statusFilter === 'resolved'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-300 block font-medium">
                {language === 'bn' ? 'সমাধানকৃত' : 'Resolved'}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{resolvedCount}</div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5">
              {language === 'bn' ? 'ফ্লোট বা পে-আউট সমন্বিত' : 'Settled & closed'}
            </div>
          </button>
        </div>
      </div>

      {/* 2. Direct Emergency Support Hotlines & SLA Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
            <PhoneCall className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h4 className="font-bold text-white">
              {language === 'bn' ? 'জরুরি ফ্লোট ও পেমেন্ট হেল্পলাইন (২৪/৭ সাপোর্ট)' : 'Emergency Float & Payment Hotline (24/7)'}
            </h4>
            <p className="text-slate-400 text-[11px]">
              {language === 'bn'
                ? 'বড় অঙ্কের লেনদেন আটকে গেলে সরাসরি কল বা হোয়াটসঅ্যাপ করুন: 01739-420736'
                : 'For high-priority locked float or critical MFS errors: call/WhatsApp 01739-420736'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:01739420736"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-bold flex items-center gap-1.5"
          >
            <PhoneCall className="w-3 h-3 text-teal-400" />
            <span>01739-420736</span>
          </a>
          <div className="px-2.5 py-1.5 bg-emerald-950/60 text-emerald-300 rounded-xl border border-emerald-500/30 text-[11px] font-semibold">
            {language === 'bn' ? 'গড় সমাধান সময়: ২০-৩০ মিনিট' : 'Avg. SLA: 20-30 mins'}
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'টিকিট নং, ট্রানজেকশন ID (TrxID) বা শিরোনাম দিয়ে খুঁজুন...'
                : 'Search by Ticket #, TrxID, or keywords...'
            }
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            {language === 'bn' ? 'বিভাগ:' : 'Category:'}
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">{language === 'bn' ? 'সকল বিভাগ' : 'All Categories'}</option>
            <option value="failed_transaction">{language === 'bn' ? 'লেনদেন ব্যর্থ' : 'Failed Transaction'}</option>
            <option value="payout_delay">{language === 'bn' ? 'পে-আউট বিলম্ব' : 'Payout Delay'}</option>
            <option value="float_mismatch">{language === 'bn' ? 'ফ্লোট / জামানত' : 'Float Mismatch'}</option>
            <option value="customer_dispute">{language === 'bn' ? 'গ্রাহক বিরোধ' : 'Customer Dispute'}</option>
            <option value="technical_issue">{language === 'bn' ? 'কারিগরি সমস্যা' : 'Technical'}</option>
          </select>
        </div>
      </div>

      {/* 4. Ticket Status Tracking List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>
              {language === 'bn' ? 'অভিযোগ ট্র্যাকিং তালিকা' : 'Dispute Status Tracking List'}
            </span>
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-mono">
              {filteredTickets.length}
            </span>
          </h3>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'বিস্তারিত দেখতে টিকিটে ক্লিক করুন' : 'Click any ticket for timeline & audit'}
          </span>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="font-bold text-white text-sm">
              {language === 'bn' ? 'কোনো অভিযোগ বা বিরোধ পাওয়া যায়নি' : 'No disputes matching criteria'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {language === 'bn'
                ? 'আপনার সকল ট্রানজেকশন ও ফ্লোট সঠিক আছে। নতুন কোনো সমস্যা হলে উপরের বাটনে ক্লিক করে রিপোর্ট করুন।'
                : 'No open issues found. If you encounter any payout or transaction error, file a new dispute.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredTickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(isSelected ? null : ticket)}
                  className={`bg-slate-900/90 border rounded-2xl p-4 transition-all cursor-pointer hover:border-teal-500/60 shadow-md ${
                    isSelected
                      ? 'border-teal-500 ring-2 ring-teal-500/20 bg-slate-900'
                      : ticket.status === 'pending'
                      ? 'border-amber-500/30'
                      : ticket.status === 'investigating'
                      ? 'border-blue-500/30'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-black text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-lg border border-teal-500/30">
                        #{ticket.ticketNumber}
                      </span>
                      {getStatusBadge(ticket.status)}
                      <span className="text-[11px] text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded-lg border border-slate-700/60">
                        {getCategoryLabel(ticket.category)}
                      </span>
                      {ticket.priority === 'urgent' && (
                        <span className="text-[10px] font-black uppercase text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-500/40">
                          {language === 'bn' ? 'জরুরি (Urgent)' : 'Urgent'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{ticket.createdAt}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-teal-400 font-medium">
                        {ticket.notes.length} {language === 'bn' ? 'আপডেট' : 'updates'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <h4 className="font-extrabold text-white text-sm tracking-tight leading-snug">
                      {ticket.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Summary row with TrxID & Amount */}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center gap-4 flex-wrap">
                      {ticket.amount && (
                        <div className="text-slate-300">
                          <span className="text-slate-500 text-[11px]">{language === 'bn' ? 'পরিমাণ:' : 'Amount:'}</span>{' '}
                          <span className="font-bold text-amber-400 font-mono">৳{ticket.amount.toLocaleString()}</span>
                        </div>
                      )}
                      {ticket.channel && (
                        <div className="text-slate-300">
                          <span className="text-slate-500 text-[11px]">{language === 'bn' ? 'মাধ্যম:' : 'Channel:'}</span>{' '}
                          <span className="font-semibold text-slate-200 capitalize">{ticket.channel}</span>
                        </div>
                      )}
                      {ticket.trxId && (
                        <div className="text-slate-300 flex items-center gap-1 font-mono">
                          <span className="text-slate-500 text-[11px]">TrxID:</span>
                          <span className="font-bold text-teal-300">{ticket.trxId}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-teal-400 font-bold text-xs shrink-0">
                      <span>{isSelected ? (language === 'bn' ? 'সংক্ষিপ্ত করুন' : 'Collapse') : (language === 'bn' ? 'বিস্তারিত ও আপডেট' : 'View Details')}</span>
                      {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Audit Timeline & Admin Notes View */}
                  {isSelected && (
                    <div
                      className="mt-4 pt-4 border-t border-slate-700/80 space-y-4 animate-in fade-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Step Progress Tracker */}
                      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="text-xs font-black text-slate-300 mb-2">
                          {language === 'bn' ? 'সমাধান অগ্রগতি টাইমলাইন' : 'Resolution Progress Timeline'}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {/* Step 1: Pending */}
                          <div
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              ticket.status === 'pending'
                                ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="text-[10px] font-bold uppercase tracking-wider">
                              ১. {language === 'bn' ? 'দাখিলকৃত' : 'Submitted'}
                            </div>
                            <div className="text-xs font-black mt-0.5">
                              {language === 'bn' ? 'অ্যাডমিন কিউ' : 'Queued'}
                            </div>
                            {ticket.status === 'pending' && (
                              <div className="text-[10px] text-amber-400 font-medium mt-1">
                                ● {language === 'bn' ? 'পর্যালোচনার অপেক্ষায়' : 'Pending review'}
                              </div>
                            )}
                          </div>

                          {/* Step 2: Investigating */}
                          <div
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              ticket.status === 'investigating'
                                ? 'bg-blue-950/40 border-blue-500 text-blue-300 ring-1 ring-blue-500/30'
                                : ticket.status === 'resolved'
                                ? 'bg-slate-900 border-slate-800 text-slate-400'
                                : 'bg-slate-900/40 border-slate-800/60 text-slate-600'
                            }`}
                          >
                            <div className="text-[10px] font-bold uppercase tracking-wider">
                              ২. {language === 'bn' ? 'তদন্তাধীন' : 'Investigating'}
                            </div>
                            <div className="text-xs font-black mt-0.5">
                              {language === 'bn' ? 'গেটওয়ে নিরীক্ষা' : 'Gateway Audit'}
                            </div>
                            {ticket.status === 'investigating' && (
                              <div className="text-[10px] text-blue-400 font-medium mt-1">
                                ● {language === 'bn' ? 'যাচাই চলছে' : 'In active check'}
                              </div>
                            )}
                          </div>

                          {/* Step 3: Resolved */}
                          <div
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              ticket.status === 'resolved'
                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                                : 'bg-slate-900/40 border-slate-800/60 text-slate-600'
                            }`}
                          >
                            <div className="text-[10px] font-bold uppercase tracking-wider">
                              ৩. {language === 'bn' ? 'নিষ্পত্তি' : 'Settled'}
                            </div>
                            <div className="text-xs font-black mt-0.5">
                              {language === 'bn' ? 'সমাধান সম্পন্ন' : 'Resolved'}
                            </div>
                            {ticket.status === 'resolved' && (
                              <div className="text-[10px] text-emerald-400 font-medium mt-1">
                                ✓ {language === 'bn' ? 'সমন্বয় সম্পন্ন' : 'Credited / Closed'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Resolution Summary Banner if Resolved */}
                      {ticket.status === 'resolved' && ticket.resolutionSummary && (
                        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h5 className="font-bold text-emerald-300 text-xs">
                              {language === 'bn' ? 'অ্যাডমিন চূড়ান্ত নিষ্পত্তির বিবরণ:' : 'Final Resolution Summary:'}
                            </h5>
                            <p className="text-xs text-emerald-100/90 leading-relaxed">
                              {ticket.resolutionSummary}
                            </p>
                            {ticket.creditedFloatAmount && (
                              <div className="pt-1 text-xs text-white font-mono font-bold">
                                {language === 'bn' ? 'ফ্লোটে যোগ করা হয়েছে:' : 'Credited to Float:'}{' '}
                                <span className="text-emerald-400">৳{ticket.creditedFloatAmount.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Updates & Notes Thread */}
                      <div className="space-y-2.5">
                        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                            {language === 'bn' ? 'সাপোর্ট যোগাযোগ ও অ্যাডমিন নোটস' : 'Admin & Support Remarks'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {ticket.notes.length} {language === 'bn' ? 'টি বার্তা' : 'messages'}
                          </span>
                        </div>

                        <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-60 overflow-y-auto">
                          {ticket.notes.map((note) => (
                            <div
                              key={note.id}
                              className={`p-3 rounded-xl text-xs space-y-1 ${
                                note.sender === 'admin'
                                  ? 'bg-blue-950/40 border border-blue-500/40 text-blue-100 ml-3'
                                  : note.sender === 'agent'
                                  ? 'bg-teal-950/40 border border-teal-500/40 text-teal-100 mr-3'
                                  : 'bg-slate-900 border border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className={
                                  note.sender === 'admin'
                                    ? 'text-blue-300'
                                    : note.sender === 'agent'
                                    ? 'text-teal-300'
                                    : 'text-slate-400'
                                }>
                                  {note.senderName}
                                </span>
                                <span className="text-slate-500 text-[10px] font-normal">{note.timestamp}</span>
                              </div>
                              <p className="leading-relaxed">{note.text}</p>
                            </div>
                          ))}
                        </div>

                        {/* Reply / Add Note Input for Agent */}
                        {ticket.status !== 'resolved' && (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={agentReplyText}
                              onChange={(e) => setAgentReplyText(e.target.value)}
                              placeholder={
                                language === 'bn'
                                  ? 'অ্যাডমিনকে আরও তথ্য বা আপডেট জানাতে লিখুন...'
                                  : 'Send follow-up note to admin...'
                              }
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddAgentNote(ticket.id);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddAgentNote(ticket.id)}
                              disabled={!agentReplyText.trim()}
                              className="px-3 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'পাঠান' : 'Reply'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Frequently Asked Questions / Common Failure Troubleshooting */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-3">
        <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <span>{language === 'bn' ? 'লেনদেন ব্যর্থতা সংক্রান্ত জরুরি নির্দেশিকা' : 'Quick Troubleshooting Rules'}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'bn' ? 'টাকা কেটে গেছে কিন্তু কনফার্মেশন আসেনি?' : 'Debited but no SMS?'}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'বিকাশ বা নগদ সার্ভারে সাময়িক ধীরগতির কারণে এসএমএস আসতে ২-১০ মিনিট লাগতে পারে। গ্রাহকের স্টেটমেন্ট থেকে TrxID নিয়ে সরাসরি টিকিট ওপেন করুন।'
                : 'MFS SMS gateways may suffer 2-10 mins lag during peak hours. Collect TrxID from statement and file a ticket.'}
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
            <div className="font-bold text-teal-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>{language === 'bn' ? 'ফ্লোট রিচার্জ তাৎক্ষণিক ক্রেডিট না হলে?' : 'Float recharge delay?'}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'অফিসিয়াল 01739-420736 নম্বরে পাঠানো সেন্ড মানি TrxID দিয়ে রিপোর্ট করলে কেন্দ্রীয় হিসাব শাখা ৫ মিনিটের মধ্যে ম্যানুয়াল ক্রেডিট কার্যকর করবে।'
                : 'Send Money to 01739-420736 gets automatically credited within 5 minutes once TrxID is matched.'}
            </p>
          </div>
        </div>
      </div>

      {/* ================= MODAL: REPORT NEW ISSUE / DISPUTE ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-teal-500/40 relative my-6">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormError(null);
                setFormSuccess(null);
              }}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">
                  {language === 'bn' ? 'নতুন অভিযোগ বা লেনদেন বিরোধ দাখিল' : 'Report Transaction / Payout Issue'}
                </h3>
                <p className="text-[11px] text-teal-400">
                  {language === 'bn' ? 'সেন্ট্রাল অ্যাডমিনকে সরাসরি জানান' : 'Direct ticket submission to Admin Desk'}
                </p>
              </div>
            </div>

            {formSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-rose-950/80 border border-rose-500 text-rose-200 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              {/* Category Picker */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">
                  {language === 'bn' ? 'অভিযোগের ধরণ নির্বাচন করুন *' : 'Select Issue Category *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'failed_transaction', labelBn: 'লেনদেন ব্যর্থ / টাকা কাটা', labelEn: 'Failed Transaction' },
                    { id: 'payout_delay', labelBn: 'কমিশন / পে-আউট বিলম্ব', labelEn: 'Payout Delay' },
                    { id: 'float_mismatch', labelBn: 'ফ্লোট / জামানত গরমিল', labelEn: 'Float Mismatch' },
                    { id: 'customer_dispute', labelBn: 'গ্রাহক বিরোধ / রিফান্ড', labelEn: 'Customer Dispute' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewCategory(cat.id as DisputeCategory)}
                      className={`p-2 rounded-xl text-left font-bold transition-all border ${
                        newCategory === cat.id
                          ? 'bg-teal-600/30 text-teal-300 border-teal-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {language === 'bn' ? cat.labelBn : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">
                  {language === 'bn' ? 'অভিযোগের শিরোনাম *' : 'Ticket Subject / Title *'}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'উদা: বিকাশ ক্যাশ-আউটে টাকা কেটেছে কিন্তু ব্যালেন্স আসেনি'
                      : 'e.g. Debited from customer bKash but not credited to float'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              {/* Grid: Amount & Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">
                    {language === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (BDT)'}
                  </label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">
                    {language === 'bn' ? 'পেমেন্ট চ্যানেল / মাধ্যম' : 'Channel'}
                  </label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="rocket">রকেট (Rocket)</option>
                    <option value="bank">ব্যাংক ট্রান্সফার (Bank)</option>
                    <option value="system">সেন্ট্রাল ওয়ালেট (System)</option>
                  </select>
                </div>
              </div>

              {/* Grid: TrxID & Customer Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">
                    {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID (TrxID)'}
                  </label>
                  <input
                    type="text"
                    value={newTrxId}
                    onChange={(e) => setNewTrxId(e.target.value)}
                    placeholder="e.g. 9M882109"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">
                    {language === 'bn' ? 'কাস্টমার / কাউন্টারপার্টি ফোন' : 'Customer Phone'}
                  </label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="e.g. 01800-000000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">
                  {language === 'bn' ? 'সমস্যার বিস্তারিত বিবরণ *' : 'Detailed Description *'}
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder={
                    language === 'bn'
                      ? 'কখন সমস্যা হয়েছে, কাস্টমার কী বললেন এবং অ্যাডমিন থেকে কী সহায়তা চান তা স্পষ্টভাবে লিখুন...'
                      : 'Describe the issue clearly, time of occurrence, and expected settlement...'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed"
                  required
                />
              </div>

              {/* Urgency Level */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">
                  {language === 'bn' ? 'জরুরিতা নির্ধারণ করুন' : 'Priority Level'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPriority('normal')}
                    className={`py-1.5 px-2 rounded-xl text-center font-bold border transition-all ${
                      newPriority === 'normal'
                        ? 'bg-slate-800 text-white border-slate-600'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {language === 'bn' ? 'সাধারণ (Normal)' : 'Normal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPriority('high')}
                    className={`py-1.5 px-2 rounded-xl text-center font-bold border transition-all ${
                      newPriority === 'high'
                        ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {language === 'bn' ? 'জরুরি (High)' : 'High'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPriority('urgent')}
                    className={`py-1.5 px-2 rounded-xl text-center font-bold border transition-all ${
                      newPriority === 'urgent'
                        ? 'bg-rose-600/30 text-rose-300 border-rose-500'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {language === 'bn' ? 'খুব জরুরি (Urgent)' : 'Urgent'}
                  </button>
                </div>
              </div>

              {/* Optional Attachment Simulation */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">
                  {language === 'bn' ? 'স্ক্রিনশট / প্রমাণপত্র সংযুক্ত (ঐচ্ছিক)' : 'Screenshot / Proof (Optional)'}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl cursor-pointer border border-slate-700 font-medium">
                    <Upload className="w-3.5 h-3.5 text-teal-400" />
                    <span>{language === 'bn' ? 'ছবি আপলোড করুন' : 'Attach Receipt / Proof'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {attachedImage && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'bn' ? 'ছবি সংযুক্ত হয়েছে' : 'Image attached'}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedImage(null)}
                        className="text-slate-400 hover:text-white ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black rounded-xl shadow-lg transition-all"
                >
                  {language === 'bn' ? 'অভিযোগ জমা দিন' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
