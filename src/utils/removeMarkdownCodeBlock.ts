export const removeMarkdownCodeBlock = (input: string): string => {
  const match = input.match(/```[\w]*\n?([\s\S]*?)```/);
  return match ? match[1].trim() : input;
};