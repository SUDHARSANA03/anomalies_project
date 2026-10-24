# Hyperspectral Anomaly Detection Platform

**Professional hyperspectral image analysis system for agricultural scene inspection and anomaly detection**

![Status](https://img.shields.io/badge/Status-Production_Ready-green)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Datasets](#datasets)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This application analyzes hyperspectral imagery to identify and visualize spectrally distinct regions within agricultural scenes. It uses the RX (Reed-Xiaoli) anomaly detection algorithm combined with spatial refinement to detect candidate anomalies without requiring ground truth labels.

**Key Capabilities:**
- Detects spectral anomalies using Mahalanobis distance
- Performs unsupervised clustering with K-Means
- Dynamically supports any compatible hyperspectral dataset
- Provides interactive threshold adjustment
- Extracts and visualizes spectral signatures
- Web-based interactive dashboard

**Use Cases:**
- Agricultural monitoring
- Environmental surveillance
- Quality control in agricultural products
- Research in hyperspectral image analysis

---

## ✨ Features

### Analysis Algorithms
- **RX Anomaly Detection**: Mahalanobis distance-based spectral anomaly scoring
- **K-Means Clustering**: Unsupervised segmentation into spectral classes
- **Spatial Refinement**: OpenCV morphological operations to denoise results
- **Connected Components**: Region detection and bounding box generation

### Data Support
- Any hyperspectral .mat file format
- Automatic variable detection from multi-cube files
- User-selectable data variables
- Dynamic dimension handling (no hardcoded sizes)
- Support for various data types (uint16, float32, etc.)

### Interactive Features
- Real-time threshold adjustment
- Region selection and inspection
- Spectral signature visualization
- Bounding box overlays on false-color images
- Dataset metadata display
- Optional K-Means segmentation

### User Interface
- Professional web-based dashboard (Streamlit)
- Real-time API communication
- Clear error messages
- Progress indicators
- Responsive layout

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip or conda package manager

### Installation

```bash
# Clone or download the repository
cd hyperspectral-anomaly-detection

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Application

**Option 1: Automatic (Both Services)**
```bash
python start_app.py
```

**Option 2: Manual (Separate Terminals)**

Terminal 1 - Backend:
```bash
python -m uvicorn src.backend.app:app --host 0.0.0.0 --port 8000
```

Terminal 2 - Frontend:
```bash
streamlit run src/frontend/app.py
```

### Access the Application
- **Frontend Dashboard:** http://localhost:8501
- **API Documentation:** http://localhost:8000/docs
- **Backend API:** http://localhost:8000

---

## 📦 Installation Details

### System Requirements
- **OS:** Windows, macOS, or Linux
- **RAM:** 4GB minimum (8GB recommended)
- **Disk:** 1GB free space
- **Python:** 3.8 or higher

### Dependencies

Core packages:
- `fastapi` 0.109.0 - Web API framework
- `uvicorn` 0.27.0 - ASGI server
- `streamlit` 1.31.0 - Web dashboard
- `numpy` 1.26.3 - Numerical computing
- `scipy` 1.12.0 - Scientific computing
- `scikit-learn` 1.4.0 - Machine learning
- `scikit-image` 0.22.0 - Image processing
- `opencv-python-headless` 4.8.1.78 - Computer vision
- `matplotlib` 3.8.2 - Visualization
- `pillow` 10.2.0 - Image handling
- `requests` 2.31.0 - HTTP client
- `python-multipart` 0.0.6 - Form data handling

All versions are pinned for stability.

---

## 💻 Usage

### Analyzing the Demo Dataset

1. Start the application (see Quick Start)
2. Open http://localhost:8501 in your browser
3. Click **"Analyze Indian Pines Dataset"**
4. Wait for analysis to complete (typically 2-5 seconds)
5. Review results across 10 sections:
   - Dataset metadata
   - False-color visualization
   - RX score map
   - Anomaly mask
   - Refined mask
   - Detected regions
   - Region inspection
   - Spectral signatures
   - K-Means segmentation (optional)

### Uploading a Custom Dataset

1. Click **"Upload Hyperspectral Dataset"**
2. Select a compatible .mat file
3. The system will:
   - Detect available hyperspectral cubes
   - Display variable options (if multiple)
   - Auto-select if only one valid cube exists
4. Click **"Analyze Uploaded File"**
5. Review results

### Adjusting Threshold

1. After analysis, locate the **"Anomaly Threshold (%)"** slider
2. Drag to adjust (1-20%)
3. Results update in real-time
4. Lower threshold = more regions detected
5. Higher threshold = fewer, more significant regions

### Inspecting Regions

1. Scroll to **"Region Investigation"** section
2. Select a region from dropdown
3. View:
   - Region statistics (area, centroid, scores)
   - Bounding box in overlay image
   - Spectral signature graph (region vs background)

### Running K-Means Clustering

1. Scroll to bottom: **"Optional Scene Segmentation"**
2. Click **"Run K-Means Segmentation"**
3. View cluster map showing 4 spectral classes
4. Groups pixels by spectral similarity

---

## 🏗️ Architecture

### Backend (FastAPI)

```
src/backend/
├── app.py                 # Main API application
└── spatial_analysis.py    # Image processing functions
```

**Key Components:**
- `load_and_validate_hyperspectral_cube()` - Dataset loading
- `detect_hyperspectral_candidates()` - Variable detection
- `rx_anomaly_detection()` - RX algorithm
- `kmeans_detect()` - K-Means clustering
- `clean_anomaly_mask()` - Spatial refinement
- `extract_candidate_regions()` - Region detection
- `extract_region_spectral_signature()` - Signature extraction
- `generate_bounding_box_overlay()` - Visualization

### Frontend (Streamlit)

```
src/frontend/
└── app.py                 # Dashboard application
```

**Key Features:**
- Session state management
- Real HTTP requests to backend
- Dynamic data visualization
- Interactive controls
- Error handling

### Data Flow

```
User Browser
    ↓
Streamlit Frontend (Port 8501)
    ↓ [Real HTTP Requests]
FastAPI Backend (Port 8000)
    ↓
Load Dataset (MAT file)
    ↓
Detect Variables (if multiple)
    ↓
Validate Hyperspectral Cube
    ↓
Analysis Pipeline:
  - Normalization
  - False-color generation
  - RX/K-Means computation
  - Spatial refinement
  - Region detection
    ↓
JSON Response (with images + metadata)
    ↓
Streamlit Renders Results
```

---

## 🔌 API Documentation

### Endpoints

#### GET /
**Health check**
```bash
curl http://localhost:8000/
```
Response: `{"message": "...", "status": "running"}`

#### POST /inspect-upload
**Detect hyperspectral variables in uploaded file**
```bash
curl -X POST http://localhost:8000/inspect-upload \
  -F "file=@dataset.mat"
```
Response:
```json
{
  "filename": "dataset.mat",
  "candidates_count": 1,
  "auto_select": true,
  "selected_variable": "hyperspectral_cube",
  "candidates": [{
    "name": "hyperspectral_cube",
    "shape": [512, 512, 224],
    "dtype": "float32",
    "size_mb": 460.8
  }]
}
```

#### POST /analyze-demo
**Analyze built-in Indian Pines dataset**
```bash
curl -X POST "http://localhost:8000/analyze-demo?algorithm=rx&threshold=5"
```
Query Parameters:
- `algorithm`: "rx" (anomaly detection) or "kmeans" (clustering)
- `threshold`: 1-99 (percentile threshold, only for RX)

Response: Complete analysis with metadata, images, regions

#### POST /analyze-upload
**Upload and analyze custom dataset**
```bash
curl -X POST "http://localhost:8000/analyze-upload?algorithm=rx&threshold=5" \
  -F "file=@dataset.mat" \
  -F "variable_name=my_cube"
```
Query Parameters:
- `algorithm`: "rx" or "kmeans"
- `threshold`: 1-99
- `variable_name`: Optional - specific variable to analyze

Response: Complete analysis

#### GET /docs
**Interactive API documentation**
Open: http://localhost:8000/docs
- Try endpoints directly
- See request/response examples
- Test with real data

---

## 📊 Datasets

### Supported Format

**MATLAB .mat files** containing:
- 3-dimensional numeric arrays (Height × Width × Bands)
- Examples:
  - 145 × 145 × 200 (Indian Pines - included)
  - 512 × 512 × 100
  - 256 × 256 × 224
  - Any valid H × W × B arrangement

### Input Validation

**Accepted:**
- .mat files with valid 3D hyperspectral cubes
- Multiple cube variables (user selects)
- Various data types (uint16, float32, etc.)
- Any spatial dimensions
- Any number of spectral bands

**Rejected:**
- RGB images (.png, .jpg, .jpeg, .tiff, .bmp, .gif)
- Non-.mat files
- 2D arrays
- Cubes with invalid dimensions

### Demo Dataset

**Indian Pines Dataset** (included):
- Location: `data/Pine_Dataset/Pines_Dataset.mat`
- Size: 145 × 145 pixels, 200 spectral bands
- Type: Agricultural hyperspectral image
- Pre-loaded for demo purposes

---

## 🧪 Testing

### Run All Tests

```bash
# API functionality tests (4 tests)
python test_api.py

# File upload tests (5 tests)
python test_upload.py

# Error handling tests (8 tests)
python test_errors.py
```

### Expected Output
```
✓ All tests passing: 17/17
```

### Test Coverage
- Demo dataset analysis
- File upload workflows
- Threshold variations
- Error scenarios
- Variable detection
- K-Means segmentation
- Response validation

---

## 📈 Performance

Typical processing times (Indian Pines dataset):
- Demo analysis: 2-5 seconds
- File upload: 2-5 seconds
- Threshold adjustment: <1 second
- Image encoding: <100ms
- Region detection: <500ms

Performance depends on:
- Dataset size (spatial × spectral dimensions)
- Threshold value (lower threshold = more processing)
- System resources (CPU, RAM)

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error:** "Address already in use"
```bash
# Find process on port 8000
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F

# Restart
python -m uvicorn src.backend.app:app --port 8000
```

**Error:** "ModuleNotFoundError"
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Frontend Shows Blank Page

```bash
# Clear Streamlit cache
streamlit cache clear

# Restart frontend
streamlit run src/frontend/app.py
```

### Cannot Connect to Backend

**Check if backend is running:**
```bash
curl http://localhost:8000/
```

**If not running:**
1. Start backend in new terminal
2. Verify port 8000 is accessible
3. Check firewall settings

### Analysis Fails with Error

**Most Common:**
- File format issue: Ensure .mat file contains valid 3D hyperspectral cube
- Variable selection: Try `/inspect-upload` first to see available variables
- Dimensions: Verify array is 3D (Height × Width × Bands)

**Solution:**
1. Check error message displayed
2. Inspect file with `/inspect-upload` endpoint
3. Verify MAT file structure
4. Review file size and memory availability

### Slow Processing

**Potential Causes:**
- Large dataset (many spatial/spectral dimensions)
- Low threshold value (more regions to process)
- Insufficient system resources

**Solutions:**
- Crop dataset to smaller region
- Increase threshold value
- Close other applications
- Use computer with more RAM/CPU

---

## 📋 Project Structure

```
hyperspectral-anomaly-detection/
├── README.md                    # This file
├── requirements.txt             # Python dependencies
├── start_app.py                 # Launcher script
├── run.py                        # Backend startup
├── src/
│   ├── __init__.py
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── app.py               # FastAPI application
│   │   └── spatial_analysis.py  # Image processing
│   └── frontend/
│       ├── __init__.py
│       └── app.py               # Streamlit dashboard
├── data/
│   ├── Pine_Dataset/
│   │   └── Pines_Dataset.mat    # Demo dataset
│   └── user_uploads/            # Uploaded files
├── notebooks/
│   └── algorithms_and_evaluation.ipynb  # Research notebook
└── test_*.py                    # Test suites
```

---

## 🔑 Key Algorithms

### RX Anomaly Detection

Computes pixel-wise Mahalanobis distance from scene background:

1. Calculate scene mean and covariance
2. For each pixel: compute spectral distance
3. Generate continuous score map
4. Threshold to create binary mask
5. Refine with morphological operations

**Result:** Highlights spectrally anomalous pixels

### K-Means Clustering

Unsupervised segmentation into spectral classes:

1. Reshape cube to pixels × bands
2. Run K-Means with k=4 clusters
3. Map cluster labels back to spatial dimensions
4. Visualize clusters with color map

**Result:** Segments similar spectral pixels into groups

### Spatial Refinement

Removes isolated noise and connects regions:

1. Apply morphological opening (remove small noise)
2. Apply morphological closing (fill small holes)
3. Output refined candidate mask

**Result:** Clean, contiguous anomaly regions

---

## 📝 Output Explanation

### False-Color Image
Composite visualization using 3 representative spectral bands:
- Shows RGB-like view of hyperspectral data
- Helps identify spatial patterns
- Context for detected anomalies

### RX Score Map
Continuous Mahalanobis distance scores:
- Brighter = more anomalous
- Darker = more similar to background
- Used to rank candidates

### Anomaly Mask
Binary mask from thresholded RX scores:
- White = candidate anomaly
- Black = background
- Threshold-dependent

### Refined Mask
Spatially refined anomaly mask:
- Removes isolated pixels
- Connects nearby candidates
- Cleaner for region detection

### Bounding Boxes
Detected candidate regions:
- Boxes around anomalies
- Labeled with region IDs
- Overlaid on false-color

### Region Statistics
For each detected region:
- **ID:** Region identifier
- **Area:** Number of pixels
- **Mean RX:** Average anomaly score
- **Max RX:** Highest anomaly score
- **Centroid:** Center of mass

### Spectral Signature
Extracted mean spectral response:
- X-axis: Spectral band index
- Y-axis: Intensity
- Blue line: Selected region
- Green line: Scene background
- Shows what makes region anomalous

---

## ✅ System Requirements

### Minimum
- Python 3.8
- 4GB RAM
- 1GB disk space
- Modern browser

### Recommended
- Python 3.10+
- 8GB RAM
- 2GB disk space
- Chrome/Firefox/Safari

### Supported OS
- Windows 10+
- macOS 10.14+
- Linux (Ubuntu 18.04+)

---

## 📄 License

This project is provided as-is for educational and research purposes.

---

## 🤝 Contributing

This is a demonstration/research project. For modifications or improvements:

1. Test thoroughly with the included test suite
2. Maintain backward compatibility
3. Document changes clearly
4. Follow existing code style

---

## 📞 Support

### Documentation
- **Quick Reference:** See API Documentation section above
- **Algorithms:** See Key Algorithms section
- **Troubleshooting:** See Troubleshooting section

### API Help
- Interactive docs: http://localhost:8000/docs
- Try endpoints directly
- View request/response examples

### Common Issues
See Troubleshooting section for solutions to:
- Backend connection issues
- Frontend display problems
- Analysis failures
- Performance concerns

---

## 🎓 Understanding the Results

### What Are Spectral Anomalies?

Pixels that have **different spectral signatures** from the surrounding scene:
- Not necessarily physical objects
- Could be sensor artifacts, shadows, different materials
- Requires expert interpretation for scientific conclusions

### What This System Does

✅ **Detects:** Spectrally distinct regions  
✅ **Visualizes:** Anomaly locations with confidence scores  
✅ **Extracts:** Spectral signatures for analysis  
✅ **Enables:** Interactive exploration and threshold adjustment  

❌ **Does NOT:** Identify specific objects, diagnose conditions, or make physical claims

### Using Results

1. Review detected anomalies
2. Examine spectral signatures
3. Consider spatial context
4. Cross-reference with domain knowledge
5. Validate with ground truth if available

---

## 📊 Example Workflows

### Workflow 1: Quick Demo
```
1. Run: python start_app.py
2. Open: http://localhost:8501
3. Click: "Analyze Indian Pines Dataset"
4. Explore: 10 sections of results
5. Adjust: Threshold slider
6. Select: Regions to inspect
```

### Workflow 2: Custom Dataset
```
1. Prepare: Hyperspectral .mat file
2. Start: Backend and frontend
3. Upload: Select custom file
4. Confirm: Variable selection (if needed)
5. Analyze: Click analyze button
6. Explore: Results and adjust threshold
```

### Workflow 3: Batch Analysis
```
1. Script API calls to /analyze-upload endpoint
2. Process multiple datasets
3. Extract results programmatically
4. Aggregate findings
```

---

## 🎯 Next Steps

1. **Try the demo:** Analyze Indian Pines to understand the interface
2. **Upload data:** Use your own hyperspectral dataset
3. **Adjust threshold:** Explore sensitivity to different settings
4. **Inspect regions:** Examine spectral signatures of detected anomalies
5. **Export results:** Use API to integrate with your workflow

---

## 📞 Quick Reference Commands

```bash
# Install
pip install -r requirements.txt

# Start both services
python start_app.py

# Backend only
python -m uvicorn src.backend.app:app --port 8000

# Frontend only
streamlit run src/frontend/app.py

# Run tests
python test_api.py
python test_upload.py
python test_errors.py

# Access dashboard
# http://localhost:8501

# Access API docs
# http://localhost:8000/docs
```

---

**Version:** 1.0.0  
**Last Updated:** August 2026  
**Status:** Production Ready ✅

For issues or questions, refer to the troubleshooting section or check the API documentation at `/docs`.
