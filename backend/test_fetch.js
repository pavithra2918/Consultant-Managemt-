const fs = require('fs');

async function run() {
  const formData = new FormData();
  
  // Read the binary buffer
  const buffer = fs.readFileSync('dummy_resume.txt');
  const blob = new Blob([buffer], { type: 'text/plain' });
  
  formData.append('resume', blob, 'resume.txt');

  try {
    const res = await fetch('http://127.0.0.1:3000/api/resume/analyze', {
      method: 'POST',
      body: formData
    });
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", await res.text());
  } catch (err) {
    console.error("NETWORK ERROR:", err);
  }
}

run();
