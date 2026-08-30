"""Cartoon visemes, dog-anatomy version: black lips, dark interior, pink tongue, white teeth, tilted to the dog's mouth line, feathered.
Writes studio/mouth/b/v0..v4.png. Tilt: mouth rises to the right ~6 degrees (image coords → rotate CCW)."""
from PIL import Image, ImageDraw, ImageFilter
import os
OUT=os.path.join(os.path.dirname(__file__),"b"); os.makedirs(OUT,exist_ok=True); SS=4; W,H=260*SS,180*SS; TILT=-3
def mouth(a,name):
    im=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(im); cx,cy=W//2,H//2
    mw=int(W*0.72); mh=int(6*SS+a*(H*0.55))
    lip=(28,20,22,255); inner=(92,26,34,255); tongue=(214,96,118,255); teeth=(236,232,224,255)
    d.rounded_rectangle([cx-mw//2,cy-mh//2,cx+mw//2,cy+mh//2],radius=mh//2,fill=lip)
    if a>0.08:
        iw,ih=int(mw*0.84),int(mh*0.66); d.rounded_rectangle([cx-iw//2,cy-ih//2,cx+iw//2,cy+ih//2],radius=ih//2,fill=inner)
        if a>0.15:
            th=int(ih*0.26); tw=int(iw*0.72); d.rounded_rectangle([cx-tw//2,cy-ih//2,cx+tw//2,cy-ih//2+th],radius=th//2,fill=teeth)
        if a>0.3:
            tw2,th2=int(iw*0.6),int(ih*0.5); d.ellipse([cx-tw2//2,cy+ih//2-th2,cx+tw2//2,cy+ih//2+th2//4],fill=tongue)
            d.rounded_rectangle([cx-iw//2,cy-ih//2,cx+iw//2,cy+ih//2],radius=ih//2,outline=lip,width=SS*4)
    # feather alpha edge so it melts into fur
    alpha=im.split()[3].filter(ImageFilter.GaussianBlur(SS*2.2)); im.putalpha(alpha)
    im=im.rotate(TILT,resample=Image.BICUBIC,expand=False).resize((W//SS,H//SS),Image.LANCZOS); im.save(f"{OUT}/{name}.png")
for i,a in enumerate([0,0.25,0.5,0.75,1.0]): mouth(a,f"v{i}")
Image.new("RGBA",(W//SS,H//SS),(0,0,0,0)).save(f"{OUT}/v0.png"); print("B visemes written")
