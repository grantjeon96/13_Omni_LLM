import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Key, Settings, AlertTriangle } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onSave, config }) {
  const [apiKeys, setApiKeys] = useState({
    gpt: '',
    claude: '',
    gemini: '',
    perplexity: ''
  });
  
  const [customModels, setCustomModels] = useState({
    gpt: 'gpt-4o-mini',
    claude: 'claude-3-5-sonnet-20241022',
    gemini: 'gemini-1.5-flash',
    perplexity: 'sonar'
  });

  const [mainModel, setMainModel] = useState('gemini');
  const [isMockMode, setIsMockMode] = useState(true);
  
  const [showKeys, setShowKeys] = useState({
    gpt: false,
    claude: false,
    gemini: false,
    perplexity: false
  });

  useEffect(() => {
    if (config) {
      setApiKeys(config.apiKeys || { gpt: '', claude: '', gemini: '', perplexity: '' });
      setCustomModels(config.customModels || { gpt: 'gpt-4o-mini', claude: 'claude-3-5-sonnet-20241022', gemini: 'gemini-1.5-flash', perplexity: 'sonar' });
      setMainModel(config.mainModel || 'gemini');
      setIsMockMode(config.isMockMode !== undefined ? config.isMockMode : true);
    }
  }, [config, isOpen]);

  const toggleShowKey = (type) => {
    setShowKeys(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleKeyChange = (type, value) => {
    setApiKeys(prev => ({ ...prev, [type]: value }));
  };

  const handleModelChange = (type, value) => {
    setCustomModels(prev => ({ ...prev, [type]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      apiKeys,
      customModels,
      mainModel,
      isMockMode
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
      <div 
        className="w-full max-w-2xl overflow-y-auto glass-panel animate-slide-up"
        style={{ 
          maxHeight: '90vh',
          padding: '28px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Settings size={22} className="text-purple-400" style={{ color: '#A855F7' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>API & 모델 설정</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" style={{ textAlign: 'left' }}>
          {/* Simulation Mode Toggle */}
          <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 mb-6" style={{ border: '1px solid rgba(234, 179, 8, 0.2)', backgroundColor: 'rgba(234, 179, 8, 0.05)', borderRadius: '12px' }}>
            <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex gap-3">
                <AlertTriangle className="text-yellow-500 shrink-0" style={{ color: '#F59E0B' }} size={22} />
                <div>
                  <h4 className="font-semibold text-sm text-yellow-500" style={{ color: '#F59E0B', margin: 0 }}>시뮬레이션 모드 (Simulation Mode)</h4>
                  <p className="text-xs text-gray-400 mt-1" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    API 키가 없거나 사용량을 절약하고 싶을 때 모의 답변 데이터로 UI를 작동시킵니다.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={isMockMode} 
                  onChange={(e) => setIsMockMode(e.target.checked)}
                  className="sr-only peer"
                  style={{ display: 'none' }}
                />
                <div 
                  className={`w-11 h-6 rounded-full peer transition-colors relative`}
                  style={{ 
                    backgroundColor: isMockMode ? '#A855F7' : 'rgba(255, 255, 255, 0.1)',
                    width: '44px',
                    height: '24px',
                    borderRadius: '999px',
                    cursor: 'pointer'
                  }}
                >
                  <span 
                    className="absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform" 
                    style={{
                      transform: isMockMode ? 'translateX(20px)' : 'translateX(0)',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      backgroundColor: 'white',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Primary Model Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              🎯 메인 통합 추론 AI 모델
            </label>
            <select
              value={mainModel}
              onChange={(e) => setMainModel(e.target.value)}
              className="w-full bg-slate-900 border border-glass rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-all"
              style={{
                width: '100%',
                backgroundColor: '#0F1420',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'white',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem'
              }}
            >
              <option value="gemini">Gemini (Google) - 권장</option>
              <option value="gpt">ChatGPT (OpenAI)</option>
              <option value="claude">Claude (Anthropic)</option>
              <option value="perplexity">Perplexity</option>
            </select>
            <p className="text-xs text-gray-400 mt-1.5" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              개별 모델의 답변이 도착한 후, 최종 합성/비교 분석 보고서를 작성할 모델을 고릅니다.
            </p>
          </div>

          {/* API Keys Configuration */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-300 border-b border-glass pb-2 mb-4" style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
              🔑 모델별 API Key 및 모델명 설정
            </h3>

            {/* ChatGPT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>ChatGPT API Key</label>
                <div className="relative" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showKeys.gpt ? 'text' : 'password'}
                    value={apiKeys.gpt}
                    onChange={(e) => handleKeyChange('gpt', e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full bg-slate-900 border border-glass rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    style={{ width: '100%', backgroundColor: '#0F1420', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 40px 8px 12px', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('gpt')}
                    className="absolute right-3 text-gray-400 hover:text-white"
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showKeys.gpt ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>ChatGPT 모델명</label>
                <input
                  type="text"
                  value={customModels.gpt}
                  onChange={(e) => handleModelChange('gpt', e.target.value)}
                  className="w-full bg-slate-900 border border-glass rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  style={{ width: '100%', backgroundColor: '#0F1420', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Claude */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Claude API Key</label>
                <div className="relative" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showKeys.claude ? 'text' : 'password'}
                    value={apiKeys.claude}
                    onChange={(e) => handleKeyChange('claude', e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full bg-slate-900 border border-glass rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                    style={{ width: '100%', backgroundColor: '#0F1420', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 40px 8px 12px', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('claude')}
                    className="absolute right-3 text-gray-400 hover:text-white"
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showKeys.claude ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Claude 모델명</label>
                <input
                  type="text"
                  value={customModels.claude}
                  onChange={(e) => handleModelChange('claude', e.target.value)}
                  className="w-full bg-slate-900 border border-glass rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  style={{ width: '100%', backgroundColor: '#0F1420', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Gemini */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Gemini API Key</label>
                <div className="relative" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showKeys.gemini ? 'text' : 'password'}
                    value={apiKeys.gemini}
                    onChange={(e) => handleKeyChange('gemini', e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-900 border border-glass rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    style={{ width: '100%', backgroundColor: '#0F1420', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 40px 8px 12px', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('gemini')}
                    className="absolute right-3 text-gray-400 hover:text-white"
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showKeys.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Gemini 모델명</label>
                <input
                  type="text"
                  value={customModels.gemini}
                  onChange={(e) => handleModelChange('gemini', e.target.value)}
                  className="w-full bg-slate-900 border border-glass rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  style={{ width: '100%', backgroundColor: '#0F1420', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Perplexity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Perplexity API Key</label>
                <div className="relative" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showKeys.perplexity ? 'text' : 'password'}
                    value={apiKeys.perplexity}
                    onChange={(e) => handleKeyChange('perplexity', e.target.value)}
                    placeholder="pplx-..."
                    className="w-full bg-slate-900 border border-glass rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    style={{ width: '100%', backgroundColor: '#0F1420', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 40px 8px 12px', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('perplexity')}
                    className="absolute right-3 text-gray-400 hover:text-white"
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showKeys.perplexity ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Perplexity 모델명</label>
                <input
                  type="text"
                  value={customModels.perplexity}
                  onChange={(e) => handleModelChange('perplexity', e.target.value)}
                  className="w-full bg-slate-900 border border-glass rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  style={{ width: '100%', backgroundColor: '#0F1420', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-glass" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '10px 20px' }}
            >
              설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
