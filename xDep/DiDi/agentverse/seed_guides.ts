import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Ensure category exists
  let category = await prisma.category.findUnique({ where: { slug: 'guides' }});
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Guides',
        slug: 'guides',
        description: 'Comprehensive tutorials and guides.',
        contentType: 'GUIDE'
      }
    });
  }

  // Ensure author exists
  let author = await prisma.author.findUnique({ where: { slug: 'editor' }});
  if (!author) {
    author = await prisma.author.create({
      data: {
        name: 'Editorial Team',
        slug: 'editor',
        bio: 'The official Agentverse editorial team.',
        expertise: 'AI Systems'
      }
    });
  }

  const guides = [
    {
      title: "Building your first AI Agent",
      slug: "building-your-first-ai-agent",
      excerpt: "A step-by-step tutorial to constructing a basic reasoning loop with LangChain.",
      body: "# Introduction\n\nWelcome to the first step in your agentic journey! In this guide, we will explore how to build a basic AI agent capable of autonomous reasoning.\n\n## What is an AI Agent?\n\nUnlike traditional scripts, an AI agent uses an LLM (Large Language Model) as its core reasoning engine. It can:\n- **Perceive** its environment through inputs and APIs.\n- **Reason** about the best course of action (often using techniques like ReAct or Chain of Thought).\n- **Act** by executing tools or making API calls.\n\n## Step 1: Setting up LangChain\n\nFirst, you will need to install LangChain and a foundation model provider like OpenAI.\n\n```bash\nnpm install @langchain/core @langchain/openai\n```\n\n## Step 2: The ReAct Loop\n\nThe fundamental loop of an agent is **Reason -> Act -> Observe**. The agent thinks about what to do, takes an action, observes the result, and repeats until the goal is met.\n\nStay tuned for part 2 where we connect this to an MCP server!",
      status: "PUBLISHED",
      contentType: "GUIDE",
      featuredImage: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2564&auto=format&fit=crop"
    },
    {
      title: "Mastering MCP Servers",
      slug: "mastering-mcp-servers",
      excerpt: "Connect your autonomous agents to real-world databases and APIs.",
      body: "# The Model Context Protocol\n\nMCP is a standard protocol for providing context to LLMs and agents. Think of it as a universal plug-and-play system for AI capabilities.\n\n## Why MCP?\n\nBefore MCP, developers had to write custom tool-calling logic for every single API they wanted their agent to interact with. With MCP, you simply point your agent at an MCP Server (like a local SQLite database or a GitHub repo), and the agent instantly understands how to query and manipulate it.\n\n## Example: SQLite MCP\n\nIf you run the official SQLite MCP server, your agent can automatically:\n- Read your database schema\n- Formulate SQL queries to answer user questions\n- Execute the queries and format the results\n\n## Security Considerations\n\nAlways ensure your MCP servers run with the principle of least privilege. Never give an autonomous agent write access to a production database unless you have a human-in-the-loop review system.",
      status: "PUBLISHED",
      contentType: "GUIDE",
      featuredImage: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2564&auto=format&fit=crop"
    }
  ];

  for (const guide of guides) {
    await prisma.article.upsert({
      where: { slug: guide.slug },
      update: {},
      create: {
        ...guide,
        authorId: author.id,
        categoryId: category.id,
        readingTime: 5,
        publishedAt: new Date()
      }
    });
  }
  console.log('Seeded guides');
}

main().catch(console.error).finally(() => prisma.$disconnect());
