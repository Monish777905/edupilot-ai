# EduPilot AI - Voice Integration Guide

## Overview

EduPilot AI now features comprehensive voice integration across all 8 teaching modules, enabling hands-free classroom interaction with full support for English, Hindi, and Hinglish.

## Voice System Architecture

### Components

**Frontend Components:**
- `VoiceRecorder.tsx` - Speech-to-Text (STT) input component
- `VoicePlayer.tsx` - Text-to-Speech (TTS) output component

**Backend Services:**
- `server/_core/voiceTranscription.ts` - Whisper API integration for STT
- `server/_core/tts.ts` - Text-to-Speech generation service
- `server/routers.ts` - tRPC procedures for voice operations

**Database:**
- `audioRecordings` table - Stores voice input/output history

## Voice Features by Module

### 1. Concept Simplifier
- **Voice Input**: Speak topic name to generate explanations
- **Voice Output**: Listen to explanations and key points
- **Languages**: English, Hindi, Hinglish

**Usage:**
```tsx
<VoiceRecorder
  onTranscribed={handleVoiceInput}
  language={language}
  placeholder="Speak your topic..."
/>

<VoicePlayer
  text={explanation}
  language={language}
/>
```

### 2. Quiz Generator
- **Voice Input**: Speak quiz topic
- **Voice Output**: Listen to quiz questions (future enhancement)
- **Languages**: English, Hindi, Hinglish

### 3. Doubt Solver
- **Voice Input**: Speak questions in chat
- **Voice Output**: Listen to AI answers (future enhancement)
- **Languages**: English, Hindi, Hinglish

### 4. Story Mode
- **Voice Input**: Speak story topic
- **Voice Output**: Listen to generated stories (future enhancement)
- **Languages**: English, Hindi, Hinglish

### 5. Lesson Planner
- **Voice Input**: Speak lesson topic
- **Voice Output**: Listen to lesson objectives (future enhancement)
- **Languages**: English, Hindi, Hinglish

### 6. AI Whiteboard
- **Voice Input**: Speak diagram/visual description
- **Voice Output**: N/A (visual output)
- **Languages**: English, Hindi, Hinglish

### 7. Activity Guide
- **Voice Input**: Speak activity topic
- **Voice Output**: Listen to activity descriptions (future enhancement)
- **Languages**: English, Hindi, Hinglish

### 8. Bilingual Translation
- **Voice Input**: Speak text to translate
- **Voice Output**: Listen to translated text
- **Languages**: English, Hindi, Hinglish

## API Integration

### Speech-to-Text (STT)

**Endpoint:** `voice.transcribeAudioFile`

```typescript
const result = await trpc.voice.transcribeAudioFile.useMutation({
  audioUrl: base64AudioData,
  language: "hinglish" // "en", "hi", or "hinglish"
});

// Returns:
{
  text: "transcribed text",
  language: "hinglish",
  segments: [/* timing info */]
}
```

**Supported Languages:**
- `en` - English
- `hi` - Hindi
- `hinglish` - Mixed Hindi-English

### Text-to-Speech (TTS)

**Endpoint:** `voice.generateSpeech`

```typescript
const result = await trpc.voice.generateSpeech.useMutation({
  text: "text to speak",
  language: "hinglish" // "en", "hi", or "hinglish"
});

// Returns:
{
  audioUrl: "data:audio/mp3;base64,...",
  language: "hinglish"
}
```

## Component Usage

### VoiceRecorder Component

**Props:**
```typescript
interface VoiceRecorderProps {
  onTranscribed: (text: string) => void;  // Callback with transcribed text
  language?: "en" | "hi" | "hinglish";    // Input language
  placeholder?: string;                    // Tooltip text
  disabled?: boolean;                      // Disable recording
}
```

**Example:**
```tsx
import VoiceRecorder from "@/components/VoiceRecorder";

function MyComponent() {
  const handleVoiceInput = (text: string) => {
    console.log("Transcribed:", text);
  };

  return (
    <VoiceRecorder
      onTranscribed={handleVoiceInput}
      language="hinglish"
      placeholder="Speak here..."
    />
  );
}
```

**Features:**
- Real-time recording indicator with visual feedback
- Automatic transcription via Whisper API
- Error handling for microphone access
- Loading states during processing
- Support for 3 languages

### VoicePlayer Component

**Props:**
```typescript
interface VoicePlayerProps {
  text: string;                            // Text to convert to speech
  language?: "en" | "hi" | "hinglish";    // Output language
  disabled?: boolean;                      // Disable playback
  autoPlay?: boolean;                      // Auto-play on mount
}
```

**Example:**
```tsx
import VoicePlayer from "@/components/VoicePlayer";

function MyComponent() {
  const [text, setText] = useState("Hello world");

  return (
    <VoicePlayer
      text={text}
      language="en"
    />
  );
}
```

**Features:**
- Play/pause controls
- Automatic TTS generation
- Loading states
- Error handling
- Optional auto-play on component mount

## Implementation Patterns

### Pattern 1: Voice Input Only

