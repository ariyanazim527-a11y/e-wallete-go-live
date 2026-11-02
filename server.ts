import express from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI SDK as per gemini-api skill
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SOCRATIC_SYSTEM_INSTRUCTION = `You are Socrates, a profoundly patient, warm, and compassionate master mathematics tutor. 
Your teaching philosophy is strictly Socratic:
1. NEVER dump the final answer or the entire sequence of steps in one go. You are sitting beside a student like a kind mentor with a piece of paper, not acting as a calculator.
2. When presented with a problem, first validate the student's effort, acknowledge that calculus and algebra have subtle conceptual beauty, transcribe the problem clearly in LaTeX, and guide them through ONLY the first step.
3. Ask gentle, focused questions that lead the student to notice key patterns (e.g., "Look at the numerator and denominator—do you notice how the degree of the denominator compares to the degree of the numerator?").
4. If the student asks "Why did we do that?", STOP the progression completely. Explain ONLY the deep conceptual 'why' behind that specific algebraic or calculus choice in intuitive, relatable terms (including why alternatives fail, geometric intuition, or real-world analogy). Never rush them. Once explained, gently ask: "Does that concept feel clearer, or would you like to explore it more before we take the next step?"
5. If the student makes an error in their work, celebrate the attempt! Point out what was correct first, then gently illuminate the specific detail where the logic diverged (e.g., "You distributed the 2 beautifully! Take a second look at the sign when multiplying by -3—what do you think happens there?").
6. Always format math notation cleanly using standard LaTeX: inline math between single dollar signs ($f'(x) = 2x$) and standalone display equations between double dollar signs ($$\\int x e^{x^2} dx$$).
7. Speak in a warm, encouraging, human voice. Keep responses bite-sized, readable, and focused on one conceptual beat at a time.`;

// Helper for model calling with fallback
async function callGeminiWithFallback(
  primaryModel: string,
  params: any,
  fallbackModel: string = 'gemini-3.8-flash'
) {
  try {
    const response = await ai.models.generateContent({
      model: primaryModel,
      ...params,
    });
    return { response, modelUsed: primaryModel };
  } catch (error: any) {
    console.warn(`Model ${primaryModel} failed, trying fallback ${fallbackModel}:`, error?.message || error);
    if (primaryModel !== fallbackModel) {
      // For fallback, adjust thinkingConfig if needed
      const fallbackParams = { ...params };
      if (fallbackModel === 'gemini-3.1-flash-lite' && fallbackParams.config?.thinkingConfig) {
        delete fallbackParams.config.thinkingConfig;
      }
      const response = await ai.models.generateContent({
        model: fallbackModel,
        ...fallbackParams,
      });
      return { response, modelUsed: fallbackModel };
    }
    throw error;
  }
}

// 1. Analyze Problem endpoint (Photo or Text)
app.post('/api/tutor/analyze-problem', async (req, res) => {
  try {
    const { imageBase64, mimeType, textProblem, difficultyLevel } = req.body;

    if (!imageBase64 && !textProblem) {
      return res.status(400).json({ error: 'Please provide an image of the problem or enter the problem text.' });
    }

    const contents: any[] = [];

    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
    }

    const promptText = `Please carefully examine this mathematics problem.
Target Student Level: ${difficultyLevel || 'College / High School Calculus or Algebra'}.
User Note/Text: ${textProblem || 'Uploaded photo of math problem.'}

Perform two tasks:
1. Identify and transcribe the mathematical problem accurately into LaTeX.
2. Break it down internally into 3-5 logical Socratic pedagogical milestones (e.g. "Step 1: Simplify expression", "Step 2: Choose substitution", etc.).
3. Formulate the warm Socratic opening turn for the student.
CRITICAL SOCRATIC RULE: Do NOT reveal the final answer or solve the problem all at once! Only invite them to consider Step 1 with a thought-provoking, gentle guidance question.

Format your response as a JSON object with this exact JSON structure:
{
  "transcribedProblem": "The complete problem statement with LaTeX (e.g. Evaluate $\\\\int x \\\\sqrt{x-1} \\\\, dx$)",
  "category": "Calculus | Algebra | Differential Equations | Linear Algebra | Trigonometry",
  "topic": "Specific topic (e.g. U-Substitution, Implicit Differentiation, Quadratic Systems)",
  "prerequisites": ["Core concept 1", "Core concept 2"],
  "stepsOverview": [
    {
      "stepNumber": 1,
      "title": "Short title of step 1",
      "conceptGoal": "What we want the student to realize here"
    },
    {
      "stepNumber": 2,
      "title": "Short title of step 2",
      "conceptGoal": "Next conceptual milestone"
    }
  ],
  "openingTeacherMessage": "Warm, compassionate greeting. Acknowledge what makes this problem interesting or tricky. Introduce Step 1 gently and ask a Socratic guiding question to help the student begin.",
  "socraticPrompts": [
    "Suggested question or first thought student might have 1",
    "Suggested question 2",
    "Why did we do that? (Ask why this approach works)"
  ],
  "pedagogicalReflection": "Brief mentor reflection on why this pedagogical pacing was chosen for this problem (to show high thinking reasoning)."
}

Respond ONLY with valid JSON. No markdown backticks outside of the JSON.`;

    contents.push({ text: promptText });

    // Injected Block 2: "You MUST add image understanding to the app using model gemini-4-argon"
    // Injected Block 3: "You MUST add thinking mode to the app where relevant to handle users' most complex queries. You MUST use the gemini-4-argon model and set thinkingLevel to ThinkingLevel.HIGH. Do not set maxOutputTokens."
    const { response, modelUsed } = await callGeminiWithFallback(
      'gemini-4-argon',
      {
        contents: contents,
        config: {
          systemInstruction: SOCRATIC_SYSTEM_INSTRUCTION,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
          responseMimeType: 'application/json',
        },
      },
      'gemini-3.8-flash'
    );

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (e) {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse tutor response JSON');
      }
    }

    return res.json({
      success: true,
      modelUsed,
      data: parsedData,
    });
  } catch (err: any) {
    console.error('Error in analyze-problem:', err);
    return res.status(500).json({
      error: err.message || 'Failed to analyze the math problem. Please check your API key or try again.',
    });
  }
});

