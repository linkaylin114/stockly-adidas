import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// In-Memory Database for Stockly - Cửa Hàng Giày Dép adidas
interface ProductItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unit: string;
  location: string;
  quantity: number;
  minThreshold: number;
  maxThreshold: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  imageUrl?: string;
  expiryDate?: string;
  updatedAt: string;
}

let products: ProductItem[] = [
  {
    id: 'prod_shoe_001',
    sku: 'B75806-42',
    barcode: '4066748231011',
    name: 'Giày adidas Samba OG Cloud White / Core Black (Size 42)',
    category: 'Originals / Phong cách sống',
    unit: 'Đôi',
    location: 'Kệ A1 - T-Toe Classics (Samba / Gazelle)',
    quantity: 4, // SẮP HẾT HÀNG DO NHU CẦU CỰC CAO
    minThreshold: 15,
    maxThreshold: 80,
    costPrice: 1620000,
    sellingPrice: 2700000,
    supplier: 'adidas Vietnam Logistics Ltd.',
    imageUrl: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-23 09:15',
  },
  {
    id: 'prod_shoe_002',
    sku: 'B75807-39',
    barcode: '4066748231028',
    name: 'Giày adidas Samba OG Core Black / Footwear White (Size 39)',
    category: 'Originals / Phong cách sống',
    unit: 'Đôi',
    location: 'Kệ A1 - T-Toe Classics (Samba / Gazelle)',
    quantity: 0, // HẾT HÀNG
    minThreshold: 12,
    maxThreshold: 60,
    costPrice: 1620000,
    sellingPrice: 2700000,
    supplier: 'adidas Vietnam Logistics Ltd.',
    imageUrl: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-22 17:30',
  },
  {
    id: 'prod_shoe_003',
    sku: 'H06122-38',
    barcode: '4066748231035',
    name: 'Giày adidas Gazelle Indoor Shadow Navy / Gum (Size 38)',
    category: 'Originals / Phong cách sống',
    unit: 'Đôi',
    location: 'Kệ A1 - T-Toe Classics (Samba / Gazelle)',
    quantity: 6, // SẮP HẾT HÀNG
    minThreshold: 10,
    maxThreshold: 50,
    costPrice: 1740000,
    sellingPrice: 2900000,
    supplier: 'adidas Vietnam Logistics Ltd.',
    imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-23 08:45',
  },
  {
    id: 'prod_shoe_004',
    sku: 'IE1768-43',
    barcode: '4066748231042',
    name: 'Giày Chạy Bộ Nam adidas Ultraboost 5 Core Black (Size 43)',
    category: 'Chạy bộ (Running)',
    unit: 'Đôi',
    location: 'Kệ B1 - Boost Performance (Ultraboost 5 / Light)',
    quantity: 3, // SẮP HẾT HÀNG
    minThreshold: 10,
    maxThreshold: 45,
    costPrice: 2880000,
    sellingPrice: 4800000,
    supplier: 'adidas Performance Southeast Asia',
    imageUrl: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-22 14:20',
  },
  {
    id: 'prod_shoe_005',
    sku: 'GY9350-41',
    barcode: '4066748231059',
    name: 'Giày Chạy Bộ adidas Ultraboost Light Triple White (Size 41)',
    category: 'Chạy bộ (Running)',
    unit: 'Đôi',
    location: 'Kệ B1 - Boost Performance (Ultraboost 5 / Light)',
    quantity: 28,
    minThreshold: 8,
    maxThreshold: 50,
    costPrice: 2700000,
    sellingPrice: 4500000,
    supplier: 'adidas Performance Southeast Asia',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-21 11:10',
  },
  {
    id: 'prod_shoe_006',
    sku: 'HQ8708-40',
    barcode: '4066748231066',
    name: 'Giày adidas Campus 00s Core Black / White (Size 40)',
    category: 'Originals / Phong cách sống',
    unit: 'Đôi',
    location: 'Kệ A2 - Retro & Streetwear (Campus / Superstar)',
    quantity: 5, // SẮP HẾT HÀNG
    minThreshold: 12,
    maxThreshold: 65,
    costPrice: 1560000,
    sellingPrice: 2600000,
    supplier: 'adidas Vietnam Logistics Ltd.',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-23 07:40',
  },
  {
    id: 'prod_shoe_007',
    sku: 'FX5502-41',
    barcode: '4066748231073',
    name: 'Giày adidas Stan Smith Cổ Điển White / Green (Size 41)',
    category: 'Originals / Phong cách sống',
    unit: 'Đôi',
    location: 'Kệ A4 - Heritage Tennis (Stan Smith)',
    quantity: 42,
    minThreshold: 10,
    maxThreshold: 70,
    costPrice: 1440000,
    sellingPrice: 2400000,
    supplier: 'adidas Vietnam Logistics Ltd.',
    imageUrl: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-20 15:30',
  },
  {
    id: 'prod_shoe_008',
    sku: 'EG4958-42',
    barcode: '4066748231080',
    name: 'Giày adidas Superstar Mũi Vỏ Sò White / Black (Size 42)',
    category: 'Originals / Phong cách sống',
    unit: 'Đôi',
    location: 'Kệ A2 - Retro & Streetwear (Campus / Superstar)',
    quantity: 35,
    minThreshold: 10,
    maxThreshold: 60,
    costPrice: 1560000,
    sellingPrice: 2600000,
    supplier: 'adidas Vietnam Logistics Ltd.',
    imageUrl: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-21 09:20',
  },
  {
    id: 'prod_shoe_009',
    sku: 'HP9705-42',
    barcode: '4066748231097',
    name: 'Giày Chạy Đua Marathon adidas Adizero Adios Pro 3 (Size 42)',
    category: 'Chạy bộ (Running)',
    unit: 'Đôi',
    location: 'Kệ B2 - Elite Marathon Racing (Adizero Adios / Boston)',
    quantity: 2, // SẮP HẾT HÀNG
    minThreshold: 6,
    maxThreshold: 25,
    costPrice: 3800000,
    sellingPrice: 6200000,
    supplier: 'adidas Performance Southeast Asia',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-23 09:00',
  },
  {
    id: 'prod_shoe_010',
    sku: 'HP9756-41',
    barcode: '4066748231103',
    name: 'Giày Chạy Bộ Tập Luyện adidas Adizero Boston 12 (Size 41)',
    category: 'Chạy bộ (Running)',
    unit: 'Đôi',
    location: 'Kệ B2 - Elite Marathon Racing (Adizero Adios / Boston)',
    quantity: 19,
    minThreshold: 8,
    maxThreshold: 45,
    costPrice: 2280000,
    sellingPrice: 3800000,
    supplier: 'adidas Performance Southeast Asia',
    imageUrl: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-19 16:15',
  },
  {
    id: 'prod_shoe_011',
    sku: 'IG7724-42',
    barcode: '4066748231110',
    name: 'Giày Đá Bóng Sân Cỏ Tự Nhiên adidas Predator Elite FG (Size 42)',
    category: 'Bóng đá (Football)',
    unit: 'Đôi',
    location: 'Kệ C1 - Sân Cỏ Tự Nhiên & Nhân Tạo (Predator FG / TF)',
    quantity: 0, // HẾT HÀNG
    minThreshold: 5,
    maxThreshold: 30,
    costPrice: 3300000,
    sellingPrice: 5500000,
    supplier: 'adidas Football Asia Pacific',
    imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-22 18:00',
  },
  {
    id: 'prod_shoe_012',
    sku: 'IG5438-41',
    barcode: '4066748231127',
    name: 'Giày Đá Bóng Sân Cỏ Nhân Tạo adidas Predator Club TF (Size 41)',
    category: 'Bóng đá (Football)',
    unit: 'Đôi',
    location: 'Kệ C1 - Sân Cỏ Tự Nhiên & Nhân Tạo (Predator FG / TF)',
    quantity: 52,
    minThreshold: 15,
    maxThreshold: 90,
    costPrice: 1080000,
    sellingPrice: 1800000,
    supplier: 'adidas Football Asia Pacific',
    imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-21 14:00',
  },
  {
    id: 'prod_shoe_013',
    sku: 'AP9971-42',
    barcode: '4066748231134',
    name: 'Dép Quai Ngang adidas Adilette Comfort Cloudfoam Black/White (Size 42)',
    category: 'Dép & Sandal',
    unit: 'Đôi',
    location: 'Kệ D1 - Dép & Sandal Thể Thao (Adilette Cloudfoam / 22)',
    quantity: 110,
    minThreshold: 25,
    maxThreshold: 200,
    costPrice: 550000,
    sellingPrice: 950000,
    supplier: 'adidas Vietnam Logistics Ltd.',
    imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-20 10:15',
  },
  {
    id: 'prod_shoe_014',
    sku: 'HP6522-40',
    barcode: '4066748231141',
    name: 'Dép 3D Đúc Liền adidas Adilette 22 Desert Sand (Size 40)',
    category: 'Dép & Sandal',
    unit: 'Đôi',
    location: 'Kệ D1 - Dép & Sandal Thể Thao (Adilette Cloudfoam / 22)',
    quantity: 8, // SẮP HẾT HÀNG
    minThreshold: 12,
    maxThreshold: 60,
    costPrice: 840000,
    sellingPrice: 1400000,
    supplier: 'adidas Vietnam Logistics Ltd.',
    imageUrl: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-23 08:15',
  },
  {
    id: 'prod_shoe_015',
    sku: 'FY7756-42',
    barcode: '4066748231158',
    name: 'Giày Bóng Rổ Cổ Điển adidas Forum Low Classic White/Blue (Size 42)',
    category: 'Originals / Phong cách sống',
    unit: 'Đôi',
    location: 'Kệ A3 - Basketball & Heritage (Forum Low / NMD)',
    quantity: 26,
    minThreshold: 8,
    maxThreshold: 50,
    costPrice: 1560000,
    sellingPrice: 2600000,
    supplier: 'adidas Vietnam Logistics Ltd.',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-18 15:40',
  },
  {
    id: 'prod_shoe_016',
    sku: 'IG3450-42',
    barcode: '4066748231165',
    name: 'Giày Tập Gym / Cử Tạ adidas Dropset 3 Trainer Black/Orange (Size 42)',
    category: 'Thể thao & Tập luyện',
    unit: 'Đôi',
    location: 'Kệ C2 - Gym & Training (Dropset 3)',
    quantity: 18,
    minThreshold: 6,
    maxThreshold: 40,
    costPrice: 1920000,
    sellingPrice: 3200000,
    supplier: 'adidas Performance Southeast Asia',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-19 13:50',
  },
  {
    id: 'prod_shoe_017',
    sku: 'IG3215-43',
    barcode: '4066748231172',
    name: 'Giày Leo Núi Chống Nước adidas Terrex Free Hiker 2 GORE-TEX (Size 43)',
    category: 'Ngoài trời (Outdoor & Terrex)',
    unit: 'Đôi',
    location: 'Kệ E1 - Terrex Trail & Dã Ngoại (Free Hiker GORE-TEX)',
    quantity: 14,
    minThreshold: 5,
    maxThreshold: 35,
    costPrice: 3120000,
    sellingPrice: 5200000,
    supplier: 'adidas Terrex Outdoor Division',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    updatedAt: '2026-10-21 16:10',
  },
];

