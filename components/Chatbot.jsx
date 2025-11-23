'use client'
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Hi! I'm ONEGOV AI. Ask me about any Government Scheme." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const boxRef = useRef();

  useEffect(() => {
    boxRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput, language }),
      });

      const data = await res.json();
      if (!data.reply) throw new Error("No reply received");

      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Something went wrong. Try again." },
      ]);
    }

    setLoading(false);
  }

  return (
    <section id="chat" className="mt-12 w-full px-4">
      <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-6 border border-gray-200">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">🇮🇳 ONEGOV AI Assistant</h2>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1 text-sm rounded-xl border bg-white shadow-sm"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="pa">Punjabi</option>
            <option value="bn">Bengali</option>
            <option value="mr">Marathi</option>
            <option value="ta">Tamil</option>
          </select>
        </div>

        {/* Chat Window */}
        <div className="h-96 overflow-auto p-4 bg-gray-50 rounded-2xl border space-y-4 shadow-inner">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: m.role === "user" ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm rounded-2xl shadow-md whitespace-pre-line leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-br-none"
                      : "bg-white text-gray-800 border rounded-bl-none"
                  }`}
                  dangerouslySetInnerHTML={{ __html: m.text }}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Loader */}
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm pl-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Typing...
            </div>
          )}

          <div ref={boxRef} />
        </div>

        {/* Input Section */}
        <div className="mt-4 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ask about eligibility, documents, process..."
          />
          <button
            onClick={send}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition active:scale-95 disabled:opacity-70"
          >
            {loading ? "…" : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}
