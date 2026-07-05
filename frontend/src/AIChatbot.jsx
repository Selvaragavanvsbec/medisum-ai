import { useState, useRef, useEffect } from "react";
import { Icon, P } from "./icons.jsx";
import { useHealth } from "./context/HealthContext.jsx";
import { useAuth, api } from "./auth.jsx";
import { useToast } from "./ui.jsx";

export default function AIChatbot() {
  const { reports } = useHealth();
  const { auth } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your MediSum assistant. Ask me anything about your digitized reports, clinical parameters, or health index.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const activeReport = reports[0]; // use latest report as default context

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const CHIPS = activeReport 
    ? [
        "Explain my overall score", 
        "Are my high flags concerning?", 
        "Show doctor follow-up questions"
      ] 
    : [
        "What is MediSum AI?", 
        "How do I upload a report?", 
        "What categories are monitored?"
      ];

  const handleSend = async (textToSend) => {
    const text = textToSend || msg;
    if (!text.trim()) return;

    const userMessage = { id: Math.random().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setMsg("");
    setLoading(true);

    // Build context payload
    let context_report_text = "";
    if (activeReport && activeReport.summary) {
      // Gather key diagnostic metrics as context
      const findings = (activeReport.summary.key_findings || [])
        .map((f) => `${f.item}: ${f.value} (${f.flag})`)
        .join(", ");
      context_report_text = `Patient Details: ${JSON.stringify(activeReport.summary.patient_details || {})}. Overview: ${activeReport.summary.overview}. Findings: ${findings}. Risk: ${activeReport.summary.risk_level}.`;
    }

    try {
      const data = await api("/chat", {
        method: "POST",
        token: auth?.access_token,
        body: {
          message: text,
          context_report_text: context_report_text || null,
        },
      });

      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(), sender: "bot", text: data.reply },
      ]);
    } catch (err) {
      toast(err.message || "Failed to contact chatbot engine", "err");
      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(), sender: "bot", text: "I'm sorry, I'm having trouble connecting to my brain database. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button className="chatbot-fab" onClick={toggleChat} title="Ask MediSum AI">
        <Icon d={P.robot} />
        {!isOpen && reports.length > 0 && <span className="fab-ping" />}
      </button>

      {/* Slide up chat panel */}
      {isOpen && (
        <div className="chatbot-panel glass">
          <div className="chatbot-head">
            <div className="bot-av">
              <Icon d={P.robot} />
            </div>
            <div>
              <h4>MediSum AI Assistant</h4>
              <p>Online &amp; Context-Ready</p>
            </div>
            <button 
              style={{ marginLeft: "auto", background: "none", border: 0, color: "var(--ink-soft)", cursor: "pointer" }}
              onClick={toggleChat}
            >
              <Icon d={P.x} style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {activeReport && (
            <div style={{ fontSize: 10, background: "rgba(99,102,241,0.08)", padding: "6px 12px", borderBottom: "1px solid var(--line)", color: "var(--violet-2)", fontWeight: "600" }}>
              Context active: {activeReport.summary?.patient_details?.report_type || "Lab Report"} ({new Date(activeReport.created_at).toLocaleDateString()})
            </div>
          )}

          {/* Messages container */}
          <div className="chatbot-msgs" ref={scrollRef}>
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.sender}`}>
                <div className="msg-av">
                  {m.sender === "bot" ? "AI" : "ME"}
                </div>
                <div className="chat-bubble">
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <div className="msg-av">AI</div>
                <div className="chat-bubble">
                  <div className="chat-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestion Chips */}
          <div className="chatbot-chips">
            {CHIPS.map((chip, idx) => (
              <span key={idx} className="chat-chip" onClick={() => handleSend(chip)}>
                {chip}
              </span>
            ))}
          </div>

          {/* Input field */}
          <div className="chatbot-input-row">
            <input
              type="text"
              placeholder="Ask anything about reports..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={() => handleSend()} disabled={loading}>
              <Icon d={P.arrowr} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
