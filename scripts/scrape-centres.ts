import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

interface CentreData {
  name: string;
  url: string;
  scrapedContent: string;
  scrapedAt: string;
}

// Extract centre name and URL from knowledge base
function extractCentreWebsites(): Map<string, string> {
  const mdPath = path.join(process.cwd(), 'data', 'knowledge-base-clean.md');
  const markdown = fs.readFileSync(mdPath, 'utf-8');

  const centreWebsites = new Map<string, string>();

  // Split by centre sections (## Centre Name)
  const sections = markdown.split(/\n## /);

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const lines = section.split('\n');
    const centreName = lines[0].trim();

    // Look for website URL anywhere in the section (within first 20 lines)
    for (let j = 0; j < Math.min(20, lines.length); j++) {
      const line = lines[j];
      const websiteMatch = line.match(/Website\s+(https?:\/\/[^\s,]+)/i);
      if (websiteMatch) {
        const url = websiteMatch[1].replace(/,$/, ''); // Remove trailing comma if present
        centreWebsites.set(centreName, url);
        break;
      }
    }
  }

  return centreWebsites;
}

// Scrape website content using WebFetch
async function scrapeWebsite(url: string): Promise<string> {
  try {
    console.log(`  Fetching: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, iframe, noscript').remove();

    // Extract main content
    let content = '';

    // Try to find main content area
    const mainSelectors = [
      'main',
      '[role="main"]',
      '.main-content',
      '#main-content',
      '.content',
      '#content',
      'article',
      '.entry-content',
    ];

    for (const selector of mainSelectors) {
      const mainContent = $(selector).first();
      if (mainContent.length > 0) {
        content = mainContent.text();
        break;
      }
    }

    // If no main content found, get body text
    if (!content) {
      content = $('body').text();
    }

    // Clean up text
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    // Extract key information sections
    const sections = {
      facilities: extractSection($, ['facilities', 'amenities', 'our facilities']),
      classes: extractSection($, ['classes', 'programs', 'group fitness', 'timetable']),
      membership: extractSection($, ['membership', 'join', 'pricing', 'fees']),
      pool: extractSection($, ['pool', 'aquatic', 'swimming']),
      gym: extractSection($, ['gym', 'fitness', 'equipment']),
      openingHours: extractSection($, ['opening hours', 'hours', 'open times']),
      contact: extractSection($, ['contact', 'location', 'address']),
    };

    // Combine sections with labels
    let structuredContent = '';
    for (const [key, value] of Object.entries(sections)) {
      if (value && value.length > 50) {
        structuredContent += `\n\n=== ${key.toUpperCase()} ===\n${value}`;
      }
    }

    return structuredContent || content.substring(0, 5000);

  } catch (error) {
    console.error(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return '';
  }
}

function extractSection($: cheerio.CheerioAPI, keywords: string[]): string {
  let content = '';

  // Search for headings containing keywords
  $('h1, h2, h3, h4, h5, h6').each((_, elem) => {
    const heading = $(elem).text().toLowerCase();

    for (const keyword of keywords) {
      if (heading.includes(keyword.toLowerCase())) {
        // Get content after this heading until next heading
        let nextContent = '';
        let current = $(elem).next();

        while (current.length > 0 && !current.is('h1, h2, h3, h4, h5, h6')) {
          nextContent += current.text() + ' ';
          current = current.next();
        }

        if (nextContent.length > content.length) {
          content = nextContent.trim();
        }
      }
    }
  });

  return content.replace(/\s+/g, ' ').substring(0, 2000);
}

async function scrapeAllCentres() {
  console.log('🔍 Extracting centre websites from knowledge base...\n');
  const centreWebsites = extractCentreWebsites();

  console.log(`Found ${centreWebsites.size} centres with websites\n`);

  const scrapedData: CentreData[] = [];
  const errors: string[] = [];

  let count = 0;
  for (const [name, url] of centreWebsites) {
    count++;
    console.log(`\n[${count}/${centreWebsites.size}] ${name}`);

    // Skip Bundaberg (coming soon)
    if (name.includes('coming soon')) {
      console.log('  Skipped: Coming soon');
      continue;
    }

    const content = await scrapeWebsite(url);

    if (content) {
      scrapedData.push({
        name,
        url,
        scrapedContent: content,
        scrapedAt: new Date().toISOString(),
      });
      console.log(`  ✓ Scraped ${content.length} characters`);
    } else {
      errors.push(`${name}: ${url}`);
      console.log('  ✗ Failed to scrape');
    }

    // Rate limiting - wait 1 second between requests
    if (count < centreWebsites.size) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Save scraped data to JSON
  const outputPath = path.join(process.cwd(), 'data', 'scraped-websites.json');
  fs.writeFileSync(outputPath, JSON.stringify(scrapedData, null, 2));

  console.log('\n\n=== SUMMARY ===');
  console.log(`✓ Successfully scraped: ${scrapedData.length} centres`);
  console.log(`✗ Failed to scrape: ${errors.length} centres`);
  console.log(`\nData saved to: ${outputPath}`);

  if (errors.length > 0) {
    console.log('\nFailed centres:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
}

scrapeAllCentres().catch(console.error);
