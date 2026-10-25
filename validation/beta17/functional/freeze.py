"""Verify installed package bytes and freeze replay files after functional checks."""
from pathlib import Path
import hashlib,json,tarfile,platform,subprocess
consumer=Path('/private/tmp/beta17-consumer')
repo=Path(__file__).resolve().parents[3]
manifest=json.loads((repo/'validation/beta17/manifest.json').read_text())
proof=[]
for artifact in manifest['artifacts']:
    archive=Path(artifact['path'])
    assert hashlib.sha256(archive.read_bytes()).hexdigest()==artifact['sha256']
    with tarfile.open(archive) as tar:
        metadata=json.load(tar.extractfile('package/package.json'))
        installed=consumer/'node_modules'/metadata['name']
        files=[]
        for member in tar:
            if not member.isfile():continue
            relative=member.name.removeprefix('package/')
            expected=tar.extractfile(member).read()
            actual=(installed/relative).read_bytes()
            assert actual==expected, f'Installed package differs: {metadata["name"]}/{relative}'
            files.append({'path':relative,'sha256':hashlib.sha256(expected).hexdigest(),'bytes':len(expected)})
        proof.append({'package':metadata['name'],'archive':artifact,'installed':str(installed),'files':files})
inputs={}
for root in [consumer/'replay-apps',consumer/'replay-dist',repo/'validation/beta17/fixtures']:
    for p in sorted(root.rglob('*')):
        if p.is_file():inputs[str(p)]=hashlib.sha256(p.read_bytes()).hexdigest()
for p in [consumer/'package.json',consumer/'package-lock.json',consumer/'handoff.json',Path(__file__).resolve().parent/'browser.mjs',Path(__file__).resolve()]:
    inputs[str(p)]=hashlib.sha256(p.read_bytes()).hexdigest()
result={'status':'bytes verified; functional acceptance is separate','environment':{'node':subprocess.check_output(['node','--version'],text=True).strip(),'platform':platform.platform()},'packages':proof,'inputs':inputs}
(consumer/'installed-proof.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'verifiedPackages':len(proof),'installedFiles':sum(len(p['files']) for p in proof),'frozenInputs':len(inputs)}))
