
import { GoogleGenAI, Type } from "@google/genai";
import { CharacterInfo, ScriptScene, ScriptType, ScriptDuration, Category, SEOExtras } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateTitles(category: Category, keyword: string): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `분야: ${category}, 키워드: "${keyword}"를 바탕으로 유튜브 클릭률(CTR)과 검색 엔진 최적화(SEO)를 극대화한 흥미진진한 한국어 제목 10개를 작성해주세요.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse titles", e);
    return [];
  }
}

export async function generateSEOExtras(keyword: string, title: string, type: ScriptType): Promise<SEOExtras> {
  const isShorts = type === ScriptType.SHORTS;
  const prompt = `
    주제: ${keyword}
    현재 제목: ${title}
    콘텐츠 형식: ${isShorts ? '쇼츠' : '롱폼'}

    위 내용을 바탕으로 다음 두 가지를 각각 6개씩 추천해주세요:
    1. 후킹 유튜브 제목 6개 (시청자가 클릭할 수밖에 없는 자극적이고 호기심을 유발하는 제목)
    2. 후킹 썸네일 문구 6개 (이미지에 들어갈 짧고 강렬한 텍스트, 10자 내외)

    결과는 JSON 형식으로 출력하세요.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: { type: Type.ARRAY, items: { type: Type.STRING } },
          thumbnailPhrases: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["titles", "thumbnailPhrases"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"titles":[], "thumbnailPhrases":[]}');
  } catch (e) {
    return { titles: [], thumbnailPhrases: [] };
  }
}

export async function analyzeCharacter(base64Image: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "이 이미지 속 인물의 외모 특징을 분석해주세요. 나중에 이미지 생성 프롬프트로 사용할 수 있게 핵심 특징 위주로 묘사해주세요." }
      ]
    }
  });
  return response.text || "";
}

export async function generateScript(category: Category, keyword: string, title: string, type: ScriptType, duration: ScriptDuration): Promise<ScriptScene[]> {
  const isShorts = type === ScriptType.SHORTS;
  
  const prompt = `
    분야: ${category}
    주제: ${keyword}
    제목: ${title}
    형식: ${isShorts ? '유튜브 쇼츠' : '유튜브 롱폼'}
    목표 영상 길이: 약 ${duration.seconds}초
    요청 씬(Scene) 수: 정확히 ${duration.scenes}개 씬
    
    [작성 가이드]
    1. 전체 흐름은 '공감-도입-상식파괴-데이터-심리-해결책-동기부여' 구조를 ${duration.scenes}개 씬에 배분하세요.
    2. 각 분야(${category})에 맞는 전문적인 용어와 흥미로운 사실을 포함하세요.
    3. ${isShorts ? '쇼츠: 핵심만 빠르게!' : '롱폼: 깊이 있는 설명과 몰입감!'}
    4. [중요] visualPrompt 작성 시, 이미지 내에 어떠한 텍스트, 글자, 숫자가 포함되지 않도록 묘사 위주로만 작성하세요.
    5. 출력은 반드시 ${duration.scenes}개의 아이템을 가진 JSON 배열이어야 합니다.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stage: { type: Type.STRING },
            content: { type: Type.STRING },
            visualPrompt: { type: Type.STRING }
          },
          required: ["stage", "content", "visualPrompt"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse script", e);
    return [];
  }
}

export async function generateCharacterImage(
  characterDesc: string, 
  scenePrompt: string, 
  aspectRatio: "1:1" | "9:16" | "16:9" = "1:1"
): Promise<string> {
  const finalPrompt = `Full-shot of ${characterDesc}, ${scenePrompt}. 
    Style: Professional 2D illustration, thick outlines, centered, standing, simple white background, head to toe visible, clean vector style. 
    [STRICT CONSTRAINT]: DO NOT INCLUDE ANY TEXT, WORDS, LETTERS, NUMBERS, LABELS, OR SIGNS IN THE IMAGE. THE IMAGE MUST BE COMPLETELY TEXT-FREE.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: finalPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}
