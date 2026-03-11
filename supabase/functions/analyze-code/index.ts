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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { projectId, filesContent } = await req.json();
    if (!projectId || !filesContent) throw new Error("Missing projectId or filesContent");

    // Update project status
    await supabase.from("projects").update({ status: "analyzing" }).eq("id", projectId);

    // Build code summary for AI
    const fileEntries = Object.entries(filesContent as Record<string, string>);
    const codeSummary = fileEntries
      .map(([path, content]) => `=== ${path} ===\n${(content as string).slice(0, 3000)}`)
      .join("\n\n");

    const systemPrompt = `You are CodeScope AI, an expert code analyzer. Analyze the following codebase and return a structured JSON response using the analyze_codebase tool.

For each element found, classify it as one of: variable, function, class, import, export, loop, conditional, api-call.
For each issue, classify severity as: info, warning, or error.
Give a code quality score from 0-100.
Detect all programming languages used.
Be thorough but concise in descriptions.`;

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
          { role: "user", content: `Analyze this codebase:\n\n${codeSummary}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_codebase",
              description: "Return structured analysis of the codebase",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "Brief overview of the codebase architecture and purpose" },
                  score: { type: "integer", minimum: 0, maximum: 100, description: "Code quality score" },
                  total_files: { type: "integer" },
                  total_lines: { type: "integer" },
                  languages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        percentage: { type: "number" },
                      },
                      required: ["name", "percentage"],
                    },
                  },
                  elements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["variable", "function", "class", "import", "export", "loop", "conditional", "api-call"] },
                        name: { type: "string" },
                        file: { type: "string" },
                        line: { type: "integer" },
                        description: { type: "string" },
                        usedIn: { type: "array", items: { type: "string" } },
                        suggestion: { type: "string" },
                      },
                      required: ["type", "name", "file", "line", "description", "usedIn"],
                    },
                  },
                  issues: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        severity: { type: "string", enum: ["info", "warning", "error"] },
                        message: { type: "string" },
                        file: { type: "string" },
                        line: { type: "integer" },
                      },
                      required: ["severity", "message", "file", "line"],
                    },
                  },
                },
                required: ["summary", "score", "total_files", "total_lines", "languages", "elements", "issues"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_codebase" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        await supabase.from("projects").update({ status: "error" }).eq("id", projectId);
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        await supabase.from("projects").update({ status: "error" }).eq("id", projectId);
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) throw new Error("No tool call in AI response");

    const analysis = JSON.parse(toolCall.function.arguments);

    // Save analysis to DB
    const { error: insertError } = await supabase.from("analyses").insert({
      project_id: projectId,
      user_id: user.id,
      summary: analysis.summary,
      elements: analysis.elements,
      issues: analysis.issues,
      score: analysis.score,
      languages: analysis.languages,
      total_files: analysis.total_files,
      total_lines: analysis.total_lines,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save analysis");
    }

    // Update project status
    await supabase.from("projects").update({ status: "complete" }).eq("id", projectId);

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-code error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
