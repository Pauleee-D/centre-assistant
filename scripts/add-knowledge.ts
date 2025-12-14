import { Index } from '@upstash/vector';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
}

function parseMarkdownToKnowledge(markdown: string): KnowledgeItem[] {
  const knowledgeItems: KnowledgeItem[] = [];

  // Split by centre sections (## Centre Name)
  const centreSections = markdown.split(/\n## /);

  for (let i = 1; i < centreSections.length; i++) {
    const section = centreSections[i];
    const lines = section.split('\n');
    const centreName = lines[0].trim();

    // Convert centre name to ID format (lowercase, no spaces/special chars)
    const centreId = centreName
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[()]/g, '');

    // Skip if this is a general section
    const isGeneralSection = centreName.toLowerCase().includes('general');
    const prefix = isGeneralSection ? 'general' : centreId;

    // Split by subsections (### Subsection Name)
    const subsections = section.split(/\n### /);

    for (let j = 1; j < subsections.length; j++) {
      const subsection = subsections[j];
      const subsectionLines = subsection.split('\n');
      const subsectionName = subsectionLines[0].trim();

      // Get content (everything after the subsection title until next section or end)
      const content = subsectionLines.slice(1).join('\n').trim();

      if (content) {
        // Create a clean ID from subsection name
        const subsectionId = subsectionName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        knowledgeItems.push({
          id: `${prefix}-${subsectionId}`,
          title: `${centreName} ${subsectionName}`,
          content: content,
        });
      }
    }
  }

  return knowledgeItems;
}

async function addKnowledge() {
  console.log('Loading knowledge from markdown file...');

  // Read the markdown file
  const mdPath = path.join(process.cwd(), 'data', 'knowledge-base-clean.md');
  const markdown = fs.readFileSync(mdPath, 'utf-8');

  console.log('Parsing markdown into knowledge items...');
  const knowledgeItems = parseMarkdownToKnowledge(markdown);

  console.log(`Found ${knowledgeItems.length} items to upload\n`);
  console.log('Adding knowledge to vector database...');

  let successCount = 0;
  let failCount = 0;

  for (const item of knowledgeItems) {
    try {
      await index.upsert({
        id: item.id,
        data: item.content, // Upstash will automatically generate embeddings
        metadata: {
          title: item.title,
          content: item.content,
        },
      });
      console.log(`✓ Added: ${item.title}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to add ${item.title}:`, error);
      failCount++;
    }
  }

  console.log(`\nDone! ${successCount} items added successfully, ${failCount} failed.`);
}

addKnowledge();
