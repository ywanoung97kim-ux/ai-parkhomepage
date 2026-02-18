
export enum Step {
  KEYWORD = 1,
  CHARACTER = 2,
  SCRIPT = 3,
  VISUALS = 4
}

export enum ScriptType {
  SHORTS = 'SHORTS',
  LONG_FORM = 'LONG_FORM'
}

export type Category = '경제' | '건강' | '역사' | '야담' | '군사무기' | '과학' | '우주';

export interface ScriptDuration {
  label: string;
  seconds: number;
  scenes: number;
}

export interface CharacterInfo {
  description: string;
  style: string;
  base64?: string;
}

export interface ScriptScene {
  stage: string;
  content: string;
  visualPrompt: string;
}

export interface SEOExtras {
  titles: string[];
  thumbnailPhrases: string[];
}

export interface AppState {
  currentStep: Step;
  category: Category;
  keyword: string;
  selectedTitle: string;
  character: CharacterInfo;
  script: ScriptScene[];
  scriptType: ScriptType | null;
  scriptDuration: ScriptDuration | null;
  seoExtras: SEOExtras | null;
  generatedImages: Record<number, string>; // sceneIndex -> base64
}

export const CATEGORIES: Category[] = ['경제', '건강', '역사', '야담', '군사무기', '과학', '우주'];

export const SCRIPT_STAGES = [
  "공감", "도입", "상식파괴", "데이터", "심리", "해결책", "동기부여"
];
