import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Scene, Language } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper for Retry Logic (Handles 429 Rate Limits and 503 Overloads)
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 5, delay = 5000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const status = error.status || (error.error && error.error.code);
    const message = error.message || "";
    
    const isRetryable = 
      status === 429 || 
      status === 503 || 
      message.includes('429') || 
      message.includes('503') ||
      message.toLowerCase().includes('overloaded') ||
      message.toLowerCase().includes('unavailable');

    if (retries > 0 && isRetryable) {
      console.warn(`Gemini API busy (${status}). Retrying in ${delay/1000}s... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      const nextDelay = delay * 1.5 + Math.random() * 1000;
      return withRetry(fn, retries - 1, nextDelay);
    }
    throw error;
  }
};

const LANGUAGE_CONFIG: Record<Language, {
    role: string;
    formulas: string;
    scriptRules: string;
    visualText: string;
    voiceName: string;
}> = {
    'Vietnamese': {
        role: "viral YouTube strategist for the Vietnamese market",
        formulas: `
        1. Extreme Transformation: [Hành động] + [Đối tượng] + [Trạng thái: LẠNH LÙNG / BẤT KHẢ CHIẾN BẠI]
        2. Cruel Truth: Tại sao bạn mãi [Thất bại/Nghèo khó] dù đã [Cố gắng]?
        3. Wake-up Call: [Làm ngay đi] nếu không muốn [Hậu quả đáng sợ].`,
        scriptRules: "Tone: Street-smart, engaging, uses Vietnamese internet slang if appropriate, distinctively Vietnamese perspective.",
        visualText: "Text inside image must be Vietnamese.",
        voiceName: "Kore"
    },
    'English': {
        role: "viral YouTube strategist for the US/Global market",
        formulas: `
        1. Extreme Transformation: How I became [Unstoppable/Stoic] by doing [Simple Action].
        2. The Harsh Truth: Why you are still [Broke/Unhappy] despite [Hard Work].
        3. The Warning: Stop doing [Action] immediately (Here is why).`,
        scriptRules: "Tone: Punchy, idiomatic English, direct, 'Better Than Yesterday' or 'Kurzgesagt' style.",
        visualText: "Text inside image must be English.",
        voiceName: "Puck"
    },
    'Japanese': {
        role: "viral YouTube strategist for the Japanese market",
        formulas: `
        1. Extreme Transformation: [Action] shite, [Status] ni naru houhou (How to become [Status] by [Action]). Use strong kanji.
        2. Cruel Truth: Nazebito wa [Fail] suru no ka? (Why people fail?).
        3. Wake-up Call: [Action] yamenasai (Stop [Action]). Zettai ni (Absolutely).`,
        scriptRules: "Tone: High-context, engaging, manga-style storytelling structure (Ki-Sho-Ten-Ketsu), polite yet impactful (Desu/Masu or Da/Dearu depending on tone).",
        visualText: "Text inside image must be Japanese (Kanji/Kana).",
        voiceName: "Kore"
    }
};

/**
 * Generate Viral Titles
 */
export const generateViralTitles = async (topic: string, tone: string, language: Language): Promise<string[]> => {
  const ai = getAI();
  const config = LANGUAGE_CONFIG[language];
  
  const prompt = `
    Act as a ${config.role}.
    Generate 5 viral YouTube titles in ${language} based on the keyword: "${topic}".
    Tone: ${tone}.
    Use strictly one of the following 3 formulas adapted for ${language} culture:
    ${config.formulas}
    
    Capitalize POWER WORDS. Return ONLY a JSON array of strings.
  `;

  try {
    return await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return response.text ? JSON.parse(response.text) : [];
    });
  } catch (error) {
    console.error("Error generating titles:", error);
    return ["Error generating titles. Please try again."];
  }
};

/**
 * Generate Script, Visual Descriptions and Keywords
 */
export const generateScriptScenes = async (title: string, duration: string, language: Language): Promise<Scene[]> => {
  const ai = getAI();
  const config = LANGUAGE_CONFIG[language];

  const prompt = `
    Act as a master storyteller for viral short videos (TikTok/Shorts style) in ${language}.
    Create a script for a video titled: "${title}".
    Target Duration: ${duration}.
    
    TONE & LANGUAGE RULES (CRITICAL):
    1. **Universal Appeal:** Simple, punchy, and understandable.
    2. **Engaging Voice:** Sound like a smart friend sharing a secret.
    3. **Cultural Context:** ${config.scriptRules}
    
    PACING RULE: **EXTREME DENSITY (2 Seconds Per Scene)**
    - Break the voiceover into TINY fragments (4-8 words max per scene).
    - Total scenes should be high count for the duration.
    
    STRUCTURE REQUIREMENTS:
    1. **THE HOOK (Scenes 1, 2, and 3):** 
       - Scene 1: Statement/Question. Scene 2: The twist/problem. Scene 3: The bridge to the solution.
    2. **The Body:** Break down the concept into visual steps.
    3. **The Conclusion:** A powerful, memorable one-liner.

    VISUAL INSTRUCTION:
    - Ensure logical visual progression (Comic strip style).
    - Visuals must be SIMPLE stick figure metaphors.

    For each scene, provide:
    - 'voiceover': ${language} spoken text. (Very short).
    - 'visualPrompt': Simple, clear visual metaphor for a stickman (Describe in English for the artist).
    - 'keywords': The exact text to be written inside the image (${config.visualText}, 1-3 words max).

    Return JSON array of objects.
  `;

  try {
    return await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview", 
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                voiceover: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
                keywords: { type: Type.STRING }
              },
              required: ["voiceover", "visualPrompt", "keywords"]
            }
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        return data.map((item: any, index: number) => ({
          id: `scene-${index}-${Date.now()}`,
          voiceover: item.voiceover,
          visualPrompt: item.visualPrompt,
          keywords: item.keywords
        }));
      }
      return [];
    });
  } catch (error) {
    console.error("Error generating script:", error);
    return [];
  }
};

/**
 * Generate Doodle Image (With Retry)
 */
export const generateDoodleImage = async (visualPrompt: string, textToRender: string, aspectRatio: '16:9' | '9:16', language: Language): Promise<string | undefined> => {
  const ai = getAI();
  
  const fullPrompt = `
    Create a clean, funny, minimalist digital illustration in the style of "Better Than Yesterday" or "Casually Explained" YouTube channels.
    
    SUBJECT: A classic STICK FIGURE representing this concept: ${visualPrompt}.
    TEXT: Write "${textToRender}" clearly in the image. Font: Hand-written, bold black.
    
    STYLE RULES:
    1. CHARACTER: Classic stickman. Perfect circle head. Simple stick limbs. 
    2. EXPRESSION: The stickman MUST have a clear facial expression (Eyes and Mouth only).
    3. LINES: Clean, consistent, smooth black lines. NOT messy. NO "pencil" texture.
    4. COLOR: BLACK lines only. 
    5. BACKGROUND: Solid OFF-WHITE / BEIGE (#FDF6E3). Flat color.
    
    Important: The text "${textToRender}" must be legible. It is in ${language}.
    
    COMPOSITION:
    - Center the stickman.
    - Keep it simple and uncluttered. 
    - High contrast: Black on Beige.
    - Format: ${aspectRatio === '9:16' ? 'Vertical Portrait (9:16)' : 'Horizontal Landscape (16:9)'}.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: fullPrompt,
      config: {
        imageConfig: { 
            aspectRatio: aspectRatio,
            imageSize: "1K"
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  });
};

/**
 * Generate Thumbnail Image (With Retry)
 */
export const generateThumbnailImage = async (title: string, visualMetaphor: string = "", aspectRatio: '16:9' | '9:16'): Promise<string | undefined> => {
    const ai = getAI();
    const prompt = `
      YouTube Thumbnail for: "${title}".
      Visual: A funny, highly expressive STICK FIGURE engaging with: ${visualMetaphor}.
      
      STYLE RULES:
      1. CHARACTER: Classic stickman. Perfect circle head. Simple stick limbs. 
      2. EXPRESSION: Highly expressive face (shocked, thinking, happy).
      3. LINES: Clean, consistent, smooth black lines. NOT messy.
      4. BACKGROUND: Solid OFF-WHITE / BEIGE (#FDF6E3). Flat color.
      
      Format: Minimalist, clean, high contrast (Black on Beige).
      No text in the image.
    `;
  
    return withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: prompt,
        config: {
          imageConfig: { 
              aspectRatio: aspectRatio,
              imageSize: "1K" 
          }
        }
      });
  
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return undefined;
    });
  };

