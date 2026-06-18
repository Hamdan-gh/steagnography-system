#!/usr/bin/env python3
"""
Quick diagnosis script to check current API status.
Run this immediately to see what's wrong.
"""

import requests
import sys

API_URL = "https://stegagen-api.onrender.com"
FRONTEND = "https://steagnography-system.vercel.app"

print("=" * 70)
print("QUICK DIAGNOSIS - StegaGen API")
print("=" * 70)

# Test 1: Is the server responding at all?
print("\n[1/3] Checking if server is online...")
try:
    response = requests.get(f"{API_URL}/api/health", timeout=10)
    if response.status_code == 200:
        print("✓ Server is ONLINE and responding")
        data = response.json()
        print(f"   Version: {data.get('version')}")
        print(f"   Status: {data.get('status')}")
    else:
        print(f"✗ Server responded with status {response.status_code}")
        sys.exit(1)
except requests.exceptions.Timeout:
    print("✗ Server TIMEOUT - It might be waking up from sleep")
    print("   ACTION: Wait 60 seconds and run this script again")
    sys.exit(1)
except requests.exceptions.ConnectionError:
    print("✗ Cannot connect to server")
    print("   ACTION: Check if Render service is deployed and running")
    sys.exit(1)
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

# Test 2: Does server accept CORS from our frontend?
print("\n[2/3] Checking CORS configuration...")
headers = {
    'Origin': FRONTEND,
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
}

try:
    response = requests.options(f"{API_URL}/api/embed", headers=headers, timeout=10)
    
    allow_origin = response.headers.get('Access-Control-Allow-Origin')
    allow_methods = response.headers.get('Access-Control-Allow-Methods')
    
    if allow_origin:
        print(f"✓ CORS is configured")
        print(f"   Allowed Origin: {allow_origin}")
        print(f"   Allowed Methods: {allow_methods}")
        
        if allow_origin != FRONTEND and allow_origin != '*':
            print(f"   ⚠ Warning: Origin mismatch!")
            print(f"      Expected: {FRONTEND}")
            print(f"      Got: {allow_origin}")
    else:
        print("✗ CORS headers are MISSING")
        print("   ACTION: Check ALLOWED_ORIGINS environment variable on Render")
        print("   ACTION: Verify latest code is deployed")
        
except Exception as e:
    print(f"✗ CORS test failed: {e}")

# Test 3: Can we make an actual request?
print("\n[3/3] Testing actual API endpoint...")
headers = {'Origin': FRONTEND}
try:
    # This will fail (no files sent) but we can check CORS headers in response
    response = requests.post(f"{API_URL}/api/embed", headers=headers, timeout=10)
    
    allow_origin = response.headers.get('Access-Control-Allow-Origin')
    
    if allow_origin:
        print("✓ CORS headers present in POST response")
        print(f"   Origin: {allow_origin}")
    else:
        print("✗ CORS headers MISSING in POST response")
        print("   This is the problem causing the frontend error!")
        
except Exception as e:
    print(f"   Request failed as expected (no files sent)")
    print(f"   Error: {e}")

# Summary
print("\n" + "=" * 70)
print("DIAGNOSIS COMPLETE")
print("=" * 70)

print("\nIf you see '✓' marks above, the API is working correctly.")
print("If you see '✗' marks, follow the actions suggested above.")

print("\n📋 NEXT STEPS:")
print("1. If server is sleeping: Wait and retry")
print("2. If CORS is missing: Run 'python test_cors.py' for detailed test")
print("3. If all tests pass: Check frontend code and browser console")
print("4. If tests fail: Check DEPLOY_CORS_FIX.md for deployment steps")

print("\n📚 DOCUMENTATION:")
print("   • Full guide: CORS_FIX_GUIDE.md")
print("   • Deployment: DEPLOY_CORS_FIX.md")
print("   • Detailed tests: python test_cors.py")
