import React from 'react';
import {
  Package,
  Plus,
  RefreshCw,
  Boxes,
} from 'lucide-react';
import { Order, OrderStatus, Product, StockMovementLog } from '../types';
import { INITIAL_DAILY_TREND } from '../data/initialOrders';
import { StockManagerHome } from './StockManagerHome';

interface DashboardHomeProps {
  orders: Order[];
  onNavigateToOrders: () => void;
  onOpenNewOrder: () => void;
  onSyncSheet: () => void;
  isSyncing: boolean;
  onSelectOrder: (order: Order) => void;
  onUpdateOrderStatus: (order: Order, newStatus: OrderStatus) => void;
  // Stock management & Cancel Return Approval
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: number, reason?: StockMovementLog['reason'], orderId?: string) => void;
  onApproveCancelReturn: (order: Order, restock: boolean) => void;
  stockLogs: StockMovementLog[];
  onAddProduct?: (newProduct: Omit<Product, 'rowIndex'>) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  orders,
  onOpenNewOrder,
  onSyncSheet,
  isSyncing,
  products,
  onUpdateProductStock,
  onApproveCancelReturn,
  stockLogs,
  onAddProduct,
}) => {
  // Exactly 6 product cards for the 6 products from Sheet 3
  const sixProducts = products.slice(0, 6);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-20 sm:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
            মাই ব্যবসা ড্যাশবোর্ড
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            আজকের ব্যবসার সামগ্রিক বিক্রয়, পণ্য স্টক ও অর্ডার পরিসংখ্যান
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onSyncSheet}
            disabled={isSyncing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2.5 rounded-xl bg-[#171b26] hover:bg-[#202636] border border-[#262f44] text-gray-200 text-xs sm:text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'Sync Sheet'}</span>
          </button>

          <button
            onClick={onOpenNewOrder}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-pink-600/30 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>+ New Order</span>
          </button>
        </div>
      </div>

      {/* Top 6 Product Stock Cards Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-pink-400" />
          <span className="text-xs sm:text-sm font-bold text-white">
            পণ্য স্টক কার্ড (৬টি প্রোডাক্টের লাইভ স্টক)
          </span>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
          Sheet 3 Live
        </span>
      </div>

      {/* Exactly 6 Product Stock Cards (No +/- buttons, live stock from Sheet 3) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {sixProducts.map((prod, idx) => {
          const isLowStock = prod.stock > 0 && prod.stock <= 5;
          const isOutOfStock = prod.stock <= 0;

          return (
            <div
              key={`dash-prod-${prod.id}-${idx}`}
              className={`bg-[#12151f] border rounded-2xl p-3 sm:p-3.5 relative overflow-hidden group transition-all flex flex-col justify-between ${
                isOutOfStock
                  ? 'border-rose-500/40 hover:border-rose-500/70'
                  : isLowStock
                  ? 'border-amber-500/40 hover:border-amber-500/70'
                  : 'border-[#1e2436] hover:border-pink-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <span
                    className="text-xs font-bold text-white tracking-tight line-clamp-1 group-hover:text-pink-300 transition-colors"
                    title={prod.name}
                  >
                    {prod.name}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-baseline gap-1">
                    <span
                      className={
                        isOutOfStock
                          ? 'text-rose-400'
                          : isLowStock
                          ? 'text-amber-400'
                          : 'text-pink-500'
                      }
                    >
                      {prod.stock}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-300">পিস</span>
                  </div>

                  <p
                    className={`text-[10px] mt-1 font-semibold flex items-center gap-1 ${
                      isOutOfStock
                        ? 'text-rose-400'
                        : isLowStock
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>
                      {isOutOfStock
                        ? 'স্টক শেষ'
                        : isLowStock
                        ? 'কম স্টক'
                        : 'মজুদ স্টক'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#1c2232] flex items-center justify-between text-[10px] text-gray-500">
                <span className="truncate">{prod.category || 'পণ্য'}</span>
                <span className="text-pink-400 font-mono font-semibold">
                  ৳{prod.salePrice || prod.regularPrice || 599}
                </span>
              </div>

              <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* দৈনিক অর্ডারের গ্রাফ (Full Width Graph) */}
      <div className="w-full bg-[#12151f] border border-[#1e2436] rounded-2xl p-4 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                দৈনিক অর্ডারের গ্রাফ
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                সপ্তাহের দিন অনুযায়ী মোট অর্ডারের পরিমাণ
              </p>
            </div>
            <span className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium">
              এই সপ্তাহ
            </span>
          </div>

          {/* Neon Bar Graph */}
          <div className="relative pt-4 sm:pt-6 pb-2">
            {/* Y Axis Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] sm:text-[11px] text-gray-600 pr-2">
              <div className="border-b border-gray-800/80 pb-0.5 flex justify-between">
                <span>80</span>
              </div>
              <div className="border-b border-gray-800/80 pb-0.5 flex justify-between">
                <span>60</span>
              </div>
              <div className="border-b border-gray-800/80 pb-0.5 flex justify-between">
                <span>40</span>
              </div>
              <div className="border-b border-gray-800/80 pb-0.5 flex justify-between">
                <span>20</span>
              </div>
              <div className="border-b border-gray-800/80 pb-0.5 flex justify-between">
                <span>0</span>
              </div>
            </div>

            {/* Bars container */}
            <div className="relative z-10 flex items-end justify-between h-44 sm:h-52 px-2 sm:px-6 pt-4">
              {INITIAL_DAILY_TREND.map((item, index) => {
                const maxVal = 80;
                const heightPercent = Math.min(100, Math.round((item.orders / maxVal) * 100));
                const isHighlight = index === 2 || index === 4;

                return (
                  <div
                    key={`trend-${item.day}-${index}`}
                    className="flex flex-col items-center flex-1 group cursor-pointer"
                  >
                    <div className="relative w-full flex flex-col items-center">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-pink-950/90 text-pink-300 text-[10px] px-1.5 py-0.5 rounded border border-pink-500/40 pointer-events-none whitespace-nowrap z-20">
                        {item.orders} টি
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-5 sm:w-10 rounded-t-lg transition-all duration-300 group-hover:scale-y-105 ${
                          isHighlight
                            ? 'bg-gradient-to-t from-pink-700 via-rose-500 to-pink-400 shadow-lg shadow-pink-500/30 neon-pink-glow'
                            : 'bg-gradient-to-t from-gray-800 via-purple-900/60 to-purple-500/70'
                        }`}
                      />
                    </div>

                    {/* Day Label */}
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium mt-2">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-[#1c2232] flex items-center justify-between text-xs text-gray-400">
          <span>সর্বোচ্চ বিক্রি: <strong>বুধবার (৭৮ টি)</strong></span>
          <span className="text-pink-400 font-semibold">গড়: ৪৪ টি/দিন</span>
        </div>
      </div>

      {/* Stock Management & Cancel/Return Approval Section */}
      <div className="pt-2">
        <StockManagerHome
          products={products}
          orders={orders}
          onUpdateProductStock={onUpdateProductStock}
          onApproveCancelReturn={onApproveCancelReturn}
          stockLogs={stockLogs}
          onAddProduct={onAddProduct}
        />
      </div>
    </div>
  );
};
