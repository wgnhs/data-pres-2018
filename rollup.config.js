import minify from 'rollup-plugin-minify-es';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import resolve from 'rollup-plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';

const appDir = 'app';

function buildPlugins({dir=appDir, min=false}) {
  let result = [];
  result.push(resolve());

  if (min) {
    result.push(minifyHTML());
    result.push(minify({
      output: {
        wrap_iife: true
      }
    }));
  }
  result.push(filesize());
  return result;
}

function buildApp({dir=appDir, filename='index', min=false, format='umd'}) {
  let minifyToken = (min) ? '.min': '';
  let result = {
    input: `${dir}/${filename}.js`,
    plugins: buildPlugins({dir, min}),
    external: [
      'lit-element',
      'wgnhs-common',
      'wgnhs-styles',
      'wgnhs-layout',
      'wgnhs-pdf',
      'wgnhs-router'
    ],
    output: {
      file: `dist/${dir}/${filename}${minifyToken}.js`,
      format: format,
      name: dir,
      sourcemap: min,
      globals: {
        'lit-element': 'wgnhs-common',
        'wgnhs-common': 'wgnhs-common',
        'wgnhs-styles': 'wgnhs-common',
        'wgnhs-layout': 'wgnhs-layout',
        'wgnhs-pdf': 'wgnhs-pdf',
        'wgnhs-router': 'wgnhs-router'
      }
    }
  }
  return result;
}

export default [
  buildApp({}),
  buildApp({min: true})
];