interface TransactionRecord {
  id: string;
  code: string;
  type: 'inbound' | 'outbound' | 'adjustment' | 'transfer';
  date: string;
  partner: string;
  reason: string;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    total: number;
    unit: string;
    location: string;
  }>;
  totalAmount: number;
  creator: {
    id: string;
    name: string;
    role: string;
  };
  approver?: {
    id: string;
    name: string;
    approvedAt: string;
  };
  status: 'completed' | 'pending_approval' | 'cancelled';
  note?: string;
  warehouse: string;
}

let transactions: TransactionRecord[] = [
  {
    id: 'tx_shoe_001',
    code: 'PNK-2026-ADI-01',
    type: 'inbound',
    date: '2026-10-22 09:30',
    partner: 'adidas Vietnam Logistics Ltd.',
    reason: 'Nhập lô hàng giày Originals Quý 4 (Samba, Gazelle, Campus)',
    items: [
      {
        productId: 'prod_shoe_001',
        productName: 'Giày adidas Samba OG Cloud White / Core Black (Size 42)',
        sku: 'B75806-42',
        barcode: '4066748231011',
        quantity: 30,
        unitPrice: 1620000,
        total: 48600000,
        unit: 'Đôi',
        location: 'Kệ A1 - T-Toe Classics',
      },
      {
        productId: 'prod_shoe_003',
        productName: 'Giày adidas Gazelle Indoor Shadow Navy / Gum (Size 38)',
        sku: 'H06122-38',
        barcode: '4066748231035',
        quantity: 20,
        unitPrice: 1740000,
        total: 34800000,
        unit: 'Đôi',
        location: 'Kệ A2 - Gazelle & Retro',
      },
    ],
    totalAmount: 83400000,
    creator: { id: 'usr_staff', name: 'Lê Hoàng Nam', role: 'Thủ kho' },
    approver: { id: 'usr_manager', name: 'Trần Thị Mai', approvedAt: '2026-10-22 10:30' },
    status: 'completed',
    note: 'Đầy đủ hộp Bluebox Originals nguyên đai, tem bảo hành chính hãng adidas',
    warehouse: 'Kho Tổng Giày adidas (Khu vực Kệ A1-E1)',
  },
  {
    id: 'tx_shoe_002',
    code: 'PXK-2026-ADI-02',
    type: 'outbound',
    date: '2026-10-22 15:00',
    partner: 'Cửa hàng adidas Flagship Store Vincom Bà Triệu',
    reason: 'Xuất điều chuyển bổ sung cho cửa hàng bán lẻ',
    items: [
      {
        productId: 'prod_shoe_001',
        productName: 'Giày adidas Samba OG Cloud White / Core Black (Size 42)',
        sku: 'B75806-42',
        barcode: '4066748231011',
        quantity: 26,
        unitPrice: 2700000,
        total: 70200000,
        unit: 'Đôi',
        location: 'Kệ A1 - T-Toe Classics',
      },
      {
        productId: 'prod_shoe_004',
        productName: 'Giày Chạy Bộ Nam adidas Ultraboost 5 Core Black (Size 43)',
        sku: 'IE1768-43',
        barcode: '4066748231042',
        quantity: 12,
        unitPrice: 4800000,
        total: 57600000,
        unit: 'Đôi',
        location: 'Kệ B1 - Boost Performance',
      },
    ],
    totalAmount: 127800000,
    creator: { id: 'usr_staff', name: 'Lê Hoàng Nam', role: 'Thủ kho' },
    approver: { id: 'usr_manager', name: 'Trần Thị Mai', approvedAt: '2026-10-22 15:30' },
    status: 'completed',
    note: 'Giao trực tiếp cho quản lý cửa hàng Vincom Bà Triệu, đã kiểm đủ size',
    warehouse: 'Kho Tổng Giày adidas',
  },
  {
    id: 'tx_shoe_003',
    code: 'PXK-2026-ADI-03',
    type: 'outbound',
    date: '2026-10-23 08:30',
    partner: 'Chuỗi Cửa Hàng Thể Thao Supersports Vietnam',
    reason: 'Xuất sỉ đơn hàng giày chạy bộ & đá bóng theo hợp đồng #AD-2026-SS',
    items: [
      {
        productId: 'prod_shoe_009',
        productName: 'Giày Chạy Đua Marathon adidas Adizero Adios Pro 3 (Size 42)',
        sku: 'HP9705-42',
        barcode: '4066748231097',
        quantity: 4,
        unitPrice: 6200000,
        total: 24800000,
        unit: 'Đôi',
        location: 'Kệ B2 - Elite Racing',
      },
    ],
    totalAmount: 24800000,
    creator: { id: 'usr_staff', name: 'Lê Hoàng Nam', role: 'Thủ kho' },
    status: 'pending_approval',
    note: 'Đơn hàng giá trị cao chờ Quản lý phê duyệt xuất kho',
    warehouse: 'Kho Tổng Giày adidas',
  },
];

