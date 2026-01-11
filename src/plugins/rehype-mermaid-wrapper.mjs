import { visit } from 'unist-util-visit';

export default function rehypeMermaidWrapper() {
	return (tree) => {
		visit(tree, 'element', (node, index, parent) => {
			if (!node || node.tagName !== 'pre' || !node.children) return;
			const code = node.children.find(c => c.tagName === 'code');
			if (!code || !code.properties) return;
			const className = code.properties.className || code.properties['class'] || [];
			if (!Array.isArray(className)) return;
			const isMermaid = className.some(c => c === 'language-mermaid' || c === 'lang-mermaid' || c === 'mermaid');
			if (!isMermaid) return;
			// extract literal text from code children
			const textNode = code.children.find(ch => ch.type === 'text');
			const codeText = textNode ? textNode.value : '';
			// replace <pre><code class="language-mermaid">...</code></pre> with <div class="mermaid">...</div>
			const newNode = {
				type: 'element',
				tagName: 'div',
				properties: { className: ['mermaid'] },
				children: [{ type: 'text', value: codeText }],
			};
			if (parent && typeof index === 'number') {
				parent.children.splice(index, 1, newNode);
			}
		});
	};
}
