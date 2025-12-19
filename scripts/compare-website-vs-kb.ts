import * as fs from 'fs';
import * as path from 'path';

interface ScrapedData {
  name: string;
  url: string;
  scrapedContent: string;
  scrapedAt: string;
}

function compareWebsiteVsKnowledgeBase() {
  console.log('📖 Reading scraped website data...');
  const scrapedPath = path.join(process.cwd(), 'data', 'scraped-websites.json');
  const scrapedData: ScrapedData[] = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));

  console.log('📄 Reading knowledge base...');
  const mdPath = path.join(process.cwd(), 'data', 'knowledge-base-clean.md');
  const markdown = fs.readFileSync(mdPath, 'utf-8');

  // Split knowledge base by centre
  const kbSections = markdown.split(/\n## /);
  const kbMap = new Map<string, string>();

  for (let i = 1; i < kbSections.length; i++) {
    const section = kbSections[i];
    const lines = section.split('\n');
    const centreName = lines[0].trim();
    kbMap.set(centreName, section.toLowerCase());
  }

  let reportMd = '# Website Content vs Knowledge Base Comparison\n\n';
  reportMd += `Generated: ${new Date().toISOString()}\n\n`;
  reportMd += `This report shows additional information found on each centre's website that is NOT in the internal knowledge base.\n\n`;
  reportMd += `---\n\n`;

  let totalCentres = 0;
  let centresWithUniqueInfo = 0;

  for (const centre of scrapedData) {
    const centreName = centre.name;
    const scrapedContent = centre.scrapedContent.toLowerCase();
    const kbContent = kbMap.get(centreName) || '';

    totalCentres++;

    // Extract unique information keywords/phrases from website
    const uniqueInfo: string[] = [];

    // Check for specific features/amenities mentioned on website but not in KB
    const websiteFeatures = [
      { term: 'splash pad', label: 'Splash Pad' },
      { term: 'dive pool', label: 'Dive Pool' },
      { term: 'diving board', label: 'Diving Boards' },
      { term: 'water slide', label: 'Water Slide' },
      { term: 'lazy river', label: 'Lazy River' },
      { term: 'beach entry', label: 'Beach-style Entry' },
      { term: 'mushroom pool', label: 'Mushroom Pool' },
      { term: 'hydrotherapy', label: 'Hydrotherapy Pool' },
      { term: 'warm water pool', label: 'Warm Water Pool' },
      { term: 'grandstand', label: 'Grandstand Seating' },
      { term: 'cafe', label: 'Café' },
      { term: 'kiosk', label: 'Kiosk' },
      { term: 'bbq', label: 'BBQ Facilities' },
      { term: 'picnic', label: 'Picnic Area' },
      { term: 'tennis court', label: 'Tennis Courts' },
      { term: 'squash court', label: 'Squash Courts' },
      { term: 'basketball court', label: 'Basketball Courts' },
      { term: 'beach volleyball', label: 'Beach Volleyball' },
      { term: 'pickleball', label: 'Pickleball' },
      { term: 'indoor sports hall', label: 'Indoor Sports Hall' },
      { term: 'multi-purpose room', label: 'Multi-Purpose Rooms' },
      { term: 'meeting room', label: 'Meeting Rooms' },
      { term: 'function room', label: 'Function Rooms' },
      { term: 'parking', label: 'Parking Facilities' },
      { term: 'accessibility', label: 'Accessibility Features' },
      { term: 'wheelchair', label: 'Wheelchair Access' },
      { term: 'hoist', label: 'Pool Hoist' },
      { term: 'ramp access', label: 'Ramp Access' },
      { term: '50m pool', label: '50m Pool' },
      { term: '50-metre pool', label: '50m Pool' },
      { term: '25m pool', label: '25m Pool' },
      { term: '25-metre pool', label: '25m Pool' },
      { term: 'olympic pool', label: 'Olympic Pool' },
      { term: 'toddler pool', label: 'Toddler Pool' },
      { term: 'leisure pool', label: 'Leisure Pool' },
      { term: 'spa', label: 'Spa' },
      { term: 'sauna', label: 'Sauna' },
      { term: 'steam room', label: 'Steam Room' },
      { term: 'functional training', label: 'Functional Training Area' },
      { term: 'cardio equipment', label: 'Cardio Equipment' },
      { term: 'free weights', label: 'Free Weights' },
      { term: 'resistance machines', label: 'Resistance Machines' },
      { term: 'reformer pilates', label: 'Reformer Pilates' },
      { term: 'exercise physiology', label: 'Exercise Physiology' },
      { term: 'personal training', label: 'Personal Training' },
      { term: '24 hour', label: '24-Hour Access' },
      { term: '24-hour', label: '24-Hour Access' },
    ];

    for (const feature of websiteFeatures) {
      if (scrapedContent.includes(feature.term) && !kbContent.includes(feature.term)) {
        if (!uniqueInfo.includes(feature.label)) {
          uniqueInfo.push(feature.label);
        }
      }
    }

    // Extract sections from scraped content
    const sections = centre.scrapedContent.split(/===\s+(\w+)\s+===/);
    const websiteSections: { [key: string]: string } = {};

    for (let i = 1; i < sections.length; i += 2) {
      const sectionName = sections[i];
      const sectionContent = sections[i + 1]?.trim() || '';
      if (sectionContent) {
        websiteSections[sectionName] = sectionContent;
      }
    }

    reportMd += `## ${centreName}\n\n`;
    reportMd += `**Website:** ${centre.url}\n\n`;

    if (uniqueInfo.length > 0 || Object.keys(websiteSections).length > 0) {
      centresWithUniqueInfo++;

      if (uniqueInfo.length > 0) {
        reportMd += `### Unique Facilities/Features Mentioned:\n`;
        uniqueInfo.forEach(info => {
          reportMd += `- ${info}\n`;
        });
        reportMd += '\n';
      }

      if (Object.keys(websiteSections).length > 0) {
        reportMd += `### Website Content Sections:\n`;
        for (const [section, content] of Object.entries(websiteSections)) {
          reportMd += `\n**${section}:**\n`;
          reportMd += `> ${content.substring(0, 300)}${content.length > 300 ? '...' : ''}\n`;
        }
      }

      reportMd += '\n';
    } else {
      reportMd += `*No significant unique information found on website that isn't already in knowledge base.*\n\n`;
    }

    reportMd += `---\n\n`;
  }

  reportMd += `## Summary\n\n`;
  reportMd += `- **Total centres analyzed:** ${totalCentres}\n`;
  reportMd += `- **Centres with unique website information:** ${centresWithUniqueInfo}\n`;
  reportMd += `- **Centres with no unique information:** ${totalCentres - centresWithUniqueInfo}\n`;

  // Save report
  const outputPath = path.join(process.cwd(), 'data', 'website-comparison-report.md');
  fs.writeFileSync(outputPath, reportMd);

  console.log(`\n✅ Report saved to: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total centres: ${totalCentres}`);
  console.log(`   With unique info: ${centresWithUniqueInfo}`);
  console.log(`   Without unique info: ${totalCentres - centresWithUniqueInfo}`);
}

compareWebsiteVsKnowledgeBase();
