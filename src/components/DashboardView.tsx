import React from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  Barcode,
} from 'lucide-react';
import { Product, DashboardSummary, StockAlert, User } from '../types/warehouse';
import { formatVND, exportInventoryToExcel } from '../utils/excel';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  products: Product[];
  alerts: StockAlert[];
  currentUser: User;
  onNavigateTab: (tab: string) => void;
  onOpenAlertsModal: () => void;
  onCreateInboundForProduct: (productId?: string) => void;
  onCreateOutbound: () => void;
  onOpenQuickScan: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  products,
  alerts,
  currentUser,
  onNavigateTab,
  onOpenAlertsModal,
  onCreateInboundForProduct,
  onCreateOutbound,
  onOpenQuickScan,
}) => {
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' || a.severity === 'warning');

  const totalValue = summary ? summary.totalStockValue : products.reduce((s, p) => s + (p.quantity * p.costPrice), 0);
  const totalUnits = summary ? summary.totalUnitsCount : products.reduce((s, p) => s + p.quantity, 0);
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= p.minThreshold).length;

  return (
    <div className="space-y-6">
      {/* Welcome & Role Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Bảng Điều Khiển Quản Lý Kho
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Chào mừng, <strong className="text-slate-800">{currentUser.name}</strong></span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.roleTitle.split('(')[0].trim()}</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.warehouseAssigned}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportInventoryToExcel(products)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất Excel Tồn Kho
          </button>

          <button
            onClick={onOpenQuickScan}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
          >
            <Barcode className="w-4 h-4 text-indigo-600" />
            Quét Mã Vạch
          </button>

          {currentUser.permissions.canCreateTransaction && (
            <button
              onClick={() => onCreateInboundForProduct()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Tạo Phiếu Nhập Kho
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng giá trị tồn */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Tổng Giá Trị Tồn Kho</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatVND(totalValue)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span className="font-semibold text-slate-700">{products.length} mã giày &amp; size</span>
            <span aria-hidden="true">·</span>
            <span>{totalUnits.toLocaleString('vi-VN')} đôi lưu kho</span>
          </div>
        </div>

        {/* Card 2: Hàng sắp hết / Hết hàng (Cảnh báo thông minh) */}
        <div
          onClick={onOpenAlertsModal}
          className="bg-white p-4 rounded-xl border border-amber-200 hover:border-amber-300 cursor-pointer shadow-2xs transition-all hover:bg-amber-50/20"
        >
          <div className="flex items-center justify-between text-xs font-medium text-amber-800 mb-1">
            <span>Cảnh Báo Hàng Sắp Hết Size</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-600">
              {outOfStockCount + lowStockCount}
            </span>
            <span className="text-xs text-slate-500">mẫu giày cần nhập</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span className="text-rose-600 font-semibold">{outOfStockCount} hết hàng (0 đôi)</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 font-medium">{lowStockCount} dưới mức min</span>
          </div>
        </div>

        {/* Card 3: Nhập kho tháng này */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Lưu Chuyển Nhập Kho</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {summary?.inboundTransactionsThisMonth ?? 12} <span className="text-xs font-normal text-slate-500">phiếu nhập</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Đã nhập bổ sung 375 đôi giày chính hãng
          </div>
        </div>

        {/* Card 4: Xuất kho tháng này */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Lưu Chuyển Xuất Kho</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {summary?.outboundTransactionsThisMonth ?? 18} <span className="text-xs font-normal text-slate-500">phiếu xuất</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Tỷ lệ đáp ứng đơn hàng đại lý đạt 98.4%
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner (Real-time automatic warning) */}
      {criticalAlerts.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Cảnh Báo Tồn Kho Tự Động: Có {criticalAlerts.length} mặt hàng chạm ngưỡng nguy hiểm
                </h3>
                <p className="text-xs text-slate-600">
                  Hệ thống đề xuất lập phiếu nhập hàng ngay để không gián đoạn chuỗi cung ứng.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenAlertsModal}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800 self-start sm:self-auto"
            >
              Xem chi tiết tất cả ({alerts.length})
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick list of urgent items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {criticalAlerts.slice(0, 3).map((alert) => {
              const matchedProd = products.find((p) => p.id === alert.productId);
              return (
                <div
                  key={alert.id}
                  className="bg-white p-3 rounded-lg border border-rose-200 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                      {matchedProd?.imageUrl ? (
                        <img src={matchedProd.imageUrl} alt={alert.productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-slate-300 m-3" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 truncate">
                        {alert.productName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-rose-600 font-bold tabular-nums">
                          Tồn: {alert.currentQty} {alert.unit}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Min: {alert.minThreshold}</span>
                      </div>
                    </div>
                  </div>

                  {currentUser.permissions.canCreateTransaction && (
                    <button
                      onClick={() => onCreateInboundForProduct(alert.productId)}
                      className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                    >
                      Nhập
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2-Column Split: Inbound/Outbound Movement Trend & Category Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 7-Day Inbound vs Outbound Trend */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Biến Động Nhập - Xuất 7 Ngày Gần Nhất</h3>
              <p className="text-xs text-slate-500 mt-0.5">Đơn vị: Sản phẩm lưu chuyển hàng ngày</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                <span className="text-slate-600 font-medium">Nhập kho</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block" />
                <span className="text-slate-600 font-medium">Xuất kho</span>
              </div>
            </div>
          </div>

          {/* Simple Clean Bar Chart Representation */}
          <div className="mt-6 space-y-4">
            {(summary?.flowTrend ?? [
              { date: '17/10', inboundUnits: 45, outboundUnits: 30 },
              { date: '18/10', inboundUnits: 80, outboundUnits: 65 },
              { date: '19/10', inboundUnits: 20, outboundUnits: 40 },
              { date: '20/10', inboundUnits: 110, outboundUnits: 75 },
              { date: '21/10', inboundUnits: 60, outboundUnits: 90 },
              { date: '22/10', inboundUnits: 25, outboundUnits: 35 },
              { date: '23/10', inboundUnits: 50, outboundUnits: 22 },
            ]).map((d) => {
              const maxVal = 120;
              const inWidth = Math.min(100, (d.inboundUnits / maxVal) * 100);
              const outWidth = Math.min(100, (d.outboundUnits / maxVal) * 100);

              return (
                <div key={d.date} className="flex items-center gap-3 text-xs">
                  <span className="w-10 font-mono text-slate-500 shrink-0">{d.date}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${inWidth}%` }} />
                      <span className="text-[10px] font-mono text-emerald-700 font-medium tabular-nums">{d.inboundUnits}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${outWidth}%` }} />
                      <span className="text-[10px] font-mono text-indigo-700 font-medium tabular-nums">{d.outboundUnits}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng nhập tuần qua: 390 đơn vị</span>
            <span>Tổng xuất tuần qua: 357 đơn vị</span>
          </div>
        </div>

        {/* Right: Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Cơ Cấu Giá Trị Theo Ngành Hàng</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tỷ trọng vốn lưu động tại kho</p>
          </div>

          <div className="mt-4 space-y-3.5">
            {(summary?.categoryDistribution ?? []).slice(0, 5).map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate">{cat.category}</span>
                  <span className="font-mono tabular-nums text-slate-500">{cat.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-slate-800 h-full rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{cat.count} mã sản phẩm</span>
                  <span className="font-mono tabular-nums">{formatVND(cat.value)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('reports')}
              className="w-full py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              Xem toàn bộ báo cáo phân tích
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Workflow Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateTab('products')}
          className="text-left p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all shadow-2xs flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">Quản Lý Danh Mục Giày Dép</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Tra cứu SKU, mã vạch EAN, size giày (36-45), vị trí kệ lưu trữ và cập nhật định mức an toàn.
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('transactions')}
          className="text-left p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all shadow-2xs flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">Quy Trình Nhập - Xuất Giày</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Lập phiếu nhập xuất, kiểm tra tồn kho theo size trước khi xuất và in chứng từ giao nhận.
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('audit')}
          className="text-left p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all shadow-2xs flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">Kiểm Kê &amp; Xuất File Excel</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Tạo đợt kiểm đếm hộp giày thực tế, tính chênh lệch thừa/thiếu và cân bằng kho tự động.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