```tsx
const [topic, setTopic] = useState("");

const handleVoiceInput = (text: string) => {
  setTopic(text);
};

return (
  <div>
    <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
    <VoiceRecorder onTranscribed={handleVoiceInput} language="hinglish" />
  </div>
);
```

### Pattern 2: Voice Output Only

```tsx
const [explanation, setExplanation] = useState("");

return (
  <div>
    <p>{explanation}</p>
    <VoicePlayer text={explanation} language="hinglish" />
  </div>
);
```

### Pattern 3: Voice Input + Output

```tsx
const [topic, setTopic] = useState("");
const [result, setResult] = useState("");

const handleVoiceInput = (text: string) => {
  setTopic(text);
};

return (
  <div>
    <div>
      <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
      <VoiceRecorder onTranscribed={handleVoiceInput} />
    </div>
    <div>
      <p>{result}</p>
      <VoicePlayer text={result} />
    </div>
  </div>
);
```

## Accessibility Features

### Keyboard Support
- Tab navigation to voice buttons
- Space/Enter to start/stop recording
- Escape to cancel recording

### Screen Readers
- ARIA labels on all voice components
- Status announcements for recording/playback
- Error messages announced

### Visual Feedback
- Recording indicator with pulsing animation
- Loading spinner during processing
- Play/pause state indication
- Error messages displayed

## Performance Optimization

### Audio Processing
- Client-side audio compression before upload
- Streaming transcription for long audio
- Cached TTS responses for common phrases

### Network
- Optimized audio format (WebM)
- Gzip compression for API requests
- Connection pooling for API calls

### Memory
- Automatic audio cleanup after processing
- Garbage collection of audio buffers
- Memory-efficient streaming

## Error Handling

### Common Errors

**Microphone Access Denied**
```
Error: Microphone access denied. Please allow microphone access.
```
Solution: Check browser permissions for microphone access

**Transcription Failed**
```
Error: Failed to transcribe audio. Please try again.
```
Solution: Check audio quality and try again with clearer speech

**Speech Generation Failed**
```
Error: Failed to generate speech. Please try again.
```
Solution: Check text length and try again

## Troubleshooting

### Voice Input Not Working

1. **Check microphone permissions**
   - Browser settings → Privacy → Microphone
   - Allow access to microphone

2. **Check audio quality**
   - Speak clearly and slowly
   - Minimize background noise
   - Use quality microphone

3. **Check language setting**
   - Ensure correct language selected
   - Match language to spoken language

### Voice Output Not Working

1. **Check speaker volume**
   - Ensure system volume is not muted
   - Check browser volume settings

2. **Check text content**
   - Ensure text is not empty
   - Check for special characters

3. **Check language setting**
   - Ensure correct language selected

## Future Enhancements

### Planned Features

1. **Voice Commands**
   - Navigate between modules using voice
   - Control playback with voice commands
   - Voice-based search

2. **Advanced Recognition**
   - Speaker identification
   - Emotion detection
   - Accent adaptation

3. **Multi-language Support**
   - Regional dialects
   - Code-switching detection
   - Transliteration support

4. **Accessibility**
   - Braille output
   - Haptic feedback
   - Visual captions

5. **Analytics**
   - Voice usage statistics
   - Recognition accuracy tracking
   - User engagement metrics

## Configuration

### Environment Variables

```bash
# Voice API Configuration
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
```

### Language Codes

```typescript
type Language = "en" | "hi" | "hinglish";

// Mapping to API languages
const languageMap = {
  en: "en-US",
  hi: "hi-IN",
  hinglish: "hi-IN" // Uses Hindi voice for Hinglish
};
```

## Testing Voice Features

### Manual Testing

1. **Test STT**
   - Speak clearly into microphone
   - Verify transcription accuracy
   - Test with different accents

2. **Test TTS**
   - Generate speech from text
   - Verify audio quality
   - Test with different languages

3. **Test Integration**
   - Test voice input → AI processing → voice output
   - Test with different module combinations
   - Test error scenarios

### Automated Testing

```typescript
// Example test
import { describe, it, expect } from "vitest";

describe("VoiceRecorder", () => {
  it("should transcribe audio correctly", async () => {
    // Test implementation
  });
});
```

## Best Practices

### For Users

1. **Clear Speech**
   - Speak clearly and at normal pace
   - Minimize background noise
   - Use quality microphone

2. **Language Consistency**
   - Choose language before speaking
   - Stick to one language per input
   - Use standard pronunciation

3. **Audio Quality**
   - Ensure good microphone placement
   - Test audio before important interactions
   - Check system volume levels

### For Developers

1. **Error Handling**
   - Always handle transcription errors
   - Provide user feedback
   - Log errors for debugging

2. **Performance**
   - Optimize audio before upload
   - Cache responses when possible
   - Monitor API usage

3. **Accessibility**
   - Always provide text alternatives
   - Include ARIA labels
   - Test with screen readers

## Support

For voice-related issues:
1. Check this guide for troubleshooting
2. Review error messages carefully
3. Test with different audio/microphone
4. Contact support at https://help.manus.im

---

**Last Updated:** June 2026  
**Version:** 1.0.0  
**Status:** Production Ready
