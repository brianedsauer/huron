const path = require('path');
const fs = require('fs');
const cwd = process.cwd();

export default function requireTemplates(config) {
  const huron = config.huron;
  const templatePathArray = [];
  const templateIds = [];
  const templates = fs.readdirSync(path.join(huron.root, huron.templates));
  const huronScript = fs.readFileSync(path.resolve(__dirname, '../js/huron.js'));
  const outputPath = path.join(huron.root, 'js');

  try {
    fs.accessSync(outputPath, fs.F_OK);
  } catch (e) {
    fs.mkdirSync(outputPath);
  }

  // Generate a list of paths and IDs for all templates
  templates.forEach(file => {
    if (file.indexOf('.html') >= 0) {
      templatePathArray.push(
        `'${path.resolve(cwd, huron.root, huron.templates, file)}'`
      );
      templateIds.push(file.replace('.html', ''));
    }
  });

  // Initialize templates, js, css and HMR acceptance logic
  const prependScript = [
    `const templates = {};`,
    `const css = []`,
    `const js = []`,
    `if (module.hot) {`,
      `module.hot.accept(`,
        `[${templatePathArray}],`,
        `update => {`,
          `let updatedModules = Object.keys(update);`,
          `if (updatedModules.length) {`,
            `let template = __webpack_require__(update[updatedModules[0]][0]);`,
            `templateReplaceCallback(template);`,
          `}`,
        `}`,
      `);`,
    `}`,
  ];

  // Generate templates object using template IDs as keys
  templatePathArray.forEach((template, idx) => {
    prependScript.push(
      `templates['${templateIds[idx]}'] = require(${template});`
    );
  });

  if (huron.css && huron.css.length) {
    huron.css.forEach((css) => {
      prependScript.push(
        `css.push(require('${path.join(huron.root, css)}'));`
      )
    });
  }

  fs.writeFileSync(
    path.join(outputPath, 'huron.js'),
    [
      prependScript.join('\n'),
      huronScript,
    ].join('\n')
  );
}