export const replacePlaceholders = (template: string, programmingLanguage: string) => {
  return template.replace(/\$(\w+)/g, (match, placeholder) => {
    return placeholder === 'programmingLanguage' ? programmingLanguage : match;
  });
};