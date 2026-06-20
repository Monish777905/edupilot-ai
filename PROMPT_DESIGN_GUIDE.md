# EduPilot AI - Prompt Design Guide

This guide explains how to customize and optimize the LLM prompts used throughout EduPilot AI.

## Prompt Structure

All LLM calls in EduPilot AI follow this structure:

```typescript
const response = await invokeLLM({
  messages: [
    {
      role: "system",
      content: systemPrompt // Sets AI behavior and role
    },
    {
      role: "user",
      content: userPrompt // User's actual request
    }
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "response_name",
      strict: true,
      schema: { /* JSON schema */ }
    }
  }
});
```

### System Prompt
Defines the AI's role, personality, and constraints. Examples:
- "You are an expert educational content creator..."
- "You are a helpful tutor for Indian classrooms..."
- "You are a translator specializing in educational content..."

### User Prompt
The actual request from the user. Should be:
- Clear and specific
- Include context (grade level, topic, language)
- Provide examples when helpful
- State desired format

### Response Format
JSON schema ensures structured responses. Each module has its own schema.

## Module-Specific Prompts

### 1. Concept Simplifier

**System Prompt:**
```
You are an expert educational content creator specializing in making complex 
topics accessible to students. Your explanations are:
- Clear and easy to understand
- Age-appropriate for the target grade level
- Engaging with relevant examples
- Free of jargon or explained when necessary
- Structured with key points highlighted
```

**User Prompt Template:**
```
Explain "{topic}" in a {gradeLevel} level way suitable for Indian students.

Context:
- Grade Level: {gradeLevel}
- Subject: {subject}
- Language: {language}
- Duration: 2-3 minutes reading time

Provide:
1. A clear, simple explanation
2. 3-5 key points
3. One real-world example
4. A simple analogy if helpful
```

**Customization Tips:**
- Adjust explanation length based on grade level
- Add subject-specific context
- Include cultural references for Indian students
- Provide examples from familiar scenarios

### 2. Quiz Generator

**System Prompt:**
```
You are an expert quiz creator for Indian classrooms. Your quizzes are:
- Aligned with curriculum standards
- Varied in difficulty levels
- Engaging and fair
- Free of ambiguous questions
- Suitable for the specified grade level
```

**User Prompt Template:**
```
Create a {questionCount}-question quiz about "{topic}" for {gradeLevel} students.

Requirements:
- Mix of {quizType} questions
- Difficulty: {difficulty}
- Language: {language}
- Time limit: {timeLimit} minutes
- Include one challenging question

Format: Return as JSON with questions array.
```

**JSON Schema:**
```json
{
  "type": "object",
  "properties": {
    "quizTitle": { "type": "string" },
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "question": { "type": "string" },
          "type": { "enum": ["mcq", "short-answer"] },
          "options": { "type": "array", "items": { "type": "string" } },
          "correctAnswer": { "type": "string" },
          "explanation": { "type": "string" }
        }
      }
    }
  }
}
```

**Customization Tips:**
- Adjust question count for time constraints
- Mix question types for variety
- Include explanations for learning
- Add difficulty indicators
- Use curriculum-aligned topics

### 3. Doubt Solver

**System Prompt:**
```
You are a patient and knowledgeable tutor for Indian classrooms. When answering 
student questions:
- Break down complex topics into simple steps
- Use examples and analogies
- Encourage critical thinking
- Ask clarifying questions if needed
- Provide encouragement and positive feedback
- Adapt to the student's level of understanding
```

**User Prompt Template:**
```
Student Question: "{studentQuestion}"

Context:
- Grade Level: {gradeLevel}
- Subject: {subject}
- Language: {language}
- Previous Context: {chatHistory}

Provide:
1. A clear, step-by-step answer
2. Real-world examples
3. A summary of key concepts
4. A follow-up question to check understanding
```

**Customization Tips:**
- Include chat history for context
- Adapt complexity based on responses
- Use encouraging language
- Provide multiple explanations if needed
- Ask follow-up questions

### 4. Story Mode

**System Prompt:**
```
You are a master storyteller creating engaging educational narratives for Indian 
students. Your stories:
- Are age-appropriate and engaging
- Teach curriculum concepts naturally
- Include relatable characters and settings
- Have clear beginning, middle, and end
- Leave room for learning and reflection
```

**User Prompt Template:**
```
Create an engaging story about "{topic}" for {gradeLevel} students.

Requirements:
- Grade Level: {gradeLevel}
- Duration: {durationMinutes} minutes reading time
- Language: {language}
- Include: {keyPoints}
- Setting: Indian context if possible

Story should:
1. Start with an engaging hook
2. Naturally introduce the topic
3. Build to a climax
4. Conclude with a learning moment
5. Be memorable and fun
```

