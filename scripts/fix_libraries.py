#!/usr/bin/env python3
"""
fix_libraries.py — Pin all CDN library versions, replace local library
references with CDN URLs, and clean up local library copies.

Run from the repository root:

    # Preview changes (no files modified)
    python scripts/fix_libraries.py --dry-run

    # Apply all changes
    python scripts/fix_libraries.py

What this script does:
  1. Replaces all p5.js CDN imports (any version) with pinned 1.11.13
  2. Replaces all p5.sound CDN imports with pinned 1.11.13
  3. Replaces all ml5.js @latest imports with pinned 0.12.2
  4. Replaces local library/ script refs with CDN URLs
  5. Replaces p5.collide2d local ref with pinned CDN URL
  6. Deletes all libraries/ folders
  7. Adds 'libraries/' to .gitignore
"""

import argparse
import re
import shutil
from pathlib import Path
from collections import defaultdict

# ─── Pinned CDN URLs ─────────────────────────────────────────────────

PINNED = {
    "p5.js": "https://cdn.jsdelivr.net/npm/p5@1.11.13/lib/p5.min.js",
    "p5.sound": "https://cdn.jsdelivr.net/npm/p5@1.11.13/lib/addons/p5.sound.min.js",
    "ml5.js": "https://unpkg.com/ml5@0.12.2/dist/ml5.min.js",
    "p5.collide2d": "https://cdn.jsdelivr.net/gh/bmoren/p5.collide2D@0.7.3/p5.collide2d.min.js",
}

# ─── Replacement rules ───────────────────────────────────────────────
# Each rule: (name, regex matching the full <script> tag, replacement tag)

RULES = [
    # --- p5.js (CDN, any version, .js or .min.js) ---
    (
        "p5.js CDN",
        re.compile(
            r'<script\s+src="https://cdn[^"]*?/p5(?:\.min)?\.js"\s*>\s*</script>',
            re.IGNORECASE,
        ),
        f'<script src="{PINNED["p5.js"]}"></script>',
    ),
    # p5.js via jsdelivr npm (the unversioned one)
    (
        "p5.js jsdelivr npm",
        re.compile(
            r'<script\s+src="https://cdn\.jsdelivr\.net/npm/p5/lib/p5\.js"\s*>\s*</script>',
            re.IGNORECASE,
        ),
        f'<script src="{PINNED["p5.js"]}"></script>',
    ),
    # --- p5.sound (CDN, any version) ---
    (
        "p5.sound CDN",
        re.compile(
            r'<script\s+src="https://cdn[^"]*?/p5\.sound(?:\.min)?\.js"\s*>\s*</script>',
            re.IGNORECASE,
        ),
        f'<script src="{PINNED["p5.sound"]}"></script>',
    ),
    # --- p5.dom (old addon, removed in p5.js 1.0+, just delete it) ---
    (
        "p5.dom CDN (obsolete)",
        re.compile(
            r'<script\s+src="https://cdn[^"]*?/p5\.dom(?:\.min)?\.js"\s*>\s*</script>',
            re.IGNORECASE,
        ),
        "",  # Remove entirely — p5.dom was merged into p5.js core in 1.0
    ),
    # --- ml5.js @latest ---
    (
        "ml5.js CDN",
        re.compile(
            r'<script\s+src="https://unpkg\.com/ml5@[^"]*"\s*>\s*</script>',
            re.IGNORECASE,
        ),
        f'<script src="{PINNED["ml5.js"]}"></script>',
    ),
    # --- Local library references ---
    # Local p5.js
    (
        "local p5.js",
        re.compile(
            r'<script\s+src="[^"]*libraries/p5(?:\.min)?\.js"\s*>\s*</script>',
            re.IGNORECASE,
        ),
        f'<script src="{PINNED["p5.js"]}"></script>',
    ),
    # Local p5.sound
    (
        "local p5.sound",
        re.compile(
            r'<script\s+src="[^"]*libraries/p5\.sound(?:\.min)?\.js"\s*>\s*</script>',
            re.IGNORECASE,
        ),
        f'<script src="{PINNED["p5.sound"]}"></script>',
    ),
    # Local ml5
    (
        "local ml5.js",
        re.compile(
            r'<script\s+src="[^"]*libraries/ml5(?:\.min)?\.js"\s*>\s*</script>',
            re.IGNORECASE,
        ),
        f'<script src="{PINNED["ml5.js"]}"></script>',
    ),
    # Local p5.collide2d
    (
        "local p5.collide2d",
        re.compile(
            r'<script\s+src="[^"]*libraries/p5\.collide2d(?:\.min)?\.js"\s*>\s*</script>',
            re.IGNORECASE,
        ),
        f'<script src="{PINNED["p5.collide2d"]}"></script>',
    ),
]


