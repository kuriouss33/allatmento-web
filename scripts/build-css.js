const fs = require('fs');
const path = require('path');
const loader = require('@tailwindcss/turbopack');

const globalsCssPath = path.resolve(__dirname, '../src/app/globals.css');
const outCssPath = path.resolve(__dirname, '../src/styles/tailwind-built.css');
const css = fs.readFileSync(globalsCssPath, 'utf-8');

fs.mkdirSync(path.dirname(outCssPath), { recursive: true });

const fakeContext = {
  async: () => (err, res) => {
    if (err) {
      console.error('Tailwind compilation error:', err);
      process.exit(1);
    }
    fs.writeFileSync(outCssPath, res);
    console.log(`[CSS Builder] tailwind-built.css updated successfully (${res.length} bytes)`);
  },
  getOptions: () => ({ base: path.resolve(__dirname, '..'), optimize: process.env.NODE_ENV === 'production' }),
  resourcePath: globalsCssPath,
  resource: globalsCssPath,
  addDependency: () => {},
  addContextDependency: () => {}
};

loader.call(fakeContext, css);
