import content from './generated/articles.json' with { type: 'json' };

export interface ArchiveRecord {
  id: string;
  slug: string;
  url: string;
  title: string;
  en: string;
  department: string;
  category: string;
  date: string;
  lead: string;
  clearance: string;
  abstract: string;
  findings: string[];
  source: string;
  tags: string[];
}

export const records: ArchiveRecord[] = content.records;
export const categories = ["全部档案", ...content.categories];
export const archiveColumns = content.columns;
const filesByColumn = archiveColumns.map(category => records
  .map((record, index) => ({ record, index }))
  .filter(({ record }) => record.category === category)
  .map(({ index }) => index));

export function columnFiles(lane: number) {
  return filesByColumn[lane] ?? [];
}
export function fileLocation(index: number) {
  const lane = archiveColumns.indexOf(records[index].category);
  const row = 12 + columnFiles(lane).indexOf(index);
  return { lane, row, slot: lane * 32 + ((row % 32) + 32) % 32 };
}
