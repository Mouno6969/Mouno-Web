"use client";

import { FormEvent, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export function AiSupportWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Ask me about the RefundYourSOL Promo website, promoter applications, post submissions, status lookup, withdrawals, and reward terms." },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || pending) return;
    setInput("");
    setPending(true);
    setMessages((current) => [...current, { role: "user", text: message }]);
    try {
      const response = await fetch("/api/ai-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json().catch(() => null) as { answer?: string; error?: string } | null;
      if (!response.ok || !data?.answer) throw new Error(data?.error || "AI Support is unavailable.");
      setMessages((current) => [...current, { role: "assistant", text: data.answer || "" }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: error instanceof Error ? error.message : "AI Support is temporarily unavailable. Please try again later." }]);
    } finally {
      setPending(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  return (
    <div className="aiSupport" aria-live="polite">
      {open ? (
        <section className="aiSupportPanel" aria-label="AI Support panel">
          <div className="aiSupportHeader">
            <div>
              <strong>AI Support</strong>
              <span>English-only website help</span>
            </div>
            <button type="button" className="aiSupportClose" aria-label="Close AI Support" onClick={() => setOpen(false)}>×</button>
          </div>
          <p className="aiSupportNotice">Read-only website support for RefundYourSOL Promo. Not official platform support.</p>
          <div className="aiSupportMessages">
            {messages.map((message, index) => (
              <div className={`aiSupportMessageRow ${message.role}`} key={`${message.role}-${index}`}>
                {message.role === "assistant" ? <img className="aiSupportAvatar" src="/images/refundyoursol-promo-icon.png" alt="" aria-hidden="true" /> : null}
                <div className={`aiSupportMessage ${message.role}`}>
                  {message.text}
                </div>
              </div>
            ))}
            {pending ? (
              <div className="aiSupportMessageRow assistant">
                <img className="aiSupportAvatar" src="/images/refundyoursol-promo-icon.png" alt="" aria-hidden="true" />
                <div className="aiSupportMessage assistant">Thinking…</div>
              </div>
            ) : null}
          </div>
          <form className="aiSupportForm" onSubmit={submit}>
            <label htmlFor="ai-support-message">Ask a website question</label>
            <textarea
              ref={inputRef}
              id="ai-support-message"
              value={input}
              maxLength={1200}
              disabled={pending}
              onChange={(event) => setInput(event.target.value)}
              placeholder="How do I submit a post?"
            />
            <button className="button" type="submit" disabled={pending || !input.trim()}>{pending ? "Sending" : "Send"}</button>
          </form>
        </section>
      ) : null}
      <button type="button" className="aiSupportToggle" aria-expanded={open} aria-controls="ai-support-message" onClick={() => setOpen((value) => !value)}>
        AI Support
      </button>
    </div>
  );
}
