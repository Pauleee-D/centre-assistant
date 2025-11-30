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

async function addKnowledge() {
  console.log('Loading knowledge from JSON file...');

  // Read the JSON file
  const jsonPath = path.join(process.cwd(), 'data', 'knowledge.json');
  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const knowledgeItems: KnowledgeItem[] = JSON.parse(fileContent);

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
