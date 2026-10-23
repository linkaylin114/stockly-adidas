import React, { useState } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Eye,
  Barcode,
  MapPin,
  X,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Building2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Product, User, StockStatus } from '../types/warehouse';
import { formatVND, exportInventoryToExcel } from '../utils/excel';
import { CurrencyInput } from './CurrencyInput';
import { ImageUploadField } from './ImageUploadField';
import { DEFAULT_LOCATIONS, DEFAULT_SUPPLIERS } from '../data/warehouseConfig';
import {
  generateUniqueSku,
  generateUniqueBarcode,
  isSkuDuplicate,
  isBarcodeDuplicate,
} from '../utils/codeGenerator';

interface ProductsViewProps {
  products: Product[];
  currentUser: User;
  onAddProduct: (prod: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, prod: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onOpenQuickScan: () => void;
  onQuickInbound: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  currentUser,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onOpenQuickScan,
  onQuickInbound,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    category: 'Originals / Phong cách sống',
    unit: 'Đôi',
    location: DEFAULT_LOCATIONS[0],
    quantity: 12,
    minThreshold: 10,
    maxThreshold: 60,
    costPrice: 1620000,
    sellingPrice: 2700000,
    supplier: DEFAULT_SUPPLIERS[0],
    imageUrl: '',
    expiryDate: '',
  });

  // Extract unique categories
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.supplier.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'out_of_stock') matchesStatus = p.quantity === 0;
    else if (selectedStatus === 'low_stock') matchesStatus = p.quantity > 0 && p.quantity <= p.minThreshold;
    else if (selectedStatus === 'overstock') matchesStatus = p.quantity >= p.maxThreshold;
    else if (selectedStatus === 'in_stock') matchesStatus = p.quantity > p.minThreshold && p.quantity < p.maxThreshold;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAddModal = () => {
    if (!currentUser.permissions.canEditProduct) {
      alert('Tài khoản của bạn không có quyền thêm mới sản phẩm! Vui lòng liên hệ Quản lý kho hoặc Admin.');
      return;
    }
    const defaultCat = categories[0] || 'Originals / Phong cách sống';
    const autoSku = generateUniqueSku(defaultCat, products, '42');
    const autoBarcode = generateUniqueBarcode(products);

    setFormData({
      sku: autoSku,
      barcode: autoBarcode,
      name: '',
      category: defaultCat,
      unit: 'Đôi',
      location: DEFAULT_LOCATIONS[0],
      quantity: 12,
      minThreshold: 10,
      maxThreshold: 60,
      costPrice: 1600000,
      sellingPrice: 2600000,
      supplier: DEFAULT_SUPPLIERS[0],
      imageUrl: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=600&auto=format&fit=crop&q=80',
      expiryDate: '',
    });
    setIsAddModalOpen(true);
  };

  const handleRegenerateSku = () => {
    const newSku = generateUniqueSku(formData.category, products, '42');
    setFormData((prev) => ({ ...prev, sku: newSku }));
  };

  const handleRegenerateBarcode = () => {
    const newBarcode = generateUniqueBarcode(products);
    setFormData((prev) => ({ ...prev, barcode: newBarcode }));
  };

  const handleOpenEditModal = (p: Product) => {
    if (!currentUser.permissions.canEditProduct) {
      alert('Tài khoản của bạn không có quyền chỉnh sửa sản phẩm!');
      return;
    }
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      category: p.category,
      unit: p.unit,
      location: p.location,
      quantity: p.quantity,
      minThreshold: p.minThreshold,
      maxThreshold: p.maxThreshold,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      supplier: p.supplier,
      imageUrl: p.imageUrl || '',
      expiryDate: p.expiryDate || '',
    });
  };

  const isSkuDup = isSkuDuplicate(formData.sku, products, editingProduct?.id);
  const isBarcodeDup = isBarcodeDuplicate(formData.barcode, products, editingProduct?.id);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSkuDup) {
      alert(`Mã SKU "${formData.sku}" đã tồn tại trên một sản phẩm khác trong kho! Vui lòng chọn hoặc tự động tạo lại mã.`);
      return;
    }
    if (isBarcodeDup) {
      alert(`Mã vạch "${formData.barcode}" đã tồn tại trên một sản phẩm khác trong kho! Vui lòng chọn hoặc tự động tạo lại mã.`);
      return;
    }
    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, formData);
      setEditingProduct(null);
    } else {
      await onAddProduct(formData);
      setIsAddModalOpen(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!currentUser.permissions.canDeleteProduct) {
      alert('Chỉ Quản trị viên Cấp cao (Admin) mới có quyền xóa vĩnh viễn sản phẩm khỏi hệ thống!');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi kho hàng? Hành động này không thể hoàn tác.`)) {
      await onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Danh Mục Hàng Hóa &amp; Tồn Kho
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi vị trí lưu kho, định mức tối thiểu và quản lý xuất nhập tồn
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportInventoryToExcel(filteredProducts)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất Excel ({filteredProducts.length})
          </button>

          <button
            onClick={onOpenQuickScan}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
          >
            <Barcode className="w-4 h-4 text-indigo-600" />
            Quét mã
          </button>

          {currentUser.permissions.canEditProduct && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Thêm Hàng Hóa
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên giày (Samba, Ultraboost, Gazelle, Stan Smith...), SKU, barcode, size, kệ..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
            >
              <option value="all">Tất cả ngành hàng ({products.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter (Functional segmented tabs or select) */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
            >
              <option value="all">Mọi trạng thái tồn kho</option>
              <option value="out_of_stock">Đã hết hàng (0 tồn)</option>
              <option value="low_stock">Sắp hết hàng (Dưới mức min)</option>
              <option value="in_stock">Tồn kho an toàn</option>
              <option value="overstock">Tồn kho cao (Vượt mức max)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Counts */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100 flex-wrap">
          <span className="font-semibold text-slate-800">Hiển thị {filteredProducts.length} mặt hàng</span>
          <span aria-hidden="true">·</span>
          <span>{products.filter((p) => p.quantity === 0).length} hết hàng</span>
          <span aria-hidden="true">·</span>
          <span>{products.filter((p) => p.quantity > 0 && p.quantity <= p.minThreshold).length} sắp hết</span>
        </div>
      </div>

      {/* High-Density Data Grid (Desktop) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-16">Hình ảnh</th>
                <th className="py-3 px-3.5">Mã SKU / Barcode</th>
                <th className="py-3 px-3.5">Tên sản phẩm</th>
                <th className="py-3 px-3.5">Vị trí lưu kho</th>
                <th className="py-3 px-3.5 text-right">Tồn kho</th>
                <th className="py-3 px-3.5 text-right">Định mức Min</th>
                <th className="py-3 px-3.5 text-right">Giá vốn</th>
                <th className="py-3 px-3.5">Trạng thái</th>
                <th className="py-3 px-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">Không tìm thấy hàng hóa nào phù hợp tiêu chí!</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOut = p.quantity === 0;
                  const isLow = !isOut && p.quantity <= p.minThreshold;
                  const isOver = p.quantity >= p.maxThreshold;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => setViewingProduct(p)}
                          className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer"
                        >
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3.5 font-mono text-slate-600">
                        <div className="font-semibold text-slate-900">{p.sku}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          {p.barcode}
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>{p.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>ĐVT: {p.unit}</span>
                          {p.expiryDate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-amber-700">HSD: {p.expiryDate}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-slate-600">
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{p.location}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">
                          {p.supplier}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold">
                        <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}>
                          {p.quantity} {p.unit}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-500">
                        {p.minThreshold} {p.unit}
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-800">
                        {formatVND(p.costPrice)}
                      </td>

                      <td className="py-3 px-3.5">
                        {isOut ? (
                          <span className="text-rose-600 font-bold text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" />
                            Hết hàng (0)
                          </span>
                        ) : isLow ? (
                          <span className="text-amber-600 font-bold text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
                            Sắp hết hàng
                          </span>
                        ) : isOver ? (
                          <span className="text-blue-600 font-medium text-xs">Tồn kho cao</span>
                        ) : (
                          <span className="text-emerald-700 font-medium text-xs">An toàn</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {(isOut || isLow) && currentUser.permissions.canCreateTransaction && (
                            <button
                              onClick={() => onQuickInbound(p.id)}
                              title="Tạo phiếu nhập hàng cho sản phẩm này"
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors mr-1"
                            >
                              + Nhập
                            </button>
                          )}
                          <button
                            onClick={() => setViewingProduct(p)}
                            title="Xem chi tiết thẻ kho"
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {currentUser.permissions.canEditProduct && (
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              title="Chỉnh sửa sản phẩm"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {currentUser.permissions.canDeleteProduct && (
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              title="Xóa vĩnh viễn"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Touch Card List (Optimized for handheld scanning & warehouse operators) */}
      <div className="md:hidden space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Không có sản phẩm nào phù hợp!
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isOut = p.quantity === 0;
            const isLow = !isOut && p.quantity <= p.minThreshold;

            return (
              <div
                key={p.id}
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail Image */}
                  <div
                    onClick={() => setViewingProduct(p)}
                    className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0 cursor-pointer"
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 truncate">
                      <span>{p.sku}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{p.location.split('(')[0]}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 mt-0.5 line-clamp-2">
                      {p.name}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums text-base font-bold">
                      <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}>
                        {p.quantity} {p.unit}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Min: {p.minThreshold}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div className="text-slate-600 font-mono tabular-nums font-semibold">
                    {formatVND(p.costPrice)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(isOut || isLow) && currentUser.permissions.canCreateTransaction && (
                      <button
                        onClick={() => onQuickInbound(p.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-md"
                      >
                        + Nhập kho
                      </button>
                    )}
                    <button
                      onClick={() => setViewingProduct(p)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md"
                    >
                      Thẻ kho
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add / Edit Product */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Chỉnh Sửa Thông Tin Hàng Hóa' : 'Thêm Mới Hàng Hóa Vào Kho'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 my-4 text-xs">
              {/* Image Upload Component */}
              <ImageUploadField
                imageUrl={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                productName={formData.name}
              />

              {!editingProduct && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 bg-indigo-50/80 border border-indigo-200/70 rounded-xl text-indigo-950 text-[11px] leading-relaxed">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-indigo-900">Tính năng chống trùng Stockly: </span>
                    <span>Hệ thống tự động sinh <strong>Mã SKU</strong> và <strong>Mã vạch EAN-13</strong> độc nhất khi tạo mới. Bạn có thể bấm "Sinh mã mới" để thay đổi.</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Mã SKU / Size *</label>
                    <button
                      type="button"
                      onClick={handleRegenerateSku}
                      title="Tạo lại mã SKU mới không trùng lặp"
                      className="inline-flex items-center gap-1 text-[10.5px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sinh mã mới</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="VD: STK-OG-4291-42"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 font-mono text-xs ${
                      isSkuDup
                        ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-indigo-500 text-slate-900'
                    }`}
                  />
                  {isSkuDup ? (
                    <div className="flex items-center gap-1 text-[10.5px] text-rose-600 font-semibold mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Mã SKU đã trùng với hàng khác! Bấm "Sinh mã mới".</span>
                    </div>
                  ) : formData.sku ? (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Mã hợp lệ, không trùng</span>
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Mã vạch EAN (Barcode)</label>
                    <button
                      type="button"
                      onClick={handleRegenerateBarcode}
                      title="Tạo lại mã vạch EAN-13 mới không trùng"
                      className="inline-flex items-center gap-1 text-[10.5px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sinh mã mới</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="VD: 4066748231011"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 font-mono text-xs ${
                      isBarcodeDup
                        ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-indigo-500 text-slate-900'
                    }`}
                  />
                  {isBarcodeDup ? (
                    <div className="flex items-center gap-1 text-[10.5px] text-rose-600 font-semibold mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Mã vạch đã tồn tại! Bấm "Sinh mã mới".</span>
                    </div>
                  ) : formData.barcode ? (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Chuẩn EAN-13, không trùng</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên mẫu giày *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Giày adidas Samba OG Cloud White (Size 42)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân loại / Dòng giày *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormData((prev) => {
                        // If creating new and SKU hasn't been custom typed, adapt SKU prefix to category
                        if (!editingProduct && (prev.sku.startsWith('STK-') || prev.sku.startsWith('ADI-'))) {
                          const updatedSku = generateUniqueSku(newCat, products, '42');
                          return { ...prev, category: newCat, sku: updatedSku };
                        }
                        return { ...prev, category: newCat };
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Originals / Phong cách sống">Originals / Phong cách sống</option>
                    <option value="Chạy bộ (Running)">Chạy bộ (Running)</option>
                    <option value="Bóng đá (Football)">Bóng đá (Football)</option>
                    <option value="Thể thao & Tập luyện">Thể thao &amp; Tập luyện</option>
                    <option value="Dép & Sandal">Dép &amp; Sandal</option>
                    <option value="Ngoài trời (Outdoor & Terrex)">Ngoài trời (Outdoor &amp; Terrex)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đơn vị tính *</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Standardized Dropdowns for Location & Supplier (avoids typing errors & duplicates) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vị trí lưu kho (Kệ lưu trữ) *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                  >
                    {DEFAULT_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nhà cung cấp chính hãng *
                  </label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                  >
                    {DEFAULT_SUPPLIERS.map((sup) => (
                      <option key={sup} value={sup}>
                        {sup}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số lượng tồn</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngưỡng tối thiểu (Min)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-amber-700 tabular-nums font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngưỡng tối đa (Max)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxThreshold}
                    onChange={(e) => setFormData({ ...formData, maxThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                  />
                </div>
              </div>

              {/* Formatted Currency Inputs with Thousands Dots (e.g. 1.620.000 VNĐ) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Giá vốn nhập kho (VNĐ) *
                  </label>
                  <CurrencyInput
                    value={formData.costPrice}
                    onChange={(val) => setFormData({ ...formData, costPrice: val })}
                    className="bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">Đã định dạng phân cách hàng nghìn</div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Giá bán lẻ đề xuất (VNĐ) *
                  </label>
                  <CurrencyInput
                    value={formData.sellingPrice}
                    onChange={(val) => setFormData({ ...formData, sellingPrice: val })}
                    className="bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">Giá niêm yết chính thức</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-500">
                  {isSkuDup || isBarcodeDup ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Không thể lưu: Vui lòng sửa hoặc sinh mã không trùng
                    </span>
                  ) : (
                    <span className="text-slate-400">Tất cả thông tin hợp lệ</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSkuDup || isBarcodeDup || !formData.sku.trim() || !formData.name.trim()}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                      isSkuDup || isBarcodeDup || !formData.sku.trim() || !formData.name.trim()
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs hover:shadow-sm'
                    }`}
                  >
                    {editingProduct ? 'Lưu thay đổi' : 'Thêm vào kho'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Card Details Modal (Thẻ kho) */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Thẻ Kho Hàng Hóa</h2>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              {/* Product Image & Info Header */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex gap-3.5 items-start">
                <div className="w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 shadow-2xs">
                  {viewingProduct.imageUrl ? (
                    <img
                      src={viewingProduct.imageUrl}
                      alt={viewingProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-900 leading-snug">{viewingProduct.name}</div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 font-mono text-slate-600 text-[11px]">
                    <div>SKU: <span className="font-semibold text-slate-900">{viewingProduct.sku}</span></div>
                    <div>Barcode: <span className="font-semibold text-slate-900">{viewingProduct.barcode}</span></div>
                    <div className="col-span-2">Vị trí: <span className="font-semibold text-slate-900">{viewingProduct.location}</span></div>
                    <div className="col-span-2">Dòng: <span className="font-semibold text-slate-900">{viewingProduct.category}</span></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Tồn kho hiện tại</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {viewingProduct.quantity} {viewingProduct.unit}
                  </div>
                </div>
                <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200/60">
                  <div className="text-[10px] text-amber-800 uppercase">Định mức Min</div>
                  <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
                    {viewingProduct.minThreshold} {viewingProduct.unit}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Định mức Max</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {viewingProduct.maxThreshold} {viewingProduct.unit}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá vốn bình quân:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatVND(viewingProduct.costPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tổng giá trị tồn:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatVND(viewingProduct.quantity * viewingProduct.costPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nhà cung cấp:</span>
                  <span className="font-semibold text-slate-900">{viewingProduct.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cập nhật lúc:</span>
                  <span className="font-mono text-slate-600">{viewingProduct.updatedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {currentUser.permissions.canCreateTransaction && (
                <button
                  onClick={() => {
                    onQuickInbound(viewingProduct.id);
                    setViewingProduct(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Tạo phiếu nhập mặt hàng này
                </button>
              )}
              <button
                onClick={() => setViewingProduct(null)}
                className="ml-auto px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
