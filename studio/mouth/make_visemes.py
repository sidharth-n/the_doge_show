"""Cartoon viseme mouth sprites (old-show style: red lips, dark mouth, white teeth, pink tongue), supersampled PNGs with alpha.
Produces mouth/v0.png (closed) .. v4.png (wide) at 4x the placement size."""
from PIL import Image, ImageDraw, ImageFilter
import os
OUT=os.path.dirname(__file__); SS=4; W,H=int(260*SS),int(160*SS)
def mouth(open_amt, teeth=True, tongue=True, name="v"):
    im=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    cx,cy=W//2,H//2; mw=int(W*0.78); mh=int(8*SS+open_amt*(H*0.62))
    lip=(196,38,52,255); dark=(48,10,14,255)
    # outer lips (rounded, slight smile)
    d.rounded_rectangle([cx-mw//2,cy-mh//2,cx+mw//2,cy+mh//2],radius=mh//2,fill=lip)
    if open_amt>0.08:
        iw,ih=int(mw*0.86),int(mh*0.70); d.rounded_rectangle([cx-iw//2,cy-ih//2,cx+iw//2,cy+ih//2],radius=ih//2,fill=dark)
        if teeth and open_amt>0.15:
            th=int(ih*0.28); tw=int(iw*0.9); d.rounded_rectangle([cx-tw//2,cy-ih//2,cx+tw//2,cy-ih//2+th],radius=th//3,fill=(245,245,240,255))
            for i in range(1,6): x=cx-tw//2+i*tw//6; d.line([x,cy-ih//2,x,cy-ih//2+th],fill=(200,200,195,255),width=SS)
        if tongue and open_amt>0.3:
            tw2,th2=int(iw*0.55),int(ih*0.45); d.ellipse([cx-tw2//2,cy+ih//2-th2,cx+tw2//2,cy+ih//2+th2//3],fill=(230,90,120,255))
            d.rounded_rectangle([cx-iw//2,cy-ih//2,cx+iw//2,cy+ih//2],radius=ih//2,outline=dark,width=SS*3)
    # soft edge
    im=im.resize((W//SS,H//SS),Image.LANCZOS); im.save(f"{OUT}/{name}.png"); return im
for i,a in enumerate([0.0,0.25,0.5,0.75,1.0]): mouth(a,name=f"v{i}")
print("visemes written")
