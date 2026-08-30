"""Photoreal mouth sprites v6: mask = the MOUTH ONLY (black lips, dark interior, pink tongue, white teeth) detected in the
edit itself; fur is never replaced, so there is no seam through fur. Exports at loop scale + placement.json."""
from PIL import Image, ImageChops, ImageFilter, ImageDraw
import os,json
A='studio/assets'; OUT='studio/mouth/a'; os.makedirs(OUT,exist_ok=True)
BOX=(1100,780,1540,1100); SC=1928/2752
base=Image.open(f'{A}/still-cap-v3.png').convert('RGB').crop(BOX); bw,bh=base.size
ORDER=['smile','slight','half','oh','open','tongue']
guard=Image.new('L',(bw,bh),0); ImageDraw.Draw(guard).ellipse((30,40,bw-30,bh-20),fill=255); guard=guard.filter(ImageFilter.GaussianBlur(6))
def keep_blob(m, seed):
    """keep only the connected component of mask m containing seed (BFS on a 1/4 scale copy)."""
    sm=m.resize((m.width//4,m.height//4),Image.NEAREST); px=sm.load(); w,h=sm.size
    sx,sy=seed[0]//4,seed[1]//4
    # find nearest set pixel to seed
    best=None
    for y in range(h):
        for x in range(w):
            if px[x,y]>127 and (best is None or (x-sx)**2+(y-sy)**2<best[0]): best=((x-sx)**2+(y-sy)**2,x,y)
    if best is None: return m
    keep=set(); stack=[(best[1],best[2])]
    while stack:
        x,y=stack.pop()
        if (x,y) in keep or x<0 or y<0 or x>=w or y>=h or px[x,y]<=127: continue
        keep.add((x,y)); stack+= [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]
    out=Image.new('L',(w,h),0); op=out.load()
    for (x,y) in keep: op[x,y]=255
    return ImageChops.multiply(m,out.resize(m.size,Image.BILINEAR).filter(ImageFilter.MaxFilter(9)))
def mouth_mask(im):
    hsv=im.convert('HSV'); H,S,V=hsv.split()
    dark=V.point(lambda p:255 if p<85 else 0)                                            # black lips / interior
    tongue=ImageChops.multiply(ImageChops.multiply(H.point(lambda p:255 if (p<14 or p>236) else 0), S.point(lambda p:255 if p>80 else 0)), V.point(lambda p:255 if p>100 else 0))
    m=ImageChops.lighter(dark,tongue).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(5))   # close teeth gaps
    m=keep_blob(m,(bw//2,bh//2-20))
    teeth=ImageChops.multiply(V.point(lambda p:255 if p>190 else 0), m.filter(ImageFilter.MaxFilter(15)))   # bright pixels inside lips = teeth
    m=ImageChops.lighter(m,teeth).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.4))
    return ImageChops.multiply(m,guard)
for i,n in enumerate(ORDER):
    im=Image.open(f'{A}/still-mouth-{n}-aligned.png').convert('RGB').crop(BOX)
    m=mouth_mask(im)
    if i>0: m=ImageChops.lighter(m,mouth_mask(base))      # base closed lip line always covered when open
    sp=im.copy(); sp.putalpha(m); sp=sp.resize((round(bw*SC),round(bh*SC)),Image.LANCZOS); sp.save(f'{OUT}/v{i}.png')
    print(i,n,'coverage',round(sum(m.get_flattened_data() if hasattr(m,'get_flattened_data') else m.getdata())/255/(bw*bh),3))
cx=round((BOX[0]+BOX[2])/2*SC); cy=round((BOX[1]+BOX[3])/2*SC)
json.dump({'cx':cx,'cy':cy,'w':round(bw*SC),'n':len(ORDER),'order':ORDER},open(f'{OUT}/placement.json','w')); print('place',cx,cy)
