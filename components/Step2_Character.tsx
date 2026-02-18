
import React, { useState } from 'react';
import { CharacterInfo } from '../types';
import { analyzeCharacter } from '../geminiService';

interface Props {
  character: CharacterInfo;
  onComplete: (char: CharacterInfo) => void;
}

const STYLES = [
  { id: 'Classic', name: '클래식 정장', icon: 'fa-briefcase' },
  { id: 'SmartCasual', name: '스마트 캐주얼', icon: 'fa-vest' },
  { id: 'YoungTech', name: '영 테크 브로', icon: 'fa-laptop-code' },
  { id: 'Friendly', name: '친근한 이웃', icon: 'fa-mug-hot' }
];

const Step2_Character: React.FC<Props> = ({ character, onComplete }) => {
  const [desc, setDesc] = useState(character.description);
  const [style, setStyle] = useState(character.style);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setPreview(reader.result as string);
      setLoading(true);
      try {
        const analysis = await analyzeCharacter(base64);
        setDesc(analysis);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">영상 주인공을 만들어볼까요?</h2>
        <p className="text-slate-500">참고 이미지를 올리거나 스타일을 선택해 일관된 아바타를 생성합니다.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="space-y-6">
          <label className="block p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 transition-all cursor-pointer group bg-slate-50">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            <div className="text-center">
              {preview ? (
                <img src={preview} alt="Preview" className="mx-auto w-32 h-32 object-cover rounded-xl shadow-md mb-4" />
              ) : (
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-camera-retro text-2xl text-indigo-500"></i>
                </div>
              )}
              <p className="font-bold text-slate-700">참고 이미지 업로드</p>
              <p className="text-xs text-slate-400 mt-1">화풍, 비율, 특징을 추출합니다</p>
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  style === s.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <i className={`fa-solid ${s.icon} text-lg`}></i>
                <span className="text-sm font-medium">{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-bold text-slate-400 uppercase mb-2">캐릭터 상세 특징 (자동 분석)</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={loading ? "이미지를 분석 중입니다..." : "이미지를 업로드하거나 특징을 직접 입력해주세요."}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700 leading-relaxed"
          />
          <button 
            onClick={() => onComplete({ description: desc, style })}
            disabled={!desc || loading}
            className="mt-4 bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            설정 완료 및 다음으로
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2_Character;
