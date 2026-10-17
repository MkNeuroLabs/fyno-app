import re,sys,json,html
X=sys.argv[1]
d=open(X+'/word/document.xml',encoding='utf8').read()
rels=dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"',open(X+'/word/_rels/document.xml.rels',encoding='utf8').read()))
body=d[d.index('<w:body>'):]
out=[]
for m in re.finditer(r'<w:tbl>.*?</w:tbl>|<w:p[ >].*?</w:p>',body,re.S):
    blk=m.group(0)
    if blk.startswith('<w:tbl>'):
        out.append({'tabla':True,'texto':' | '.join(''.join(re.findall(r'<w:t[^>]*>([^<]*)',c)) for c in re.findall(r'<w:tc>.*?</w:tc>',blk,re.S))})
        continue
    p=blk
    st=re.search(r'<w:pStyle w:val="([^"]+)"',p); num=re.search(r'<w:ilvl w:val="(\d)"/>.*?<w:numId w:val="(\d+)"',p,re.S)
    ind=re.search(r'<w:ind [^>]*w:(?:left|start)="(\d+)"',p); jc=re.search(r'<w:jc w:val="(\w+)"',p)
    segs=[]
    for r in re.finditer(r'<w:hyperlink[^>]*?(?:r:id="(rId\d+)")?[^>]*>(.*?)</w:hyperlink>|<w:r[ >].*?</w:r>',p,re.S):
        if r.group(0).startswith('<w:hyperlink'):
            t=''.join(html.unescape(x) for x in re.findall(r'<w:t[^>]*>([^<]*)',r.group(2)))
            segs.append(('LINK',t,rels.get(r.group(1))))
        else:
            rr=r.group(0); t=''.join(html.unescape(x) for x in re.findall(r'<w:t[^>]*>([^<]*)',rr))
            if 'r:embed' in rr: segs.append(('IMG',rels[re.search(r'r:embed="(rId\d+)"',rr).group(1)]))
            if '<w:tab/>' in rr: t='\t'+t
            if t:
                b='<w:b/>' in rr or '<w:b w:val="1"/>' in rr; i='<w:i/>' in rr
                segs.append(((('B' if b else '')+('I' if i else '')) or 'T',t))
    out.append({'st':st.group(1) if st else '', 'lista':num.groups() if num else None,'ind':ind.group(1) if ind else '','jc':jc.group(1) if jc else '','segs':segs})
json.dump(out,open(sys.argv[2],'w',encoding='utf8'),ensure_ascii=False)
for k,o in enumerate(out):
    if o.get('tabla'): print(k,'TABLA',o['texto'][:150]); continue
    s=''.join(('[IMG '+x[1].split('/')[-1]+']') if x[0]=='IMG' else ('{'+x[1]+' -> '+str(x[2])+'}') if x[0]=='LINK' else ('*'+x[1]+'*' if 'B' in x[0] else x[1]) for x in o['segs'])
    if not s.strip(): continue
    print(k,o['st'],('L'+'/'.join(o['lista'])) if o['lista'] else '',('ind'+o['ind']) if o['ind'] else '',o['jc'],'|',s[:170])
