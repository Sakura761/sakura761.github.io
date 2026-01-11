import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { execFileSync } from 'child_process';

const CONTENT_DIR = path.resolve(process.cwd(), 'src', 'content');
const OUT_DIR = path.resolve(process.cwd(), 'public', 'assets', 'mermaid');

function hash(s) {
	return crypto.createHash('sha1').update(s).digest('hex');
}

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function walkDir(dir) {
	const items = fs.readdirSync(dir, { withFileTypes: true });
	for (const it of items) {
		const p = path.join(dir, it.name);
		if (it.isDirectory()) yield* walkDir(p);
		else if (it.isFile() && p.endsWith('.md')) yield p;
	}
}

function* walkDirGen(dir) {
	const items = fs.readdirSync(dir, { withFileTypes: true });
	for (const it of items) {
		const p = path.join(dir, it.name);
		if (it.isDirectory()) yield* walkDirGen(p);
		else if (it.isFile() && p.endsWith('.md')) yield p;
	}
}

function renderDiagramToSvg(diagramText, outPath) {
	// create temp file
	const tmp = path.join(os.tmpdir(), `mmd-${hash(diagramText)}.mmd`);
	fs.writeFileSync(tmp, diagramText, 'utf8');
	try {
		execFileSync('npx', ['mmdc', '-i', tmp, '-o', outPath], { stdio: 'inherit' });
	} finally {
		try { fs.unlinkSync(tmp); } catch (e) {}
	}
}

function processFile(file) {
	let content = fs.readFileSync(file, 'utf8');
	let changed = false;
	const diagrams = new Map();
	const re = /```mermaid\n([\s\S]*?)```/g;
	let m;
	while ((m = re.exec(content)) !== null) {
		const diagram = m[1].trim();
		if (!diagram) continue;
		const id = hash(diagram);
		const fileName = `${id}.svg`;
		const publicPath = `/assets/mermaid/${fileName}`;
		const outPath = path.join(OUT_DIR, fileName);
		if (!fs.existsSync(outPath)) {
			console.log('Rendering mermaid ->', outPath);
			ensureDir(OUT_DIR);
			renderDiagramToSvg(diagram, outPath);
		} else {
			console.log('Reusing existing diagram', outPath);
		}
		// replace code block with image markdown
		const whole = m[0];
		const img = `![mermaid](${publicPath})`;
		content = content.replace(whole, img);
		changed = true;
	}
	if (changed) {
		fs.writeFileSync(file, content, 'utf8');
		console.log('Updated', file);
	}
}

function main() {
	ensureDir(OUT_DIR);
	if (!fs.existsSync(CONTENT_DIR)) {
		console.error('Content dir not found:', CONTENT_DIR);
		process.exit(1);
	}
	for (const file of walkDirGen(CONTENT_DIR)) {
		console.log('Checking', file);
		processFile(file);
	}
}

main();
