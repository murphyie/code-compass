import { motion } from "framer-motion";
import {
  Brain,
  GitBranch,
  Search,
  Shield,
  FileCode,
  Layers,
  Workflow,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Deep Code Analysis",
    description: "AI parses every variable, function, class, and dependency across your entire codebase.",
  },
  {
    icon: Search,
    title: "Natural Language Search",
    description: 'Ask "Where is the auth logic?" and get instant, contextual answers.',
  },
  {
    icon: Workflow,
    title: "Dependency Graphs",
    description: "Interactive visual maps showing how files, functions, and modules connect.",
  },
  {
    icon: Shield,
    title: "Security Scanner",
    description: "Detect vulnerabilities, unused code, and potential bugs automatically.",
  },
  {
    icon: FileCode,
    title: "Multi-Language Support",
    description: "TypeScript, Python, Java, Go, Rust, C++, and 10+ more languages supported.",
  },
  {
    icon: GitBranch,
    title: "GitHub Integration",
    description: "Paste any GitHub URL and analyze the entire repository instantly.",
  },
  {
    icon: Layers,
    title: "Architecture Overview",
    description: "Understand project structure, patterns, and design decisions at a glance.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "Ask questions about your codebase and get expert-level explanations.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-32">
      <div className="absolute inset-0 bg-radial-glow opacity-30" />
      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to{" "}
            <span className="text-gradient-primary">understand code</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful AI tools designed for developers who want to move fast.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="group glass rounded-xl p-6 transition-all hover:border-primary/30 hover:bg-card/80"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
