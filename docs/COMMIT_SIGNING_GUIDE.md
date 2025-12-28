# Commit Signing & Verification Guide

**Repository**: MNNRAPP/mnnr-complete2025  
**Last Updated**: December 27, 2025  
**Purpose**: Enable GPG commit signing for enhanced security

---

## 🔐 Why Sign Commits?

Commit signing provides cryptographic proof that commits were created by you, preventing:

- **Impersonation**: Someone else committing as you
- **Tampering**: Modification of commit history
- **Supply Chain Attacks**: Malicious code injection

**GitHub displays a "Verified" badge** on signed commits, building trust in your codebase.

---

## 📋 Prerequisites

- Git 2.0+ installed
- GPG (GNU Privacy Guard) installed
- GitHub account

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install GPG

**macOS**:
```bash
brew install gnupg
```

**Ubuntu/Debian**:
```bash
sudo apt-get install gnupg
```

**Windows**:
- Download from: https://www.gnupg.org/download/
- Or use: `choco install gnupg`

### Step 2: Generate GPG Key

```bash
# Generate a new GPG key
gpg --full-generate-key

# Follow the prompts:
# 1. Select: RSA and RSA (default)
# 2. Key size: 4096 bits
# 3. Expiration: 1 year (recommended)
# 4. Name: Your full name
# 5. Email: Your GitHub email (must match!)
# 6. Comment: (optional)
# 7. Passphrase: Strong password
```

### Step 3: List Your GPG Keys

```bash
# List GPG keys
gpg --list-secret-keys --keyid-format=long

# Output will look like:
# sec   rsa4096/3AA5C34371567BD2 2025-12-27 [SC] [expires: 2026-12-27]
#       ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234
# uid                 [ultimate] Your Name <your.email@example.com>
# ssb   rsa4096/4BB6D45482678BE3 2025-12-27 [E] [expires: 2026-12-27]

# Copy the GPG key ID (after rsa4096/): 3AA5C34371567BD2
```

### Step 4: Export Public Key

```bash
# Replace KEY_ID with your key ID from step 3
gpg --armor --export KEY_ID

# Copy the entire output, including:
# -----BEGIN PGP PUBLIC KEY BLOCK-----
# ...
# -----END PGP PUBLIC KEY BLOCK-----
```

### Step 5: Add Key to GitHub

1. Go to: https://github.com/settings/keys
2. Click "New GPG key"
3. Paste your public key
4. Click "Add GPG key"

### Step 6: Configure Git

```bash
# Set your GPG key (replace KEY_ID)
git config --global user.signingkey KEY_ID

# Enable commit signing by default
git config --global commit.gpgsign true

# Enable tag signing by default
git config --global tag.gpgsign true

# Set GPG program (if needed)
git config --global gpg.program gpg
```

### Step 7: Test Signing

```bash
# Create a test commit
echo "test" > test.txt
git add test.txt
git commit -S -m "test: Verify GPG signing"

# Verify the signature
git log --show-signature -1

# You should see "Good signature from..."
```

---

## 🔧 Configuration

### Per-Repository Setup

If you only want signing for this repository:

```bash
cd /path/to/mnnr-complete2025

# Enable signing for this repo only
git config commit.gpgsign true
git config tag.gpgsign true
git config user.signingkey KEY_ID
```

### Multiple Email Addresses

If you use different emails for different repos:

```bash
# In each repository
git config user.email "your.email@example.com"
git config user.signingkey KEY_ID_FOR_THIS_EMAIL
```

### GPG Agent Configuration

Create `~/.gnupg/gpg-agent.conf`:

```conf
# Cache passphrase for 8 hours
default-cache-ttl 28800
max-cache-ttl 28800

# Use pinentry for passphrase entry
pinentry-program /usr/bin/pinentry-curses
```

Reload GPG agent:
```bash
gpg-connect-agent reloadagent /bye
```

---

## ✅ Verification

### Verify Your Commits on GitHub

1. Push a signed commit
2. Go to the commit on GitHub
3. Look for the "Verified" badge next to your commit

### Verify Locally

```bash
# Verify last commit
git log --show-signature -1

# Verify specific commit
git verify-commit COMMIT_SHA

# Verify tag
git verify-tag TAG_NAME
```

---

## 🐛 Troubleshooting

### "gpg failed to sign the data"

**Solution 1**: Set GPG_TTY environment variable
```bash
export GPG_TTY=$(tty)

# Add to ~/.bashrc or ~/.zshrc
echo 'export GPG_TTY=$(tty)' >> ~/.bashrc
```

**Solution 2**: Test GPG directly
```bash
echo "test" | gpg --clearsign
```

**Solution 3**: Kill and restart GPG agent
```bash
gpgconf --kill gpg-agent
gpg-agent --daemon
```

### "No secret key"

Your key might have expired or been deleted:

