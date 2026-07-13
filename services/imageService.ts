import { ApiSettings, Language } from "../types";
import { buildDoodlePrompt, buildThumbnailPrompt } from "./imagePrompts";
import { generateGeminiImage } from "./geminiService";
import { generateCoachioImage } from "./coachioService";

/**
 * Single entry point for every image in the app. Picks the provider from the
 * user's API settings; both providers receive the identical prompt.
 */
const generate = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  settings: ApiSettings
): Promise<string | undefined> => {
  if (settings.imageProvider === 'coachio') {
    return generateCoachioImage(prompt, settings.coachio, aspectRatio);
  }
  return generateGeminiImage(prompt, aspectRatio);
};

export const generateDoodleImage = (
  visualPrompt: string,
  textToRender: string,
  aspectRatio: '16:9' | '9:16',
  language: Language,
  settings: ApiSettings
): Promise<string | undefined> =>
  generate(buildDoodlePrompt(visualPrompt, textToRender, aspectRatio, language), aspectRatio, settings);

export const generateThumbnailImage = (
  title: string,
  visualMetaphor: string = "",
  aspectRatio: '16:9' | '9:16',
  settings: ApiSettings
): Promise<string | undefined> =>
  generate(buildThumbnailPrompt(title, visualMetaphor), aspectRatio, settings);
