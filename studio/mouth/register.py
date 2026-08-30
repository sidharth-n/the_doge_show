"""Register edited stills to the base still (scale+shift search on nose/eyes region, mouth excluded). Writes <name>-aligned.png."""
from PIL import Image, ImageChops, ImageStat
import sys,os
A='studio/assets'; base=Image.open(f'{A}/still-cap-v3.png').convert('L'); W,H=base.size; REG=(1000,500,1600,860)
def place(im,s,dx,dy,mode='L'):
    w,h=int(W*s),int(H*s); c=Image.new(mode,(W,H)); c.paste(im.resize((w,h),Image.BILINEAR if mode=='L' else Image.LANCZOS),(int((W-w)/2+dx),int((H-h)/2+dy))); return c
def score(im,s,dx,dy): return ImageStat.Stat(ImageChops.difference(base.crop(REG),place(im,s,dx,dy).crop(REG))).mean[0]
for n in sys.argv[1:]:
    if os.path.exists(f'{A}/{n}-aligned.png'): print(n,'exists'); continue
    im=Image.open(f'{A}/{n}.png').convert('L'); best=min((score(im,s,dx,dy),s,dx,dy) for s in (0.98,0.99,1.0,1.01,1.02) for dx in range(-30,31,6) for dy in range(-30,31,6))
    v,s,dx,dy=best; best=min((score(im,s2,x,y),s2,x,y) for s2 in (s-0.005,s,s+0.005) for x in range(dx-5,dx+6) for y in range(dy-5,dy+6))
    v,s,dx,dy=best; print(n,'aligned',round(v,2),s,dx,dy,'| raw',round(score(im,1,0,0),2))
    place(Image.open(f'{A}/{n}.png').convert('RGB'),s,dx,dy,'RGB').save(f'{A}/{n}-aligned.png')