```bash
# List keys
gpg --list-secret-keys --keyid-format=long

# If no keys, generate a new one (Step 2)
```

### "Email doesn't match"

Git email must match GPG key email:

```bash
# Check Git email
git config user.email

# Check GPG key email
gpg --list-keys

# Update Git email to match
git config --global user.email "your.gpg.email@example.com"
```

### Passphrase Prompt Every Time

Configure GPG agent to cache passphrase (see GPG Agent Configuration above).

---

## 🔄 Key Management

### Backup Your Key

**CRITICAL**: Backup your private key securely!

```bash
# Export private key (KEEP SECURE!)
gpg --export-secret-keys --armor KEY_ID > private-key-backup.asc

# Store in a secure location:
# - Password manager
# - Encrypted USB drive
# - Secure cloud storage
```

### Restore Key on New Machine

```bash
# Import private key
gpg --import private-key-backup.asc

# Trust the key
gpg --edit-key KEY_ID
# Type: trust
# Select: 5 (ultimate)
# Type: quit
```

### Revoke a Key

If your key is compromised:

```bash
# Generate revocation certificate
gpg --output revoke.asc --gen-revoke KEY_ID

# Import revocation
gpg --import revoke.asc

# Upload to GitHub and key servers
```

### Renew Expired Key

```bash
# Edit key
gpg --edit-key KEY_ID

# Extend expiration
expire
# Select new expiration date
save

# Re-export and update on GitHub
gpg --armor --export KEY_ID
```

---

## 🏢 Team Setup

### For Team Leads

1. **Require signed commits** via branch protection:
   - Go to: Repository Settings → Branches
   - Edit branch protection rule for `main`
   - Enable "Require signed commits"

2. **Document the process**:
   - Share this guide with team
   - Add to onboarding checklist
   - Provide support for setup

3. **Verify team compliance**:
   ```bash
   # Check recent commits
   git log --show-signature -10
   ```

### For Team Members

1. Follow Quick Setup above
2. Test with a small commit
3. Verify "Verified" badge appears on GitHub
4. Contact team lead if issues arise

---

## 📊 Verification Status

### Check Repository Signing Status

```bash
# Check last 20 commits
git log --pretty=format:"%h %G? %aN %s" -20

# Legend:
# G = Good signature
# B = Bad signature
# U = Good signature, unknown validity
# X = Good signature, expired
# Y = Good signature, expired key
# R = Good signature, revoked key
# E = Cannot be checked
# N = No signature
```

### Enforce Signing in Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
if ! git verify-commit HEAD 2>/dev/null; then
    echo "Error: Commit must be signed"
    exit 1
fi
```

---

## 🔗 Resources

### Official Documentation

- **Git Signing**: https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work
- **GitHub GPG**: https://docs.github.com/en/authentication/managing-commit-signature-verification
- **GPG Manual**: https://www.gnupg.org/documentation/

### Tools

- **GPG Suite (macOS)**: https://gpgtools.org/
- **Gpg4win (Windows)**: https://www.gpg4win.org/
- **Keybase**: https://keybase.io/ (alternative key management)

### Security Best Practices

- **Key length**: 4096 bits minimum
- **Expiration**: 1-2 years (renewable)
- **Passphrase**: Strong, unique password
- **Backup**: Secure offline backup
- **Revocation**: Generate revocation certificate immediately

---

## 📝 Quick Reference

### Essential Commands

```bash
# Generate key
gpg --full-generate-key

# List keys
gpg --list-secret-keys --keyid-format=long

# Export public key
gpg --armor --export KEY_ID

# Configure Git
git config --global user.signingkey KEY_ID
git config --global commit.gpgsign true

# Sign commit
git commit -S -m "message"

# Verify commit
git verify-commit COMMIT_SHA

# Show signature
git log --show-signature -1
```

### Git Aliases

Add to `~/.gitconfig`:

```ini
[alias]
    # Sign and commit
    cs = commit -S
    
    # Verify last commit
    verify = log --show-signature -1
    
    # Show signing status
    slog = log --pretty=format:"%h %G? %aN %s"
```

---

## ✅ Checklist

- [ ] GPG installed
- [ ] GPG key generated (4096-bit RSA)
- [ ] Public key added to GitHub
- [ ] Git configured with signing key
- [ ] Commit signing enabled globally
- [ ] Test commit created and verified
- [ ] "Verified" badge appears on GitHub
- [ ] Private key backed up securely
- [ ] Revocation certificate generated
- [ ] Team members notified (if applicable)

---

## 🎯 Next Steps

1. **Enable signing** for all future commits
2. **Verify badges** appear on GitHub
3. **Backup your key** securely
4. **Share with team** if working collaboratively
5. **Set expiration reminder** for key renewal

---

**For questions or issues, refer to the Troubleshooting section or contact the security team.**

**Last Updated**: December 27, 2025  
**Maintained by**: MNNR Security Team
