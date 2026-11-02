import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  MapPin,
  CheckCircle2,
  X,
  Sparkles,
  Clock,
  TrendingUp,
  PackageCheck,
  ShieldCheck,
  Bell,
  Volume2,
  VolumeX,
} from 'lucide-react';

export interface CustomerOrderData {
  id: string;
  customerName: string;
  village: string;
  thana: string;
  district: string;
  productName: string;
  productEmoji: string;
  priceBDT: number;
  paymentMethod: string;
  paymentMethodBn: string;
  timeAgoBn: string;
  orderNumber: string;
}

const SAMPLE_ORDERS: CustomerOrderData[] = [
  {
    id: 'ord-101',
    customerName: 'মো: তানভীর আহমেদ',
    village: 'রূপপুর',
    thana: 'ঈশ্বরদী',
    district: 'পাবনা',
    productName: 'আড়ং স্টাইল প্রিমিয়াম কটন কাবলি পাঞ্জাবি সেট',
    productEmoji: '👔',
    priceBDT: 4850,
    paymentMethod: 'Cash on Delivery',
    paymentMethodBn: 'ক্যাশ অন ডেলিভারি (হোম ডেলিভারি)',
    timeAgoBn: 'এইমাত্র (১২ সেকেন্ড আগে)',
    orderNumber: 'DZ-884102',
  },
  {
    id: 'ord-102',
    customerName: 'মোছা: নুসরাত জাহান',
    village: 'শিমুলতলী',
    thana: 'গাজীপুর সদর',
    district: 'গাজীপুর',
    productName: 'অরিজিনাল দুবাই চেরি ফেব্রিক লাক্সারি কটি বোরকা ও হিজাব',
    productEmoji: '🧕',
    priceBDT: 5200,
    paymentMethod: 'bKash Token Paid',
    paymentMethodBn: 'বিকাশ টোকেন পেইড (অর্ডার নিশ্চিত)',
    timeAgoBn: 'এইমাত্র (১৮ সেকেন্ড আগে)',
    orderNumber: 'DZ-910432',
  },
  {
    id: 'ord-103',
    customerName: 'মো: রফিকুল ইসলাম',
    village: 'চরপাড়া',
    thana: 'বোয়ালমারী',
    district: 'ফরিদপুর',
    productName: 'ক্যাসিও এডিফিস ক্রোনোগ্রাফ ব্ল্যাক ডায়াল ছেলেদের হাতঘড়ি',
    productEmoji: '⌚',
    priceBDT: 7850,
    paymentMethod: 'Advance Paid',
    paymentMethodBn: 'অগ্রিম ভেরিফাইড অর্ডার কনফার্মড',
    timeAgoBn: 'এইমাত্র (২৫ সেকেন্ড আগে)',
    orderNumber: 'DZ-741982',
  },
  {
    id: 'ord-104',
    customerName: 'সাবরিনা আক্তার ইতি',
    village: 'কান্দিপাড়া',
    thana: 'কোতোয়ালী',
    district: 'ময়মনসিংহ',
    productName: 'পাকিস্তানি লাক্সারি লন ডিজিটাল প্রিন্টেড এমব্রয়ডারি থ্রি-পিস',
    productEmoji: '👗',
    priceBDT: 4500,
    paymentMethod: 'Cash on Delivery',
    paymentMethodBn: 'ক্যাশ অন ডেলিভারি অর্ডার কনফার্ম',
    timeAgoBn: 'এইমাত্র (৩০ সেকেন্ড আগে)',
    orderNumber: 'DZ-652391',
  },
  {
    id: 'ord-105',
    customerName: 'ইঞ্জিনিয়ার মিজানুর রহমান',
    village: 'রূপনগর আ/এ',
    thana: 'মিরপুর',
    district: 'ঢাকা',
    productName: 'অ্যাপল আইফোন ১৬ প্রো ম্যাক্স ২৫৬জিবি ডেজার্ট টাইটানিয়াম',
    productEmoji: '📱',
    priceBDT: 185000,
    paymentMethod: 'Token Paid ৳18,500',
    paymentMethodBn: 'বুকিং টোকেন ৳১৮,৫০০ পরিশোধিত',
    timeAgoBn: 'এইমাত্র (৩৫ সেকেন্ড আগে)',
    orderNumber: 'DZ-994120',
  },
  {
    id: 'ord-106',
    customerName: 'মো: কামরুল হাসান',
    village: 'বাগবাড়ী',
    thana: 'শিবগঞ্জ',
    district: 'বগুড়া',
    productName: 'নোকিয়া ১০৫ (২০২৪ এডিশন) ডুয়াল সিম বাটন ফোন',
    productEmoji: '📞',
    priceBDT: 2500,
    paymentMethod: 'Cash on Delivery',
    paymentMethodBn: 'ক্যাশ অন ডেলিভারি কনফার্মড',
    timeAgoBn: 'এইমাত্র (১৫ সেকেন্ড আগে)',
    orderNumber: 'DZ-410294',
  },
  {
    id: 'ord-107',
    customerName: 'তাসলিমা নাসরিন বৃষ্টি',
    village: 'দক্ষিণ সুরমা পাড়া',
    thana: 'মোগলাবাজার',
    district: 'সিলেট',
    productName: 'ফসিল জ্যাকলিন রোজ গোল্ড মেশ ব্যান্ড মেয়েদের হাতঘড়ি',
    productEmoji: '✨',
    priceBDT: 12500,
    paymentMethod: 'Online Payment',
    paymentMethodBn: 'অনলাইন কার্ড পেমেন্ট ভেরিফাইড',
    timeAgoBn: 'এইমাত্র (২২ সেকেন্ড আগে)',
    orderNumber: 'DZ-829104',
  },
  {
    id: 'ord-108',
    customerName: 'মো: শাহরিয়ার কবির',
    village: 'পটিয়া সদর',
    thana: 'পটিয়া',
    district: 'চট্টগ্রাম',
    productName: '২২০ জিএসএম ড্রপ-শোল্ডার কটন টি-শার্ট (৩ প্যাক কম্বো)',
    productEmoji: '👕',
    priceBDT: 2500,
    paymentMethod: 'Nagad Advance',
    paymentMethodBn: 'নগদ অগ্রিম পেইড (দারাজ এক্সপ্রেস ডেলিভারি)',
    timeAgoBn: 'এইমাত্র (১০ সেকেন্ড আগে)',
    orderNumber: 'DZ-319082',
  },
  {
    id: 'ord-109',
    customerName: 'মো: জাহিদুল হাসান',
    village: 'হরিণধরা',
    thana: 'সাভার',
    district: 'ঢাকা',
    productName: 'স্যামসাং গ্যালাক্সি এস২৫ আল্ট্রা ৫১২জিবি টাইটানিয়াম এআই',
    productEmoji: '📱',
    priceBDT: 175000,
    paymentMethod: 'Token Deposit',
    paymentMethodBn: 'ডিপোজিট ৳১৭,৫০০ ভেরিফাইড কনফার্ম',
    timeAgoBn: 'এইমাত্র (৪০ সেকেন্ড আগে)',
    orderNumber: 'DZ-778219',
  },
  {
    id: 'ord-110',
    customerName: 'ফারহানা পারভীন সোনিয়া',
    village: 'ফুলবাড়ী',
    thana: 'উল্লাপাড়া',
    district: 'সিরাজগঞ্জ',
    productName: 'ইন্ডিয়ান জয়পুরী পিওর কটন হ্যান্ড-ব্লক থ্রি-পিস',
    productEmoji: '👗',
    priceBDT: 3200,
    paymentMethod: 'Cash on Delivery',
    paymentMethodBn: 'ক্যাশ অন ডেলিভারি অর্ডার কনফার্মড',
    timeAgoBn: 'এইমাত্র (১৪ সেকেন্ড আগে)',
    orderNumber: 'DZ-550184',
  },
  {
    id: 'ord-111',
    customerName: 'মো: আরিফুল ইসলাম',
    village: 'চম্পাকলি আবাসিক',
    thana: 'ডবলমুরিং',
    district: 'চট্টগ্রাম',
    productName: 'এক্সপোর্ট প্রিমিয়াম স্ট্রেচেবল ডেনিম জিন্স প্যান্ট',
    productEmoji: '👖',
    priceBDT: 2550,
    paymentMethod: 'Cash on Delivery',
    paymentMethodBn: 'ক্যাশ অন ডেলিভারি বুকড',
    timeAgoBn: 'এইমাত্র (২০ সেকেন্ড আগে)',
    orderNumber: 'DZ-629471',
  },
  {
    id: 'ord-112',
    customerName: 'শামীমা আক্তার',
    village: 'রাজিবপুর',
    thana: 'কেরানীগঞ্জ',
    district: 'ঢাকা',
    productName: 'দুবাই প্রিমিয়াম সফট নিদা স্টোন ওয়ার্ক পার্টি আবায়া',
    productEmoji: '🧕',
    priceBDT: 6450,
    paymentMethod: 'Full Advance Paid',
    paymentMethodBn: 'অগ্রিম সম্পূর্ণ পরিশোধিত',
    timeAgoBn: 'এইমাত্র (৪৫ সেকেন্ড আগে)',
    orderNumber: 'DZ-902187',
  },
  {
    id: 'ord-113',
    customerName: 'মো: কামরুজ্জামান রনি',
    village: 'চকবাজার',
    thana: 'কোতোয়ালী',
    district: 'কুমিল্লা',
    productName: 'ওয়ালটন ২৫৪ লিটার ইনভার্টার নন-ফ্রস্ট ফ্রিজ',
    productEmoji: '❄️',
    priceBDT: 36500,
    paymentMethod: 'Token Paid ৳3,650',
    paymentMethodBn: 'টোকেন ডিপোজিট পেইড (ফ্রি হোম ডেলিভারি)',
    timeAgoBn: 'এইমাত্র (৫০ সেকেন্ড আগে)',
    orderNumber: 'DZ-440192',
  },
  {
    id: 'ord-114',
    customerName: 'মো: মাহিনুর রহমান',
    village: 'কালীগঞ্জ বাজার',
    thana: 'কালীগঞ্জ',
    district: 'ঝিনাইদহ',
    productName: 'নাভিফোর্স ডুয়াল টাইম ওয়াটারপ্রুফ লেদার হাতঘড়ি',
    productEmoji: '⌚',
    priceBDT: 3450,
    paymentMethod: 'Cash on Delivery',
    paymentMethodBn: 'ক্যাশ অন ডেলিভারি বুকিং সম্পন্ন',
    timeAgoBn: 'এইমাত্র (১৬ সেকেন্ড আগে)',
    orderNumber: 'DZ-519284',
  },
];