def extract_old_versions(text):
    """Extract current library versions from an HTML file before fixing."""
    versions = {}
    # p5.js version from cdnjs path (/p5.js/1.1.9/)
    m = re.search(r'cdnjs\.cloudflare\.com/ajax/libs/p5\.js/(\d+\.\d+\.\d+)/', text)
    if m:
        versions["p5.js"] = m.group(1)
    # p5.js version from jsdelivr npm (p5@1.11.13)
    m = re.search(r'cdn\.jsdelivr\.net/npm/p5@(\d+\.\d+\.\d+)/', text)
    if m:
        versions["p5.js"] = m.group(1)
    # p5.js from jsdelivr (unversioned)
    if re.search(r'cdn\.jsdelivr\.net/npm/p5/lib/p5\.js', text):
        versions["p5.js"] = "(unversioned)"
    # ml5 version
    m = re.search(r'unpkg\.com/ml5@([^/]+)/', text)
    if m:
        versions["ml5.js"] = m.group(1)
    # local p5.js
    if re.search(r'src="[^"]*libraries/p5(?:\.min)?\.js"', text):
        versions["p5.js"] = "(local copy)"
    # local ml5
    if re.search(r'src="[^"]*libraries/ml5(?:\.min)?\.js"', text):
        versions["ml5.js"] = "(local copy)"
    return versions


def fix_html_file(path: Path, dry_run: bool) -> tuple[list[str], dict]:
    """Apply all replacement rules to one HTML file.
    Returns (list of change names, dict of old versions)."""
    text = path.read_text(encoding="utf-8", errors="replace")
    original = text
    old_versions = extract_old_versions(text)
    changes = []

    for name, pattern, replacement in RULES:
        if pattern.search(text):
            text = pattern.sub(replacement, text)
            changes.append(name)

    # Clean up any blank lines left by removed tags (like p5.dom)
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)

    if text != original:
        if not dry_run:
            path.write_text(text, encoding="utf-8")
        return changes, old_versions
    return [], {}


def delete_libraries_folders(root: Path, dry_run: bool) -> list[str]:
    """Find and delete all libraries/ folders. Returns list of deleted paths."""
    deleted = []
    for lib_dir in sorted(root.rglob("libraries")):
        if not lib_dir.is_dir():
            continue
        rel = lib_dir.relative_to(root)
        if any(p.startswith(".") or p == "node_modules" for p in rel.parts):
            continue
        # Only delete if it contains .js files (avoid false positives)
        js_files = list(lib_dir.glob("*.js"))
        if not js_files:
            continue
        size_kb = sum(f.stat().st_size for f in lib_dir.rglob("*") if f.is_file()) / 1024
        deleted.append(f"{rel} ({size_kb:.0f} KB, {len(js_files)} files)")
        if not dry_run:
            shutil.rmtree(lib_dir)
    return deleted


def update_gitignore(root: Path, dry_run: bool) -> bool:
    """Add 'libraries/' to .gitignore if not already present."""
    gitignore = root / ".gitignore"
    if gitignore.exists():
        content = gitignore.read_text(encoding="utf-8", errors="replace")
        if "libraries/" in content:
            return False
        if not dry_run:
            with open(gitignore, "a", encoding="utf-8") as f:
                f.write("\n# Local library copies (use CDN instead)\nlibraries/\n")
        return True
    else:
        if not dry_run:
            gitignore.write_text(
                "# Local library copies (use CDN instead)\nlibraries/\n",
                encoding="utf-8",
            )
        return True


