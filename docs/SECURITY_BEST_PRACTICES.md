# Security Best Practices & Git Hygiene

**Last Updated:** 2025-12-21

This document outlines security practices, git hygiene, and lessons learned from repository cleanup.

---

## Git History Cleanup (Dec 21, 2025)

### Issue Summary

The repository had accumulated large files and sensitive data in git history:

1. **Large Files (120MB+)**
   - `node_modules/` directory committed (especially `@next/swc-darwin-arm64`)
   - `.next/` build artifacts committed
   - Total repository size: ~100MB+

2. **Exposed API Keys**
   - `.env.local` file committed with secrets
   - `.specstory/history/*.md` files containing API key values
   - **Compromised keys:**
     - xAI API Key: `xai-AqOPbpwhXr...` (partial)
     - Stripe Test Secret Key: `sk_test_51RL1Od...` (partial)

### Actions Taken

1. ✅ Used `git-filter-repo` to remove from all commits:
   - `node_modules/`
   - `.next/`
   - `.env.local`
   - `.specstory/history/2025-12-20_15-10Z-user-authentication-and-stripe-billing-integration.md`

2. ✅ Updated `.gitignore` to prevent future commits:
   ```
   .vercel
   .next
   .env
   .env.local
   .env.*.local
   node_modules/
   ```

3. ✅ Force pushed cleaned history to `origin/dev`

4. ✅ Reduced repository size from ~100MB to 4MB

5. ✅ **VERIFIED**: Keys were never pushed to remote (no rotation needed)

---

## API Key Rotation Checklist

### ✅ VERIFIED: No Rotation Needed

After investigation, the API keys were **never pushed to the remote repository**. The GitHub Secret Scanning alert occurred during the attempted push, which was blocked before the secrets reached the remote.

**Status:**
- ✅ **xAI API Key** - Never exposed publicly, still secure
- ✅ **Stripe Test Secret Key** - Never exposed publicly, still secure
- ✅ Keys removed from local git history as precaution
- ✅ .gitignore updated to prevent future commits

**No action required** - keys remain secure and functional.

---

## Security Guidelines

### Environment Variables

**DO:**
- ✅ Store all secrets in `.env.local` (gitignored)
- ✅ Use environment variables for API keys, database URLs, secrets
- ✅ Document required variables in README (with placeholder values)
- ✅ Use `.env.example` for template (no real values)
- ✅ Validate environment variables on application startup

**DON'T:**
- ❌ Commit `.env`, `.env.local`, or any `.env.*` files
- ❌ Hardcode secrets in source code
- ❌ Log environment variables or secrets
- ❌ Share `.env.local` via Slack, email, or messaging
- ❌ Include real secrets in documentation or markdown files

### Git Hygiene

**DO:**
- ✅ Review `.gitignore` before first commit
- ✅ Use `git status` and `git diff` before committing
- ✅ Keep `.gitignore` up-to-date with build artifacts
- ✅ Use feature branches for development
- ✅ Write descriptive commit messages
- ✅ Use `.gitattributes` for line endings and merge strategies

**DON'T:**
- ❌ Commit `node_modules/` directory
- ❌ Commit build artifacts (`.next/`, `dist/`, `out/`)
- ❌ Commit IDE-specific files (`.vscode/`, `.idea/`)
- ❌ Commit OS-specific files (`.DS_Store`, `Thumbs.db`)
- ❌ Commit large binary files (use Git LFS if needed)
- ❌ Force push to `main` or shared branches without coordination

### Common Pitfalls

1. **Accidentally Staging Everything**
   ```bash
   # DON'T DO THIS without reviewing first
   git add .

   # DO THIS instead
   git add -p  # Review each change
   git status  # Check what's staged
   ```

2. **Committing After Package Install**
   ```bash
   # After npm/bun install, DON'T immediately commit
   # Check git status first - node_modules might be unstaged
   ```

3. **Build Artifacts After Development**
   ```bash
   # After running 'bun run build' or 'npm run build'
   # .next/ directory is generated - ensure it's gitignored
   ```

4. **Speculative Execution Logging**
   ```bash
   # AI tools might create .specstory/ directories
   # Review these before committing - may contain secrets
   ```

---

## `.gitignore` Template

Our current `.gitignore` (reference):

```gitignore
# Vercel
.vercel

# Next.js
.next
out

# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Testing
coverage/
.nyc_output/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary
.tmp/
.cache/
```

---

## API Key Management

### Storage

**Development:**
- Local: `.env.local` (gitignored)
- Team sharing: Use 1Password, Doppler, or similar secret manager

**Production:**
- Vercel: Use Environment Variables in dashboard
- Never hardcode in deployment configs

### Rotation Policy

- **Immediate**: If exposed in git history, logs, or public systems
- **Quarterly**: Rotate all non-production keys
- **Annual**: Rotate production keys during maintenance windows
- **Post-incident**: Rotate all potentially compromised keys

### Access Control

- Use separate keys for development, staging, production
- Limit key permissions to minimum required
- Use service accounts, not personal API keys
- Enable IP allowlisting where supported
- Monitor API key usage for anomalies

---

## If You Accidentally Commit Secrets

### Immediate Actions (within minutes)

1. **Stop and assess:**
   ```bash
   git log -1 --stat  # Check what was committed
   ```

