import fs from 'node:fs';
import path from 'node:path';

const docsArg = process.argv[2] ?? '../docs';
const docsRoot = path.resolve(process.cwd(), docsArg);

if (!fs.existsSync(docsRoot)) {
  console.error(`Docs folder not found: ${docsRoot}`);
  process.exit(1);
}

const pages = [];
const rootIndex = path.join(docsRoot, 'index.html');
if (fs.existsSync(rootIndex)) {
  pages.push({ slug: '', route: '/', file: rootIndex });
}

for (const entry of fs.readdirSync(docsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(docsRoot, entry.name, 'index.html');
  if (fs.existsSync(file)) {
    pages.push({ slug: entry.name, route: `/${entry.name}/`, file });
  }
}

const norm = (value) => (value ? String(value).replace(/\s+/g, ' ').trim() : '');
const extract = (html, regex) => {
  const match = html.match(regex);
  return match ? norm(match[1]) : '';
};

const toCanonicalPath = (canonical) => {
  if (!canonical) return null;
  try {
    const uri = new URL(canonical, 'https://dummy.local');
    let canonicalPath = uri.pathname || '/';
    if (!canonicalPath.endsWith('/')) canonicalPath += '/';
    return canonicalPath;
  } catch {
    return null;
  }
};

const results = pages
  .map((page) => {
    const html = fs.readFileSync(page.file, 'utf8');

    const title = extract(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
    let description = extract(html, /<meta\s+[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
    if (!description) {
      description = extract(html, /<meta\s+[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i);
    }

    let canonical = extract(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([\s\S]*?)["'][^>]*>/i);
    if (!canonical) {
      canonical = extract(html, /<link\s+[^>]*href=["']([\s\S]*?)["'][^>]*rel=["']canonical["'][^>]*>/i);
    }

    const hasMetaRefresh = /<meta\s+[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=/i.test(html);
    const hasJsRedirect = /window\.location\s*=|window\.location\.href\s*=|window\.location\.replace\s*\(|location\.href\s*=|location\.replace\s*\(/i.test(html);
    const hasNoindex = /<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*\bnoindex\b[^"']*["'][^>]*>|<meta\s+[^>]*content=["'][^"']*\bnoindex\b[^"']*["'][^>]*name=["']robots["'][^>]*>/i.test(html);
    const isRedirectPage = (hasMetaRefresh || hasJsRedirect) && hasNoindex;

    const issues = [];
    if (!title) issues.push('missing-title');
    if (!description) issues.push('missing-meta-description');

    if (!canonical) {
      issues.push('missing-canonical');
    } else {
      if (/\.html($|[?#])/i.test(canonical)) {
        issues.push('canonical-has-html');
      }

      const canonicalPath = toCanonicalPath(canonical);
      if (!isRedirectPage && canonicalPath !== page.route) {
        issues.push(`canonical-mismatch(expected:${page.route},got:${canonicalPath ?? 'unparseable'})`);
      }
    }

    return {
      route: page.route,
      titleLen: title.length,
      descLen: description.length,
      canonical,
      redirectPage: isRedirectPage,
      issues,
    };
  })
  .sort((a, b) => a.route.localeCompare(b.route));

const issuesOnly = results.filter((item) => item.issues.length > 0);

const output = {
  checked: results.length,
  ok: results.length - issuesOnly.length,
  issues: issuesOnly.length,
  pagesWithIssues: issuesOnly,
};

console.log(JSON.stringify(output, null, 2));