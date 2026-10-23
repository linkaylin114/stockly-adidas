import React, { useState } from 'react';
import {
  ClipboardCheck,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Check,
  X,
  Barcode,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { StockAudit, AuditItem, User, Product } from '../types/warehouse';
import { formatVND, exportAuditSheetToExcel } from '../utils/excel';
import { DEFAULT_WAREHOUSES } from '../data/warehouseConfig';

interface AuditViewProps {
  audits: StockAudit[];
  products: Product[];
  currentUser: User;
  onCreateAudit: (data: any) => Promise<void>;
  onUpdateAudit: (id: string, data: any) => Promise<void>;
  onApplyAudit: (id: string) => Promise<void>;
  onOpenQuickScan: () => void;
}

export const AuditView: React.FC<AuditViewProps> = ({
  audits,
  products,
  currentUser,
  onCreateAudit,
  onUpdateAudit,
  onApplyAudit,
  onOpenQuickScan,
}) => {
  const [selectedAuditId, setSelectedAuditId] = useState<string>(audits[0]?.id || '');
  const [isNewAuditModalOpen, setIsNewAuditModalOpen] = useState(false);
  const [searchItemQuery, setSearchItemQuery] = useState('');

  // Form for creating new audit
  const [auditTitle, setAuditTitle] = useState('');
  const [warehouse, setWarehouse] = useState('Kho Tổng Miền Bắc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [auditorName, setAuditorName] = useState(currentUser.name);

  // Active selected audit
  const activeAudit = audits.find((a) => a.id === selectedAuditId) || audits[0];

  const handleOpenNewAudit = () => {
    if (!currentUser.permissions.canAudit) {
      alert('Tài khoản của bạn không có quyền tạo đợt kiểm kê!');
      return;
    }
    const todayStr = new Date().toLocaleDateString('vi-VN');
    setAuditTitle(`Kiểm kê định kỳ ngày ${todayStr}`);
    setWarehouse('Kho Tổng Miền Bắc');
    setSelectedCategory('all');
    setAuditorName(currentUser.name);
    setIsNewAuditModalOpen(true);
  };

  const handleCreateAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateAudit({
      title: auditTitle,
      warehouse,
      auditorName,
      categoryFilter: selectedCategory,
    });
    setIsNewAuditModalOpen(false);
  };

  const handleActualQtyChange = async (index: number, val: string) => {
    if (!activeAudit || activeAudit.status === 'completed') return;
    const num = val === '' ? null : Number(val);

    const updatedItems = [...activeAudit.items];
    updatedItems[index].actualQty = num;
    if (num !== null) {
      updatedItems[index].difference = num - updatedItems[index].systemQty;
      updatedItems[index].differenceValue = updatedItems[index].difference * updatedItems[index].unitCost;
      if (updatedItems[index].difference === 0) updatedItems[index].status = 'matched';
      else if (updatedItems[index].difference > 0) updatedItems[index].status = 'surplus';
      else updatedItems[index].status = 'shortage';
    } else {
      updatedItems[index].status = 'pending';
    }

    await onUpdateAudit(activeAudit.id, { items: updatedItems });
  };

  const handleReasonChange = async (index: number, reasonText: string) => {
    if (!activeAudit || activeAudit.status === 'completed') return;
    const updatedItems = [...activeAudit.items];
    updatedItems[index].reason = reasonText;
    await onUpdateAudit(activeAudit.id, { items: updatedItems });
  };

  const handleApplyReconciliation = async () => {
    if (!activeAudit) return;
    if (!currentUser.permissions.canReconcileAudit) {
      alert('Chỉ Quản lý kho hoặc Quản trị viên mới có thẩm quyền duyệt Cân bằng kho thực tế!');
      return;
    }

    const uncountedCount = activeAudit.items.filter((it) => it.actualQty === null).length;
    let confirmMsg = `Bạn có chắc chắn muốn CHỐT KIỂM KÊ và TỰ ĐỘNG CÂN BẰNG TỒN KHO theo số liệu thực tế?`;
    if (uncountedCount > 0) {
      confirmMsg += `\nLưu ý: Có ${uncountedCount} mặt hàng chưa được nhập số lượng đếm thực tế!`;
    }

    if (window.confirm(confirmMsg)) {
      await onApplyAudit(activeAudit.id);
    }
  };

  // Filter items in current audit
  const filteredAuditItems = activeAudit?.items.filter((it) => {
    const q = searchItemQuery.toLowerCase().trim();
    return !q || it.productName.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q) || it.location.toLowerCase().includes(q);
  }) || [];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Kiểm Kê Kho Hàng &amp; Đối Chiếu Excel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tạo bảng kiểm đếm thực tế, tính chênh lệch thừa/thiếu, xuất Excel và tự động cân bằng sổ sách
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeAudit && (
            <button
              onClick={() => exportAuditSheetToExcel(activeAudit)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Xuất Excel Kiểm Kê ({activeAudit.code})
            </button>
          )}

          {currentUser.permissions.canAudit && (
            <button
              onClick={handleOpenNewAudit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Tạo Đợt Kiểm Kê Mới
            </button>
          )}
        </div>
      </div>

      {/* Select Audit Session Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-600">Chọn đợt kiểm kê:</span>
          <div className="flex gap-1.5 flex-wrap">
            {audits.map((a) => {
              const isSelected = a.id === (activeAudit?.id || selectedAuditId);
              const isCompleted = a.status === 'completed';

              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedAuditId(a.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{a.code}</span>
                  <span className="text-[10px] ml-1.5 opacity-80">
                    {isCompleted ? '(Đã chốt)' : '(Đang đếm)'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {activeAudit && activeAudit.status !== 'completed' && currentUser.permissions.canReconcileAudit && (
          <button
            onClick={handleApplyReconciliation}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            Chốt &amp; Cân Bằng Tồn Kho
          </button>
        )}
      </div>

      {/* Audit Overview Metrics */}
      {activeAudit && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500">Tồn sổ sách (Lý thuyết)</div>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {activeAudit.totalSystemQty} <span className="text-xs font-normal text-slate-500">đơn vị</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">{activeAudit.items.length} mặt hàng</div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500">Thực tế đã đếm</div>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {activeAudit.totalActualQty} <span className="text-xs font-normal text-slate-500">đơn vị</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Đã kiểm {activeAudit.items.filter((it) => it.actualQty !== null).length}/{activeAudit.items.length}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500">Chênh lệch số lượng</div>
            <div
              className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                activeAudit.totalDifferenceQty === 0
                  ? 'text-emerald-600'
                  : activeAudit.totalDifferenceQty < 0
                  ? 'text-rose-600'
                  : 'text-amber-600'
              }`}
            >
              {activeAudit.totalDifferenceQty > 0 ? `+${activeAudit.totalDifferenceQty}` : activeAudit.totalDifferenceQty}
              <span className="text-xs font-normal text-slate-500 ml-1">đơn vị</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {activeAudit.totalDifferenceQty === 0 ? 'Khớp hoàn toàn' : activeAudit.totalDifferenceQty < 0 ? 'Hụt tồn kho' : 'Dư thừa tồn'}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500">Giá trị chênh lệch (VND)</div>
            <div
              className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                activeAudit.totalDifferenceValue === 0
                  ? 'text-emerald-600'
                  : activeAudit.totalDifferenceValue < 0
                  ? 'text-rose-600'
                  : 'text-amber-600'
              }`}
            >
              {formatVND(activeAudit.totalDifferenceValue)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {activeAudit.status === 'completed' ? 'Đã hoàn tất cân bằng' : 'Đang trong phiên'}
            </div>
          </div>
        </div>
      )}

      {/* Counting Table */}
      {activeAudit && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          {/* Table Header Filter & Search */}
          <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="relative sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchItemQuery}
                onChange={(e) => setSearchItemQuery(e.target.value)}
                placeholder="Tìm sản phẩm cần kiểm đếm..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="text-xs text-slate-500">
              <span>Người kiểm kê: <strong>{activeAudit.auditorName}</strong></span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>Trạng thái: <strong>{activeAudit.status === 'completed' ? 'Đã chốt sổ' : 'Đang đếm hàng'}</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">Mặt hàng &amp; Vị trí</th>
                  <th className="py-3 px-3.5 text-right">Tồn hệ thống</th>
                  <th className="py-3 px-3.5 text-right w-36">Thực tế đếm</th>
                  <th className="py-3 px-3.5 text-right">Chênh lệch</th>
                  <th className="py-3 px-3.5 text-right">Giá trị (+ / -)</th>
                  <th className="py-3 px-3.5">Lý do giải trình kiểm kê</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditItems.map((item, idx) => {
                  const hasCounted = item.actualQty !== null;
                  const isShortage = hasCounted && item.difference < 0;
                  const isSurplus = hasCounted && item.difference > 0;
                  const isMatched = hasCounted && item.difference === 0;

                  return (
                    <tr key={item.productId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                          <span>{item.sku}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.location}</span>
                          <span aria-hidden="true">·</span>
                          <span>ĐVT: {item.unit}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold text-slate-700">
                        {item.systemQty} {item.unit}
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        {activeAudit.status === 'completed' ? (
                          <span className="font-mono tabular-nums font-bold text-slate-900">
                            {item.actualQty ?? '—'} {item.unit}
                          </span>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            placeholder="Nhập số đếm..."
                            value={item.actualQty ?? ''}
                            onChange={(e) => handleActualQtyChange(idx, e.target.value)}
                            className="w-28 px-2.5 py-1 text-right bg-white border border-slate-300 rounded-md font-mono tabular-nums font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold">
                        {!hasCounted ? (
                          <span className="text-slate-400 font-normal">Chưa đếm</span>
                        ) : isMatched ? (
                          <span className="text-emerald-600">Khớp (0)</span>
                        ) : isShortage ? (
                          <span className="text-rose-600">{item.difference} {item.unit}</span>
                        ) : (
                          <span className="text-amber-600">+{item.difference} {item.unit}</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                        {!hasCounted ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span
                            className={
                              isShortage
                                ? 'text-rose-600 font-semibold'
                                : isSurplus
                                ? 'text-amber-600 font-semibold'
                                : 'text-slate-600'
                            }
                          >
                            {formatVND(item.differenceValue)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5">
                        {activeAudit.status === 'completed' ? (
                          <span className="text-slate-600 italic">{item.reason || 'Không có ghi chú'}</span>
                        ) : (
                          <input
                            type="text"
                            placeholder="Lý do chênh lệch (nếu có)..."
                            value={item.reason || ''}
                            onChange={(e) => handleReasonChange(idx, e.target.value)}
                            className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Create New Audit */}
      {isNewAuditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                Khởi Tạo Đợt Kiểm Kê Mới
              </h2>
              <button
                onClick={() => setIsNewAuditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAuditSubmit} className="space-y-4 my-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề đợt kiểm kê *</label>
                <input
                  type="text"
                  required
                  value={auditTitle}
                  onChange={(e) => setAuditTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm kê định kỳ Cuối Tháng 10/2026..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kho hàng kiểm kê *</label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                  >
                    {DEFAULT_WAREHOUSES.map((wh) => (
                      <option key={wh} value={wh}>
                        {wh}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phạm vi ngành hàng</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Toàn bộ kho giày ({products.length} mẫu mã)</option>
                    <option value="Originals / Phong cách sống">Originals / Phong cách sống (Samba, Gazelle, Superstar...)</option>
                    <option value="Chạy bộ (Running)">Chạy bộ (Running - Ultraboost, Adizero...)</option>
                    <option value="Bóng đá (Football)">Bóng đá (Football - Predator...)</option>
                    <option value="Thể thao & Tập luyện">Thể thao &amp; Tập luyện (Training - Dropset...)</option>
                    <option value="Dép & Sandal">Dép &amp; Sandal (Adilette...)</option>
                    <option value="Ngoài trời (Outdoor & Terrex)">Ngoài trời (Terrex Trail...)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trưởng đoàn / Người phụ trách đếm</label>
                <input
                  type="text"
                  required
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAuditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Tạo Đợt Kiểm Kê
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
