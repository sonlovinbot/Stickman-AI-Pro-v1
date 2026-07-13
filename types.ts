export interface Scene {
  id: string;
  voiceover: string;
  visualPrompt: string;
  keywords: string; // New field for text on image
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

export interface Script {
  title: string;
  scenes: Scene[];
}

export interface GeneratedTitle {
  id: string;
  text: string;
  selected: boolean;
}

export enum AppStep {
  INPUT_TOPIC = 0,
  SELECT_TITLE = 1,
  REVIEW_SCRIPT = 2,
  GENERATE_VISUALS = 3,
  GENERATE_THUMBNAIL = 4,
  GENERATE_AUDIO = 5
}

export type Language = 'Vietnamese' | 'English' | 'Japanese';

export interface GenerationConfig {
  topic: string;
  tone: 'Stoic' | 'Motivational' | 'Dark Philosophy' | 'Humorous';
  duration: 'Short (60s)' | 'Medium (3 mins)' | 'Long (5-10 mins)';
  aspectRatio: '16:9' | '9:16';
  language: Language;
}