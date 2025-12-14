import * as fs from 'fs';
import * as path from 'path';

interface CentreData {
  name: string;
  sections: Map<string, string>;
}

function parseTailoredDocument(content: string): CentreData[] {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  const centres = new Map<string, CentreData>();

  let currentCentreName = '';
  let currentSectionName = '';
  let currentContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect page markers like "Ascot Vale Page 1"
    const pageMatch = line.match(/^(.+?)\s+Page\s+\d+$/);
    if (pageMatch) {
      // Save previous section
      if (currentCentreName && currentSectionName && currentContent.length > 0) {
        const centre = centres.get(currentCentreName) || {
          name: currentCentreName,
          sections: new Map()
        };
        const existingContent = centre.sections.get(currentSectionName) || '';
        centre.sections.set(currentSectionName, existingContent + ' ' + currentContent.join(' '));
        centres.set(currentCentreName, centre);
        currentContent = [];
      }

      currentCentreName = pageMatch[1].replace(/�/g, '').trim();
      currentSectionName = '';
      continue;
    }

    // Skip if no centre context
    if (!currentCentreName) continue;

    // Check if this looks like a section header (appears twice in a row or is a known section)
    const nextLine = lines[i + 1];
    const knownSections = [
      'Opening Hours', 'Contacts & Staff', 'Contact', 'Casual Entry', 'Memberships',
      'Group Fitness', 'Childcare', 'Café', 'Cafe', 'Aquatic Programs',
      'GOswim', 'Concessions', 'Personal Training', 'Exercise Physiology',
      'Valid Concessions', 'Fitness Passport', 'Promotions', 'Squad',
      'Casual Entry & Visit Passes', 'Contact Information', 'Location',
      'Accessibility', 'General Information', 'Facilities', 'Suspensions',
      'Cancellations', 'Prices', 'Squads'
    ];

    const isHeaderByDupe = line === nextLine;
    const isKnownSection = knownSections.some(sec =>
      line.toLowerCase() === sec.toLowerCase() ||
      line.toLowerCase().startsWith(sec.toLowerCase())
    );

    if (isHeaderByDupe || isKnownSection) {
      // Save previous section
      if (currentSectionName && currentContent.length > 0) {
        const centre = centres.get(currentCentreName) || {
          name: currentCentreName,
          sections: new Map()
        };
        const existingContent = centre.sections.get(currentSectionName) || '';
        centre.sections.set(currentSectionName, existingContent + ' ' + currentContent.join(' '));
        centres.set(currentCentreName, centre);
        currentContent = [];
      }

      currentSectionName = line;

      // Skip duplicate if it exists
      if (isHeaderByDupe) {
        i++;
      }
      continue;
    }

    // Add content to current section
    if (currentSectionName) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentCentreName && currentSectionName && currentContent.length > 0) {
    const centre = centres.get(currentCentreName) || {
      name: currentCentreName,
      sections: new Map()
    };
    const existingContent = centre.sections.get(currentSectionName) || '';
    centre.sections.set(currentSectionName, existingContent + ' ' + currentContent.join(' '));
    centres.set(currentCentreName, centre);
  }

  return Array.from(centres.values());
}

function generateMarkdown(centres: CentreData[]): string {
  let markdown = '# Leisure Centre Knowledge Base\n\n';

  for (const centre of centres) {
    markdown += `## ${centre.name}\n\n`;

    for (const [sectionName, content] of centre.sections) {
      if (!content.trim()) continue;

      markdown += `### ${sectionName}\n`;
      markdown += `${centre.name} ${sectionName}: ${content.trim()}\n\n`;
    }

    markdown += '---\n\n';
  }

  return markdown;
}

async function convertTailoredToMarkdown() {
  console.log('Reading Tailored Centres document...');

  const inputPath = 'C:\\Users\\Paulz\\Desktop\\1-KL\\Tailored_Centres_txt.txt';
  const outputPath = path.join(process.cwd(), 'data', 'knowledge-base-from-tailored.md');

  const content = fs.readFileSync(inputPath, 'utf-8');

  console.log('Parsing document structure...');
  const centres = parseTailoredDocument(content);

  console.log(`\nFound ${centres.length} centres:`);
  centres.forEach((centre, idx) => {
    console.log(`${idx + 1}. ${centre.name} (${centre.sections.size} sections)`);
  });

  console.log('\nGenerating markdown...');
  const markdown = generateMarkdown(centres);

  console.log('Writing markdown file...');
  fs.writeFileSync(outputPath, markdown, 'utf-8');

  console.log(`\n✓ Conversion complete!`);
  console.log(`Output saved to: ${outputPath}`);
}

convertTailoredToMarkdown();
