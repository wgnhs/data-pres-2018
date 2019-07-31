import minify from 'rollup-plugin-minify-es';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import resolve from 'rollup-plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';

const commonDir = 'js';
const appDir = 'app';
const litDir = 'lit';

function buildPlugins({dir=litDir, min=false}) {
  let result = [];
  result.push(resolve());

  if (min) {
    if (dir === litDir) {
      result.push(minifyHTML());
    }
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
      '@uirouter/core'
    ],
    output: {
      file: `dist/${dir}/${filename}${minifyToken}.js`,
      format: format,
      name: filename,
      sourcemap: min,
      globals: {
        'lit-element': 'common',
        '@uirouter/core': 'common'
      }
    }
  }
  return result;
}

function buildCommon({dir=commonDir, filename='common', min=false, format='umd'}) {
  let minifyToken = (min) ? '.min': '';
  let result = {
    input: `${dir}/${filename}.js`,
    plugins: buildPlugins({dir, min}),
    output: {
      file: `dist/${dir}/${filename}${minifyToken}.js`,
      format: format,
      name: filename,
      sourcemap: min
    }
  }
  return result;
}


export default [
  buildCommon({}),
  buildCommon({min: true}),
  buildApp({}),
  buildApp({min: true}),
  buildApp({dir: litDir}),
  buildApp({dir: litDir, min: true})
];
