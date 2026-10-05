const fs = require('fs');
const path = require('path');

const root = '/Users/prabhanshushekhar/Downloads/xSIH101/xDep/DiDi/agentverse';

const files = {
  'src/app/admin/login/page.tsx': `
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const data = loginSchema.parse({ email, password });
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Login failed");
      }
      
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Agentverse Admin</h1>
        {error && <div className="mb-4 text-red-500 text-sm p-3 bg-red-100 rounded">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
`,
  'src/app/admin/page.tsx': `
import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboardPage() {
  let stats = { articles: 0, agents: 0, tools: 0, models: 0 };
  
  try {
    stats.articles = await db.article.count();
    stats.agents = await db.agent.count();
    stats.tools = await db.tool.count();
    stats.models = await db.model.count();
  } catch (err) {
    console.error("Failed to fetch stats", err);
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400">Total Articles</h3>
          <p className="text-3xl font-bold">{stats.articles}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400">Total Agents</h3>
          <p className="text-3xl font-bold">{stats.agents}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400">Total Tools</h3>
          <p className="text-3xl font-bold">{stats.tools}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400">Total Models</h3>
          <p className="text-3xl font-bold">{stats.models}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <Link href="/admin/articles/new" className="px-4 py-2 bg-blue-600 text-white rounded">New Article</Link>
        <Link href="/admin/agents/new" className="px-4 py-2 bg-green-600 text-white rounded">New Agent</Link>
        <Link href="/admin/tools/new" className="px-4 py-2 bg-purple-600 text-white rounded">New Tool</Link>
      </div>
    </div>
  );
}
`,
  'src/app/admin/articles/page.tsx': `
import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminArticlesPage() {
  let articles: any[] = [];
  try {
    articles = await db.article.findMany({ orderBy: { createdAt: 'desc' } });
  } catch(e) {}

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link href="/admin/articles/new" className="px-4 py-2 bg-blue-600 text-white rounded">New Article</Link>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {articles.map((article: any) => (
              <tr key={article.id}>
                <td className="px-6 py-4 whitespace-nowrap">{article.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{article.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={\`/admin/articles/\${article.id}/edit\`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-4 text-center">No articles found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`,
  'src/app/admin/articles/new/page.tsx': `
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, status: "DRAFT" })
      });
      if(res.ok) {
        router.push("/admin/articles");
      }
    } catch(e) {}
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">New Article</h1>
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-800" />
          <textarea placeholder="Content..." value={content} onChange={e => setContent(e.target.value)} rows={15} className="w-full p-2 border rounded dark:bg-gray-800" />
        </div>
        <div className="w-80 space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 shadow rounded">
            <h3 className="font-semibold mb-4">Publishing</h3>
            <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded">Save Draft</button>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
  'src/app/api/auth/login/route.ts': `
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { setSession } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);
    
    const user = await db.user.findUnique({ where: { email } });
    // In real app: await bcrypt.compare(password, user.passwordHash)
    if (!user || password !== "password") { // Stub validation
      return NextResponse.json({ success: false, error: { message: "Invalid credentials" } }, { status: 401 });
    }
    
    await setSession({ userId: user.id, role: user.role });
    return NextResponse.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
  }
}
`,
  'src/app/api/auth/logout/route.ts': `
import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}
`,
  'src/app/api/admin/articles/route.ts': `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const articles = await db.article.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: articles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const article = await db.article.create({
      data: {
        title: body.title,
        slug,
        content: body.content,
        status: body.status || "DRAFT",
        authorId: "1" // Stub
      }
    });
    return NextResponse.json({ success: true, data: article });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
  }
}
`
};

for (const [file, content] of Object.entries(files)) {
  const fullPath = path.join(root, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\\n');
  console.log('Created:', file);
}
