/**
 * Customer Security Deposit Policy & Foundation Guide
 * কাস্টমারদের জামানত কিসের উপর ভিত্তি করে এবং কেন দিতে হবে তার বিস্তারিত নীতিমালা
 */

export interface DepositRatioRule {
  categoryId: string;
  categoryNameBn: string;
  categoryNameEn: string;
  ratioRangeBn: string;
  ratioRangeEn: string;
  rationaleBn: string;
  rationaleEn: string;
  exampleBn: string;
  exampleEn: string;
  refundPolicyBn: string;
}

export const DEPOSIT_RATIO_RULES: DepositRatioRule[] = [
  {
    categoryId: 'mobile_tech',
    categoryNameBn: 'ফ্ল্যাগশিপ মোবাইল, ল্যাপটপ ও আইটি গ্যাজেট',
    categoryNameEn: 'Flagship Mobile, Laptop & IT Gadgets',
    ratioRangeBn: '৫% - ১০% (৳১০,০০০ - ৳১৫,০০০ টোকেন বুকিং)',
    ratioRangeEn: '5% - 10% (৳10,000 - ৳15,000 Token Booking)',
    rationaleBn: 'গ্লোবাল ব্র্যান্ডের সিল্ড প্যাক অথেনটিক আইটেম সরাসরি শো-রুম বা ইম্পোর্টার স্টক থেকে গ্রাহকের নামে রিজার্ভ এবং আইএমইআই (IMEI) লক করতে এই জামানত প্রয়োজন।',
    rationaleEn: 'Required to reserve genuine sealed-pack stock directly from brand distributors and lock specific device IMEIs under client name.',
    exampleBn: 'আইফোন ১৬ প্রো ম্যাক্স (মূল্য: ৳২,৩৮,০০০) এর জন্য বুকিং জামানত মাত্র ৳১৫,০০০',
    exampleEn: 'iPhone 16 Pro Max (Price: ৳2,38,000) token booking deposit is only ৳15,000',
    refundPolicyBn: 'ডেলিভারির সময় মূল দাম থেকে সমন্বয় হবে। ডেলিভারি পূর্বে বাতিল করলে ১০০% সম্পূর্ণ রিফান্ড ২৪ ঘণ্টার মধ্যে।',
  },
  {
    categoryId: 'luxury_vehicles',
    categoryNameBn: 'লাক্সারি ভেহিকল, প্রাডো, ল্যান্ড ক্রুজার ও কার ফ্লিট',
    categoryNameEn: 'Luxury Vehicles, Prado, Land Cruiser & Fleets',
    ratioRangeBn: '১০% - ১৫% (ডিলার বুকিং ও বিআরটিএ রেজিস্ট্রেশন টোকেন)',
    ratioRangeEn: '10% - 15% (Dealer Booking & BRTA Registration Token)',
    rationaleBn: 'জাপান রিকন্ডিশন্ড বা ব্র্যান্ড নিউ বিলাসবহুল গাড়ি শোরুম হোল্ড এবং কাস্টমারের নামে কাস্টমস ক্লিয়ারেন্স ও বিআরটিএ প্রাক-নিবন্ধন নিশ্চিত করতে জামানত নেওয়া হয়।',
    rationaleEn: 'Required to hold showroom inventory, customs clearance queue, and initiate preliminary BRTA registration papers.',
    exampleBn: 'টয়োটা ল্যান্ড ক্রুজার ৩০৭ ভিএক্স (মূল্য: ৳৩,৮৫,০০,০০০) এর জন্য বুকিং জামানত ৳১৫,০০,০০০',
    exampleEn: 'Toyota Land Cruiser 300 VX (Price: ৳38.5M) booking deposit is ৳1.5M',
    refundPolicyBn: 'টেস্ট ড্রাইভ শেষে পছন্দ না হলে বা ৭ দিনের মধ্যে রিফান্ড আবেদন করলে ১০০% টাকা ব্যাংক/ওয়ালেটে ফেরত।',
  },
  {
    categoryId: 'ocean_cargo',
    categoryNameBn: 'সমুদ্রগামী কন্টেইনার জাহাজ ও বাল্ক কার্গো ডিলারশিপ',
    categoryNameEn: 'Ocean Cargo Container Ships & Marine Dealership',
    ratioRangeBn: '১% - ৫% (আন্তর্জাতিক আরনেস্ট মানি ডিপোজিট)',
    ratioRangeEn: '1% - 5% (International Earnest Money Deposit)',
    rationaleBn: 'আন্তর্জাতিক সমুদ্র পরিবহন রেগুলেশন (IMO) এবং শিপিং লাইনের ডেডিকেটেড বার্থ ও কার্গো ক্যাপাসিটি ব্লক করার জন্য অনুমোদিত আরনেস্ট মানি (Earnest Money) ডিপোজিট আইনত বাধ্যতামূলক।',
    rationaleEn: 'Mandatory earnest money under International Maritime Organization (IMO) and port authority regulations to block cargo slots.',
    exampleBn: 'পানাম্যাক্স ক্লাস ৩,৫০০ টিইইউ কন্টেইনার জাহাজ এর আরনেস্ট জামানত ৳৫০,০০,০০০',
    exampleEn: 'Panamax Class 3,500 TEU Container Vessel earnest deposit is ৳5.0M',
    refundPolicyBn: 'আন্তর্জাতিক মেরিটাইম চুক্তি ও সার্ভেয়ার রিপোর্ট অনুযায়ী সুরক্ষিত এসক্রো অ্যাকাউন্ট থেকে শতভাগ সমন্বয়যোগ্য।',
  },
  {
    categoryId: 'heavy_machinery',
    categoryNameBn: 'হেভি মেশিনারি, অল-টেরেন ক্রেন ও বুলডোজার',
    categoryNameEn: 'Heavy Industrial Machinery, Cranes & Excavators',
    ratioRangeBn: '২% - ৫% (সাইট ডেলিভারি ও লোডিং সিকিউরিটি)',
    ratioRangeEn: '2% - 5% (Site Logistics & Loading Security)',
    rationaleBn: 'ভারী নির্মাণ ও শিল্প যন্ত্রপাতি নিরাপদ হাইড্রোলিক ট্রেলারে পরিবহন এবং সাইট ইন্সপেকশন স্লট বুক করতে নিরাপত্তা জামানত নেওয়া হয়।',
    rationaleEn: 'Required to schedule heavy low-bed trailer logistics and official site inspection.',
    exampleBn: 'ক্যাটারপিলার ৩৪৯ডি হাইড্রোলিক এক্সকাভেটর এর সিকিউরিটি জামানত ৳৬,৫০,০০০',
    exampleEn: 'Caterpillar 349D Excavator security token is ৳650,000',
    refundPolicyBn: 'সাইট ভিজিট ও যন্ত্রপাতির কন্ডিশন যাচাইয়ের পর ক্রয় সম্পন্ন হলে চূড়ান্ত বিলে সমন্বয় অথবা বাতিল হলে তাৎক্ষণিক ফেরত।',
  },
  {
    categoryId: 'commercial_property',
    categoryNameBn: 'বাণিজ্যিক প্রোপার্টি, ওয়্যারহাউস ও কর্পোরেট স্পেস',
    categoryNameEn: 'Commercial Real Estate, Warehouses & Corporate Spaces',
    ratioRangeBn: '২ মাসের সিকিউরিটি ডিপোজিট (বাণিজ্যিক চুক্তিভিত্তিক)',
    ratioRangeEn: '2 Months Security Deposit (Commercial Lease Agreement)',
    rationaleBn: 'প্রাইম লোকেশনে ডিলারশিপ শোরুম, ডকইয়ার্ড ওয়্যারহাউস অথবা হাব স্পেস অন্য পার্টিকে ভাড়া না দিয়ে নির্দিষ্ট মেয়াদে সংরক্ষণ রাখার নিশ্চয়তা।',
    rationaleEn: 'Guarantees exclusive holding of prime logistics hubs and commercial spaces under tenant deed.',
    exampleBn: 'চট্টগ্রাম পোর্ট সংলগ্ন ৬০,০০০ বর্গফুট লজিস্টিকস ওয়্যারহাউস এর বুকিং জামানত ৳৮,০০,০০০',
    exampleEn: 'Chittagong Port 60,000 sq ft Logistics Warehouse deposit is ৳800,000',
    refundPolicyBn: 'চুক্তি অনুযায়ী সম্পূর্ণ ফেরতযোগ্য অথবা শেষ মাসসমূহের ভাড়ার সাথে সমন্বয়যোগ্য।',
  },
];

