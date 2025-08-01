import esbuild from 'rollup-plugin-esbuild';
import resolve from '@rollup/plugin-node-resolve';
import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';

const importMetaUrlCurrentModulePlugin = () => {
  return {
    name: 'import-meta-url-current-module',
    resolveImportMeta(property, { moduleId }) {
      if (property === 'url') {
        return `new URL('${path.relative(process.cwd(), moduleId)}', document.baseURI).href`;
      }
      return null;
    }
  };
};

const config = {
  input: 'src_ts/app-shell.ts',
  output: {
    file: 'src/src/app-shell.js',
    format: 'es',
    inlineDynamicImports: true,
    sourcemap: true,
    compact: true,
  },
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    warn(warning);
  },
  plugins: [importMetaUrlCurrentModulePlugin(), resolve(), commonjs(), esbuild(), dynamicImportVars()],
  preserveEntrySignatures: false
};

export default config;
