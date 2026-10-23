import * as XLSX from 'xlsx';
import { Product, StockAudit, Transaction, StockAlert, DashboardSummary } from '../types/warehouse';

/**
 * Format currency to VND string
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Helper to download workbook in browser
 */
function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  XLSX.writeFile(workbook, fileName);
}

/**
 * 1. Xuất báo cáo tồn kho hiện tại ra file Excel (.xlsx)
 */
export function exportInventoryToExcel(products: Product[]) {
  const data = products.map((p, index) => {
    let statusText = 'Còn hàng';
    if (p.quantity === 0) statusText = 'Hết hàng';
    else if (p.quantity <= p.minThreshold) statusText = 'Sắp hết hàng (Nguy cơ)';
    else if (p.quantity >= p.maxThreshold) statusText = 'Tồn kho cao';

    return {
      'STT': index + 1,
      'Mã SKU': p.sku,
      'Mã vạch (Barcode)': p.barcode,
      'Tên sản phẩm': p.name,
      'Danh mục': p.category,
      'Đơn vị tính': p.unit,
      'Vị trí kho': p.location,
      'Tồn kho hiện tại': p.quantity,
      'Định mức tối thiểu': p.minThreshold,
      'Định mức tối đa': p.maxThreshold,
      'Giá vốn (VNĐ)': p.costPrice,
      'Giá bán đề xuất (VNĐ)': p.sellingPrice,
      'Tổng giá trị tồn kho (VNĐ)': p.quantity * p.costPrice,
      'Nhà cung cấp': p.supplier,
      'Hạn sử dụng': p.expiryDate || 'N/A',
      'Trạng thái': statusText,
      'Cập nhật lần cuối': p.updatedAt,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  // Auto-fit column widths
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // SKU
    { wch: 18 }, // Barcode
    { wch: 35 }, // Ten sp
    { wch: 22 }, // Danh muc
    { wch: 12 }, // DVT
    { wch: 18 }, // Vi tri
    { wch: 16 }, // Ton kho
    { wch: 16 }, // Min
    { wch: 16 }, // Max
    { wch: 15 }, // Gia von
    { wch: 18 }, // Gia ban
    { wch: 22 }, // Tong gia tri
    { wch: 25 }, // NCC
    { wch: 15 }, // HSD
    { wch: 20 }, // Trang thai
    { wch: 18 }, // Cap nhat
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bao_Cao_Ton_Kho');

  const todayStr = new Date().toISOString().split('T')[0];
  downloadWorkbook(workbook, `Stockly_Bao_Cao_Ton_Kho_${todayStr}.xlsx`);
}

/**
 * 2. Xuất phiếu kiểm kê kho ra file Excel (.xlsx)
 * Bao gồm cột Tồn lý thuyết, cột Thực tế (để điền), Chênh lệch và Lý do giải trình
 */
export function exportAuditSheetToExcel(audit: StockAudit) {
  const data = audit.items.map((item, idx) => ({
    'STT': idx + 1,
    'Mã SKU': item.sku,
    'Tên hàng hóa': item.productName,
    'Đơn vị tính': item.unit,
    'Vị trí lưu kho': item.location,
    'Danh mục': item.category,
    'Tồn hệ thống (Sổ sách)': item.systemQty,
    'Tồn thực tế (Kiểm đếm)': item.actualQty !== null ? item.actualQty : '',
    'Chênh lệch (+Thừa / -Thiếu)': item.actualQty !== null ? item.difference : '',
    'Đơn giá vốn (VNĐ)': item.unitCost,
    'Giá trị chênh lệch (VNĐ)': item.actualQty !== null ? item.differenceValue : '',
    'Lý do / Ghi chú kiểm kê': item.reason || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 35 },
    { wch: 12 },
    { wch: 18 },
    { wch: 20 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
    { wch: 18 },
    { wch: 22 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Phieu_Kiem_Ke');

  const sanitizedCode = audit.code.replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadWorkbook(workbook, `Stockly_${sanitizedCode}_Kiem_Ke.xlsx`);
}

/**
 * 3. Xuất lịch sử giao dịch Nhập / Xuất kho
 */
export function exportTransactionsToExcel(transactions: Transaction[]) {
  const flattenedRows: Array<Record<string, string | number>> = [];

  transactions.forEach((tx) => {
    const typeLabel = tx.type === 'inbound' ? 'Nhập kho' : tx.type === 'outbound' ? 'Xuất kho' : 'Điều chỉnh';
    const statusLabel = tx.status === 'completed' ? 'Hoàn thành' : tx.status === 'pending_approval' ? 'Chờ duyệt' : 'Đã hủy';

    tx.items.forEach((item, itemIdx) => {
      flattenedRows.push({
        'Mã chứng từ': tx.code,
        'Loại giao dịch': typeLabel,
        'Ngày chứng từ': tx.date,
        'Đối tác (NCC/Khách)': tx.partner,
        'Lý do': tx.reason,
        'Kho hàng': tx.warehouse,
        'Người lập': tx.creator.name,
        'Trạng thái': statusLabel,
        'STT Mặt hàng': itemIdx + 1,
        'Mã SKU': item.sku,
        'Tên hàng': item.productName,
        'Đơn vị tính': item.unit,
        'Số lượng': item.quantity,
        'Đơn giá (VNĐ)': item.unitPrice,
        'Thành tiền (VNĐ)': item.total,
        'Ghi chú': tx.note || '',
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(flattenedRows);
  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 15 },
    { wch: 14 },
    { wch: 25 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 30 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 18 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhat_Ky_Nhap_Xuat');

  const todayStr = new Date().toISOString().split('T')[0];
  downloadWorkbook(workbook, `Stockly_Nhat_Ky_Nhap_Xuat_${todayStr}.xlsx`);
}

/**
 * 4. Xuất danh sách cảnh báo hàng sắp hết & hết hàng
 */
export function exportLowStockAlertsToExcel(alerts: StockAlert[]) {
  const data = alerts.map((a, idx) => ({
    'STT': idx + 1,
    'Mức độ': a.severity === 'critical' ? 'NGUY CẤP' : a.severity === 'warning' ? 'CẢNH BÁO' : 'THÔNG TIN',
    'Mã SKU': a.sku,
    'Tên sản phẩm': a.productName,
    'Tồn kho hiện tại': a.currentQty,
    'Định mức tối thiểu': a.minThreshold,
    'Đơn vị tính': a.unit,
    'Vị trí kho': a.location,
    'Nội dung cảnh báo': a.message,
    'Thời gian phát sinh': a.createdAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 14 },
    { wch: 35 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
    { wch: 35 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Canh_Bao_Ton_Kho');

  const todayStr = new Date().toISOString().split('T')[0];
  downloadWorkbook(workbook, `Stockly_Canh_Bao_Hang_Sap_Het_${todayStr}.xlsx`);
}

/**
 * 5. Xuất báo cáo tổng hợp tình hình kho hàng
 */
export function exportFullReportToExcel(summary: DashboardSummary, products: Product[]) {
  const summaryData = [
    { 'Chỉ tiêu': 'Tổng giá trị tồn kho', 'Giá trị': formatVND(summary.totalStockValue) },
    { 'Chỉ tiêu': 'Tổng số mặt hàng', 'Giá trị': `${summary.totalProductsCount} mã SKU` },
    { 'Chỉ tiêu': 'Tổng lượng hàng lưu kho', 'Giá trị': `${summary.totalUnitsCount} đơn vị` },
    { 'Chỉ tiêu': 'Số mặt hàng sắp hết', 'Giá trị': `${summary.lowStockCount} mặt hàng` },
    { 'Chỉ tiêu': 'Số mặt hàng đã hết kho', 'Giá trị': `${summary.outOfStockCount} mặt hàng` },
    { 'Chỉ tiêu': 'Giao dịch nhập kho trong tháng', 'Giá trị': `${summary.inboundTransactionsThisMonth} phiếu` },
    { 'Chỉ tiêu': 'Giao dịch xuất kho trong tháng', 'Giá trị': `${summary.outboundTransactionsThisMonth} phiếu` },
  ];

  const categoryData = summary.categoryDistribution.map((c) => ({
    'Danh mục': c.category,
    'Số mã sản phẩm': c.count,
    'Giá trị tồn kho (VNĐ)': c.value,
    'Tỷ trọng (%)': `${c.percentage.toFixed(1)}%`,
  }));

  const workbook = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 32 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Tong_Quan_Chi_Tieu');

  const wsCategory = XLSX.utils.json_to_sheet(categoryData);
  wsCategory['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 24 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, wsCategory, 'Phan_Bo_Nganh_Hang');

  const todayStr = new Date().toISOString().split('T')[0];
  downloadWorkbook(workbook, `Stockly_Bao_Cao_Tong_Hop_${todayStr}.xlsx`);
}
