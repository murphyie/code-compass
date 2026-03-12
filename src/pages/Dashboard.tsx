import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2, Upload, PanelLeftClose, PanelLeft, LogOut, Loader2, MessageSquare, BarChart3, X, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileTree from "@/components/dashboard/FileTree";
import type { FileNode } from "@/components/dashboard/FileTree";
import CodeViewer from "@/components/dashboard/CodeViewer";
import AIPanel from "@/components/dashboard/AIPanel";
import ChatPanel from "@/components/dashboard/ChatPanel";
import TechStackPanel from "@/components/dashboard/TechStackPanel";
import ExportDocsButton from "@/components/dashboard/ExportDocsButton";
import UploadModal from "@/components/dashboard/UploadModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analyzeCode } from "@/lib/aiService";
import { ProjectFiles } from "@/lib/fileParser";
import { detectTechStack, TechStackResult } from "@/lib/techStackDetector";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type RightTab = "analysis" | "chat";

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanel, setRightPanel] = useState<RightTab>("analysis");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  // Project state
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("No project loaded");
  const [fileTree, setFileTree] = useState<any>(null);
  const [filesContent, setFilesContent] = useState<Record<string, string> | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [techStack, setTechStack] = useState<TechStackResult | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleProjectLoaded = async (project: ProjectFiles) => {
    try {
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

      // Detect tech stack immediately (client-side, instant)
      const stack = detectTechStack(project.filesContent);
      setTechStack(stack);

      // Trigger AI analysis
      setAnalyzing(true);
      setRightPanel("analysis");
      if (isMobile) setMobileRightOpen(true);

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
      const content = node.content || (filesContent && node.path ? filesContent[node.path] : undefined);
      setSelectedFile({ ...node, content });
      if (isMobile) setSidebarOpen(false);
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

  const rightPanelContent = (
    <>
      <div className="flex border-b border-border/50">
        {(["analysis", "chat"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setRightPanel(tab)}
            className={cn(
              "flex-1 py-2.5 text-xs font-medium transition-colors",
              rightPanel === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            )}
          >
            {tab === "analysis" ? "Analysis" : "AI Chat"}
          </button>
        ))}
        {isMobile && (
          <button onClick={() => setMobileRightOpen(false)} className="px-3 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        {rightPanel === "analysis" ? (
          <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
            <AIPanel analysis={analysis} loading={analyzing} />
            {techStack && (
              <div className="px-4 pb-4">
                <TechStackPanel stack={techStack} />
              </div>
            )}
          </div>
        ) : (
          <ChatPanel projectId={projectId} filesContent={filesContent} />
        )}
      </div>
    </>
  );

  const fileExplorer = (
    <>
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
        <h3 className="text-xs font-semibold text-sidebar-foreground">Explorer</h3>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
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
    </>
  );

  const emptyState = (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
      <Code2 className={cn("text-muted-foreground/20", isMobile ? "h-10 w-10" : "h-12 w-12")} />
      <p className="text-sm text-muted-foreground text-center">
        {fileTree ? "Select a file from the explorer" : "Upload code to get started"}
      </p>
      {!fileTree && (
        <Button variant="hero" size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
          <Upload className="h-3.5 w-3.5" /> Upload Code
        </Button>
      )}
    </div>
  );

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex h-[100dvh] flex-col bg-background">
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-border/50 bg-card/60 px-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-foreground">CodeScope</span>
            <span className="text-[10px] text-muted-foreground truncate max-w-20">/ {projectName}</span>
          </div>
          <div className="flex items-center gap-1">
            <ExportDocsButton projectName={projectName} projectId={projectId} filesContent={filesContent} analysis={analysis} techStack={techStack} />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setUploadOpen(true)}>
              <Upload className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={signOut}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                <motion.aside initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute left-0 top-0 bottom-0 z-30 w-64 border-r border-border/50 bg-sidebar flex flex-col">
                  {fileExplorer}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {mobileRightOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm" onClick={() => setMobileRightOpen(false)} />
                <motion.aside initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute right-0 top-0 bottom-0 z-30 w-[85%] max-w-80 border-l border-border/50 bg-card/95 backdrop-blur-xl flex flex-col">
                  {rightPanelContent}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <main className="h-full overflow-hidden">
            {selectedFile ? <CodeViewer file={selectedFile} /> : emptyState}
          </main>
        </div>

        <nav className="flex h-12 shrink-0 items-center justify-around border-t border-border/50 bg-card/80 backdrop-blur-xl">
          <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-0.5 px-4 py-1 text-muted-foreground">
            <PanelLeft className="h-4 w-4" /><span className="text-[9px]">Files</span>
          </button>
          <button onClick={() => { setMobileRightOpen(true); setRightPanel("analysis"); }} className="flex flex-col items-center gap-0.5 px-4 py-1 text-muted-foreground">
            <BarChart3 className="h-4 w-4" /><span className="text-[9px]">Analysis</span>
          </button>
          <button onClick={() => { setMobileRightOpen(true); setRightPanel("chat"); }} className="flex flex-col items-center gap-0.5 px-4 py-1 text-muted-foreground">
            <MessageSquare className="h-4 w-4" /><span className="text-[9px]">Chat</span>
          </button>
        </nav>

        <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onProjectLoaded={handleProjectLoaded} />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 bg-card/60 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">CodeScope <span className="text-primary">AI</span></span>
          </Link>
          <span className="text-xs text-muted-foreground truncate max-w-32">/ {projectName}</span>
        </div>
        <div className="flex items-center gap-2">
          <ExportDocsButton projectName={projectName} projectId={projectId} filesContent={filesContent} analysis={analysis} techStack={techStack} />
          <Button variant="hero" size="sm" className="gap-1.5 text-xs" onClick={() => setUploadOpen(true)}>
            <Upload className="h-3.5 w-3.5" /> Upload
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={signOut}>
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 224, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}
              className="shrink-0 border-r border-border/50 bg-sidebar overflow-hidden flex flex-col">
              {fileExplorer}
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-hidden bg-background">
          {selectedFile ? <CodeViewer file={selectedFile} /> : emptyState}
        </main>

        <aside className="w-72 shrink-0 border-l border-border/50 bg-card/40 flex flex-col overflow-hidden">
          {rightPanelContent}
        </aside>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onProjectLoaded={handleProjectLoaded} />
    </div>
  );
};

export default Dashboard;
