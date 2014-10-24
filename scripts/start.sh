#!/bin/sh
# Script Path
SCRIPT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Go to root path of application
cd $SCRIPT && cd ..

# Set environment
export DEBUG=*
export NODE_ENV=development
export HOST=127.0.0.1
export PORT=3000

# Start application
node ./baboon-backend.js
