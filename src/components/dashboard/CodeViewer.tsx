interface CodeViewerProps {
  file: { name: string; content?: string; language?: string; path?: string } | null;
}

const CodeViewer = ({ file }: CodeViewerProps) => {
  if (!file || !file.content) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Select a file to view its contents</p>
      </div>
    );
  }

  const lines = file.content.split("\n");

  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="flex border-b border-border/50 bg-secondary/30 px-4 py-2">
        <span className="text-xs font-mono text-muted-foreground">{file.path || file.name}</span>
        {file.language && (
          <span className="ml-auto text-[10px] uppercase tracking-wider text-primary/60">{file.language}</span>
        )}
      </div>
      <pre className="p-4 text-sm leading-6 font-mono">
        {lines.map((line, i) => (
          <div key={i} className="group flex hover:bg-secondary/30">
            <span className="mr-6 inline-block w-8 select-none text-right text-xs text-muted-foreground/40">
              {i + 1}
            </span>
            <code className="text-foreground/90">{line || " "}</code>
          </div>
        ))}
      </pre>
    </div>
  );
};

export default CodeViewer;
