
import React, { useState } from 'react';
import { Step, AppState, ScriptScene, ScriptType, ScriptDuration, Category, SEOExtras } from './types';
import Sidebar from './components/Sidebar';
import Step1_Keyword from './components/Step1_Keyword';
import Step2_Character from './components/Step2_Character';
import Step3_Script from './components/Step3_Script';
import Step4_Visuals from './components/Step4_Visuals';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentStep: Step.KEYWORD,
    category: '경제',
    keyword: '',
    selectedTitle: '',
    character: { description: '', style: 'Classic' },
    script: [],
    scriptType: null,
    scriptDuration: null,
    seoExtras: null,
    generatedImages: {}
  });

  const nextStep = () => setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 4) }));
  const prevStep = () => setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  const resetApp = () => setState({
    currentStep: Step.KEYWORD,
    category: '경제',
    keyword: '',
    selectedTitle: '',
    character: { description: '', style: 'Classic' },
    script: [],
    scriptType: null,
    scriptDuration: null,
    seoExtras: null,
    generatedImages: {}
  });

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case Step.KEYWORD:
        return <Step1_Keyword 
                  keyword={state.keyword} 
                  category={state.category}
                  onComplete={(cat, kw, title) => { updateState({ category: cat, keyword: kw, selectedTitle: title }); nextStep(); }} 
               />;
      case Step.CHARACTER:
        return <Step2_Character 
                  character={state.character} 
                  onComplete={(char) => { updateState({ character: char }); nextStep(); }} 
               />;
      case Step.SCRIPT:
        return <Step3_Script 
                  category={state.category}
                  keyword={state.keyword}
                  title={state.selectedTitle}
                  onComplete={(script, type, duration, seo) => { 
                    updateState({ script, scriptType: type, scriptDuration: duration, seoExtras: seo }); 
                    nextStep(); 
                  }} 
               />;
      case Step.VISUALS:
        return <Step4_Visuals 
                  state={state} 
                  onUpdateImages={(sceneIdx, base64) => {
                    updateState({ generatedImages: { ...state.generatedImages, [sceneIdx]: base64 } });
                  }}
               />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        currentStep={state.currentStep} 
        onNavigate={(s) => setState(p => ({...p, currentStep: s}))}
        onReset={resetApp}
        state={state}
      />
      
      <main className="flex-1 bg-white p-6 md:p-12 overflow-y-auto max-h-screen">
        <div className="max-w-4xl mx-auto">
          {renderStep()}
          
          <div className="mt-12 flex items-center justify-between border-t pt-6">
            <button 
              onClick={prevStep}
              disabled={state.currentStep === Step.KEYWORD}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${state.currentStep === Step.KEYWORD ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <i className="fa-solid fa-arrow-left mr-2"></i> 이전 단계
            </button>

            <div className="text-sm font-medium text-slate-400">
              Step {state.currentStep} / 4
            </div>

            <button 
              onClick={nextStep}
              disabled={state.currentStep === Step.VISUALS || (state.currentStep === Step.KEYWORD && !state.selectedTitle) || (state.currentStep === Step.SCRIPT && state.script.length === 0)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${state.currentStep === Step.VISUALS || (state.currentStep === Step.KEYWORD && !state.selectedTitle) || (state.currentStep === Step.SCRIPT && state.script.length === 0) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'}`}
            >
              다음 단계 <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
