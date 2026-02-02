// Utility functions for text processing

/**
 * Remove HTML tags from a string
 * @param html - HTML string to clean
 * @returns Clean text without HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Truncate text to a specific length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Clean and truncate HTML content
 * @param html - HTML string to process
 * @param maxLength - Maximum length for truncation
 * @returns Clean, truncated text
 */
export const cleanAndTruncateHtml = (html: string, maxLength: number = 100): string => {
  const cleanText = stripHtmlTags(html);
  return truncateText(cleanText, maxLength);
};