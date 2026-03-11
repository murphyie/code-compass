import { useState } from "react";
import { Link } from "react-router-dom";
import { Code2, ArrowLeft, Upload, Github, FileArchive, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileTree from "@/components/dashboard/FileTree";
import CodeViewer from "@/components/dashboard/CodeViewer";
import AIPanel from "@/components/dashboard/AIPanel";
import ChatPanel from "@/components/dashboard/ChatPanel";
import { mockFileTree, mockAnalysis, FileNode } from "@/data/mockData";

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanel, setRightPanel] = useState<"analysis" | "chat">("analysis");

  const handleSelectFile = (node: FileNode) => {
    if (node.type === "file") setSelectedFile(node);
  };

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
            <span className="text-sm font-bold text-foreground">CodeScope <span className="text-primary">AI</span></span>
          </Link>
          <span className="text-xs text-muted-foreground">/ my-project</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" /> Upload
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <FileArchive className="h-3.5 w-3.5" /> Zip
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Github className="h-3.5 w-3.5" /> GitHub
          </Button>
          <Button variant="hero" size="sm" className="text-xs" asChild>
            <Link to="/"><ArrowLeft className="mr-1 h-3 w-3" /> Home</Link>
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
              <FileTree node={mockFileTree} selectedFile={selectedFile?.name} onSelectFile={handleSelectFile} />
            </div>
          </aside>
        )}

        {/* Code viewer */}
        <main className="flex-1 overflow-hidden bg-background">
          <CodeViewer file={selectedFile} />
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
            {rightPanel === "analysis" ? <AIPanel analysis={mockAnalysis} /> : <ChatPanel />}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
