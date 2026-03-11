import { motion } from "framer-motion";
import { Upload, Cpu, LayoutDashboard } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Code",
    description: "Drop a file, upload a zip, or paste a GitHub repository URL.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analyzes Everything",
    description: "Every variable, function, import, and dependency is parsed and mapped.",
  },
  {
    icon: LayoutDashboard,
    step: "03",
    title: "Explore & Ask Questions",
    description: "Navigate the interactive code map and ask the AI anything about your codebase.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it <span className="text-gradient-primary">works</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three steps to complete code understanding.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <s.icon className="h-7 w-7" />
              </div>
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{s.step}</div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
