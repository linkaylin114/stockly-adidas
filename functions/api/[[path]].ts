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

const product = (id: string) => products.find((item) => item.id === id) as any;

let transactions = [
  {
    id: "tx_001",
    code: "PNK-2026-DEMO-01",
    type: "inbound",
    date: "2026-10-23 09:30",
    partner: "adidas Vietnam Logistics Ltd.",
    reason: "Nhập bổ sung demo",
    items: [{ productId: "prod_shoe_001", productName: product("prod_shoe_001").name, sku: product("prod_shoe_001").sku, barcode: product("prod_shoe_001").barcode, quantity: 30, unitPrice: product("prod_shoe_001").costPrice, total: 30 * product("prod_shoe_001").costPrice, unit: product("prod_shoe_001").unit, location: product("prod_shoe_001").location }],
    totalAmount: 30 * product("prod_shoe_001").costPrice,
    creator: { id: "usr_staff", name: "Lê Hoàng Nam", role: "Thủ kho" },
    approver: { id: "usr_manager", name: "Trần Thị Mai", approvedAt: "2026-10-23 10:00" },
    status: "completed",
    note: "Phiếu demo để kiểm thử quy trình nhập kho",
    warehouse: "Kho Tổng Giày adidas Vietnam",
  },
  {
    id: "tx_002",
    code: "PXK-2026-DEMO-02",
    type: "outbound",
    date: "2026-10-22 15:00",
    partner: "Cửa hàng adidas Flagship Store",
    reason: "Xuất đại lý demo",
    items: [{ productId: "prod_shoe_003", productName: product("prod_shoe_003").name, sku: product("prod_shoe_003").sku, barcode: product("prod_shoe_003").barcode, quantity: 12, unitPrice: product("prod_shoe_003").sellingPrice, total: 12 * product("prod_shoe_003").sellingPrice, unit: product("prod_shoe_003").unit, location: product("prod_shoe_003").location }],
    totalAmount: 12 * product("prod_shoe_003").sellingPrice,
    creator: { id: "usr_staff", name: "Lê Hoàng Nam", role: "Thủ kho" },
    approver: { id: "usr_manager", name: "Trần Thị Mai", approvedAt: "2026-10-22 15:30" },
    status: "completed",
    note: "Phiếu demo để kiểm thử quy trình xuất kho",
    warehouse: "Kho Tổng Giày adidas Vietnam",
  },
  {
    id: "tx_003",
    code: "PNK-2026-DEMO-03",
    type: "inbound",
    date: "2026-10-21 10:00",
    partner: "adidas Performance Southeast Asia",
    reason: "Nhập kho demo",
    items: [{ productId: "prod_shoe_004", productName: product("prod_shoe_004").name, sku: product("prod_shoe_004").sku, barcode: product("prod_shoe_004").barcode, quantity: 20, unitPrice: product("prod_shoe_004").costPrice, total: 20 * product("prod_shoe_004").costPrice, unit: product("prod_shoe_004").unit, location: product("prod_shoe_004").location }],
    totalAmount: 20 * product("prod_shoe_004").costPrice,
    creator: { id: "usr_staff", name: "Lê Hoàng Nam", role: "Thủ kho" },
    status: "pending_approval",
    note: "Phiếu demo đang chờ quản lý phê duyệt",
    warehouse: "Kho Tổng Giày adidas Vietnam",
  },
];

let audits = [
  {
    id: "audit_001",
    code: "KK-GIÀY-2026-DEMO",
    title: "Kiểm kê mẫu tháng 10/2026",
    warehouse: "Kho Tổng Giày adidas Vietnam",
    createdAt: "2026-10-23 08:00",
    completedAt: "2026-10-23 17:30",
    status: "completed",
    auditorName: "Phạm Đức Minh (Kiểm toán độc lập)",
    notes: "Đợt kiểm kê demo có sẵn để thử xuất Excel",
    items: [
      { productId: "prod_shoe_001", sku: product("prod_shoe_001").sku, productName: product("prod_shoe_001").name, unit: product("prod_shoe_001").unit, location: product("prod_shoe_001").location, category: product("prod_shoe_001").category, systemQty: 24, actualQty: 24, difference: 0, unitCost: product("prod_shoe_001").costPrice, differenceValue: 0, reason: "Khớp tồn kho", status: "matched" },
      { productId: "prod_shoe_009", sku: product("prod_shoe_009").sku, productName: product("prod_shoe_009").name, unit: product("prod_shoe_009").unit, location: product("prod_shoe_009").location, category: product("prod_shoe_009").category, systemQty: 2, actualQty: 1, difference: -1, unitCost: product("prod_shoe_009").costPrice, differenceValue: -product("prod_shoe_009").costPrice, reason: "Một đôi đang trưng bày", status: "shortage" },
      { productId: "prod_shoe_010", sku: product("prod_shoe_010").sku, productName: product("prod_shoe_010").name, unit: product("prod_shoe_010").unit, location: product("prod_shoe_010").location, category: product("prod_shoe_010").category, systemQty: 110, actualQty: 110, difference: 0, unitCost: product("prod_shoe_010").costPrice, differenceValue: 0, reason: "Khớp tồn kho", status: "matched" },
    ],
    totalSystemQty: 136,
    totalActualQty: 135,
    totalDifferenceQty: -1,
    totalDifferenceValue: -product("prod_shoe_009").costPrice,
  },
];

