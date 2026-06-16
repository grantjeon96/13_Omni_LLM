import React, { useState } from 'react';
import { Maximize2, Minimize2, CheckCircle2, AlertCircle, Clock, Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ModelColumn({ type, name, response, status, error, customModelName }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // 모델별 테마 설정
  const getTheme = () => {
    switch (type) {
      case 'gpt':
        return {
          title: 'ChatGPT',
          modelDefault: customModelName || 'gpt-4o-mini',
          color: '#10A37F',
          bgColor: 'rgba(16, 163, 127, 0.08)',
          borderColor: 'rgba(16, 163, 127, 0.25)',
          glowColor: 'rgba(16, 163, 127, 0.15)'
        };
      case 'claude':
        return {
          title: 'Claude',
          modelDefault: customModelName || 'claude-3-5-sonnet',
          color: '#D97752',
          bgColor: 'rgba(217, 119, 82, 0.12)',
          borderColor: 'rgba(217, 119, 82, 0.25)',
          glowColor: 'rgba(217, 119, 82, 0.15)'
        };
      case 'gemini':
        return {
          title: 'Gemini',
          modelDefault: customModelName || 'gemini-1.5-flash',
          color: '#4285F4',
          bgColor: 'rgba(66, 133, 244, 0.1)',
          borderColor: 'rgba(66, 133, 244, 0.25)',
          glowColor: 'rgba(66, 133, 244, 0.15)'
        };
      case 'perplexity':
        return {
          title: 'Perplexity',
          modelDefault: customModelName || 'sonar',
          color: '#19C37D',
          bgColor: 'rgba(25, 195, 125, 0.08)',
          borderColor: 'rgba(25, 195, 125, 0.25)',
          glowColor: 'rgba(25, 195, 125, 0.15)'
        };
      default:
        return {
          title: 'Unknown',
          modelDefault: '',
          color: '#8B5CF6',
          bgColor: 'rgba(139, 92, 246, 0.1)',
          borderColor: 'rgba(139, 92, 246, 0.2)',
          glowColor: 'rgba(139, 92, 246, 0.1)'
        };
    }
  };

  const theme = getTheme();

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 렌더링 상태 배지
  const renderStatusBadge = () => {
    switch (status) {
      case 'loading':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-yellow-400 animate-pulse" style={{ color: '#F59E0B' }}>
            <Loader2 size={12} className="animate-spin" />
            <span>답변 생성 중</span>
          </span>
        );
      case 'success':
        return (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400" style={{ color: '#10B981' }}>
            <CheckCircle2 size={12} />
            <span>완료</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-400" style={{ color: '#EF4444' }}>
            <AlertCircle size={12} />
            <span>에러</span>
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-500" style={{ color: 'var(--text-muted)' }}>
            <Clock size={12} />
            <span>대기 중</span>
          </span>
        );
    }
  };

  // 로딩 중일 때 표시할 스켈레톤 UI
  const renderSkeleton = () => (
    <div className="py-4 px-2">
      <div className="skeleton-line" style={{ width: '85%' }}></div>
      <div className="skeleton-line" style={{ width: '95%' }}></div>
      <div className="skeleton-line" style={{ width: '70%' }}></div>
      <div className="skeleton-line" style={{ width: '80%' }}></div>
      <div className="skeleton-line" style={{ width: '50%' }}></div>
    </div>
  );

  const cardStyle = {
    borderColor: status === 'error' ? 'rgba(239, 68, 68, 0.4)' : theme.borderColor,
    boxShadow: status === 'loading' ? `0 0 15px ${theme.glowColor}` : 'none'
  };

  // 카드 내용 렌더링
  const renderContent = () => {
    if (status === 'idle') {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
          <Clock size={36} className="mb-2 opacity-30" />
          <p className="text-xs" style={{ fontSize: '0.8rem' }}>질문을 입력하면<br />답변을 불러옵니다.</p>
        </div>
      );
    }

    if (status === 'loading') {
      return renderSkeleton();
    }

    if (status === 'error') {
      return (
        <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-lg text-red-400 text-xs" style={{ border: '1px solid rgba(239, 68, 68, 0.15)', backgroundColor: 'rgba(239, 68, 68, 0.03)', color: '#F87171', padding: '12px', fontSize: '0.75rem', textAlign: 'left' }}>
          <p className="font-semibold mb-1">에러 발생:</p>
          <p className="break-all">{error || '알 수 없는 오류가 발생했습니다. 설정에서 API Key를 확인해 주세요.'}</p>
        </div>
      );
    }

    return (
      <div className="markdown-body select-text" style={{ textAlign: 'left', wordBreak: 'break-word' }}>
        <ReactMarkdown>{response}</ReactMarkdown>
      </div>
    );
  };

  const cardLayout = (
    <div 
      className={`glass-card flex flex-col p-5 h-[480px] overflow-hidden`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isExpanded ? '100%' : '480px',
        border: '1px solid var(--border-glass)',
        ...cardStyle
      }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
        <div className="flex items-center gap-2">
          <div 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: theme.color }}
          />
          <div>
            <h3 className="font-bold text-sm" style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', margin: 0 }}>
              {theme.title}
            </h3>
            <span className="text-[9px] text-gray-500 block" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {theme.modelDefault}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {renderStatusBadge()}
          
          {status === 'success' && (
            <button 
              onClick={handleCopy} 
              className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              title="복사"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          )}
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            title={isExpanded ? "축소" : "확대"}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 overflow-y-auto pr-1" style={{ flex: 1, overflowY: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );

  if (isExpanded) {
    return (
      <>
        {/* Placeholder to maintain layout */}
        <div className="hidden lg:block h-[480px] border border-dashed border-glass rounded-xl" style={{ border: '1px dashed var(--border-glass)', borderRadius: '12px', height: '480px' }} />
        
        {/* Fullscreen Overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div 
            className="w-full max-w-4xl h-[80vh] glass-panel p-6 animate-slide-up flex flex-col"
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              ...cardStyle
            }}
          >
            {/* Expanded Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.color }} />
                <div>
                  <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.25rem' }}>
                    {theme.title} Answer View
                  </h2>
                  <span className="text-xs text-gray-500" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    모델: {theme.modelDefault}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {renderStatusBadge()}
                {status === 'success' && (
                  <button 
                    onClick={handleCopy} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-glass bg-white/5 hover:bg-white/10 hover:border-glass-active text-xs transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? '복사됨' : '답변 복사'}</span>
                  </button>
                )}
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {/* Expanded Body */}
            <div className="flex-1 overflow-y-auto pr-2" style={{ flex: 1, overflowY: 'auto' }}>
              {renderContent()}
            </div>
          </div>
        </div>
      </>
    );
  }

  return cardLayout;
}
