"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { askAssistant } from "@/actions/assistant";

// ═══════════════════════════════════════════════════
// 🤖 AssistantButton
// ═══════════════════════════════════════════════════
// Floating trigger (bottom-left, above WhatsApp) that
// opens a small chat panel. Zero external services —
// the "AI" is a pure intent-matcher running server-side.
// Position: physical left (not logical) to stay above
// WhatsApp across all RTL/LTR locales.

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export function AssistantButton() {
  const t = useTranslations("Assistant");
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Escape closes the panel
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isPending) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsPending(true);

    try {
      const reply = await askAssistant(text);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: reply.text,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: t("fallback"),
        },
      ]);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      {/* ═══ Floating trigger ═══ */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={t("open")}
        aria-expanded={isOpen}
        className="fixed bottom-24 left-6 z-50 w-14 h-14 rounded-full bg-accent hover:bg-accent-dark text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
            aria-hidden="true"
          >
            <path d="M12 2C6.477 2 2 6.13 2 11.25c0 2.875 1.406 5.438 3.594 7.125V22l3.375-1.844c.984.25 2.016.375 3.031.375 5.523 0 10-4.13 10-9.281C22 6.13 17.523 2 12 2zm0 16.5c-1.031 0-2.031-.156-2.969-.438l-.5-.156-2.031 1.094v-2.344l-.469-.469A7.192 7.192 0 0 1 3.5 11.25C3.5 6.938 7.313 3.5 12 3.5s8.5 3.438 8.5 7.75-3.813 7.75-8.5 7.75z" />
          </svg>
        )}
      </button>

      {/* ═══ Chat panel ═══ */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={t("title")}
          className="fixed bottom-44 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-50 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "min(500px, 70vh)" }}
        >
          {/* Header */}
          <div className="bg-accent text-white p-4 flex items-center justify-between shrink-0">
            <div>
              <div className="font-bold text-sm">🤖 {t("title")}</div>
              <div className="text-[0.7rem] opacity-90 mt-0.5">
                {t("subtitle")}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t("close")}
              className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            {messages.length === 0 && (
              <div className="text-center text-muted text-sm py-8">
                {t("subtitle")}
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-white rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex justify-start">
                <div className="bg-card border border-border px-3.5 py-2.5 rounded-2xl rounded-bl-md">
                  <span className="text-xs text-muted italic">
                    {t("typing")}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-border bg-card shrink-0 flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
              disabled={isPending}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isPending || !input.trim()}
              aria-label={t("send")}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-dark text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("send")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}