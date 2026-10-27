from pathlib import Path
import re,json,hashlib,posixpath
src=Path('/private/tmp/openui-shared-base-59/packages/react-components/src/components');out=Path('/private/tmp/openui-selectors56-prep')
controls={'CheckBoxGroup','CheckBoxItem','Chips','FormControl','Input','Label','OptionCards','RadioGroup','RadioItem','Slider','SwitchGroup','SwitchItem','TextArea','ToggleGroup','ToggleItem'}
portals={'Calendar','DatePicker','Select','Modal','Citation','ImageGallery','TooltipWrapper'}
portalw2={'Citation','ImageGallery','TooltipWrapper'}
exclude={'Charts','ThemeProvider','_shared'}; pilot={'Button','IconButton'}
complexes={'EditableTable':'Defer whole family initially: editable cell keyboard/selection plus Select/DatePicker/Tooltip dependencies; table parts and editors require coordinated coverage.', 'MarkDownRenderer':'Owned wrapper/link/code/table and deliberate descendant rules remain eligible. Vendor syntax-highlighter/KaTeX token DOM/inline themes are the specific deferred area; not a whole-family skip.', 'InlineMarkdownRenderer':'Owned inline wrapper, markdown descendant scope, p and direct-child layout rules remain eligible; coordinate MarkDownRenderer. Defer only vendor internals, not existing owned selectors.', 'Calendar':'Portal batch with Select: directly imports contentClass/viewportClass; react-day-picker classNames and custom dropdowns require dependency-first conversion.', 'Skeleton':'SkeletonBar and stack ordinary styles are eligible. Inspect TableSkeleton/PieChartSkeleton shape areas separately; only specifically justified shapes may be deferred. Private keyframe identifiers alone are not a deferral reason.', 'TextBlock':'Owned root/size/type/alignment/tone/variant rules are eligible; preserve InlineMarkdownRenderer dependency. Vendor internals only are excluded from any transitive guarantee.', 'SourceFaviconImage':'Successful img root openui-source-favicon-image with object-fit/display is eligible. Empty URL/error branch renders shared IconWrapper without this hook: leave fallback behavior/icons unchanged and do not document the image hook as a fallback-icon hook.'}
rows=[];allfiles={};deps=[]
for folder in sorted(src.iterdir()):
 if not folder.is_dir():continue
 family=folder.name
 if family in exclude:continue
 files=[p for p in sorted(folder.rglob('*')) if p.is_file() and p.suffix in {'.ts','.tsx'}]
 hooks={};states={};imports=[];generated=[];directportal=[]
 for p in files:
  text=p.read_text();rel=str(p.relative_to(src.parent));allfiles[rel]=hashlib.sha256(p.read_bytes()).hexdigest()
  for n,line in enumerate(text.splitlines(),1):
   for hook in re.findall(r'(?<![-\w])(?:openui-[A-Za-z0-9_-]+|text-content(?:-[A-Za-z0-9_-]+)?)(?![\w-])',line):hooks.setdefault(hook,[]).append({'file':rel,'line':n,'context':line.strip()})
   for state in re.findall(r':(?:hover|active|focus-visible|focus-within|focus|disabled|checked|indeterminate|read-only)|\[(?:data-|aria-)[^\]]+\]',line):states.setdefault(state,[]).append({'file':rel,'line':n})
   if re.search(r'createPortal\(|<[\w.]*Portal\b',line):directportal.append({'file':rel,'line':n,'context':line.strip()})
   if re.search(r'css`|css\(',line):generated.append({'file':rel,'line':n,'context':line.strip()})
  for imp in re.findall(r'from\s+["\']([^"\']+)["\']',text):
   if imp.startswith('.'):
    target=posixpath.normpath(posixpath.join(str(p.parent.relative_to(src)),imp)).split('/')[0]
    if target!=family and not target.startswith('..'):imports.append(target);deps.append({'fromFamily':family,'file':rel,'import':imp,'targetFamily':target})
 if family in pilot:ticket=61;owner='W1'
 elif family in portals:ticket=64;owner='W2' if family in portalw2 else 'W1'
 elif family in controls:ticket=62;owner='W1'
 else:ticket=63;owner='W2'
 rows.append({'family':family,'ticket':ticket,'proposedOwner':owner,'status':'source-only candidate; not converted','files':[str(p.relative_to(src.parent)) for p in files],'observedHooks':hooks,'observedStateSelectors':states,'crossFamilyImports':sorted(set(imports)),'directPortalSites':directportal,'generatedStyleCalls':generated,'complexException':complexes.get(family),'hookNotes':'Observed strings are candidates, not an approved public hook contract. Full contexts preserve roots/parts/variants/states for manual review; dynamic prefixes require completion.'})
for f in sorted((src/'_shared').rglob('*.ts*')):
 if f.is_file():allfiles[str(f.relative_to(src.parent))]=hashlib.sha256(f.read_bytes()).hexdigest()
(out/'inventory.json').write_text(json.dumps({'baseCommit':'c1aaf994d5c0fbfb56b83685221eeea9b409e57c','status':'source-only; accepted60 source identical to inspected59; accepted61 still required','families':rows,'crossFamilyDependencies':deps,'sourceSha256':allfiles},indent=2)+'\n')
with (out/'ownership.tsv').open('w') as f:
 f.write('ticket\tproposed_owner\tfamily\tfiles\thooks\tstate_selectors\tportal_sites\tcomplex_review\n')
 for r in rows:f.write('\t'.join(map(str,[r['ticket'],r['proposedOwner'],r['family'],len(r['files']),len(r['observedHooks']),len(r['observedStateSelectors']),len(r['directPortalSites']),r['complexException'] or '-']))+'\n')
with(out/'hooks.md').open('w') as f:
 f.write('# Observed stable-hook candidates\n\nSource strings only; root/part/variant/state contracts must be reviewed and documented per conversion. No class is counted as an effective selector merely because it occurs in JSX. Full line-numbered contexts and state selectors: inventory.json.\n\n| Ticket/owner | Family | Observed hooks (sample) | States (sample) |\n| --- | --- | --- | --- |\n')
 for r in rows:
  hook=sorted(r['observedHooks'],key=lambda h:(len(h),h));f.write('| #'+str(r['ticket'])+'/'+r['proposedOwner']+' | '+r['family']+' | '+', '.join('`'+h+'`' for h in hook[:6])+' | '+', '.join('`'+s+'`' for s in list(r['observedStateSelectors'])[:4])+' |\n')
print(json.dumps({'families':len(rows),'byTicket':{str(t):sum(r['ticket']==t for r in rows) for t in [61,62,63,64]},'fileHashes':len(allfiles),'directPortalFamilies':[r['family'] for r in rows if r['directPortalSites']]},indent=2))
