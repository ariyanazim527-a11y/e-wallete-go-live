import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Star,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Sparkles,
  Info,
  Car,
  Smartphone,
  Ship,
  Building2,
  HardHat,
  ChevronDown,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  Clock,
  Percent,
  Laptop,
  Tv,
  Watch,
  Shirt,
} from 'lucide-react';
import { loadCatalog, HighValueProduct } from '../../data/highValueProducts.ts';
import { CustomerDepositPolicyModal } from './CustomerDepositPolicyModal.tsx';

interface StoreViewProps {
  language: 'bn' | 'en';
  userBalance: number;
  onBuyProduct: (product: HighValueProduct) => void;
  onOpenBookingModal?: (product: HighValueProduct) => void;
}

export const StoreView: React.FC<StoreViewProps> = ({
  language,
  userBalance,
  onBuyProduct,
  onOpenBookingModal,
}) => {
  const [catalogItems, setCatalogItems] = useState<HighValueProduct[]>(() => loadCatalog());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'commission'>('featured');
  const [selectedProductDetails, setSelectedProductDetails] = useState<HighValueProduct | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleCatalogUpdate = () => {
      setCatalogItems(loadCatalog());
    };
    window.addEventListener('uwallet_catalog_updated', handleCatalogUpdate);
    return () => window.removeEventListener('uwallet_catalog_updated', handleCatalogUpdate);
  }, []);

  const categories = [
    { id: 'all', labelBn: 'সকল প্রোডাক্ট', labelEn: 'All Products', icon: Layers, count: catalogItems.length },
    { id: 'smartphones', labelBn: 'স্মার্টফোন (iPhone, Samsung...)', labelEn: 'Smartphones', icon: Smartphone, count: catalogItems.filter(p => p.category === 'smartphones').length },
    { id: 'button_phones', labelBn: 'বাটন ফোন (৳২৫০০ থেকে শুরু)', labelEn: 'Button Phones (From ৳2500)', icon: Smartphone, count: catalogItems.filter(p => p.category === 'button_phones').length },
    { id: 'used_phones', labelBn: 'পুরাতন ফোন ক্রয়-বিক্রয়', labelEn: 'Certified Pre-Owned', icon: Sparkles, count: catalogItems.filter(p => p.category === 'used_phones').length },
    { id: 'laptops_computers', labelBn: 'ল্যাপটপ ও কম্পিউটার', labelEn: 'Laptops & Computers', icon: Laptop, count: catalogItems.filter(p => p.category === 'laptops_computers').length },
    { id: 'tvs_monitors', labelBn: 'টিভি ও মনিটর', labelEn: 'TVs & Monitors', icon: Tv, count: catalogItems.filter(p => p.category === 'tvs_monitors').length },
    { id: 'projectors', labelBn: 'প্রজেক্টর', labelEn: 'Projectors', icon: Sparkles, count: catalogItems.filter(p => p.category === 'projectors').length },
    { id: 'refrigerators_appliances', labelBn: 'ফ্রিজ ও হোম অ্যাপ্লায়েন্স', labelEn: 'Refrigerators & Appliances', icon: ShoppingBag, count: catalogItems.filter(p => p.category === 'refrigerators_appliances').length },
    { id: 'daraz_grooming_electronics', labelBn: 'হেয়ার ট্রিমার ও গ্রুমিং (দারাজ ফ্ল্যাশ সেল)', labelEn: 'Trimmers & Grooming (Flash Sale)', icon: Sparkles, count: catalogItems.filter(p => p.category === 'daraz_grooming_electronics').length },
    { id: 'daraz_watches', labelBn: 'হাতঘড়ি (ছেলে ও মেয়ে)', labelEn: "Watches (Men & Women)", icon: Watch, count: catalogItems.filter(p => p.category === 'daraz_watches').length },
    { id: 'daraz_mens_fashion', labelBn: 'পাঞ্জাবি, প্যান্ট ও টি-শার্ট', labelEn: "Men's Fashion (Panjabi, Pants, Tees)", icon: Shirt, count: catalogItems.filter(p => p.category === 'daraz_mens_fashion').length },
    { id: 'daraz_womens_fashion', labelBn: 'বোরকা ও থ্রি-পিস', labelEn: "Women's Fashion (Borka, 3-Piece)", icon: Sparkles, count: catalogItems.filter(p => p.category === 'daraz_womens_fashion').length },
    { id: 'luxury_vehicles', labelBn: 'লাক্সারি গাড়ি ও ডিলারশিপ', labelEn: 'Luxury Cars & Dealership', icon: Car, count: catalogItems.filter(p => p.category === 'luxury_vehicles' || p.category === 'ocean_cargo' || p.category === 'heavy_machinery').length },
  ];

  const filteredProducts = useMemo(() => {
    return catalogItems.filter((p) => {
      const matchCat =
        selectedCategory === 'all' ||
        p.category === selectedCategory ||
        (selectedCategory === 'luxury_vehicles' && (p.category === 'luxury_vehicles' || p.category === 'ocean_cargo' || p.category === 'heavy_machinery'));
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.nameBn.includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.categoryLabelBn.includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.shortDescriptionBn.includes(q);
      return matchCat && matchQuery;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceBDT - b.priceBDT;
      if (sortBy === 'price_desc') return b.priceBDT - a.priceBDT;
      if (sortBy === 'commission') return b.agentCommissionBDT - a.agentCommissionBDT;
      return 0; // default featured
    });
  }, [selectedCategory, searchQuery, sortBy]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 1. High-Trust Dealership Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 md:p-6 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500/25 to-rose-500/25 text-orange-300 border border-orange-500/40 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="px-1.5 py-0.2 bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded text-[10px] font-black tracking-wider">DARAZ</span>
              <span>{language === 'bn' ? 'দারাজ বাংলাদেশ অফিশিয়াল অনলাইন শপ' : 'Daraz Bangladesh Official Store'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
              {language === 'bn'
                ? 'দারাজ অনলাইন শপ — ফ্যাশন, হাতঘড়ি, মোবাইল ও গ্যাজেট'
                : 'Daraz Online Shop — Fashion, Watches, Tech & Gadgets'}
            </h2>
            <p className="text-xs md:text-sm text-slate-300">
              {language === 'bn'
                ? 'ছেলেদের পাঞ্জাবি, প্যান্ট, টি-শার্ট, মেয়েদের বোরকা ও থ্রি-পিস, ছেলে ও মেয়েদের হাতঘড়ি, আইফোন (১৬ প্রো ম্যাক্স থেকে ১১ সিরিয়াল), স্যামসাং আল্ট্রা, নোকিয়া বাটন ফোন (৳২৫০০ থেকে শুরু), ল্যাপটপ ও ফ্রিজ।'
                : 'Men & Women Watches, Panjabi, Jeans, T-Shirts, Dubai Borka, 3-Piece, Serial iPhones, Samsung Ultra, Nokia keypad phones from ৳2,500, Laptops & Refrigerators.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center shrink-0 min-w-[200px]">
            <span className="text-[11px] text-slate-300 font-medium">
              {language === 'bn' ? 'দারাজ ভেরিফাইড আইটেম' : 'Daraz Verified Items'}
            </span>
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              {catalogItems.length} টি
            </span>
            <span className="text-[10px] text-emerald-300 flex items-center gap-1 mt-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              {language === 'bn' ? '১০০% ডিলার সনদপ্রাপ্ত' : '100% Dealer Certified'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CUSTOMER SECURITY DEPOSIT POLICY BANNER (Why & on what basis customers pay deposit) */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-300/80 rounded-3xl p-4 md:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-emerald-950 text-sm md:text-base">
                  {language === 'bn'
                    ? 'কাস্টমার নিরাপত্তা জামানতের ভিত্তি ও ১০০% রিফান্ড গ্যারান্টি'
                    : 'Customer Security Deposit Basis & 100% Refund Guarantee'}
                </h3>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                  ট্রেড গাইড
                </span>
              </div>
              <p className="text-xs text-emerald-800/90 mt-0.5">
                {language === 'bn'
                  ? 'উচ্চমূল্যের পণ্যে বুকিং টোকেন জামানত কেন এবং কিসের ভিত্তিতে নেওয়া হয়? ডেলিভারির সময় চূড়ান্ত বিলে ১০০% সমন্বয় ও শতভাগ ফেরতযোগ্য।'
                  : 'Learn the mathematical and legal basis for token deposits, zero-spam buyer protection, and 100% refund escrow terms.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPolicyModalOpen(true)}
            className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-emerald-200" />
            <span>{language === 'bn' ? 'নীতিমালা বিস্তারিত পড়ুন' : 'Read Policy Details'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-1 border-t border-emerald-200/70">
          <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{language === 'bn' ? '৫%-১৫% ক্যাটাগরি রেশিও' : '5%-15% Ratio'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{language === 'bn' ? 'ভুয়া অর্ডার নিরসন' : 'Anti-Spam Proof'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{language === 'bn' ? '১০০% মূল্যে সমন্বয়' : '100% Deductible'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{language === 'bn' ? '২৪-৪৮ ঘণ্টায় রিফান্ড' : '24h Full Refund'}</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Category Filter Navigation */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'দারাজ থেকে খুঁজুন (যেমন: পাঞ্জাবি, বোরকা, হাতঘড়ি, আইফোন, বাটন ফোন)...'
                  : 'Search Daraz (e.g. Panjabi, Borka, Watch, iPhone, Button phone)...'
              }
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="featured">{language === 'bn' ? 'ফিচার্ড (জনপ্রিয়)' : 'Featured'}</option>
              <option value="price_desc">{language === 'bn' ? 'দাম: সর্বোচ্চ থেকে সর্বনিম্ন' : 'Price: High to Low'}</option>
              <option value="price_asc">{language === 'bn' ? 'দাম: সর্বনিম্ন থেকে সর্বোচ্চ' : 'Price: Low to High'}</option>
              <option value="commission">{language === 'bn' ? 'এজেন্ট কমিশন: সর্বোচ্চ' : 'Highest Dealer Commission'}</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? cat.labelBn : cat.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Product Counter & Active Filter Summary */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-medium">
        <span>
          {language === 'bn' ? 'প্রদর্শিত আইটেম:' : 'Showing items:'}{' '}
          <strong className="text-slate-900">{filteredProducts.length}</strong>{' '}
          {language === 'bn' ? `টি (সর্বমোট ${catalogItems.length}টি থেকে)` : `of ${catalogItems.length}`}
        </span>
        <button
          onClick={() => setIsPolicyModalOpen(true)}
          className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'জামানত নীতি ও এসক্রো সুরক্ষা' : 'Escrow Deposit Terms'}</span>
        </button>
      </div>

      {/* 5. Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.slice(0, 48).map((product) => {
          const origPrice = product.originalPriceBDT || (product.discountPercent ? Math.round(product.priceBDT / (1 - product.discountPercent / 100)) : undefined);
          const discountPct = product.discountPercent || (origPrice && origPrice > product.priceBDT ? Math.round(((origPrice - product.priceBDT) / origPrice) * 100) : undefined);
          const ratingVal = product.darazRating || product.rating || 4.8;
          const reviewsNum = product.darazReviewsCount || product.reviewsCount || 140;

          return (
            <div
              key={product.id}
              className="bg-white rounded-3xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-xl hover:border-orange-300 transition-all duration-200 group relative"
            >
              <div>
                {/* Product Image / Photo Banner */}
                {product.imageUrl ? (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-100">
                    <img
                      src={product.imageUrl}
                      alt={product.nameBn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Top Badges Overlay */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      {product.darazFlashSale && (
                        <span className="bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider flex items-center gap-1">
                          ⚡ FLASH SALE
                        </span>
                      )}
                      {product.darazFastShipping && (
                        <span className="bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-md shadow-md">
                          🚚 FAST SHIPPING
                        </span>
                      )}
                    </div>

                    {discountPct && discountPct > 0 && (
                      <span className="absolute top-2.5 right-2.5 bg-orange-600 text-white font-black text-xs px-2 py-0.5 rounded-lg shadow-md">
                        -{discountPct}%
                      </span>
                    )}

                    <span className="absolute bottom-1.5 right-2 text-[9px] font-mono text-slate-700/80 bg-white/80 backdrop-blur-xs px-1.5 py-0.2 rounded">
                      {product.id}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-3xl p-2.5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform">
                      {product.imageEmoji}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      {product.badge && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
                          {language === 'bn' ? product.badgeBn || product.badge : product.badge}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-slate-400">
                        {product.id}
                      </span>
                    </div>
                  </div>
                )}

                {/* Title & Category */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold uppercase tracking-wider text-orange-600">
                      {language === 'bn' ? product.categoryLabelBn : product.categoryLabel}
                    </span>
                    <span className="text-slate-400 font-medium">{product.brand}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                    {language === 'bn' ? product.nameBn : product.name}
                  </h3>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
                    <span className="text-amber-500 font-black flex items-center">
                      ★ {ratingVal}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      ({reviewsNum.toLocaleString()} {language === 'bn' ? 'রিভিউ' : 'reviews'})
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pt-1">
                    {language === 'bn' ? product.shortDescriptionBn : product.shortDescription}
                  </p>
                </div>

                {/* Specs Snapshot */}
                <div className="bg-slate-50 rounded-xl p-2 mb-3 space-y-1 text-[11px] border border-slate-100">
                  {Object.entries(language === 'bn' ? product.specsBn : product.specs).slice(0, 2).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-slate-600">
                      <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{k}:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[160px]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Booking CTA */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {language === 'bn' ? 'দারাজ অফার মূল্য:' : 'Daraz Offer Price:'}
                    </span>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-lg font-black text-slate-900 font-mono tracking-tight">
                        ৳{product.priceBDT.toLocaleString()}
                      </span>
                      {origPrice && origPrice > product.priceBDT && (
                        <del className="text-xs text-slate-400 line-through font-mono">
                          ৳{origPrice.toLocaleString()}
                        </del>
                      )}
                      {discountPct && discountPct > 0 && (
                        <span className="text-[11px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                          -{discountPct}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 font-medium block">
                      {language === 'bn' ? 'বুকিং জামানত:' : 'Booking Deposit:'}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">
                      ৳{product.bookingDepositBDT.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Deposit Security Indicator */}
                <div className="p-1.5 bg-emerald-50/80 rounded-lg text-[10px] text-emerald-800 flex items-center justify-between">
                  <span>{language === 'bn' ? '✓ ১০০% রিফান্ডেবল ও বিলে সমন্বয়যোগ্য' : '100% Refundable & Deductible'}</span>
                  <button
                    onClick={() => setIsPolicyModalOpen(true)}
                    className="underline text-emerald-700 font-bold"
                  >
                    শর্তাবলী
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedProductDetails(product)}
                    className="flex-1 py-2 px-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    {language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Specs'}
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenBookingModal) {
                        onOpenBookingModal(product);
                      } else {
                        onBuyProduct(product);
                      }
                    }}
                    className="flex-1 py-2 px-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>{language === 'bn' ? 'বুকিং করুন' : 'Book Deal'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more indicator if large filter */}
      {filteredProducts.length > 48 && (
        <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs text-slate-600 font-medium">
          {language === 'bn'
            ? `বাকি আরও ${filteredProducts.length - 48}টি প্রোডাক্ট দেখতে সার্চ বা ক্যাটাগরি ফিল্টার ব্যবহার করুন।`
            : `Showing first 48 of ${filteredProducts.length} items. Use search or category filter to refine.`}
        </div>
      )}

      {/* 6. Detailed Product Specification Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setSelectedProductDetails(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
            >
              ✕
            </button>

            {/* Product Photo Banner */}
            {selectedProductDetails.imageUrl ? (
              <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={selectedProductDetails.imageUrl}
                  alt={selectedProductDetails.nameBn}
                  className="w-full h-full object-cover"
                />
                {selectedProductDetails.darazFlashSale && (
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
                    ⚡ DARAZ FLASH SALE
                  </span>
                )}
                {selectedProductDetails.discountPercent && (
                  <span className="absolute top-3 right-3 bg-orange-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
                    -{selectedProductDetails.discountPercent}% ছাড়
                  </span>
                )}
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              {!selectedProductDetails.imageUrl && (
                <span className="text-4xl p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  {selectedProductDetails.imageEmoji}
                </span>
              )}
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                  {language === 'bn' ? selectedProductDetails.categoryLabelBn : selectedProductDetails.categoryLabel}
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                  {language === 'bn' ? selectedProductDetails.nameBn : selectedProductDetails.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>Item ID: {selectedProductDetails.id}</span>
                  <span>•</span>
                  <span className="text-amber-500 font-bold">★ {selectedProductDetails.darazRating || 4.8}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">
                  {language === 'bn' ? 'দারাজ অফার মূল্য:' : 'Daraz Offer Price:'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-rose-600 text-xl font-mono">
                    ৳{selectedProductDetails.priceBDT.toLocaleString()}
                  </span>
                  {selectedProductDetails.originalPriceBDT && selectedProductDetails.originalPriceBDT > selectedProductDetails.priceBDT && (
                    <del className="text-xs text-slate-400 line-through font-mono">
                      ৳{selectedProductDetails.originalPriceBDT.toLocaleString()}
                    </del>
                  )}
                </div>
              </div>
              {selectedProductDetails.originalPriceBDT && selectedProductDetails.originalPriceBDT > selectedProductDetails.priceBDT && (
                <div className="text-[11px] text-orange-700 bg-orange-100/60 p-2 rounded-xl flex items-center justify-between font-medium">
                  <span>গ্রাহক সরাসরি সাশ্রয় করছেন:</span>
                  <strong className="font-mono text-orange-800">
                    ৳{(selectedProductDetails.originalPriceBDT - selectedProductDetails.priceBDT).toLocaleString()}
                  </strong>
                </div>
              )}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
                <span className="text-slate-600">
                  {language === 'bn' ? 'প্রাথমিক বুকিং টোকেন জামানত:' : 'Initial Token Booking Deposit:'}
                </span>
                <span className="font-extrabold text-emerald-700 font-mono">
                  ৳{selectedProductDetails.bookingDepositBDT.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
                <span className="text-slate-600">
                  {language === 'bn' ? 'নির্ধারিত এজেন্ট কমিশন:' : 'Authorized Dealer Commission:'}
                </span>
                <span className="font-extrabold text-indigo-700 font-mono">
                  {selectedProductDetails.agentCommissionRate}% (৳{selectedProductDetails.agentCommissionBDT.toLocaleString()})
                </span>
              </div>
            </div>

            {/* Deposit Rationale Snapshot */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                {language === 'bn' ? 'জামানতের নিশ্চয়তা ও রিফান্ড নীতি:' : 'Deposit Escrow Guarantee:'}
              </span>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                {language === 'bn'
                  ? 'এই জামানতের টাকা কোনো অতিরিক্ত ফি নয়; ডেলিভারির সময় মোট মূল্য থেকে বাদ যাবে। ডেলিভারি পূর্বে বাতিল করতে চাইলে ২৪ ঘণ্টার মধ্যে কোনো কর্তন ছাড়াই সম্পূর্ণ টাকা বিকাশ/নগদে ফেরত পাওয়া যাবে।'
                  : 'This deposit is not a fee. It will be 100% deducted from your purchase bill at delivery or 100% refunded in 24 hours upon cancellation.'}
              </p>
            </div>

            {/* Complete Specifications List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {language === 'bn' ? 'পূর্ণাঙ্গ স্পেসিফিকেশন ও ডিলার তথ্য:' : 'Full Specifications & Dealer Info:'}
              </h4>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2 text-xs">
                {Object.entries(language === 'bn' ? selectedProductDetails.specsBn : selectedProductDetails.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-slate-200/60 last:border-none">
                    <span className="text-slate-500 font-medium">{key}</span>
                    <span className="font-bold text-slate-800 text-right">{val}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">{language === 'bn' ? 'ওয়ারেন্টি / গ্যারান্টি' : 'Warranty'}</span>
                  <span className="font-bold text-slate-800 text-right">
                    {language === 'bn' ? selectedProductDetails.warrantyBn : selectedProductDetails.warranty}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">{language === 'bn' ? 'ডিলারশিপ লোকেশন' : 'Dealer Location'}</span>
                  <span className="font-bold text-slate-800 text-right">{selectedProductDetails.dealerLocation}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'bn' ? selectedProductDetails.shortDescriptionBn : selectedProductDetails.shortDescription}
            </p>

            {/* Booking CTAs */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
              <button
                onClick={() => {
                  const p = selectedProductDetails;
                  setSelectedProductDetails(null);
                  if (onOpenBookingModal) {
                    onOpenBookingModal(p);
                  } else {
                    onBuyProduct(p);
                  }
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'বুকিং এগিয়ে নিন' : 'Proceed to Book'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Deposit Policy Modal */}
      <CustomerDepositPolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        language={language}
        sendMoneyNumber="01739420736"
      />
    </div>
  );
};
