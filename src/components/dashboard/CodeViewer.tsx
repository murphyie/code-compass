import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Settings2, Minus, Plus, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CodeViewerProps {
  file: { name: string; content?: string; language?: string; path?: string } | null;
}

const THEMES = [
  { value: "vs-dark", label: "Dark (Default)" },
  { value: "light", label: "Light" },
  { value: "hc-black", label: "High Contrast" },
];

const LANG_MAP: Record<string, string> = {
  typescript: "typescript",
  javascript: "javascript",
  python: "python",
  java: "java",
  go: "go",
  rust: "rust",
  cpp: "cpp",
  c: "c",
  ruby: "ruby",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  html: "html",
  css: "css",
  json: "json",
  yaml: "yaml",
  markdown: "markdown",
  sql: "sql",
  shell: "shell",
  sh: "shell",
  xml: "xml",
};

const CodeViewer = ({ file }: CodeViewerProps) => {
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(13);
  const [minimap, setMinimap] = useState(true);

  if (!file || !file.content) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Select a file to view its contents</p>
      </div>
    );
  }

  const language = LANG_MAP[file.language || ""] || file.language || "plaintext";

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-secondary/30 px-4 py-1.5">
        <span className="text-xs font-mono text-muted-foreground truncate">
          {file.path || file.name}
        </span>
        <div className="flex items-center gap-1.5">
          {file.language && (
            <span className="text-[10px] uppercase tracking-wider text-primary/60 mr-2">
              {file.language}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setFontSize(Math.max(10, fontSize - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-[10px] text-muted-foreground w-6 text-center">{fontSize}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setFontSize(Math.min(24, fontSize + 1))}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Editor Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                {THEMES.map((t) => (
                  <DropdownMenuRadioItem key={t.value} value={t.value} className="text-xs">
                    {t.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Minimap</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={minimap ? "on" : "off"}
                onValueChange={(v) => setMinimap(v === "on")}
              >
                <DropdownMenuRadioItem value="on" className="text-xs">On</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="off" className="text-xs">Off</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={file.content}
          theme={theme}
          options={{
            readOnly: true,
            fontSize,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: minimap },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
            renderLineHighlight: "line",
            automaticLayout: true,
            padding: { top: 8 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
          }}
          loading={
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default CodeViewer;