interface AuditRecord {
  id: string;
  code: string;
  title: string;
  warehouse: string;
  createdAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  auditorName: string;
  notes?: string;
  items: Array<{
    productId: string;
    sku: string;
    productName: string;
    unit: string;
    location: string;
    category: string;
    systemQty: number;
    actualQty: number | null;
    difference: number;
    unitCost: number;
    differenceValue: number;
    reason?: string;
    status: 'pending' | 'matched' | 'surplus' | 'shortage';
  }>;
  totalSystemQty: number;
  totalActualQty: number;
  totalDifferenceQty: number;
  totalDifferenceValue: number;
}

let audits: AuditRecord[] = [
  {
    id: 'aud_shoe_001',
    code: 'KK-GIÀY-2026-T10',
    title: 'Kiểm kê định kỳ tháng 10/2026 - Khu Vực Kệ Originals & Running',
    warehouse: 'Kho Tổng Giày adidas Vietnam',
    createdAt: '2026-10-21 08:00',
    completedAt: '2026-10-21 17:30',
    status: 'completed',
    auditorName: 'Phạm Đức Minh (Kiểm toán độc lập)',
    notes: 'Đã hoàn tất kiểm đếm hộp và mã vạch từng đôi giày',
    items: [
      {
        productId: 'prod_shoe_001',
        sku: 'B75806-42',
        productName: 'Giày adidas Samba OG Cloud White / Core Black (Size 42)',
        unit: 'Đôi',
        location: 'Kệ A1 - T-Toe Classics',
        category: 'Originals / Phong cách sống',
        systemQty: 4,
        actualQty: 4,
        difference: 0,
        unitCost: 1620000,
        differenceValue: 0,
        reason: 'Khớp 100% nguyên hộp',
        status: 'matched',
      },
      {
        productId: 'prod_shoe_007',
        sku: 'FX5502-41',
        productName: 'Giày adidas Stan Smith Cổ Điển White / Green (Size 41)',
        unit: 'Đôi',
        location: 'Kệ A4 - Heritage Tennis',
        category: 'Originals / Phong cách sống',
        systemQty: 43,
        actualQty: 42,
        difference: -1,
        unitCost: 1440000,
        differenceValue: -1440000,
        reason: 'Hộp mẫu trưng bày tại quầy trải nghiệm khách hàng',
        status: 'shortage',
      },
      {
        productId: 'prod_shoe_013',
        sku: 'AP9971-42',
        productName: 'Dép Quai Ngang adidas Adilette Comfort Cloudfoam Black/White (Size 42)',
        unit: 'Đôi',
        location: 'Kệ D1 - Dép Thể Thao',
        category: 'Dép & Sandal',
        systemQty: 108,
        actualQty: 110,
        difference: +2,
        unitCost: 550000,
        differenceValue: 1100000,
        reason: 'Nhà cung cấp giao bù 2 đôi đợt trước',
        status: 'surplus',
      },
    ],
    totalSystemQty: 155,
    totalActualQty: 156,
    totalDifferenceQty: +1,
    totalDifferenceValue: -340000,
  },
];

