import React from 'react';
import { User, Lock, Activity, Menu, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { AppView } from '../types';
import { SPECTRA_LOGO } from '../data/mockData';

interface HeaderProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onLockGateway: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  onLockGateway,
  sidebarOpen,
  onToggleSidebar,
}) => {
  const navItems: { id: AppView; label: string }[] = [
    { id: 'model-pipeline', label: 'Model Pipeline' },
    { id: 'inference-playground', label: 'Inference Playground' },
    { id: 'model-zoo', label: 'Model Zoo' },
    { id: 'api-docs', label: 'API Docs' },
  ];

  return (
    <header
      className={`fixed top-0 ${
        sidebarOpen ? 'lg:left-64' : 'lg:left-0'
      } left-0 right-0 h-16 bg-[#0b0e15]/90 backdrop-blur-2xl z-40 border-b border-[#1d1f27] shadow-[0_1px_12px_rgba(0,0,0,0.5)] transition-all duration-300`}
    >
      <div className="h-16 w-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Sidebar Toggle + Logo & API Online Indicator */}
        <div className="flex items-center gap-2.5 sm:gap-5">
          {/* Sidebar Toggle Button for Mobile and Desktop */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-[#191b23] hover:bg-[#272a32] border border-[#272a32] text-[#bcc9cd] hover:text-[#4cd7f6] transition-colors cursor-pointer flex items-center justify-center"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 hidden lg:block" />
            ) : (
              <PanelLeft className="w-4 h-4 hidden lg:block" />
            )}
            <Menu className="w-4 h-4 lg:hidden" />
          </button>

          <div
            onClick={() => onSelectView('inference-playground')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1d1f27] border border-[#32353d] flex items-center justify-center p-1.5 shadow-sm group-hover:border-[#4cd7f6] transition-colors shrink-0">
              <img
                src={SPECTRA_LOGO}
                alt="Plate Vision Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-[15px] sm:text-[17px] font-semibold tracking-tight text-[#e1e2ec] whitespace-nowrap">
                Plate Vision
              </span>
              <span className="text-[9px] sm:text-[10px] font-['JetBrains_Mono',monospace] text-[#4cd7f6] font-medium tracking-wider hidden xs:inline">
                ALPR
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#191b23]/90 border border-[#272a32]">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
            <span className="text-[11px] font-['JetBrains_Mono',monospace] text-[#4cd7f6] font-medium">
              API ONLINE : localhost:8000
            </span>
          </div>
        </div>

        {/* Center: Top Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#06b6d4] text-[#00424f] font-semibold shadow-sm'
                    : 'text-[#bcc9cd] hover:text-[#e1e2ec] hover:bg-[#1d1f27]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: GPU Stats & Operator Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-[#1d1f27]/80 border border-[#272a32] text-[11px] font-['JetBrains_Mono',monospace]">
            <div className="flex items-center gap-1.5">
              <span className="text-[#869397] uppercase">GPU</span>
              <span className="text-[#e1e2ec] font-semibold">NVIDIA A100-SXM4</span>
            </div>
            <div className="w-px h-3.5 bg-[#32353d]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[#869397] uppercase">Latency</span>
              <span className="text-[#4cd7f6] font-semibold">42ms</span>
            </div>
          </div>

          {/* Switch to Gateway */}
          <button
            type="button"
            onClick={onLockGateway}
            title="Lock session & return to Rig Gateway"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#191b23] hover:bg-[#272a32] border border-[#272a32] text-[#bcc9cd] hover:text-[#4cd7f6] text-[12px] font-medium transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gateway</span>
          </button>

          {/* User Profile Avatar */}
          <div
            title="Operator: alex.vance@spectralab.ai (Node-04)"
            className="w-8 h-8 rounded-full bg-[#4cd7f6] text-[#003640] flex items-center justify-center font-bold shadow-md cursor-pointer hover:ring-2 hover:ring-[#4cd7f6]/50 transition-all"
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
