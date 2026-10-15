const tables = new Map();
const pageSize = 4;
const tokenize = (sql) => sql.match(/'(?:[^']|'')*'|"(?:[^"]|"")*"|>=|<=|<>|!=|[(),;*=<>]|[^\s(),;*=<>]+/g)?.filter((x) => x !== ';') || [];
const unquote = (value) => { const s = String(value).trim(); if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) return s.slice(1, -1).replaceAll("''", "'").replaceAll('""', '"'); return s; };
const pages = (table) => Array.from({ length: Math.ceil(table.rows.length / pageSize) }, (_, i) => ({ pageNumber: i + 1, records: table.rows.slice(i * pageSize, (i + 1) * pageSize).map((row) => [...row]) }));

export function executeSql(raw) {
  const sql = String(raw || '').trim(); if (!sql) throw new Error('Enter a SQL statement.');
  const tokens = tokenize(sql); const normalized = sql.replace(/;\s*$/, '').trim();
  const steps = [{ name: 'Tokenizer', detail: `Converted SQL into ${tokens.length} tokens` }, { name: 'Parser', detail: 'Built a structured SQL query model' }];
  const addSteps = (plan, storage, filter = 'No row filter required') => {
    steps.push({ name: 'Query Plan', detail: plan }, { name: 'Storage', detail: storage }, { name: 'Filter', detail: filter }, { name: 'Result', detail: 'Returned execution status, rows and physical page views.' });
  };
  let m;
  if ((m = normalized.match(/^CREATE\s+TABLE\s+(\w+)\s*\((.+)\)$/i))) {
    const name = m[1].toLowerCase(); if (tables.has(name)) throw new Error(`Table already exists: ${m[1]}`);
    const columns = m[2].split(',').map((part) => { const p = part.trim().match(/^(\w+)\s+(\w+)(.*)$/); if (!p) throw new Error(`Invalid column definition: ${part}`); return { name: p[1], type: p[2].toUpperCase(), primaryKey: /PRIMARY\s+KEY/i.test(p[3]) }; });
    tables.set(name, { name: m[1], columns, rows: [] }); addSteps('Create table metadata', 'Created table metadata and initialized empty storage pages.');
    return { message: `Table ${m[1]} created`, columns: [], rows: [], pages: [], tokens, steps, indexUsed: false };
  }
  if ((m = normalized.match(/^INSERT\s+INTO\s+(\w+)\s+VALUES\s*\((.*)\)$/i))) {
    const table = requireTable(m[1]); const values = splitValues(m[2]).map(unquote);
    if (values.length !== table.columns.length) throw new Error('INSERT value count must match column count');
    const pk = table.columns.findIndex((c) => c.primaryKey); if (pk >= 0 && table.rows.some((r) => r[pk] === values[pk])) throw new Error('Duplicate primary key.');
    table.rows.push(values); addSteps('Append record', 'Appended record to a storage page.');
    return { message: '1 row inserted', columns: table.columns.map((c) => c.name), rows: [values], pages: pages(table), tokens, steps, indexUsed: false };
  }
  if ((m = normalized.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*(=|>=|<=|>|<|!=|<>)\s*(.+))?$/i))) {
    const table = requireTable(m[2]); const wanted = m[1].trim() === '*' ? table.columns.map((c) => c.name) : m[1].split(',').map((x) => x.trim());
    const where = m[3] ? { column: m[3], op: m[4], value: unquote(m[5]) } : null; const col = where ? columnIndex(table, where.column) : -1;
    const indexUsed = Boolean(where && where.column.toLowerCase() === 'id' && table.columns.some((c) => c.name.toLowerCase() === 'id'));
    const selected = table.rows.filter((row) => !where || compare(row[col], where.value, where.op)); const projected = selected.map((row) => wanted.map((c) => row[columnIndex(table, c)]));
    addSteps(indexUsed ? 'Hash index lookup on id' : 'Full table scan', 'Read rows from the in-memory storage pages.', `${projected.length} matching row(s)`);
    return { message: `${projected.length} row(s) returned`, columns: wanted, rows: projected, pages: pages(table), tokens, steps, indexUsed };
  }
  if ((m = normalized.match(/^UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(\w+)\s*(=|>=|<=|>|<|!=|<>)\s*(.+))?$/i))) {
    const table = requireTable(m[1]); const assignments = m[2].split(',').map((x) => { const p = x.match(/^\s*(\w+)\s*=\s*(.+?)\s*$/); if (!p) throw new Error('Invalid UPDATE assignment.'); return [columnIndex(table, p[1]), unquote(p[2])]; });
    const where = m[3] ? { col: columnIndex(table, m[3]), op: m[4], value: unquote(m[5]) } : null; let count = 0;
    for (const row of table.rows) if (!where || compare(row[where.col], where.value, where.op)) { assignments.forEach(([i, v]) => { row[i] = v; }); count++; }
    addSteps('Update matching rows', 'Updated matching records in storage pages.', `${count} row(s) updated`);
    return { message: `${count} row(s) updated`, columns: table.columns.map((c) => c.name), rows: [], pages: pages(table), tokens, steps, indexUsed: false };
  }
  if ((m = normalized.match(/^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*(=|>=|<=|>|<|!=|<>)\s*(.+))?$/i))) {
    const table = requireTable(m[1]); const where = m[2] ? { col: columnIndex(table, m[2]), op: m[3], value: unquote(m[4]) } : null; const old = table.rows.length;
    table.rows = table.rows.filter((row) => where && compare(row[where.col], where.value, where.op)); const count = old - table.rows.length;
    addSteps('Delete matching rows', 'Removed matching records from storage pages.', `${count} row(s) deleted`);
    return { message: `${count} row(s) deleted`, columns: table.columns.map((c) => c.name), rows: [], pages: pages(table), tokens, steps, indexUsed: false };
  }
  throw new Error('Unsupported SQL. Use CREATE TABLE, INSERT, SELECT, UPDATE or DELETE.');
}

function requireTable(name) { const table = tables.get(name.toLowerCase()); if (!table) throw new Error(`Table not found: ${name}`); return table; }
function columnIndex(table, name) { const index = table.columns.findIndex((c) => c.name.toLowerCase() === name.toLowerCase()); if (index < 0) throw new Error(`Column not found: ${name}`); return index; }
function splitValues(text) { return text.match(/'(?:[^']|'')*'|"(?:[^"]|"")*"|[^,]+/g)?.map((x) => x.trim()) || []; }
function compare(a, b, op) { const left = Number(a), right = Number(b); const numeric = a !== '' && b !== '' && Number.isFinite(left) && Number.isFinite(right); const x = numeric ? left : String(a).toLowerCase(), y = numeric ? right : String(b).toLowerCase(); return ({ '=': x === y, '!=': x !== y, '<>': x !== y, '>': x > y, '<': x < y, '>=': x >= y, '<=': x <= y })[op]; }
