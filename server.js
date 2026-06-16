import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock 답변 생성기 (API Key가 없거나 Simulation Mode일 때 사용)
const getMockResponse = (modelType, question) => {
  const delay = Math.random() * 1000 + 1000; // 1~2초 딜레이
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let content = '';
      switch (modelType) {
        case 'gpt':
          content = `[ChatGPT (GPT-4o-mini) 시뮬레이션 답변]\n\n질문하신 "${question}"에 대한 답변입니다.\n\n1. **핵심 요약**: 해당 주제는 다각적인 분석이 필요한 사안입니다.\n2. **논리적 접근**: 첫째, 기존 프레임워크에서의 논리적 타당성 검토가 중요하며, 둘째, 실제 적용 과정에서의 효율성 극대화가 요구됩니다.\n3. **결론**: 실용적인 접근 방식을 취하면서 리스크를 제어하는 전략이 가장 권장됩니다.`;
          break;
        case 'claude':
          content = `[Claude 3.5 Sonnet 시뮬레이션 답변]\n\n제공해주신 "${question}"이라는 주제를 깊이 있게 분석해 보았습니다.\n\n* **개념적 맥락**: 이 논의는 단순히 기술적 관점에 머무르지 않고, 인간적인 상호작용과 시스템적 통합이라는 두 가지 축을 모두 고려해야 합니다.\n* **구체적 제언**:\n  - 시스템의 안정적 구조화 및 모듈화 설계를 우선시할 것\n  - 사용자 경험(UX) 측면에서 발생할 수 있는 잠재적 예외 사항을 꼼꼼히 체크할 것\n\n결과적으로, 지속 가능한 아키텍처를 수립하는 것이 가장 성공적인 방향이 될 것입니다.`;
          break;
        case 'gemini':
          content = `[Gemini 1.5 Flash 시뮬레이션 답변]\n\n질문하신 "${question}"에 대해 쉽고 빠르게 핵심 위주로 답변 드리겠습니다! 🚀\n\n- **주요 포인트**:\n  - 간결함과 직관적인 처리가 가장 중요합니다.\n  - 복잡한 프로세스를 단순화하여 실행 비용을 최소화해야 합니다.\n- **해결 방안**: 단기적으로는 검증된 템플릿과 패턴을 재활용하고, 장기적으로는 유연한 확장성을 염두에 둔 인프라를 구축하는 것이 최선입니다.\n\n더 궁금한 점이 있으시면 언제든지 말씀해 주세요!`;
          break;
        case 'perplexity':
          content = `[Perplexity (Sonar) 시뮬레이션 답변]\n\n최신 정보와 웹 소스 분석을 바탕으로 "${question}"에 대해 정형화된 데이터를 제공합니다.\n\n* **최신 트렌드 분석**: 최근 이 분야에서는 효율적인 리소스 관리와 다중 플랫폼 지원(Cross-Platform)이 핵심 화두로 떠오르고 있습니다 (출처: TechReport 2026).\n* **요약 정리**:\n  1. 분산형 처리 방식의 채택 비율이 작년 대비 약 18% 증가했습니다.\n  2. 보안 및 개인정보 보호를 위한 게이트웨이 구축이 필수가 되었습니다.\n\n이러한 트렌드를 반영하여 로드맵을 작성하는 것을 권장합니다.`;
          break;
        default:
          content = `"${question}"에 대한 답변을 준비하지 못했습니다.`;
      }
      resolve({ content, model: modelType, success: true });
    }, delay);
  });
};

