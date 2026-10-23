import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Sparkles, Check } from 'lucide-react';
import { SHOE_IMAGE_PRESETS } from '../data/warehouseConfig';

interface ImageUploadFieldProps {
  imageUrl?: string;
  onChange: (url: string) => void;
  productName?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  imageUrl,
  onChange,
  productName = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 5MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setShowUrlInput(false);
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-semibold text-slate-700 text-xs">
        Hình ảnh nhận diện mẫu giày
      </label>

      {/* Main Preview & Action Area */}
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <div className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0 group">
            <img
              src={imageUrl}
              alt={productName || 'Ảnh sản phẩm'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              title="Xóa ảnh"
              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0 text-slate-400 hover:text-indigo-600"
          >
            <ImageIcon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium text-center px-1">Tải ảnh lên</span>
          </div>
        )}

        {/* Buttons to trigger options */}
        <div className="flex-1 space-y-1.5 text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              {imageUrl ? 'Đổi ảnh từ máy' : 'Chọn ảnh từ máy'}
            </button>

            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-colors text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Ảnh mẫu adidas
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Hỗ trợ PNG, JPG, WebP. Có thể chọn ngay ảnh mẫu các dòng Samba, Gazelle, Ultraboost...
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Preset Shoe Image Grid */}
      {showPresets && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="text-[11px] font-semibold text-slate-600 flex justify-between items-center">
            <span>Chọn nhanh ảnh chuẩn các dòng adidas:</span>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Đóng
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-1">
            {Object.entries(SHOE_IMAGE_PRESETS).map(([name, url]) => {
              const isSelected = imageUrl === url;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(url);
                    setShowPresets(false);
                  }}
                  className={`relative aspect-square rounded-lg overflow-hidden border transition-all group ${
                    isSelected ? 'ring-2 ring-indigo-600 border-indigo-600' : 'border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  <img src={url} alt={name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] py-0.5 text-center capitalize truncate px-1">
                    {name}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
