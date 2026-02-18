
import React from 'react';
import { Step, AppState } from '../types';

interface SidebarProps {
  currentStep: Step;
  onNavigate: (s: Step) => void;
  onReset: () => void;
  state: AppState;
}

const Sidebar: React.FC<SidebarProps> = ({ currentStep, onNavigate, onReset, state }) => {
  const steps = [
    { id: Step.KEYWORD, name: '주제 선정', icon: 'fa-magnifying-glass-chart' },
    { id: Step.CHARACTER, name: '캐릭터 설정', icon: 'fa-user-tie' },
    { id: Step.SCRIPT, name: '대본 작성', icon: 'fa-pen-nib' },
    { id: Step.VISUALS, name: '에셋 생성', icon: 'fa-clapperboard' },
  ];

  const handleBulkDownload = () => {
    const data = {
      project: "AI PARK",
      keyword: state.keyword,
      title: state.selectedTitle,
      character: state.character.description,
      script: state.script,
      images: state.generatedImages
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aipark-${state.keyword || 'export'}.json`;
    a.click();
  };

  return (
    <aside className="w-full md:w-72 bg-slate-900 text-white p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <i className="fa-solid fa-square-rss text-xl"></i>
        </div>
        <h1 className="text-xl font-bold tracking-tight">AI PARK</h1>
      </div>

      <nav className="flex-1 space-y-4">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          return (
            <button
              key={step.id}
              onClick={() => isDone && onNavigate(step.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                isActive ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20' : 
                isDone ? 'text-indigo-300 hover:bg-slate-800' : 'text-slate-500 cursor-not-allowed'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${
                isActive ? 'border-indigo-300 bg-indigo-500' : 
                isDone ? 'border-indigo-500 bg-slate-800' : 'border-slate-700'
              }`}>
                {isDone ? <i className="fa-solid fa-check"></i> : step.id}
              </div>
              <span className={`font-medium ${isActive ? 'text-white' : 'text-inherit'}`}>
                {step.name}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-10 space-y-3">
        <button 
          onClick={handleBulkDownload}
          disabled={!state.script.length}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fa-solid fa-download"></i> 일괄 다운로드
        </button>
        <button 
          onClick={onReset}
          className="w-full text-slate-400 hover:text-white py-2 text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <i className="fa-solid fa-rotate-left"></i> 프로젝트 다시 시작
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
