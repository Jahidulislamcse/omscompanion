# cPanel Deployment Guide for OMSCOMPANION

This project is fully configured to run directly inside cPanel `public_html` (or any subfolder).

---

## 1. Files Included for cPanel Setup
- `index.php`: Root entry point that initializes Laravel when project files are uploaded to `public_html`.
- `.htaccess`: Handles clean URLs, front controller routing, and **secures sensitive files** (`.env`, `storage/logs/`, `app/`, `vendor/`, `artisan`, etc.) from direct web access.
- `app/Providers/AppServiceProvider.php`: Configured with `$this->app->usePublicPath($this->app->basePath());` to bind assets correctly.
- `symlink.php`: One-click browser script to link public storage on shared hosting without SSH.

---

## 2. Step-by-Step Deployment Instructions

### Step 1: Upload Files to cPanel
1. Compress all files in this directory (including hidden files like `.htaccess` and `.env`) into a `.zip` archive.
2. Log into **cPanel File Manager**.
3. Navigate to `public_html/`.
4. Upload your `.zip` archive and **Extract** it into `public_html/`.

---

### Step 2: Configure Environment (`.env`)
1. In cPanel File Manager, ensure **Show Hidden Files** is enabled in settings.
2. Open `.env` and set:
   ```env
   APP_NAME="OMSCOMPANION"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=cpanelusername_database
   DB_USERNAME=cpanelusername_user
   DB_PASSWORD=your_strong_password
   ```

---

### Step 3: Set Directory Permissions
Make sure the following directories are writable by PHP (chmod `775` or `755`):
- `storage/` (and all subfolders `storage/app`, `storage/framework`, `storage/logs`)
- `bootstrap/cache/`

---

### Step 4: Run Storage Link
Access the following URL in your web browser:
`https://yourdomain.com/symlink.php`

> **Note:** After running `symlink.php` and confirming success, delete `symlink.php` from your server for security.

---

### Step 5: Test & Verify
Open `https://yourdomain.com` in your browser. The site should load smoothly with all Inertia/React components and compiled Vite assets in `build/`.
