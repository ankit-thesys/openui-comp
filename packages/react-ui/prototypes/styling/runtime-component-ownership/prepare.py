"""Prepare a fresh, machine-local rerun; never overwrite evidence or fetch deps."""
from pathlib import Path
import shutil,sys
source=Path(__file__).resolve().parent
if len(sys.argv)!=2: raise SystemExit('Usage: python3 prepare.py /absolute/new/scratch')
dest=Path(sys.argv[1]).resolve()
if dest.exists(): raise SystemExit('Choose a fresh destination')
dest.mkdir()
ignore=shutil.ignore_patterns('node_modules','.next','*.map','__pycache__')
mapping={}
for name in ['components','chat','performance']:
 target=dest/('openui-runtime-owned-'+name)
 shutil.copytree(source/name,target,ignore=ignore)
 mapping['/private/tmp/openui-runtime-owned-'+name]=str(target)
report=dest/'openui-runtime-standard-optimization';report.mkdir()
for p in source.iterdir():
 if p.name in ['components','chat','performance','PRESERVED-SHA256.json']: continue
 if p.is_dir(): shutil.copytree(p,report/p.name,ignore=ignore)
 else: shutil.copy2(p,report/p.name)
mapping['/private/tmp/openui-runtime-standard-optimization']=str(report)
extras={
 'openui-runtime-expanded-components':source.parent/'runtime-expanded/components',
 'openui-runtime-detailed':source.parent/'runtime-detailed',
 'openui-runtime-cascade-research':source.parent/'runtime-inline-followup/cascade-research',
}
for name,old in extras.items():
 shutil.copytree(old,dest/name,ignore=ignore)
 mapping['/private/tmp/'+name]=str(dest/name)
for p in dest.rglob('*'):
 if p.is_file() and 'results' not in p.parts and p.suffix in {'.mjs','.js','.tsx','.ts','.jsx','.py'}:
  text=p.read_text()
  for old,new in mapping.items(): text=text.replace(old,new)
  p.write_text(text)
next_deps=Path('/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling/next-fixture/node_modules')
if next_deps.exists(): (dest/'openui-runtime-owned-chat/next/node_modules').symlink_to(next_deps.resolve(),target_is_directory=True)
print(dest)
