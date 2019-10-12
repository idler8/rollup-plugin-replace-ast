'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var estreeWalker = require('estree-walker');
var rollupPluginutils = require('rollup-pluginutils');
var MagicString = _interopDefault(require('magic-string'));

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
	const filter = rollupPluginutils.createFilter(options.include, options.exclude);
	const replaceValues = getReplacements(options);

	return {
		name: 'replace',

		transform(code, id) {
			if (!filter(id)) return null;
			let magicString = new MagicString(code);
			estreeWalker.walk(this.parse(code), {
				enter: function(node, parent, prop, index) {
					if (node.type == 'MemberExpression' && code.slice(node.start, node.end).indexOf('ENV') == 0) {
						let start = node.start,
							end = node.end;
						let nkeys = [];
						while (node.object) {
							nkeys.unshift(node.property.name);
							node = node.object;
						}
						if (node.name != 'ENV') return this.skip();
						magicString.overwrite(start, end, String(JSON.stringify(nkeys.reduce((res, key) => (res ? res[key] : undefined), replaceValues))));
						this.skip();
					}
				},
			});
			const result = { code: magicString.toString() };
			if (options.sourceMap !== false && options.sourcemap !== false) result.map = magicString.generateMap({ hires: true });

			return result;
		},
	};
}

module.exports = replace;
