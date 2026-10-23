import React from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  Package,
  Layers,
} from 'lucide-react';
import { Product, DashboardSummary, User } from '../types/warehouse';
import { formatVND, exportFullReportToExcel } from '../utils/excel';

interface ReportsViewProps {
  summary: DashboardSummary | null;
  products: Product[];
  currentUser: User;
  onNavigateTab: (tab: string) => void;
  onQuickInbound: (productId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  summary,
  products,
  currentUser,
  onNavigateTab,
  onQuickInbound,
}) => {
  const totalStockValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);

  // Forecast items running out soon
  const criticalDepletingItems = products
    .filter((p) => p.quantity <= p.minThreshold)
    .sort((a, b) => a.quantity - b.quantity);

  // Top valued items in inventory
  const topValuedItems = [...products]
    .map((p) => ({
      ...p,
      inventoryValue: p.quantity * p.costPrice,
    }))
    .sort((a, b) => b.inventoryValue - a.inventoryValue)
    .slice(0, 5);

  const handleExportFull = () => {
    if (!summary) return;
    exportFullReportToExcel(summary, products);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Báo Cáo Tồn Kho Tự Động &amp; Phân Tích Chu Kỳ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dự báo luân chuyển hàng hóa, theo dõi vốn tồn đọng và lập kế hoạch cung ứng tự động
          </p>
        </div>

        <div className="flex items-center gap-2">
          {summary && (
            <button
              onClick={handleExportFull}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Xuất File Excel Tổng Hợp
            </button>
          )}
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Tổng Giá Trị Vốn Tồn Kho</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatVND(totalStockValue)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Được phân bổ trên {products.length} mã sản phẩm chính
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Mặt Hàng Dưới Ngưỡng An Toàn</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 mt-1">
            {criticalDepletingItems.length}{' '}
            <span className="text-xs font-normal text-slate-500">mặt hàng</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Chiếm {(criticalDepletingItems.length / Math.max(1, products.length) * 100).toFixed(1)}% danh mục
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Hiệu Suất Lưu Chuyển Kho</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            96.8%
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Tỷ lệ đơn hàng giao đúng hạn &amp; đủ số lượng
          </div>
        </div>
      </div>

      {/* Depletion Forecast Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Dự Báo Hết Hàng &amp; Đề Xuất Bổ Sung Tự Động
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cảnh báo sớm các mặt hàng có nguy cơ đứt gãy tồn kho
            </p>
          </div>
          <span className="text-xs font-semibold text-rose-600">
            {criticalDepletingItems.length} mặt hàng cần nhập gấp
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3.5">Mã SKU</th>
                <th className="py-3 px-3.5">Tên sản phẩm</th>
                <th className="py-3 px-3.5">Vị trí kho</th>
                <th className="py-3 px-3.5 text-right">Tồn hiện tại</th>
                <th className="py-3 px-3.5 text-right">Mức tối thiểu</th>
                <th className="py-3 px-3.5 text-right">Đề xuất nhập thêm</th>
                <th className="py-3 px-3.5">Nhà cung cấp</th>
                <th className="py-3 px-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criticalDepletingItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Mọi mặt hàng đều đang duy trì trên mức tồn an toàn!
                  </td>
                </tr>
              ) : (
                criticalDepletingItems.map((p) => {
                  const suggestedReorder = Math.max(p.minThreshold * 2, p.maxThreshold - p.quantity);
                  const isZero = p.quantity === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3.5 font-mono text-slate-600 font-medium">{p.sku}</td>
                      <td className="py-3 px-3.5 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-3 px-3.5 text-slate-500">{p.location}</td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold">
                        <span className={isZero ? 'text-rose-600' : 'text-amber-600'}>
                          {p.quantity} {p.unit}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-500">
                        {p.minThreshold} {p.unit}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-emerald-700">
                        +{suggestedReorder} {p.unit}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 truncate max-w-[150px]">{p.supplier}</td>
                      <td className="py-3 px-3.5 text-right">
                        {currentUser.permissions.canCreateTransaction && (
                          <button
                            onClick={() => onQuickInbound(p.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
                          >
                            Lập phiếu nhập
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 5 Valued Inventory Items */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Top 5 Mặt Hàng Chiếm Tỷ Trọng Giá Trị Lớn Nhất
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hàng hóa giá trị cao cần được bảo quản và kiểm soát nghiêm ngặt
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Phân tích ABC</span>
        </div>

        <div className="mt-4 space-y-3">
          {topValuedItems.map((item, idx) => {
            const share = totalStockValue > 0 ? (item.inventoryValue / totalStockValue) * 100 : 0;
            return (
              <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    {idx + 1}
                  </div>
                  <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-4 h-4 text-slate-300 m-3" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                      SKU: {item.sku} · {item.location.split('(')[0]} · {item.quantity} {item.unit} x {formatVND(item.costPrice)}
                    </div>
                  </div>
                </div>

                <div className="text-right sm:self-auto self-end">
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {formatVND(item.inventoryValue)}
                  </div>
                  <div className="text-[11px] text-indigo-600 font-semibold font-mono">
                    Chiếm {share.toFixed(1)}% tổng giá trị kho
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
