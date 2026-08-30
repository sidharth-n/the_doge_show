"""Photoreal mouth sprites v8: Poisson (seamless) clone of each edited mouth into the base still, then cut a soft-edged patch.
Because the loop's first frame == base still and the mouth region is static in the loop, a patch blended against the base is
seamless against every loop frame. Run inside the cvenv (opencv+numpy)."""
import cv2, numpy as np, json, os
A='studio/assets'; OUT='studio/mouth/a'; os.makedirs(OUT,exist_ok=True)
BOX=(1100,780,1540,1100); SC=1928/2752; ORDER=['smile','slight','half','oh','open','tongue']
LOOP=cv2.imread(f'{A}/loop-frame0.png'); H,W=LOOP.shape[:2]
base_still=cv2.imread(f'{A}/still-cap-v3.png')
base=cv2.resize(base_still,(W,H),interpolation=cv2.INTER_AREA)
SC1=W/base_still.shape[1]
ROI=tuple(int(v*1928/2752) for v in (1150,872,1480,1095)); MC=(int(1311*1928/2752),int(905*1928/2752))   # mouth search window + known mouth centre (still coords)
def mouth_mask(img):
    full=np.zeros(img.shape[:2],np.uint8); rx0,ry0,rx1,ry1=ROI; img=img[ry0:ry1,rx0:rx1]
    hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV); h,s,v=cv2.split(hsv)
    dark=(v<85).astype(np.uint8)*255
    tongue=(((h<10)|(h>170))&(s>80)&(v>100)).astype(np.uint8)*255
    m=cv2.bitwise_or(dark,tongue); m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
    # keep component nearest the box centre
    n,lab,stats,cent=cv2.connectedComponentsWithStats(m); cx,cy=MC[0]-rx0,MC[1]-ry0
    best=None
    for i in range(1,n):
        if not (1500<stats[i,cv2.CC_STAT_AREA]<90000): continue
        d=(cent[i][0]-cx)**2+(cent[i][1]-cy)**2
        if best is None or d<best[0]: best=(d,i)
    m=(lab==best[1]).astype(np.uint8)*255
    teeth=((v>190)&(cv2.dilate(m,np.ones((25,25),np.uint8))>0)).astype(np.uint8)*255
    full[ry0:ry1,rx0:rx1]=cv2.bitwise_or(m,teeth); return full
basemask=mouth_mask(base)
x0,y0,x1,y1=[int(v*SC1) for v in BOX]; bw,bh=x1-x0,y1-y0
for i,n in enumerate(ORDER):
    im=cv2.resize(cv2.imread(f'{A}/still-mouth-{n}-aligned.png'),(W,H),interpolation=cv2.INTER_AREA)
    m=mouth_mask(im)
    if i>0: m=cv2.bitwise_or(m,basemask)
    m=cv2.dilate(m,np.ones((51,51),np.uint8))            # generous margin: Poisson handles the tone, fur texture is the edit's near the lips only
    m[:y0]=0; m[y1:]=0; m[:,:x0]=0; m[:,x1:]=0
    bx,by,bwid,bhei=cv2.boundingRect(m); center=(bx+bwid//2,by+bhei//2)
    blended=cv2.seamlessClone(im,LOOP,m.copy(),center,cv2.NORMAL_CLONE)
    patch=blended[y0:y1,x0:x1]
    d=np.abs(blended.astype(int)-LOOP.astype(int)).sum(2); ys,xs=np.where(d>30); print('   changed bbox',xs.min(),ys.min(),xs.max(),ys.max()) if len(xs) else print('   no change')
    
    # alpha: the (un-dilated-by-margin) region, soft edge — outside it the base is already identical
    a=cv2.GaussianBlur(cv2.erode(m,np.ones((31,31),np.uint8))[y0:y1,x0:x1],(0,0),9)
    rgba=cv2.cvtColor(patch,cv2.COLOR_BGR2BGRA); rgba[:,:,3]=a
    from PIL import Image; Image.fromarray(cv2.cvtColor(rgba,cv2.COLOR_BGRA2RGBA)).save(f'{OUT}/v{i}.png')
    print('   alpha centre',rgba[rgba.shape[0]//2-20,rgba.shape[1]//2,3],'corner',rgba[3,3,3])
    print(i,n,'mask px',int((m>0).sum()))
json.dump({'cx':round((x0+x1)/2),'cy':round((y0+y1)/2),'w':bw,'n':len(ORDER),'order':ORDER},open(f'{OUT}/placement.json','w'))
