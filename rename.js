const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        filelist = walkSync(path.join(dir, file), filelist);
      }
    } else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const replacements = [
  { from: /@agentic-js\//g, to: '@aipjs/' },
  { from: /agentic-js/g, to: 'aip.js' },
  { from: /AgenticJS/g, to: 'AIP' },
  { from: /agentic:/g, to: 'aip:' },
  { from: /data-agentic-/g, to: 'data-aip-' },
  { from: /const agentic = /g, to: 'const aip = ' },
  { from: /agentic\./g, to: 'aip.' }
];

const files = walkSync(__dirname);

files.forEach(file => {
  if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.json') || file.endsWith('.md') || file.endsWith('.html')) {
    if (file === __filename) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  }
});
