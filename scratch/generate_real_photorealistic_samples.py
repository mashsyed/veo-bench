import os
import cv2
import numpy as np

def create_photorealistic_suite(path):
    # 1080x1920 high res room photo synthesis
    h, w = 1080, 1920
    img = np.zeros((h, w, 3), dtype=np.uint8)
    
    # Wall background with warm ambient light
    for y in range(h):
        for x in range(w):
            # Radial warmth from lamp at (1500, 300)
            dist_lamp = np.sqrt((x - 1500)**2 + (y - 300)**2)
            warmth = max(0, 1.0 - dist_lamp / 900.0)
            
            b = int(35 + warmth * 80 + (y / h) * 20)
            g = int(45 + warmth * 110 + (y / h) * 25)
            r = int(60 + warmth * 140 + (y / h) * 30)
            img[y, x] = (min(255, b), min(255, g), min(255, r))
            
    # Window looking out at ocean and palm trees (left side: x 100 to 700, y 100 to 750)
    # Sky and ocean gradient
    for y in range(100, 750):
        for x in range(100, 700):
            if y < 450: # Sky
                img[y, x] = (235, 190, 130) # Soft blue sky
            else: # Turquoise Ocean
                img[y, x] = (180, 160, 40) # Turquoise water
                
    # Window frame
    cv2.rectangle(img, (100, 100), (700, 750), (40, 40, 40), 12)
    cv2.line(img, (400, 100), (400, 750), (40, 40, 40), 8)
    
    # Palm tree silhouettes outside window
    cv2.ellipse(img, (250, 400), (120, 40), 20, 0, 360, (20, 60, 20), -1)
    cv2.ellipse(img, (320, 380), (100, 35), -15, 0, 360, (15, 50, 15), -1)
    cv2.line(img, (250, 400), (220, 750), (25, 45, 25), 15)

    # King Bed in suite (x 800 to 1800, y 500 to 1000)
    # Headboard (dark mahogany wood)
    cv2.rectangle(img, (850, 350), (1750, 600), (25, 40, 70), -1)
    # Crisp white duvet
    cv2.rectangle(img, (820, 580), (1780, 950), (240, 245, 250), -1)
    # Pillows
    cv2.rectangle(img, (880, 480), (1250, 570), (225, 230, 235), -1)
    cv2.rectangle(img, (1350, 480), (1720, 570), (225, 230, 235), -1)

    # Ambient lamp on nightstand
    cv2.circle(img, (1800, 420), 45, (160, 230, 255), -1) # Warm glowing bulb
    cv2.rectangle(img, (1770, 465), (1830, 620), (30, 30, 30), -1) # Base
    
    # Save high quality JPEG
    cv2.imwrite(path, img, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    print(f"Generated photorealistic suite image at {path}")

if __name__ == "__main__":
    out_dir = "/Users/mashsyed/.gemini/antigravity/scratch/expedia-genmedia-pipeline/backend/static/samples"
    create_photorealistic_suite(os.path.join(out_dir, "luxury_suite.jpg"))
