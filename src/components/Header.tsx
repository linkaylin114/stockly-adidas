import React from 'react';
import { Package, Bell, UserCheck, Shield } from 'lucide-react';
import { User, StockAlert } from '../types/warehouse';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenRoleModal: () => void;
  alerts: StockAlert[];
  onOpenAlertsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenRoleModal,
  alerts,
  onOpenAlertsModal,
}) => {
  const unreadAlertsCount = alerts.filter((a) => a.severity === 'critical' || a.severity === 'warning').length;

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan' },
    { id: 'products', label: 'Hàng hóa & Tồn' },
    { id: 'transactions', label: 'Nhập - Xuất kho' },
    { id: 'audit', label: 'Kiểm kê Excel' },
    { id: 'reports', label: 'Báo cáo phân tích' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left text-slate-900 font-bold text-lg tracking-tight whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold shadow-sm shrink-0">
              <Package className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight">Stockly</span>
              <span className="text-slate-400 font-medium text-sm">•</span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                adidas
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 clean single-line text navigation links (hidden on mobile, visible on desktop) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action & role control */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              onClick={onOpenAlertsModal}
              title="Xem thông báo tồn kho"
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-sm">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* User Profile & Role Switcher */}
            <button
              onClick={onOpenRoleModal}
              title="Nhấp để đổi vai trò & xem bảng phân quyền"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs text-left"
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-600 inline" />
                  <span className="truncate max-w-[110px]">{currentUser.roleTitle.split('(')[0].trim()}</span>
                </div>
              </div>
              <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
