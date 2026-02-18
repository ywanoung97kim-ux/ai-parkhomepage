
import React, { useState } from 'react';
import { generateTitles } from '../geminiService';
import { CATEGORIES, Category } from '../types';

interface Props {
  keyword: string;
  category: Category;
  onComplete: (cat: Category, kw: string, title: string) => void;
}

const Step1_Keyword: React.FC<Props> = ({ keyword, category, onComplete }) => {
  const [input, setInput] = useState(keyword);
  const [selectedCat, setSelectedCat] = useState<Category>(category);
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const result = await generateTitles(selectedCat, input);
    setTitles(result);
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">어떤 분야의 영상을 만들까요?</h2>
        <p className="text-slate-500">카테고리를 선택하고 키워드를 입력하면 AI가 SEO 최적화 제목을 추천합니다.</p>
      </div>

      <div className="mb-8">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">카테고리 선택</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-full border-2 transition-all font-medium text-sm ${
                selectedCat === cat 
                ? 'border-indigo-600 bg-indigo-600 text-white' 
                : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mb-10">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 비트코인, 탈모 예방, 삼국지 조조, 외계 생명체..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-xl font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
          분석하기
        </button>
      </div>

      {titles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">추천 제목 리스트</h3>
          <div className="grid gap-3">
            {titles.map((title, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedIndex(idx);
                  onComplete(selectedCat, input, title);
                }}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedIndex === idx 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md' 
                  : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${selectedIndex === idx ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {idx + 1}
                  </span>
                  <p className="font-semibold">{title}</p>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-6 text-center text-slate-400 text-sm">마음에 드는 제목을 선택해 주세요.</p>
        </div>
      )}
    </div>
  );
};

export default Step1_Keyword;
