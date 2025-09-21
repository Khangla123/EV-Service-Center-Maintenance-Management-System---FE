@echo off
cd /d "D:\NguyenQuocDatOriginals\Hoctap\Chuyennganh\Hocky9+\SWP391\EV-Service-Center-Maintenance-Management-System---FE\ev-service-center"
echo Current directory: %cd%
echo Checking package.json...
if exist package.json (
    echo package.json found!
    echo Installing dependencies...
    npm install
    echo Starting React development server...
    npm start
) else (
    echo ERROR: package.json not found in current directory!
    dir *.json
)
pause