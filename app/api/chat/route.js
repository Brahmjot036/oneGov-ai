import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import getDb from "../../../lib/db";

// Store conversation history per user (in production, use database or Redis)
const conversationHistories = new Map();

// Get persona-specific context
function getPersonaContext(persona) {
  const contexts = {
    teacher: `
👩‍🏫 **User Profile: Teacher**
- Focus on education-related schemes, teacher training programs, allowances, and education policies.
- Prioritize schemes like: Teacher training schemes, education allowances, scholarship programs for teachers' children, etc.
- Provide information relevant to educators and academic professionals.`,
    farmer: `
👨‍🌾 **User Profile: Farmer**
- Focus on agricultural schemes, crop insurance, subsidies, and farmer welfare programs.
- Prioritize schemes like: PM Kisan, crop insurance, agricultural subsidies, loan schemes, etc.
- Provide information relevant to farmers and agricultural workers.`,
    student: `
🎓 **User Profile: Student**
- Focus on scholarship schemes, education policies, exam-related schemes, and student benefits.
- Prioritize schemes like: Scholarships, education loans, exam fee waivers, student allowances, etc.
- Provide information relevant to students and educational pursuits.`,
    senior: `
👵 **User Profile: Senior Citizen**
- Focus on pension schemes, healthcare benefits, senior citizen discounts, and welfare programs.
- Prioritize schemes like: Old age pension, health insurance, senior citizen benefits, etc.
- Provide information relevant to senior citizens and retirees.`,
    job_seeker: `
💼 **User Profile: Job Seeker**
- Focus on employment schemes, skill development programs, job training, and employment benefits.
- Prioritize schemes like: Skill development programs, employment generation schemes, job training, etc.
- Provide information relevant to job seekers and unemployed individuals.`,
    general: `
👤 **User Profile: General Citizen**
- Provide information about all types of government schemes.
- Cover a wide range of schemes including education, health, employment, agriculture, etc.`
  };
  return contexts[persona] || contexts.general;
}

// Extract sources from reply text
function extractSources(reply) {
  const sources = [];
  // Look for markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(reply)) !== null) {
    sources.push({
      title: match[1],
      url: match[2],
      lastVerified: new Date().toISOString().split('T')[0],
      verified: true
    });
  }
  return sources;
}

