import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  SlidersHorizontal,
  RotateCcw,
  Calendar,
  AlertOctagon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InventoryLog } from '../types';

export const StockLogsView: React.FC = () => {
  const { inventoryLogs, formatDate } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredLogs = inventoryLogs.filter(log => {
    const matchesSearch =
      log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || log.type === filterType;

    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: InventoryLog['type']) => {
    switch (type) {
      case 'purchase':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 inline-flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> توريد مشتريات (+)
          </span>
        );
      case 'sale':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
            <ArrowDownLeft className="w-3 h-3" /> مبيعات (-)
          </span>
        );
      case 'adjustment_in':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 inline-flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> تسوية جردية بالزيادة (+)
          </span>
        );
      case 'adjustment_out':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> تسوية جردية بالنقص (-)
          </span>
        );
      case 'damage':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 inline-flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> بضاعة تالفة (-)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#e9ebed] select-none overflow-y-auto">
      {/* Top Banner Header (Dark metallic bar as in Zin Stock) */}
      <div className="bg-gradient-to-b from-[#2d2f33] via-[#1f2023] to-[#161719] text-white px-6 py-3 shadow-md flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-numbers px-3 py-1 rounded bg-neutral-700 text-neutral-200 font-bold">
            إجمالي الحركات: {inventoryLogs.length} حركة
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-white font-sans">تسيير وحالة المخزون (سجل الحركات)</span>
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-white">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full">

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المنتج، الرمز، أو سبب الحركة..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">جميع أنواع العمليات</option>
            <option value="sale">مبيعات (صادر)</option>
            <option value="purchase">مشتريات (وارد)</option>
            <option value="adjustment_in">تسوية بالزيادة</option>
            <option value="adjustment_out">تسوية بالنقص</option>
            <option value="damage">توالف</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold">التاريخ</th>
                <th className="p-3.5 font-semibold">اسم الصنف</th>
                <th className="p-3.5 font-semibold">الرمز (SKU)</th>
                <th className="p-3.5 font-semibold">نوع الحركة</th>
                <th className="p-3.5 font-semibold text-center">الكمية المغيرة</th>
                <th className="p-3.5 font-semibold text-center">الرصيد السابق</th>
                <th className="p-3.5 font-semibold text-center">الرصيد الجديد</th>
                <th className="p-3.5 font-semibold">البيان / السبب والمصدر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    لا توجد حركات مخزنية مسجلة
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3.5 font-mono-numbers text-slate-500 whitespace-nowrap">
                      {formatDate(log.date)}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {log.productName}
                    </td>
                    <td className="p-3.5 font-mono-numbers text-slate-500">
                      {log.sku}
                    </td>
                    <td className="p-3.5">
                      {getTypeBadge(log.type)}
                    </td>
                    <td className="p-3.5 text-center font-bold font-mono-numbers text-sm">
                      <span
                        className={
                          log.quantityChange > 0
                            ? 'text-blue-600'
                            : log.quantityChange < 0
                            ? 'text-rose-600'
                            : 'text-slate-600'
                        }
                      >
                        {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono-numbers text-slate-500">
                      {log.previousStock}
                    </td>
                    <td className="p-3.5 text-center font-bold font-mono-numbers text-slate-800">
                      {log.newStock}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">
                      {log.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};
