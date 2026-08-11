import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquare, Send, X, Upload } from "lucide-react";
import { apiFetch, getUser } from "../lib/auth";
import { toast } from "sonner";

type Message = {
  role: "user" | "ai";
  content: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! I am the HR Assistant. Ask me anything about company policies.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getUser();
  const isAdmin = user?.role === "ADMIN";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

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
      e.target.value = "";
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Popover */}
      <div 
        className={`fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">HR Assistant</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Powered</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/20">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 shadow-sm text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                    : "bg-card border border-border text-foreground rounded-2xl rounded-bl-sm"
                }`}
              >
                {msg.role === "ai" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border text-foreground px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Admin Upload Area (Small) */}
        {isAdmin && (
          <div className="px-4 py-2 bg-secondary/30 border-t border-border flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Admin: Upload Policy</span>
            <label className="cursor-pointer text-primary hover:text-primary/80 transition-colors">
              <input type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={handleUpload} disabled={uploading} />
              <Upload className="w-4 h-4" />
            </label>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 bg-card border-t border-border rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 bg-secondary/50 border border-transparent rounded-full focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/30 transition-all text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
