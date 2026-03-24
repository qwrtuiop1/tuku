const fs = require('fs');
const vue = fs.readFileSync('D:/QIanDuanXiangMu/tuku/frontend/src/views/Files.vue');
const vueStr = vue.toString('utf8');
const scriptEnd = vueStr.indexOf('</script>');
const scriptStart = vueStr.lastIndexOf('<script', scriptEnd);
const ss = vueStr.slice(scriptStart, scriptEnd);

let openBraces = 0, openParens = 0, openBrackets = 0, inBacktick = false, inQuote = null;
let issue = null;
for (let i = 0; i < ss.length; i++) {
  const c = ss[i];
  if (inBacktick) { if (c === '`') inBacktick = false; continue; }
  if (inQuote) { if (c === inQuote) inQuote = null; continue; }
  if (c === '`') inBacktick = true;
  else if (c === '"' || c === "'") inQuote = c;
  else if (c === '{') openBraces++;
  else if (c === '}') openBraces--;
  else if (c === '(') openParens++;
  else if (c === ')') openParens--;
  else if (c === '[') openBrackets++;
  else if (c === ']') openBrackets--;
  if (openBraces < 0) { const line = ss.slice(0, i).split('\n').length; issue = 'Unmatched } at line ' + line; break; }
  if (openParens < 0) { const line = ss.slice(0, i).split('\n').length; issue = 'Unmatched ) at line ' + line; break; }
}
if (!issue) {
  if (inBacktick) issue = 'Unclosed backtick at EOF';
  else if (inQuote) issue = 'Unclosed quote at EOF';
  else if (openBraces > 0) issue = 'Open braces at EOF: ' + openBraces;
  else if (openParens > 0) issue = 'Open parens at EOF: ' + openParens;
  else if (openBrackets > 0) issue = 'Open brackets at EOF: ' + openBrackets;
  else issue = 'All balanced';
}
console.log(issue);
