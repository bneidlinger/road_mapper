# Deployment Guide

## GitHub Pages Deployment

Road Mapper is configured to deploy to GitHub Pages at https://bneidlinger.github.io/road_mapper/

### Automatic Deployment

The project includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages when you push to the `main` branch.

1. Ensure GitHub Pages is enabled in your repository settings:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages (will be created automatically)
   - Folder: / (root)

2. Push your changes to the main branch:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

3. The GitHub Action will automatically:
   - Build the production bundle
   - Deploy to the gh-pages branch
   - Your site will be live in a few minutes

### Manual Deployment

If you need to deploy manually:

```bash
# Option 1: Use the deploy script
./scripts/deploy-gh-pages.sh

# Option 2: Manual steps
npm run build
# Copy the contents of dist/ to your gh-pages branch
```

### Production Build Configuration

The production build:
- Minifies and optimizes the JavaScript bundle
- Sets the correct base path (`/road_mapper/`) for GitHub Pages
- Includes source maps for debugging
- All styles are embedded in the bundle

### Local Testing of Production Build

To test the production build locally:

```bash
npm run build
cd dist
python -m http.server 8000
# Visit http://localhost:8000
```

Note: Some features may not work correctly when served from `file://` URLs due to browser security restrictions.

### Troubleshooting

1. **404 Error on GitHub Pages**: Ensure the repository name in webpack.config.cjs matches your GitHub repository name
2. **Blank page**: Check the browser console for errors, ensure all paths are relative
3. **Missing styles**: The styles are injected by JavaScript, so ensure JavaScript is enabled