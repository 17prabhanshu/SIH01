import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.framework.upsert({
    where: { slug: 'langgraph' },
    update: {},
    create: {
      name: 'LangGraph',
      slug: 'langgraph',
      description: 'A library for building stateful, multi-actor applications with LLMs.',
      language: 'Python, JS',
      category: 'Orchestration',
      officialUrl: 'https://langchain-ai.github.io/langgraph/',
      githubUrl: 'https://github.com/langchain-ai/langgraph',
      status: 'PUBLISHED'
    }
  });

  await prisma.mCPServer.upsert({
    where: { slug: 'sqlite-mcp' },
    update: {},
    create: {
      name: 'SQLite Context Server',
      slug: 'sqlite-mcp',
      description: 'Official MCP server that enables agents to read schemas and query SQLite databases autonomously.',
      provider: 'Anthropic',
      category: 'Database',
      githubUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
      status: 'PUBLISHED'
    }
  });

  console.log("Seeded frameworks & MCPs!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
