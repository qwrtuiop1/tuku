import re

with open(r'D:\QIanDuanXiangMu\tuku\frontend\src\views\Files.vue', encoding='utf-8', errors='replace') as f:
    content = f.read()

ss_pos = content.rfind('<script')
es_pos = content.find('</script>')
ss = content[ss_pos:es_pos]

# Track brace balance line by line
lines = ss.split('\n')
in_backtick = False
in_string = False
string_char = None
in_comment = False
open_braces = 0
line_num = ss_pos

brace_issues = []

for raw_line in lines:
    line = raw_line.rstrip('\r\n')
    line_num += 1
    local_line = line_num - ss_pos
    
    i = 0
    while i < len(line):
        c = line[i]
        
        # Handle comments
        if not in_backtick and not in_string and i + 1 < len(line) and line[i:i+2] == '//':
            break  # skip rest of line
        
        # Handle backtick strings
        if c == '`' and not in_string:
            in_backtick = not in_backtick
        elif c == '`' and in_backtick:
            in_backtick = False
        elif in_backtick:
            pass
        elif c in ('"', "'") and not in_backtick:
            if not in_string:
                in_string = True
                string_char = c
            elif c == string_char:
                in_string = False
                string_char = None
        elif not in_string:
            if c == '{':
                open_braces += 1
            elif c == '}':
                open_braces -= 1
                if open_braces < 0:
                    brace_issues.append(f'Line {local_line} (file {line_num}): Unmatched closing }}  count={open_braces}')
                    open_braces = 0
        
        i += 1
    
    if open_braces < 0:
        brace_issues.append(f'Line {local_line}: open_braces={open_braces}')
        open_braces = 0

if brace_issues:
    for issue in brace_issues[:20]:
        print(issue)
else:
    print('No brace issues found')

if open_braces > 0:
    print(f'WARNING: {open_braces} unclosed open braces at end of script')
    # Find where the extra braces are by scanning for functions without matching close
    # Check around the area we modified
    idx = content.find('const batchDelete = ')
    if idx >= 0:
        snippet = content[idx:idx+2000]
        print('batchDelete snippet:')
        for i, l in enumerate(snippet.split('\n')[:60]):
            print(f'  {i+1}: {repr(l[:100])}')
else:
    print(f'Balance OK: {open_braces} remaining')
