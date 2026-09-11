import React from 'react';
import { Target, Scan, Car, FileCheck } from 'lucide-react';
import { PipelineStage } from '../types';

interface StageStepperProps {
  currentStage: PipelineStage;
  onSelectStage: (stage: PipelineStage) => void;
}

export const StageStepper: React.FC<StageStepperProps> = ({
  currentStage,
  onSelectStage,
}) => {
  const stages: Array<{
    stage: PipelineStage;
    numberStr: string;
    title: string;
    subTitle: string;
    icon: React.ReactNode;
  }> = [
    {
      stage: 1,
      numberStr: '01',
      title: 'YOLO Detection',
      subTitle: 'STAGE 01',
      icon: <Target className="w-5 h-5" />,
    },
    {
      stage: 2,
      numberStr: '02',
      title: 'TrOCR Recognition',
      subTitle: 'STAGE 02',
      icon: <Scan className="w-5 h-5" />,
    },
    {
      stage: 3,
      numberStr: '03',
      title: 'Vehicle CNN',
      subTitle: 'STAGE 03',
      icon: <Car className="w-5 h-5" />,
    },
    {
      stage: 4,
      numberStr: '04',
      title: 'Telemetry & Export',
      subTitle: 'STAGE 04',
      icon: <FileCheck className="w-5 h-5" />,
    },
  ];

  return (
    <div className="w-full bg-[#141822]/80 backdrop-blur-2xl p-2.5 sm:p-4 rounded-xl border border-[#272a32] shadow-xl shadow-black/50">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {stages.map((st) => {
          const isActive = currentStage === st.stage;
          const isPassed = currentStage > st.stage;

          return (
            <button
              key={st.stage}
              type="button"
              onClick={() => onSelectStage(st.stage)}
              className={`group flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl transition-all duration-300 text-left border cursor-pointer ${
                isActive
                  ? 'bg-[#1d1f27] text-[#e1e2ec] shadow-md border-[#4cd7f6]/50 ring-1 ring-[#4cd7f6]/40'
                  : isPassed
                  ? 'bg-[#141822]/70 text-[#e1e2ec] border-[#272a32] hover:bg-[#1d1f27]'
                  : 'bg-[#141822]/40 text-[#869397] border-[#1d1f27] hover:bg-[#1d1f27]/60 hover:text-[#e1e2ec]'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0 flex items-center justify-center font-['JetBrains_Mono',monospace] text-[11px] sm:text-[12px] font-bold transition-all ${
                    isActive
                      ? 'bg-[#4cd7f6] text-[#003640] shadow-sm shadow-[#4cd7f6]/40'
                      : isPassed
                      ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40'
                      : 'bg-[#272a32] text-[#869397]'
                  }`}
                >
                  {st.numberStr}
                </div>
                <div className="min-w-0">
                  <div className="font-['JetBrains_Mono',monospace] text-[9px] sm:text-[10px] text-[#869397] uppercase tracking-wider">
                    {st.subTitle}
                  </div>
                  <div className="text-[12px] sm:text-[14px] md:text-[15px] tracking-tight font-semibold truncate">
                    {st.title}
                  </div>
                </div>
              </div>

              <span
                className={`hidden xs:block shrink-0 transition-transform duration-200 group-hover:scale-110 ml-1 ${
                  isActive ? 'text-[#4cd7f6]' : isPassed ? 'text-[#4cd7f6]/70' : 'text-[#869397]'
                }`}
              >
                {st.icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
