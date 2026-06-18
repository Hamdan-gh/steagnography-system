#!/usr/bin/env python3
"""
Test script to verify CORS configuration on the deployed API.
Usage: python test_cors.py
"""

import requests
import json

API_URL = "https://stegagen-api.onrender.com"
FRONTEND_ORIGIN = "https://steagnography-system.vercel.app"

def test_health_endpoint():
    """Test the health check endpoint."""
    print("\n" + "="*60)
    print("Testing Health Endpoint")
    print("="*60)
    
    try:
        response = requests.get(f"{API_URL}/api/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✓ Health check passed - Server is running!")
            return True
        else:
            print("✗ Health check failed!")
            return False
    except Exception as e:
        print(f"✗ Error connecting to server: {str(e)}")
        print("   The server might be sleeping (cold start). Wait 30 seconds and try again.")
        return False


def test_cors_preflight():
    """Test CORS preflight (OPTIONS) request."""
    print("\n" + "="*60)
    print("Testing CORS Preflight")
    print("="*60)
    
    headers = {
        'Origin': FRONTEND_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    }
    
    try:
        response = requests.options(f"{API_URL}/api/embed", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"\nResponse Headers:")
        for key, value in response.headers.items():
            if 'Access-Control' in key or key == 'Vary':
                print(f"  {key}: {value}")
        
        cors_headers_present = (
            'Access-Control-Allow-Origin' in response.headers and
            'Access-Control-Allow-Methods' in response.headers
        )
        
        if cors_headers_present:
            print("\n✓ CORS preflight passed!")
            print(f"  Allowed origin: {response.headers.get('Access-Control-Allow-Origin')}")
            print(f"  Allowed methods: {response.headers.get('Access-Control-Allow-Methods')}")
            return True
        else:
            print("\n✗ CORS preflight failed - Missing CORS headers!")
            return False
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False


def test_cors_actual_request():
    """Test actual POST request with CORS headers."""
    print("\n" + "="*60)
    print("Testing Actual CORS Request")
    print("="*60)
    
    headers = {
        'Origin': FRONTEND_ORIGIN,
    }
    
    try:
        # This will fail because we're not sending files, but we can check CORS headers
        response = requests.post(f"{API_URL}/api/embed", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"\nCORS Headers in Response:")
        for key, value in response.headers.items():
            if 'Access-Control' in key or key == 'Vary':
                print(f"  {key}: {value}")
        
        has_cors = 'Access-Control-Allow-Origin' in response.headers
        
        if has_cors:
            print("\n✓ CORS headers present in actual response!")
            return True
        else:
            print("\n✗ CORS headers missing in actual response!")
            return False
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False


def main():
    print("\n" + "="*60)
    print("StegaGen API CORS Test Suite")
    print("="*60)
    print(f"API URL: {API_URL}")
    print(f"Frontend Origin: {FRONTEND_ORIGIN}")
    
    results = {
        'health': False,
        'preflight': False,
        'actual': False
    }
    
    # Test 1: Health check
    results['health'] = test_health_endpoint()
    
    if not results['health']:
        print("\n⚠ Server is not responding. It might be in cold start.")
        print("  Wait 30-60 seconds and run this script again.")
        return
    
    # Test 2: CORS preflight
    results['preflight'] = test_cors_preflight()
    
    # Test 3: Actual request
    results['actual'] = test_cors_actual_request()
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print(f"Health Check:      {'✓ PASS' if results['health'] else '✗ FAIL'}")
    print(f"CORS Preflight:    {'✓ PASS' if results['preflight'] else '✗ FAIL'}")
    print(f"CORS Actual:       {'✓ PASS' if results['actual'] else '✗ FAIL'}")
    
    if all(results.values()):
        print("\n✓ All tests passed! CORS is configured correctly.")
    else:
        print("\n✗ Some tests failed. Check the details above.")
        print("\nTroubleshooting:")
        print("1. Verify environment variable ALLOWED_ORIGINS is set on Render")
        print("2. Check Render logs for any errors")
        print("3. Ensure the app.py changes are deployed")
        print("4. Try manually deploying from Render dashboard")


if __name__ == "__main__":
    main()
