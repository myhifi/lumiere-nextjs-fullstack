"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useLocale, useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "@/i18n/navigation";

type Props = {
  isEnabled: boolean;
  hasApiKey: boolean;
};

export function AiCoPilot({ isEnabled, hasApiKey }: Props) {
  const t = useTranslations("Admin.aiCopilot");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // CRITICAL FIX: Memoize the transport to prevent infinite render loops in AI SDK v5
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/admin/ai/chat",
        body: { locale },
      }),
    [locale]
  );

  // Vercel AI SDK v5 API
  const { messages, sendMessage, status, error } = useChat({ transport });

  const isThinking = status === "submitted" || status === "streaming";
  const isConfigured = isEnabled && hasApiKey;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isConfigured) {
    return (
      <div className="fixed bottom-6 inset-e-6 z-50">
        <div className="bg-card border border-border shadow-lg rounded-2xl p-4 max-w-xs text-sm">
          <p className="text-muted mb-2">{t("notConfigured")}</p>
          <Link href="/admin/settings" className="text-accent font-medium hover:underline">
            {t("configureLink")} →
          </Link>
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: t("quickActions.revenue"), prompt: t("quickActions.revenuePrompt") },
    { label: t("quickActions.topItems"), prompt: t("quickActions.topItemsPrompt") },
    { label: t("quickActions.lowStock"), prompt: t("quickActions.lowStockPrompt") },
  ];

  function handleFormSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    sendMessage({ text: input });
    setInput("");
  }

  function handleQuickAction(prompt: string) {
    if (isThinking) return;
    sendMessage({ text: prompt });
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 inset-e-6 z-50 bg-accent hover:bg-accent-dark text-white p-4 rounded-full shadow-xl transition-transform hover:scale-105"
        aria-label={isOpen ? t("close") : t("open")}
      >
        {isOpen ? "✕" : "✨"}
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 inset-e-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden h-125">
          {/* Header */}
          <div className="bg-background/80 backdrop-blur border-b border-border p-4">
            <h3 className="font-bold text-accent">{t("title")}</h3>
            <p className="text-xs text-muted">{t("subtitle")}</p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/30">
            
            {/* Quick Actions (Only visible when chat is empty) */}
            {messages.length === 0 && (
              <div className="flex flex-col gap-2 mt-4">
                <p className="text-xs text-muted mb-1">Try asking:</p>
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="text-start text-sm bg-background border border-border hover:border-accent hover:text-accent rounded-xl p-3 transition-colors shadow-sm"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-xl text-sm ${
                    m.role === "user"
                      ? "bg-accent text-white rounded-tr-none"
                      : "bg-card border border-border rounded-tl-none prose prose-sm dark:prose-invert"
                  }`}
                >
                  {m.role === "user" ? (
                    m.parts.map((part, i) => 
                      part.type === "text" ? <span key={i}>{part.text}</span> : null
                    )
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.parts.map((part) => part.type === "text" ? part.text : "").join("")}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="text-sm text-muted animate-pulse">
                {t("thinking")}
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg whitespace-pre-wrap">
                {error.message && error.message !== "An error occurred." 
                  ? error.message 
                  : "AI failed to respond. The model may be overloaded. Please try again or change the model in Settings."}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleFormSubmit} className="p-4 border-t border-border bg-card flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent"
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {t("send")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}