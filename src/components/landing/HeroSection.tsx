import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Github, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>
      <div className="absolute right-1/4 top-1/2">
        <div className="h-[300px] w-[300px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary backdrop-blur-sm"
        >
          <Zap className="h-3.5 w-3.5" />
          AI-Powered Code Intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Understand any codebase{" "}
          <span className="text-gradient-primary">in seconds</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Upload source code, paste a GitHub URL, or drop a zip file. CodeScope AI
          analyzes every variable, function, and dependency — then lets you explore
          it all with natural language.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Button variant="hero" size="lg" className="gap-2 text-base" asChild>
            <Link to="/dashboard">
              Start Analyzing <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="hero-outline" size="lg" className="gap-2 text-base" asChild>
            <Link to="/dashboard">
              <Github className="h-4 w-4" /> Connect GitHub
            </Link>
          </Button>
        </motion.div>

        {/* Mock editor preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 w-full max-w-5xl"
        >
          <div className="glass rounded-xl p-1 glow-primary">
            <div className="rounded-lg bg-background/80 overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
                <span className="ml-2 text-xs text-muted-foreground font-mono">codescope — src/auth/handler.ts</span>
              </div>
              {/* Code content */}
              <div className="flex">
                <div className="hidden w-48 border-r border-border/30 p-3 sm:block">
                  <div className="space-y-1.5 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center gap-1.5"><Upload className="h-3 w-3 text-primary" /> src/</div>
                    <div className="ml-4 text-foreground/70">├ auth/</div>
                    <div className="ml-8 text-primary">handler.ts</div>
                    <div className="ml-8 text-foreground/50">middleware.ts</div>
                    <div className="ml-4 text-foreground/70">├ api/</div>
                    <div className="ml-8 text-foreground/50">routes.ts</div>
                    <div className="ml-4 text-foreground/70">├ utils/</div>
                    <div className="ml-8 text-foreground/50">helpers.ts</div>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <pre className="text-xs leading-relaxed text-muted-foreground font-mono sm:text-sm">
                    <code>{`import { verify } from 'jsonwebtoken';
import { db } from '../database';

export async function authenticate(token: string) {
  const decoded = verify(token, process.env.JWT_SECRET);
  const user = await db.users.findById(decoded.id);
  
  if (!user) throw new AuthError('User not found');
  return { user, permissions: user.roles };
}`}</code>
                  </pre>
                </div>
                <div className="hidden w-64 border-l border-border/30 p-3 lg:block">
                  <div className="mb-2 text-xs font-semibold text-primary">AI Analysis</div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="rounded-md bg-primary/5 border border-primary/10 p-2">
                      <span className="text-primary font-medium">authenticate()</span>
                      <p className="mt-1 text-[11px]">JWT verification with DB lookup. Used in 4 routes.</p>
                    </div>
                    <div className="rounded-md bg-warning/5 border border-warning/10 p-2">
                      <span className="text-warning font-medium">⚠ Security</span>
                      <p className="mt-1 text-[11px]">No token expiry validation detected.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
