import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { apiFetch, getUser } from "../lib/auth";
import { Sidebar } from "../components/Sidebar";
import { MessageSquare, Upload, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr-assistant")({
  head: () => ({ meta: [{ title: "HR Assistant — InsiiHR" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("insiihr_token")) {
      throw redirect({ to: "/login" });
    }
  },
  component: HrAssistantPage,
});

type Message = {
  role: "user" | "ai";
  content: string;
};

function HrAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! I am the HR Assistant. You can ask me questions about company policies.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [uploading, setUploading] = useState(false);
  const user = getUser();
  const isAdmin = user?.role === "ADMIN";

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim()) return;
    
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/ai/ask-hr", {
        method: "POST",
        body: JSON.stringify({ question: userMsg.content }),
      });
      
      if (!res.ok) throw new Error("Failed to get answer");
      
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);
    } catch (err) {
      console.error("AI Ask HR Error:", err);
      setMessages((prev) => [
        ...prev, 
        { role: "ai", content: "Sorry, I encountered an error. Please try again later." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/ai/policy-upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("insiihr_token")}`
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      toast.success("Policy document uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload policy document");
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen relative">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border bg-card shadow-sm z-10 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-mono text-[10px] text-primary tracking-[0.25em] uppercase mb-1">
                F-06 · AI Chat
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                HR Assistant
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ask questions about HR policies, benefits, and company guidelines.
              </p>
            </div>
            
            {/* Admin Upload Section */}
            {isAdmin && (
              <div className="bg-secondary/50 p-4 rounded-md border border-border">
                <p className="text-xs font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-3 h-3" /> Admin Tools
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="policy-upload"
                    accept=".txt,.pdf,.docx"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="policy-upload"
                    className="text-xs bg-background border border-border shadow-sm px-3 py-1.5 rounded-md cursor-pointer hover:bg-secondary transition-colors flex items-center gap-2"
                  >
                    {uploading ? "Uploading..." : "Upload Policy Document"}
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-secondary/10">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-5 py-4 shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                    : "bg-card border border-border text-foreground rounded-2xl rounded-tl-sm"
                }`}
              >
                {msg.role === "ai" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border text-foreground px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-card border-t border-border shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.02)] shrink-0 relative z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about leave policies, benefits, etc..."
              className="flex-1 px-6 py-3.5 bg-secondary/50 border border-transparent rounded-full focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-sm shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold shadow-md hover:shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
