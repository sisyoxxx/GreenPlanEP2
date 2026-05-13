import re

path = r'D:\tool\aLemon\vue\GreenPlanEP2\apps\web\src\domains\buyer\api.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace: const res = await http.xxx('...') as { data: TYPE }
#          return res.data
# With:    return (await http.xxx('...')) as TYPE
pattern = r'const res = await (http\.\w+\([^)]+\)) as \{ data: ([^}]+) \}\n  return res\.data'

def repl(m):
    call = m.group(1)
    typ = m.group(2).strip()
    return f'return (await {call}) as {typ}'

content = re.sub(pattern, repl, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('done')
