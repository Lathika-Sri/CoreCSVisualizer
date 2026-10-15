const unique = (items) => [...new Set(items)];

function blockAt(source, open) {
  let depth = 0; let quote = ''; let escaped = false;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (quote) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === quote) quote = ''; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '{') depth++;
    if (ch === '}' && --depth === 0) return source.slice(open + 1, i);
  }
  throw new Error('Java parsing failed: unmatched braces in source.');
}

export function analyzeJava(code) {
  if (typeof code !== 'string' || !code.trim()) throw new Error('Provide Java source code to analyze.');
  const clean = code.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
  const classes = []; const declaration = /\b(class|interface)\s+(\w+)([^{}]*)\{/g; let match;
  while ((match = declaration.exec(clean))) {
    const [_, kind, name, header] = match; const body = blockAt(clean, declaration.lastIndex - 1);
    const methods = [...body.matchAll(/(?:^|[;}])\s*(?:(?:public|protected|private|static|final|abstract|synchronized|native|default)\s+)*(?:<[\w\s,? extends]+>\s*)?[\w\[\]<>.?]+\s+(\w+)\s*\([^;{}]*\)\s*(?:throws\s+[\w,.\s]+)?\s*(?:\{|;)/g)].map((x) => x[1]);
    const fields = [...body.matchAll(/(?:^|[;}])\s*(?:(?:public|protected|private|static|final|volatile|transient)\s+)*([\w<>.?\[\]]+)\s+(\w+)\s*(?:=[^;]*)?;/g)].map((x) => `${x[2]}:${x[1]}`);
    const parent = header.match(/\bextends\s+(\w+)/)?.[1] || null;
    const interfaces = header.match(/\bimplements\s+([\w\s,<>]+)/)?.[1].split(',').map((x) => x.trim().split('<')[0]) || [];
    const dependencies = [...body.matchAll(/\bnew\s+(\w+)/g)].map((x) => x[1]);
    for (const f of fields) dependencies.push(f.slice(f.indexOf(':') + 1).replace(/<.*|\[\]/g, ''));
    for (const parameter of body.matchAll(/\b(?:public|protected|private|static|final|abstract|synchronized|default)?\s*[\w<>.?\[\]]+\s+\w+\s*\(([^)]*)\)/g)) {
      for (const argument of parameter[1].split(',')) { const type = argument.trim().split(/\s+/)[0]; if (type && type !== 'void') dependencies.push(type.replace(/<.*|\[\]/g, '')); }
    }
    const overriddenMethods = methods.filter((method) => new RegExp(`@Override[\\s\\S]{0,100}?\\b${method}\\s*\\(`).test(body));
    classes.push({ name, parent, interfaceType: kind === 'interface', methods: unique(methods), fields, dependencies: unique(dependencies.filter((x) => x !== name)), interfaces, overriddenMethods, switchStatements: [...body.matchAll(/\bswitch\s*\(/g)].length });
    declaration.lastIndex = clean.indexOf('}', declaration.lastIndex) + 1;
  }
  const internal = new Set(classes.map((c) => c.name)); const interfaces = new Set(classes.filter((c) => c.interfaceType).map((c) => c.name)); const issues = []; const dependencies = [];
  for (const c of classes) {
    if (!c.interfaceType && c.methods.length >= 6) issues.push({ principle: 'SRP', severity: 'Potential', className: c.name, title: 'Many responsibilities may be concentrated in one class', explanation: 'The class exposes many methods. Method count alone cannot prove an SRP violation, but it is a useful review signal.', suggestion: 'Group methods by business responsibility and consider focused services.' });
    if (c.switchStatements) issues.push({ principle: 'OCP', severity: 'Potential', className: c.name, title: 'Type-based switch may make extension modification-heavy', explanation: 'A switch over variants can require editing an existing class when a new variant is introduced. The surrounding design matters.', suggestion: 'Consider a strategy, polymorphic implementation, or registry when the variant set is expected to grow.' });
    if (c.parent && c.overriddenMethods.length) issues.push({ principle: 'LSP', severity: 'Review', className: c.name, title: 'Inheritance with overrides needs substitutability review', explanation: 'Overriding methods is not a violation by itself; the key question is whether the subtype preserves the parent contract.', suggestion: 'Check preconditions, postconditions, invariants, and exception behavior.' });
    if (c.interfaceType && c.methods.length > 4) issues.push({ principle: 'ISP', severity: 'Potential', className: c.name, title: 'Interface may be too broad', explanation: 'An interface with many operations can force implementers to depend on methods they do not need.', suggestion: 'Split the contract into smaller role-focused interfaces where clients use different subsets.' });
    for (const d of c.dependencies) {
      if (internal.has(d)) dependencies.push({ from: c.name, to: d, kind: 'dependency' });
      if (!c.interfaceType && internal.has(d) && !interfaces.has(d)) issues.push({ principle: 'DIP', severity: 'Potential', className: c.name, title: `Direct dependency on concrete type: ${d}`, explanation: 'The class appears to depend directly on another concrete class in its own analyzed source.', suggestion: 'Depend on a stable abstraction when the dependency is volatile or needs substitution.' });
    }
    if (c.parent) dependencies.push({ from: c.name, to: c.parent, kind: 'extends' });
  }
  return { classes, issues, dependencies, totalClasses: classes.length, totalMethods: classes.reduce((n, c) => n + c.methods.length, 0) };
}
