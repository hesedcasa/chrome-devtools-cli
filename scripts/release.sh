#!/bin/bash

# Release script for chrome-devtools-cli
# Usage: npm run release:[patch|minor|major]

set -e  # Exit on error

# Temporary file for cleanup
TEMP_RELEASE_NOTES=""

# Cleanup function
cleanup() {
    if [ -n "$TEMP_RELEASE_NOTES" ] && [ -f "$TEMP_RELEASE_NOTES" ]; then
        rm -f "$TEMP_RELEASE_NOTES"
    fi
}

# Set up trap to ensure cleanup on exit
trap cleanup EXIT

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if release type is provided
RELEASE_TYPE=$1
if [ -z "$RELEASE_TYPE" ]; then
    log_error "Release type is required"
    echo "Usage: npm run release:[patch|minor|major]"
    echo "  patch: Bug fixes (1.0.0 -> 1.0.1)"
    echo "  minor: New features (1.0.0 -> 1.1.0)"
    echo "  major: Breaking changes (1.0.0 -> 2.0.0)"
    exit 1
fi

if [[ ! "$RELEASE_TYPE" =~ ^(patch|minor|major)$ ]]; then
    log_error "Invalid release type: $RELEASE_TYPE"
    echo "Must be one of: patch, minor, major"
    exit 1
fi

log_info "Starting $RELEASE_TYPE release process..."

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    log_error "Working directory is not clean. Please commit or stash your changes."
    git status --short
    exit 1
fi
log_success "Working directory is clean"

# Check if on main/master branch (or allow current branch for feature releases)
CURRENT_BRANCH=$(git branch --show-current)
log_info "Current branch: $CURRENT_BRANCH"

# For production releases, uncomment this check:
# if [[ ! "$CURRENT_BRANCH" =~ ^(main|master)$ ]]; then
#     log_warning "Not on main/master branch. Are you sure you want to release from $CURRENT_BRANCH?"
#     read -p "Continue? (y/N): " -n 1 -r
#     echo
#     if [[ ! $REPLY =~ ^[Yy]$ ]]; then
#         log_info "Release cancelled"
#         exit 0
#     fi
# fi

# Ensure we have the latest changes
log_info "Fetching latest changes from remote..."
git fetch origin "$CURRENT_BRANCH" 2>/dev/null || log_warning "Could not fetch from remote"

# Check if we're behind remote
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null) || REMOTE=$LOCAL
BASE=$(git merge-base @ @{u})
if [ "$LOCAL" != "$REMOTE" ] && [ "$REMOTE" != "$BASE" ]; then
    log_error "Local branch is behind remote. Please pull latest changes."
    exit 1
fi
log_success "Branch is up to date with remote"

# Install dependencies
log_info "Installing dependencies..."
npm ci
log_success "Dependencies installed"

# Build the project
log_info "Building project..."
npm run build
log_success "Build completed"

# Run tests if test script exists
if npm run 2>&1 | grep -q "^  test$"; then
    log_info "Running tests..."
    npm test
    log_success "Tests passed"
else
    log_warning "No test script found, skipping tests"
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
log_info "Current version: $CURRENT_VERSION"

# Bump version and create git tag
log_info "Bumping version ($RELEASE_TYPE)..."
npm version "$RELEASE_TYPE" -m "Release v%s"
NEW_VERSION=$(node -p "require('./package.json').version")
log_success "Version bumped to $NEW_VERSION"

# Push commits and tags
log_info "Pushing to remote repository..."
MAX_RETRIES=4
RETRY_COUNT=0
DELAY=2

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if git push -u origin "$CURRENT_BRANCH" && git push --tags; then
        log_success "Pushed to remote repository"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            log_warning "Push failed, retrying in ${DELAY}s... (retry $RETRY_COUNT/$MAX_RETRIES)"
            sleep $DELAY
            DELAY=$((DELAY * 2))
        else
            log_error "Failed to push after $MAX_RETRIES attempts"
            exit 1
        fi
    fi
done

# Publish to NPM
log_info "Publishing to NPM..."
if [ -n "$NPM_TOKEN" ]; then
    NPMRC_LINE="//registry.npmjs.org/:_authToken=$NPM_TOKEN"
    if ! grep -Fxq "$NPMRC_LINE" ~/.npmrc 2>/dev/null; then
        echo "$NPMRC_LINE" >> ~/.npmrc
    fi
fi

# Check if user is logged in to npm
if npm whoami &>/dev/null; then
    log_info "Publishing package to NPM..."
    npm publish --access public
    log_success "Published to NPM: chrome-devtools-cli@$NEW_VERSION"
else
    log_warning "Not logged in to NPM. Skipping NPM publish."
    log_info "To publish manually, run: npm publish --access public"
fi

# Create GitHub release (requires gh CLI)
if command -v gh &> /dev/null; then
    log_info "Creating GitHub release..."

    # Generate release notes from commits since last tag
    LAST_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
    if [ -n "$LAST_TAG" ]; then
        RELEASE_NOTES=$(git log "$LAST_TAG"..HEAD --pretty=format:"- %s (%h)" --no-merges)
    else
        RELEASE_NOTES=$(git log --pretty=format:"- %s (%h)" --no-merges -n 10)
    fi

    # Create release notes file
    NOTES_FILE=$(mktemp)
    cat > "$NOTES_FILE" << EOF
# Release v$NEW_VERSION

## Changes

$RELEASE_NOTES

---
*Released on $(date +%Y-%m-%d)*
EOF

    gh release create "v$NEW_VERSION" \
        --title "v$NEW_VERSION" \
        --notes-file "$NOTES_FILE"

    rm "$NOTES_FILE"
    log_success "GitHub release created"
else
    log_warning "GitHub CLI (gh) not found. Skipping GitHub release creation."
    log_info "To create release manually, visit: https://github.com/hesedcasa/chrome-devtools-cli/releases/new?tag=v$NEW_VERSION"
fi

echo ""
log_success "🎉 Release v$NEW_VERSION completed successfully!"
echo ""
log_info "Next steps:"
echo "  • Verify NPM package: https://www.npmjs.com/package/chrome-devtools-cli"
echo "  • Verify GitHub release: https://github.com/hesedcasa/chrome-devtools-cli/releases"
echo "  • Test installation: npm install -g chrome-devtools-cli@$NEW_VERSION"
echo ""
