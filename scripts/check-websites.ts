import * as fs from 'fs';
import * as path from 'path';

const mdPath = path.join(process.cwd(), 'data', 'knowledge-base-clean.md');
const markdown = fs.readFileSync(mdPath, 'utf-8');

// Split by centre sections (## Centre Name)
const centreSections = markdown.split(/\n## /);

const centresWithoutWebsites: string[] = [];
const centresWithWebsites: string[] = [];

for (let i = 1; i < centreSections.length; i++) {
  const section = centreSections[i];
  const lines = section.split('\n');
  const centreName = lines[0].trim();

  // Check if contact information section has a website
  const contactSection = section.substring(0, 500); // Check first 500 chars

  if (contactSection.match(/website.*http/i) || contactSection.match(/www\./i)) {
    centresWithWebsites.push(centreName);
  } else {
    centresWithoutWebsites.push(centreName);
  }
}

console.log('\n=== CENTRES WITHOUT WEBSITE INFORMATION ===');
console.log(`Total: ${centresWithoutWebsites.length}\n`);
centresWithoutWebsites.forEach((name, i) => {
  console.log(`${i + 1}. ${name}`);
});

console.log('\n\n=== CENTRES WITH WEBSITE INFORMATION ===');
console.log(`Total: ${centresWithWebsites.length}\n`);
centresWithWebsites.forEach((name, i) => {
  console.log(`${i + 1}. ${name}`);
});

console.log(`\n\nSummary: ${centresWithWebsites.length} with websites, ${centresWithoutWebsites.length} without websites`);
