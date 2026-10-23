import React from 'react';
import { LayoutDashboard, Package, ArrowLeftRight, ClipboardCheck, BarChart3 } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickScan: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'products', label: 'Hàng hóa', icon: Package },
    { id: 'transactions', label: 'Nhập xuất', icon: ArrowLeftRight },
    { id: 'audit', label: 'Kiểm kê', icon: ClipboardCheck },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="min-h-[48px] min-w-[44px] flex flex-col items-center justify-center py-1 transition-colors select-none"
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'text-indigo-600 scale-110' : 'text-slate-400'
                }`}
              />
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 truncate max-w-[64px] ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
