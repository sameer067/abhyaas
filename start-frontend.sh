#!/bin/bash
set -e
cd "$(dirname "$0")/frontend"
source ~/.nvm/nvm.sh
nvm use 20
npm run dev
