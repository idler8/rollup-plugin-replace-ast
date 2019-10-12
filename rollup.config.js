export default {
	input: 'src/index.js',
	output: [
		{
			file: 'dist/rollup-plugin-replace-ast.cjs.js',
			format: 'cjs',
		},
		{
			file: 'dist/rollup-plugin-replace-ast.es.js',
			format: 'es',
		},
	],
};
