/**
 * Detects the tech stack from uploaded project files.
 * Parses config files like package.json, requirements.txt, etc.
 */

export interface TechStackResult {
  languages: string[];
  frameworks: string[];
  libraries: string[];
  buildTools: string[];
  databases: string[];
  runtime: string[];
}

export function detectTechStack(filesContent: Record<string, string>): TechStackResult {
  const result: TechStackResult = {
    languages: [],
    frameworks: [],
    libraries: [],
    buildTools: [],
    databases: [],
    runtime: [],
  };

  const seen = new Set<string>();
  const add = (category: keyof TechStackResult, name: string) => {
    const key = `${category}:${name}`;
    if (!seen.has(key)) {
      seen.add(key);
      result[category].push(name);
    }
  };

  // Detect languages from file extensions
  const extLangMap: Record<string, string> = {
    ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript",
    py: "Python", java: "Java", go: "Go", rs: "Rust", rb: "Ruby",
    php: "PHP", swift: "Swift", kt: "Kotlin", cpp: "C++", c: "C",
    cs: "C#", dart: "Dart", scala: "Scala", sh: "Shell",
    html: "HTML", css: "CSS", scss: "SCSS", sql: "SQL",
  };

  for (const path of Object.keys(filesContent)) {
    const ext = path.split(".").pop()?.toLowerCase() || "";
    if (extLangMap[ext]) add("languages", extLangMap[ext]);
  }

  // Parse package.json
  for (const [path, content] of Object.entries(filesContent)) {
    if (path.endsWith("package.json")) {
      try {
        const pkg = JSON.parse(content);
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

        // Frameworks
        const frameworkMap: Record<string, string> = {
          react: "React", next: "Next.js", vue: "Vue.js", nuxt: "Nuxt",
          angular: "Angular", svelte: "Svelte", express: "Express",
          fastify: "Fastify", "react-native": "React Native",
          gatsby: "Gatsby", remix: "Remix", astro: "Astro",
        };

        // Build tools
        const buildToolMap: Record<string, string> = {
          vite: "Vite", webpack: "Webpack", esbuild: "esbuild",
          rollup: "Rollup", parcel: "Parcel", turbo: "Turbo",
          typescript: "TypeScript Compiler", tailwindcss: "Tailwind CSS",
        };

        // Database
        const dbMap: Record<string, string> = {
          prisma: "Prisma", mongoose: "MongoDB (Mongoose)",
          pg: "PostgreSQL", mysql2: "MySQL", redis: "Redis",
          "@supabase/supabase-js": "Supabase", firebase: "Firebase",
          typeorm: "TypeORM", sequelize: "Sequelize", drizzle: "Drizzle",
          "@prisma/client": "Prisma",
        };

        // Notable libraries
        const libMap: Record<string, string> = {
          axios: "Axios", "react-query": "React Query",
          "@tanstack/react-query": "TanStack Query",
          zustand: "Zustand", redux: "Redux", "react-router-dom": "React Router",
          "framer-motion": "Framer Motion", "react-hook-form": "React Hook Form",
          zod: "Zod", "date-fns": "date-fns", lodash: "Lodash",
          "socket.io": "Socket.IO", graphql: "GraphQL",
          "@apollo/client": "Apollo Client", trpc: "tRPC",
          jest: "Jest", vitest: "Vitest", mocha: "Mocha",
          playwright: "Playwright", cypress: "Cypress",
          storybook: "Storybook", recharts: "Recharts", d3: "D3.js",
          "three": "Three.js", "react-three-fiber": "React Three Fiber",
          stripe: "Stripe", "lucide-react": "Lucide Icons",
          "react-markdown": "React Markdown", sonner: "Sonner",
        };

        for (const dep of Object.keys(allDeps)) {
          if (frameworkMap[dep]) add("frameworks", frameworkMap[dep]);
          if (buildToolMap[dep]) add("buildTools", buildToolMap[dep]);
          if (dbMap[dep]) add("databases", dbMap[dep]);
          if (libMap[dep]) add("libraries", libMap[dep]);
        }

        add("runtime", "Node.js");
      } catch { /* ignore parse errors */ }
    }
  }

  // Parse requirements.txt
  for (const [path, content] of Object.entries(filesContent)) {
    if (path.endsWith("requirements.txt")) {
      add("runtime", "Python");
      const pyFrameworks: Record<string, string> = {
        django: "Django", flask: "Flask", fastapi: "FastAPI",
        tornado: "Tornado", starlette: "Starlette",
      };
      const pyLibs: Record<string, string> = {
        pandas: "Pandas", numpy: "NumPy", scipy: "SciPy",
        tensorflow: "TensorFlow", pytorch: "PyTorch", scikit: "scikit-learn",
        sqlalchemy: "SQLAlchemy", celery: "Celery", requests: "Requests",
      };
      for (const line of content.split("\n")) {
        const pkg = line.trim().split(/[=<>!]/)[0].toLowerCase();
        if (pyFrameworks[pkg]) add("frameworks", pyFrameworks[pkg]);
        if (pyLibs[pkg]) add("libraries", pyLibs[pkg]);
      }
    }
  }

  // Parse go.mod
  for (const [path, content] of Object.entries(filesContent)) {
    if (path.endsWith("go.mod")) {
      add("runtime", "Go");
      if (content.includes("gin-gonic")) add("frameworks", "Gin");
      if (content.includes("gorilla/mux")) add("frameworks", "Gorilla Mux");
      if (content.includes("fiber")) add("frameworks", "Fiber");
    }
  }

  // Parse Cargo.toml
  for (const [path, content] of Object.entries(filesContent)) {
    if (path.endsWith("Cargo.toml")) {
      add("runtime", "Rust");
      if (content.includes("actix")) add("frameworks", "Actix");
      if (content.includes("rocket")) add("frameworks", "Rocket");
      if (content.includes("tokio")) add("libraries", "Tokio");
    }
  }

  // Parse pom.xml
  for (const [path, content] of Object.entries(filesContent)) {
    if (path.endsWith("pom.xml")) {
      add("runtime", "Java (Maven)");
      if (content.includes("spring")) add("frameworks", "Spring");
    }
  }

  // Parse composer.json
  for (const [path, content] of Object.entries(filesContent)) {
    if (path.endsWith("composer.json")) {
      add("runtime", "PHP");
      if (content.includes("laravel")) add("frameworks", "Laravel");
      if (content.includes("symfony")) add("frameworks", "Symfony");
    }
  }

  return result;
}
