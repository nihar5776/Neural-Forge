const axios = require('axios');

async function testAdzuna() {
  try {
    const jobRole = 'React Developer';
    const encodedRole = encodeURIComponent(jobRole);
    // Adzuna India guest search
    const url = `https://www.adzuna.in/search?q=${encodedRole}`;
    
    console.log('Fetching Adzuna URL:', url);
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      },
      timeout: 10000
    });

    console.log('Status Code:', response.status);
    const html = response.data;
    console.log('HTML Length:', html.length);
    
    // Check if we can find job items in HTML
    // Usually Adzuna lists jobs in divs with data-id or class containing "ui-item" or similar
    const jobCardRegex = /<div class="[A-Za-z0-9_-]*\s*ui-item\s*[A-Za-z0-9_-]*"[^>]*>([\s\S]*?)<\/div>/g;
    
    // Let's print out snippets of HTML to find job titles
    // Adzuna title structure is usually: <a href="[url]">...[Title]...</a> or h2 or class containing item__title
    const titleRegex = /<a[^>]*class="[A-Za-z0-9_-]*\s*item__title\s*[A-Za-z0-9_-]*"[^>]*>([\s\S]*?)<\/a>/g;
    
    let match;
    let count = 0;
    while ((match = titleRegex.exec(html)) !== null && count < 10) {
      console.log(`Found Title Match ${++count}:`, match[1].replace(/<[^>]*>/g, "").trim());
    }

    if (count === 0) {
      // Let's do a broad search for h2 or h3 containing titles
      const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/g;
      while ((match = h2Regex.exec(html)) !== null && count < 10) {
        console.log(`Found H2 Match ${++count}:`, match[1].replace(/<[^>]*>/g, "").trim());
      }
    }
  } catch (err) {
    console.error('Adzuna Fetch Error:', err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
    }
  }
}

testAdzuna();
