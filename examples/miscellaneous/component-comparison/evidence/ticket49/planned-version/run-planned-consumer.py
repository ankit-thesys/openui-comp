import subprocess,pathlib,json,shutil
r=pathlib.Path('/private/tmp/ticket49-release-verification');a=r/'planned-artifacts';a.mkdir(exist_ok=True);c=r/'planned-consumer';c.mkdir(exist_ok=True);lp=r/'planned-consumer-commands.json';log=json.loads(lp.read_text()) if lp.exists() else []
def run(cmd,cwd):
 p=subprocess.run(cmd,cwd=cwd,text=True,capture_output=True);log.append({'command':cmd,'cwd':str(cwd),'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr});lp.write_text(json.dumps(log,indent=2));print(cmd,p.returncode,p.stdout[-500:],p.stderr[-500:],flush=True);return p
p=run(['pnpm','pack','--pack-destination',str(a)],r/'workspace/packages/kits/chat');assert p.returncode==0
m=json.loads(pathlib.Path('/private/tmp/ticket47-consumer/package.json').read_text());m['name']='ticket49-planned-consumer';m['packageManager']='pnpm@10.33.0';m['dependencies']['@openuidev/chat-kit']='file:'+str(a/'openuidev-chat-kit-0.0.0.tgz');(c/'package.json').write_text(json.dumps(m,indent=2))
for f in ['types.mts','types.cts']:shutil.copyfile(pathlib.Path('/private/tmp/ticket47-consumer')/f,c/f)
p=run(['pnpm','install','--offline','--ignore-scripts','--strict-peer-dependencies'],c);assert p.returncode==0
