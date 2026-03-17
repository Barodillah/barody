<?php
/**
 * Simple .env loader for PHP
 * Parses variables from .env file and adds them to $_ENV and getenv()
 */

function loadEnv($path) {
    if (!file_exists($path)) {
        return false;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Split by first equals sign
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            // Remove quotes if present
            if (strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) {
                $value = substr($value, 1, -1);
            } elseif (strpos($value, "'") === 0 && strrpos($value, "'") === strlen($value) - 1) {
                $value = substr($value, 1, -1);
            }

            // Set environment variable
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv(sprintf('%s=%s', $name, $value));
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// Automatically load .env from parent directory (assuming api/ folder is one level deep)
// Adjust path if necessary based on where this script is located relative to .env
// We try multiple common locations
$possiblePaths = [
    __DIR__ . '/../.env',
    __DIR__ . '/../../.env',
    $_SERVER['DOCUMENT_ROOT'] . '/.env'
];

foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        loadEnv($path);
        break;
    }
}
?>
