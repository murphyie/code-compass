import { useState } from "react";
import { FileText, Download, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ExportDocsButtonProps {
  projectName: string;
  projectId: string | null;
  filesContent: Record<string, string> | null;
  analysis: any;
  techStack: any;
}

const ExportDocsButton = ({ projectName, projectId, filesContent, analysis, techStack }: ExportDocsButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDocs = async () => {
    if (!filesContent || !projectId) {
      toast.error("Upload code first");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-docs", {
        body: { projectName, filesContent, analysis, techStack, format: "markdown" },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setMarkdown(data.markdown);
      setShowPreview(true);
      toast.success("Documentation generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate docs");
    } finally {
      setGenerating(false);
    }
  };

  const downloadMd = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName || "project"}-docs.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    if (!markdown) return;
    const blob = new Blob([JSON.stringify({ projectName, markdown, generatedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName || "project"}-docs.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showPreview && markdown) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <div className="glass-strong w-full max-w-3xl max-h-[85vh] rounded-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Generated Documentation
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={copyToClipboard}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={downloadMd}>
                <Download className="h-3 w-3" /> .md
              </Button>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={downloadJson}>
                <Download className="h-3 w-3" /> .json
              </Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
            <div className="prose prose-invert prose-sm max-w-none [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_code]:text-primary [&_code]:bg-primary/10 [&_table]:text-muted-foreground [&_th]:text-foreground [&_a]:text-primary">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-xs"
      onClick={generateDocs}
      disabled={generating || !filesContent}
    >
      {generating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileText className="h-3.5 w-3.5" />
      )}
      {generating ? "Generating..." : "Export Docs"}
    </Button>
  );
};

export default ExportDocsButton;
