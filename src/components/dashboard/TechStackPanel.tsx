import { Cpu, Package, Wrench, Database, Code2, Boxes } from "lucide-react";
import type { TechStackResult } from "@/lib/techStackDetector";
import { cn } from "@/lib/utils";

interface TechStackPanelProps {
  stack: TechStackResult | null;
}

const categories = [
  { key: "languages" as const, label: "Languages", icon: Code2, color: "text-primary" },
  { key: "frameworks" as const, label: "Frameworks", icon: Boxes, color: "text-accent" },
  { key: "libraries" as const, label: "Libraries", icon: Package, color: "text-info" },
  { key: "buildTools" as const, label: "Build Tools", icon: Wrench, color: "text-warning" },
  { key: "databases" as const, label: "Databases", icon: Database, color: "text-success" },
  { key: "runtime" as const, label: "Runtime", icon: Cpu, color: "text-primary" },
];

const TechStackPanel = ({ stack }: TechStackPanelProps) => {
  if (!stack) return null;

  const hasItems = Object.values(stack).some((arr) => arr.length > 0);
  if (!hasItems) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Cpu className="h-3.5 w-3.5 text-primary" /> Tech Stack
      </h4>
      {categories.map(({ key, label, icon: Icon, color }) => {
        const items = stack[key];
        if (!items.length) return null;
        return (
          <div key={key}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon className={cn("h-3 w-3", color)} />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {items.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-md bg-secondary/70 px-2 py-0.5 text-[10px] font-medium text-foreground/80 border border-border/30"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TechStackPanel;
