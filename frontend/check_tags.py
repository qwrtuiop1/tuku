import re

with open('src/views/Dashboard.vue', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'<template>(.*?)</template>', content, re.DOTALL)
if not match:
    print('No template found')
else:
    html = match.group(1)
    lines = html.split('\n')

    stack = []
    for i, line in enumerate(lines):
        clean = re.sub(r'\{.*?\}', '', line)
        clean = re.sub(r'<!--.*?-->', '', clean, flags=re.DOTALL)

        opens = re.findall(r'<([a-z][a-z0-9-]*)(?:\s[^/>]*)?[^/]>(?!/)', clean)
        for tag in opens:
            if tag in ('template', 'slot', 'component'):
                continue
            stack.append((tag, i+1))
            print(f"  OPEN  line {i+1}: <{tag}>")

        selfs = re.findall(r'<([a-z][a-z0-9-]*)[^>]*/>', clean)
        for tag in selfs:
            if tag in ('template', 'slot', 'component', 'el-icon', 'el-avatar'):
                continue
            print(f"  SELF  line {i+1}: <{tag}/>")

        closes = re.findall(r'</([a-z][a-z0-9-]*)>', clean)
        for tag in closes:
            if tag in ('template', 'slot'):
                continue
            if stack:
                top_tag, top_line = stack.pop()
                if top_tag == tag:
                    print(f"  CLOSE line {i+1}: </{tag}> (was open at {top_line})")
                else:
                    print(f"  MISMATCH: got </{tag}> at {i+1}, expected </{top_tag}> from {top_line}")
            else:
                print(f"  BAD_CLOSE: </{tag}> at {i+1}, stack empty")

    if stack:
        print(f'\nUNCLOSED ({len(stack)}):')
        for tag, line in stack:
            print(f"  <{tag}> at line {line}")
    else:
        print('\nAll properly closed!')
