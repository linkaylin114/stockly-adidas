import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  FileSpreadsheet,
  Printer,
  CheckCircle,
  Search,
  Trash2,
  X,
  Barcode,
  Clock,
  Check,
  Building,
  Image as ImageIcon,
} from 'lucide-react';
import { Transaction, Product, User, TransactionType } from '../types/warehouse';
import { formatVND, exportTransactionsToExcel } from '../utils/excel';
import { CurrencyInput } from './CurrencyInput';
import {
  DEFAULT_WAREHOUSES,
  DEFAULT_SUPPLIERS,
  DEFAULT_OUTBOUND_PARTNERS,
} from '../data/warehouseConfig';

interface TransactionsViewProps {
  transactions: Transaction[];
  products: Product[];
  currentUser: User;
  onCreateTransaction: (tx: any) => Promise<void>;
  onApproveTransaction: (id: string) => Promise<void>;
  onOpenQuickScan: () => void;
  initialType?: TransactionType;
  initialProductId?: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  products,
  currentUser,
  onCreateTransaction,
  onApproveTransaction,
  onOpenQuickScan,
  initialType,
  initialProductId,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [printingTransaction, setPrintingTransaction] = useState<Transaction | null>(null);

  // Form State
  const [formType, setFormType] = useState<TransactionType>(initialType || 'inbound');
  const [partner, setPartner] = useState(DEFAULT_SUPPLIERS[0]);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [warehouse, setWarehouse] = useState(DEFAULT_WAREHOUSES[0]);
  const [lineItems, setLineItems] = useState<
    Array<{
      productId: string;
      productName: string;
      sku: string;
      barcode: string;
      unit: string;
      location: string;
      imageUrl?: string;
      quantity: number;
      unitPrice: number;
      availableStock: number;
    }>
  >([]);

  // If initialProductId passed, trigger create modal with pre-selected product
  React.useEffect(() => {
    if (initialProductId) {
      const prod = products.find((p) => p.id === initialProductId);
      if (prod) {
        setFormType(initialType || 'inbound');
        setPartner(prod.supplier || DEFAULT_SUPPLIERS[0]);
        setWarehouse(DEFAULT_WAREHOUSES[0]);
        setReason('Nhập bổ sung khẩn cấp mẫu giày sắp hết size');
        setLineItems([
          {
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            barcode: prod.barcode,
            unit: prod.unit,
            location: prod.location,
            imageUrl: prod.imageUrl,
            quantity: Math.max(10, prod.minThreshold * 2),
            unitPrice: prod.costPrice,
            availableStock: prod.quantity,
          },
        ]);
        setIsCreateModalOpen(true);
      }
    }
  }, [initialProductId, initialType, products]);

  const handleOpenCreateModal = (type: TransactionType) => {
    if (!currentUser.permissions.canCreateTransaction) {
      alert('Tài khoản của bạn không có quyền lập phiếu nhập/xuất kho!');
      return;
    }
    setFormType(type);
    setPartner(type === 'inbound' ? DEFAULT_SUPPLIERS[0] : DEFAULT_OUTBOUND_PARTNERS[0]);
    setWarehouse(DEFAULT_WAREHOUSES[0]);
    setReason(type === 'inbound' ? 'Nhập bổ sung lô giày Originals & Running mới' : 'Xuất điều chuyển bổ sung cho đại lý bán lẻ');
    setNote('');

    // Default first product
    const firstProd = products[0];
    if (firstProd) {
      setLineItems([
        {
          productId: firstProd.id,
          productName: firstProd.name,
          sku: firstProd.sku,
          barcode: firstProd.barcode,
          unit: firstProd.unit,
          location: firstProd.location,
          imageUrl: firstProd.imageUrl,
          quantity: 5,
          unitPrice: type === 'inbound' ? firstProd.costPrice : firstProd.sellingPrice,
          availableStock: firstProd.quantity,
        },
      ]);
    } else {
      setLineItems([]);
    }
    setIsCreateModalOpen(true);
  };

