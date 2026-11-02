import React from 'react';
import {
  Send,
  PlusCircle,
  Smartphone,
  ShoppingBag,
  Receipt,
  ArrowDownLeft,
  PiggyBank,
  HandCoins,
} from 'lucide-react';
import { TransactionType } from '../types/wallet.ts';

interface ActionGridProps {
  language: 'bn' | 'en';
  onSelectAction: (action: TransactionType | 'savings' | 'request') => void;
}

export const ActionGrid: React.FC<ActionGridProps> = ({ language, onSelectAction }) => {
  const actions = [
    {
      id: 'send_money' as const,
      labelEn: 'Send Money',
      labelBn: 'সেন্ড মানি',
      descEn: 'Send to any number',
      descBn: 'যেকোনো নম্বরে টাকা',
      icon: Send,
      bgColor: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      id: 'add_money' as const,
      labelEn: 'Add Money',
      labelBn: 'অ্যাড মানি',
      descEn: 'bKash, Nagad, Rocket',
      descBn: 'বিকাশ, নগদ, রকেট',
      icon: PlusCircle,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      id: 'mobile_recharge' as const,
      labelEn: 'Recharge',
      labelBn: 'রিচার্জ',
      descEn: 'All operators',
      descBn: 'সকল অপারেটর',
      icon: Smartphone,
      bgColor: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 'merchant_pay' as const,
      labelEn: 'Payment',
      labelBn: 'পেমেন্ট',
      descEn: 'Merchant & shops',
      descBn: 'দোকান ও মার্চেন্ট',
      icon: ShoppingBag,
      bgColor: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      id: 'bill_pay' as const,
      labelEn: 'Pay Bill',
      labelBn: 'বিল পে',
      descEn: 'Electricity, gas, wifi',
      descBn: 'বিদ্যুৎ, গ্যাস, নেট',
      icon: Receipt,
      bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      id: 'cash_out' as const,
      labelEn: 'Cash Out',
      labelBn: 'ক্যাশ আউট',
      descEn: 'ATM or agent',
      descBn: 'এজেন্ট বা এটিএম',
      icon: ArrowDownLeft,
      bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    },
    {
      id: 'savings' as const,
      labelEn: 'Savings',
      labelBn: 'সঞ্চয় / DPS',
      descEn: 'Earn up to 9% profit',
      descBn: 'মাসিক মুনাফা ও ডিপিএস',
      icon: PiggyBank,
      bgColor: 'bg-teal-50 text-teal-600 border-teal-100',
    },
    {
      id: 'request' as const,
      labelEn: 'Request',
      labelBn: 'টাকা অনুরোধ',
      descEn: 'Request from friends',
      descBn: 'বন্ধুদের কাছে চান',
      icon: HandCoins,
      bgColor: 'bg-orange-50 text-orange-600 border-orange-100',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-xs">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-1">
        {language === 'bn' ? 'প্রধান সেবাসমূহ' : 'Core Services'}
      </div>

      <div className="grid grid-cols-4 gap-2.5 md:gap-3.5">
        {actions.map((act) => {
          const IconComponent = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onSelectAction(act.id)}
              className="flex flex-col items-center p-2.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all group text-center"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-2 transition-transform group-hover:scale-105 shadow-2xs ${act.bgColor}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {language === 'bn' ? act.labelBn : act.labelEn}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5 leading-tight">
                {language === 'bn' ? act.descBn : act.descEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