**Customization Tips:**
- Set specific story length
- Include educational objectives
- Use Indian cultural references
- Create relatable characters
- Build suspense and interest

### 5. Lesson Planner

**System Prompt:**
```
You are an experienced curriculum designer creating structured lesson plans for 
Indian classrooms. Your plans are:
- Aligned with curriculum standards
- Practical and implementable
- Varied in teaching methods
- Inclusive of different learning styles
- Time-efficient and realistic
```

**User Prompt Template:**
```
Create a detailed lesson plan for "{topic}".

Parameters:
- Grade Level: {gradeLevel}
- Duration: {durationMinutes} minutes
- Subject: {subject}
- Language: {language}
- Class Size: {classSize}

Include:
1. Learning objectives (3-5)
2. Teaching flow with time allocation
3. 3-4 classroom activities
4. Assessment methods
5. Quiz topics
6. Homework (2-3 tasks)
7. Resources needed
```

**JSON Schema:**
```json
{
  "type": "object",
  "properties": {
    "learningObjectives": { "type": "array", "items": { "type": "string" } },
    "teachingFlow": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "phase": { "type": "string" },
          "duration": { "type": "number" },
          "description": { "type": "string" }
        }
      }
    },
    "activities": { "type": "array", "items": { "type": "string" } },
    "quizTopics": { "type": "array", "items": { "type": "string" } },
    "homework": { "type": "array", "items": { "type": "string" } }
  }
}
```

**Customization Tips:**
- Adjust time allocation based on class schedule
- Include specific activities for your classroom
- Add assessment criteria
- Provide resource recommendations
- Include differentiation strategies

### 6. AI Whiteboard

**System Prompt:**
```
You are an expert at creating visual educational content. You create clear, 
labeled diagrams that help students understand concepts. Your visuals are:
- Simple and uncluttered
- Clearly labeled
- Appropriate for the grade level
- Suitable for classroom display
- Aligned with curriculum
```

**User Prompt Template:**
```
Create a {contentType} about "{topic}" for {gradeLevel} students.

Requirements:
- Grade Level: {gradeLevel}
- Language: {language}
- Include: {keyElements}
- Style: Educational, classroom-friendly
- Labels: Clear and in {language}

The {contentType} should:
1. Be visually clear
2. Include all important elements
3. Have clear labels
4. Be suitable for projection
5. Support learning of {learningObjective}
```

**Customization Tips:**
- Specify content type (diagram, flowchart, concept map)
- Include key elements to display
- Request specific visual style
- Add labeling requirements
- Specify learning objective

### 7. Activity Guide

**System Prompt:**
```
You are an expert in experiential learning and classroom activities. Your 
activity suggestions are:
- Engaging and fun
- Educationally valuable
- Practical to implement
- Safe for the classroom
- Inclusive for all learners
```

**User Prompt Template:**
```
Suggest a {activityType} activity about "{topic}" for {gradeLevel} students.

Parameters:
- Grade Level: {gradeLevel}
- Class Size: {classSize}
- Duration: {durationMinutes} minutes
- Subject: {subject}
- Language: {language}
- Resources Available: {resources}

Activity should:
1. Be engaging and fun
2. Teach the concept effectively
3. Be practical to implement
4. Include clear instructions
5. Have learning outcomes
6. Be inclusive for all students
```

**Customization Tips:**
- Specify activity type (hands-on, experiment, discussion, etc.)
- Include available resources
- Adjust for class size
- Add safety considerations
- Include assessment criteria

### 8. Translation

**System Prompt:**
```
You are a professional translator specializing in educational content. Your 
translations are:
- Accurate and faithful to the original
- Culturally appropriate
- Using clear, simple language
- Maintaining educational value
- Suitable for Indian classrooms
```

**User Prompt Template:**
```
Translate the following educational content from {sourceLanguage} to 
{targetLanguage}.

Text to Translate:
"{textToTranslate}"

Requirements:
- Maintain educational accuracy
- Use classroom-appropriate language
- Preserve meaning and tone
- Adapt for Indian context if needed
- Keep technical terms consistent

Note: This is for {subject} at {gradeLevel} level.
```

**Customization Tips:**
- Specify subject for context
- Include glossary of terms
- Request specific terminology
- Add cultural adaptation notes
- Verify technical accuracy

## Optimization Techniques

### Token Efficiency

Reduce token usage to lower costs:

