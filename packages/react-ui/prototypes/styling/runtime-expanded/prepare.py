"""Copy frozen evidence to a new scratch directory for reruns."""
from pathlib import Path
import shutil, sys
source = Path(__file__).resolve().parent
if len(sys.argv) != 2:
    raise SystemExit('Usage: python3 prepare.py /absolute/new/scratch/directory')
dest = Path(sys.argv[1]).resolve()
if dest.exists():
    raise SystemExit('Destination exists; choose a fresh directory.')
dest.mkdir(parents=True)
ignore = shutil.ignore_patterns('node_modules', '.next', '*.map', '*.cjs', 'generated.jsx', '__pycache__')
for name in ['components', 'chat', 'performance']:
    shutil.copytree(source / name, dest / ('openui-runtime-expanded-' + name), ignore=ignore)
report = dest / 'openui-runtime-expanded-report'
report.mkdir()
shutil.copy2(source / 'audit-bundle.mjs', report / 'audit-bundle.mjs')
shutil.copytree(source.parent / 'runtime-detailed', dest / 'openui-runtime-detailed', ignore=ignore)
shutil.copytree(source.parent / 'runtime-inline-followup' / 'cascade-research', dest / 'openui-runtime-cascade-research', ignore=ignore)
replacements = { '/private/tmp/' + name: str(dest / name) for name in [
    'openui-runtime-expanded-components', 'openui-runtime-expanded-chat',
    'openui-runtime-expanded-performance', 'openui-runtime-expanded-report',
    'openui-runtime-detailed', 'openui-runtime-cascade-research',
] }
for p in dest.rglob('*'):
    if p.is_file() and p.suffix in {'.mjs', '.js', '.tsx', '.ts', '.jsx', '.py'}:
        text = p.read_text()
        for old, new in replacements.items():
            text = text.replace(old, new)
        p.write_text(text)
print(dest)
