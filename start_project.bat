@echo off
echo =========================================
echo Starting your E-Commerce Backend Server...
echo =========================================

cd /d "%~dp0"
call .\venv\Scripts\activate.bat

:: Start the Django server in the same window so you can see the logs
start /B python manage.py runserver

echo.
echo Waiting for the server to wake up...
timeout /t 3 /nobreak >nul

echo.
echo Opening your Frontend Website...
start frontend\index.html

echo.
echo ================================================================
echo SUCCESS! Your website is open. 
echo DO NOT CLOSE THIS BLACK WINDOW until you are done using the site!
echo Closing this window will turn off your database.
echo ================================================================
