import { useState } from "react";
import { FileNode } from "@/data/mockData";
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  node: FileNode;
  depth?: number;
  selectedFile?: string;
  onSelectFile: (node: FileNode) => void;
}

const FileTreeItem = ({ node, depth = 0, selectedFile, onSelectFile }: FileTreeProps) => {
  const [open, setOpen] = useState(depth < 2);
  const isFolder = node.type === "folder";
  const isSelected = !isFolder && node.name === selectedFile;

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) setOpen(!open);
          else onSelectFile(node);
        }}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary",
          isSelected && "bg-primary/10 text-primary",
          !isSelected && "text-sidebar-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          <>
            {open ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />}
            {open ? <FolderOpen className="h-3.5 w-3.5 shrink-0 text-primary/70" /> : <Folder className="h-3.5 w-3.5 shrink-0 text-primary/70" />}
          </>
        ) : (
          <>
            <span className="w-3" />
            <FileCode className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
        <span className="truncate font-mono">{node.name}</span>
      </button>
      {isFolder && open && node.children?.map((child) => (
        <FileTreeItem key={child.name} node={child} depth={depth + 1} selectedFile={selectedFile} onSelectFile={onSelectFile} />
      ))}
    </div>
  );
};

const FileTree = ({ node, selectedFile, onSelectFile }: FileTreeProps) => {
  return (
    <div className="scrollbar-thin overflow-y-auto p-2">
      {node.children?.map((child) => (
        <FileTreeItem key={child.name} node={child} depth={0} selectedFile={selectedFile} onSelectFile={onSelectFile} />
      ))}
    </div>
  );
};

export default FileTree;
