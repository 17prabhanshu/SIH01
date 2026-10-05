const BASE = 'http://localhost:3000';
let pass = 0, fail = 0;

function log(ok: boolean, name: string, detail?: string) {
  if (ok) { pass++; console.log(`  ✅ [PASS] ${name}`); }
  else { fail++; console.log(`  ❌ [FAIL] ${name} — ${detail}`); }
}

async function main() {
  console.log('\n🔑 AUTH TESTS');
  // 1. Valid Login
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@tecrese.com', password: 'change-this-password' }),
    redirect: 'manual',
  });
  const loginJson = await loginRes.json().catch(() => ({}));
  const cookie = loginRes.headers.get('set-cookie') || '';
  log(loginRes.status === 200 && loginJson.success === true, 'Valid Login', `status=${loginRes.status} body=${JSON.stringify(loginJson)}`);
  log(cookie.includes('agentverse_session'), 'Session Cookie Set', `cookie=${cookie.substring(0,60)}`);

  // 2. Wrong Password
  const badRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@tecrese.com', password: 'wrong' }),
  });
  log(badRes.status === 401, 'Wrong Password returns 401', `status=${badRes.status}`);

  // 3. Invalid email format
  const invalidRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'notanemail', password: 'test' }),
  });
  log(invalidRes.status === 400, 'Invalid email returns 400', `status=${invalidRes.status}`);

  console.log('\n📝 CRUD TESTS (with auth)');
  // 4. Get Schema
  const schemaRes = await fetch(`${BASE}/api/admin/crud?model=article&action=schema`, { headers: { Cookie: cookie } });
  log(schemaRes.status === 200, 'Get Article Schema', `status=${schemaRes.status}`);

  // 5. Create Article (should auto-fill slug, authorId, status)
  const createRes = await fetch(`${BASE}/api/admin/crud`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ model: 'article', data: { title: 'QA Test Article', body: 'Test body content' } }),
  });
  const createJson = await createRes.json().catch(() => ({}));
  log(createRes.status === 200 && createJson.success, 'Create Article (auto slug/author/status)', `status=${createRes.status} error=${createJson.error}`);
  const articleId = createJson.data?.id;

  // 6. Update Article  
  if (articleId) {
    const updateRes = await fetch(`${BASE}/api/admin/crud`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ model: 'article', id: articleId, data: { title: 'Updated QA Test' } }),
    });
    const updateJson = await updateRes.json().catch(() => ({}));
    log(updateRes.status === 200 && updateJson.success, 'Update Article', `status=${updateRes.status}`);

    // 7. Delete Article
    const deleteRes = await fetch(`${BASE}/api/admin/crud?model=article&id=${articleId}`, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    });
    log(deleteRes.status === 200, 'Delete Article', `status=${deleteRes.status}`);
  }

  // 8. Create Agent, Tool, Model (auto-fill tests)
  for (const [model, data] of [
    ['agent', { name: 'QA Test Agent', description: 'test' }],
    ['tool', { name: 'QA Test Tool', description: 'test' }],
    ['glossaryTerm', { term: 'QA Term', definition: 'test' }],
  ] as [string, any][]) {
    const r = await fetch(`${BASE}/api/admin/crud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ model, data }),
    });
    const j = await r.json().catch(() => ({}));
    log(r.status === 200 && j.success, `Create ${model}`, `status=${r.status} error=${j.error}`);
    if (j.data?.id) {
      await fetch(`${BASE}/api/admin/crud?model=${model}&id=${j.data.id}`, { method: 'DELETE', headers: { Cookie: cookie } });
    }
  }

  console.log('\n📰 NEWSLETTER TESTS');
  const nlRes = await fetch(`${BASE}/api/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'qatest@example.com' }),
  });
  const nlJson = await nlRes.json().catch(() => ({}));
  log(nlRes.status === 200 && nlJson.success, 'Newsletter Subscribe', `status=${nlRes.status} body=${JSON.stringify(nlJson)}`);

  // Duplicate
  const nlDup = await fetch(`${BASE}/api/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'qatest@example.com' }),
  });
  log(nlDup.status === 200, 'Newsletter Duplicate (upsert)', `status=${nlDup.status}`);

  // Invalid
  const nlBad = await fetch(`${BASE}/api/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'notanemail' }),
  });
  log(nlBad.status === 400, 'Newsletter Invalid Email', `status=${nlBad.status}`);

  console.log('\n💬 CONTACT TESTS');
  const ctRes = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'QA', email: 'qa@example.com', subject: 'Test', message: 'Hello' }),
  });
  const ctJson = await ctRes.json().catch(() => ({}));
  log(ctRes.status === 200 && ctJson.success, 'Contact Submit', `status=${ctRes.status}`);

  const ctBad = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'QA' }),
  });
  log(ctBad.status === 400, 'Contact Missing Fields', `status=${ctBad.status}`);

  console.log('\n🔍 SEARCH TESTS');
  const srRes = await fetch(`${BASE}/api/search?q=test`);
  log(srRes.status === 200, 'Search valid query', `status=${srRes.status}`);
  const srShort = await fetch(`${BASE}/api/search?q=a`);
  const srShortJson = await srShort.json();
  log(Array.isArray(srShortJson) && srShortJson.length === 0, 'Search too short', `length=${srShortJson.length}`);

  console.log('\n📄 UPLOAD TESTS');
  // Create a tiny valid PNG
  const pngHeader = Buffer.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,2,0,0,0,144,119,83,222,0,0,0,12,73,68,65,84,8,215,99,248,207,192,0,0,0,2,0,1,226,33,188,51,0,0,0,0,73,69,78,68,174,66,96,130]);
  const formData = new FormData();
  formData.append('file', new Blob([pngHeader], { type: 'image/png' }), 'test.png');
  const upRes = await fetch(`${BASE}/api/admin/upload`, { method: 'POST', headers: { Cookie: cookie }, body: formData });
  const upJson = await upRes.json().catch(() => ({}));
  log(upRes.status === 200 && upJson.success, 'Upload Valid PNG', `status=${upRes.status} url=${upJson.url}`);

  // Upload invalid .txt
  const badForm = new FormData();
  badForm.append('file', new Blob(['hello'], { type: 'text/plain' }), 'bad.txt');
  const upBad = await fetch(`${BASE}/api/admin/upload`, { method: 'POST', headers: { Cookie: cookie }, body: badForm });
  log(upBad.status === 400, 'Reject .txt Upload', `status=${upBad.status}`);

  console.log('\n🌐 PUBLIC PAGES');
  for (const path of ['/', '/agents', '/tools', '/models', '/news', '/guides', '/security', '/about', '/about/editorial-policy', '/contact', '/privacy', '/terms', '/search', '/robots.txt', '/sitemap.xml']) {
    const r = await fetch(`${BASE}${path}`, { redirect: 'manual' });
    log(r.status === 200, `GET ${path}`, `status=${r.status}`);
  }

  console.log('\n🔒 ADMIN PAGES (should redirect without auth)');
  for (const path of ['/admin', '/admin/articles', '/admin/agents']) {
    const r = await fetch(`${BASE}${path}`, { redirect: 'manual' });
    log(r.status >= 300 && r.status < 400, `${path} redirects`, `status=${r.status}`);
  }

  // Cleanup
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.newsletterSubscriber.deleteMany({ where: { email: 'qatest@example.com' } });
  await prisma.contactMessage.deleteMany({ where: { email: 'qa@example.com' } });
  await prisma.$disconnect();

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  TOTAL: ${pass + fail} | ✅ PASS: ${pass} | ❌ FAIL: ${fail}`);
  console.log(`${'═'.repeat(50)}\n`);
}

main().catch(e => { console.error('TEST CRASHED:', e); process.exit(1); });
