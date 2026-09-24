import { writeIndex } from './content-pipeline.mjs';
const articles = writeIndex();
console.log(`Prepared ${articles.length} articles in ${new Set(articles.map(a => a.category)).size} categories.`);
