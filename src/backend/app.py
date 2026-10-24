import sys
import os

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI, File, UploadFile, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import shutil
import io
import base64
import scipy.io
from sklearn.cluster import KMeans
import matplotlib  # noqa: E402
matplotlib.use('Agg')
import matplotlib.pyplot as plt  # noqa: E402

# Import spatial analysis functions
from src.backend.spatial_analysis import (
    clean_anomaly_mask,
    extract_candidate_regions,
    extract_region_spectral_signature,
    generate_bounding_box_overlay,
)

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import src.backend.database as db

app = FastAPI(title="HyperSense AI - Hyperspectral Anomaly Detection API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "data/user_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Path to the actual Indian Pines dataset
DEMO_DATASET_PATH = "data/Pine_Dataset/Pines_Dataset.mat"


def detect_hyperspectral_candidates(mat_dict):
    """
    Analyzes all variables in a MAT file and identifies potential hyperspectral cubes.
    Filters out MATLAB metadata variables.
    
    Returns:
      - List of candidate dictionaries with (variable_name, shape, array)
      - Most likely candidate if only one exists
    """
    metadata_vars = {'header', 'version', 'globals', '__header__', '__version__', '__globals__'}
    candidates = []
    
    for var_name, var_value in mat_dict.items():
        # Skip metadata variables
        if var_name in metadata_vars or var_name.startswith('__'):
            continue
        
        # Check if it's a numeric 3D array
        if isinstance(var_value, np.ndarray):
            if len(var_value.shape) == 3:
                # Likely a hyperspectral cube
                h, w, b = var_value.shape
                # Reasonable hyperspectral cube should have:
                # - spatial dimensions in reasonable range (typically 100+ pixels)
                # - spectral dimension typically 100-500 bands
                if h > 1 and w > 1 and b > 1:
                    candidates.append({
                        'name': var_name,
                        'shape': var_value.shape,
                        'dtype': str(var_value.dtype),
                        'size_mb': var_value.nbytes / (1024*1024)
                    })
    
    return candidates


def load_and_validate_hyperspectral_cube(file_path, variable_name=None):
    """
    Loads a .mat file and extracts the hyperspectral cube.
    
    Args:
      - file_path: path to .mat file
      - variable_name: specific variable to load (if None, auto-detect)
    
    Returns:
      - tuple: (hsi_cube, variable_name, selected_from_options)
    
    Raises:
      - ValueError if no valid cube found or invalid structure
    """
    mat = scipy.io.loadmat(file_path)
    
    # If variable name specified, use it
    if variable_name:
        if variable_name not in mat:
            raise ValueError(f"Variable '{variable_name}' not found in MAT file")
        hsi_cube = mat[variable_name]
    else:
        # Auto-detect: check common names first
        for key in ["indian_pines_corrected", "img_cube", "cube", "reflectance", 
                   "scene", "data", "array", "image", "hyperspectral"]:
            if key in mat and isinstance(mat[key], np.ndarray) and len(mat[key].shape) == 3:
                hsi_cube = mat[key]
                variable_name = key
                break
        
        # If not found, search all 3D numeric arrays
        if variable_name is None:
            candidates = detect_hyperspectral_candidates(mat)
            if len(candidates) == 0:
                raise ValueError("No valid hyperspectral cubes found in MAT file")
            elif len(candidates) == 1:
                # Auto-select the only candidate
                variable_name = candidates[0]['name']
                hsi_cube = mat[variable_name]
            else:
                # Multiple candidates - return info for user selection
                raise ValueError(f"Multiple potential cubes detected. Please specify which to analyze. Options: {[c['name'] for c in candidates]}")
    
    # Validate it's a 3D array
    if not isinstance(hsi_cube, np.ndarray):
        raise ValueError(f"Selected variable is not a numeric array")
    
    if len(hsi_cube.shape) != 3:
        raise ValueError(f"Selected variable has {len(hsi_cube.shape)} dimensions; expected 3D hyperspectral cube")
    
    # Validate dimensions are reasonable (not tiny, not huge)
    h, w, b = hsi_cube.shape
    if h < 2 or w < 2 or b < 2:
        raise ValueError(f"Invalid dimensions {hsi_cube.shape}; all dimensions must be > 1")
    
    return hsi_cube, variable_name


def preprocess_cube(hsi_cube):
    """
    Normalizes the hyperspectral cube to [0, 1].
    Spatial interpolation is explicitly avoided to preserve spectral signatures.
    """
    try:
        h, w, bands = hsi_cube.shape
        dtype_str = str(hsi_cube.dtype)
        
        # Handle NaN and Inf values
        hsi_cube_clean = np.nan_to_num(hsi_cube, nan=0.0, posinf=0.0, neginf=0.0)
        
        min_val = float(np.nanmin(hsi_cube_clean))
        max_val = float(np.nanmax(hsi_cube_clean))

        metadata = {
            "height": h,
            "width": w,
            "bands": bands,
            "dtype": dtype_str,
            "min": min_val,
            "max": max_val,
        }

        # Min-max normalization per band to [0,1]
        cube_min = hsi_cube_clean.min(axis=(0, 1), keepdims=True)
        cube_max = hsi_cube_clean.max(axis=(0, 1), keepdims=True)
        
        # Avoid division by zero
        denominator = (cube_max - cube_min + 1e-8)
        norm_cube = (hsi_cube_clean - cube_min) / denominator
        
        # Clip to [0,1] range to handle any edge cases
        norm_cube = np.clip(norm_cube, 0, 1)

        return norm_cube, metadata
    except Exception as e:
        print(f"Error in preprocess_cube: {e}")
        raise ValueError(f"Failed to preprocess hyperspectral cube: {str(e)}")


def kmeans_detect(cube):
    """Applies K-Means clustering to group similar spectral pixels."""
    try:
        h, w, b = cube.shape
        flat = cube.reshape(-1, b)
        # Ensure data is finite
        flat = np.nan_to_num(flat, nan=0.0, posinf=0.0, neginf=0.0)
        kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
        labels = kmeans.fit_predict(flat)
        return labels.reshape(h, w)
    except Exception as e:
        print(f"Error in K-Means detection: {e}")
        # Return random cluster assignment as fallback
        return np.random.randint(0, 4, (h, w))


def rx_anomaly_detection(cube):
    """
    Computes the RX anomaly score for each pixel.
    Calculates the Mahalanobis distance from the scene background mean.
    """
    try:
        h, w, b = cube.shape
        flat = cube.reshape(-1, b)
        mean_vec = flat.mean(axis=0)
        cov = np.cov(flat, rowvar=False)
        
        # Handle singular covariance matrices
        cov_inv = np.linalg.pinv(cov)
        diff = flat - mean_vec

        # Mahalanobis distance with NaN/inf protection
        rx_scores = np.sum(diff @ cov_inv * diff, axis=1)
        rx_scores = np.nan_to_num(rx_scores, nan=0.0, posinf=0.0, neginf=0.0)
        return rx_scores.reshape(h, w)
    except Exception as e:
        print(f"Error in RX anomaly detection: {e}")
        # Return zero scores as fallback
        return np.zeros((h, w))


def threshold_anomaly_scores(rx_scores, threshold_percent=5):
    """Thresholds the continuous RX score map into a binary candidate mask."""
    try:
        # Ensure threshold_percent is valid
        threshold_percent = max(1, min(99, int(threshold_percent)))
        threshold_value = np.percentile(rx_scores, 100 - threshold_percent)
        binary_mask = (rx_scores >= threshold_value).astype(np.uint8)
        return binary_mask
    except Exception as e:
        print(f"Error in threshold_anomaly_scores: {e}")
        # Return empty mask as fallback
        return np.zeros_like(rx_scores, dtype=np.uint8)


def create_false_color_image(cube):
    """Extracts 3 representative bands to create a visible false-color composite."""
    try:
        bands = cube.shape[2]
        # Safely select band indices
        if bands > 20:
            bands_idx = [
                min(10, bands - 1),
                min(bands // 2, bands - 1),
                bands - 1
            ]
        else:
            # For datasets with fewer bands, wrap around
            bands_idx = [
                min(0, bands - 1),
                min(1, bands - 1) if bands > 1 else 0,
                min(2, bands - 1) if bands > 2 else 0
            ]
        
        fc = np.stack([cube[:, :, i] for i in bands_idx], axis=-1)
        fc_min = fc.min()
        fc_max = fc.max()
        
        # Avoid division by zero
        if fc_max > fc_min:
            fc = (fc - fc_min) / (fc_max - fc_min)
        else:
            fc = np.zeros_like(fc)
        
        return fc
    except Exception as e:
        print(f"Error in create_false_color_image: {e}")
        # Return a grayscale version as fallback
        return np.stack([cube[:, :, 0], cube[:, :, 0], cube[:, :, 0]], axis=-1)


def encode_img(img, cmap=None):
    """Renders a numpy array as a base64 encoded PNG for the frontend."""
    try:
        fig, ax = plt.subplots(figsize=(5, 5))
        if cmap:
            ax.imshow(img, cmap=cmap)
        else:
            ax.imshow(img)
        ax.axis("off")
        buf = io.BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight", pad_inches=0)
        plt.close(fig)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode()
    except Exception as e:
        print(f"Error encoding image: {e}")
        # Return a simple placeholder encoded image (1x1 white pixel)
        fig, ax = plt.subplots(figsize=(1, 1))
        ax.imshow([[1]])
        buf = io.BytesIO()
        plt.savefig(buf, format="png")
        plt.close(fig)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode()


def process_pipeline(file_path, filename, algorithm, threshold, variable_name=None):
    """Shared pipeline logic for both uploaded files and the demo dataset."""
    try:
        # Validate inputs
        if not isinstance(threshold, int):
            threshold = int(threshold)
        threshold = max(1, min(99, threshold))
        
        if algorithm not in ["rx", "kmeans"]:
            return {"error": "Invalid algorithm. Use 'rx' or 'kmeans'", "status_code": 400}
        
        # Load and validate cube (now supports variable_name parameter)
        raw_cube, selected_var = load_and_validate_hyperspectral_cube(file_path, variable_name)
        cube, metadata = preprocess_cube(raw_cube)
        
    except ValueError as e:
        return {"error": str(e), "status_code": 400}
    except FileNotFoundError as e:
        return {"error": f"File not found: {str(e)}", "status_code": 404}
    except Exception as e:
        return {"error": f"Failed to load dataset: {str(e)}", "status_code": 500}

    try:
        false_color = create_false_color_image(cube)
    except Exception as e:
        return {"error": f"Failed to create false-color image: {str(e)}", "status_code": 500}

    # Construct base response - now includes variable_name
    result = {
        "filename": filename,
        "variable_name": selected_var,
        "metadata": metadata,
        "false_color_image": encode_img(false_color),
        "algorithm": algorithm,
        "threshold": threshold,
    }

    try:
        if algorithm == "kmeans":
            cluster_map = kmeans_detect(cube)
            result["cluster_map_image"] = encode_img(cluster_map, cmap="tab10")

        elif algorithm == "rx":
            # 1. Detection
            rx_scores = rx_anomaly_detection(cube)
            binary_mask = threshold_anomaly_scores(rx_scores, threshold)

            # 2. Spatial Refinement
            refined_mask = clean_anomaly_mask(binary_mask)
            regions = extract_candidate_regions(refined_mask, rx_scores, min_area=5)

            # 3. Spectral Extraction
            for r in regions:
                try:
                    sigs = extract_region_spectral_signature(cube, r["mask_coords"])
                    r["spectral_signature"] = sigs["region_signature"]
                    r["background_signature"] = sigs["background_signature"]
                except Exception as e:
                    print(f"Error extracting signature for region {r['id']}: {e}")
                    # Use fallback empty signatures
                    r["spectral_signature"] = [0.0] * metadata["bands"]
                    r["background_signature"] = [0.0] * metadata["bands"]
                finally:
                    # Always remove mask_coords to reduce payload
                    r.pop("mask_coords", None)

            overlay = generate_bounding_box_overlay(false_color, regions)

            # 4. Packaging
            result["rx_scores_image"] = encode_img(rx_scores, cmap="hot")
            result["anomaly_mask_image"] = encode_img(binary_mask, cmap="gray")
            result["refined_mask_image"] = encode_img(refined_mask, cmap="gray")
            result["overlay_image"] = encode_img(overlay)
            result["regions"] = regions
    except Exception as e:
        return {"error": f"Error during analysis pipeline: {str(e)}", "status_code": 500}

    # Persist run to SQLite database storage
    try:
        run_id = db.save_analysis_run(
            dataset_name=filename,
            algorithm=algorithm,
            threshold=float(threshold),
            metadata=result.get("metadata", {}),
            regions=result.get("regions", []),
        )
        result["run_id"] = run_id
        result["database_stored"] = True
    except Exception as dbe:
        print(f"Database save warning: {dbe}")

    return result


@app.post("/inspect-upload")
@app.post("/inspect-mat")
async def inspect_upload(file: UploadFile = File(...)):
    """
    Inspect an uploaded MAT file to detect potential hyperspectral cube variables.
    Returns available cube candidates for user selection.
    """
    try:
        if file.filename is None or file.filename == "":
            return JSONResponse({"error": "No file name provided"}, status_code=400)
        
        ext = file.filename.split(".")[-1].lower()
        if ext != "mat":
            return JSONResponse(
                {"error": "This application requires a .mat file"},
                status_code=400,
            )
        
        # Save uploaded file temporarily
        save_path = os.path.join(UPLOAD_DIR, file.filename)
        try:
            with open(save_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
        except Exception as e:
            return JSONResponse(
                {"error": f"Failed to save uploaded file: {str(e)}"},
                status_code=500,
            )
        
        # Inspect the file
        try:
            mat = scipy.io.loadmat(save_path)
            candidates = detect_hyperspectral_candidates(mat)
            
            if len(candidates) == 0:
                return JSONResponse(
                    {"error": "No valid hyperspectral cubes found in this MAT file"},
                    status_code=400,
                )
            
            # Return inspection results
            return JSONResponse({
                "filename": file.filename,
                "candidates_count": len(candidates),
                "candidates": candidates,
                "auto_select": len(candidates) == 1,
                "selected_variable": candidates[0]['name'] if len(candidates) == 1 else None,
            })
            
        except Exception as e:
            return JSONResponse(
                {"error": f"Failed to inspect MAT file: {str(e)}"},
                status_code=400,
            )
    
    except Exception as e:
        return JSONResponse(
            {"error": f"Error during file inspection: {str(e)}"},
            status_code=500,
        )


@app.post("/analyze-demo")
async def analyze_demo(
    algorithm: str = Query("rx"),
    threshold: int = Query(5)
):
    """Endpoint for running the built-in Indian Pines demo dataset."""
    if not os.path.exists(DEMO_DATASET_PATH):
        return JSONResponse(
            {"error": f"Demo dataset not found at {DEMO_DATASET_PATH}. Please ensure the Pines_Dataset.mat file is in the data/Pine_Dataset/ directory."},
            status_code=404
        )
    
    try:
        result = process_pipeline(DEMO_DATASET_PATH, "Pines_Dataset.mat", algorithm, threshold, variable_name="indian_pines_corrected")
        if "error" in result:
            return JSONResponse({"error": result["error"]}, status_code=result.get("status_code", 400))
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse(
            {"error": f"Error processing demo dataset: {str(e)}"},
            status_code=500
        )


@app.post("/analyze-upload")
async def analyze_upload(
    file: UploadFile = File(...),
    algorithm: str = Query("rx"),
    threshold: int = Query(5),
    variable_name: str = Query(None),
):
    """Endpoint for uploading and analyzing a custom dataset."""
    try:
        if file.filename is None or file.filename == "":
            return JSONResponse(
                {"error": "No file name provided"},
                status_code=400,
            )
        
        ext = file.filename.split(".")[-1].lower()

        # Reject RGB images clearly
        if ext in ["png", "jpg", "jpeg", "tiff", "bmp", "gif"]:
            return JSONResponse(
                {
                    "error": "This application requires a hyperspectral .mat file. Standard RGB images contain only three colour channels and cannot provide the required spectral information."
                },
                status_code=400,
            )

        if ext != "mat":
            return JSONResponse(
                {"error": "This application requires a hyperspectral .mat file. Please upload a .mat file."},
                status_code=400,
            )

        save_path = os.path.join(UPLOAD_DIR, file.filename)
        try:
            with open(save_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
        except Exception as e:
            return JSONResponse(
                {"error": f"Failed to save uploaded file: {str(e)}"},
                status_code=500,
            )

        result = process_pipeline(save_path, file.filename, algorithm, threshold, variable_name=variable_name)
        if "error" in result:
            return JSONResponse({"error": result["error"]}, status_code=result.get("status_code", 400))
            
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse(
            {"error": f"Unexpected error during upload: {str(e)}"},
            status_code=500,
        )


# Legacy endpoint for backwards compatibility during testing
@app.post("/upload-image/")
async def upload_image_legacy(
    file: UploadFile = File(...),
    algorithm: str = Query("kmeans"),
    threshold: int = Query(5),
):
    return await analyze_upload(file=file, algorithm=algorithm, threshold=threshold, variable_name=None)


@app.get("/health")
@app.get("/api/status")
async def health():
    return {
        "message": "HyperSense AI - Hyperspectral Anomaly Detection Backend API",
        "status": "running",
        "database": "SQLite data/hypersense.db",
        "endpoints": [
            "/analyze-demo",
            "/analyze-upload",
            "/inspect-upload",
            "/api/auth/signup",
            "/api/auth/login",
            "/api/auth/me",
            "/api/history",
            "/api/dossiers"
        ]
    }


# ─── DATABASE STORAGE & AUTHENTICATION ENDPOINTS ───

class SignupRequest(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = ""

class LoginRequest(BaseModel):
    email_or_username: str
    password: str

class SaveHistoryRequest(BaseModel):
    dataset_name: str
    algorithm: str
    threshold: float
    metadata: Dict[str, Any] = {}
    regions: List[Dict[str, Any]] = []
    user_id: Optional[int] = None

class SaveDossierRequest(BaseModel):
    title: str
    summary: str
    dataset_name: str = "Indian Pines"
    metadata: Dict[str, Any] = {}
    user_id: Optional[int] = None

@app.post("/api/auth/signup")
async def api_signup(req: SignupRequest):
    """Register a new user in SQLite database"""
    try:
        user = db.create_user(
            email=req.email,
            username=req.username,
            password=req.password,
            full_name=req.full_name or req.username
        )
        return JSONResponse({
            "success": True,
            "message": "Operator account created successfully",
            "user": user,
            "token": f"hstok_{user['id']}_{user['username']}"
        })
    except Exception as e:
        err_msg = str(e)
        if "UNIQUE constraint failed" in err_msg:
            return JSONResponse({"error": "An operator with this email or username already exists"}, status_code=400)
        return JSONResponse({"error": f"Failed to create account: {err_msg}"}, status_code=500)

@app.post("/api/auth/login")
async def api_login(req: LoginRequest):
    """Authenticate user against SQLite database"""
    try:
        user = db.authenticate_user(req.email_or_username, req.password)
        if not user:
            return JSONResponse({"error": "Invalid email/username or password"}, status_code=401)
        return JSONResponse({
            "success": True,
            "message": "Authentication successful",
            "user": user,
            "token": f"hstok_{user['id']}_{user['username']}"
        })
    except Exception as e:
        return JSONResponse({"error": f"Login failed: {str(e)}"}, status_code=500)

@app.get("/api/auth/me")
async def api_get_me(user_id: int = Query(...)):
    """Retrieve user details from SQLite database"""
    user = db.get_user_by_id(user_id)
    if not user:
        return JSONResponse({"error": "User not found"}, status_code=404)
    return JSONResponse({"user": user})

@app.get("/api/history")
async def api_get_history(user_id: Optional[int] = Query(None), limit: int = Query(25)):
    """Retrieve saved analysis runs from SQLite database"""
    try:
        runs = db.get_analysis_history(user_id=user_id, limit=limit)
        return JSONResponse({"runs": runs, "count": len(runs)})
    except Exception as e:
        return JSONResponse({"error": f"Failed to fetch history: {str(e)}"}, status_code=500)

@app.post("/api/history")
async def api_save_history(req: SaveHistoryRequest):
    """Explicitly save an analysis run into SQLite database"""
    try:
        run_id = db.save_analysis_run(
            dataset_name=req.dataset_name,
            algorithm=req.algorithm,
            threshold=req.threshold,
            metadata=req.metadata,
            regions=req.regions,
            user_id=req.user_id
        )
        return JSONResponse({"success": True, "run_id": run_id})
    except Exception as e:
        return JSONResponse({"error": f"Failed to save run: {str(e)}"}, status_code=500)

@app.get("/api/dossiers")
async def api_get_dossiers(limit: int = Query(20)):
    """Retrieve mission dossiers from SQLite database"""
    try:
        dossiers = db.get_mission_dossiers(limit=limit)
        return JSONResponse({"dossiers": dossiers, "count": len(dossiers)})
    except Exception as e:
        return JSONResponse({"error": f"Failed to fetch dossiers: {str(e)}"}, status_code=500)

@app.post("/api/dossiers")
async def api_save_dossier(req: SaveDossierRequest):
    """Save mission dossier into SQLite database"""
    try:
        dossier_id = db.save_mission_dossier(
            title=req.title,
            summary=req.summary,
            dataset_name=req.dataset_name,
            metadata=req.metadata,
            user_id=req.user_id
        )
        return JSONResponse({"success": True, "dossier_id": dossier_id})
    except Exception as e:
        return JSONResponse({"error": f"Failed to save dossier: {str(e)}"}, status_code=500)


# ─── FRONTEND STATIC FILES & SPA SERVING ───
FRONTEND_DIST = os.path.join(PROJECT_ROOT, "Frontend", "dist")
if os.path.exists(FRONTEND_DIST) and os.path.exists(os.path.join(FRONTEND_DIST, "index.html")):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes, health, or docs
        reserved = ["health", "docs", "openapi.json", "redoc", "analyze-demo", "analyze-upload", "inspect-upload"]
        if full_path.startswith("api/") or full_path in reserved:
            return JSONResponse({"error": "Not Found"}, status_code=404)
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    async def root():
        return await health()
