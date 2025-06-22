#!/bin/bash

# Change to project root directory
cd "$(dirname "$0")/.."

# Build for production
echo "Building for production..."
npm run build

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "gh-pages branch exists"
else
    echo "Creating gh-pages branch..."
    git checkout --orphan gh-pages
    git rm -rf .
    git commit --allow-empty -m "Initial gh-pages commit"
    git checkout main
fi

# Copy dist files to a temporary directory
echo "Copying dist files..."
cp -r dist /tmp/road-mapper-dist

# Switch to gh-pages branch
git checkout gh-pages

# Remove old files
rm -rf *

# Copy new files
cp -r /tmp/road-mapper-dist/* .

# Add and commit
git add .
git commit -m "Deploy to GitHub Pages"

# Push to gh-pages
echo "Pushing to gh-pages branch..."
git push origin gh-pages

# Switch back to main
git checkout main

# Clean up
rm -rf /tmp/road-mapper-dist

echo "Deployment complete! Your site will be available at:"
echo "https://bneidlinger.github.io/road_mapper/"