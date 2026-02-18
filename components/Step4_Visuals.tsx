
import React, { useState } from 'react';
import { AppState, ScriptType } from '../types';
import { generateCharacterImage } from '../geminiService';

interface Props {
  state: AppState;
  onUpdateImages: (sceneIdx: number, base64: string) => void;
}

const Step4_Visuals: React.FC<Props> = ({ state, onUpdateImages }) => {
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  const handleGenerateSingle = async (idx: number) => {
    if (loadingStates[idx]) return;
    
    setLoadingStates(prev => ({ ...prev, [idx]: true }));
    try {
      const scene = state.script[idx];
      const ratio = state.scriptType === ScriptType.SHORTS ? "9:16" : "16:9";
      const imageUrl = await generateCharacterImage(state.character.description, scene.visualPrompt, ratio);
      onUpdateImages(idx, imageUrl);
    } catch (err) {
      console.error(`Failed to generate image for scene ${idx}:`, err);
      alert(`장면 ${idx + 1} 이미지 생성 중 오류가 발생했습니다.`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [idx]: false }));
    }
  };

  const handleGenerateAll = async () => {
    if (isBulkGenerating) return;
    setIsBulkGenerating(true);
    
    for (let i = 0; i < state.script.length; i++) {
      if (!state.generatedImages[i]) {
        await handleGenerateSingle(i);
      }
    }
    
    setIsBulkGenerating(false);
    alert('모든 이미지 생성이 완료되었습니다!');
  };

  const downloadImage = (base64: string, idx: number) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `scene-${idx + 1}.png`;
    link.click();
  };

  const isShorts = state.scriptType === ScriptType.SHORTS;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">비주얼 자산 생성</h2>
          <p className="text-slate-500">
            현재 <span className="text-indigo-600 font-bold">{isShorts ? '쇼츠(9:16)' : '롱폼(16:9)'}</span> 규격에 맞춰 이미지를 생성합니다.
          </p>
        </div>
        
        <button 
          onClick={handleGenerateAll}
          disabled={isBulkGenerating}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg shadow-2xl transition-all ${
            isBulkGenerating 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 shadow-indigo-500/40'
          }`}
        >
          {isBulkGenerating ? (
            <><i className="fa-solid fa-spinner fa-spin"></i> 전체 자동 생성 중...</>
          ) : (
            <><i className="fa-solid fa-wand-magic-sparkles"></i> AI 이미지 일괄 생성하기</>
          )}
        </button>
      </div>

      <div className="space-y-12">
        {state.script.map((scene, idx) => {
          const isLoading = loadingStates[idx];
          const generatedImg = state.generatedImages[idx];
          
          return (
            <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col lg:flex-row gap-8 hover:shadow-xl transition-all group">
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                      SCENE {idx + 1}
                    </span>
                    <span className="text-indigo-600 font-bold text-sm">{scene.stage}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">이미지 생성 프롬프트</label>
                  <div className="bg-slate-50 p-4 rounded-xl text-slate-600 text-sm leading-relaxed border border-slate-100">
                    {scene.visualPrompt}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">영상 제작 프롬프트 (참고용)</label>
                  <div className="bg-indigo-50/30 p-4 rounded-xl text-indigo-900/70 text-sm italic leading-relaxed border border-indigo-100/50">
                    "Cinematic movement, 4k, high quality, consistent with character features, {scene.visualPrompt.split(',').slice(0, 3).join(', ')}"
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex gap-3">
                  <button 
                    onClick={() => handleGenerateSingle(idx)}
                    disabled={isLoading || isBulkGenerating}
                    className="flex-1 bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-xl font-bold text-sm hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-image"></i>}
                    {generatedImg ? '다시 생성하기' : '이미지 생성하기'}
                  </button>
                  {generatedImg && (
                    <button 
                      onClick={() => downloadImage(generatedImg, idx)}
                      className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-download"></i> 다운로드
                    </button>
                  )}
                </div>
              </div>

              <div className={`w-full ${isShorts ? 'lg:w-64 aspect-[9/16]' : 'lg:w-[480px] aspect-video'} bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center relative transition-all duration-500 shadow-inner`}>
                {generatedImg ? (
                  <img src={generatedImg} alt={`Scene ${idx + 1}`} className="w-full h-full object-cover animate-in zoom-in-95 duration-500" />
                ) : isLoading ? (
                  <div className="text-center">
                    <i className="fa-solid fa-wand-sparkles text-3xl text-indigo-400 animate-bounce mb-3"></i>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">AI가 그림 그리는 중...</p>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <i className="fa-solid fa-mountain-sun text-4xl text-slate-200 mb-4"></i>
                    <p className="text-slate-300 text-sm font-medium">이미지 생성 버튼을<br/>눌러주세요</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 bg-indigo-900 rounded-3xl p-10 text-white text-center shadow-2xl shadow-indigo-500/40">
        <h3 className="text-2xl font-bold mb-4">콘텐츠 제작 준비 완료!</h3>
        <p className="text-indigo-200 mb-8 max-w-2xl mx-auto">
          모든 이미지와 대본이 준비되었습니다. 왼쪽 사이드바의 '일괄 다운로드'를 통해 전체 프로젝트 데이터를 저장하고 영상 편집에 활용하세요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 bg-indigo-800/50 px-4 py-2 rounded-full text-xs font-bold">
            <i className="fa-solid fa-check text-green-400"></i> {state.script.length}개 씬 구성
          </div>
          <div className="flex items-center gap-2 bg-indigo-800/50 px-4 py-2 rounded-full text-xs font-bold text-indigo-100">
            <i className="fa-solid fa-ruler-combined text-indigo-300"></i> 규격: {isShorts ? '1080 x 1920 (9:16)' : '1920 x 1080 (16:9)'}
          </div>
          <div className="flex items-center gap-2 bg-indigo-800/50 px-4 py-2 rounded-full text-xs font-bold">
            <i className="fa-solid fa-check text-green-400"></i> SEO 최적화 메타데이터 포함
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4_Visuals;