export async function POST(req) {
  try {
    const { message, language = "en", persona, state, userId } = await req.json();
    
    // Get or create conversation history for this user
    const userKey = userId || 'default';
    if (!conversationHistories.has(userKey)) {
      conversationHistories.set(userKey, []);
    }
    const conversationHistory = conversationHistories.get(userKey);

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string." },
        { status: 400 }
      );
    }

    // Init Model
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Build persona context
    const personaContext = persona ? getPersonaContext(persona) : "";
    const stateContext = state ? `\n📍 **User's State**: ${state} - Prioritize schemes available in ${state} and state-specific information.` : "";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", 
      systemInstruction: `
You are **ONEGOV AI**, an extremely friendly, helpful, human-like assistant
created for the Indian public to ask questions about **Government Schemes only**.

────────────────────────────────────────
✨ PERSONALITY (VERY IMPORTANT)
────────────────────────────────────────
- Speak warmly, like a real human.
- Be caring, supportive, and respectful — like a helpful government officer.
- Use simple, easy-to-understand words.
- Add light emojis in a helpful, natural way.
- NEVER sound robotic or generic.
- Always structure the answer beautifully.

────────────────────────────────────────
👤 USER CONTEXT (CRITICAL - USE THIS)
────────────────────────────────────────
${personaContext}${stateContext}

**IMPORTANT**: 
- You already know the user's profile and state from previous conversations.
- DO NOT ask about their profession, state, or personal details again.
- Automatically filter and prioritize schemes relevant to their profile and state.
- If they ask about schemes, immediately provide relevant ones based on their context.
- Only mention their profile/state if it's relevant to the answer.

────────────────────────────────────────
🧠 CONVERSATION BEHAVIOR
────────────────────────────────────────
- Treat follow-up questions as part of the same topic.  
- If the user asks "how to apply?", "documents?", "eligibility?", continue the previous scheme.
- NEVER ask questions you already know the answer to from conversation history.
- If context is unclear, use the conversation history to infer context.
- Maintain strong memory of the conversation - remember what schemes were discussed.
- If user asks about the same scheme again, provide a concise summary and ask what specific aspect they need.

────────────────────────────────────────
🚫 STRICT LIMITATIONS (NON-NEGOTIABLE)
────────────────────────────────────────
You must ONLY answer about:
✔ Government schemes  
✔ Benefits, eligibility, documents  
✔ Subsidies, pensions, yojanas  
✔ State & Central government programs  

❌ For anything else, reply:
"I can only answer Government Scheme related questions 😊"

────────────────────────────────────────
🌐 LANGUAGE RULE
────────────────────────────────────────
- Respond fully in **${language}**.
- If language is unknown → default to English.

────────────────────────────────────────
🎨 OUTPUT FORMAT (VERY IMPORTANT)
────────────────────────────────────────
Every response MUST be:
- Beautifully organized with clear sections
- Easy to read with proper spacing
- Human and conversational  
- Structured with:
  • **Bold headings** for main sections
  • Bullet points for lists
  • Numbered steps for processes
- Use markdown formatting:
  **Bold** for emphasis
  ### for section headings
  - for bullet points
  1. for numbered lists

Format example:

**Scheme Name**
Brief introduction about the scheme.

**✅ Benefits**
- Benefit 1
- Benefit 2
- Benefit 3

**🧾 Eligibility Criteria**
- Criterion 1
- Criterion 2

**📄 Required Documents**
- Document 1
- Document 2

**📝 Application Process**
1. Step 1 description
2. Step 2 description
3. Step 3 description

**🔗 Official Sources**
- [Source Name](URL) - Verified

Add warm human tone + helpful emojis.
`
    });

    // Build memory context with deduplication
    const conversationContext = conversationHistory
      .slice(-10) // Keep last 10 exchanges to avoid token limits
      .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
      .join("\n");

    // Check if this question was asked before
    const previousSimilarQuestion = conversationHistory.find(
      (item) => item.role === "user" && 
      item.content.toLowerCase().includes(message.toLowerCase().substring(0, 20))
    );

    const fullPrompt = `
Previous conversation context:
${conversationContext}

${previousSimilarQuestion ? `⚠️ NOTE: User asked a similar question before. Provide a concise answer and reference previous discussion if needed.` : ''}

Current user message:
USER: ${message}

**INSTRUCTIONS:**
1. Use the user's profile (${persona || 'general'}) and state (${state || 'all states'}) to filter relevant schemes.
2. DO NOT ask about their profile or state - you already know it.
3. Provide direct, helpful answers based on their context.
4. If this question was asked before, give a brief summary and ask what specific detail they need.
5. Format your response beautifully with clear sections using markdown.
6. Respond in ${language}.

Follow ALL system rules. Respond like a human with clean formatting.
    `;

    const result = await model.generateContent(fullPrompt);
    const reply = result.response.text();

    // Extract sources and confidence from reply if present
    const sources = extractSources(reply);
    const confidence = 0.95; // Default confidence, can be calculated based on response quality

    // save memory (limit to last 20 exchanges)
    conversationHistory.push({ role: "user", content: message });
    conversationHistory.push({ role: "assistant", content: reply });
    if (conversationHistory.length > 20) {
      conversationHistories.set(userKey, conversationHistory.slice(-20));
    } else {
      conversationHistories.set(userKey, conversationHistory);
    }

    // Store Q&A pair in database for model training
    try {
      const db = getDb();
      const qaInsert = db.prepare(`
        INSERT INTO qa_pairs (user_id, question, answer, persona, state, language, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const now = new Date().toISOString();
      if (typeof qaInsert.run === 'function') {
        qaInsert.run(
          userId ? parseInt(userId) : null,
          message,
          reply,
          persona || null,
          state || null,
          language || 'en',
          now
        );
      } else {
        await qaInsert.run(
          userId ? parseInt(userId) : null,
          message,
          reply,
          persona || null,
          state || null,
          language || 'en',
          now
        );
      }
    } catch (dbError) {
      console.error("Failed to save Q&A pair:", dbError);
      // Don't fail the request if DB save fails
    }

    return NextResponse.json({ 
      reply,
      sources: sources.length > 0 ? sources : undefined,
      confidence,
      lastUpdated: new Date().toISOString().split('T')[0]
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "AI processing failed." },
      { status: 500 }
    );
  }
}
