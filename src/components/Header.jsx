import React from 'react';
import { Settings, Brain, Sparkles, ShieldAlert } from 'lucide-react';

export default function Header({ onOpenSettings, isMockMode }) {
  return (
    <header className="w-full flex items-center justify-between py-6 px-6 mb-8 glass-panel animate-slide-up" style={{ borderRadius: '0 0 16px 16px', borderTop: 'none' }}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-purple-600/10 rounded-xl border border-purple-500/20 text-purple-400 flex items-center justify-center">
          <Brain size={26} className="pulse-animation" style={{ color: '#A855F7' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, margin: 0, padding: 0 }}>
            OmniLLM Hub
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: '2px', textAlign: 'left' }}>
            다중 AI 교차 비교 및 통합 추론 시스템
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isMockMode ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', color: '#F59E0B' }}>
            <ShieldAlert size={14} />
            <span>시뮬레이션 모드 활성</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10B981' }}>
            <Sparkles size={14} />
            <span>실제 API 모드</span>
          </div>
        )}

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl border border-glass bg-white/5 hover:bg-white/10 hover:border-glass-active transition-all"
          title="API 및 모델 설정"
          style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
