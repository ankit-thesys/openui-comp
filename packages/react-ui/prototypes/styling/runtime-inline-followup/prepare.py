"""Make a new scratch copy; never overwrite measured evidence or existing destinations."""
from pathlib import Path
import shutil, sys
source = Path(__file__).resolve().parent
if len(sys.argv) != 2:
    raise SystemExit('Usage: python3 prepare.py /absolute/new/scratch/directory')
dest = Path(sys.argv[1]).resolve()
if dest.exists():
    raise SystemExit('Destination already exists; choose a fresh directory.')
ignore = shutil.ignore_patterns('node_modules', '.next', 'generated.jsx', '*.cjs', '*.map', '__pycache__')
dest.mkdir(parents=True)
for name in ['inline-next', 'cascade-research']:
    shutil.copytree(source / name, dest / name, ignore=ignore)
shutil.copytree(source.parent / 'runtime-detailed', dest / 'runtime-detailed', ignore=ignore)
replacements = {
    '/private/tmp/openui-runtime-inline-next': str(dest / 'inline-next'),
    '/private/tmp/openui-runtime-cascade-research': str(dest / 'cascade-research'),
    '/private/tmp/openui-runtime-detailed': str(dest / 'runtime-detailed'),
}
for p in dest.rglob('*'):
    if p.is_file() and p.suffix in {'.mjs', '.js', '.tsx', '.ts', '.jsx'}:
        text = p.read_text()
        for old, new in replacements.items():
            text = text.replace(old, new)
        p.write_text(text)
print(dest)
