#!/usr/bin/env python3
"""
migrate_serial_imports.py — Migrate WebSerial examples from the old
_libraries/serial.js to the new Makeability Lab JS library CDN.

This script performs two replacements:

  1. In HTML files: replaces any <script> tag loading serial.js (whether via
     a relative path like ../../_libraries/serial.js or the old CDN URL
     cdn.jsdelivr.net/gh/makeabilitylab/p5js/_libraries/serial.js) with
     the new CDN URL from makeabilitylab/js.

  2. In jsconfig.json files: removes the "../../../_libraries/serial.js"
     entry from the "include" array, since the library is now loaded via
     CDN and the local file no longer exists.

Run from the repository root:
    python scripts/migrate_serial_imports.py

Preview what would change (dry run):
    python scripts/migrate_serial_imports.py --dry-run
"""

import argparse
import re
from pathlib import Path

# The old import patterns (both relative and CDN)
OLD_RELATIVE_PATTERN = re.compile(
    r'<script\s+src="[^"]*_libraries/serial\.js"\s*>\s*</script>',
    re.IGNORECASE
)
OLD_CDN_PATTERN = re.compile(
    r'<script\s+src="https://cdn\.jsdelivr\.net/gh/makeabilitylab/p5js/_libraries/serial\.js"\s*>\s*</script>',
    re.IGNORECASE
)

# The new CDN import
NEW_SCRIPT_TAG = '<script src="https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.serial.iife.js"></script>'

# jsconfig.json: remove the serial.js entry from include arrays
JSCONFIG_SERIAL_PATTERN = re.compile(
    r'\s*"[^"]*_libraries/serial\.js"\s*,?\s*',
)


def migrate_html(path: Path, dry_run: bool) -> bool:
    """Replace old serial.js script tags in an HTML file. Returns True if changed."""
    text = path.read_text(encoding="utf-8", errors="replace")
    original = text

    # Replace both patterns
    text = OLD_CDN_PATTERN.sub(NEW_SCRIPT_TAG, text)
    text = OLD_RELATIVE_PATTERN.sub(NEW_SCRIPT_TAG, text)

    if text != original:
        if dry_run:
            print(f"  [html] would update: {path}")
        else:
            path.write_text(text, encoding="utf-8")
            print(f"  [html] updated: {path}")
        return True
    return False


def migrate_jsconfig(path: Path, dry_run: bool) -> bool:
    """Remove _libraries/serial.js from jsconfig.json include. Returns True if changed."""
    text = path.read_text(encoding="utf-8", errors="replace")
    original = text

    # Only proceed if the file actually references _libraries/serial.js
    if not JSCONFIG_SERIAL_PATTERN.search(text):
        return False

    # Remove the serial.js entry
    text = JSCONFIG_SERIAL_PATTERN.sub("", text)

    # Clean up any double commas or trailing commas before ] that we caused
    text = re.sub(r',\s*,', ',', text)
    text = re.sub(r',\s*\]', '\n  ]', text)

    if text != original:
        if dry_run:
            print(f"  [json] would update: {path}")
        else:
            path.write_text(text, encoding="utf-8")
            print(f"  [json] updated: {path}")
        return True
    return False


def main():
    parser = argparse.ArgumentParser(description="Migrate serial.js imports to new CDN")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show what would change without modifying files")
    args = parser.parse_args()

    root = Path(".")
    html_count = 0
    json_count = 0

    print("Scanning for old serial.js imports...\n")

    # Migrate HTML files
    for html_file in sorted(root.rglob("index.html")):
        if migrate_html(html_file, args.dry_run):
            html_count += 1

    # Migrate jsconfig.json files
    for json_file in sorted(root.rglob("jsconfig.json")):
        if migrate_jsconfig(json_file, args.dry_run):
            json_count += 1

    print(f"\n{'Would update' if args.dry_run else 'Updated'}: "
          f"{html_count} HTML files, {json_count} jsconfig.json files")

    if not args.dry_run and (html_count > 0 or json_count > 0):
        print("\nDon't forget to delete _libraries/serial.js (or the whole _libraries/ dir).")


if __name__ == "__main__":
    main()