  const handleAddLineItem = () => {
    const p = products[0];
    if (!p) return;
    setLineItems([
      ...lineItems,
      {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        barcode: p.barcode,
        unit: p.unit,
        location: p.location,
        imageUrl: p.imageUrl,
        quantity: 1,
        unitPrice: formType === 'inbound' ? p.costPrice : p.sellingPrice,
        availableStock: p.quantity,
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;

    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      barcode: p.barcode,
      unit: p.unit,
      location: p.location,
      imageUrl: p.imageUrl,
      unitPrice: formType === 'inbound' ? p.costPrice : p.sellingPrice,
      availableStock: p.quantity,
    };
    setLineItems(updated);
  };

  const handleQuantityChange = (index: number, val: number) => {
    const updated = [...lineItems];
    updated[index].quantity = Math.max(1, val);
    setLineItems(updated);
  };

  const handlePriceChange = (index: number, val: number) => {
    const updated = [...lineItems];
    updated[index].unitPrice = Math.max(0, val);
    setLineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      alert('Vui lòng thêm ít nhất 1 mặt hàng vào phiếu!');
      return;
    }

    // Validate outbound stock
    if (formType === 'outbound') {
      for (const item of lineItems) {
        if (item.quantity > item.availableStock) {
          alert(
            `Không đủ hàng để xuất cho "${item.productName}"!\nTồn kho hiện có: ${item.availableStock} ${item.unit}\nSố lượng yêu cầu xuất: ${item.quantity} ${item.unit}`
          );
          return;
        }
      }
    }

    const payload = {
      type: formType,
      partner,
      reason,
      warehouse,
      note,
      creator: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.roleTitle.split('(')[0].trim(),
      },
      items: lineItems.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        barcode: it.barcode,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        unit: it.unit,
        location: it.location,
      })),
    };

    await onCreateTransaction(payload);
    setIsCreateModalOpen(false);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tx.code.toLowerCase().includes(q) ||
      tx.partner.toLowerCase().includes(q) ||
      tx.reason.toLowerCase().includes(q) ||
      tx.creator.name.toLowerCase().includes(q) ||
      tx.items.some((it) => it.productName.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  const totalFormAmount = lineItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Nhập - Xuất Kho Hàng
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lập phiếu chứng từ, phê duyệt lưu chuyển và in phiếu bàn giao hàng hóa
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportTransactionsToExcel(filteredTransactions)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất Excel Nhật Ký
          </button>

          {currentUser.permissions.canCreateTransaction && (
            <>
              <button
                onClick={() => handleOpenCreateModal('inbound')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
              >
                <ArrowDownLeft className="w-4 h-4" />
                Lập Phiếu Nhập
              </button>

              <button
                onClick={() => handleOpenCreateModal('outbound')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
              >
                <ArrowUpRight className="w-4 h-4" />
                Lập Phiếu Xuất
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã chứng từ (PNK/PXK), đối tác, người lập, tên hàng..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
            >
              <option value="all">Tất cả giao dịch ({transactions.length})</option>
              <option value="inbound">Chỉ phiếu Nhập kho (PNK)</option>
              <option value="outbound">Chỉ phiếu Xuất kho (PXK)</option>
              <option value="adjustment">Phiếu điều chỉnh kiểm kê</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Không tìm thấy chứng từ nhập xuất nào!
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isInbound = tx.type === 'inbound';
            const isOutbound = tx.type === 'outbound';
            const isPending = tx.status === 'pending_approval';

            return (
              <div
                key={tx.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
              >
                {/* Transaction Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isInbound
                          ? 'bg-emerald-50 text-emerald-600'
                          : isOutbound
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {isInbound ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 font-mono">{tx.code}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isInbound
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOutbound
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isInbound ? 'NHẬP KHO' : isOutbound ? 'XUẤT KHO' : 'ĐIỀU CHỈNH'}
                        </span>
                        {isPending && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Chờ duyệt
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{tx.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>Đối tác: <strong className="text-slate-700">{tx.partner}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Người lập: {tx.creator.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Approve button for Manager/Admin */}
                    {isPending && currentUser.permissions.canApproveTransaction && (
                      <button
                        onClick={() => onApproveTransaction(tx.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Phê Duyệt
                      </button>
                    )}

                    {/* Print Preview Button */}
                    <button
                      onClick={() => setPrintingTransaction(tx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      In Phiếu
                    </button>
                  </div>
                </div>

                {/* Items in Transaction */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-400 font-semibold uppercase">
                      <tr>
                        <th className="pb-1.5">Sản phẩm</th>
                        <th className="pb-1.5">Mã SKU</th>
                        <th className="pb-1.5 text-right">Số lượng</th>
                        <th className="pb-1.5 text-right">Đơn giá</th>
                        <th className="pb-1.5 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {tx.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 font-medium text-slate-900">{it.productName}</td>
                          <td className="py-1.5 font-mono text-slate-500">{it.sku}</td>
                          <td className="py-1.5 text-right font-mono tabular-nums font-semibold">
                            {it.quantity} {it.unit}
                          </td>
                          <td className="py-1.5 text-right font-mono tabular-nums">{formatVND(it.unitPrice)}</td>
                          <td className="py-1.5 text-right font-mono tabular-nums font-bold text-slate-900">
                            {formatVND(it.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500 gap-1">
                  <div>
                    <span>Lý do: </span>
                    <strong className="text-slate-700">{tx.reason}</strong>
                    {tx.note && <span className="ml-2 italic text-slate-400">({tx.note})</span>}
                  </div>
                  <div className="text-right">
                    <span>Tổng giá trị chứng từ: </span>
                    <strong className="text-sm font-bold font-mono text-slate-900 ml-1">
                      {formatVND(tx.totalAmount)}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Create Transaction */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 text-slate-900 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {formType === 'inbound' ? (
                  <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-indigo-600" />
                )}
                <h2 className="text-base font-bold text-slate-900">
                  {formType === 'inbound' ? 'Lập Phiếu Nhập Kho Mới' : 'Lập Phiếu Xuất Kho Mới'}
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 my-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Standardized Partner / Supplier Dropdown */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {formType === 'inbound' ? 'Nhà cung cấp chính hãng *' : 'Đơn vị / Cửa hàng nhận hàng *'}
                  </label>
                  <select
                    required
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                  >
                    {formType === 'inbound'
                      ? DEFAULT_SUPPLIERS.map((sup) => (
                          <option key={sup} value={sup}>
                            {sup}
                          </option>
                        ))
                      : DEFAULT_OUTBOUND_PARTNERS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lý do nhập/xuất *</label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ví dụ: Nhập bổ sung định kỳ, Xuất giao cửa hàng..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Standardized Warehouse Dropdown (prevents manual typos and duplicate warehouses) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kho tiếp nhận / Xuất phát *
                </label>
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

              {/* Items Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Danh sách các mẫu giày &amp; đơn giá ({lineItems.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm mẫu giày
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {lineItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2.5 items-center"
                    >
                      {/* Product Selector with Image Thumbnail */}
                      <div className="col-span-12 sm:col-span-5 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Chọn mẫu giày</label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-800 truncate"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (Tồn: {p.quantity} {p.unit})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">
                          Số lượng ({item.unit})
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={formType === 'outbound' ? item.availableStock : undefined}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono tabular-nums font-bold text-center"
                        />
                      </div>

                      {/* Formatted Currency Input for Unit Price */}
                      <div className="col-span-5 sm:col-span-4">
                        <label className="text-[10px] text-slate-400 block mb-0.5">
                          Đơn giá ({formType === 'inbound' ? 'Giá vốn' : 'Giá xuất'})
                        </label>
                        <CurrencyInput
                          value={item.unitPrice}
                          onChange={(val) => handlePriceChange(idx, val)}
                          className="px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-mono tabular-nums font-bold text-slate-900"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-1 text-right">
                        <label className="text-[10px] text-slate-400 block mb-0.5">&nbsp;</label>
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {formType === 'outbound' && item.quantity > item.availableStock && (
                        <div className="col-span-12 text-[11px] text-rose-600 font-semibold">
                          Cảnh báo: Vượt quá số lượng tồn kho ({item.availableStock} {item.unit})!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú bổ sung</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú về tình trạng đóng gói, số xe vận chuyển..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Total & Submit */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500">Tổng tiền dự kiến: </span>
                  <span className="text-base font-bold font-mono text-slate-900 ml-1">
                    {formatVND(totalFormAmount)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {formType === 'inbound' ? 'Xác nhận Nhập kho' : 'Xác nhận Xuất kho'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Dialog (A4 / A5 receipt layout) */}
      {printingTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 text-slate-900 border border-slate-200">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
              <span className="font-bold text-sm">Xem trước bản in chứng từ</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In ngay (Ctrl+P)
                </button>
                <button
                  onClick={() => setPrintingTransaction(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="py-6 space-y-4 text-xs font-sans">
              <div className="text-center border-b border-slate-200 pb-4">
                <div className="text-lg font-bold uppercase tracking-wider text-slate-900">
                  {printingTransaction.type === 'inbound' ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO'}
                </div>
                <div className="font-mono text-slate-500 text-xs mt-0.5">Số: {printingTransaction.code}</div>
                <div className="text-[11px] text-slate-400 mt-1">Ngày lập: {printingTransaction.date}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>Kho hàng: <strong>{printingTransaction.warehouse}</strong></div>
                <div>Người lập: <strong>{printingTransaction.creator.name}</strong></div>
                <div>Đối tác: <strong>{printingTransaction.partner}</strong></div>
                <div>Lý do: <strong>{printingTransaction.reason}</strong></div>
              </div>

              <table className="w-full border border-slate-200 text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-600">
                  <tr>
                    <th className="p-2 border-r border-slate-200">STT</th>
                    <th className="p-2 border-r border-slate-200">Tên hàng hóa</th>
                    <th className="p-2 border-r border-slate-200">ĐVT</th>
                    <th className="p-2 border-r border-slate-200 text-right">SL</th>
                    <th className="p-2 border-r border-slate-200 text-right">Đơn giá</th>
                    <th className="p-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printingTransaction.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-200 font-semibold">{it.productName}</td>
                      <td className="p-2 border-r border-slate-200 text-center">{it.unit}</td>
                      <td className="p-2 border-r border-slate-200 text-right font-mono tabular-nums">{it.quantity}</td>
                      <td className="p-2 border-r border-slate-200 text-right font-mono tabular-nums">{formatVND(it.unitPrice)}</td>
                      <td className="p-2 text-right font-mono tabular-nums font-bold">{formatVND(it.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={5} className="p-2 text-right border-r border-slate-200">Tổng cộng thành tiền:</td>
                    <td className="p-2 text-right font-mono tabular-nums">{formatVND(printingTransaction.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-6 text-center text-[11px] text-slate-700">
                <div>
                  <div className="font-bold">Người lập phiếu</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                  <div className="h-16" />
                  <div className="font-medium">{printingTransaction.creator.name}</div>
                </div>
                <div>
                  <div className="font-bold">Người giao / nhận</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                  <div className="h-16" />
                  <div className="font-medium">{printingTransaction.partner}</div>
                </div>
                <div>
                  <div className="font-bold">Thủ kho / Quản lý</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký, đóng dấu)</div>
                  <div className="h-16" />
                  <div className="font-medium">
                    {printingTransaction.approver ? printingTransaction.approver.name : 'Trần Thị Mai'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
