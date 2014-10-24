@echo off
cd "%~dp0\.."

SET DEBUG=*
SET NODE_ENV=development
SET HOST=127.0.0.1
SET PORT=3000

node baboon-backend.js
