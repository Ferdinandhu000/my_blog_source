export const profile: Readonly<{
  nameZh: string;
  nameEn: string;
  bioZh: string;
  bioEn: string;
  github: string;
  email: string;
  linkedin: string;
}>;

export function aboutMarkup(language?: 'zh' | 'en', heading?: 'h1' | 'h2'): string;
export function sourceCreditMarkup(): string;