export interface DepositPillar {
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  badgeBn: string;
  badgeEn: string;
}

export const DEPOSIT_PILLARS: DepositPillar[] = [
  {
    titleBn: '১. পণ্য রিজার্ভ ও ভুয়া অর্ডার প্রতিরোধ (Anti-Spam & Genuine Booking)',
    titleEn: '1. Inventory Reservation & Anti-Spam Protection',
    descriptionBn: 'যেহেতু প্রতিটি পণ্য কোটি বা লাখ টাকার অতি-উচ্চমূল্যের (যেমন গাড়ি, কন্টেইনার জাহাজ, ফ্ল্যাগশিপ মোবাইল), তাই অসদুপায়ী বা ভূয়া বুকিং ঠেকাতে কাস্টমারের সিরিয়াসনেস প্রমাণ ও আইনি স্বীকৃতির জন্য জামানত গ্রহণ করা হয়।',
    descriptionEn: 'Because every catalog item is a multi-million or high-value asset, token deposits prove genuine buyer intent and prevent fraudulent inventory lockups.',
    badgeBn: 'ভুয়া অর্ডার নিরসন',
    badgeEn: 'Zero Spam',
  },
  {
    titleBn: '২. ১০০% মূল মূল্যের সাথে সমন্বয় (100% Price Adjustment)',
    titleEn: '2. 100% Price Deductible on Delivery',
    descriptionBn: 'জামানতের অর্থ কোনো অতিরিক্ত সার্ভিস চার্জ বা ফি নয়। পণ্য ডেলিভারির সময় ক্রেতার ইনভয়েসের মোট মূল্য থেকে প্রদত্ত জামানতের প্রতিটি পয়সা সরাসরি সমন্বয় (Deduct) হয়ে যায়।',
    descriptionEn: 'The deposit is strictly not a fee. 100% of the deposit is deducted directly from your final purchase bill at delivery.',
    badgeBn: 'কোনো বাড়তি ফি নেই',
    badgeEn: 'Zero Hidden Fee',
  },
  {
    titleBn: '৩. শতভাগ রিফান্ড গ্যারান্টি (100% Unconditional Refund)',
    titleEn: '3. 100% Full Refund Guarantee',
    descriptionBn: 'ডেলিভারির পূর্বে কোনো কারণে গ্রাহক অর্ডার পরিবর্তন বা বাতিল করতে চাইলে, আবেদন করার ২৪ থেকে ৪৮ ঘণ্টার মধ্যে কোনো সার্ভিস চার্জ কর্তন ব্যতিরেকে গ্রাহকের নিজস্ব বিকাশ, নগদ অথবা রকেট নম্বরে শতভাগ টাকা ফেরত প্রদান করা হয়।',
    descriptionEn: 'If the customer cancels before delivery or if delivery criteria are unmet, 100% of the funds are refunded within 24-48 hours with zero deduction.',
    badgeBn: '২৪-৪৮ ঘণ্টায় ফেরত',
    badgeEn: '24-48h Refund',
  },
  {
    titleBn: '৪. বাংলাদেশ ব্যাংক অনুমোদিত এসক্রো সুরক্ষা (Escrow Safety)',
    titleEn: '4. Central Escrow Account Safety',
    descriptionBn: 'গ্রাহকের জমাকৃত জামানত কোনো ব্যক্তির পকেটে যায় না; এটি সরকার অনুমোদিত এসক্রো (Escrow) ট্রাস্ট অ্যাকাউন্টে সুরক্ষিত থাকে। ক্রেতা পণ্য হাতে পেয়ে সন্তুষ্ট হয়ে সাইন-অফ করার পরেই কেবল বিক্রেতা অর্থ ছাড় পায়।',
    descriptionEn: 'Customer funds are securely held in an escrow account. Funds are released to dealerships only after buyer signs off upon physical inspection.',
    badgeBn: 'এসক্রো সুরক্ষিত',
    badgeEn: 'Escrow Protected',
  },
  {
    titleBn: '৫. ০% সুদে কিস্তি (EMI) ও ডিলারশিপ স্পেশাল ওয়ারেন্টি',
    titleEn: '5. 0% Interest EMI & Extended Dealer Warranty',
    descriptionBn: 'জামানত সম্পন্নকারী প্রতিটি ক্রেতা অফিসিয়াল ৩ থেকে ৩৬ মাসের ০% সুদে ইএমআই সুবিধা, ফ্রি হোম ডেলিভারি ও অগ্রাধিকারমূলক ২৪ ঘণ্টার টেকনিক্যাল সাপোর্ট পেয়ে থাকেন।',
    descriptionEn: 'Verified deposit customers unlock 0% EMI financing plans, priority logistics, and 24-month comprehensive replacement warranties.',
    badgeBn: '০% কিস্তি সুবিধা',
    badgeEn: '0% Interest EMI',
  },
];

