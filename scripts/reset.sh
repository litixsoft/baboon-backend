#!/bin/bash
# Script Path
SCRIPT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Go to root path of application
cd $SCRIPT && cd ..

echo "================================================="
echo "==== Reset node_modules"
echo "================================================="
echo ""
echo "=== Delete node_modules"
rm -r ./node_modules
echo "=== finished"
echo ""
echo "=== Clean cache npm"
npm cache clean
echo "=== finished"
echo ""
echo "=== Install node_modules"
npm install
echo "=== finished"
echo ""
