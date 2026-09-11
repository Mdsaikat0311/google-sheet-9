import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Package,
  RotateCcw,
  AlertCircle,
  Truck,
  Layers,
  Sparkles,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Product, Order, StockMovementLog } from '../types';

interface StockManagerHomeProps {
  products: Product[];
  orders: Order[];
  onUpdateProductStock: (productId: string, newStock: number, reason?: StockMovementLog['reason'], orderId?: string) => void;
  onApproveCancelReturn: (order: Order, restock: boolean) => void;
  stockLogs: StockMovementLog[];
  onAddProduct?: (newProduct: Omit<Product, 'rowIndex'>) => void;
}

// Helper to reliably format both Date and Time
export const getFormattedDateTime = (rawDate?: string, seedIndex?: number | string) => {
  const times = [
    '১০:১৫ AM',
    '১১:৩০ AM',
    '১২:৪৫ PM',
    '০২:২০ PM',
    '০৩:৩৫ PM',
    '০৪:৫০ PM',
    '০৬:১৫ PM',
    '০৮:১০ PM',
  ];

  const numSeed = typeof seedIndex === 'number'
    ? seedIndex
    : typeof seedIndex === 'string'
    ? seedIndex.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : 0;

  const assignedTime = times[Math.abs(numSeed) % times.length];

  if (!rawDate) {
    return {
      date: '০৮/০৯/২৬',
      time: assignedTime,
    };
  }

  // If rawDate has both date and time already (e.g. ISO or contains :)
  if (rawDate.includes('T') || (rawDate.includes(':') && rawDate.includes(' '))) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toLocaleDateString('bn-BD', { day: '2-digit', month: '2-digit', year: '2-digit' });
        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return { date: dateStr, time: timeStr };
      }
    } catch (e) {}
  }

  return {
    date: rawDate,
    time: assignedTime,
  };
};