export const AGENT_CUSTOMER_EXPLAINER_SCRIPT = {
  headlineBn: 'এজেন্টদের জন্য কাস্টমার জামানত ব্যাখ্যা করার সহজ গাইড',
  headlineEn: 'Quick Explainer Script for Agents to Tell Customers',
  scriptLinesBn: [
    'স্যার/ম্যাম, আমাদের সমস্ত পণ্য সরাসরি অফিশিয়াল ডিলার ও আমদানিকারকের স্টক থেকে প্রি-বুক করা হয়।',
    'গাড়ি, জাহাজ কিংবা আইফোনের মতো কোটি/লাখ টাকার পণ্যে ফেক অর্ডার রোধ করতে মাত্র ৫%-১০% টোকেন জামানত নেওয়া হয়।',
    'এই টাকাটা কোনো বাড়তি চার্জ নয়—ডেলিভারির দিন আপনার মূল বিল থেকে এই টাকাটা বাদ যাবে।',
    'সবচেয়ে বড় সুবিধা হলো, ডেলিভারির আগে আপনি অর্ডার ক্যান্সেল করতে চাইলে ২৪ ঘণ্টার মধ্যে আপনার পুরো টাকা কোনো কাটছাঁট ছাড়া বিকাশ/নগদে ফেরত পেয়ে যাবেন!',
    'লেনদেন সম্পূর্ণ নিরাপদ—অফিসিয়াল অনুমোদিত সেন্ড মানি নম্বর ০১৭৩৯৪২০৭৩৬ তে পাঠালেই সাথে সাথে ট্রানজেকশন রিসিট পাবেন।',
  ],
};

