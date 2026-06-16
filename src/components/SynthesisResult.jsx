import React, { useState } from 'react';
import { Brain, Sparkles, Loader2, Copy, Check, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SynthesisResult({ 
  result, 
  status, 
  error, 
  onSynthesize, 
  canSynthesize, 
  mainModelName 
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getModelTitle = (id) => {
    const titles = {
      gpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      perplexity: 'Perplexity'
    };
    return titles[id] || id;
  };

  return (
    <div 
      className="w-full max-w-4xl mx-auto glass-panel p-6 animate-slide-up"
      style={{
        border: '1px solid rgba(168, 85, 247, 0.25)',
        boxShadow: '0 15px 35px rgba(168, 85, 247, 0.08)',
        borderRadius: '16px',
        marginTop: '32px',
        textAlign: 'left'
      }}
    >
      {/* Header */}
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-5 border-b border-glass gap-4"
        style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/10 rounded-lg text-purple-400 border border-purple-500/20">
            <Brain size={20} style={{ color: '#A855F7' }} />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', margin: 0 }}>
              🧠 AI 통합 추론 & 비교 분석 리포트
            </h3>
            <span className="text-[10px] text-gray-500 block mt-0.5" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              주요 분석 엔진: {getModelTitle(mainModelName)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'success' && (
            <button 
              onClick={handleCopy} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-glass bg-white/5 hover:bg-white/10 hover:border-glass-active text-xs transition-all"
              style={{ color: 'var(--text-primary)' }}
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? '복사 완료' : '리포트 복사'}</span>
            </button>
          )}

          {status !== 'loading' && status !== 'success' && (
            <button
              onClick={onSynthesize}
              disabled={!canSynthesize}
              className="btn-primary flex items-center gap-1.5 text-xs"
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem' }}
            >
              <Sparkles size={14} />
              <span>통합 추론 생성</span>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="min-h-[120px] flex flex-col justify-center">
        {status === 'idle' && (
          <div className="text-center py-8 text-gray-500" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
            <Info size={28} className="mb-2 opacity-40 text-purple-400" style={{ color: '#A855F7' }} />
            <p className="text-xs" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
              {!canSynthesize 
                ? "모델들의 답변이 수집되는 동안 기다려 주세요.\n답변이 도착하면 '통합 추론 생성' 버튼이 활성화됩니다."
                : "비교 답변 준비가 완료되었습니다! 위의 '통합 추론 생성' 버튼을 눌러 교차 통합 분석 리포트를 확인해 보세요."
              }
            </p>
          </div>
        )}

        {status === 'loading' && (
          <div className="py-8 text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Loader2 size={32} className="animate-spin text-purple-400 mb-3" style={{ color: '#A855F7' }} />
            <p className="text-xs text-gray-400 animate-pulse" style={{ fontSize: '0.8rem' }}>
              4개 AI의 응답 차이를 종합하고 논리적 합의점을 분석하는 중입니다... 잠시만 기다려 주세요.
            </p>
            <div className="w-full max-w-md mt-6 space-y-2">
              <div className="skeleton-line" style={{ width: '90%' }}></div>
              <div className="skeleton-line" style={{ width: '80%' }}></div>
              <div className="skeleton-line" style={{ width: '95%' }}></div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-lg text-red-400 text-xs" style={{ border: '1px solid rgba(239, 68, 68, 0.15)', backgroundColor: 'rgba(239, 68, 68, 0.03)', color: '#F87171', padding: '12px', fontSize: '0.75rem' }}>
            <p className="font-semibold mb-1">통합 추론 에러 발생:</p>
            <p>{error || '보고서를 생성하는 중에 오류가 발생했습니다. 설정에서 메인 추론 모델의 API Key를 확인해 주세요.'}</p>
            <button
              onClick={onSynthesize}
              className="mt-3 btn-secondary text-xs"
              style={{ padding: '6px 12px', fontSize: '0.7rem' }}
            >
              다시 시도
            </button>
          </div>
        )}

        {status === 'success' && result && (
          <div className="markdown-body select-text p-1 animate-slide-up" style={{ fontSize: '0.925rem' }}>
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
