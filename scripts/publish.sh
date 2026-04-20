#!/usr/bin/env bash
set -euo pipefail

echo "☿ Mercury Agent — Publish"
echo "────────────────────────────"

PKG_NAME=$(node -p "require('./package.json').name")
PKG_VERSION=$(node -p "require('./package.json').version")

echo "Package: ${PKG_NAME}"
echo "Version: ${PKG_VERSION}"
echo ""

echo "1/5 Type checking..."
npm run typecheck

echo "2/5 Building..."
npm run build

echo "3/5 Verifying package contents..."
npm pack --dry-run 2>&1 | head -20

echo ""
echo "4/5 Verifying shebang..."
head -1 dist/index.js

echo ""
echo "5/5 Publishing to npm..."
npm publish --access public

echo ""
echo "✓ Published ${PKG_NAME}@${PKG_VERSION}"

echo "Tagging git..."
git tag -a "v${PKG_VERSION}" -m "v${PKG_VERSION}"
echo "Done. Push with: git push origin main --tags"