// 1. 개별 LLM API 호출 라우트 (CORS 우회용 프록시)
app.post('/api/query-model', async (req, res) => {
  const { modelType, apiKey, question, customModel, isMock } = req.body;

  if (isMock || !apiKey) {
    // API 키가 없거나 시뮬레이션 모드이면 Mock 답변 반환
    const mockResult = await getMockResponse(modelType, question);
    return res.json(mockResult);
  }

  try {
    let responseText = '';
    let usedModel = '';

    if (modelType === 'gpt') {
      usedModel = customModel || 'gpt-4o-mini';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: usedModel,
          messages: [{ role: 'user', content: question }]
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'OpenAI API Error');
      responseText = data.choices[0].message.content;

    } else if (modelType === 'claude') {
      usedModel = customModel || 'claude-3-5-sonnet-20241022';
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: usedModel,
          max_tokens: 2048,
          messages: [{ role: 'user', content: question }]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Anthropic API Error');
      responseText = data.content[0].text;

    } else if (modelType === 'gemini') {
      usedModel = customModel || 'gemini-1.5-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${usedModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Gemini API Error');
      responseText = data.candidates[0].content.parts[0].text;

    } else if (modelType === 'perplexity') {
      usedModel = customModel || 'sonar';
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: usedModel,
          messages: [{ role: 'user', content: question }]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Perplexity API Error');
      responseText = data.choices[0].message.content;
    } else {
      return res.status(400).json({ success: false, error: '지원하지 않는 모델 유형입니다.' });
    }

    res.json({ success: true, content: responseText, model: usedModel });

  } catch (error) {
    console.error(`Error querying ${modelType}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. 통합 추론 (Synthesized Reasoning) 라우트
app.post('/api/synthesize', async (req, res) => {
  const { responses, question, mainModel, apiKeys, isMock } = req.body;

  const prompt = `당신은 최고의 수석 분석가이자 AI 통합 추론 전문가입니다.
다음은 동일한 질문에 대한 4가지 인공지능 모델(ChatGPT, Claude, Gemini, Perplexity)의 답변입니다.

[원본 질문]
"${question}"

[ChatGPT 답변]
${responses.gpt || '답변 없음 (또는 에러)'}

[Claude 답변]
${responses.claude || '답변 없음 (또는 에러)'}

[Gemini 답변]
${responses.gemini || '답변 없음 (또는 에러)'}

[Perplexity 답변]
${responses.perplexity || '답변 없음 (또는 에러)'}

위 답변들을 철저히 비교 분석하여 다음 항목을 포함하는 종합 분석 보고서를 한글로 작성해 주세요. 
가독성을 극대화하기 위해 Markdown 형식(표, 글머리 기호, 강조 등)을 풍부하게 활용해 주세요:

1. 📊 **모델별 핵심 논지 요약 및 비교**: 4개 모델의 답변 핵심을 일목요연하게 비교하는 요약 표(Table) 제공.
2. 🤝 **공통적 합의점**: 모든 모델이 공통으로 동의하거나 중복되는 해결책 및 통찰력 분석.
3. 🔍 **의견 및 분석의 차이점**: 모델들이 다른 관점으로 접근한 부분, 강조점의 차이, 또는 의견 충돌이 발생한 부분 분석.
4. 🧠 **최종 통합 추론 및 솔루션**: 각 모델의 장점을 융합하여 도출한 가장 완성도 높은 종합 결론 및 실행 가능한(Actionable) 최선의 솔루션 제안.`;

  // 시뮬레이션 모드이거나 해당 메인 모델의 API Key가 제공되지 않았을 때의 Mock 통합 추론
  const mainModelKey = apiKeys ? apiKeys[mainModel] : null;

  if (isMock || !mainModelKey) {
    return setTimeout(() => {
      const mockSynthesis = `# 🧠 OmniLLM Hub 통합 추론 리포트 (시뮬레이션)

질문 "${question}"에 대해 ChatGPT, Claude, Gemini, Perplexity의 답변을 종합한 다차원 분석 결과입니다.

## 📊 1. 모델별 핵심 논지 요약
| 모델명 | 접근 핵심 관점 | 주요 제안 방식 | 장점 및 특징 |
| :--- | :--- | :--- | :--- |
| **ChatGPT** | 논리적 프레임워크 | 리스크 관리 및 3대 실행 축 | 매우 일목요연하고 표준화된 구조 |
| **Claude** | 시스템적 접근 | 아키텍처 안정성 및 UX 보완 | 학술적이고 깊이 있는 개념 분석 |
| **Gemini** | 실용적/속도 중심 | 기존 템플릿 재활용 및 단순화 | 빠르고 핵심 요약 위주의 실행력 |
| **Perplexity** | 최신 트렌드/데이터 | 통계 기반의 분산 처리 적용 | 웹 검색 기반 실시간 신뢰성 확보 |

---

## 🤝 2. 공통적 합의점
모든 AI 모델이 공통적으로 강조하는 사항은 다음과 같습니다:
* **구조의 유연성**: 단기적인 땜질식 해결보다 유연하고 확장 가능한 설계를 추구해야 함.
* **리스크의 체계적 제어**: 신기술이나 프로세스 도입 단계에서 예상되는 예외 리스크의 검증 필요.

---

## 🔍 3. 의견 및 분석의 차이점
* **기술 심도**: **Claude**와 **ChatGPT**는 설계의 정합성과 개념적인 논리 구조화에 집중한 반면, **Gemini**는 즉각적으로 착수할 수 있는 실무 템플릿과 실행 속도를 훨씬 더 강조합니다.
* **근거 자료**: **Perplexity**는 유일하게 최신 시장 통계 및 웹 소스를 인용하며 구체적인 동향 수치(예: 분산형 처리 18% 증가 등)를 근거로 제시했습니다.

---

## 🧠 4. 최종 통합 추론 및 최선의 솔루션
4대 인공지능의 분석을 융합하여 제안하는 **통합 로드맵**은 아래와 같습니다:

1. **1단계: 검증된 템플릿 활용 (Gemini의 추천)** - 초기 구축 비용과 설계 속도를 높이기 위해 기성 솔루션/프레임워크를 적극 차용합니다.
2. **2단계: 시스템 모듈화 및 예외 검증 (Claude & ChatGPT의 추천)** - 장기적인 확장성과 리스크 관리를 위해 레이어별로 결합도를 낮추는 구조적 설계를 보강합니다.
3. **3단계: 시장 동향 반영 (Perplexity의 추천)** - 분산 처리 및 보안 게이트웨이 동향을 인프라에 녹여내어 최신 규격을 충족합니다.

> **💡 최종 제언**: 단기적인 실행 속도와 장기적인 아키텍처의 견고함을 조합하여, 템플릿 중심의 빠른 애자일(Agile) 배포 후 레이어 분리 및 보안 보강 작업을 진행하는 2단계 접근법이 최선의 전략입니다.`;

      res.json({ success: true, content: mockSynthesis, model: mainModel });
    }, 1500);
  }

  try {
    let responseText = '';
    
    if (mainModel === 'gpt') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mainModelKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'OpenAI API Error in Synthesis');
      responseText = data.choices[0].message.content;

    } else if (mainModel === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': mainModelKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Anthropic API Error in Synthesis');
      responseText = data.content[0].text;

    } else if (mainModel === 'gemini') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${mainModelKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Gemini API Error in Synthesis');
      responseText = data.candidates[0].content.parts[0].text;

    } else if (mainModel === 'perplexity') {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mainModelKey}`
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Perplexity API Error in Synthesis');
      responseText = data.choices[0].message.content;
    }

    res.json({ success: true, content: responseText });

  } catch (error) {
    console.error('Synthesis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// React 빌드 결과물(dist) 서빙을 위한 정적 미들웨어 등록 (프로덕션 환경 대비)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));

// SPA 라우팅 대응
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[OmniLLM Backend] Server is running on http://localhost:${PORT}`);
});