export interface AgentSecurityDepositTier {
  id: string;
  tierNameBn: string;
  tierNameEn: string;
  dailyTransactionLimitBDT: number;
  requiredDepositBDT: number;
  securityRatioPercent: number;
  expectedDailyCommissionBDT: string;
  welcomeBonusBDT: number;
  isRecommended?: boolean;
  featuresBn: string[];
}

export const AGENT_SECURITY_DEPOSIT_TIERS: AgentSecurityDepositTier[] = [
  {
    id: 'tier_starter',
    tierNameBn: 'সিলভার পার্টনার',
    tierNameEn: 'Silver Partner',
    dailyTransactionLimitBDT: 25000,
    requiredDepositBDT: 2500,
    securityRatioPercent: 10,
    expectedDailyCommissionBDT: '৳৫০০ - ৳৮৫০+',
    welcomeBonusBDT: 1000,
    isRecommended: false,
    featuresBn: [
      'প্রতিদিন ৳২৫,০০০ পর্যন্ত কাস্টমার পণ্য লেনদেন অনুমতি',
      'বাধ্যতামূলক সিকিউরিটি জামানত মাত্র ৳২,৫০০ (১০%)',
      '১০০% রিফান্ডেবল ও চুক্তিতে সমন্বয়যোগ্য',
      'দৈনিক লেনদেনে ১-১.২% কমিশন ও লাইভ এসএমএস',
    ],
  },
  {
    id: 'tier_standard',
    tierNameBn: 'গোল্ড মেগা পার্টনার (সর্বাধিক জনপ্রিয়)',
    tierNameEn: 'Gold Mega Partner (Most Popular)',
    dailyTransactionLimitBDT: 50000,
    requiredDepositBDT: 5000,
    securityRatioPercent: 10,
    expectedDailyCommissionBDT: '৳১,২০০ - ৳২,১৫০+',
    welcomeBonusBDT: 2000,
    isRecommended: true,
    featuresBn: [
      'প্রতিদিন ৳৫০,০০০ পর্যন্ত বৃহৎ কাস্টমার অর্ডার লেনদেন অনুমতি',
      'বাধ্যতামূলক সিকিউরিটি জামানত মাত্র ৳৫,০০০ (১০%)',
      'অ্যাডমিন অনুমোদন শেষে সাথে সাথে ৳২,০০০ বোনাস ক্রেডিট',
      'দারাজ শপ ও ডিলারশিপের ২১০+ পণ্যে সর্বোচ্চ কমিশন সুবিধা',
      '১০০% ক্যাশ সিকিউরড ও যেকোনো সময় প্রত্যাহারযোগ্য',
    ],
  },
  {
    id: 'tier_premium',
    tierNameBn: 'প্লাটিনাম মেগা ডিলার',
    tierNameEn: 'Platinum Mega Dealer',
    dailyTransactionLimitBDT: 100000,
    requiredDepositBDT: 10000,
    securityRatioPercent: 10,
    expectedDailyCommissionBDT: '৳২,৫০০ - ৳৪,৮০০+',
    welcomeBonusBDT: 4000,
    isRecommended: false,
    featuresBn: [
      'প্রতিদিন ৳১,০০,০০০ পর্যন্ত সুপার সাইকেল লেনদেন অনুমতি',
      'বাধ্যতামূলক সিকিউরিটি জামানত মাত্র ৳১০,০০০ (১০%)',
      'লাক্সারি গাড়ি ও ফ্ল্যাগশিপ ফোন ডিলার বুকিংয়ে বিশেষ প্রণোদনা',
      'অগ্রাধিকারমূলক অ্যাডমিন সাপোর্ট ও ২৪/৭ ভিআইপি সহায়তা',
      '১০০% চুক্তিভিত্তিক সম্পূর্ণ ফেরতযোগ্য সিকিউরিটি ফান্ড',
    ],
  },
  {
    id: 'tier_enterprise',
    tierNameBn: 'ভিআইপি ডিস্ট্রিক্ট সুপার হাব',
    tierNameEn: 'VIP District Super Hub',
    dailyTransactionLimitBDT: 200000,
    requiredDepositBDT: 20000,
    securityRatioPercent: 10,
    expectedDailyCommissionBDT: '৳৫,০০০ - ৳১০,০০০+',
    welcomeBonusBDT: 8000,
    isRecommended: false,
    featuresBn: [
      'প্রতিদিন ৳২,০০,০০০ পর্যন্ত আনলিমিটেড ভলিউম অনুমতি',
      'বাধ্যতামূলক সিকিউরিটি জামানত ৳২০,০০০ (১০%)',
      'সমগ্র জেলার সমস্ত কাস্টমার অর্ডারের নোটিফিকেশন হাব',
      'জাহাজ ও মেগা প্রোপার্টি বুকিংয়ে লাখ টাকা পর্যন্ত কমিশন',
      'শতভাগ রিফান্ডেবল ও প্রাতিষ্ঠানিক ব্যাংক গ্যারান্টি',
    ],
  },
];

