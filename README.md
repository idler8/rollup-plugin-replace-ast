# rollup-plugin-replace-ast
[![](https://img.shields.io/npm/v/rollup-plugin-replace.svg?style=flat)](https://www.npmjs.com/package/rollup-plugin-replace-ast)

使用AST替换全局ENV变量，类似rollup-plugin-replace，得到的内容更加简洁


## 安装

```bash
npm install --save-dev rollup-plugin-replace-ast
```


## 用法


```javascript
// rollup.config.js
import replace from 'rollup-plugin-replace-ast';

export default {
  // ...
  plugins: [
    replace({
        mode: 'production',
        resources: { img: ['image1'], png: ['png1', { path: 'png2' }] },
    });
  ]
};
```


## 配置

```javascript
{
  // 允许的文件范围
  include: 'config.js',

  // 排除的文件范围
  exclude: 'node_modules/**',
  // 替换变量
  values: {
    version: '1.0.0',
    mode: JSON.stringify('development')
  }
  // 所有其它键都将被用来替换变量
  version: '1.0.0',
  mode: JSON.stringify('development'),

}
```


## 例子

```javascript
replace({
    mode: 'production',
    resources: { img: ['image1'], png: ['png1', { path: 'png2' }] },
});
```

源代码:

```js
const code = [
    ENV.mode,
    ENV.resources,
    ENV.resources.png[1],
    ENV.other
];
```

替换后:

```js
const code = [
    'production',
    { img: ['image1'], png: ['png1', { path: 'png2' }] },
    { path: 'png2' },
    undefined
];
```



## License

MIT