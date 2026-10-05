const fs = require('fs');

async function testUpload() {
  try {
    const formData = new FormData();
    formData.append('file', new Blob(['test file content'], { type: 'text/plain' }), 'test.txt');

    const res = await fetch('http://localhost:3001/api/admin/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Without cookie it will fail auth, but we can see WHAT it fails with
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
