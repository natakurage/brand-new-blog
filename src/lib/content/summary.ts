import removeMd from "remove-markdown";

const lettersPerMinute = 500;
const summaryLength = 100;

export const toPlainText = (markdown: string): string => {
  return removeMd(markdown)
}

export interface Summary {
  excerpt: string;
  length: number;
  readingMinutes: number;
}

export const summarize = (markdown: string): Summary => {
  const plainText = toPlainText(markdown);
  const excerpt = plainText.slice(0, summaryLength);
  const length = plainText.length;
  const readingMinutes = Math.ceil(length / lettersPerMinute);
  return { excerpt, length, readingMinutes };
}