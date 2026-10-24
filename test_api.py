#!/usr/bin/env python
"""Test API endpoints"""
import requests
import json
import sys

API_URL = "http://localhost:8000"

def test_demo_dataset():
    """Test demo dataset analysis with RX algorithm"""
    print("\n" + "="*60)
    print("TEST 1: Demo Dataset Analysis (RX Algorithm)")
    print("="*60)
    try:
        response = requests.post(
            f"{API_URL}/analyze-demo",
            params={"algorithm": "rx", "threshold": 5},
            timeout=180
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Keys: {', '.join(data.keys())}")
            print(f"Filename: {data.get('filename')}")
            
            meta = data.get('metadata', {})
            print(f"Metadata:")
            print(f"  - Height: {meta.get('height')}")
            print(f"  - Width: {meta.get('width')}")
            print(f"  - Bands: {meta.get('bands')}")
            print(f"  - Dtype: {meta.get('dtype')}")
            print(f"  - Min/Max: {meta.get('min')} / {meta.get('max')}")
            
            regions = data.get('regions', [])
            print(f"Detected Regions: {len(regions)}")
            
            if regions:
                for i, region in enumerate(regions[:3]):  # Show first 3
                    print(f"  Region {i+1}: ID={region.get('id')}, Area={region.get('area')}, Mean RX={region.get('mean_score'):.2f}")
            
            print("[PASS] TEST 1 PASSED: Demo dataset analysis successful!")
            return True
        else:
            print(f"Error Response: {response.text}")
            print("[FAIL] TEST 1 FAILED")
            return False
            
    except Exception as e:
        print(f"Connection Error: {e}")
        print("[FAIL] TEST 1 FAILED")
        return False


def test_kmeans():
    """Test K-Means clustering"""
    print("\n" + "="*60)
    print("TEST 2: K-Means Segmentation")
    print("="*60)
    try:
        response = requests.post(
            f"{API_URL}/analyze-demo",
            params={"algorithm": "kmeans", "threshold": 5},
            timeout=180
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'cluster_map_image' in data:
                print("Cluster Map Generated: Yes")
                print("[PASS] TEST 2 PASSED: K-Means segmentation successful!")
                return True
            else:
                print("Cluster Map Generated: No")
                print("[FAIL] TEST 2 FAILED: Missing cluster_map_image")
                return False
        else:
            print(f"Error Response: {response.text}")
            print("[FAIL] TEST 2 FAILED")
            return False
            
    except Exception as e:
        print(f"Connection Error: {e}")
        print("[FAIL] TEST 2 FAILED")
        return False


def test_threshold_variation():
    """Test different threshold values"""
    print("\n" + "="*60)
    print("TEST 3: Threshold Variation")
    print("="*60)
    thresholds = [1, 5, 10, 15, 20]
    results = []
    
    for threshold in thresholds:
        try:
            response = requests.post(
                f"{API_URL}/analyze-demo",
                params={"algorithm": "rx", "threshold": threshold},
                timeout=180
            )
            if response.status_code == 200:
                data = response.json()
                regions_count = len(data.get('regions', []))
                results.append((threshold, regions_count, "[PASS]"))
                print(f"  Threshold {threshold}%: {regions_count} regions detected [PASS]")
            else:
                results.append((threshold, 0, "[FAIL]"))
                print(f"  Threshold {threshold}%: Error {response.status_code} [FAIL]")
        except Exception as e:
            results.append((threshold, 0, "[FAIL]"))
            print(f"  Threshold {threshold}%: Connection Error [FAIL]")
    
    # Check if at least some succeeded
    if any(r[2] == "[PASS]" for r in results):
        print("[PASS] TEST 3 PASSED: Threshold variation works!")
        return True
    else:
        print("[FAIL] TEST 3 FAILED: All threshold tests failed")
        return False


def test_invalid_algorithm():
    """Test error handling for invalid algorithm"""
    print("\n" + "="*60)
    print("TEST 4: Error Handling - Invalid Algorithm")
    print("="*60)
    try:
        response = requests.post(
            f"{API_URL}/analyze-demo",
            params={"algorithm": "invalid_algo", "threshold": 5},
            timeout=180
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            data = response.json()
            error_msg = data.get('error', '')
            print(f"Error Message: {error_msg}")
            print("[PASS] TEST 4 PASSED: Invalid algorithm properly rejected!")
            return True
        else:
            print("[FAIL] TEST 4 FAILED: Should have returned an error")
            return False
            
    except Exception as e:
        print(f"Connection Error: {e}")
        print("[FAIL] TEST 4 FAILED")
        return False


if __name__ == "__main__":
    print("\n" + "="*60)
    print("HYPERSPECTRAL ANOMALY DETECTION - API TESTS")
    print("="*60)
    
    results = []
    results.append(("Demo Dataset (RX)", test_demo_dataset()))
    results.append(("K-Means Segmentation", test_kmeans()))
    results.append(("Threshold Variation", test_threshold_variation()))
    results.append(("Error Handling", test_invalid_algorithm()))
    
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
        print("\n ALL TESTS PASSED! Application is working correctly.")
        sys.exit(0)
    else:
        print(f"\n  {total - passed} test(s) failed. Please check the errors above.")
        sys.exit(1)
