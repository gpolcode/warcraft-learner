#!/usr/bin/env node
// Guards the AGENTS.md / .agents/skills / .github/agents contract described in AGENTS.md:
// valid skill and custom-agent frontmatter, every router-table skill actually present,
// and the repo-wide no-em-dash/en-dash/Unicode-minus rule inside that contract's own files.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const errors = [];

function parseFrontmatter(text, path) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    errors.push(`${path}: missing YAML frontmatter block`);
    return {};
  }
  const fields = {};
  for (const line of match[1].split('\n')) {
    const fieldMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (fieldMatch) fields[fieldMatch[1]] = fieldMatch[2].trim();
  }
  return fields;
}

function checkSkill(dir) {
  const skillPath = join(dir, 'SKILL.md');
  const text = readFileSync(skillPath, 'utf8');
  const rel = relative(ROOT, skillPath);
  const { name, description } = parseFrontmatter(text, rel);
  const dirName = dir.split('/').pop();

  if (!name) errors.push(`${rel}: missing "name" in frontmatter`);
  else if (name !== dirName) errors.push(`${rel}: name "${name}" does not match directory "${dirName}"`);
  else if (!/^[a-z0-9-]+$/.test(name)) errors.push(`${rel}: name "${name}" must be lowercase letters, digits, hyphens only`);
  else if (name.length > 64) errors.push(`${rel}: name exceeds 64 characters`);

  if (!description) errors.push(`${rel}: missing "description" in frontmatter`);
  else if (description.length > 1024) errors.push(`${rel}: description exceeds 1024 characters (${description.length})`);

  return name || dirName;
}

function checkAgent(path) {
  const text = readFileSync(path, 'utf8');
  const rel = relative(ROOT, path);
  const { name, description } = parseFrontmatter(text, rel);
  if (!name) errors.push(`${rel}: missing "name" in frontmatter`);
  else if (!/^[a-z0-9-]+$/.test(name)) errors.push(`${rel}: name "${name}" must be lowercase letters, digits, hyphens only`);
  if (!description) errors.push(`${rel}: missing "description" in frontmatter`);
}

function checkDashes(path) {
  const text = readFileSync(path, 'utf8');
  const rel = relative(ROOT, path);
  const forbidden = /[—–−]/;
  text.split('\n').forEach((line, i) => {
    if (forbidden.test(line)) errors.push(`${rel}:${i + 1}: contains a forbidden em-dash/en-dash/Unicode-minus`);
  });
}

function walkMarkdown(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkMarkdown(full, out);
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

// 1-2. every skill's frontmatter, collecting the known skill names
const skillsDir = join(ROOT, '.agents/skills');
const skillNames = new Set();
for (const entry of readdirSync(skillsDir)) {
  const dir = join(skillsDir, entry);
  if (statSync(dir).isDirectory()) skillNames.add(checkSkill(dir));
}

// 3. the rulebook-author custom agent
checkAgent(join(ROOT, '.github/agents/rulebook-author.agent.md'));

// 4. every skill named in the AGENTS.md router table's rows exists under .agents/skills/
const agentsMd = readFileSync(join(ROOT, 'AGENTS.md'), 'utf8');
const routerSection = agentsMd.split('## Development workflow router')[1] ?? '';
const tableRows = routerSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---'));
const namedSkills = new Set();
for (const row of tableRows) {
  const cells = row.split('|');
  const loadCell = cells[cells.length - 2] ?? '';
  for (const m of loadCell.matchAll(/\*\*([a-z][a-z0-9-]*)\*\*/g)) namedSkills.add(m[1]);
}
for (const named of namedSkills) {
  if (!skillNames.has(named)) errors.push(`AGENTS.md router table names skill "${named}" with no matching .agents/skills/${named}/`);
}

// 5. no forbidden dashes anywhere in the instruction/skill/agent contract
for (const file of [join(ROOT, 'AGENTS.md'), ...walkMarkdown(skillsDir), ...walkMarkdown(join(ROOT, '.github/agents'))]) {
  checkDashes(file);
}

if (errors.length > 0) {
  console.error(`check-agent-config: ${errors.length} problem(s) found\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('check-agent-config: AGENTS.md, .agents/skills/, and .github/agents/ are consistent');