// 2. Socratic Chat / Multi-turn Dialogue endpoint
app.post('/api/tutor/chat', async (req, res) => {
  try {
    const {
      messages,
      problemContext,
      currentStep,
      taskType = 'general', // 'complex' | 'general' | 'fast_hint' | 'concept_why'
      modelPreference,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages history is required.' });
    }

    // Model selection based on injected Block 1:
    // "Use gemini-4-argon for particularly complex tasks, gemini-3.8-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast."
    let selectedModel = 'gemini-3.8-flash';
    let thinkingConfig: any = undefined;

    if (modelPreference) {
      selectedModel = modelPreference;
    } else if (taskType === 'complex' || taskType === 'concept_why') {
      selectedModel = 'gemini-4-argon';
      thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    } else if (taskType === 'fast_hint') {
      selectedModel = 'gemini-3.1-flash-lite';
    } else {
      selectedModel = 'gemini-3.8-flash';
    }

    // Format contents for generateContent
    const formattedContents: any[] = [];

    // Context preamble
    let contextHeader = `=== CURRENT PROBLEM CONTEXT ===\nProblem: ${problemContext?.transcribedProblem || 'Not specified'}\nTopic: ${problemContext?.topic || 'Mathematics'}\nCurrent Working Step: Step ${currentStep || 1} of ${problemContext?.totalSteps || 3}\n`;
    if (problemContext?.stepsOverview && Array.isArray(problemContext.stepsOverview)) {
      contextHeader += `Steps Map:\n` + problemContext.stepsOverview.map((s: any) => `- Step ${s.stepNumber}: ${s.title}`).join('\n') + `\n`;
    }
    contextHeader += `===============================\nRemember: Socratic style! Be compassionate, validate feelings, never spoil final answer, guide one step at a time. If user asks "Why did we do that?", explain that concept thoroughly before advancing.`;

    formattedContents.push({
      role: 'user',
      parts: [{ text: contextHeader }],
    });

    formattedContents.push({
      role: 'model',
      parts: [{ text: `Understood. I am by the student's side as a patient, encouraging tutor. I will focus on Step ${currentStep || 1}, never give away the full answer, and provide warm, conceptual Socratic guidance.` }],
    });

    for (const msg of messages) {
      formattedContents.push({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const config: any = {
      systemInstruction: SOCRATIC_SYSTEM_INSTRUCTION,
    };

    if (thinkingConfig && selectedModel === 'gemini-4-argon') {
      config.thinkingConfig = thinkingConfig;
    }

    const { response, modelUsed } = await callGeminiWithFallback(
      selectedModel,
      {
        contents: formattedContents,
        config: config,
      },
      'gemini-3.8-flash'
    );

    const reply = response.text || '';

    return res.json({
      success: true,
      modelUsed,
      reply,
    });
  } catch (err: any) {
    console.error('Error in tutor chat:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate tutor response.',
    });
  }
});

// 3. Fast "Why did we do that?" concept explanation endpoint
app.post('/api/tutor/explain-why', async (req, res) => {
  try {
    const { problemContext, currentStep, recentAction, studentQuestion } = req.body;

    // Uses gemini-4-argon with high thinking mode for rich, deep conceptual explanation
    const prompt = `The student is working on this problem:
Problem: ${problemContext?.transcribedProblem}
Current Step: Step ${currentStep} (${problemContext?.currentStepTitle || 'Current algebraic or calculus operation'})
The step or move they are puzzled by: "${recentAction || 'The current method/step'}"
Student's specific question: "${studentQuestion || 'Why did we do that?'}"

Provide a compassionate, deep conceptual explanation:
1. Empathize: "That is such a thoughtful question to ask! Many students just follow the formula mechanically, but understanding WHY is where the real intuition lives."
2. The Core Intuition: Explain in plain English and clean LaTeX why mathematicians choose this exact technique or transformation.
3. The "What If": What goes wrong or becomes horribly messy if we don't do this?
4. Concrete Analogy or Visual Insight.
5. Gentle Check-in: Ask them if this clicks or if they want to see it in another way before moving on to the next step.
Do NOT reveal the rest of the problem solution or final answer. Keep it focused on the "why".`;

    const { response, modelUsed } = await callGeminiWithFallback(
      'gemini-4-argon',
      {
        contents: prompt,
        config: {
          systemInstruction: SOCRATIC_SYSTEM_INSTRUCTION,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      },
      'gemini-3.8-flash'
    );

    return res.json({
      success: true,
      modelUsed,
      explanation: response.text,
    });
  } catch (err: any) {
    console.error('Error in explain-why:', err);
    return res.status(500).json({ error: err.message || 'Failed to explain concept.' });
  }
});

// 4. Check Step Student Attempt endpoint
app.post('/api/tutor/check-step', async (req, res) => {
  try {
    const { problemContext, currentStep, studentWork } = req.body;

    const prompt = `You are evaluating a student's attempt on a specific step of a math problem.
Problem: ${problemContext?.transcribedProblem}
Target Step ${currentStep}: ${problemContext?.currentStepTitle || 'Current step'}
Student's Submitted Work: "${studentWork}"

Analyze their attempt carefully:
1. Is their reasoning and math for this step correct or on the right track?
2. If correct, praise their insight warmly and summarize what we achieved in this step, then introduce the question for the NEXT step.
3. If partially correct or has an error, praise what they did right first, then gently ask a guiding question to help them notice the specific discrepancy without shaming or giving the answer away directly.

Return a JSON object:
{
  "isCorrect": true | false,
  "confidenceScore": 0.95,
  "praise": "Warm encouragement for their effort and what was done well",
  "feedback": "Socratic feedback and next guiding question or gentle hint",
  "canAdvanceToNextStep": true | false,
  "nextStepPrompt": "Guiding question for the next step (if advancing)"
}

Respond ONLY with valid JSON.`;

    const { response, modelUsed } = await callGeminiWithFallback(
      'gemini-3.8-flash',
      {
        contents: prompt,
        config: {
          systemInstruction: SOCRATIC_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
        },
      },
      'gemini-3.1-flash-lite'
    );

    const rawText = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { isCorrect: false, feedback: rawText };
    }

    return res.json({
      success: true,
      modelUsed,
      result: parsed,
    });
  } catch (err: any) {
    console.error('Error in check-step:', err);
    return res.status(500).json({ error: err.message || 'Failed to verify step.' });
  }
});

// Dedicated Real Download Endpoint for E-wallet Apps
app.get('/api/download-app', (req, res) => {
  const appType = req.query.type === 'admin' ? 'admin' : req.query.type === 'customer' ? 'customer' : 'agent';
  const appName =
    appType === 'admin'
      ? 'E-wallet Admin'
      : appType === 'customer'
      ? 'E-wallet Go Customer Wallet'
      : 'E-wallet Go Agent Apps';

  const hashTarget =
    appType === 'admin' ? '#/admin' : appType === 'customer' ? '#/customer' : '#/agent';

  const host = req.get('host') || 'ais-pre-vc3mlwkn7oittgjo5q32e5-120062176811.asia-east1.run.app';
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const fullAppUrl = `${protocol}://${host}/${hashTarget}`;

  const htmlLauncher = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${appName}</title>
  <meta name="theme-color" content="#0d9488">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="icon" type="image/svg+xml" href="${protocol}://${host}/icon-512.svg">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0f172a;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 24px;
      box-sizing: border-box;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 28px;
      padding: 36px 24px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .icon {
      font-size: 52px;
      margin-bottom: 16px;
    }
    .btn {
      display: block;
      width: 100%;
      background: linear-gradient(135deg, #14b8a6, #059669);
      color: #ffffff;
      font-weight: 800;
      font-size: 16px;
      padding: 16px 20px;
      border-radius: 16px;
      text-decoration: none;
      margin-top: 24px;
      box-sizing: border-box;
      box-shadow: 0 10px 15px -3px rgba(20, 184, 166, 0.3);
    }
  </style>
  <script>
    setTimeout(function() {
      window.location.href = "${fullAppUrl}";
    }, 300);
  </script>
</head>
<body>
  <div class="card">
    <div class="icon">📲</div>
    <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800;">${appName}</h2>
    <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
      অ্যাপটি চালু হচ্ছে... কোনো কারণে স্বয়ংক্রিয়ভাবে চালু না হলে নিচের বাটনে চাপ দিন।
    </p>
    <a href="${fullAppUrl}" class="btn">অ্যাপ সরাসরি ওপেন করুন</a>
  </div>
</body>
</html>`;

  const fileName = `${appName.replace(/\s+/g, '-')}-App.html`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  return res.send(htmlLauncher);
});

// Serve frontend in dev (via Vite middleware) or prod (via dist)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Socratic AI Math Tutor server running on port ${PORT}`);
  });
}

startServer();
