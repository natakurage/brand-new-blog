import removeMd from "remove-markdown";

const lettersPerMinute = 500;
const summaryLength = 100;

const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });

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
  const segments = Array.from(segmenter.segment(plainText), (s) => s.segment);
  const length = segments.length;
  const excerpt = segments.slice(0, summaryLength).join("");
  const readingMinutes = Math.ceil(length / lettersPerMinute);
  return { excerpt, length, readingMinutes };
}