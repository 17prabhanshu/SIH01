const fs = require('fs');
const path = require('path');

const routes = [
  { slug: 'categories', model: 'category' },
  { slug: 'tags', model: 'tag' },
  { slug: 'agents', model: 'agent' },
  { slug: 'tools', model: 'tool' },
  { slug: 'models', model: 'model' },
  { slug: 'frameworks', model: 'framework' },
  { slug: 'mcp', model: 'mCPServer' },
  { slug: 'security', model: 'securityAlert' },
  { slug: 'glossary', model: 'glossaryTerm' },
  { slug: 'contributors', model: 'contributorProfile' },
  { slug: 'authors', model: 'author' },
  { slug: 'media', model: 'mediaAsset' },
  { slug: 'redirects', model: 'redirect' },
  { slug: 'links', model: 'internalLink' },
  { slug: 'users', model: 'user' },
  { slug: 'audit', model: 'auditLog' }
];

routes.forEach(r => {
  const file = path.join(__dirname, 'src', 'app', 'admin', r.slug, 'page.tsx');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      'createUrl={`/admin/${r.slug}/new`}',
      `createUrl="/admin/${r.slug}/new"\n      modelName="${r.model}"\n      entitySlug="${r.slug}"`
    );
    // Since I hardcoded createUrl="/admin/xxx/new" in the generator:
    content = content.replace(
      `createUrl="/admin/${r.slug}/new"`,
      `createUrl="/admin/${r.slug}/new"\n      modelName="${r.model}"\n      entitySlug="${r.slug}"`
    );
    fs.writeFileSync(file, content);
    console.log(`Fixed ${r.slug}`);
  }
});
