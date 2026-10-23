"""Create a new runnable scratch copy; never edit frozen evidence in place."""
from pathlib import Path
import sys, shutil, hashlib, json, os
archive=Path(__file__).resolve().parent
if len(sys.argv)!=2:raise SystemExit('Usage: python3 prepare-scratch.py /absolute/new/scratch-directory')
dest=Path(sys.argv[1]).resolve()
if dest.exists():raise SystemExit('Destination already exists; use a new directory')
manifest=json.loads((archive/'PRESERVED-SHA256.json').read_text())
for name,digest in manifest.items():
 if hashlib.sha256((archive/name).read_bytes()).hexdigest()!=digest:raise SystemExit('Archive changed: '+name)
shutil.copytree(archive,dest)
original='/private/tmp/openui-stock-goober'
frameworks='/private/tmp/openui-runtime-cascade-research/frameworks'
for scope in ['components','chat','next']:
 for f in (dest/scope).rglob('*'):
  if not f.is_file() or 'results' in f.parts or f.suffix not in {'.tsx','.ts','.jsx','.js','.mjs','.cjs'}:continue
  text=f.read_text().replace(original,str(dest)).replace(frameworks,str(dest/'frameworks'))
  f.write_text(text)
for name in ['stock-controls.cjs','browser-check.mjs']:
 f=dest/name;f.write_text(f.read_text().replace(original,str(dest)))
node_modules=Path('/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling/next-fixture/node_modules')
if node_modules.exists():os.symlink(str(node_modules),dest/'next/node_modules')
print('Verified frozen archive and prepared',dest)
print('Workspace source and recorded existing dependencies remain prerequisites; no dependency upgrades are installed.')
