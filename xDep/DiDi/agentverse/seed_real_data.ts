import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding real data...");

  // 1. Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@tecrese.com' },
    update: { passwordHash },
    create: {
      email: 'admin@tecrese.com',
      passwordHash,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    }
  });
  console.log("- Created Admin (admin@tecrese.com / admin123)");

  // Ensure Base Categories & Author
  let author = await prisma.author.findUnique({ where: { slug: 'editor' }});
  if (!author) {
    author = await prisma.author.create({
      data: { name: 'Editorial Team', slug: 'editor', bio: 'The Agentverse Editors', expertise: 'AI' }
    });
  }
  
  let catAgents = await prisma.category.upsert({
    where: { slug: 'autonomous-agents' },
    update: {},
    create: { name: 'Autonomous Agents', slug: 'autonomous-agents', contentType: 'agents' }
  });

  // 2. Realistic Agents
  await prisma.agent.upsert({
    where: { slug: 'devin' },
    update: {},
    create: {
      name: 'Devin',
      slug: 'devin',
      description: 'The world’s first fully autonomous AI software engineer.',
      overview: 'Devin can plan and execute complex engineering tasks requiring thousands of decisions. It comes with its own shell, code editor, and browser within a sandboxed compute environment.',
      categoryId: catAgents.id,
      capabilities: JSON.stringify(['Code Generation', 'Debugging', 'Web Browsing', 'Terminal Access']),
      modelUsed: 'Custom Foundational',
      pricing: 'Enterprise',
      deployment: 'Cloud',
      openSource: false,
      browserUse: true,
      officialUrl: 'https://cognition.ai',
      logoUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=200&h=200&fit=crop',
      status: 'PUBLISHED',
      featured: true
    }
  });

  await prisma.agent.upsert({
    where: { slug: 'autogen' },
    update: {},
    create: {
      name: 'AutoGen',
      slug: 'autogen',
      description: 'A framework that enables the development of LLM applications using multiple agents that can converse with each other to solve tasks.',
      overview: 'Developed by Microsoft Research, AutoGen represents the cutting edge of multi-agent orchestration.',
      categoryId: catAgents.id,
      capabilities: JSON.stringify(['Multi-Agent Orchestration', 'Code Execution', 'Human-in-the-loop']),
      modelUsed: 'Agnostic',
      pricing: 'Free',
      deployment: 'Self-Hosted',
      openSource: true,
      browserUse: false,
      officialUrl: 'https://microsoft.github.io/autogen/',
      logoUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=200&h=200&fit=crop',
      status: 'PUBLISHED'
    }
  });

  // 3. Realistic Tools
  await prisma.tool.upsert({
    where: { slug: 'langchain' },
    update: {},
    create: {
      name: 'LangChain',
      slug: 'langchain',
      description: 'A framework for developing applications powered by language models.',
      overview: 'LangChain provides standard, extendable interfaces and external integrations for LLMs, along with end-to-end chains for common applications.',
      language: 'Python, TypeScript',
      framework: 'LangChain',
      openSource: true,
      cloudHosted: false,
      selfHosted: true,
      pricing: 'Free',
      officialUrl: 'https://langchain.com',
      logoUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&h=200&fit=crop',
      status: 'PUBLISHED'
    }
  });

  // 4. Realistic Models
  await prisma.model.upsert({
    where: { slug: 'claude-3-5-sonnet' },
    update: {},
    create: {
      name: 'Claude 3.5 Sonnet',
      slug: 'claude-3-5-sonnet',
      provider: 'Anthropic',
      family: 'Claude 3.5',
      modality: 'Multimodal',
      contextWindow: 200000,
      reasoning: true,
      toolCalling: true,
      structuredOutputs: true,
      vision: true,
      audio: false,
      coding: true,
      agentSuitability: 'Excellent for complex reasoning loops and coding tasks.',
      deploymentType: 'API / Cloud',
      pricingInput: '$3.00',
      pricingOutput: '$15.00',
      status: 'ACTIVE'
    }
  });

  // 5. Realistic Security Alerts
  await prisma.securityAlert.upsert({
    where: { slug: 'prompt-injection-cve-2024' },
    update: {},
    create: {
      title: 'Universal Prompt Injection via Malicious Code Repositories',
      slug: 'prompt-injection-cve-2024',
      severity: 'HIGH',
      affectedSystems: 'Autonomous Coding Agents',
      affectedVersions: 'All versions < 1.4',
      summary: 'A novel attack vector allows malicious actors to embed invisible prompt injection payloads inside public GitHub repositories that trigger remote code execution when analyzed by coding agents.',
      technicalDetails: 'The payload utilizes Unicode steganography to hide instructions from human reviewers while remaining highly visible to LLM tokenizers.',
      mitigation: 'Implement strict sandboxing (e.g., Docker) and deny network egress for agent-spawned subshells.',
      status: 'ACTIVE',
      publishedAt: new Date()
    }
  });

  // 6. Realistic Articles
  const catNews = await prisma.category.upsert({
    where: { slug: 'news' },
    update: {},
    create: { name: 'Industry News', slug: 'news', contentType: 'NEWS' }
  });

  await prisma.article.upsert({
    where: { slug: 'anthropic-computer-use' },
    update: {},
    create: {
      title: 'Anthropic Unveils Computer Use Capability for Claude',
      slug: 'anthropic-computer-use',
      excerpt: 'Claude 3.5 Sonnet can now autonomously control a mouse, click buttons, and type text to navigate standard graphical user interfaces.',
      body: 'In a massive leap forward for agentic AI, Anthropic has released a public beta of "Computer Use" for Claude 3.5 Sonnet. Instead of relying purely on REST APIs, the model is trained to interpret screenshots of a desktop environment, calculate pixel coordinates, and stream mouse/keyboard commands.\n\nThis bridges the gap between digital systems that lack APIs and the capabilities of autonomous agents.',
      status: 'PUBLISHED',
      contentType: 'NEWS',
      authorId: author.id,
      categoryId: catNews.id,
      readingTime: 4,
      featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2564&fit=crop',
      publishedAt: new Date()
    }
  });

  await prisma.article.upsert({
    where: { slug: 'future-of-mcp' },
    update: {},
    create: {
      title: 'Why the Model Context Protocol is the Future of AI Integration',
      slug: 'future-of-mcp',
      excerpt: 'Standardizing how agents read and write context to external systems is solving the fragmentation problem in AI development.',
      body: 'Currently, every AI framework writes custom connectors for databases, APIs, and file systems. The Model Context Protocol (MCP) aims to end this by providing a universal standard. \n\nWith MCP, you can spin up a SQLite server and any MCP-compatible agent instantly knows how to read its schema and execute queries. The adoption curve is steep, but the payoff for the ecosystem is immense.',
      status: 'PUBLISHED',
      contentType: 'NEWS',
      authorId: author.id,
      categoryId: catNews.id,
      readingTime: 6,
      featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2564&fit=crop',
      publishedAt: new Date()
    }
  });

  console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
