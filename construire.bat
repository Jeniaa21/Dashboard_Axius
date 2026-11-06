@echo off
chcp 65001 >nul
cd /d "%~dp0"
where py >nul 2>nul && (py site\construire.py) || (python site\construire.py)
echo.
pause
