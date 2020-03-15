import { walk } from 'estree-walker';
import { createFilter } from 'rollup-pluginutils';
import MagicString from 'magic-string';

function getReplacements(options) {
	if (options.values) {
		return Object.assign({}, options.values);
	} else {
		const values = Object.assign({}, options);
		delete values.include;
		delete values.exclude;
		delete values.sourcemap;
		delete values.sourceMap;
		return values;
	}
}

function replace(options = {}) {
	const filter = createFilter(options.include, options.exclude);
	const replaceValues = getReplacements(options);

	return {
		name: 'replace',

		transform(code, id) {
			if (!filter(id)) return null;
			let magicString = new MagicString(code);
			walk(this.parse(code), {
				enter: function(node, parent, prop, index) {
					if (node.type == 'Program') return;
					if (parent.type == 'VariableDeclarator' && prop == 'id') return;
					if (parent.type == 'AssignmentExpression' && prop == 'left') return;
					if (parent.type == 'CallExpression' && prop == 'callee') return;
					if (node.type == 'MemberExpression' && code.slice(node.start, node.end).indexOf('ENV') == 0) {
						let start = node.start,
							end = node.end;
						let nkeys = [];
						while (node.object) {
							nkeys.unshift(node.property.name || node.property.value);
							node = node.object;
						}
						if (node.name != 'ENV') return this.skip();
						magicString.overwrite(start, end, String(JSON.stringify(nkeys.reduce((res, key) => (res ? res[key] : undefined), replaceValues))));
						return this.skip();
					}
					if (node.type == 'Identifier' && node.name == 'ENV' && parent.type == 'VariableDeclarator' && prop == 'init') {
						magicString.overwrite(node.start, node.end, String(JSON.stringify(replaceValues)));
						return this.skip();
					}
					if (node.type == 'Identifier' && node.name == 'ENV' && parent.type == 'AssignmentExpression' && prop == 'right') {
						magicString.overwrite(node.start, node.end, String(JSON.stringify(replaceValues)));
						return this.skip();
					}
				},
			});
			const result = { code: magicString.toString() };
			if (options.sourceMap !== false && options.sourcemap !== false) result.map = magicString.generateMap({ hires: true });

			return result;
		},
	};
}

export default replace;
