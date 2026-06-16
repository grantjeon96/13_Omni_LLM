import React, { useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

export default function ChatInput({ value, onChange, onSubmit, isLoading }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      // 높이 초기화 후 스크롤 높이에 맞추어 크기 조절
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="w-full max-w-4xl mx-auto mb-8 animate-slide-up" style={{ margin: '0 auto 32px' }}>
      <div 
        className="relative flex items-end gap-2 p-3 glass-panel"
        style={{
          border: '1px solid var(--border-glass-active)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          borderRadius: '16px'
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="비교 분석할 질문을 입력해 주세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent border-0 outline-none resize-none text-white placeholder-gray-500 py-2.5 px-3 max-h-[200px]"
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.975rem',
            lineHeight: 1.5
          }}
        />

        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="text-[10px] text-gray-500 select-none hidden md:flex items-center gap-1" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <CornerDownLeft size={10} /> Enter
          </span>
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className="p-3 rounded-xl transition-all flex items-center justify-center btn-primary"
            style={{ 
              width: '44px',
              height: '44px',
              padding: 0,
              boxShadow: value.trim() && !isLoading ? '0 4px 12px rgba(168, 85, 247, 0.3)' : 'none',
              borderRadius: '12px'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </form>
  );
}
