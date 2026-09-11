import React from 'react';
import { GitFork, Video, Layers, Cpu, Terminal, X } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
  vramUsedGb?: number;
  vramTotalGb?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
  vramUsedGb = 3.2,
  vramTotalGb = 80,
}) => {
  const navItems: Array<{
    id: AppView;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'model-pipeline',
      label: 'Pipeline Graph',
      icon: <GitFork className="w-5 h-5" />,
    },
    {
      id: 'inference-playground',
      label: 'Live Streams',
      icon: <Video className="w-5 h-5" />,
    },
    {
      id: 'model-zoo',
      label: 'Model Weights',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'cluster-telemetry',
      label: 'Cluster Status',
      icon: <Cpu className="w-5 h-5" />,
    },
    {
      id: 'api-docs',
      label: 'Inference RPC',
      icon: <Terminal className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-45 lg:hidden animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#141822]/95 backdrop-blur-xl z-50 flex flex-col justify-between py-4 border-r border-[#272a32] shadow-[0_1px_24px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="flex flex-col gap-6">
          {/* Core Status Header & Close Button */}
          <div className="px-5 pt-1 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6] animate-pulse shadow-[0_0_8px_#4cd7f6]" />
              <span className="font-['JetBrains_Mono',monospace] text-[11px] font-semibold uppercase tracking-widest text-[#bcc9cd]">
                CV Pipeline Core
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1d1f27] hover:bg-[#272a32] border border-[#32353d] text-[#869397] hover:text-[#e1e2ec] transition-colors cursor-pointer"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5 px-3">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectView(item.id);
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#06b6d4] text-[#00424f] font-bold shadow-md shadow-[#06b6d4]/20'
                      : 'text-[#bcc9cd] hover:bg-[#1d1f27] hover:text-[#e1e2ec]'
                  }`}
                >
                  <span className={isActive ? 'text-[#00424f]' : 'text-[#869397]'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Rig Status & Version Badge */}
        <div className="px-4 flex flex-col gap-3">
          {/* Active Rig Box */}
          <div className="p-3 rounded-xl bg-[#1d1f27]/70 border border-[#272a32] backdrop-blur-md flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-['JetBrains_Mono',monospace] text-[10px] uppercase tracking-wider text-[#869397]">
                Active Rig
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
            </div>
            <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#4cd7f6] font-semibold truncate">
              A100-SXM4 :: NODE-04
            </span>
            <div className="w-full bg-[#32353d] h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-[#4cd7f6] h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (vramUsedGb / vramTotalGb) * 100 * 20)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-['JetBrains_Mono',monospace] text-[#869397] mt-0.5">
              <span>VRAM: {vramUsedGb} GB</span>
              <span>/ {vramTotalGb} GB</span>
            </div>
          </div>

          {/* Runtime Version Footer */}
          <div className="flex items-center justify-between text-[#869397] px-1 font-['JetBrains_Mono',monospace] text-[11px]">
            <span>v3.4.1-rc</span>
            <span className="text-[#4cd7f6] font-semibold tracking-wider">READY</span>
          </div>
        </div>
      </aside>
    </>
  );
};