/**
 * Rewrite script content (Longer/Shorter)
 */
export const rewriteScript = async (currentScript: string, mode: 'longer' | 'shorter', language: Language): Promise<string> => {
  const ai = getAI();
  const config = LANGUAGE_CONFIG[language];

  const prompt = `
    You are a professional video script editor for the ${language} market.
    Rewrite the following ${language} script to be ${mode === 'longer' ? 'slightly more detailed and emotional (about 20% longer)' : 'more concise and punchy (about 20% shorter)'}.
    
    IMPORTANT RULES:
    1. Keep the exact same meaning and core message.
    2. Maintain the tone: ${config.scriptRules}
    3. Return ONLY the rewriten text, no explanations.
    
    Original Script:
    "${currentScript}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || currentScript;
  } catch (error) {
    console.error("Rewrite error", error);
    return currentScript;
  }
};

/**
 * WAV Header Helper
 */
const createWavHeader = (dataLength: number, sampleRate: number = 24000) => {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataLength, true); // ChunkSize
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLength, true); // Subchunk2Size

  return buffer;
};

/**
 * Generate Speech using Gemini TTS
 */
export const generateSpeech = async (text: string, language: Language): Promise<Blob | null> => {
  const ai = getAI();
  const config = LANGUAGE_CONFIG[language];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: config.voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = createWavHeader(bytes.length, 24000);
    return new Blob([wavHeader, bytes], { type: 'audio/wav' });

  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};