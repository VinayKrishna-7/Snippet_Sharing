export const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: '.js', monaco: 'javascript', color: '#f7df1e', template: '// JavaScript snippet\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));\n' },
  { id: 'typescript', name: 'TypeScript', ext: '.ts', monaco: 'typescript', color: '#3178c6', template: '// TypeScript snippet\ninterface User {\n  id: string;\n  name: string;\n}\n\nconst user: User = { id: "1", name: "Alice" };\n' },
  { id: 'python', name: 'Python', ext: '.py', monaco: 'python', color: '#3572A5', template: '# Python snippet\ndef quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    return [x for x in arr if x < pivot] + [x for x in arr if x == pivot] + [x for x in arr if x > pivot]\n' },
  { id: 'java', name: 'Java', ext: '.java', monaco: 'java', color: '#b07219', template: '// Java snippet\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello, SnipDrop!");\n    }\n}\n' },
  { id: 'c', name: 'C', ext: '.c', monaco: 'c', color: '#555555', template: '/* C snippet */\n#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}\n' },
  { id: 'cpp', name: 'C++', ext: '.cpp', monaco: 'cpp', color: '#f34b7d', template: '// C++ snippet\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> numbers = {1, 2, 3, 4, 5};\n    for (int n : numbers) std::cout << n << " ";\n    return 0;\n}\n' },
  { id: 'csharp', name: 'C#', ext: '.cs', monaco: 'csharp', color: '#178600', template: '// C# snippet\nusing System;\n\nnamespace SnipDropDemo\n{\n    class Program\n    {\n        static void Main()\n        {\n            Console.WriteLine("Hello from C#!");\n        }\n    }\n}\n' },
  { id: 'go', name: 'Go', ext: '.go', monaco: 'go', color: '#00ADD8', template: '// Go snippet\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Gophers!")\n}\n' },
  { id: 'rust', name: 'Rust', ext: '.rs', monaco: 'rust', color: '#dea584', template: '// Rust snippet\nfn main() {\n    let message = "Hello from Rust!";\n    println!("{}", message);\n}\n' },
  { id: 'php', name: 'PHP', ext: '.php', monaco: 'php', color: '#4F5D95', template: '<?php\n// PHP snippet\n$fruits = ["Apple", "Banana", "Cherry"];\nforeach ($fruits as $fruit) {\n    echo "$fruit\\n";\n}\n' },
  { id: 'html', name: 'HTML', ext: '.html', monaco: 'html', color: '#e34c26', template: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Snippet</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>\n' },
  { id: 'css', name: 'CSS', ext: '.css', monaco: 'css', color: '#563d7c', template: '/* CSS snippet */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background: #0f172a;\n}\n' },
  { id: 'sql', name: 'SQL', ext: '.sql', monaco: 'sql', color: '#e38c00', template: '-- SQL snippet\nSELECT u.id, u.name, COUNT(s.id) AS total_snippets\nFROM users u\nLEFT JOIN snippets s ON u.id = s.user_id\nGROUP BY u.id, u.name\nORDER BY total_snippets DESC;\n' },
  { id: 'json', name: 'JSON', ext: '.json', monaco: 'json', color: '#292929', template: '{\n  "name": "SnipDrop",\n  "version": "1.0.0",\n  "private": true,\n  "features": ["anonymous", "instant-share", "monaco-editor"]\n}\n' },
  { id: 'bash', name: 'Bash', ext: '.sh', monaco: 'shell', color: '#89e051', template: '#!/usr/bin/env bash\n# Bash snippet\necho "Running SnipDrop deployment check..."\nnode -v\nnpm -v\n' },
  { id: 'markdown', name: 'Markdown', ext: '.md', monaco: 'markdown', color: '#083fa1', template: '# Project Overview\n\nThis snippet illustrates how to share markdown notes and documentation instantly.\n\n- No registration\n- Beautiful formatting\n' },
];

export function getLanguageMeta(id) {
  return LANGUAGES.find((l) => l.id === id) || {
    id: id || 'javascript',
    name: id || 'Plain Text',
    ext: '.txt',
    monaco: 'plaintext',
    color: '#64748b',
    template: '',
  };
}
