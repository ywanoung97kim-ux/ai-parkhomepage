
import React, { useState } from 'react';
import { ScriptScene, ScriptType, ScriptDuration, Category, SEOExtras } from '../types';
import { generateScript, generateSEOExtras } from '../geminiService';

interface Props {
  category: Category;
  keyword: string;
  title: string;
  onComplete: (script: ScriptScene[], type: ScriptType, duration: ScriptDuration, seo: SEOExtras) => void;
}

const DURATION_OPTIONS: Record<ScriptType, ScriptDuration[]> = {
  [ScriptType.SHORTS]: [
    { label: "30초", seconds: 30, scenes: 5 },
    { label: "50초", seconds: 50, scenes: 7 },
    { label: "59초", seconds: 59, scenes: 8 },
  ],
  [ScriptType.LONG_FORM]: [
    { label: "180초 (3분)", seconds: 180, scenes: 15 },
    { label: "300초 (5분)", seconds: 300, scenes: 25 },
    { label: "480초 (8분)", seconds: 480, scenes: 40 },
  ]
};

const Step3_Script: React.FC<Props> = ({ category, keyword, title, onComplete }) => {
  const [script, setScript] = useState<ScriptScene[]>([]);
  const [seoExtras, setSeoExtras] = useState<SEOExtras | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<ScriptType | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<ScriptDuration | null>(null);

  const handleFetchScript = async (type: ScriptType, duration: ScriptDuration) => {
    setSelectedDuration(duration);
    setLoading(true);
    try {
      const [scriptResult, seoResult] = await Promise.all([
        generateScript(category, keyword, title, type, duration),
        generateSEOExtras(keyword, title, type)
      ]);
      setScript(scriptResult);
      setSeoExtras(seoResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, msg: string = '복사되었습니다.') => {
    navigator.clipboard.writeText(text);
    // Simple notification can be added here if needed, using alert for now as requested by behavior patterns
    console.log(msg);
  };

  const copyToClipboard = () => {
    const textOnly = script.map(s => s.content).join('\n\n');
    navigator.clipboard.writeText(textOnly);
    alert('TTS용 대본이 복사되었습니다.');
  };

  if (!selectedType && script.length === 0) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">영상 형식을 선택하세요</h2>
          <p className="text-slate-500">분야: {category} | 제목: {title}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <button onClick={() => setSelectedType(ScriptType.SHORTS)} className="group p-8 border-2 border-slate-100 rounded-3xl bg-white hover:border-indigo-500 hover:shadow-xl transition-all text-left">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6"><i className="fa-solid fa-bolt text-2xl"></i></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">쇼츠(Shorts)</h3>
            <p className="text-slate-500 text-sm">임팩트 있는 핵심 요약</p>
          </button>
          <button onClick={() => setSelectedType(ScriptType.LONG_FORM)} className="group p-8 border-2 border-slate-100 rounded-3xl bg-white hover:border-indigo-500 hover:shadow-xl transition-all text-left">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6"><i className="fa-solid fa-clapperboard text-2xl"></i></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">롱폼(Long-form)</h3>
            <p className="text-slate-500 text-sm">심도 있는 분석 콘텐츠</p>
          </button>
        </div>
      </div>
    );
  }

  if (selectedType && !selectedDuration && script.length === 0) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setSelectedType(null)} className="mb-6 text-slate-400 hover:text-slate-600 flex items-center gap-2 font-medium">
          <i className="fa-solid fa-arrow-left"></i> 형식 다시 선택
        </button>
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">길이를 선택해주세요</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {DURATION_OPTIONS[selectedType].map((opt) => (
            <button key={opt.seconds} onClick={() => handleFetchScript(selectedType, opt)} className="p-6 border-2 border-slate-100 rounded-2xl bg-white hover:border-indigo-500 hover:shadow-lg transition-all text-center">
              <div className="text-2xl font-black text-slate-800 mb-1">{opt.label}</div>
              <div className="text-indigo-600 font-bold text-sm">총 {opt.scenes}개 씬</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">대본 및 크리에이터 킷</h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-800 text-white text-[10px] font-black uppercase tracking-tighter">{category}</span>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-tighter">{selectedType}</span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter">{selectedDuration?.label}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setScript([]); setSelectedType(null); setSelectedDuration(null); }} className="bg-white text-slate-600 px-4 py-2 rounded-lg font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-colors">초기화</button>
          <button onClick={copyToClipboard} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <i className="fa-solid fa-copy"></i> 전체 대본 복사
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-100">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-500 mb-4"></i>
          <p className="text-slate-600 font-medium">AI가 대본과 SEO 전략을 생성 중입니다...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* SEO Extras Box */}
          {seoExtras && (
            <div className="grid md:grid-cols-2 gap-6 bg-slate-900 text-white p-8 rounded-3xl shadow-2xl">
              <div>
                <h3 className="text-indigo-400 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-fire-flame-curved"></i> 후킹 유튜브 제목 추천
                </h3>
                <ul className="space-y-3">
                  {seoExtras.titles.map((t, idx) => (
                    <li key={idx} className="group flex items-center justify-between text-sm border-l-2 border-indigo-500/30 pl-3 py-1 hover:border-indigo-400 transition-colors">
                      <span className="flex-1 mr-2">{t}</span>
                      <button 
                        onClick={() => copyText(t)}
                        className="opacity-0 group-hover:opacity-100 bg-indigo-500/20 hover:bg-indigo-500 text-white p-1.5 rounded transition-all"
                        title="제목 복사"
                      >
                        <i className="fa-solid fa-copy text-[10px]"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-amber-400 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-eye"></i> 후킹 썸네일 문구 추천
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {seoExtras.thumbnailPhrases.map((p, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => copyText(p)}
                      className="group relative bg-slate-800 p-2 rounded border border-slate-700 text-xs text-center font-bold text-amber-100 hover:bg-slate-700 transition-colors"
                    >
                      {p}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-[8px] text-amber-400/50">
                        <i className="fa-solid fa-copy"></i>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Script Scenes */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">장면별 대본 구성</h3>
            {script.map((scene, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-slate-800 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">SCENE {idx + 1}</span>
                  <span className="text-indigo-600 font-bold text-xs">{scene.stage}</span>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{scene.content}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-8">
            <button 
              onClick={() => onComplete(script, selectedType!, selectedDuration!, seoExtras!)}
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
            >
              대본 확정 및 에셋 생성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3_Script;
