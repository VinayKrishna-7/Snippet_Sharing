export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: 'js', monaco: 'javascript', prism: 'javascript' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts', monaco: 'typescript', prism: 'typescript' },
  { id: 'python', name: 'Python', extension: 'py', monaco: 'python', prism: 'python' },
  { id: 'java', name: 'Java', extension: 'java', monaco: 'java', prism: 'java' },
  { id: 'c', name: 'C', extension: 'c', monaco: 'c', prism: 'c' },
  { id: 'cpp', name: 'C++', extension: 'cpp', monaco: 'cpp', prism: 'cpp' },
  { id: 'csharp', name: 'C#', extension: 'cs', monaco: 'csharp', prism: 'csharp' },
  { id: 'go', name: 'Go', extension: 'go', monaco: 'go', prism: 'go' },
  { id: 'rust', name: 'Rust', extension: 'rs', monaco: 'rust', prism: 'rust' },
  { id: 'php', name: 'PHP', extension: 'php', monaco: 'php', prism: 'php' },
  { id: 'html', name: 'HTML', extension: 'html', monaco: 'html', prism: 'html' },
  { id: 'css', name: 'CSS', extension: 'css', monaco: 'css', prism: 'css' },
  { id: 'sql', name: 'SQL', extension: 'sql', monaco: 'sql', prism: 'sql' },
  { id: 'json', name: 'JSON', extension: 'json', monaco: 'json', prism: 'json' },
  { id: 'bash', name: 'Bash', extension: 'sh', monaco: 'shell', prism: 'bash' },
  { id: 'markdown', name: 'Markdown', extension: 'md', monaco: 'markdown', prism: 'markdown' }
];

export const VALID_LANGUAGE_IDS = new Set(SUPPORTED_LANGUAGES.map((l) => l.id));

export function isValidLanguage(lang) {
  if (!lang || typeof lang !== 'string') return false;
  return VALID_LANGUAGE_IDS.has(lang.toLowerCase().trim());
}
