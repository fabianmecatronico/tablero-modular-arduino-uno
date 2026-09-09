@echo off
title Tablero Modular Arduino
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 server.py
  goto :end
)
where python >nul 2>nul
if %errorlevel%==0 (
  python server.py
  goto :end
)
echo No se encontro Python 3.
echo Puedes abrir index.html directamente, aunque el modo instalable y sin conexion requiere un servidor local.
pause
:end
