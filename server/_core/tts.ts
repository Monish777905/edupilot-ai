/**
 * Text-to-Speech Integration
 * Converts text to speech audio using Manus built-in TTS API
 * Supports English, Hindi, and Hinglish
 */

import { ENV } from "./env";

interface TTSOptions {
  text: string;
  language: "en" | "hi" | "hinglish";
  speed?: number; // 0.5 to 2.0, default 1.0
  pitch?: number; // 0.5 to 2.0, default 1.0
}

interface TTSResult {
  audioUrl: string;
  contentType: string;
  duration?: number;
}

/**
 * Generate speech audio from text
 * Uses Manus built-in TTS API with support for multiple languages
 */
export async function generateSpeech(options: TTSOptions): Promise<TTSResult> {
  try {
    const { text, language, speed = 1.0, pitch = 1.0 } = options;

    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    // Map language codes
    const languageMap: Record<string, string> = {
      en: "en-US",
      hi: "hi-IN",
      hinglish: "hi-IN", // Hinglish uses Hindi voice
    };

    const voiceLanguage = languageMap[language] || "en-US";

    // Call Manus TTS API
    const response = await fetch(`${ENV.forgeApiUrl}/tts/synthesize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        text,
        language: voiceLanguage,
        speed,
        pitch,
        audioFormat: "mp3",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`TTS API error: ${error.message || response.statusText}`);
    }

    const result = await response.json();

    return {
      audioUrl: result.audioUrl || result.audio_url,
      contentType: "audio/mpeg",
      duration: result.duration,
    };
  } catch (error) {
    console.error("[TTS] Error generating speech:", error);
    throw error;
  }
}

/**
 * Generate speech and return as base64 data URL
 * Useful for direct audio playback in browser
 */
export async function generateSpeechDataUrl(
  options: TTSOptions
): Promise<string> {
  try {
    const result = await generateSpeech(options);

    // If it's already a data URL, return it
    if (result.audioUrl.startsWith("data:")) {
      return result.audioUrl;
    }

    // Fetch the audio and convert to data URL
    const audioResponse = await fetch(result.audioUrl);
    const audioBlob = await audioResponse.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  } catch (error) {
    console.error("[TTS] Error generating speech data URL:", error);
    throw error;
  }
}

/**
 * Validate language code
 */
export function isValidLanguage(lang: string): lang is "en" | "hi" | "hinglish" {
  return ["en", "hi", "hinglish"].includes(lang);
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): Array<{
  code: "en" | "hi" | "hinglish";
  name: string;
  nativeName: string;
}> {
  return [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी" },
    { code: "hinglish", name: "Hinglish", nativeName: "हिंग्लिश" },
  ];
}
