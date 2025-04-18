#!/bin/bash

# Clean up
rm -rf node_modules
rm -rf dist

# Install dependencies
npm install

# Build the project
npm run build

echo "Build completed. Ready to deploy to Vercel."
echo "Run 'vercel --prod' to deploy to production."
