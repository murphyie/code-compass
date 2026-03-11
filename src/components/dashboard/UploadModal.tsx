import { useState, useCallback } from "react";
import { Upload, Github, FileArchive, X, FileCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { parseSingleFile, parseZipFile, fetchGitHubRepo, ProjectFiles } from "@/lib/fileParser";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onProjectLoaded: (project: ProjectFiles) => void;
}

const UploadModal = ({ open, onClose, onProjectLoaded }: UploadModalProps) => {
  const [tab, setTab] = useState<"file" | "zip" | "github">("file");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    try {
      let project: ProjectFiles;
      if (file.name.endsWith(".zip")) {
        project = await parseZipFile(file);
      } else {
        project = await parseSingleFile(file);
      }
      onProjectLoaded(project);
      onClose();
      toast.success(`Loaded ${Object.keys(project.filesContent).length} file(s)`);
    } catch (error: any) {
      toast.error(error.message || "Failed to parse file");
    } finally {
      setLoading(false);
    }
  }, [onProjectLoaded, onClose]);

  const handleGitHub = async () => {
    if (!githubUrl.trim()) {
      toast.error("Please enter a GitHub URL");
      return;
    }
    setLoading(true);
    try {
      const project = await fetchGitHubRepo(githubUrl);
      onProjectLoaded(project);
      onClose();
      toast.success(`Loaded ${Object.keys(project.filesContent).length} files from GitHub`);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch repository");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (!open) return null;

  const codeExts = ".ts,.tsx,.js,.jsx,.py,.java,.go,.rs,.cpp,.c,.h,.rb,.php,.swift,.kt,.css,.html,.json,.yaml,.yml,.md,.sql,.sh,.txt";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="glass-strong w-full max-w-lg rounded-xl p-6 mx-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Upload Code</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-secondary/50 p-1">
          {([
            { key: "file" as const, icon: FileCode, label: "File" },
            { key: "zip" as const, icon: FileArchive, label: "Zip" },
            { key: "github" as const, icon: Github, label: "GitHub" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processing...</p>
          </div>
        ) : tab === "github" ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">Repository URL</label>
              <Input
                placeholder="https://github.com/user/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="bg-secondary/50 border-border/50 font-mono text-sm"
              />
              <p className="mt-1.5 text-[10px] text-muted-foreground">Public repositories only. Up to 50 files analyzed.</p>
            </div>
            <Button variant="hero" className="w-full" onClick={handleGitHub}>
              <Github className="mr-2 h-4 w-4" /> Fetch & Analyze
            </Button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border/50"
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop a {tab === "zip" ? ".zip file" : "source code file"} here
            </p>
            <p className="text-xs text-muted-foreground">or</p>
            <label>
              <input
                type="file"
                accept={tab === "zip" ? ".zip" : codeExts}
                onChange={handleFileInput}
                className="hidden"
              />
              <Button variant="hero-outline" size="sm" className="cursor-pointer" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
