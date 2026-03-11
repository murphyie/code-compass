import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2, ArrowLeft, Upload, PanelLeftClose, PanelLeft, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileTree from "@/components/dashboard/FileTree";
import type { FileNode } from "@/components/dashboard/FileTree";
import CodeViewer from "@/components/dashboard/CodeViewer";
import AIPanel from "@/components/dashboard/AIPanel";
import ChatPanel from "@/components/dashboard/ChatPanel";
import UploadModal from "@/components/dashboard/UploadModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analyzeCode } from "@/lib/aiService";
import { ProjectFiles } from "@/lib/fileParser";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanel, setRightPanel] = useState<"analysis" | "chat">("analysis");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Project state
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("No project loaded");
  const [fileTree, setFileTree] = useState<any>(null);
  const [filesContent, setFilesContent] = useState<Record<string, string> | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleProjectLoaded = async (project: ProjectFiles) => {
    try {
      // Create project in DB
      const { data: proj, error: projError } = await supabase
        .from("projects")
        .insert({
          user_id: user!.id,
          name: project.name,
          source_type: "file",
          file_tree: project.fileTree,
          files_content: project.filesContent as any,
          status: "pending",
        })
        .select()
        .single();

      if (projError) throw projError;

      setProjectId(proj.id);
      setProjectName(project.name);
      setFileTree(project.fileTree);
      setFilesContent(project.filesContent);
      setAnalysis(null);
      setSelectedFile(null);

      // Trigger AI analysis
      setAnalyzing(true);
      setRightPanel("analysis");

      try {
        const result = await analyzeCode(proj.id, project.filesContent);
        setAnalysis(result.analysis);
        toast.success("Code analysis complete!");
      } catch (error: any) {
        toast.error(error.message || "Analysis failed");
      } finally {
        setAnalyzing(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save project");
    }
  };

  const handleSelectFile = (node: FileNode) => {
    if (node.type === "file") {
      // If content is in filesContent map, use that
      const content = node.content || (filesContent && node.path ? filesContent[node.path] : undefined);
      setSelectedFile({ ...node, content });
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 bg-card/60 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline text-sm font-bold text-foreground">CodeScope <span className="text-primary">AI</span></span>
          </Link>
          <span className="text-xs text-muted-foreground truncate max-w-32">/ {projectName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="hero" size="sm" className="gap-1.5 text-xs" onClick={() => setUploadOpen(true)}>
            <Upload className="h-3.5 w-3.5" /> Upload
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={signOut}>
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File tree sidebar */}
        {sidebarOpen && (
          <aside className="w-56 shrink-0 border-r border-border/50 bg-sidebar overflow-hidden flex flex-col">
            <div className="border-b border-border/50 px-4 py-2.5">
              <h3 className="text-xs font-semibold text-sidebar-foreground">Explorer</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {fileTree ? (
                <FileTree node={fileTree} selectedPath={selectedFile?.path} onSelectFile={handleSelectFile} />
              ) : (
                <div className="flex items-center justify-center h-full p-4">
                  <p className="text-xs text-muted-foreground text-center">Upload code to explore files</p>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Code viewer */}
        <main className="flex-1 overflow-hidden bg-background">
          {selectedFile ? (
            <CodeViewer file={selectedFile} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <Code2 className="h-12 w-12 text-muted-foreground/20" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {fileTree ? "Select a file from the explorer" : "Upload code to get started"}
                </p>
                {!fileTree && (
                  <Button variant="hero" size="sm" className="mt-4 gap-1.5" onClick={() => setUploadOpen(true)}>
                    <Upload className="h-3.5 w-3.5" /> Upload Code
                  </Button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right panel */}
        <aside className="w-72 shrink-0 border-l border-border/50 bg-card/40 flex flex-col overflow-hidden">
          <div className="flex border-b border-border/50">
            <button
              onClick={() => setRightPanel("analysis")}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                rightPanel === "analysis" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setRightPanel("chat")}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                rightPanel === "chat" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
            >
              AI Chat
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {rightPanel === "analysis" ? (
              <AIPanel analysis={analysis} loading={analyzing} />
            ) : (
              <ChatPanel projectId={projectId} filesContent={filesContent} />
            )}
          </div>
        </aside>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onProjectLoaded={handleProjectLoaded} />
    </div>
  );
};

export default Dashboard;
