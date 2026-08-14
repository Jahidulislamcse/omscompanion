<?php
/**
 * cPanel Storage Link Helper Script
 * Run this script via browser (e.g., http://your-domain.com/symlink.php) to create storage symbolic links.
 */

$target = __DIR__ . '/storage/app/public';
$linkInRoot = __DIR__ . '/storage_public';
$linkInPublic = __DIR__ . '/public/storage';

$messages = [];

if (!file_exists($target)) {
    if (!mkdir($target, 0755, true)) {
        $messages[] = "<p style='color:red;'>Error: Target directory <b>{$target}</b> does not exist and could not be created.</p>";
    }
}

// 1. Create link in root (storage_public)
if (file_exists($linkInRoot)) {
    $messages[] = "<p style='color:blue;'>Info: Symlink/Folder <b>storage_public</b> already exists in root.</p>";
} else {
    if (@symlink($target, $linkInRoot)) {
        $messages[] = "<p style='color:green;'>Success: Created symlink <b>storage_public</b> -> <b>storage/app/public</b>.</p>";
    } else {
        $messages[] = "<p style='color:orange;'>Warning: Could not create root symlink (Server may prohibit symlinks).</p>";
    }
}

// 2. Create link in public/storage
if (file_exists($linkInPublic)) {
    $messages[] = "<p style='color:blue;'>Info: Symlink/Folder <b>public/storage</b> already exists.</p>";
} else {
    if (@symlink($target, $linkInPublic)) {
        $messages[] = "<p style='color:green;'>Success: Created symlink <b>public/storage</b> -> <b>storage/app/public</b>.</p>";
    } else {
        $messages[] = "<p style='color:orange;'>Warning: Could not create public/storage symlink.</p>";
    }
}

echo "<h2>OMSCOMPANION - cPanel Storage Link Result</h2>";
foreach ($messages as $msg) {
    echo $msg;
}
echo "<br><p><b>Security Note:</b> Delete this <code>symlink.php</code> file from your server after running it.</p>";
