import { AnalysisResult } from "@/data/mockData";
import { AlertTriangle, AlertCircle, Info, TrendingUp, FileCode, Layers } from "lucide-react";

interface AIPanelProps {
  analysis: AnalysisResult;
}

const severityConfig = {
  error: { icon: AlertCircle, className: "text-destructive bg-destructive/10 border-destructive/20" },
  warning: { icon: AlertTriangle, className: "text-warning bg-warning/10 border-warning/20" },
  info: { icon: Info, className: "text-info bg-info/10 border-info/20" },
};

const AIPanel = ({ analysis }: AIPanelProps) => {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border/50 bg-secondary/30 px-4 py-2.5">
        <h3 className="text-xs font-semibold text-primary">AI Analysis</h3>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
        {/* Score */}
        <div className="text-center">
          <div className="relative mx-auto h-20 w-20">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                strokeDasharray={`${(analysis.score / 100) * 201} 201`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
              {analysis.score}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Code Quality Score</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <FileCode className="mx-auto h-4 w-4 text-primary mb-1" />
            <div className="text-lg font-bold text-foreground">{analysis.totalFiles}</div>
            <div className="text-[10px] text-muted-foreground">Files</div>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <Layers className="mx-auto h-4 w-4 text-accent mb-1" />
            <div className="text-lg font-bold text-foreground">{analysis.totalLines}</div>
            <div className="text-[10px] text-muted-foreground">Lines</div>
          </div>
        </div>

        {/* Languages */}
        <div>
          <h4 className="mb-2 text-xs font-semibold text-foreground">Languages</h4>
          {analysis.languages.map((l) => (
            <div key={l.name} className="mb-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{l.name}</span>
                <span>{l.percentage}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${l.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Issues */}
        <div>
          <h4 className="mb-2 text-xs font-semibold text-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> Issues ({analysis.issues.length})
          </h4>
          <div className="space-y-2">
            {analysis.issues.map((issue, i) => {
              const config = severityConfig[issue.severity];
              const Icon = config.icon;
              return (
                <div key={i} className={`rounded-md border p-2.5 text-xs ${config.className}`}>
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <div>
                      <p className="leading-relaxed">{issue.message}</p>
                      <p className="mt-1 opacity-60 font-mono text-[10px]">{issue.file}:{issue.line}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
