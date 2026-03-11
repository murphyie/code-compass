import { useState } from "react";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const mockResponses: Record<string, string> = {
  default: "I can help you understand this codebase! Try asking about specific functions, variables, or the overall architecture.",
  auth: "The authentication system uses JWT tokens. The `authenticate()` function in `auth/handler.ts` verifies tokens and looks up users in the database. The `authMiddleware` in `middleware.ts` protects routes by extracting the Bearer token from the Authorization header.",
  function: "I found **8 functions** across the codebase:\n\n- `authenticate()` — JWT verification (handler.ts)\n- `generateToken()` — Token creation (handler.ts)\n- `authMiddleware()` — Route protection (middleware.ts)\n- `getUsers()` — Fetch all users (controllers.ts)\n- `createUser()` — Create user (controllers.ts)\n- `deleteUser()` — Delete user (controllers.ts)\n- `formatDate()` — Date formatting (helpers.ts)\n- `slugify()` — String slugification (helpers.ts)",
  security: "⚠️ **Security Issues Found:**\n\n1. No token expiry validation in `authenticate()`\n2. `JWT_SECRET` not validated on startup — could be undefined\n3. Potential SQL injection in `database.ts` — consider using parameterized queries\n4. No input validation in `createUser` controller",
  unused: "🗑️ **Dead Code Detected:**\n\n- `deprecatedHelper()` in `utils/helpers.ts` (line 12) — This function is never imported or called anywhere in the codebase. Safe to remove.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("auth") || lower.includes("login") || lower.includes("token")) return mockResponses.auth;
  if (lower.includes("function") || lower.includes("method")) return mockResponses.function;
  if (lower.includes("security") || lower.includes("bug") || lower.includes("vulnerab")) return mockResponses.security;
  if (lower.includes("unused") || lower.includes("dead") || lower.includes("deprecated")) return mockResponses.unused;
  return mockResponses.default;
}

const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 I've analyzed your codebase. Ask me anything! Try: \"Explain the auth system\" or \"Find security issues\"" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const aiMsg: Message = { role: "assistant", content: getResponse(input) };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/50 bg-secondary/30 px-4 py-2.5">
        <h3 className="text-xs font-semibold text-primary flex items-center gap-1.5">
          <Bot className="h-3.5 w-3.5" /> AI Chat
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
              msg.role === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground"
            }`}>
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
            {msg.role === "user" && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/20">
                <User className="h-3.5 w-3.5 text-accent" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-border/50 p-3">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about the codebase..."
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button onClick={send} className="text-primary hover:text-primary/80">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
