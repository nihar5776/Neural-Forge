const axios = require("axios");

async function fetchJobPostings(jobRole) {
  const jobs = [];
  let linkedinFailed = false;
  let shineFailed = false;

  // 1. Try to fetch from LinkedIn public guest jobs endpoint
  try {
    const encodedRole = encodeURIComponent(jobRole);
    const linkedinUrl = `https://www.linkedin.com/jobs/search?keywords=${encodedRole}`;
    
    const response = await axios.get(linkedinUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      timeout: 5000
    });

    const html = response.data;
    // Simple regex parsing of LinkedIn guest jobs list items
    const jobRegex = /<h3 class="base-search-card__title">([\s\S]*?)<\/h3>/g;
    const companyRegex = /<h4 class="base-search-card__subtitle">([\s\S]*?)<\/h4>/g;
    const linkRegex = /<a class="base-card__full-link[^"]*" href="([^"]*)"/g;
    const locationRegex = /<span class="job-search-card__location">([\s\S]*?)<\/span>/g;

    let match;
    const titles = [];
    const companies = [];
    const links = [];
    const locations = [];

    while ((match = jobRegex.exec(html)) !== null) {
      titles.push(match[1].trim());
    }
    while ((match = companyRegex.exec(html)) !== null) {
      companies.push(match[1].replace(/<[^>]*>/g, "").trim());
    }
    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1].trim());
    }
    while ((match = locationRegex.exec(html)) !== null) {
      locations.push(match[1].trim());
    }

    for (let i = 0; i < titles.length; i++) {
      jobs.push({
        title: titles[i],
        company: companies[i] || "LinkedIn Recruiter",
        location: locations[i] || "Remote / India",
        link: links[i] || "https://www.linkedin.com/jobs",
        platform: "LinkedIn"
      });
    }
  } catch (err) {
    console.error("LinkedIn Guest Scraper failed:", err.message);
    linkedinFailed = true;
  }

  // 2. Try to fetch from Shine search
  try {
    const slug = jobRole.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const shineUrl = `https://www.shine.com/job-search/${slug}-jobs`;
    const response = await axios.get(shineUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      },
      timeout: 10000
    });

    const html = response.data;
    const nextDataRegex = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/;
    const match = nextDataRegex.exec(html);
    if (match) {
      const jsonData = JSON.parse(match[1]);
      const listings = jsonData.props?.pageProps?.initialState?.jsrp?.searchresult?.data?.results || [];
      
      for (let i = 0; i < listings.length; i++) {
        const item = listings[i];
        const title = item.jJT || "Job Opportunity";
        const company = item.jCName || "Shine Partner";
        const locations = Array.isArray(item.jLoc) ? item.jLoc.join(', ') : (item.jLoc || "India");
        const link = item.jSlug ? `https://www.shine.com/jobs/${item.jSlug}` : "https://www.shine.com";
        
        jobs.push({
          title: title,
          company: company,
          location: locations,
          link: link,
          platform: "Shine"
        });
      }
    }
  } catch (err) {
    console.error("Shine opportunity fetch failed:", err.message);
    shineFailed = true;
  }

  // If both APIs failed due to connectivity, throw an error
  if (linkedinFailed && shineFailed) {
    throw new Error("Job search failed due to network connectivity issues.");
  }

  return jobs;
}

module.exports = {
  fetchJobPostings
};
