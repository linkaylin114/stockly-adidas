import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Barcode, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { Product } from '../types/warehouse';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onScanResult: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onScanResult,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<Product | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setLastScanned(null);
      setManualCode('');
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } else {
        setCameraError('Trình duyệt không hỗ trợ truy cập camera!');
      }
    } catch (err: any) {
      setCameraError('Không thể mở camera. Bạn có thể chọn nhanh từ danh mục bên dưới.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSelectProduct = (prod: Product) => {
    setLastScanned(prod);
    onScanResult(prod);
    // Beep or brief vibration if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(80);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const trimmed = manualCode.trim().toLowerCase();
    const found = products.find(
      (p) =>
        p.barcode.toLowerCase() === trimmed ||
        p.sku.toLowerCase() === trimmed ||
        p.name.toLowerCase().includes(trimmed)
    );

    if (found) {
      handleSelectProduct(found);
      setManualCode('');
    } else {
      alert(`Không tìm thấy hàng hóa có mã hoặc barcode: ${manualCode}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold">Quét Mã Vạch Barcode / QR</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative bg-black h-56 sm:h-64 flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6 text-slate-400">
              <Camera className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              {cameraError ? (
                <div className="text-xs text-amber-400 flex items-center justify-center gap-1.5 px-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              ) : (
                <p className="text-xs">Đang khởi tạo camera thiết bị...</p>
              )}
            </div>
          )}

          {/* Laser Scan Animation Overlay */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-24 border-2 border-indigo-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-2">
            <div className="w-full h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse" />
            <div className="text-center text-[10px] text-white/70 bg-black/40 py-0.5 rounded">
              Căn mã vạch vào khung ngắm
            </div>
          </div>
        </div>

        {/* Success toast after scan */}
        {lastScanned && (
          <div className="bg-emerald-50 border-y border-emerald-200 p-3 flex items-center justify-between text-emerald-900 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg border border-emerald-300 overflow-hidden bg-white shrink-0">
                {lastScanned.imageUrl ? (
                  <img src={lastScanned.imageUrl} alt={lastScanned.name} className="w-full h-full object-cover" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 m-2.5" />
                )}
              </div>
              <div>
                <div className="font-bold">{lastScanned.name}</div>
                <div className="text-[10px] font-mono text-slate-500">
                  SKU: {lastScanned.sku} · Barcode: {lastScanned.barcode}
                </div>
              </div>
            </div>
            <span className="font-semibold text-emerald-700 tabular-nums">
              Tồn: {lastScanned.quantity} {lastScanned.unit}
            </span>
          </div>
        )}

        {/* Input Barcode Manual & Quick pickers */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Nhập mã vạch EAN hoặc SKU (ví dụ: 4066748231011)..."
              className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Tìm &amp; Chọn
            </button>
          </form>

          {/* Fast Tap Simulation for Testing */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Chạm nhanh mẫu giày kiểm thử trong kho:</span>
              <span className="text-[10px] text-indigo-600 font-normal">Mô phỏng máy scan cầm tay</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {products.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProduct(p)}
                  className="text-left p-2 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 transition-all text-xs flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-md border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Barcode className="w-4 h-4 text-slate-400 m-2" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-800 truncate">{p.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mt-0.5">
                      <span>{p.sku}</span>
                      <span className="font-bold text-slate-700 tabular-nums">{p.quantity} {p.unit}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal actions */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={startCamera}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Khởi động lại camera
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};
