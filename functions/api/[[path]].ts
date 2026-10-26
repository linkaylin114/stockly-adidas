type Product = Record<string, unknown>;

const products: Product[] = [
  { id: "prod_shoe_001", sku: "B75806-42", barcode: "4066748231011", name: "Giày adidas Samba OG Cloud White / Core Black (Size 42)", category: "Originals / Phong cách sống", unit: "Đôi", location: "Kệ A1 - T-Toe Classics", quantity: 24, minThreshold: 15, maxThreshold: 80, costPrice: 1620000, sellingPrice: 2700000, supplier: "adidas Vietnam Logistics Ltd.", imageUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=600&auto=format&fit=crop&q=80", updatedAt: "2026-10-23 09:15", status: "in_stock" },
  { id: "prod_shoe_002", sku: "B75807-39", barcode: "4066748231028", name: "Giày adidas Samba OG Core Black / Cloud White (Size 39)", category: "Originals / Phong cách sống", unit: "Đôi", location: "Kệ A1 - T-Toe Classics", quantity: 0, minThreshold: 12, maxThreshold: 60, costPrice: 1620000, sellingPrice: 2700000, supplier: "adidas Vietnam Logistics Ltd.", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80", updatedAt: "2026-10-23 09:15", status: "out_of_stock" },
  { id: "prod_shoe_003", sku: "H06122-38", barcode: "4066748231035", name: "Giày adidas Gazelle Indoor Collegiate Green (Size 38)", category: "Originals / Phong cách sống", unit: "Đôi", location: "Kệ A2 - Gazelle", quantity: 18, minThreshold: 10, maxThreshold: 50, costPrice: 1740000, sellingPrice: 2900000, supplier: "adidas Vietnam Logistics Ltd.", imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80", updatedAt: "2026-10-22 16:30", status: "in_stock" },
  { id: "prod_shoe_004", sku: "IE1768-43", barcode: "4066748231042", name: "Giày adidas Ultraboost Light Core Black (Size 43)", category: "Chạy bộ (Running)", unit: "Đôi", location: "Kệ B1 - Ultraboost", quantity: 13, minThreshold: 10, maxThreshold: 45, costPrice: 2880000, sellingPrice: 4800000, supplier: "adidas Vietnam Logistics Ltd.", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80", updatedAt: "2026-10-21 11:20", status: "in_stock" },
  { id: "prod_shoe_005", sku: "GY9350-41", barcode: "4066748231059", name: "Giày adidas Adizero Boston 12 Cloud White (Size 41)", category: "Chạy bộ (Running)", unit: "Đôi", location: "Kệ B2 - Adizero", quantity: 28, minThreshold: 8, maxThreshold: 50, costPrice: 2700000, sellingPrice: 4500000, supplier: "adidas Vietnam Logistics Ltd.", imageUrl: "https://images.unsplash.com/photo-1556637640-2c80d3201be8?w=600&auto=format&fit=crop&q=80", updatedAt: "2026-10-20 14:45", status: "in_stock" },
  { id: "prod_shoe_006", sku: "HQ8708-40", barcode: "4066748231066", name: "Giày adidas Campus 00s Grey Three (Size 40)", category: "Originals / Phong cách sống", unit: "Đôi", location: "Kệ A3 - Campus", quantity: 26, minThreshold: 12, maxThreshold: 65, costPrice: 1560000, sellingPrice: 2600000, supplier: "adidas Vietnam Logistics Ltd.", imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80", updatedAt: "2026-10-19 10:00", status: "in_stock" },
  { id: "prod_shoe_007", sku: "FX5502-41", barcode: "4066748231073", name: "Giày adidas Forum Low White / Blue (Size 41)", category: "Originals / Phong cách sống", unit: "Đôi", location: "Kệ A4 - Forum", quantity: 42, minThreshold: 10, maxThreshold: 70, costPrice: 1440000, sellingPrice: 2400000, supplier: "adidas Vietnam Logistics Ltd.", imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80", updatedAt: "2026-10-18 09:30", status: "in_stock" },
  { id: "prod_shoe_008", sku: "EG4958-42", barcode: "4066748231080", name: "Giày adidas Superstar White / Black (Size 42)", category: "Originals / Phong cách sống", unit: "Đôi", location: "Kệ A5 - Superstar", quantity: 35, minThreshold: 10, maxThreshold: 60, costPrice: 1560000, sellingPrice: 2600000, supplier: "adidas Vietnam Logistics Ltd.", imageUrl: "https://images.unsplash.com/photo-1554134425-934b9d1a7f8d?w=600&auto=format&fit=crop&q=80", updatedAt: "2026-10-17 15:10", status: "in_stock" },
  { id: "prod_shoe_009", sku: "HP9705-42", barcode: "4066748231097", name: "Giày adidas Adistar 2 Core Black (Size 42)", category: "Chạy bộ (Running)", unit: "Đôi", location: "Kệ B3 - Adistar", quantity: 2, minThreshold: 6, maxThreshold: 25, costPrice: 3800000, sellingPrice: 6200000, supplier: "adidas Vietnam Logistics Ltd.", imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80", updatedAt: "2026-10-16 13:40", status: "low_stock" },
  { id: "prod_shoe_010", sku: "AP9971-42", barcode: "4066748231103", name: "Dép adidas Adilette Aqua Black (Size 42)", category: "Dép & Sandal", unit: "Đôi", location: "Kệ C1 - Adilette", quantity: 110, minThreshold: 25, maxThreshold: 200, costPrice: 550000, sellingPrice: 950000, supplier: "adidas Vietnam Logistics Ltd.", imageUrl: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop&q=80", updatedAt: "2026-10-15 08:20", status: "in_stock" }
];

const transactions = [
  { id: "tx_001", type: "in", productId: "prod_shoe_001", quantity: 30, date: "2026-10-23", note: "Nhập bổ sung demo" },
  { id: "tx_002", type: "out", productId: "prod_shoe_003", quantity: 12, date: "2026-10-22", note: "Xuất đại lý demo" },
  { id: "tx_003", type: "in", productId: "prod_shoe_004", quantity: 20, date: "2026-10-21", note: "Nhập kho demo" }
];
const audits = [{ id: "audit_001", date: "2026-10-23", status: "completed", note: "Kiểm kê mẫu" }];

export async function onRequest(context: { request: Request; params: Record<string, string | string[]> }) {
  const raw = context.params?.path;
  const path = Array.isArray(raw) ? raw.join("/") : String(raw || "");
  const headers = { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" };
  if (context.request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (path === "products") return new Response(JSON.stringify({ success: true, data: products }), { headers });
  if (path === "transactions") return new Response(JSON.stringify({ success: true, data: transactions }), { headers });
  if (path === "audits") return new Response(JSON.stringify({ success: true, data: audits }), { headers });
  if (path === "alerts") {
    const data = products.filter((p: any) => Number(p.quantity) <= Number(p.minThreshold));
    return new Response(JSON.stringify({ success: true, data }), { headers });
  }
  if (path === "reports/summary" || path === "summary") {
    const totalQuantity = products.reduce((n, p: any) => n + Number(p.quantity || 0), 0);
    const totalValue = products.reduce((n, p: any) => n + Number(p.quantity || 0) * Number(p.costPrice || 0), 0);
    const data = { totalQuantity, totalValue, productCount: products.length, lowStockCount: products.filter((p: any) => Number(p.quantity) <= Number(p.minThreshold)).length };
    return new Response(JSON.stringify({ success: true, data }), { headers });
  }
  if (context.request.method === "POST" && path === "products") {
    const body = await context.request.json();
    return new Response(JSON.stringify({ success: true, data: { id: "prod_new", ...(body as object) } }), { status: 201, headers });
  }
  return new Response(JSON.stringify({ success: false, error: "Not found" }), { status: 404, headers });
}
