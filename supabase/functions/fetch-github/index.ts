import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) throw new Error("Missing GitHub URL");

    // Parse GitHub URL
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error("Invalid GitHub URL format");

    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, "");

    // Fetch repo contents via GitHub API (public repos only for now)
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/git/trees/main?recursive=1`;
    const treeResp = await fetch(apiUrl, {
      headers: { "User-Agent": "CodeScope-AI" },
    });

    if (!treeResp.ok) {
      // Try master branch
      const masterUrl = `https://api.github.com/repos/${owner}/${repoName}/git/trees/master?recursive=1`;
      const masterResp = await fetch(masterUrl, {
        headers: { "User-Agent": "CodeScope-AI" },
      });
      if (!masterResp.ok) {
        throw new Error(`GitHub API error: ${treeResp.status}. Make sure the repo is public.`);
      }
      const masterData = await masterResp.json();
      return await processTree(owner, repoName, masterData);
    }

    const treeData = await treeResp.json();
    const result = await processTree(owner, repoName, treeData);
    return new Response(result.body, {
      status: result.status,
      headers: result.headers,
    });
  } catch (e) {
    console.error("fetch-github error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function processTree(owner: string, repo: string, treeData: any) {
  const codeExtensions = [
    ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs", ".cpp", ".c",
    ".h", ".hpp", ".rb", ".php", ".swift", ".kt", ".css", ".html", ".json",
    ".yaml", ".yml", ".toml", ".md", ".sql", ".sh", ".env.example",
  ];

  const blobs = (treeData.tree || [])
    .filter((item: any) => item.type === "blob")
    .filter((item: any) => {
      const ext = "." + item.path.split(".").pop()?.toLowerCase();
      return codeExtensions.includes(ext) && item.size < 50000;
    })
    .slice(0, 50); // Limit to 50 files

  // Fetch file contents in parallel (batch of 10)
  const filesContent: Record<string, string> = {};
  const fileTree: any[] = [];

  for (let i = 0; i < blobs.length; i += 10) {
    const batch = blobs.slice(i, i + 10);
    const results = await Promise.all(
      batch.map(async (blob: any) => {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${blob.path}`;
          const resp = await fetch(rawUrl);
          if (!resp.ok) {
            // Try master
            const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${blob.path}`;
            const masterResp = await fetch(masterUrl);
            if (!masterResp.ok) return null;
            return { path: blob.path, content: await masterResp.text() };
          }
          return { path: blob.path, content: await resp.text() };
        } catch {
          return null;
        }
      })
    );

    for (const result of results) {
      if (result) {
        filesContent[result.path] = result.content;
      }
    }
  }

  // Build file tree structure
  for (const blob of blobs) {
    fileTree.push({
      path: blob.path,
      type: "file",
      size: blob.size,
    });
  }

  return new Response(
    JSON.stringify({
      name: repo,
      fileTree,
      filesContent,
      totalFiles: Object.keys(filesContent).length,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
