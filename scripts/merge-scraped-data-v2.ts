import * as fs from 'fs';
import * as path from 'path';

interface ScrapedData {
  name: string;
  url: string;
  scrapedContent: string;
  scrapedAt: string;
}

function mergeScrapedData() {
  console.log('📖 Reading scraped website data...');
  const scrapedPath = path.join(process.cwd(), 'data', 'scraped-websites.json');
  const scrapedData: ScrapedData[] = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));

  console.log(`Found ${scrapedData.length} scraped centres\n`);

  console.log('📄 Reading knowledge base...');
  const mdPath = path.join(process.cwd(), 'data', 'knowledge-base-clean.md');
  const markdown = fs.readFileSync(mdPath, 'utf-8');

  let updatedCount = 0;
  let skippedCount = 0;

  // Create backup first
  const backupPath = path.join(process.cwd(), 'data', 'knowledge-base-clean.backup.md');
  fs.writeFileSync(backupPath, markdown);
  console.log(`📝 Created backup at ${backupPath}\n`);

  // Process each centre's scraped data
  let updatedMarkdown = markdown;

  for (const centre of scrapedData) {
    const centreName = centre.name;
    const scrapedContent = centre.scrapedContent.trim();

    if (!scrapedContent || scrapedContent.length < 100) {
      console.log(`⚠️  Skipping ${centreName} - insufficient content (${scrapedContent.length} chars)`);
      skippedCount++;
      continue;
    }

    // Find the section for this centre using a more robust pattern
    // Match from ## CentreName to the next --- separator (or end of file)
    const escapedName = centreName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sectionRegex = new RegExp(
      `(##\\s+${escapedName}\\s*\\n[\\s\\S]*?)(\\n\\n---\\n|$)`,
      ''
    );

    const match = sectionRegex.exec(updatedMarkdown);

    if (!match) {
      console.log(`✗ Could not find section for ${centreName}`);
      skippedCount++;
      continue;
    }

    const centreSection = match[1];
    const separator = match[2];

    // Check if Website Content section already exists
    if (centreSection.includes('### Website Content')) {
      console.log(`⊘ ${centreName} - already has Website Content section`);
      skippedCount++;
      continue;
    }

    // Add Website Content section at the end of this centre's section
    const newSection = `${centreSection}\n\n### Website Content\n${centreName} Website Description: ${scrapedContent}${separator}`;

    updatedMarkdown = updatedMarkdown.replace(sectionRegex, newSection);
    console.log(`✓ Added website content to ${centreName} (${scrapedContent.length} chars)`);
    updatedCount++;
  }

  // Write updated knowledge base
  fs.writeFileSync(mdPath, updatedMarkdown);
  console.log(`\n✅ Updated knowledge base at ${mdPath}`);

  console.log('\n=== SUMMARY ===');
  console.log(`✓ Updated: ${updatedCount} centres`);
  console.log(`⊘ Skipped: ${skippedCount} centres`);
  console.log(`\nTotal scraped data added: ${scrapedData.reduce((sum, c) => sum + c.scrapedContent.length, 0).toLocaleString()} characters`);
}

mergeScrapedData();