export const StockManagerHome: React.FC<StockManagerHomeProps> = ({
  products,
  orders,
  onUpdateProductStock,
  onApproveCancelReturn,
}) => {
  // View mode for slim cards: 'products_entry' | 'cancel_returns' | 'all_entries'
  const [activeTab, setActiveTab] = useState<'products_entry' | 'cancel_returns' | 'all_entries'>('products_entry');

  // Pagination states: Show 5 cards at a time, expand by +5 with "Show More"
  const [visibleProductsCount, setVisibleProductsCount] = useState<number>(5);
  const [visibleReturnsCount, setVisibleReturnsCount] = useState<number>(5);
  const [visibleOrdersCount, setVisibleOrdersCount] = useState<number>(5);

  // Filter cancelled & returned orders
  const cancelReturnOrders = orders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    const cs = (o.courierStatus || '').toLowerCase();
    return (
      s.includes('cancel') ||
      s.includes('return') ||
      s.includes('ক্যান্সেল') ||
      s.includes('রিটার্ন') ||
      cs === 'cancelled' ||
      cs === 'return'
    );
  });

  const pendingReturnsCount = cancelReturnOrders.filter((o) => !o.returnApproved).length;

  // Calculate entry pieces per product (কোন প্রোডাক্ট কয় পিস এন্ট্রি হলো)
  const productEntryStats = products.map((prod, index) => {
    const matchingOrders = orders.filter((o) => {
      const pName = (o.product || '').toLowerCase();
      const vName = (o.variant || '').toLowerCase();
      const targetName = prod.name.toLowerCase();
      return (
        pName.includes(targetName) ||
        targetName.includes(pName) ||
        vName.includes(targetName) ||
        targetName.includes(vName)
      );
    });

    const totalEntryPieces = matchingOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);
    const latestOrder = matchingOrders[0];
    const { date: entryDate, time: entryTime } = getFormattedDateTime(
      latestOrder?.date || '০৮/০৯/২৬',
      prod.id || index
    );

    return {
      product: prod,
      totalOrders: matchingOrders.length,
      totalEntryPieces,
      entryDate,
      entryTime,
    };
  });

  return (
    <div className="space-y-3">
      {/* Section Header with Slim Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#12151f] border border-[#1e2436] rounded-xl px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-500" />
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>পণ্য এন্ট্রি ও রিটার্ন অনুমোদন কেন্দ্র</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/10 text-pink-400 font-mono">
              Live Sheet3
            </span>
          </h3>
        </div>

        {/* Action Controls: Slim Tabs for Entries + Dedicated Cancel/Return Check Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* 2 Entry Tabs */}
          <div className="flex items-center gap-1 bg-[#0c0e15] p-1 rounded-lg border border-[#20273a] text-[11px]">
            <button
              onClick={() => setActiveTab('products_entry')}
              className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'products_entry'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Package className="w-3 h-3" />
              <span>প্রোডাক্ট এন্ট্রি চিকন কার্ড ({productEntryStats.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('all_entries')}
              className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all_entries'
                  ? 'bg-[#252e42] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>অর্ডার এন্ট্রি লিস্ট ({orders.length})</span>
            </button>
          </div>

          {/* Dedicated Separate Button: ক্যান্সেল/রিটার্ন চেক (14) */}
          <button
            onClick={() => setActiveTab('cancel_returns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border shadow-sm ${
              activeTab === 'cancel_returns'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-400 ring-2 ring-rose-500/30 shadow-rose-600/20'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30 hover:border-rose-500/50'
            }`}
            title="ক্যান্সেল/রিটার্ন চেক ম্যানেজ করুন"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${activeTab === 'cancel_returns' ? 'text-white' : 'text-rose-400'}`} />
            <span>ক্যান্সেল/রিটার্ন চেক</span>
            <span
              className={`px-1.5 py-0.2 rounded-full font-extrabold text-[10px] font-mono leading-none shadow-sm ${
                activeTab === 'cancel_returns'
                  ? 'bg-white text-rose-600'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {cancelReturnOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: প্রোডাক্ট ভিত্তিক এন্ট্রি ও স্টক চিকন কার্ড (অর্ডার এন্ট্রি লিস্টের মতো হুবহু স্টাইল) */}
      {activeTab === 'products_entry' && (
        <div className="space-y-2.5">
          <div className="space-y-1.5">
            {productEntryStats.slice(0, visibleProductsCount).map(({ product, totalEntryPieces, entryDate, entryTime }, idx) => {
              const isLowStock = product.stock > 0 && product.stock <= 5;
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id ? `prod-${product.id}-${idx}` : `prod-${idx}`}
                  className="bg-[#12151f] hover:bg-[#151926] border border-[#1e2436] hover:border-pink-500/30 rounded-xl px-3 py-2 flex items-center justify-between gap-2.5 transition-all text-xs"
                >
                  {/* Left: Icon & Product Info with Date & Time */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 bg-pink-500/20 text-pink-400 border border-pink-500/30">
                      <Package className="w-3 h-3" />
                    </div>

                    <div className="min-w-0 flex-1 truncate">
                      {/* Product Name & Category */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white mr-1.5 truncate">
                          {product.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono bg-[#181d2c] px-1.5 py-0.2 rounded border border-[#232c40] shrink-0">
                          {product.category || 'পণ্য'}
                        </span>
                      </div>

                      {/* Date and Time */}
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-gray-300 font-mono">
                          <Calendar className="w-2.5 h-2.5 text-pink-400" />
                          {entryDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-pink-300 font-mono">
                          <Clock className="w-2.5 h-2.5 text-pink-400" />
                          {entryTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Entry & Stock Status */}
                  <div className="shrink-0 flex items-center gap-2.5 text-right">
                    <span className="text-[11px] font-mono font-bold text-pink-400">
                      {totalEntryPieces} পিস এন্ট্রি
                    </span>
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                        isOutOfStock
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : isLowStock
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      স্টক: {product.stock} পিস
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More Pagination (৫টি ৫টি করে কার্ড বৃদ্ধি পাবে) */}
          {productEntryStats.length > 5 && (
            <div className="pt-2 pb-1 flex flex-col items-center justify-center gap-2 border-t border-[#1a2030]/80">
              <div className="flex items-center justify-between w-full text-xs text-gray-400 px-1">
                <span>
                  প্রদর্শিত হচ্ছে: <strong className="text-white font-mono">{Math.min(visibleProductsCount, productEntryStats.length)}</strong> / <span className="font-mono">{productEntryStats.length}</span> টি কার্ড
                </span>
                {visibleProductsCount < productEntryStats.length ? (
                  <span className="text-pink-400 font-mono text-[11px]">
                    বাকি আছে {productEntryStats.length - visibleProductsCount}টি
                  </span>
                ) : (
                  <span className="text-emerald-400 text-[11px]">সবগুলো ({productEntryStats.length}টি) কার্ড দেখানো হয়েছে</span>
                )}
              </div>

              {visibleProductsCount < productEntryStats.length ? (
                <button
                  onClick={() => setVisibleProductsCount((prev) => prev + 5)}
                  className="w-full sm:w-auto px-5 py-2 bg-[#161a26] hover:bg-[#1f2538] text-pink-400 hover:text-pink-300 border border-pink-500/30 hover:border-pink-500/60 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 group"
                >
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                  <span>Show More (আরও ৫টি কার্ড দেখুন)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono">
                    +৫
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setVisibleProductsCount(5)}
                  className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 underline cursor-pointer py-1"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>কমিয়ে প্রথম ৫টিতে আনুন</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ক্যান্সার ও রিটার্ন চেক দিয়ে আলাদা আলাদা চিকন কার্ড (Sheet 3 এর অর্ডারের মতো) */}
      {activeTab === 'cancel_returns' && (
        <div className="space-y-2">
          {cancelReturnOrders.length === 0 ? (
            <div className="bg-[#12151f] border border-[#1e2436] rounded-xl p-8 text-center text-gray-400 text-xs">
              কোনো ক্যান্সেল বা রিটার্ন অর্ডার পাওয়া যায়নি।
            </div>
          ) : (
            <>
              {/* Bulk Action Bar if pending returns exist */}
              {pendingReturnsCount > 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-rose-500/10 border border-amber-500/20 rounded-xl p-2.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>{pendingReturnsCount}</strong> টি রিটার্ন অনুমোদন ও স্টকে ব্যাক অপেক্ষমান
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      cancelReturnOrders.filter((o) => !o.returnApproved).forEach((ord) => {
                        onApproveCancelReturn(ord, true);
                      });
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>সব একসাথে চেক ও রিস্টক করুন</span>
                  </button>
                </div>
              )}

              {/* Individual Slim Return Cards */}
              <div className="space-y-1.5">
                {cancelReturnOrders.slice(0, visibleReturnsCount).map((order, idx) => {
                  const isApproved = Boolean(order.returnApproved);
                  const orderQty = order.quantity || 1;
                  const { date: retDate, time: retTime } = getFormattedDateTime(order.date, order.id);

                  return (
                    <div
                      key={order.rowIndex ? `ret-row-${order.rowIndex}-${idx}` : `ret-${order.id}-${idx}`}
                      className={`bg-[#12151f] hover:bg-[#151926] border rounded-xl p-2.5 sm:px-3 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 transition-all ${
                        isApproved
                          ? 'border-emerald-500/30 opacity-90'
                          : 'border-rose-500/30 hover:border-pink-500/50'
                      }`}
                    >
                      {/* Left: Check Button / Status */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {isApproved ? (
                          <div
                            className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm"
                            title="রিটার্ন অনুমোদিত ও স্টকে যুক্ত"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <button
                            onClick={() => onApproveCancelReturn(order, true)}
                            className="w-6 h-6 rounded-md bg-amber-500/20 hover:bg-emerald-600 text-amber-300 hover:text-white border border-amber-500/40 hover:border-emerald-500 flex items-center justify-center shrink-0 transition-all cursor-pointer group/btn"
                            title="চেক দিয়ে রিটার্ন অনুমোদন ও স্টকে ফেরত যোগ করুন"
                          >
                            <Check className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform stroke-[2.5]" />
                          </button>
                        )}

                        {/* Order Info & Product */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <span className="font-mono text-xs sm:text-sm font-bold text-white">
                              #{order.id}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-xs font-semibold text-gray-200 truncate">
                              {order.customerName || 'গ্রাহক'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
                              ({order.customerPhone || 'ফোন নেই'})
                            </span>
                          </div>

                          {/* Product & Entered pieces & Date / Time */}
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 flex-wrap">
                            <span className="text-pink-300 font-medium truncate">
                              পণ্য: {order.product || order.variant || 'Golden Watch Combo'}
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="text-white font-mono font-bold">
                              এন্ট্রি: {orderQty} পিস
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="flex items-center gap-1 text-gray-300 font-mono">
                              <Calendar className="w-2.5 h-2.5 text-rose-400" />
                              {retDate}
                            </span>
                            <span className="flex items-center gap-1 text-rose-300 font-mono">
                              <Clock className="w-2.5 h-2.5 text-rose-400" />
                              {retTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right / Bottom on Mobile: Check Approval Action & Amount */}
                      <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2 pt-1.5 sm:pt-0 border-t border-[#1a2030] sm:border-0">
                        <span className="font-mono font-bold text-xs text-gray-300">
                          ৳{order.total || order.amount || 599}
                        </span>

                        {isApproved ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold whitespace-nowrap flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>স্টকে ব্যাক (+{orderQty})</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onApproveCancelReturn(order, true)}
                            className="px-2.5 py-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>চেক এপ্রুভ (+{orderQty} স্টক)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show More Pagination for Cancel Returns */}
              {cancelReturnOrders.length > 5 && (
                <div className="pt-2 pb-1 flex flex-col items-center justify-center gap-2 border-t border-[#1a2030]/80">
                  <div className="flex items-center justify-between w-full text-xs text-gray-400 px-1">
                    <span>
                      প্রদর্শিত হচ্ছে: <strong className="text-white font-mono">{Math.min(visibleReturnsCount, cancelReturnOrders.length)}</strong> / <span className="font-mono">{cancelReturnOrders.length}</span> টি
                    </span>
                    {visibleReturnsCount < cancelReturnOrders.length ? (
                      <span className="text-rose-400 font-mono text-[11px]">
                        বাকি {cancelReturnOrders.length - visibleReturnsCount}টি
                      </span>
                    ) : (
                      <span className="text-emerald-400 text-[11px]">সবগুলো রিটার্ন দেখানো হয়েছে</span>
                    )}
                  </div>

                  {visibleReturnsCount < cancelReturnOrders.length ? (
                    <button
                      onClick={() => setVisibleReturnsCount((prev) => prev + 5)}
                      className="w-full sm:w-auto px-5 py-2 bg-[#161a26] hover:bg-[#1f2538] text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/60 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 group"
                    >
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                      <span>Show More (আরও ৫টি রিটার্ন দেখুন)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                        +৫
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setVisibleReturnsCount(5)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 underline cursor-pointer py-1"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>কমিয়ে প্রথম ৫টিতে আনুন</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* VIEW 3: সকল অর্ডার এন্ট্রি চিকন কার্ড (All Order Entries) */}
      {activeTab === 'all_entries' && (
        <div className="space-y-2">
          <div className="space-y-1.5">
            {orders.slice(0, visibleOrdersCount).map((order, idx) => {
              const isCancelled =
                (order.status || '').toLowerCase().includes('cancel') ||
                (order.status || '').toLowerCase().includes('return');
              const isDelivered = (order.status || '').toLowerCase().includes('deliv');
              const { date: ordDate, time: ordTime } = getFormattedDateTime(order.date, order.id);

              return (
                <div
                  key={order.rowIndex ? `ord-row-${order.rowIndex}-${idx}` : `ord-${order.id}-${idx}`}
                  className="bg-[#12151f] hover:bg-[#151926] border border-[#1e2436] rounded-xl px-3 py-2 flex items-center justify-between gap-2.5 transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                        isDelivered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isCancelled
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </div>

                    <div className="min-w-0 flex-1 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white mr-1.5">#{order.id}</span>
                        <span className="text-gray-300 font-medium mr-1.5 truncate">
                          {order.product || 'Golden Watch Combo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-gray-300 font-mono">
                          <Calendar className="w-2.5 h-2.5 text-pink-400" />
                          {ordDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-pink-300 font-mono">
                          <Clock className="w-2.5 h-2.5 text-pink-400" />
                          {ordTime}
                        </span>
                        <span>•</span>
                        <span className="truncate text-gray-300">{order.customerName || 'গ্রাহক'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2.5 text-right">
                    <span className="text-[11px] font-mono font-bold text-pink-400">
                      {order.quantity || 1} পিস এন্ট্রি
                    </span>
                    <span className="font-mono text-white font-bold">
                      ৳{order.total || order.amount || 599}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More Pagination for Orders */}
          {orders.length > 5 && (
            <div className="pt-2 pb-1 flex flex-col items-center justify-center gap-2 border-t border-[#1a2030]/80">
              <div className="flex items-center justify-between w-full text-xs text-gray-400 px-1">
                <span>
                  প্রদর্শিত হচ্ছে: <strong className="text-white font-mono">{Math.min(visibleOrdersCount, orders.length)}</strong> / <span className="font-mono">{orders.length}</span> টি
                </span>
                {visibleOrdersCount < orders.length ? (
                  <span className="text-pink-400 font-mono text-[11px]">
                    বাকি {orders.length - visibleOrdersCount}টি
                  </span>
                ) : (
                  <span className="text-emerald-400 text-[11px]">সবগুলো ({orders.length}টি) অর্ডার দেখানো হয়েছে</span>
                )}
              </div>

              {visibleOrdersCount < orders.length ? (
                <button
                  onClick={() => setVisibleOrdersCount((prev) => prev + 5)}
                  className="w-full sm:w-auto px-5 py-2 bg-[#161a26] hover:bg-[#1f2538] text-pink-400 hover:text-pink-300 border border-pink-500/30 hover:border-pink-500/60 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 group"
                >
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                  <span>Show More (আরও ৫টি অর্ডার দেখুন)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono">
                    +৫
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setVisibleOrdersCount(5)}
                  className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 underline cursor-pointer py-1"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>কমিয়ে প্রথম ৫টিতে আনুন</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
