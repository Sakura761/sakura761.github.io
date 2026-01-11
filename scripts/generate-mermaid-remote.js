import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CONTENT_DIR = path.resolve(process.cwd(), 'src', 'content');
const OUT_DIR = path.resolve(process.cwd(), 'public', 'assets', 'mermaid');

function hash(s) {
	return crypto.createHash('sha1').update(s).digest('hex');
}

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function* walkDirGen(dir) {
	const items = fs.readdirSync(dir, { withFileTypes: true });
	for (const it of items) {
		const p = path.join(dir, it.name);
		if (it.isDirectory()) yield* walkDirGen(p);
		else if (it.isFile() && p.endsWith('.md')) yield p;
	}
}

async function renderDiagramRemote(diagramText, outPath) {
	ensureDir(path.dirname(outPath));
	const url = 'https://kroki.io/mermaid/svg';
	console.log('Posting mermaid to kroki ->', url);
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'text/plain' },
		body: diagramText,
	});
	if (!res.ok) throw new Error('Failed to fetch mermaid image: ' + res.status);
	const svg = await res.text();
	fs.writeFileSync(outPath, svg, 'utf8');
}

function processFileSync(file) {
	let content = fs.readFileSync(file, 'utf8');
	let changed = false;
	const re = /```mermaid\r?\n([\s\S]*?)```/g;
	let m;
	const tasks = [];
	while ((m = re.exec(content)) !== null) {
		const diagram = m[1].trim();
		if (!diagram) continue;
		const id = hash(diagram);
		const fileName = `${id}.svg`;
		const publicPath = `/assets/mermaid/${fileName}`;
		const outPath = path.join(OUT_DIR, fileName);
		if (!fs.existsSync(outPath)) {
			console.log('Will fetch remote diagram ->', outPath);
			tasks.push(renderDiagramRemote(diagram, outPath));
		} else {
			console.log('Reusing existing diagram', outPath);
		}
		const whole = m[0];
		const img = `![mermaid](${publicPath})`;
		content = content.replace(whole, img);
		changed = true;
	}
	return { changed, content, tasks };
}

async function main() {
	ensureDir(OUT_DIR);
	if (!fs.existsSync(CONTENT_DIR)) {
		console.error('Content dir not found:', CONTENT_DIR);
		process.exit(1);
	}
	for (const file of walkDirGen(CONTENT_DIR)) {
		console.log('Checking', file);
		const { changed, content, tasks } = processFileSync(file);
		if (tasks.length > 0) await Promise.all(tasks);
		if (changed) {
			fs.writeFileSync(file, content, 'utf8');
			console.log('Updated', file);
		}
	}
}

await main();