export async function onRequest(context: { request: Request; params: Record<string, string | string[]> }) {
  const raw = context.params?.path;
  const path = Array.isArray(raw) ? raw.join("/") : String(raw || "");
  const headers = { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" };
  if (context.request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (path === "products") return new Response(JSON.stringify({ success: true, data: products }), { headers });
  if (path === "transactions") return new Response(JSON.stringify({ success: true, data: transactions }), { headers });
  if (path === "audits") return new Response(JSON.stringify({ success: true, data: audits }), { headers });
  if (path === "alerts") {
    const data = products.filter((p: any) => Number(p.quantity) <= Number(p.minThreshold)).map((p: any) => ({ id: "alert_" + p.id, type: p.quantity === 0 ? "out_of_stock" : "low_stock", severity: p.quantity === 0 ? "critical" : "warning", productId: p.id, productName: p.name, sku: p.sku, currentQty: p.quantity, minThreshold: p.minThreshold, maxThreshold: p.maxThreshold, unit: p.unit, location: p.location, message: "Cảnh báo tồn kho: " + p.name, createdAt: p.updatedAt, read: false }));
    return new Response(JSON.stringify({ success: true, data }), { headers });
  }
  if (path === "reports/summary" || path === "summary") {
    const totalQuantity = products.reduce((n, p: any) => n + Number(p.quantity || 0), 0);
    const totalValue = products.reduce((n, p: any) => n + Number(p.quantity || 0) * Number(p.costPrice || 0), 0);
    const totalStockValue = totalValue;
    const data = { totalStockValue, totalProductsCount: products.length, totalUnitsCount: totalQuantity, lowStockCount: products.filter((p: any) => Number(p.quantity) > 0 && Number(p.quantity) <= Number(p.minThreshold)).length, outOfStockCount: products.filter((p: any) => Number(p.quantity) === 0).length, inboundTransactionsThisMonth: 12, outboundTransactionsThisMonth: 18, flowTrend: [{ date: "17/10", inboundUnits: 45, outboundUnits: 38 }, { date: "18/10", inboundUnits: 80, outboundUnits: 62 }, { date: "19/10", inboundUnits: 25, outboundUnits: 45 }, { date: "20/10", inboundUnits: 95, outboundUnits: 70 }, { date: "21/10", inboundUnits: 50, outboundUnits: 68 }, { date: "22/10", inboundUnits: 50, outboundUnits: 38 }, { date: "23/10", inboundUnits: 30, outboundUnits: 26 }], categoryDistribution: [{ category: "Originals / Phong cách sống", value: 192240000, count: 6, percentage: 47.24 }, { category: "Chạy bộ (Running)", value: 152800000, count: 3, percentage: 37.54 }, { category: "Dép & Sandal", value: 60500000, count: 1, percentage: 14.87 }], totalQuantity, totalValue, productCount: products.length };
    return new Response(JSON.stringify({ success: true, data }), { headers });
  }
  if (context.request.method === "POST" && path === "transactions") {
    const body = await context.request.json() as any;
    const record: any = { id: `tx_${Date.now()}`, code: `${body.type === "inbound" ? "PNK" : "PXK"}-2026-DEMO-${transactions.length + 1}`, type: body.type || "inbound", date: new Date().toISOString().slice(0, 16).replace("T", " "), partner: body.partner || "Đối tác demo", reason: body.reason || "Giao dịch demo", items: body.items || [], totalAmount: (body.items || []).reduce((sum: number, item: any) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0), creator: body.creator || { id: "usr_admin", name: "Nguyễn Văn An", role: "Quản trị viên" }, status: "pending_approval", warehouse: body.warehouse || "Kho Tổng Giày adidas Vietnam", note: body.note || "" };
    transactions.unshift(record);
    return new Response(JSON.stringify({ success: true, data: record }), { status: 201, headers });
  }
  if (context.request.method === "POST" && path === "audits") {
    const body = await context.request.json() as any;
    const record: any = { id: `audit_${Date.now()}`, code: `KK-GIÀY-2026-${audits.length + 1}`, title: body.title || "Kiểm kê mới", warehouse: body.warehouse || "Kho Tổng Giày adidas Vietnam", createdAt: new Date().toISOString().slice(0, 16).replace("T", " "), status: "in_progress", auditorName: body.auditorName || "Nguyễn Văn An", notes: "Đợt kiểm kê mới", items: products.map((item: any) => ({ productId: item.id, sku: item.sku, productName: item.name, unit: item.unit, location: item.location, category: item.category, systemQty: Number(item.quantity), actualQty: null, difference: 0, unitCost: Number(item.costPrice), differenceValue: 0, status: "pending" })), totalSystemQty: products.reduce((sum: number, item: any) => sum + Number(item.quantity), 0), totalActualQty: 0, totalDifferenceQty: 0, totalDifferenceValue: 0 };
    audits.unshift(record);
    return new Response(JSON.stringify({ success: true, data: record }), { status: 201, headers });
  }
  if (context.request.method === "POST" && path === "products") {
    const body = await context.request.json();
    return new Response(JSON.stringify({ success: true, data: { id: "prod_new", ...(body as object) } }), { status: 201, headers });
  }
  return new Response(JSON.stringify({ success: false, error: "Not found" }), { status: 404, headers });
}
