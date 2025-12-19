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
  let markdown = fs.readFileSync(mdPath, 'utf-8');

  let updatedCount = 0;
  let skippedCount = 0;

  // Split markdown into sections by centre
  const sections = markdown.split(/\n\n---\n\n/);
  const updatedSections: string[] = [];

  for (const section of sections) {
    // Check if this is a centre section (contains ##)
    const centreMatch = section.match(/##\s+(.+)/);

    if (!centreMatch) {
      // Not a centre section, keep as is
      updatedSections.push(section);
      continue;
    }

    const sectionCentreName = centreMatch[1].trim();
    console.log(`Processing section: ${sectionCentreName}`);

    // Find matching scraped data
    const scrapedCentre = scrapedData.find(c => c.name === sectionCentreName);

    if (!scrapedCentre) {
      // No scraped data for this centre
      updatedSections.push(section);
      continue;
    }

    const scrapedContent = scrapedCentre.scrapedContent.trim();

    if (!scrapedContent || scrapedContent.length < 100) {
      console.log(`⚠️  Skipping ${sectionCentreName} - insufficient content (${scrapedContent.length} chars)`);
      skippedCount++;
      updatedSections.push(section);
      continue;
    }

    // Check if Website Content section already exists
    if (section.includes('### Website Content')) {
      console.log(`⊘ ${sectionCentreName} - already has Website Content section`);
      skippedCount++;
      updatedSections.push(section);
      continue;
    }

    // Add Website Content section at the end of this centre's section
    const updatedSection = `${section}\n\n### Website Content\n${sectionCentreName} Website Description: ${scrapedContent}`;
    updatedSections.push(updatedSection);

    console.log(`✓ Added website content to ${sectionCentreName} (${scrapedContent.length} chars)`);
    updatedCount++;
  }

  // Rejoin sections
  markdown = updatedSections.join('\n\n---\n\n');

  // Write updated knowledge base
  const backupPath = path.join(process.cwd(), 'data', 'knowledge-base-clean.backup.md');
  fs.writeFileSync(backupPath, fs.readFileSync(mdPath, 'utf-8'));
  console.log(`\n📝 Created backup at ${backupPath}`);

  fs.writeFileSync(mdPath, markdown);
  console.log(`✅ Updated knowledge base at ${mdPath}`);

  console.log('\n=== SUMMARY ===');
  console.log(`✓ Updated: ${updatedCount} centres`);
  console.log(`⊘ Skipped: ${skippedCount} centres`);
  console.log(`\nTotal scraped data added: ${scrapedData.reduce((sum, c) => sum + c.scrapedContent.length, 0).toLocaleString()} characters`);
}

mergeScrapedData();
