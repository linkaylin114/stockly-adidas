import React from 'react';
import { X, Check, Shield, User, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types/warehouse';
import { INITIAL_USERS } from '../data/mockUsers';

interface RoleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onSelectUser: (user: UserType) => void;
}

export const RoleManagerModal: React.FC<RoleManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  const permissionsList = [
    { key: 'canCreateTransaction', label: 'Tạo phiếu Nhập / Xuất kho' },
    { key: 'canApproveTransaction', label: 'Phê duyệt phiếu Nhập / Xuất' },
    { key: 'canEditProduct', label: 'Thêm & Chỉnh sửa danh mục hàng hóa' },
    { key: 'canDeleteProduct', label: 'Xóa vĩnh viễn sản phẩm khỏi kho' },
    { key: 'canAudit', label: 'Tạo và đếm số lượng Kiểm kê' },
    { key: 'canReconcileAudit', label: 'Khớp số liệu & Cân bằng kho thực tế' },
    { key: 'canExportExcel', label: 'Xuất file Excel báo cáo & kiểm kê' },
    { key: 'canManageUsers', label: 'Phân quyền & Cấu hình tài khoản' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 text-slate-900 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Phân quyền & Chuyển đổi Người dùng
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn tài khoản mô phỏng để trải nghiệm giao diện và quyền hạn tương ứng
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          {INITIAL_USERS.map((u) => {
            const isSelected = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => {
                  onSelectUser(u);
                }}
                className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'
                  }`}
                >
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900 truncate">{u.name}</span>
                    {isSelected && <span className="text-xs font-semibold text-indigo-600">Đang dùng</span>}
                  </div>
                  <div className="text-xs font-medium text-slate-600 mt-0.5 truncate">{u.roleTitle.split('(')[0]}</div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">{u.warehouseAssigned}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Matrix of Current User's Permissions */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
            <span>Ma trận quyền hạn của [{currentUser.name}]:</span>
            <span className="text-indigo-600 font-semibold lowercase">
              {currentUser.role}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {permissionsList.map((perm) => {
              const hasPermission = currentUser.permissions[perm.key as keyof typeof currentUser.permissions];
              return (
                <div
                  key={perm.key}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    hasPermission
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-slate-100/70 border-slate-200/50 text-slate-400 line-through'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      hasPermission ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'
                    }`}
                  >
                    {hasPermission ? <Check className="w-3 h-3" /> : <X className="w-2.5 h-2.5" />}
                  </div>
                  <span className="truncate">{perm.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notice */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-amber-50 border border-amber-200/60 p-2.5 rounded-lg text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Các chức năng sẽ tự động kích hoạt hoặc bị khóa theo đúng quyền hạn của tài khoản đang được chọn.
          </span>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Đóng &amp; Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};
