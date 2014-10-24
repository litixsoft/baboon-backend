#!/bin/sh
# Script Path
SCRIPT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Go to root path of application
cd $SCRIPT && cd ..

# Set environment
export DEBUG=*
export NODE_ENV=development

# Start application
node ./scripts/setup.js
