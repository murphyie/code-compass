import { supabase } from "@/integrations/supabase/client";

export interface FileEntry {
  path: string;
  content: string;
}

export interface ProjectFiles {
  name: string;
  filesContent: Record<string, string>;
  fileTree: any;
}

// Parse uploaded single file
export function parseSingleFile(file: File): Promise<ProjectFiles> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        filesContent: { [file.name]: reader.result as string },
        fileTree: buildFileTree({ [file.name]: reader.result as string }),
      });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// Parse uploaded zip (using JSZip loaded from CDN)
export async function parseZipFile(file: File): Promise<ProjectFiles> {
  // Dynamically load JSZip
  const JSZipModule = await import("https://esm.sh/jszip@3.10.1" as any);
  const JSZip = JSZipModule.default;
  const zip = await JSZip.loadAsync(file);

  const filesContent: Record<string, string> = {};
  const codeExtensions = [
    ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs", ".cpp", ".c",
    ".h", ".hpp", ".rb", ".php", ".swift", ".kt", ".css", ".html", ".json",
    ".yaml", ".yml", ".toml", ".md", ".sql", ".sh", ".env.example", ".txt",
  ];

  const filePromises: Promise<void>[] = [];
  let count = 0;

  zip.forEach((relativePath: string, zipEntry: any) => {
    if (zipEntry.dir || count >= 50) return;
    const ext = "." + relativePath.split(".").pop()?.toLowerCase();
    if (!codeExtensions.includes(ext)) return;
    count++;
    filePromises.push(
      zipEntry.async("string").then((content: string) => {
        filesContent[relativePath] = content.slice(0, 50000);
      })
    );
  });

  await Promise.all(filePromises);

  return {
    name: file.name.replace(/\.zip$/, ""),
    filesContent,
    fileTree: buildFileTree(filesContent),
  };
}

// Fetch GitHub repo
export async function fetchGitHubRepo(url: string): Promise<ProjectFiles> {
  const { data, error } = await supabase.functions.invoke("fetch-github", {
    body: { url },
  });

  if (error) throw new Error(error.message || "Failed to fetch GitHub repo");
  if (data?.error) throw new Error(data.error);

  return {
    name: data.name,
    filesContent: data.filesContent,
    fileTree: buildFileTree(data.filesContent),
  };
}

// Build hierarchical file tree from flat paths
export function buildFileTree(filesContent: Record<string, string>) {
  const root: any = { name: "root", type: "folder", children: [] };

  for (const filePath of Object.keys(filesContent)) {
    const parts = filePath.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        const ext = part.split(".").pop()?.toLowerCase() || "";
        const langMap: Record<string, string> = {
          ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
          py: "python", java: "java", go: "go", rs: "rust", cpp: "cpp", c: "c",
          rb: "ruby", php: "php", swift: "swift", kt: "kotlin",
          html: "html", css: "css", json: "json", yaml: "yaml", yml: "yaml",
          md: "markdown", sql: "sql", sh: "shell",
        };
        current.children.push({
          name: part,
          type: "file",
          path: filePath,
          language: langMap[ext] || ext,
          content: filesContent[filePath],
        });
      } else {
        let folder = current.children.find((c: any) => c.name === part && c.type === "folder");
        if (!folder) {
          folder = { name: part, type: "folder", children: [] };
          current.children.push(folder);
        }
        current = folder;
      }
    }
  }

  // Sort: folders first, then files
  function sortTree(node: any) {
    if (node.children) {
      node.children.sort((a: any, b: any) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortTree);
    }
  }
  sortTree(root);

  return root;
}
