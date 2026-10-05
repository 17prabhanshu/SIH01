async function testCrud() {
  const res = await fetch('http://localhost:3001/api/admin/crud?action=schema&model=article', {
    headers: {
      'Cookie': 'agentverse_session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXU0MmM5N3gwMDAwNmpiejVsMDUxMmN4Iiwicm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzg5NzI2Njc2LCJleHAiOjE3ODk3Mjg0NzZ9.vj92ZcRMsUxRsX-S9wgxcPTVAwmzzt4b1BCS2TGj8f4'
    }
  });
  console.log("CRUD Status:", res.status);
  console.log("CRUD Response:", await res.text());
}
testCrud();
