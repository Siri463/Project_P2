# GitHub Push Guide - RevTickets

## Files Excluded from Git (Large Files)

The following large files/folders are now ignored:

### Backend
- `target/` - Maven build output (~100MB+)
- `*.jar`, `*.war` - Compiled artifacts
- `backend/public/display/*` - Uploaded display images
- `backend/public/banner/*` - Uploaded banner images
- `.mvn/`, `mvnw`, `mvnw.cmd` - Maven wrapper

### Frontend
- `node_modules/` - NPM dependencies (~500MB+)
- `dist/` - Angular build output
- `.angular/` - Angular cache
- `package-lock.json` - Lock file (optional)

### IDE & OS
- `.idea/`, `.vscode/` - IDE settings
- `.DS_Store`, `Thumbs.db` - OS files

## Steps to Push to GitHub

### 1. Clean Existing Git Cache (if already initialized)
```bash
cd e:\Rev_Tickets\RevTickets
git rm -r --cached .
git add .
git commit -m "Apply .gitignore and remove large files"
```

### 2. Initialize Git (if new repo)
```bash
cd e:\Rev_Tickets\RevTickets
git init
git add .
git commit -m "Initial commit - RevTickets project"
```

### 3. Add Remote Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/RevTickets.git
```

### 4. Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## If Still Too Large

### Check Repository Size
```bash
git count-objects -vH
```

### Find Large Files
```bash
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sed -n 's/^blob //p' | sort --numeric-sort --key=2 | tail -n 10
```

### Additional Files to Exclude

Add to `.gitignore` if needed:
```
# All markdown documentation (optional)
*.md

# Test files
**/*test*/
**/*Test*/

# Logs
**/*.log

# Temporary files
**/*.tmp
**/*.temp
```

## Recommended: Create .gitattributes

Create `.gitattributes` file:
```
# Auto detect text files and perform LF normalization
* text=auto

# Java files
*.java text diff=java
*.gradle text diff=java
*.properties text

# Angular/TypeScript files
*.ts text
*.js text
*.json text
*.html text
*.css text
*.scss text

# Binary files
*.jar binary
*.war binary
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.pdf binary
```

## Project Size After Cleanup

Expected size: **< 50MB** (without node_modules, target, images)

## Setup Instructions for Other Developers

After cloning:

### Backend
```bash
cd backend
mvn clean install
```

### Frontend
```bash
cd frontend
npm install
```

### Create Upload Directories
Directories are preserved with `.gitkeep` files:
- `backend/public/display/`
- `backend/public/banner/`

## Important Notes

1. **Never commit**:
   - `node_modules/`
   - `target/`
   - Uploaded images
   - Environment files with secrets

2. **Always commit**:
   - Source code
   - Configuration templates
   - Documentation
   - `.gitkeep` files for empty directories

3. **Use environment variables** for:
   - Database credentials
   - API keys
   - JWT secrets
   - Razorpay keys

## Troubleshooting

### Error: "file too large"
```bash
# Remove file from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch PATH_TO_LARGE_FILE" \
  --prune-empty --tag-name-filter cat -- --all
```

### Error: "remote rejected"
- Check GitHub file size limit (100MB per file)
- Use Git LFS for large files if needed
- Verify .gitignore is working

### Clean and Re-push
```bash
rm -rf .git
git init
git add .
git commit -m "Clean initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main --force
```
