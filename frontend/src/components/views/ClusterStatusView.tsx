import React from 'react';
import { Cpu, HardDrive, Activity, ShieldCheck, Thermometer, Zap } from 'lucide-react';

export const ClusterStatusView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn font-['Inter',sans-serif]">
      {/* Cluster Overview Header */}
      <div className="bg-[#141822]/80 backdrop-blur-2xl p-6 rounded-2xl border border-[#272a32] shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#4cd7f6]" />
            <h2 className="text-[20px] font-bold text-[#e1e2ec]">Cluster Telemetry &amp; Node Status</h2>
          </div>
          <p className="text-[13px] text-[#869397] mt-1">
            Real-time hardware metrics and health daemon telemetry for active rig Node-04.
          </p>
        </div>
        <div className="flex items-center gap-2 font-['JetBrains_Mono',monospace] text-[11px]">
          <span className="px-3 py-1.5 rounded-lg bg-[#003640] border border-[#06b6d4]/40 text-[#4cd7f6] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
            NODE-04 HEALTH: OPTIMAL
          </span>
        </div>
      </div>

      {/* Hardware Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-['JetBrains_Mono',monospace]">
        <div className="bg-[#141822]/90 border border-[#272a32] p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#869397] text-[11px]">
            <span>GPU SM UTILIZATION</span>
            <Activity className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="text-[28px] font-bold text-[#e1e2ec] my-2">84.2%</div>
          <div className="w-full bg-[#272a32] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#4cd7f6] h-full w-[84.2%] rounded-full" />
          </div>
          <span className="text-[10px] text-[#869397] mt-2">Streaming Multiprocessors active</span>
        </div>

        <div className="bg-[#141822]/90 border border-[#272a32] p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#869397] text-[11px]">
            <span>THERMAL PROFILE</span>
            <Thermometer className="w-4 h-4 text-[#2fd9f4]" />
          </div>
          <div className="text-[28px] font-bold text-[#4cd7f6] my-2">62 °C</div>
          <div className="w-full bg-[#272a32] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#2fd9f4] h-full w-[55%] rounded-full" />
          </div>
          <span className="text-[10px] text-[#869397] mt-2">Target &lt; 83 °C (Liquid Cooled)</span>
        </div>

        <div className="bg-[#141822]/90 border border-[#272a32] p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#869397] text-[11px]">
            <span>POWER DRAW</span>
            <Zap className="w-4 h-4 text-[#d0bcff]" />
          </div>
          <div className="text-[28px] font-bold text-[#d0bcff] my-2">285 W</div>
          <div className="w-full bg-[#272a32] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#d0bcff] h-full w-[71%] rounded-full" />
          </div>
          <span className="text-[10px] text-[#869397] mt-2">TDP Cap: 400 W (SXM4)</span>
        </div>

        <div className="bg-[#141822]/90 border border-[#272a32] p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#869397] text-[11px]">
            <span>PCIe 4.0 BANDWIDTH</span>
            <HardDrive className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="text-[28px] font-bold text-[#e1e2ec] my-2">28.4 GB/s</div>
          <div className="w-full bg-[#272a32] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#4cd7f6] h-full w-[45%] rounded-full" />
          </div>
          <span className="text-[10px] text-[#869397] mt-2">Bidirectional Host-to-Device</span>
        </div>
      </div>

      {/* Cluster Node Table */}
      <div className="bg-[#141822]/80 border border-[#272a32] rounded-xl p-5 shadow-inner">
        <h3 className="text-[15px] font-semibold text-[#e1e2ec] mb-3">
          Compute Nodes in Pool [cluster-eu-west-01]
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-['JetBrains_Mono',monospace] text-[12px]">
            <thead>
              <tr className="text-[#869397] text-[10px] uppercase border-b border-[#272a32]">
                <th className="py-2.5 px-3">Node ID</th>
                <th className="py-2.5 px-3">Rig Accelerator</th>
                <th className="py-2.5 px-3">Workload State</th>
                <th className="py-2.5 px-3">Active Pipeline</th>
                <th className="py-2.5 px-3 text-right">Ping Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d1f27]">
              <tr className="bg-[#1d1f27]/30 hover:bg-[#1d1f27]/60">
                <td className="py-3 px-3 font-bold text-[#4cd7f6]">NODE-04 (PRIMARY)</td>
                <td className="py-3 px-3 text-[#e1e2ec]">NVIDIA A100-SXM4 (80GB)</td>
                <td className="py-3 px-3 text-[#4cd7f6]">ONLINE :: INFERENCE ACTIVE</td>
                <td className="py-3 px-3 text-[#bcc9cd]">ALPR-v4 Multistage</td>
                <td className="py-3 px-3 text-right text-[#4cd7f6] font-bold">4.1 ms</td>
              </tr>
              <tr className="hover:bg-[#1d1f27]/40">
                <td className="py-3 px-3 text-[#869397]">NODE-01</td>
                <td className="py-3 px-3 text-[#e1e2ec]">NVIDIA A100-SXM4 (80GB)</td>
                <td className="py-3 px-3 text-[#bcc9cd]">STANDBY :: IDLE</td>
                <td className="py-3 px-3 text-[#869397]">Traffic Count Daemon</td>
                <td className="py-3 px-3 text-right text-[#bcc9cd]">3.8 ms</td>
              </tr>
              <tr className="hover:bg-[#1d1f27]/40">
                <td className="py-3 px-3 text-[#869397]">NODE-02</td>
                <td className="py-3 px-3 text-[#e1e2ec]">NVIDIA H100-SXM5 (80GB)</td>
                <td className="py-3 px-3 text-[#d0bcff]">ONLINE :: BATCH TRAINING</td>
                <td className="py-3 px-3 text-[#bcc9cd]">TrOCR-v2 Retrain</td>
                <td className="py-3 px-3 text-right text-[#bcc9cd]">5.2 ms</td>
              </tr>
              <tr className="hover:bg-[#1d1f27]/40">
                <td className="py-3 px-3 text-[#869397]">NODE-03</td>
                <td className="py-3 px-3 text-[#e1e2ec]">NVIDIA L40S (48GB)</td>
                <td className="py-3 px-3 text-[#bcc9cd]">STANDBY :: PRE-WARMED</td>
                <td className="py-3 px-3 text-[#869397]">Surveillance Gateway</td>
                <td className="py-3 px-3 text-right text-[#bcc9cd]">4.4 ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
