import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Search,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Transaction } from '../types/wallet.ts';

interface TransactionHistoryProps {
  transactions: Transaction[];
  language: 'bn' | 'en';
  onSelectTransaction: (tx: Transaction) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  language,
  onSelectTransaction,
}) => {
  const [filter, setFilter] = useState<'all' | 'inflow' | 'outflow' | 'bills'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.recipientOrSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.referenceId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'inflow') return tx.type === 'add_money';
    if (filter === 'outflow') return tx.type === 'send_money' || tx.type === 'cash_out' || tx.type === 'merchant_pay';
    if (filter === 'bills') return tx.type === 'bill_pay' || tx.type === 'mobile_recharge';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-xs">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            {language === 'bn' ? 'সাম্প্রতিক লেনদেন ইতিহাস' : 'Recent Transactions'}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'সর্বশেষ সকল লেনদেনের বিস্তারিত' : 'All incoming and outgoing activities'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'সকল' : 'All'}
          </button>
          <button
            onClick={() => setFilter('outflow')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === 'outflow' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'খরচ' : 'Paid'}
          </button>
          <button
            onClick={() => setFilter('inflow')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === 'inflow' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'আয়' : 'Received'}
          </button>
          <button
            onClick={() => setFilter('bills')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === 'bills' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'বিল' : 'Bills'}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3.5">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'bn' ? 'লেনদেন খুঁজুন (নাম, নম্বর বা ট্রানজেকশন আইডি)...' : 'Search by name, number or Trx ID...'}
          className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
        />
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-slate-100">
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {language === 'bn' ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No transactions found'}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isInflow = tx.type === 'add_money';

            return (
              <button
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-slate-50/80 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isInflow ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isInflow ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs group-hover:text-rose-600 transition-colors">
                      {language === 'bn' ? tx.titleBn : tx.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {tx.recipientOrSource} · {tx.timestamp}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-bold font-mono ${
                      isInflow ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isInflow ? '+' : '-'}৳{tx.amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {tx.referenceId}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
