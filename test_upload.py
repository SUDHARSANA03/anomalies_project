#!/usr/bin/env python
"""Test file upload functionality"""
import requests
import os
import sys
import io

API_URL = "http://localhost:8000"

def test_upload_valid_mat_file():
    """Test uploading a valid .mat file"""
    print("\n" + "="*60)
    print("TEST 1: Upload Valid .mat File")
    print("="*60)
    
    file_path = "data/Pine_Dataset/Pines_Dataset.mat"
    
    if not os.path.exists(file_path):
        print(f"Test data file not found: {file_path}")
        print("✗ TEST 1 FAILED")
        return False
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'application/octet-stream')}
            response = requests.post(
                f"{API_URL}/analyze-upload",
                files=files,
                params={"algorithm": "rx", "threshold": 5},
                timeout=180
            )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Keys: {', '.join(data.keys())}")
            print(f"Filename: {data.get('filename')}")
            
            meta = data.get('metadata', {})
            print(f"Metadata - Height: {meta.get('height')}, Width: {meta.get('width')}, Bands: {meta.get('bands')}")
            
            regions = data.get('regions', [])
            print(f"Detected Regions: {len(regions)}")
            print("[PASS] TEST 1 PASSED: File upload successful!")
            return True
        else:
            print(f"Error: {response.text}")
            print("[FAIL] TEST 1 FAILED")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        print("[FAIL] TEST 1 FAILED")
        return False


def test_upload_rgb_image():
    """Test that RGB images are rejected"""
    print("\n" + "="*60)
    print("TEST 2: Reject RGB Image (Expected Error)")
    print("="*60)
    
    try:
        # Create a fake PNG file
        fake_image = b'\x89PNG\r\n\x1a\n' + b'x' * 100  # PNG header + data
        
        files = {'file': ('test_image.png', io.BytesIO(fake_image), 'image/png')}
        response = requests.post(
            f"{API_URL}/analyze-upload",
            files=files,
            params={"algorithm": "rx", "threshold": 5},
            timeout=180
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            data = response.json()
            error_msg = data.get('error', '')
            print(f"Error Message: {error_msg}")
            if 'RGB' in error_msg or 'mat' in error_msg.lower():
                print("[PASS] TEST 2 PASSED: RGB images properly rejected!")
                return True
            else:
                print("[FAIL] TEST 2 FAILED: Wrong error message")
                return False
        else:
            print("[FAIL] TEST 2 FAILED: Should have rejected the image")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        print("[FAIL] TEST 2 FAILED")
        return False


def test_upload_wrong_extension():
    """Test that non-.mat files are rejected"""
    print("\n" + "="*60)
    print("TEST 3: Reject Wrong File Extension (Expected Error)")
    print("="*60)
    
    try:
        # Create a fake text file
        fake_file = b'This is not a mat file'
        
        files = {'file': ('test_file.txt', io.BytesIO(fake_file), 'text/plain')}
        response = requests.post(
            f"{API_URL}/analyze-upload",
            files=files,
            params={"algorithm": "rx", "threshold": 5},
            timeout=180
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            data = response.json()
            error_msg = data.get('error', '')
            print(f"Error Message: {error_msg}")
            if 'mat' in error_msg.lower():
                print("[PASS] TEST 3 PASSED: Wrong extensions properly rejected!")
                return True
            else:
                print("[FAIL] TEST 3 FAILED: Wrong error message")
                return False
        else:
            print("[FAIL] TEST 3 FAILED: Should have rejected the file")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        print("[FAIL] TEST 3 FAILED")
        return False


def test_upload_with_different_thresholds():
    """Test upload with different threshold values"""
    print("\n" + "="*60)
    print("TEST 4: Upload with Different Thresholds")
    print("="*60)
    
    file_path = "data/Pine_Dataset/Pines_Dataset.mat"
    
    if not os.path.exists(file_path):
        print(f"Test data file not found: {file_path}")
        print("[FAIL] TEST 4 FAILED")
        return False
    
    thresholds = [1, 10, 20]
    results = []
    
    for threshold in thresholds:
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (os.path.basename(file_path), f, 'application/octet-stream')}
                response = requests.post(
                    f"{API_URL}/analyze-upload",
                    files=files,
                    params={"algorithm": "rx", "threshold": threshold},
                    timeout=180
                )
            
            if response.status_code == 200:
                data = response.json()
                regions_count = len(data.get('regions', []))
                results.append((threshold, regions_count, True))
                print(f"  Threshold {threshold}%: {regions_count} regions [PASS]")
            else:
                results.append((threshold, 0, False))
                print(f"  Threshold {threshold}%: Error {response.status_code} [FAIL]")
        except Exception as e:
            results.append((threshold, 0, False))
            print(f"  Threshold {threshold}%: {e} [FAIL]")
    
    if all(r[2] for r in results):
        print("[PASS] TEST 4 PASSED: Upload with different thresholds works!")
        return True
    else:
        print("[FAIL] TEST 4 FAILED: Some threshold uploads failed")
        return False


def test_upload_with_kmeans():
    """Test upload with K-Means algorithm"""
    print("\n" + "="*60)
    print("TEST 5: Upload with K-Means Algorithm")
    print("="*60)
    
    file_path = "data/Pine_Dataset/Pines_Dataset.mat"
    
    if not os.path.exists(file_path):
        print(f"Test data file not found: {file_path}")
        print("[FAIL] TEST 5 FAILED")
        return False
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'application/octet-stream')}
            response = requests.post(
                f"{API_URL}/analyze-upload",
                files=files,
                params={"algorithm": "kmeans", "threshold": 5},
                timeout=180
            )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'cluster_map_image' in data:
                print("Cluster Map Generated: Yes")
                print("[PASS] TEST 5 PASSED: K-Means upload successful!")
                return True
            else:
                print("Cluster Map Generated: No")
                print("[FAIL] TEST 5 FAILED: Missing cluster map")
                return False
        else:
            print(f"Error: {response.text}")
            print("[FAIL] TEST 5 FAILED")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        print("[FAIL] TEST 5 FAILED")
        return False


if __name__ == "__main__":
    print("\n" + "="*60)
    print("HYPERSPECTRAL ANOMALY DETECTION - FILE UPLOAD TESTS")
    print("="*60)
    
    results = []
    results.append(("Valid .mat Upload", test_upload_valid_mat_file()))
    results.append(("Reject RGB Images", test_upload_rgb_image()))
    results.append(("Reject Wrong Extension", test_upload_wrong_extension()))
    results.append(("Different Thresholds", test_upload_with_different_thresholds()))
    results.append(("K-Means Upload", test_upload_with_kmeans()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "[PASS] PASSED" if result else "[FAIL] FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n[SUCCESS] ALL FILE UPLOAD TESTS PASSED!")
        sys.exit(0)
    else:
        print(f"\n[WARNING] {total - passed} test(s) failed.")
        sys.exit(1)
