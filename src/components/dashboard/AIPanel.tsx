import { AlertTriangle, AlertCircle, Info, TrendingUp, FileCode, Layers, Loader2 } from "lucide-react";

interface AnalysisData {
  summary?: string;
  elements?: any[];
  issues?: any[];
  score?: number;
  languages?: { name: string; percentage: number }[];
  total_files?: number;
  total_lines?: number;
}

interface AIPanelProps {
  analysis: AnalysisData | null;
  loading?: boolean;
}

const severityConfig = {
  error: { icon: AlertCircle, className: "text-destructive bg-destructive/10 border-destructive/20" },
  warning: { icon: AlertTriangle, className: "text-warning bg-warning/10 border-warning/20" },
  info: { icon: Info, className: "text-info bg-info/10 border-info/20" },
};

const AIPanel = ({ analysis, loading }: AIPanelProps) => {
  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">AI is analyzing your code...</p>
        <p className="text-xs text-muted-foreground/60">This may take a moment</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <FileCode className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Upload code to see AI analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border/50 bg-secondary/30 px-4 py-2.5">
        <h3 className="text-xs font-semibold text-primary">AI Analysis</h3>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
        {/* Score */}
        {analysis.score != null && (
          <div className="text-center">
            <div className="relative mx-auto h-20 w-20">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                  strokeDasharray={`${(analysis.score / 100) * 201} 201`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                {analysis.score}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Code Quality Score</p>
          </div>
        )}

        {/* Summary */}
        {analysis.summary && (
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <h4 className="mb-1 text-xs font-semibold text-primary">Summary</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">{analysis.summary}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <FileCode className="mx-auto h-4 w-4 text-primary mb-1" />
            <div className="text-lg font-bold text-foreground">{analysis.total_files || 0}</div>
            <div className="text-[10px] text-muted-foreground">Files</div>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <Layers className="mx-auto h-4 w-4 text-accent mb-1" />
            <div className="text-lg font-bold text-foreground">{analysis.total_lines || 0}</div>
            <div className="text-[10px] text-muted-foreground">Lines</div>
          </div>
        </div>

        {/* Languages */}
        {analysis.languages && analysis.languages.length > 0 && (
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
        )}

        {/* Elements */}
        {analysis.elements && analysis.elements.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold text-foreground">
              Elements ({analysis.elements.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
              {analysis.elements.slice(0, 20).map((el, i) => (
                <div key={i} className="rounded-md bg-secondary/50 px-2.5 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary">{el.type}</span>
                    <span className="font-medium text-foreground truncate">{el.name}</span>
                  </div>
                  {el.description && (
                    <p className="mt-1 text-[11px] text-muted-foreground truncate">{el.description}</p>
                  )}
                  {el.suggestion && (
                    <p className="mt-1 text-[11px] text-warning">💡 {el.suggestion}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {analysis.issues && analysis.issues.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold text-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Issues ({analysis.issues.length})
            </h4>
            <div className="space-y-2">
              {analysis.issues.map((issue, i) => {
                const config = severityConfig[issue.severity as keyof typeof severityConfig] || severityConfig.info;
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
        )}
      </div>
    </div>
  );
};

export default AIPanel;
