export interface FileNode {
  name: string;
  type: "file" | "folder";
  language?: string;
  children?: FileNode[];
  content?: string;
}

export interface CodeElement {
  type: "variable" | "function" | "class" | "import" | "export" | "loop" | "conditional" | "api-call";
  name: string;
  line: number;
  description: string;
  usedIn: string[];
  suggestion?: string;
}

export interface AnalysisResult {
  totalFiles: number;
  totalLines: number;
  languages: { name: string; percentage: number }[];
  elements: CodeElement[];
  issues: { severity: "info" | "warning" | "error"; message: string; file: string; line: number }[];
  score: number;
}

export const mockFileTree: FileNode = {
  name: "my-project",
  type: "folder",
  children: [
    {
      name: "src",
      type: "folder",
      children: [
        {
          name: "auth",
          type: "folder",
          children: [
            { name: "handler.ts", type: "file", language: "typescript", content: `import { verify } from 'jsonwebtoken';
import { db } from '../database';
import { AuthError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthResult {
  user: User;
  permissions: string[];
}

export async function authenticate(token: string): Promise<AuthResult> {
  try {
    const decoded = verify(token, JWT_SECRET);
    const user = await db.users.findById(decoded.id);
    
    if (!user) {
      throw new AuthError('User not found');
    }
    
    return { user, permissions: user.roles };
  } catch (error) {
    throw new AuthError('Invalid token');
  }
}

export function generateToken(userId: string): string {
  return sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });
}` },
            { name: "middleware.ts", type: "file", language: "typescript", content: `import { authenticate } from './handler';
import { Request, Response, NextFunction } from 'express';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const result = await authenticate(token);
    req.user = result.user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}` },
          ],
        },
        {
          name: "api",
          type: "folder",
          children: [
            { name: "routes.ts", type: "file", language: "typescript", content: `import { Router } from 'express';
import { authMiddleware } from '../auth/middleware';
import { getUsers, createUser, deleteUser } from './controllers';

const router = Router();

router.get('/users', authMiddleware, getUsers);
router.post('/users', authMiddleware, createUser);
router.delete('/users/:id', authMiddleware, deleteUser);

export default router;` },
            { name: "controllers.ts", type: "file", language: "typescript", content: `import { db } from '../database';
import { Request, Response } from 'express';

export async function getUsers(req: Request, res: Response) {
  const users = await db.users.findAll();
  return res.json(users);
}

export async function createUser(req: Request, res: Response) {
  const { name, email } = req.body;
  const user = await db.users.create({ name, email });
  return res.status(201).json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  await db.users.delete(id);
  return res.status(204).send();
}` },
          ],
        },
        {
          name: "utils",
          type: "folder",
          children: [
            { name: "helpers.ts", type: "file", language: "typescript", content: `export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// TODO: This function is never used
export function deprecatedHelper(): void {
  console.log('This should be removed');
}` },
          ],
        },
        { name: "database.ts", type: "file", language: "typescript", content: `import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = {
  users: {
    findAll: () => pool.query('SELECT * FROM users'),
    findById: (id: string) => pool.query('SELECT * FROM users WHERE id = $1', [id]),
    create: (data: any) => pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [data.name, data.email]),
    delete: (id: string) => pool.query('DELETE FROM users WHERE id = $1', [id]),
  },
};` },
        { name: "index.ts", type: "file", language: "typescript", content: `import express from 'express';
import router from './api/routes';
import { authMiddleware } from './auth/middleware';

const app = express();
app.use(express.json());
app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});` },
      ],
    },
    { name: "package.json", type: "file", language: "json", content: `{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2"
  }
}` },
    { name: "tsconfig.json", type: "file", language: "json", content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "outDir": "./dist"
  }
}` },
  ],
};

export const mockAnalysis: AnalysisResult = {
  totalFiles: 8,
  totalLines: 142,
  languages: [
    { name: "TypeScript", percentage: 88 },
    { name: "JSON", percentage: 12 },
  ],
  elements: [
    { type: "function", name: "authenticate", line: 12, description: "Verifies JWT token and returns user with permissions", usedIn: ["middleware.ts"], suggestion: "Add token expiry validation" },
    { type: "function", name: "generateToken", line: 28, description: "Creates a JWT token for a user ID", usedIn: ["controllers.ts"], suggestion: "Consider adding refresh tokens" },
    { type: "function", name: "authMiddleware", line: 4, description: "Express middleware for route authentication", usedIn: ["routes.ts", "index.ts"] },
    { type: "variable", name: "JWT_SECRET", line: 4, description: "JWT signing secret from environment", usedIn: ["handler.ts"], suggestion: "Validate that this is set on startup" },
    { type: "function", name: "deprecatedHelper", line: 12, description: "Unused utility function", usedIn: [], suggestion: "Remove this dead code" },
    { type: "import", name: "Pool from 'pg'", line: 1, description: "PostgreSQL connection pool", usedIn: ["database.ts"] },
    { type: "api-call", name: "GET /users", line: 7, description: "Fetches all users from database", usedIn: ["routes.ts"] },
    { type: "api-call", name: "POST /users", line: 8, description: "Creates a new user", usedIn: ["routes.ts"] },
  ],
  issues: [
    { severity: "warning", message: "No token expiry validation in authenticate()", file: "auth/handler.ts", line: 12 },
    { severity: "error", message: "SQL injection risk: unparameterized query possible", file: "database.ts", line: 7 },
    { severity: "info", message: "deprecatedHelper() is never used — dead code", file: "utils/helpers.ts", line: 12 },
    { severity: "warning", message: "JWT_SECRET not validated on startup", file: "auth/handler.ts", line: 4 },
    { severity: "info", message: "Consider adding input validation for createUser", file: "api/controllers.ts", line: 8 },
  ],
  score: 72,
};