def main():
    parser = argparse.ArgumentParser(description="Fix all library imports")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview changes without modifying files")
    args = parser.parse_args()

    root = Path(".")
    verb = "Would" if args.dry_run else "Will"

    print("=" * 64)
    print(f"FIX LIBRARIES {'(DRY RUN)' if args.dry_run else ''}")
    print("=" * 64)
    print(f"\n  Pinned versions:")
    for name, url in PINNED.items():
        print(f"    {name}: {url}")

    # Step 1: Fix HTML files
    print(f"\n{'─' * 64}")
    print("STEP 1: Fix <script> imports in HTML files")
    print("─" * 64)

    change_summary = defaultdict(int)
    files_changed = 0
    # Track version migrations: lib -> old_version -> [files]
    version_migrations = defaultdict(lambda: defaultdict(list))

    for html_file in sorted(root.rglob("*.html")):
        rel = html_file.relative_to(root)
        if any(p.startswith(".") or p == "node_modules" for p in rel.parts):
            continue
        changes, old_versions = fix_html_file(html_file, args.dry_run)
        if changes:
            files_changed += 1
            print(f"  {'[dry]' if args.dry_run else '[fix]'} {rel}")
            for c in changes:
                change_summary[c] += 1
                print(f"         → {c}")
            for lib, old_ver in old_versions.items():
                version_migrations[lib][old_ver].append(str(rel))

    print(f"\n  {verb} update {files_changed} HTML files:")
    for change_type, count in sorted(change_summary.items()):
        print(f"    {count:3d}× {change_type}")

    # Version migration detail
    if version_migrations:
        print(f"\n{'─' * 64}")
        print("VERSION MIGRATIONS — spot-check these!")
        print("─" * 64)
        # Map lib names to their pinned version numbers
        pinned_versions = {
            "p5.js": "1.11.13",
            "p5.sound": "1.11.13",
            "ml5.js": "0.12.2",
            "p5.collide2d": "0.7.3",
        }
        for lib in sorted(version_migrations.keys()):
            new_ver = pinned_versions.get(lib, "pinned")
            by_version = version_migrations[lib]
            for old_ver in sorted(by_version.keys()):
                files = by_version[old_ver]
                risk = ""
                if old_ver in ("latest", "(unversioned)", "(local copy)"):
                    risk = " ⚠️  WAS BROKEN"
                elif old_ver.startswith("0."):
                    risk = " ⚠️  BIG JUMP — spot-check!"
                elif old_ver != new_ver:
                    risk = ""
                print(f"\n  {lib}: {old_ver} → {new_ver}  ({len(files)} files){risk}")
                if risk or len(files) <= 5:
                    for f in files:
                        print(f"    {f}")
                else:
                    for f in files[:3]:
                        print(f"    {f}")
                    print(f"    ... and {len(files) - 3} more")

    # Step 2: Delete libraries/ folders
    print(f"\n{'─' * 64}")
    print("STEP 2: Delete local libraries/ folders")
    print("─" * 64)

    deleted = delete_libraries_folders(root, args.dry_run)
    if deleted:
        for d in deleted:
            print(f"  {'[dry]' if args.dry_run else '[del]'} {d}")
        total = len(deleted)
        print(f"\n  {verb} delete {total} libraries/ folders.")
    else:
        print("  No libraries/ folders found.")

    # Step 3: Update .gitignore
    print(f"\n{'─' * 64}")
    print("STEP 3: Update .gitignore")
    print("─" * 64)

    if update_gitignore(root, args.dry_run):
        print(f"  {verb} add 'libraries/' to .gitignore")
    else:
        print("  .gitignore already has 'libraries/' entry.")

    # Summary
    print(f"\n{'=' * 64}")
    if args.dry_run:
        print("DRY RUN COMPLETE — no files were modified.")
        print("Run without --dry-run to apply changes.")
    else:
        print("DONE! All libraries pinned and local copies removed.")
        print("\nNext steps:")
        print("  1. Test a few examples in the browser to verify")
        print("  2. git add -A && git commit -m 'Pin all CDN library versions, remove local copies'")
        print("  3. git push")
    print("=" * 64)


if __name__ == "__main__":
    main()