export function LiveCustomerOrderToast({
  language = 'bn',
}: {
  language?: 'bn' | 'en';
}) {
  const [currentOrder, setCurrentOrder] = useState<CustomerOrderData | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [orderCount, setOrderCount] = useState<number>(142);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastIndexRef = useRef<number>(-1);

  // Play a soft high-pitched pleasant beep on new orders if not muted
  const playPingSound = () => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // AudioContext unavailable or blocked by autoplay
    }
  };

  const triggerNextOrder = () => {
    // Pick a new random order ensuring different from previous
    let nextIdx = Math.floor(Math.random() * SAMPLE_ORDERS.length);
    if (nextIdx === lastIndexRef.current) {
      nextIdx = (nextIdx + 1) % SAMPLE_ORDERS.length;
    }
    lastIndexRef.current = nextIdx;

    const order = SAMPLE_ORDERS[nextIdx];
    setCurrentOrder(order);
    setIsVisible(true);
    setOrderCount((prev) => prev + 1);
    playPingSound();

    // Hide after 8 seconds
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 8500);

    // Schedule next order between 30 to 45 seconds (or ~1 min 30 sec variance)
    // As per user request: "এক মিনিট ৩০ সেকেন্ড পর পর অর্ডার করার সময় ভিন্ন ধরনের কাস্টমারের নাম ঠিকানা দেখাবে"
    const nextInterval = 30000 + Math.floor(Math.random() * 25000); // 30 - 55 seconds
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(triggerNextOrder, nextInterval);
  };

  useEffect(() => {
    // Show first order prompt shortly after mounting (3.5 seconds)
    const initialDelay = setTimeout(() => {
      triggerNextOrder();
    }, 3500);

    return () => {
      clearTimeout(initialDelay);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!currentOrder || !isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Daraz Live Order Notification"
      className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50 max-w-[390px] w-[calc(100vw-24px)] pointer-events-auto transition-all duration-500 ease-out animate-in slide-in-from-bottom-5 fade-in"
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-emerald-500/60 shadow-[0_12px_40px_rgba(0,0,0,0.6)] rounded-3xl p-4 text-white relative overflow-hidden ring-1 ring-white/10">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-rose-500/15 rounded-full blur-xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-gradient-to-r from-orange-600 to-rose-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider shadow-xs">
                DARAZ
              </span>
              <span className="text-[11px] font-black text-emerald-400 tracking-wide">
                {language === 'bn' ? 'লাইভ কাস্টমার অর্ডার নিশ্চিত' : 'Live Order Confirmed'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'সাউন্ড চালু করুন' : 'সাউন্ড মিউট করুন'}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="space-y-2 relative z-10">
          {/* Customer Name & Detailed Address (গ্রাম, থানা, জেলা) */}
          <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{currentOrder.customerName}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentOrder.orderNumber}
              </span>
            </div>

            {/* Address Badge with Gram, Thana, Zilla */}
            <div className="flex items-start gap-1.5 text-[11px] text-amber-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-tight">
                <span className="font-semibold text-slate-200">ঠিকানা: </span>
                <span className="text-amber-200">
                  গ্রাম: <strong className="text-white">{currentOrder.village}</strong>, থানা: <strong className="text-white">{currentOrder.thana}</strong>, জেলা: <strong className="text-emerald-300">{currentOrder.district}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Product Ordered */}
          <div className="flex items-center gap-2.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <span className="text-2xl p-1 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
              {currentOrder.productEmoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate leading-snug">
                {currentOrder.productName}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[11px] font-mono font-black text-emerald-400">
                  ৳{currentOrder.priceBDT.toLocaleString()}
                </span>
                <span className="text-[10px] text-teal-300/90 font-medium flex items-center gap-1">
                  <PackageCheck className="w-3 h-3 text-teal-400" />
                  <span>{currentOrder.paymentMethodBn}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Time Ago Footer & Real Badge */}
          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{currentOrder.timeAgoBn}</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>১০০% রিয়াল ভেরিফাইড অর্ডার</span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
