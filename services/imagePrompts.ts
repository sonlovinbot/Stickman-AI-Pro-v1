import { Language } from "../types";

/**
 * The visual identity of the app lives here: both providers (Gemini and Coachio)
 * render from the exact same prompt so scenes stay stylistically consistent even
 * if the user switches provider halfway through a project.
 */

export const buildDoodlePrompt = (
  visualPrompt: string,
  textToRender: string,
  aspectRatio: '16:9' | '9:16',
  language: Language
): string => `
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

export const buildThumbnailPrompt = (
  title: string,
  visualMetaphor: string = ""
): string => `
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