/**
 * Daraz Official Partner Work Guidelines & Income System
 * কাজের নীতিমালা, ইনকাম পদ্ধতি ও ১০০% বেটিং-মুক্ত কর্পোরেট নিশ্চয়তা
 */
export interface DarazWorkStep {
  stepNo: number;
  titleBn: string;
  badgeBn: string;
  descBn: string;
  keyPointsBn: string[];
}

export const DARAZ_OFFICIAL_WORK_GUIDELINES = {
  headerTitleBn: 'eWallet Go & দারাজ — কাজের নীতিমালা ও ইনকাম পদ্ধতি',
  headerSubtitleBn: 'দারাজ বাংলাদেশ অনুমোদিত গ্যাজেট মার্চেন্ট ও রিটেইল ডিলারশিপ পার্টনার নেটওয়ার্ক',
  antiBettingGuaranteeBn: {
    titleBn: '🚫 কঠোর প্রাতিষ্ঠানিক নিশ্চয়তা: ১০০% বেটিং ও জুয়া মুক্ত ই-কমার্স প্ল্যাটফর্ম',
    bodyBn:
      'আমাদের সিস্টেমে কোনো প্রকার বেটিং (Betting), জুয়া বা অননুমোদিত সাইটের কাস্টমারদের কোনো নম্বর বা লেনদেন কখনোই ব্যবহার করা হয় না এবং কঠোরভাবে নিষিদ্ধ। আমরা শতভাগ বৈধ, সরকারি ট্রেড লাইসেন্সপ্রাপ্ত এবং দারাজ বাংলাদেশের অনুমোদিত গ্যাজেট ও ইলেকট্রনিক্স ডিস্ট্রিবিউশন পার্টনার। আমাদের সমস্ত লেনদেন বাস্তব পণ্যের (আইফোন, স্যামসাং, ট্রিমার, ঘড়ি, গ্যাজেট) কাস্টমার অর্ডারের ভিত্তিতে পরিচালিত হয়।',
  },
  steps: [
    {
      stepNo: 1,
      titleBn: 'ধাপ ১: কাজের যোগ্যতা ও প্রাতিষ্ঠানিক পার্টনারশিপ',
      badgeBn: 'যোগ্যতা ও অনুমোদন',
      descBn:
        'আপনার যদি সচল বিকাশ, নগদ, রকেট (Personal / Agent / Merchant) অথবা ব্যাংক অ্যাকাউন্ট থাকে, তবে আপনি আমাদের সাথে দারাজ মার্চেন্ট এজেন্ট হিসেবে কাজ শুরু করতে পারবেন।',
      keyPointsBn: [
        'বিকাশ, নগদ, রকেট বা ব্যাংক অ্যাকাউন্ট আবশ্যক',
        'ভোটার আইডি কার্ড (Smart NID) ফটোকপি ভেরিফিকেশন',
        'দোকানদার, বিকাশ-নগদ এজেন্ট পয়েন্ট ও স্বতন্ত্র উদ্যোক্তাদের জন্য উন্মুক্ত',
        '১০০% বৈধ দারাজ গ্যাজেট মার্চেন্ট নেটওয়ার্কে অন্তর্ভুক্তি',
      ],
    },
    {
      stepNo: 2,
      titleBn: 'ধাপ ২: কাস্টমারদের পণ্য অর্ডার হ্যান্ডলিং ও লাইভ নোটিফিকেশন',
      badgeBn: 'বাস্তব দারাজ পণ্য',
      descBn:
        'প্রতিদিন বাংলাদেশের বিভিন্ন জেলা থেকে সাধারণ গ্রাহকরা দারাজের ফ্ল্যাগশিপ ফোন, ট্রিমার, ঘড়ি, ল্যাপটপ ইত্যাদি হোম ডেলিভারি ও টোকেন বুকিং করেন।',
      keyPointsBn: [
        'গ্রাহকের নাম, ফোন নম্বর, জেলা, থানা ও ডেলিভারি লোকেশন সরাসরি ড্যাশবোর্ডে দেখা যাবে',
        'লাইভ এসএমএস নোটিফিকেশনের মাধ্যমে প্রতিটি নতুন অর্ডারের তাৎক্ষণিক আপডেট',
        'কোনো ফেক বা ডামি লেনদেন নয় — প্রতিটি অর্ডারের বিপরীতে আসল কাস্টমার ও পণ্য সংযুক্ত',
        'প্রতিদিন ২৪ ঘণ্টা পর্যন্ত কাস্টমার হিস্ট্রি সংরক্ষিত থাকে এবং স্বয়ংক্রিয়ভাবে চক্রাকার আপডেট হয়',
      ],
    },
    {
      stepNo: 3,
      titleBn: 'ধাপ ৩: প্রাতিষ্ঠানিক জামানতের যৌক্তিকতা ও ১০% অনুপাত নীতি',
      badgeBn: '১০০% রিফান্ডেবল জামানত',
      descBn:
        'এজেন্টের অ্যাকাউন্টে প্রতিদিন কোম্পানি থেকে পর্যাপ্ত পরিমাণ ফ্লোট ব্যালেন্স ও লেনদেন পারমিশন লিমিট (যেমন: প্রতিদিন ৫০,০০০ টাকা) প্রদান করা হয়। এই বিশাল আর্থিক তহবিলের সুরক্ষায় সিকিউরিটি জামানত বাধ্যতামূলক।',
      keyPointsBn: [
        'কাস্টমারদের লাখ লাখ টাকার ডেলিভারি অর্ডার ও কোম্পানির ফ্লোট ব্যালেন্সের নিশ্চয়তা',
        'দৈনিক লেনদেন লিমিটের মাত্র ১০% জামানত (যেমন: ৫০,০০০ টাকা লিমিটের বিপরীতে ৫,০০০ টাকা জামানত)',
        'এটি কোনো ফি বা চার্জ নয় — এটি আপনার নিজস্ব সুরক্ষিত ক্যাশ জামানত',
        'বাংলাদেশ সরকার অনুমোদিত সেন্ট্রাল এসক্রো ফান্ডে রক্ষিত এবং কাজ ছাড়লে শতভাগ ফেরতযোগ্য',
      ],
    },
    {
      stepNo: 4,
      titleBn: 'ধাপ ৪: এজেন্টদের ইনকাম পদ্ধতি ও দৈনিক কমিশন',
      badgeBn: 'নিশ্চিত আয় ও কমিশন',
      descBn:
        'প্রতিটি সফল কাস্টমার প্রোডাক্ট অর্ডারের উপর এজেন্ট সরাসরি ২% থেকে ৩% ক্যাশ কমিশন লাভ করবেন। অর্ডার সফল হওয়ার সাথে সাথে কমিশন অ্যাকাউন্টে জমা হয়।',
      keyPointsBn: [
        'প্রতিটি পণ্যে ২% থেকে ৩% সরাসরি ক্যাশ কমিশন (যেমন: ৳৫০,০০০ অর্ডারে ৳১,৫০০ কমিশন)',
        'প্রতিদিন গড়ে ৳১,২০০ থেকে ৳২,১৫০+ টাকা পর্যন্ত নিশ্চিত নিট আয় (মাসে ৳৩৬,০০০ - ৳৬৫,০০০+)',
        'প্রথম সাইন-আপ ও জামানত অনুমোদন শেষে সাথে সাথে ৳২,০০০ পর্যন্ত স্বাগত বোনাস ক্রেডিট',
        'অর্জিত কমিশন যেকোনো সময় নিজস্ব বিকাশ, নগদ বা ব্যাংক অ্যাকাউন্টে উত্তোলনযোগ্য',
      ],
    },
  ] as DarazWorkStep[],
  faqBn: [
    {
      q: 'জামানতের টাকা কি কোনোদিন কাটা যাবে?',
      a: 'না। জামানতের ১ পয়সাও কাটা যাবে না। এটি আপনার অ্যাকাউন্টের জামানত তহবিল হিসেবে সংরক্ষিত থাকবে এবং আপনি ব্যবসা বন্ধ করতে চাইলে ২৪ ঘণ্টার মধ্যে সম্পূর্ণ টাকা বিকাশ/নগদে ফেরত দেওয়া হবে।',
    },
    {
      q: 'আমার নম্বর কি কোনো বেটিং বা জুয়া সাইটে ব্যবহার হবে?',
      a: 'কখনোই না! আমাদের প্রতিষ্ঠান সরাসরি দারাজ বাংলাদেশ ও অনুমোদিত গ্যাজেট মার্চেন্টদের পার্টনার। এখানে কোনো বেটিং, জুয়া বা অননুমোদিত সাইটের কাস্টমারদের কোনো নম্বর বা লেনদেন গ্রহণ করা হয় না। এটি ১০০% হালাল ও আইনসম্মত ই-কমার্স ব্যবসা।',
    },
    {
      q: 'আমি প্রতিদিন কত টাকা লেনদেন ও আয় করতে পারব?',
      a: 'আপনি যদি গোল্ড পার্টনার হন, তবে প্রতিদিন ৳৫০,০০০ টাকা পর্যন্ত কাস্টমার লেনদেন করতে পারবেন এবং প্রতিদিন ৳১,২০০ থেকে ৳২,১৫০+ টাকা নিট কমিশন আয় করতে পারবেন।',
    },
  ],
};

