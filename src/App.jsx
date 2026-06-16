import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import ModelColumn from './components/ModelColumn';
import SynthesisResult from './components/SynthesisResult';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [question, setQuestion] = useState('');
  const [activeQuestion, setActiveQuestion] = useState(''); // 현재 분석 중인 질문 보관용
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 설정 상태
  const [config, setConfig] = useState({
    apiKeys: { gpt: '', claude: '', gemini: '', perplexity: '' },
    customModels: { gpt: 'gpt-4o-mini', claude: 'claude-3-5-sonnet-20241022', gemini: 'gemini-1.5-flash', perplexity: 'sonar' },
    mainModel: 'gemini',
    isMockMode: true
  });

  // 개별 AI 응답 상태
  const [responses, setResponses] = useState({ gpt: '', claude: '', gemini: '', perplexity: '' });
  const [statuses, setStatuses] = useState({ gpt: 'idle', claude: 'idle', gemini: 'idle', perplexity: 'idle' });
  const [errors, setErrors] = useState({ gpt: '', claude: '', gemini: '', perplexity: '' });

  // 통합 추론 상태
  const [synthesisResult, setSynthesisResult] = useState('');
  const [synthesisStatus, setSynthesisStatus] = useState('idle');
  const [synthesisError, setSynthesisError] = useState('');

  // 1. 컴포넌트 마운트 시 LocalStorage에서 설정 로드
  useEffect(() => {
    const savedConfig = localStorage.getItem('omni_llm_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // 하위 호환성을 위한 키 맵핑 보장
        const mergedConfig = {
          apiKeys: { ...config.apiKeys, ...(parsed.apiKeys || {}) },
          customModels: { ...config.customModels, ...(parsed.customModels || {}) },
          mainModel: parsed.mainModel || 'gemini',
          isMockMode: parsed.isMockMode !== undefined ? parsed.isMockMode : true
        };
        setConfig(mergedConfig);
      } catch (e) {
        console.error('Failed to parse saved config, using defaults.');
      }
    } else {
      // 최초 사용자에게 설정 모달 노출 유도
      setIsSettingsOpen(true);
    }
  }, []);

  // 2. 설정 저장
  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('omni_llm_config', JSON.stringify(newConfig));
  };

  // 3. 질문 제출 (4개 LLM에 시차를 두고 순차 요청)
  const handleSubmitQuestion = () => {
    if (!question.trim()) return;

    const currentQuestion = question;
    setActiveQuestion(currentQuestion);
    setQuestion(''); // 입력창 초기화
    
    // 이전 결과 초기화
    setResponses({ gpt: '', claude: '', gemini: '', perplexity: '' });
    setErrors({ gpt: '', claude: '', gemini: '', perplexity: '' });
    setStatuses({ gpt: 'idle', claude: 'idle', gemini: 'idle', perplexity: 'idle' });
    
    setSynthesisResult('');
    setSynthesisStatus('idle');
    setSynthesisError('');

    const models = ['gpt', 'claude', 'gemini', 'perplexity'];

    models.forEach((modelType, index) => {
      // 각 모델별로 500ms(0.5초) 간격의 딜레이를 두고 백엔드에 요청 시작
      setTimeout(async () => {
        setStatuses(prev => ({ ...prev, [modelType]: 'loading' }));
        
        try {
          const res = await fetch('/api/query-model', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              modelType,
              apiKey: config.apiKeys[modelType],
              question: currentQuestion,
              customModel: config.customModels[modelType],
              isMock: config.isMockMode
            })
          });

          const data = await res.json();

          if (data.success) {
            setResponses(prev => ({ ...prev, [modelType]: data.content }));
            setStatuses(prev => ({ ...prev, [modelType]: 'success' }));
          } else {
            setStatuses(prev => ({ ...prev, [modelType]: 'error' }));
            setErrors(prev => ({ ...prev, [modelType]: data.error || '답변 수집 실패' }));
          }
        } catch (err) {
          console.error(`API Call failed for ${modelType}:`, err);
          setStatuses(prev => ({ ...prev, [modelType]: 'error' }));
          setErrors(prev => ({ ...prev, [modelType]: err.message || '네트워크 연결 오류' }));
        }
      }, index * 500); // Staggered delay
    });
  };

  // 4. 통합 추론 (합성 분석 리포트 생성)
  const handleSynthesize = async () => {
    // 적어도 하나 이상의 응답이 성공했는지 체크
    const successModels = Object.keys(statuses).filter(k => statuses[k] === 'success');
    if (successModels.length === 0) return;

    setSynthesisStatus('loading');
    setSynthesisError('');

    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          responses,
          question: activeQuestion,
          mainModel: config.mainModel,
          apiKeys: config.apiKeys,
          isMock: config.isMockMode
        })
      });

      const data = await res.json();

      if (data.success) {
        setSynthesisResult(data.content);
        setSynthesisStatus('success');
      } else {
        setSynthesisStatus('error');
        setSynthesisError(data.error || '통합 추론 리포트 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('Synthesis request failed:', err);
      setSynthesisStatus('error');
      setSynthesisError(err.message || '네트워크 연결 오류');
    }
  };

  // 4개 모델 중 하나 이상 완료되었을 때 합성 분석 활성화
  const canSynthesize = Object.values(statuses).some(s => s === 'success') && synthesisStatus !== 'loading';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-16 min-h-screen flex flex-col" style={{ width: '100%', margin: '0 auto' }}>
      {/* 상단 네비게이션 헤더 */}
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        isMockMode={config.isMockMode} 
      />

      {/* 메인 질문 입력창 */}
      <main className="flex-1 flex flex-col justify-start">
        <ChatInput 
          value={question} 
          onChange={setQuestion} 
          onSubmit={handleSubmitQuestion} 
          isLoading={Object.values(statuses).some(s => s === 'loading')}
        />

        {/* 현재 입력된 질문의 분석 상태 표시 */}
        {activeQuestion && (
          <div className="mb-6 p-4 glass-card text-left animate-slide-up" style={{ borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <span className="text-[10px] text-purple-400 font-bold block mb-1" style={{ color: '#A855F7', fontSize: '0.65rem' }}>CURRENT QUESTION</span>
            <p className="text-sm font-medium text-white" style={{ fontSize: '0.9rem', margin: 0 }}>Q. {activeQuestion}</p>
          </div>
        )}

        {/* 4대 AI 비교 컬럼 그리드 */}
        <div className="models-grid animate-slide-up">
          <ModelColumn 
            type="gpt"
            name="ChatGPT" 
            response={responses.gpt}
            status={statuses.gpt}
            error={errors.gpt}
            customModelName={config.customModels.gpt}
          />
          <ModelColumn 
            type="claude"
            name="Claude" 
            response={responses.claude}
            status={statuses.claude}
            error={errors.claude}
            customModelName={config.customModels.claude}
          />
          <ModelColumn 
            type="gemini"
            name="Gemini" 
            response={responses.gemini}
            status={statuses.gemini}
            error={errors.gemini}
            customModelName={config.customModels.gemini}
          />
          <ModelColumn 
            type="perplexity"
            name="Perplexity" 
            response={responses.perplexity}
            status={statuses.perplexity}
            error={errors.perplexity}
            customModelName={config.customModels.perplexity}
          />
        </div>

        {/* 하단 통합 추론 영역 */}
        {(activeQuestion || synthesisResult) && (
          <SynthesisResult 
            result={synthesisResult}
            status={synthesisStatus}
            error={synthesisError}
            onSynthesize={handleSynthesize}
            canSynthesize={canSynthesize}
            mainModelName={config.mainModel}
          />
        )}
      </main>

      {/* 설정 관리 모달 */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveConfig}
        config={config}
      />
    </div>
  );
}
