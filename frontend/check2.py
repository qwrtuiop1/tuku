with open(r'D:\QIanDuanXiangMu\tuku\frontend\src\views\Files.vue', encoding='utf-8', errors='replace') as f:
    content = f.read()

ss_pos = content.rfind('<script')
es_pos = content.find('</script>')
ss = content[ss_pos:es_pos]

braces = {'{':0, '}':0}
counts = {'(':0, ')':0, '[':0, ']':0}
lines = ss.split('\n')
in_str = False
str_char = None

for lineno, raw_line in enumerate(lines):
    line = raw_line.rstrip('\r\n')
    i = 0
    while i < len(line):
        c = line[i]
        if in_str:
            if c == str_char:
                in_str = False
                str_char = None
            i += 1
            continue
        if c in ('"', "'"):
            in_str = True
            str_char = c
            i += 1
            continue
        # skip // comments
        if i + 1 < len(line) and line[i] == '/' and line[i+1] == '/':
            break
        if c in braces:
            braces[c] += 1
        elif c in counts:
            counts[c] += 1
        i += 1

print('Brace counts:', braces)
print('Paren counts:', counts)
print('Brace balance { open=', braces['{'] - braces['}'])
print('Paren balance ( open=', counts['('] - counts[')'])
