@echo off
echo ========================================
echo 502 Error Diagnostic Tool
echo ========================================
echo.

echo [1/4] Checking if backend is responding...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" https://stegagen-api.onrender.com/api/health
echo.

echo [2/4] Testing CORS headers...
curl -s -H "Origin: https://steagnography-system.vercel.app" ^
     -H "Access-Control-Request-Method: POST" ^
     -H "Access-Control-Request-Headers: Content-Type" ^
     -X OPTIONS ^
     https://stegagen-api.onrender.com/api/health ^
     -i | findstr "Access-Control"
echo.

echo [3/4] Full health check response...
curl -s https://stegagen-api.onrender.com/api/health
echo.
echo.

echo [4/4] Diagnosis:
echo.
curl -s -o nul -w "%%{http_code}" https://stegagen-api.onrender.com/api/health > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="200" (
    echo ✓ Backend is UP and running
    echo → The issue might be with the frontend
    echo → Check browser console for detailed errors
) else if "%STATUS%"=="502" (
    echo ✗ Backend is DOWN (502 Bad Gateway)
    echo.
    echo Possible causes:
    echo   1. FREE TIER SPIN-DOWN (most likely)
    echo      - Wait 60 seconds and try again
    echo      - Free tier sleeps after 15 min idle
    echo.
    echo   2. OUT OF MEMORY
    echo      - Too many workers for free tier
    echo      - Solution: Reduce workers to 1
    echo.
    echo   3. APPLICATION CRASHED
    echo      - Check Render logs for errors
    echo      - Solution: Redeploy from dashboard
    echo.
    echo Next steps:
    echo   → Go to https://dashboard.render.com
    echo   → Click on 'stegagen-api'
    echo   → Check 'Logs' tab for errors
    echo   → Try 'Manual Deploy' if needed
) else if "%STATUS%"=="503" (
    echo ⏰ Backend is STARTING UP (503 Service Unavailable)
    echo → Wait 30-60 seconds and try again
    echo → This is normal after spin-down
) else if "%STATUS%"=="000" (
    echo ✗ CANNOT REACH BACKEND (No response)
    echo → Check internet connection
    echo → Check if Render is down: https://status.render.com
) else (
    echo ? Unexpected status: %STATUS%
    echo → Check Render dashboard for details
)

echo.
echo ========================================
echo Open Render Dashboard:
echo https://dashboard.render.com
echo ========================================
pause