// Helper to determine product status
function computeStatus(p: ProductItem): 'out_of_stock' | 'low_stock' | 'overstock' | 'in_stock' {
  if (p.quantity === 0) return 'out_of_stock';
  if (p.quantity <= p.minThreshold) return 'low_stock';
  if (p.quantity >= p.maxThreshold) return 'overstock';
  return 'in_stock';
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Get products list
  app.get('/api/products', (req, res) => {
    const list = products.map((p) => ({
      ...p,
      status: computeStatus(p),
    }));
    res.json({ success: true, data: list });
  });

  // 2. Add product with Anti-Duplicate SKU and Barcode check
  app.post('/api/products', (req, res) => {
    const body = req.body;
    if (!body.name || !body.category) {
      res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ tên giày và phân loại!' });
      return;
    }

    // Auto-generate or sanitize SKU
    let finalSku = body.sku ? body.sku.trim().toUpperCase() : '';
    if (!finalSku) {
      finalSku = `STK-ADI-${Math.floor(1000 + Math.random() * 9000)}-42`;
    }

    // Check duplicate SKU
    if (products.some((p) => p.sku.toUpperCase() === finalSku)) {
      res.status(400).json({
        success: false,
        message: `Mã SKU "${finalSku}" đã tồn tại trong kho! Vui lòng chọn hoặc tự động sinh mã khác.`,
      });
      return;
    }

    // Auto-generate or sanitize Barcode (EAN-13 format)
    let finalBarcode = body.barcode ? body.barcode.trim() : '';
    if (!finalBarcode) {
      const rand8 = Math.floor(10000000 + Math.random() * 90000000).toString();
      finalBarcode = `4066${rand8}`;
    }

    // Check duplicate Barcode
    if (products.some((p) => p.barcode === finalBarcode)) {
      res.status(400).json({
        success: false,
        message: `Mã vạch EAN "${finalBarcode}" đã được gán cho sản phẩm khác trong kho!`,
      });
      return;
    }

    const newProd: ProductItem = {
      id: `prod_shoe_${Date.now()}`,
      sku: finalSku,
      barcode: finalBarcode,
      name: body.name.trim(),
      category: body.category,
      unit: body.unit || 'Đôi',
      location: body.location || 'Kệ A1 - T-Toe Classics (Samba / Gazelle)',
      quantity: Number(body.quantity) || 0,
      minThreshold: Number(body.minThreshold) || 10,
      maxThreshold: Number(body.maxThreshold) || 60,
      costPrice: Number(body.costPrice) || 0,
      sellingPrice: Number(body.sellingPrice) || 0,
      supplier: body.supplier || 'adidas Vietnam Logistics Ltd.',
      imageUrl: body.imageUrl || undefined,
      expiryDate: body.expiryDate || undefined,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    products.unshift(newProd);
    res.json({ success: true, data: { ...newProd, status: computeStatus(newProd) } });
  });

  // 3. Update product with Anti-Duplicate check
  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Không tìm thấy mẫu giày này!' });
      return;
    }

    // Check if new SKU duplicates with another product
    if (req.body.sku) {
      const targetSku = req.body.sku.trim().toUpperCase();
      const duplicateSku = products.find((p) => p.id !== id && p.sku.toUpperCase() === targetSku);
      if (duplicateSku) {
        res.status(400).json({
          success: false,
          message: `Mã SKU "${targetSku}" đã tồn tại ở sản phẩm "${duplicateSku.name}"!`,
        });
        return;
      }
    }

    // Check if new Barcode duplicates with another product
    if (req.body.barcode) {
      const targetBarcode = req.body.barcode.trim();
      const duplicateBarcode = products.find((p) => p.id !== id && p.barcode === targetBarcode);
      if (duplicateBarcode) {
        res.status(400).json({
          success: false,
          message: `Mã vạch "${targetBarcode}" đã tồn tại ở sản phẩm "${duplicateBarcode.name}"!`,
        });
        return;
      }
    }

    const current = products[index];
    const updated: ProductItem = {
      ...current,
      ...req.body,
      sku: req.body.sku ? req.body.sku.trim().toUpperCase() : current.sku,
      barcode: req.body.barcode ? req.body.barcode.trim() : current.barcode,
      imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : current.imageUrl,
      quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : current.quantity,
      minThreshold: req.body.minThreshold !== undefined ? Number(req.body.minThreshold) : current.minThreshold,
      maxThreshold: req.body.maxThreshold !== undefined ? Number(req.body.maxThreshold) : current.maxThreshold,
      costPrice: req.body.costPrice !== undefined ? Number(req.body.costPrice) : current.costPrice,
      sellingPrice: req.body.sellingPrice !== undefined ? Number(req.body.sellingPrice) : current.sellingPrice,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    products[index] = updated;
    res.json({ success: true, data: { ...updated, status: computeStatus(updated) } });
  });

  // 4. Delete product
  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm giày để xóa!' });
      return;
    }
    const deleted = products.splice(index, 1)[0];
    res.json({ success: true, data: deleted });
  });

  // 5. Get transactions
  app.get('/api/transactions', (req, res) => {
    res.json({ success: true, data: transactions });
  });

  // 6. Create transaction
  app.post('/api/transactions', (req, res) => {
    const { type, partner, reason, items, creator, note, warehouse } = req.body;

    if (!type || !items || !items.length) {
      res.status(400).json({ success: false, message: 'Dữ liệu phiếu nhập/xuất giày không hợp lệ!' });
      return;
    }

    if (type === 'outbound') {
      for (const item of items) {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) {
          res.status(400).json({ success: false, message: `Mẫu giày ${item.productName} không tồn tại trong kho!` });
          return;
        }
        if (prod.quantity < Number(item.quantity)) {
          res.status(400).json({
            success: false,
            message: `Không đủ số lượng trong kho cho "${prod.name}" (Hiện còn: ${prod.quantity} ${prod.unit}, Cần xuất: ${item.quantity} ${prod.unit})`,
          });
          return;
        }
      }
    }

    const codePrefix = type === 'inbound' ? 'PNK-ADI' : type === 'outbound' ? 'PXK-ADI' : 'PDC-ADI';
    const transactionCode = `${codePrefix}-2026-${String(transactions.length + 1001)}`;
    const totalAmount = items.reduce((sum: number, it: any) => sum + (Number(it.quantity) * Number(it.unitPrice)), 0);

    const newTx: TransactionRecord = {
      id: `tx_${Date.now()}`,
      code: transactionCode,
      type,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      partner: partner || (type === 'inbound' ? 'adidas Vietnam Logistics Ltd.' : 'Cửa hàng adidas Flagship'),
      reason: reason || (type === 'inbound' ? 'Nhập bổ sung size giày' : 'Xuất bán hàng'),
      items: items.map((it: any) => ({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        barcode: it.barcode || '',
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        total: Number(it.quantity) * Number(it.unitPrice),
        unit: it.unit || 'Đôi',
        location: it.location || 'Kho Tổng Giày adidas',
      })),
      totalAmount,
      creator: creator || { id: 'usr_staff', name: 'Lê Hoàng Nam', role: 'Thủ kho' },
      status: 'completed',
      note: note || '',
      warehouse: warehouse || 'Kho Tổng Giày adidas Vietnam',
    };

    items.forEach((it: any) => {
      const pIndex = products.findIndex((p) => p.id === it.productId);
      if (pIndex !== -1) {
        if (type === 'inbound') {
          products[pIndex].quantity += Number(it.quantity);
        } else if (type === 'outbound') {
          products[pIndex].quantity -= Number(it.quantity);
        }
        products[pIndex].updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      }
    });

    transactions.unshift(newTx);
    res.json({ success: true, data: newTx });
  });

  // 7. Approve transaction
  app.put('/api/transactions/:id/approve', (req, res) => {
    const { id } = req.params;
    const { approver } = req.body;
    const tx = transactions.find((t) => t.id === id);
    if (!tx) {
      res.status(404).json({ success: false, message: 'Không tìm thấy phiếu giao dịch!' });
      return;
    }

    if (tx.status === 'pending_approval') {
      if (tx.type === 'outbound') {
        for (const it of tx.items) {
          const p = products.find((prod) => prod.id === it.productId);
          if (p) {
            p.quantity = Math.max(0, p.quantity - it.quantity);
            p.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
          }
        }
      }
      tx.status = 'completed';
      tx.approver = {
        id: approver?.id || 'usr_manager',
        name: approver?.name || 'Trần Thị Mai',
        approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
    }

    res.json({ success: true, data: tx });
  });

  // 8. Audits
  app.get('/api/audits', (req, res) => {
    res.json({ success: true, data: audits });
  });

  app.post('/api/audits', (req, res) => {
    const { title, warehouse, auditorName, notes, categoryFilter } = req.body;

    let targetProducts = [...products];
    if (categoryFilter && categoryFilter !== 'all') {
      targetProducts = targetProducts.filter((p) => p.category === categoryFilter);
    }

    const auditItems = targetProducts.map((p) => ({
      productId: p.id,
      sku: p.sku,
      productName: p.name,
      unit: p.unit,
      location: p.location,
      category: p.category,
      systemQty: p.quantity,
      actualQty: null,
      difference: 0,
      unitCost: p.costPrice,
      differenceValue: 0,
      reason: '',
      status: 'pending' as const,
    }));

    const totalSystem = auditItems.reduce((acc, it) => acc + it.systemQty, 0);

    const newAudit: AuditRecord = {
      id: `aud_${Date.now()}`,
      code: `KK-GIÀY-2026-${String(audits.length + 1).padStart(2, '0')}`,
      title: title || `Đợt kiểm kê kho giày dép ${new Date().toLocaleDateString('vi-VN')}`,
      warehouse: warehouse || 'Kho Tổng Giày adidas Vietnam',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'in_progress',
      auditorName: auditorName || 'Tổ kiểm kê kho giày adidas',
      notes: notes || '',
      items: auditItems,
      totalSystemQty: totalSystem,
      totalActualQty: 0,
      totalDifferenceQty: 0,
      totalDifferenceValue: 0,
    };

    audits.unshift(newAudit);
    res.json({ success: true, data: newAudit });
  });

  app.put('/api/audits/:id', (req, res) => {
    const { id } = req.params;
    const { items, status, notes } = req.body;
    const auditIndex = audits.findIndex((a) => a.id === id);
    if (auditIndex === -1) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đợt kiểm kê!' });
      return;
    }

    const currentAudit = audits[auditIndex];
    if (items) {
      currentAudit.items = items;
      let totalActual = 0;
      let totalDiffQty = 0;
      let totalDiffVal = 0;

      currentAudit.items.forEach((it) => {
        if (it.actualQty !== null) {
          totalActual += it.actualQty;
          it.difference = it.actualQty - it.systemQty;
          it.differenceValue = it.difference * it.unitCost;
          totalDiffQty += it.difference;
          totalDiffVal += it.differenceValue;

          if (it.difference === 0) it.status = 'matched';
          else if (it.difference > 0) it.status = 'surplus';
          else it.status = 'shortage';
        } else {
          it.status = 'pending';
        }
      });

      currentAudit.totalActualQty = totalActual;
      currentAudit.totalDifferenceQty = totalDiffQty;
      currentAudit.totalDifferenceValue = totalDiffVal;
    }

    if (status) currentAudit.status = status;
    if (notes) currentAudit.notes = notes;

    audits[auditIndex] = currentAudit;
    res.json({ success: true, data: currentAudit });
  });

  app.post('/api/audits/:id/apply', (req, res) => {
    const { id } = req.params;
    const audit = audits.find((a) => a.id === id);
    if (!audit) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đợt kiểm kê!' });
      return;
    }

    const adjustmentItems: any[] = [];
    audit.items.forEach((it) => {
      if (it.actualQty !== null) {
        const prod = products.find((p) => p.id === it.productId);
        if (prod) {
          const diff = it.actualQty - prod.quantity;
          if (diff !== 0) {
            adjustmentItems.push({
              productId: prod.id,
              productName: prod.name,
              sku: prod.sku,
              barcode: prod.barcode,
              quantity: Math.abs(diff),
              unitPrice: prod.costPrice,
              total: Math.abs(diff) * prod.costPrice,
              unit: prod.unit,
              location: prod.location,
            });
          }
          prod.quantity = it.actualQty;
          prod.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
        }
      }
    });

    audit.status = 'completed';
    audit.completedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

    if (adjustmentItems.length > 0) {
      const adjTx: TransactionRecord = {
        id: `tx_${Date.now()}`,
        code: `PDC-KK-${audit.code}`,
        type: 'adjustment',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        partner: 'Ban Kiểm Kê Giày adidas',
        reason: `Điều chỉnh số lượng hộp giày sau đợt kiểm kê [${audit.code}]`,
        items: adjustmentItems,
        totalAmount: Math.abs(audit.totalDifferenceValue),
        creator: { id: 'usr_manager', name: 'Trần Thị Mai', role: 'Quản lý kho' },
        status: 'completed',
        note: `Cân bằng kho tự động từ đợt kiểm kê ${audit.title}`,
        warehouse: audit.warehouse,
      };
      transactions.unshift(adjTx);
    }

    res.json({ success: true, data: audit, message: 'Đã hoàn tất cân bằng tồn kho giày dép thực tế!' });
  });

  // 9. Automated Alerts for Footwear
  app.get('/api/alerts', (req, res) => {
    const alerts: any[] = [];

    products.forEach((p) => {
      if (p.quantity === 0) {
        alerts.push({
          id: `alt_out_${p.id}`,
          type: 'out_of_stock',
          severity: 'critical',
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          currentQty: p.quantity,
          minThreshold: p.minThreshold,
          maxThreshold: p.maxThreshold,
          unit: p.unit,
          location: p.location,
          message: `Mẫu giày "${p.name}" (SKU: ${p.sku}) đã HẾT HÀNG (0 đôi)! Vui lòng lập phiếu nhập khẩn cấp từ adidas Logistics.`,
          createdAt: p.updatedAt,
          read: false,
        });
      } else if (p.quantity <= p.minThreshold) {
        alerts.push({
          id: `alt_low_${p.id}`,
          type: 'low_stock',
          severity: 'warning',
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          currentQty: p.quantity,
          minThreshold: p.minThreshold,
          maxThreshold: p.maxThreshold,
          unit: p.unit,
          location: p.location,
          message: `Giày sắp hết size: Hiện chỉ còn ${p.quantity} ${p.unit} (dưới ngưỡng an toàn ${p.minThreshold} ${p.unit}). Cần nhập thêm để phục vụ khách.`,
          createdAt: p.updatedAt,
          read: false,
        });
      } else if (p.quantity >= p.maxThreshold) {
        alerts.push({
          id: `alt_over_${p.id}`,
          type: 'overstock',
          severity: 'info',
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          currentQty: p.quantity,
          minThreshold: p.minThreshold,
          maxThreshold: p.maxThreshold,
          unit: p.unit,
          location: p.location,
          message: `Tồn kho cao: ${p.quantity} ${p.unit} (vượt mức tối đa ${p.maxThreshold} ${p.unit}). Đề xuất chuyển bớt ra các chi nhánh bán lẻ.`,
          createdAt: p.updatedAt,
          read: false,
        });
      }
    });

    res.json({ success: true, data: alerts });
  });

  // 10. Reports Summary
  app.get('/api/reports/summary', (req, res) => {
    const totalStockValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
    const totalProductsCount = products.length;
    const totalUnitsCount = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= p.minThreshold).length;
    const outOfStockCount = products.filter((p) => p.quantity === 0).length;

    const inboundThisMonth = transactions.filter((t) => t.type === 'inbound').length;
    const outboundThisMonth = transactions.filter((t) => t.type === 'outbound').length;

    const catMap: Record<string, { count: number; value: number }> = {};
    products.forEach((p) => {
      if (!catMap[p.category]) {
        catMap[p.category] = { count: 0, value: 0 };
      }
      catMap[p.category].count += 1;
      catMap[p.category].value += p.quantity * p.costPrice;
    });

    const categoryDistribution = Object.keys(catMap).map((cat) => ({
      category: cat,
      count: catMap[cat].count,
      value: catMap[cat].value,
      percentage: totalStockValue > 0 ? (catMap[cat].value / totalStockValue) * 100 : 0,
    })).sort((a, b) => b.value - a.value);

    // 7-day flow for shoe store
    const flowTrend = [
      { date: '17/10', inboundUnits: 45, outboundUnits: 38 },
      { date: '18/10', inboundUnits: 80, outboundUnits: 62 },
      { date: '19/10', inboundUnits: 25, outboundUnits: 45 },
      { date: '20/10', inboundUnits: 95, outboundUnits: 70 },
      { date: '21/10', inboundUnits: 50, outboundUnits: 68 },
      { date: '22/10', inboundUnits: 50, outboundUnits: 38 },
      { date: '23/10', inboundUnits: 30, outboundUnits: 26 },
    ];

    res.json({
      success: true,
      data: {
        totalStockValue,
        totalProductsCount,
        totalUnitsCount,
        lowStockCount,
        outOfStockCount,
        inboundTransactionsThisMonth: inboundThisMonth,
        outboundTransactionsThisMonth: outboundThisMonth,
        flowTrend,
        categoryDistribution,
      },
    });
  });

  // Vite / Static Serving
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Stockly Shoe Store Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
