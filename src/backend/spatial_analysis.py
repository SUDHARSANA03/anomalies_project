import numpy as np

try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False

def clean_anomaly_mask(binary_mask):
    """
    Applies morphological opening and closing to remove noise.
    Returns the refined binary mask.
    """
    if not OPENCV_AVAILABLE:
        # Fallback if cv2 not available: return as is
        return np.asarray(binary_mask, dtype=np.uint8)
        
    # Ensure binary_mask is uint8
    mask_uint8 = np.asarray(binary_mask * 255, dtype=np.uint8)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    
    # Opening removes small noise
    opened = cv2.morphologyEx(mask_uint8, cv2.MORPH_OPEN, kernel)
    # Closing fills small holes
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel)
    
    return np.asarray(closed > 0, dtype=np.uint8)

def extract_candidate_regions(refined_mask, rx_scores, min_area=5):
    """
    Uses connected components to extract regions.
    Returns a list of dictionaries with region stats.
    """
    regions = []
    if not OPENCV_AVAILABLE:
        return regions
    
    try:
        # Ensure refined_mask is uint8
        mask_uint8 = np.asarray(refined_mask * 255, dtype=np.uint8)
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask_uint8, connectivity=8)
        
        # Label 0 is background
        for i in range(1, num_labels):
            area = int(stats[i, cv2.CC_STAT_AREA])
            if area >= min_area:
                x = int(stats[i, cv2.CC_STAT_LEFT])
                y = int(stats[i, cv2.CC_STAT_TOP])
                w = int(stats[i, cv2.CC_STAT_WIDTH])
                h = int(stats[i, cv2.CC_STAT_HEIGHT])
                
                # Extract rx_scores for this specific region
                region_mask = (labels == i)
                region_scores = rx_scores[region_mask]
                
                mean_score = float(np.mean(region_scores)) if len(region_scores) > 0 else 0.0
                max_score = float(np.max(region_scores)) if len(region_scores) > 0 else 0.0
                
                regions.append({
                    "id": i,
                    "area": area,
                    "bbox": [x, y, w, h],
                    "centroid": [float(centroids[i][0]), float(centroids[i][1])],
                    "mean_score": mean_score,
                    "max_score": max_score,
                    "mask_coords": np.argwhere(region_mask).tolist()  # Store coordinates instead of full mask
                })
    except Exception as e:
        print(f"Error extracting regions: {e}")
        return regions
            
    return regions

def extract_region_spectral_signature(cube, region_mask_coords):
    """
    Extracts the mean spectral signature of the region and the background.
    region_mask_coords: list of [row, col] coordinates for the region
    """
    try:
        h, w, b = cube.shape
        region_mask_bool = np.zeros((h, w), dtype=bool)
        
        for coord in region_mask_coords:
            r, c = int(coord[0]), int(coord[1])
            if 0 <= r < h and 0 <= c < w:
                region_mask_bool[r, c] = True
            
        background_mask = ~region_mask_bool
        
        # Calculate mean across bands for the region
        region_pixels = cube[region_mask_bool]
        if len(region_pixels) > 0:
            region_sig = np.mean(region_pixels, axis=0).tolist()
        else:
            region_sig = [0.0] * b
            
        # Calculate mean across bands for the background
        bg_pixels = cube[background_mask]
        if len(bg_pixels) > 0:
            bg_sig = np.mean(bg_pixels, axis=0).tolist()
        else:
            bg_sig = [0.0] * b
            
        return {
            "region_signature": region_sig,
            "background_signature": bg_sig
        }
    except Exception as e:
        print(f"Error extracting spectral signature: {e}")
        # Return default signatures on error
        b = cube.shape[2] if len(cube.shape) > 2 else 1
        return {
            "region_signature": [0.0] * b,
            "background_signature": [0.0] * b
        }

def generate_bounding_box_overlay(false_color, regions):
    """
    Draws bounding boxes over the false color image.
    false_color is assumed to be a normalized float array [0,1], shape (H,W,3)
    """
    if not OPENCV_AVAILABLE:
        return np.asarray(false_color, dtype=np.float32)
    
    try:
        # Convert to uint8 for cv2 drawing and force copy to ensure writability
        overlay = np.ascontiguousarray((false_color * 255), dtype=np.uint8).copy()
        
        # Red bounding boxes (BGR format for OpenCV)
        color = (255, 0, 0)
        
        for r in regions:
            try:
                x, y, w, h = int(r["bbox"][0]), int(r["bbox"][1]), int(r["bbox"][2]), int(r["bbox"][3])
                cv2.rectangle(overlay, (x, y), (x + w, y + h), color, 1)
                text = f"#{r['id']}"
                cv2.putText(overlay, text, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.3, color, 1)
            except Exception as e:
                print(f"Error drawing region {r.get('id', 'unknown')}: {e}")
                continue
            
        # Convert back to float [0,1]
        return overlay.astype(np.float32) / 255.0
    except Exception as e:
        print(f"Error generating bounding box overlay: {e}")
        return np.asarray(false_color, dtype=np.float32)
