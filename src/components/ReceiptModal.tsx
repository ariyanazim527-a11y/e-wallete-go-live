import React from 'react';
import { X, CheckCircle2, Share2, Copy, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaction } from '../types/wallet.ts';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  language: 'bn' | 'en';
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose, language }) => {
  if (!transaction) return null;

  const isInflow = transaction.type === 'add_money';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {language === 'bn' ? 'লেনদেনের রশিদ' : 'Transaction Receipt'}
          </span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center space-y-2 mb-5">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              isInflow ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}
          >
            {isInflow ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            {language === 'bn' ? transaction.titleBn : transaction.title}
          </h3>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            {isInflow ? '+' : '-'}৳{transaction.amount.toLocaleString()}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {language === 'bn' ? 'সফল হয়েছে' : 'Completed'}
          </span>
        </div>

        <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>{language === 'bn' ? 'প্রাপক / মাধ্যম:' : 'Recipient / Source:'}</span>
            <span className="font-semibold text-slate-800">{transaction.recipientOrSource}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>{language === 'bn' ? 'তারিখ ও সময়:' : 'Date & Time:'}</span>
            <span className="text-slate-800">{transaction.timestamp}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>{language === 'bn' ? 'চার্জ / ফি:' : 'Charge / Fee:'}</span>
            <span className="text-slate-800">৳{transaction.fee}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-500">
            <span>{language === 'bn' ? 'ট্রানজেকশন আইডি:' : 'Trx ID:'}</span>
            <span className="font-mono font-bold text-rose-600">{transaction.referenceId}</span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => {
              alert(language === 'bn' ? 'রশিদ ডাউনলোড করা হয়েছে!' : 'Receipt downloaded!');
              onClose();
            }}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