**Before (High Tokens):**
```
You are an expert educational content creator specializing in making complex 
topics accessible to students. Your explanations are clear and easy to understand, 
age-appropriate for the target grade level, engaging with relevant examples, 
free of jargon or explained when necessary, and structured with key points 
highlighted.

Please explain the concept of photosynthesis in a way that is suitable for 
beginner level students in Indian classrooms...
```

**After (Lower Tokens):**
```
You are an educational content creator. Explain photosynthesis for beginner 
students in India. Use simple language, examples, and highlight key points.
```

### Prompt Chaining

Break complex tasks into multiple prompts:

```typescript
// Step 1: Generate content
const content = await invokeLLM({
  messages: [{ role: "user", content: "Create quiz about photosynthesis" }]
});

// Step 2: Refine content
const refined = await invokeLLM({
  messages: [
    { role: "user", content: `Improve this quiz:\n${content}` }
  ]
});
```

### Few-Shot Prompting

Provide examples in the prompt:

```
Create quiz questions like these examples:

Example 1:
Q: What is photosynthesis?
A: The process where plants convert light to energy
Options: [A, B, C, D]

Now create 5 similar questions about the water cycle...
```

### Temperature Adjustment

Control randomness in responses:

- **Temperature 0.0** - Deterministic, consistent (good for facts)
- **Temperature 0.7** - Balanced (good for most tasks)
- **Temperature 1.0** - Creative, varied (good for stories)

## Testing Prompts

### Manual Testing

1. **Clarity Test**
   - Is the prompt clear and unambiguous?
   - Does the AI understand what you want?
   - Are the instructions complete?

2. **Output Test**
   - Does the output match expectations?
   - Is the format correct?
   - Is the quality acceptable?

3. **Edge Case Test**
   - Test with unusual inputs
   - Test with extreme values
   - Test with different languages

### Automated Testing

Create test cases in `server/prompts.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { invokeLLM } from "./_core/llm";

describe("prompts", () => {
  it("should generate valid quiz", async () => {
    const result = await invokeLLM({
      messages: [/* prompt */]
    });
    
    expect(result.questions).toBeDefined();
    expect(result.questions.length).toBeGreaterThan(0);
    expect(result.questions[0].correctAnswer).toBeDefined();
  });
});
```

## Best Practices

### Do's
- ✅ Be specific and clear
- ✅ Include context and constraints
- ✅ Provide examples
- ✅ Specify output format
- ✅ Include grade level
- ✅ Test and iterate
- ✅ Monitor token usage
- ✅ Document changes

### Don'ts
- ❌ Use vague language
- ❌ Assume AI understands context
- ❌ Request too much in one prompt
- ❌ Forget to specify format
- ❌ Use overly complex language
- ❌ Deploy without testing
- ❌ Ignore cost implications
- ❌ Make changes without documentation

## Prompt Versioning

Track prompt changes in `server/prompts.ts`:

```typescript
// v1.0 - Initial prompt
const conceptSimplifierPromptV1 = `...`;

// v1.1 - Added examples
const conceptSimplifierPromptV1_1 = `...`;

// v2.0 - Restructured for clarity
const conceptSimplifierPromptV2 = `...`;

// Current version
export const conceptSimplifierPrompt = conceptSimplifierPromptV2;
```

## A/B Testing Prompts

Compare prompt effectiveness:

```typescript
// Create two versions
const promptA = "Explain photosynthesis...";
const promptB = "Explain photosynthesis with an analogy...";

// Test both
const resultA = await invokeLLM({ messages: [{ role: "user", content: promptA }] });
const resultB = await invokeLLM({ messages: [{ role: "user", content: promptB }] });

// Compare quality, length, clarity
```

## Monitoring Prompt Performance

Track metrics in your application:

- **Response Time** - How long does the LLM take?
- **Token Usage** - How many tokens per request?
- **Quality Score** - User satisfaction with output
- **Error Rate** - How often does it fail?
- **Cost** - Total API cost

## Common Issues & Solutions

### Issue: AI Ignores Instructions
**Solution**: Make instructions more explicit and specific

### Issue: Output Format Incorrect
**Solution**: Provide JSON schema and examples

### Issue: Response Too Long
**Solution**: Add "Be concise" or specify word count

### Issue: Wrong Language
**Solution**: Explicitly state language in prompt

### Issue: Inconsistent Quality
**Solution**: Reduce temperature, add more examples

### Issue: High Token Usage
**Solution**: Simplify prompt, remove unnecessary details

---

For more information, see README_EDUPILOT.md and IMPLEMENTATION_GUIDE.md.
