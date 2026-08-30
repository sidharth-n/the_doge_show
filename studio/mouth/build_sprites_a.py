"""Photoreal mouth sprites from registered edits. Mask = where the edit differs from the base (dilated + feathered),
so cut edges sit on identical pixels (no halo) and the whole mouth/tongue is always inside. Exports at loop scale."""
from PIL import Image, ImageChops, ImageFilter, ImageDraw
import os,json
A='studio/assets'; OUT='studio/mouth/a'; os.makedirs(OUT,exist_ok=True)
BOX=(1100,780,1540,1100); SC=1928/2752
base=Image.open(f'{A}/still-cap-v3.png').convert('RGB').crop(BOX)
ORDER=['smile','slight','half','oh','open','tongue']  # v0..v5 by openness
bw,bh=base.size; guard=Image.new('L',(bw,bh),0); ImageDraw.Draw(guard).ellipse((10,10,bw-10,bh-10),fill=255); guard=guard.filter(ImageFilter.GaussianBlur(10))
for i,n in enumerate(ORDER):
    im=Image.open(f'{A}/still-mouth-{n}-aligned.png').convert('RGB').crop(BOX)
    # low-frequency colour match: im *= blur(base)/blur(im), so fur tone equals the base while mouth detail stays
    bb=base.filter(ImageFilter.GaussianBlur(28)); ib=im.filter(ImageFilter.GaussianBlur(28))
    px=im.load(); pb=bb.load(); pi=ib.load()
    for y in range(bh):
        for x in range(bw):
            r,g,b=px[x,y]; R,G,B=pb[x,y]; r2,g2,b2=pi[x,y]
            px[x,y]=(min(255,int(r*min(1.25,max(0.8,R/max(1,r2))))),min(255,int(g*min(1.25,max(0.8,G/max(1,g2))))),min(255,int(b*min(1.25,max(0.8,B/max(1,b2))))))
    d=ImageChops.difference(base,im).convert('L').filter(ImageFilter.GaussianBlur(3))  # computed AFTER colour match
    m=d.point(lambda p:255 if p>26 else 0).filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(8))
    m=ImageChops.multiply(m,guard)
    sp=im.copy(); sp.putalpha(m); sp=sp.resize((round(bw*SC),round(bh*SC)),Image.LANCZOS); sp.save(f'{OUT}/v{i}.png')
    print(i,n,'mask coverage',round(sum(m.getdata())/255/(bw*bh),3))
cx=round((BOX[0]+BOX[2])/2*SC); cy=round((BOX[1]+BOX[3])/2*SC); w=round(bw*SC)
json.dump({'cx':cx,'cy':cy,'w':w,'n':len(ORDER),'order':ORDER},open(f'{OUT}/placement.json','w')); print('place',cx,cy,w)
