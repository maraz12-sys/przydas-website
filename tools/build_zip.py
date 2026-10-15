from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import re
root=Path(__file__).resolve().parents[1]
plugin=root/'animilandia-urodziny'
source=(plugin/'animilandia-urodziny.php').read_text()
version=re.search(r'\* Version: ([0-9.]+)',source).group(1)
assert "const VERSION = '"+version+"';" in source
output=root/f'Animilandia_Urodziny_{version}.zip'
with ZipFile(output,'w',ZIP_DEFLATED,compresslevel=9) as z:
 for file in sorted(plugin.rglob('*')):
  if file.is_file():z.write(file,file.relative_to(root).as_posix())
 z.write(root/'README.md','animilandia-urodziny/README.md')
print(output)
print('Bytes:',output.stat().st_size)
