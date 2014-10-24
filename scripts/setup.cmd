@echo off
cd "%~dp0\.."

SET DEBUG=*
SET NODE_ENV=development

node ./scripts/setup.js
