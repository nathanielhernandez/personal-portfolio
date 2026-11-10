import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// --- setup -------------------------------------------------------------

const root = path.resolve(import.meta.dirname, '..');
const contentBase = path.join(root, 'src', 'content', 'lab');
const demoBase = path.join(root, 'src', 'lab');

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DEFAULT_STACK = ['React', 'TypeScript', 'CSS'];

const rl = createInterface({ input, output });
rl.on('SIGINT', () => {
  console.log('\nCancelled.');
  process.exit(130);
});

// --- helpers -----------------------------------------------------------

/** Ask until `validate` returns nothing (valid) */
async function ask(question, { defaultValue = '', validate } = {}) {
  const suffix = defaultValue ? ` [${defaultValue}]` : '';
  while (true) {
    const answer =
      (await rl.question(`${question}${suffix}: `)).trim() || defaultValue;
    const error = validate ? await validate(answer) : undefined;
    if (!error) return answer;
    console.log(`  ✗ ${error}`);
  }
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** "magnetic-button" -> "Magnetic button" */
function titleFromSlug(slug) {
  const words = slug.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function parseStack(value) {
  const items = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(items)]; // drop duplicates
}

// --- questions ---------------------------------------------------------

const slug = await ask('Slug (kebab-case, e.g. magnetic-button)', {
  validate: async (v) => {
    if (!SLUG_RE.test(v))
      return 'Must be kebab-case: lowercase letters, numbers, hyphens.';
    const paths = [
      path.join(contentBase, v),
      path.join(contentBase, `${v}.mdx`),
      path.join(demoBase, v),
    ];
    const taken = await Promise.all(paths.map(exists));
    if (taken.some(Boolean)) return `A lab called '${v}' already exists.`;
  },
});

const title = await ask('Title', { defaultValue: titleFromSlug(slug) });

const description = await ask('Description', {
  validate: (v) => (v ? undefined : "Description can't be empty."),
});

const stack = parseStack(
  await ask('Stack, comma-separated', {
    defaultValue: DEFAULT_STACK.join(', '),
    validate: (v) =>
      parseStack(v).length ? undefined : 'Add at least one item.',
  }),
);

// --- confirm -----------------------------------------------------------

console.log(`
About to create:
  slug:        ${slug}
  title:       ${title}
  description: ${description}
  stack:       ${stack.join(', ')}
`);

const confirm = await ask('Continue? [Y/n]'); // empty answer = yes
rl.close();

if (/^n/i.test(confirm)) {
  console.log('Cancelled.');
  process.exit(0);
}

// --- templates ---------------------------------------------------------

const q = JSON.stringify; // a JSON string is also a valid YAML string
const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local time

const mdx = `---
title: ${q(title)}
description: ${q(description)}
draft: true
stack:
${stack.map((s) => `  - ${q(s)}`).join('\n')}
pubDate: ${today}
---
`;

const tsx = `import styles from './Demo.module.css';

export default function Demo() {
  return (
    <div className={styles.main}>
      {/* data-preview marks what \`npm run snap-labs\` crops the /lab card image to */}
      <h1 data-preview>Hello</h1>
    </div>
  );
}
`;

const css = `.main {
  display: grid;
  place-items: center;
  min-height: 100dvh;
}
`;

// --- write -------------------------------------------------------------

const files = [
  [path.join(contentBase, slug, 'index.mdx'), mdx],
  [path.join(demoBase, slug, 'Demo.tsx'), tsx],
  [path.join(demoBase, slug, 'Demo.module.css'), css],
];

for (const [file, contents] of files) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents, { flag: 'wx' }); // 'wx' = fail if the file exists
}

console.log(`✓ Created lab '${slug}'`);
for (const [file] of files) console.log(`  ${path.relative(root, file)}`);
