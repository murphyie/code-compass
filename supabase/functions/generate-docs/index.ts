import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { projectName, filesContent, analysis, techStack, format } = await req.json();
    if (!filesContent) throw new Error("Missing filesContent");

    const fileEntries = Object.entries(filesContent as Record<string, string>);
    const codeSummary = fileEntries
      .slice(0, 30)
      .map(([path, content]) => `=== ${path} ===\n${(content as string).slice(0, 2000)}`)
      .join("\n\n");

    const systemPrompt = `You are a technical documentation generator. Generate comprehensive project documentation using the generate_documentation tool.

The documentation should include:
- A clear project overview
- Architecture description
- Module/file descriptions
- Key function documentation with params and return types
- API endpoints if any
- Setup instructions based on the tech stack
- Dependencies overview

Be thorough, professional, and well-structured. Use proper markdown formatting.`;

    const contextParts = [`Project: ${projectName || "Untitled"}\n\nCodebase:\n${codeSummary}`];
    if (analysis) contextParts.push(`\nExisting analysis: ${JSON.stringify(analysis)}`);
    if (techStack) contextParts.push(`\nTech stack: ${JSON.stringify(techStack)}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contextParts.join("\n") },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_documentation",
              description: "Generate structured project documentation",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Project title" },
                  overview: { type: "string", description: "Project overview in markdown" },
                  architecture: { type: "string", description: "Architecture description in markdown" },
                  modules: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        path: { type: "string" },
                        description: { type: "string" },
                        functions: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              description: { type: "string" },
                              params: { type: "string" },
                              returns: { type: "string" },
                            },
                            required: ["name", "description"],
                          },
                        },
                      },
                      required: ["name", "path", "description"],
                    },
                  },
                  apis: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        method: { type: "string" },
                        endpoint: { type: "string" },
                        description: { type: "string" },
                      },
                      required: ["method", "endpoint", "description"],
                    },
                  },
                  setup: { type: "string", description: "Setup/installation instructions in markdown" },
                  dependencies: { type: "string", description: "Dependencies overview in markdown" },
                },
                required: ["title", "overview", "architecture", "modules", "setup"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_documentation" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI documentation generation failed");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const docs = JSON.parse(toolCall.function.arguments);

    // Format as markdown if requested
    if (format === "markdown" || !format) {
      let md = `# ${docs.title}\n\n`;
      md += `## Table of Contents\n\n`;
      md += `1. [Overview](#overview)\n`;
      md += `2. [Architecture](#architecture)\n`;
      md += `3. [Modules](#modules)\n`;
      if (docs.apis?.length) md += `4. [API Reference](#api-reference)\n`;
      md += `${docs.apis?.length ? 5 : 4}. [Setup](#setup)\n`;
      if (docs.dependencies) md += `${docs.apis?.length ? 6 : 5}. [Dependencies](#dependencies)\n`;
      md += `\n---\n\n`;

      md += `## Overview\n\n${docs.overview}\n\n`;
      md += `## Architecture\n\n${docs.architecture}\n\n`;

      md += `## Modules\n\n`;
      for (const mod of docs.modules || []) {
        md += `### ${mod.name}\n\n`;
        md += `**Path:** \`${mod.path}\`\n\n`;
        md += `${mod.description}\n\n`;
        if (mod.functions?.length) {
          md += `#### Functions\n\n`;
          for (const fn of mod.functions) {
            md += `- **\`${fn.name}\`**`;
            if (fn.params) md += ` (${fn.params})`;
            if (fn.returns) md += ` → ${fn.returns}`;
            md += `\n  ${fn.description}\n\n`;
          }
        }
      }

      if (docs.apis?.length) {
        md += `## API Reference\n\n`;
        md += `| Method | Endpoint | Description |\n|--------|----------|-------------|\n`;
        for (const api of docs.apis) {
          md += `| ${api.method} | \`${api.endpoint}\` | ${api.description} |\n`;
        }
        md += `\n`;
      }

      md += `## Setup\n\n${docs.setup}\n\n`;
      if (docs.dependencies) md += `## Dependencies\n\n${docs.dependencies}\n`;

      return new Response(JSON.stringify({ success: true, docs, markdown: md }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, docs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-docs error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
