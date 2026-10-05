const fs = require('fs');

async function testUpload() {
  try {
    const formData = new FormData();
    formData.append('file', new Blob(['test file content'], { type: 'text/plain' }), 'test.txt');

    const res = await fetch('http://localhost:3001/api/admin/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': 'agentverse_session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXU0MmM5N3gwMDAwNmpiejVsMDUxMmN4Iiwicm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzg5NzI2Njc2LCJleHAiOjE3ODk3Mjg0NzZ9.vj92ZcRMsUxRsX-S9wgxcPTVAwmzzt4b1BCS2TGj8f4'
      }
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.log("Network error:", err.message);
  }
}
testUpload();
