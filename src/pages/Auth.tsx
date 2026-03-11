import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Code2, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || (!resetMode && !password.trim())) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);

    try {
      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent! Check your inbox.");
        setResetMode(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grid">
      <div className="absolute inset-0 bg-radial-glow opacity-30" />
      <div className="relative w-full max-w-md p-6">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Code2 className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            CodeScope <span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="glass rounded-xl p-8">
          <h2 className="mb-1 text-xl font-bold text-foreground">
            {resetMode ? "Reset Password" : isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {resetMode
              ? "Enter your email to receive a reset link"
              : isLogin
              ? "Sign in to continue analyzing code"
              : "Start analyzing codebases with AI"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !resetMode && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50"
                required
              />
            </div>
            {!resetMode && (
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50"
                  required
                  minLength={6}
                />
              </div>
            )}
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Loading..." : resetMode ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {resetMode ? (
              <button onClick={() => setResetMode(false)} className="text-primary hover:underline">
                <ArrowLeft className="mr-1 inline h-3 w-3" /> Back to login
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="text-primary">{isLogin ? "Sign up" : "Log in"}</span>
                </button>
                {isLogin && (
                  <div className="mt-2">
                    <button onClick={() => setResetMode(true)} className="text-muted-foreground hover:text-primary text-xs">
                      Forgot password?
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
