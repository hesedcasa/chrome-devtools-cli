# Release Process

This document describes how to release a new version of `chrome-devtools-cli` to GitHub and NPM.

## Prerequisites

Before releasing, ensure you have:

1. **NPM Account & Access**
   - An NPM account with publish access to the `chrome-devtools-cli` package
   - Logged in to NPM: `npm login`
   - Or set `NPM_TOKEN` environment variable for CI/CD

2. **GitHub CLI (Optional but Recommended)**
   - Install: `brew install gh` (macOS) or `sudo apt install gh` (Linux)
   - Authenticate: `gh auth login`
   - Used for creating GitHub releases automatically

3. **Clean Working Directory**
   - All changes committed
   - No uncommitted files

4. **Latest Code**
   - Your branch is up to date with the remote

## Release Commands

We use semantic versioning (MAJOR.MINOR.PATCH):

### Patch Release (Bug fixes)

```bash
npm run release:patch
```

Example: `1.0.0` → `1.0.1`

Use for:

- Bug fixes
- Documentation updates
- Minor tweaks

### Minor Release (New features)

```bash
npm run release:minor
```

Example: `1.0.0` → `1.1.0`

Use for:

- New features
- Non-breaking changes
- Feature enhancements

### Major Release (Breaking changes)

```bash
npm run release:major
```

Example: `1.0.0` → `2.0.0`

Use for:

- Breaking API changes
- Major refactors
- Incompatible changes

## What the Release Script Does

The automated release script (`scripts/release.sh`) performs these steps:

1. **Validation**
   - ✓ Checks working directory is clean
   - ✓ Verifies branch is up to date with remote
   - ✓ Validates release type (patch/minor/major)

2. **Build & Test**
   - ✓ Installs dependencies (`npm ci`)
   - ✓ Builds the project (`npm run build`)
   - ✓ Runs tests if available (`npm test`)

3. **Version Bump**
   - ✓ Updates `package.json` version
   - ✓ Creates a git commit with message "Release v<version>" (e.g., "Release v1.2.3")
   - ✓ Creates a git tag `vX.Y.Z`

4. **Publish**
   - ✓ Pushes commits to GitHub (with retry logic)
   - ✓ Pushes tags to GitHub
   - ✓ Publishes package to NPM registry
   - ✓ Creates GitHub release with auto-generated notes

5. **Verification**
   - ✓ Provides links to verify the release
   - ✓ Suggests next steps

## Manual Release Process

If you need to release manually:

### 1. Bump Version

```bash
# Choose one:
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### 2. Build

```bash
npm run build
```

### 3. Push to GitHub

```bash
git push -u origin <branch-name>
git push --tags
```

### 4. Publish to NPM

```bash
npm publish --access public
```

### 5. Create GitHub Release

```bash
# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")

# Create release
gh release create "v$NEW_VERSION" \
  --title "v$NEW_VERSION" \
  --generate-notes
```

## Before Each Release

1. **Update CHANGELOG.md**
   - Move items from `[Unreleased]` to new version section
   - Add release date
   - Add comparison links

   Example:

   ```markdown
   ## [1.2.0] - 2025-01-13

   ### Added

   - New feature X
   - New feature Y

   ### Fixed

   - Bug Z

   [1.2.0]: https://github.com/hesedcasa/chrome-devtools-cli/compare/v1.1.0...v1.2.0
   ```

2. **Review Changes**

   ```bash
   # See commits since last tag
   git log $(git describe --tags --abbrev=0)..HEAD --oneline
   ```

3. **Test Locally**
   ```bash
   npm run build
   npm start
   ```

## After Each Release

1. **Verify NPM Package**
   - Visit: https://www.npmjs.com/package/chrome-devtools-cli
   - Check version is published
   - Verify README displays correctly

2. **Verify GitHub Release**
   - Visit: https://github.com/hesedcasa/chrome-devtools-cli/releases
   - Check release notes
   - Verify tag is present

3. **Test Installation**

   ```bash
   # In a separate directory
   npm install -g chrome-devtools-cli@latest
   chrome-mcp-cli --version
   ```

4. **Announce (Optional)**
   - Create a discussion in GitHub Discussions
   - Tweet or share on social media
   - Update documentation site if applicable

## Troubleshooting

### NPM Publish Fails

```bash
# Check if logged in
npm whoami

# If not, login
npm login

# Or set token
export NPM_TOKEN=your-token-here
```

### GitHub Push Fails (403 Error)

- Ensure you have push access to the branch and that your branch name follows your organization's contribution guidelines
- Check git remote: `git remote -v`
- Verify GitHub authentication: `git push --dry-run`

### Git Tag Already Exists

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag (careful!)
git push --delete origin v1.0.0
```

### Release Script Fails Mid-way

The script uses `set -e` (exit on error), so it stops at the first failure.

To recover:

1. Fix the issue
2. Check current version: `npm version`
3. If version was bumped but not pushed, you can push manually
4. If version wasn't bumped, run the script again

## CI/CD Integration

To automate releases in CI/CD (GitHub Actions example):

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Release type'
        required: true
        type: choice
        options:
          - patch
          - minor
          - major

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci

      - run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"

      - run: npm run release:${{ inputs.release_type }}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Security

- **Never commit NPM tokens** to the repository
- Use environment variables or GitHub Secrets
- Enable 2FA on your NPM account
- Review `scripts/release.sh` for any sensitive operations

## Support

If you encounter issues with the release process:

1. Check this documentation
2. Review the script: `scripts/release.sh`
3. Open an issue: https://github.com/hesedcasa/chrome-devtools-cli/issues
