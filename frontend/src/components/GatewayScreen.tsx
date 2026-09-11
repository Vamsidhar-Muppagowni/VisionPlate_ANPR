import React, { useState } from 'react';
import { Lock, Key, Shield, Eye, EyeOff, Server, Fingerprint, ArrowRight, Radio, Cpu, RefreshCw } from 'lucide-react';
import { SPECTRA_LOGO } from '../data/mockData';

interface GatewayScreenProps {
  onAuthenticate: () => void;
  operatorEmail?: string;
}

export const GatewayScreen: React.FC<GatewayScreenProps> = ({
  onAuthenticate,
  operatorEmail = 'alex.vance@platevision.ai',
}) => {
  const [activeTab, setActiveTab] = useState<'sso' | 'hardware' | 'secret'>('sso');
  const [nodeUri, setNodeUri] = useState('node-04.alpr.platevision.internal');
  const [identity, setIdentity] = useState(operatorEmail);
  const [passphrase, setPassphrase] = useState('SecOps_TensorRT_A100_v4#k8s');
  const [showPassword, setShowPassword] = useState(false);
  const [retainSession, setRetainSession] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  const handleAuth = () => {
    setIsAuthenticating(true);
    setAuthStatus('Verifying HSM credentials...');
    setTimeout(() => {
      setAuthStatus('TLS 1.3 handshake confirmed. Linking rig...');
      setTimeout(() => {
        setIsAuthenticating(false);
        onAuthenticate();
      }, 500);
    }, 600);
  };

  const handleYubiKey = () => {
    setIsAuthenticating(true);
    setAuthStatus('Polling FIDO2 / WebAuthn token...');
    setTimeout(() => {
      setIsAuthenticating(false);
      onAuthenticate();
    }, 700);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0b0e15] text-[#e1e2ec] flex flex-col justify-between items-center p-3 sm:p-8 font-['Inter',sans-serif] overflow-x-hidden selection:bg-[#06b6d4] selection:text-[#00424f]">
      {/* Background cybernetic grid lines & radial gradients */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#06b6d4_0.75px,transparent_0.75px)] [background-size:28px_28px] opacity-15" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#06b6d4]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Telemetry Strip */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 z-10 pt-2 pb-4 sm:pb-6 text-[11px] sm:text-[12px] font-['JetBrains_Mono',monospace] tracking-wider text-[#869397]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
          <span className="text-[#4cd7f6] font-semibold">RIG LINK :: ESTABLISHED</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <span>CLUSTER: <strong className="text-[#e1e2ec]">NODE-04</strong></span>
          <span className="bg-[#191b23] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[#4cd7f6] border border-[#272a32]">
            LATENCY: 4.1ms
          </span>
        </div>
      </header>

      {/* Central Login / Rig Card */}
      <main className="w-full max-w-[650px] z-10 my-auto py-3">
        <div className="relative rounded-2xl bg-[#141822]/90 backdrop-blur-2xl border border-[#272a32] p-4 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          {/* Card Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#272a32]">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-xl bg-[#1d1f27] border border-[#32353d] flex items-center justify-center p-2 shadow-lg">
                <img
                  src={SPECTRA_LOGO}
                  alt="Plate Vision Icon"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to stylized SVG if remote logo is blocked
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M3 9V5a2 2 0 0 1 2-2h4M15 3h4a2 2 0 0 1 2 2v4M21 15v4a2 2 0 0 1-2 2h-4M9 21H5a2 2 0 0 1-2-2v-4"/></svg>
                        </div>
                      `;
                    }
                  }}
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#4cd7f6] border-2 border-[#141822]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold tracking-tight text-[#e1e2ec]">PLATE VISION</h1>
                  <span className="text-[10px] font-['JetBrains_Mono',monospace] px-1.5 py-0.5 rounded bg-[#06b6d4]/15 text-[#4cd7f6] font-semibold border border-[#06b6d4]/30">
                    GATEWAY
                  </span>
                </div>
                <p className="text-[12px] text-[#869397] font-normal mt-0.5">
                  Autonomous Vision & Neural ALPR Pipeline Rig
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 font-['JetBrains_Mono',monospace]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#003640]/50 border border-[#06b6d4]/40 text-[#4cd7f6] text-[11px] font-medium">
                <Lock className="w-3 h-3" />
                <span>TLS 1.3 ZERO-TRUST</span>
              </div>
              <span className="text-[10px] text-[#869397] tracking-wider uppercase">
                HSM AUTH LEVEL 3
              </span>
            </div>
          </div>

          {/* Authentication Mode Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-6 p-1 bg-[#0b0e15] rounded-xl border border-[#272a32]">
            <button
              type="button"
              onClick={() => setActiveTab('sso')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'sso'
                  ? 'bg-[#1d1f27] text-[#e1e2ec] shadow-sm border border-[#32353d]'
                  : 'text-[#869397] hover:text-[#e1e2ec]'
              }`}
            >
              <Fingerprint className="w-4 h-4 text-[#4cd7f6]" />
              <span>Engineer SSO</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hardware')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'hardware'
                  ? 'bg-[#1d1f27] text-[#e1e2ec] shadow-sm border border-[#32353d]'
                  : 'text-[#869397] hover:text-[#e1e2ec]'
              }`}
            >
              <Key className="w-4 h-4 text-[#d0bcff]" />
              <span>Hardware Key</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('secret')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'secret'
                  ? 'bg-[#1d1f27] text-[#e1e2ec] shadow-sm border border-[#32353d]'
                  : 'text-[#869397] hover:text-[#e1e2ec]'
              }`}
            >
              <Shield className="w-4 h-4 text-[#2fd9f4]" />
              <span>Service Secret</span>
            </button>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-4 mt-6">
            {/* Field 1: Cluster Domain */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono',monospace]">
                <label htmlFor="nodeUriInput" className="text-[#869397] uppercase tracking-wider">
                  Cluster Domain / Node URI
                </label>
                <span className="text-[#4cd7f6] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
                  VERIFIED TLS NODE
                </span>
              </div>
              <div className="relative flex items-center">
                <Server className="absolute left-3 w-4 h-4 text-[#869397]" />
                <input
                  id="nodeUriInput"
                  type="text"
                  value={nodeUri}
                  onChange={(e) => setNodeUri(e.target.value)}
                  className="w-full bg-[#0b0e15] border border-[#272a32] focus:border-[#4cd7f6] rounded-xl py-2.5 pl-10 pr-24 text-[13px] font-['JetBrains_Mono',monospace] text-[#e1e2ec] outline-none transition-colors"
                />
                <span className="absolute right-2 px-2 py-1 rounded bg-[#1d1f27] border border-[#32353d] text-[10px] font-['JetBrains_Mono',monospace] text-[#869397]">
                  PORT 8443
                </span>
              </div>
            </div>

            {/* Field 2: Operator Identity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono',monospace]">
                <label htmlFor="identityInput" className="text-[#869397] uppercase tracking-wider">
                  Operator Identity
                </label>
                <span className="text-[#869397]">OIDC FEDERATED</span>
              </div>
              <div className="relative flex items-center">
                <Fingerprint className="absolute left-3 w-4 h-4 text-[#4cd7f6]" />
                <input
                  id="identityInput"
                  type="email"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="w-full bg-[#0b0e15] border border-[#272a32] focus:border-[#4cd7f6] rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-['JetBrains_Mono',monospace] text-[#e1e2ec] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Field 3: Passphrase & Secret */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono',monospace]">
                <label htmlFor="secretInput" className="text-[#869397] uppercase tracking-wider">
                  Cluster Passphrase & Secret
                </label>
                <button
                  type="button"
                  onClick={() => setPassphrase('VaultKey_' + Math.random().toString(36).slice(2, 8))}
                  className="text-[#4cd7f6] hover:underline"
                >
                  Rotated Vault Key?
                </button>
              </div>
              <div className="relative flex items-center">
                <Shield className="absolute left-3 w-4 h-4 text-[#869397]" />
                <input
                  id="secretInput"
                  type={showPassword ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full bg-[#0b0e15] border border-[#272a32] focus:border-[#4cd7f6] rounded-xl py-2.5 pl-10 pr-10 text-[13px] font-['JetBrains_Mono',monospace] text-[#e1e2ec] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#869397] hover:text-[#e1e2ec] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Entropy Ratio Indicator */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 w-36">
                  <div className="h-1 flex-1 bg-[#4cd7f6] rounded-full" />
                  <div className="h-1 flex-1 bg-[#4cd7f6] rounded-full" />
                  <div className="h-1 flex-1 bg-[#4cd7f6] rounded-full" />
                  <div className="h-1 flex-1 bg-[#272a32] rounded-full" />
                </div>
                <span className="text-[10px] font-['JetBrains_Mono',monospace] text-[#869397]">
                  256-BIT ENTROPY RATIO: <span className="text-[#4cd7f6] font-semibold">HIGH</span>
                </span>
              </div>
            </div>

            {/* Checkbox: Retain Session */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2.5 text-[13px] text-[#e1e2ec] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={retainSession}
                  onChange={(e) => setRetainSession(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0b0e15] border-[#32353d] text-[#06b6d4] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#06b6d4]"
                />
                <span>Retain rig session for 12 hours</span>
              </label>
              <span className="text-[10px] font-['JetBrains_Mono',monospace] text-[#869397] uppercase">
                AUTO-INVALIDATE ON DISCONNECT
              </span>
            </div>

            {/* Authenticate Action Button */}
            <button
              type="button"
              onClick={handleAuth}
              disabled={isAuthenticating}
              className="mt-2 w-full py-3.5 px-5 rounded-xl bg-[#4cd7f6] hover:bg-[#6be0fb] active:scale-[0.99] text-[#003640] font-semibold text-[14px] flex items-center justify-between shadow-[0_4px_20px_rgba(76,215,246,0.3)] transition-all cursor-pointer disabled:opacity-75"
            >
              <div className="flex items-center gap-2.5">
                <Radio className={`w-4 h-4 ${isAuthenticating ? 'animate-spin' : 'animate-pulse'}`} />
                <span>
                  {isAuthenticating ? (authStatus || 'Authenticating...') : 'Authenticate & Access Pipeline'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00424f] text-[#4cd7f6] text-[11px] font-['JetBrains_Mono',monospace]">
                <span>PING 4ms</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-[#272a32]" />
              <span className="absolute px-3 bg-[#141822] text-[10px] font-['JetBrains_Mono',monospace] uppercase text-[#869397] tracking-widest">
                OR HARDWARE FAST-PASS
              </span>
            </div>

            {/* YubiKey Fast Pass */}
            <button
              type="button"
              onClick={handleYubiKey}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1d1f27] hover:bg-[#272a32] border border-[#32353d] text-[13px] font-medium text-[#e1e2ec] flex items-center justify-center gap-3 transition-colors cursor-pointer"
            >
              <Key className="w-4 h-4 text-[#d0bcff]" />
              <span>FIDO2 / YubiKey Fast Pass Gateway</span>
              <span className="text-[10px] font-['JetBrains_Mono',monospace] px-2 py-0.5 rounded bg-[#0b0e15] border border-[#32353d] text-[#4cd7f6]">
                ZERO PIN
              </span>
            </button>
          </div>

          {/* Card Telemetry Footer */}
          <div className="mt-8 pt-5 border-t border-[#272a32] grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-['JetBrains_Mono',monospace]">
            <div className="flex flex-col">
              <span className="text-[#869397] uppercase">CLUSTER GATE</span>
              <span className="text-[#4cd7f6] font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
                8000/ONLINE
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#869397] uppercase">NEURAL RIG</span>
              <span className="text-[#e1e2ec] font-semibold mt-0.5">A100-SXM4</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#869397] uppercase">CIPHER SUITE</span>
              <span className="text-[#e1e2ec] font-semibold mt-0.5">AES-256-GCM</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#869397] uppercase">RIG RUNTIME</span>
              <span className="text-[#d0bcff] font-semibold mt-0.5">v3.4.1-rc</span>
            </div>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 z-10 pt-6 pb-2 text-[12px] text-[#869397]">
        <p className="max-w-md">
          Authorized personnel only. Inference queries &amp; weights are logged to distributed audit ledger.
        </p>
        <div className="flex items-center gap-4 font-['JetBrains_Mono',monospace] text-[11px]">
          <a href="#docs" onClick={(e) => { e.preventDefault(); onAuthenticate(); }} className="hover:text-[#4cd7f6] transition-colors">
            SECURITY DOCS
          </a>
          <span>/</span>
          <a href="#status" onClick={(e) => { e.preventDefault(); onAuthenticate(); }} className="hover:text-[#4cd7f6] transition-colors">
            CLUSTER STATUS
          </a>
        </div>
      </footer>
    </div>
  );
};