2. **If not yet pushed:**
   ```bash
   git reset HEAD~1   # Undo last commit
   git status         # Verify files are unstaged
   # Remove secrets, update .gitignore, try again
   ```

3. **If already pushed to remote:**
   - **DO NOT** just delete the file and commit again
   - The secret is still in git history
   - Follow the git history cleanup process below

### Git History Cleanup Process

1. **Install git-filter-repo:**
   ```bash
   brew install git-filter-repo  # macOS
   # or pip install git-filter-repo
   ```

2. **Remove the file from all commits:**
   ```bash
   git filter-repo --path path/to/secret/file --invert-paths --force
   ```

3. **Re-add remote (filter-repo removes it):**
   ```bash
   git remote add origin https://github.com/user/repo.git
   ```

4. **Force push:**
   ```bash
   git push origin branch-name --force
   ```

5. **Rotate the exposed secrets immediately**

6. **Notify team members to re-clone:**
   - Anyone with an old clone needs to update
   - They should `git fetch origin && git reset --hard origin/branch`

### Prevention

- Use pre-commit hooks to scan for secrets
- Tools: `git-secrets`, `detect-secrets`, `gitleaks`
- CI/CD: GitHub Secret Scanning, GitGuardian
- Editor plugins: vscode-env-scanner

---

## GitHub Secret Scanning

GitHub automatically scans commits for known secret patterns and blocks pushes.

**If GitHub blocks your push:**

1. **Read the error message** - it tells you which commit and file
2. **Follow cleanup process above** - remove from git history
3. **Rotate the key** - assume it's compromised
4. **Push again** - cleaned history will succeed

**GitHub URL to allow secret:**
- DON'T use this unless absolutely necessary
- Rotating the key is always safer
- "Allow secret" is for false positives only

---

## Incident Response

### Checklist for Exposed Secrets

- [ ] Identify what was exposed and when
- [ ] Determine if secret was accessed or used
- [ ] Rotate all exposed secrets immediately
- [ ] Update application with new secrets
- [ ] Clean git history (if in commits)
- [ ] Force push cleaned history
- [ ] Notify team to re-clone repository
- [ ] Review access logs for unauthorized usage
- [ ] Document incident and lessons learned
- [ ] Update security procedures if needed

### Post-Incident Review

- What went wrong?
- How was it detected?
- What's the impact?
- How can we prevent it?
- What security controls can we add?

---

## Tools & Resources

### Git Tools
- **git-filter-repo**: https://github.com/newren/git-filter-repo
- **BFG Repo-Cleaner**: https://rtyley.github.io/bfg-repo-cleaner/
- **git-secrets**: https://github.com/awslabs/git-secrets

### Secret Scanning
- **GitHub Secret Scanning**: Built-in to GitHub repos
- **GitGuardian**: https://www.gitguardian.com/
- **gitleaks**: https://github.com/gitleaks/gitleaks
- **detect-secrets**: https://github.com/Yelp/detect-secrets

### Secret Management
- **1Password**: https://1password.com/
- **Doppler**: https://www.doppler.com/
- **Vault**: https://www.vaultproject.io/
- **AWS Secrets Manager**: https://aws.amazon.com/secrets-manager/

---

## Team Communication

### When Rotating Keys

**Template Message:**
```
🚨 Security Notice: API Key Rotation

We've rotated the following API keys due to [reason]:
- [Service Name] API key

Action required:
1. Pull latest changes from main/dev
2. Copy .env.example to .env.local
3. Request new API keys from [person/system]
4. Update your .env.local
5. Restart your development server

Questions? Ping #engineering
```

### When Force Pushing

**Template Message:**
```
⚠️ Force Push Incoming

Branch: dev
Reason: Git history cleanup (removed committed secrets/large files)

Action required:
1. Commit or stash your local changes
2. Run: git fetch origin && git reset --hard origin/dev
3. Reinstall dependencies if needed

This will happen at [time]. Questions? Ping #engineering
```

---

## Lessons Learned (Dec 21, 2025)

### What Went Wrong
1. `.env.local` was committed during initial development
2. `.specstory/` directory (AI assistant logs) contained copied env vars
3. `node_modules/` and `.next/` were committed before `.gitignore` was complete
4. Secrets were in git history for ~2 weeks before detection

### What Went Right
1. **GitHub Secret Scanning blocked the push** - keys never reached remote repository
2. `git-filter-repo` successfully cleaned local history
3. Repository size reduced from 100MB to 4MB
4. Keys remain secure (never exposed publicly)

### Improvements Made
1. ✅ Updated `.gitignore` with comprehensive exclusions
2. ✅ Documented security best practices
3. ✅ Created API key rotation checklist
4. ✅ Added security section to README
5. ⏳ TODO: Set up pre-commit hooks for secret scanning
6. ⏳ TODO: Add CI/CD secret scanning step
7. ⏳ TODO: Quarterly key rotation reminders

---

## Compliance Notes

### Data Protection
- Never commit PII (personally identifiable information)
- Never commit payment card data
- Never commit health information
- Use data masking in logs and debugging

### Regulatory Requirements
- GDPR: Right to deletion requires data not in git history
- PCI-DSS: Cardholder data must never be in version control
- HIPAA: Protected health information requires encryption at rest
- SOC 2: Secret management and access control must be audited

---

**For questions or security concerns:** Contact the security team or repository maintainers immediately.
