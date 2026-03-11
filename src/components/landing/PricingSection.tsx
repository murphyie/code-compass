import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Try it out",
    features: [
      "1 repository analysis",
      "50 AI queries / month",
      "Basic code insights",
      "File tree navigation",
    ],
    cta: "Get Started",
    variant: "hero-outline" as const,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For individual developers",
    features: [
      "Unlimited repositories",
      "Unlimited AI queries",
      "Security scanning",
      "Dependency graphs",
      "Export documentation",
      "GitHub integration",
    ],
    cta: "Start Pro Trial",
    variant: "hero" as const,
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/mo",
    description: "For teams & organizations",
    features: [
      "Everything in Pro",
      "5 team members",
      "Version comparison",
      "Priority support",
      "API access",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    variant: "hero-outline" as const,
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="relative py-32">
      <div className="absolute inset-0 bg-radial-glow opacity-20" />
      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent <span className="text-gradient-primary">pricing</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Start free. Upgrade when you need more.</p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass rounded-xl p-8 ${plan.highlighted ? "border-primary/40 glow-primary" : ""}`}
            >
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.variant} className="mt-8 w-full" asChild>
                <Link to="/dashboard">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
