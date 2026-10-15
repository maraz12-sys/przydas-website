from pathlib import Path
from html.parser import HTMLParser
import json,re,sys
s=Path(sys.argv[1]).read_text()
assert s.startswith('<!doctype html>')
assert '{{' not in s
assert 'chatgpt.site' not in s and 'signin-with-chatgpt' not in s
assert s.count('data-package-id=')==8
m=re.search(r'window\.AnimilandiaBirthday=(.*?);</script>',s)
assert m
config=json.loads(m.group(1))
assert config['tokenUrl']=='/index.php?rest_route=/animilandia-birthday/v1/token'
assert config['submitUrl']=='/index.php?rest_route=/animilandia-birthday/v1/inquiries'
assert len(config['packages'])==8
class P(HTMLParser):
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='img':assert a.get('src','').startswith('https://animilandia.pl/'),a
P().feed(s)
print('PASS: independent rendered HTML, 8 packages, own-host images and own REST endpoints.')
