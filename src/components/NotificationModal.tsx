import React from 'react';
import { X, AlertTriangle, AlertOctagon, Info, ArrowDownLeft, FileSpreadsheet } from 'lucide-react';
import { StockAlert } from '../types/warehouse';
import { exportLowStockAlertsToExcel } from '../utils/excel';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: StockAlert[];
  onCreateInboundForProduct: (productId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onCreateInboundForProduct,
}) => {
  if (!isOpen) return null;

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 text-slate-900 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Trung tâm Cảnh báo Tồn kho Tự động
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="text-rose-600 font-semibold">{criticalCount} hết hàng</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-600 font-semibold">{warningCount} sắp hết</span>
              <span aria-hidden="true">·</span>
              <span>Tổng cộng {alerts.length} cảnh báo</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLowStockAlertsToExcel(alerts)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Xuất Excel
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2.5 my-4 pr-1">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Kho hàng đang ở trạng thái an toàn!</p>
              <p className="text-xs text-slate-400 mt-1">Không có mặt hàng nào bị cạn kiệt hay sắp hết.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCritical
                      ? 'bg-rose-50/60 border-rose-200 text-slate-900'
                      : isWarning
                      ? 'bg-amber-50/60 border-amber-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {isCritical ? (
                          <AlertOctagon className="w-5 h-5 text-rose-600" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        ) : (
                          <Info className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                          <span>{alert.productName}</span>
                          <span className="text-xs font-mono text-slate-500">[{alert.sku}]</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1.5">
                          <span>Vị trí: {alert.location}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums font-semibold text-slate-800">
                            Tồn: {alert.currentQty} / Min: {alert.minThreshold} {alert.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {(isCritical || isWarning) && (
                      <button
                        onClick={() => {
                          onCreateInboundForProduct(alert.productId);
                          onClose();
                        }}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                        Nhập kho ngay
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Hệ thống tự động quét và cập nhật định kỳ mỗi khi có biến động kho.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
