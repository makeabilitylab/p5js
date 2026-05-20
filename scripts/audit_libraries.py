#!/usr/bin/env python3
"""
audit_libraries.py — Scan the p5js repo for library import issues.

Reports:
  1. Version summary: every version of every library in use (CDN + local)
  2. CDN imports grouped by library, with pinning status
  3. Local library copies checked into the repo (with detected versions)
  4. Recommended pinned versions and migration plan

Run from the repository root:
    python scripts/audit_libraries.py
"""

import re
import os
from pathlib import Path
from collections import defaultdict

REPO_ROOT = Path(os.getcwd())

# Regex to extract script src from HTML files
SCRIPT_SRC = re.compile(r'<script\s+[^>]*src="([^"]+)"', re.IGNORECASE)

# Known CDN patterns and how to extract their version
CDN_LIBS = {
    "p5.js": {
        "detect": re.compile(r'(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com).*?/p5(\.min)?\.js'),
        "version_re": re.compile(r'/(\d+\.\d+\.\d+)/'),
        "npm_re": re.compile(r'@(\d+[\d.]*)')
    },
    "p5.sound": {
        "detect": re.compile(r'(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com).*?p5\.sound'),
        "version_re": re.compile(r'/(\d+\.\d+\.\d+)/'),
        "npm_re": re.compile(r'@(\d+[\d.]*)')
    },
    "ml5.js": {
        "detect": re.compile(r'(unpkg\.com|cdn\.jsdelivr\.net).*ml5'),
        "version_re": re.compile(r'/(\d+\.\d+\.\d+)/'),
        "npm_re": re.compile(r'@(\d+[\d.]*)')
    },
    "serial.js (old p5js repo)": {
        "detect": re.compile(r'makeabilitylab/p5js/_libraries/serial'),
        "version_re": None,
        "npm_re": None
    },
    "serial.js (new makelab)": {
        "detect": re.compile(r'makeabilitylab/js.*makelab\.serial'),
        "version_re": None,
        "npm_re": None
    },
}

# How to detect versions in local minified library files
LOCAL_VERSION_PATTERNS = [
    # ml5: look for "ml5","version":"X.Y.Z" or ml5\nversion X.Y.Z
    re.compile(r'"ml5"[^}]*"version"\s*:\s*"(\d+\.\d+\.\d+)"'),
    re.compile(r'ml5[^"]*version["\s:]*(\d+\.\d+\.\d+)'),
    # p5.js: look for p5.js vX.Y.Z or "version":"X.Y.Z"
    re.compile(r'p5\.js\s+v(\d+\.\d+\.\d+)'),
    re.compile(r'"version"\s*:\s*"(\d+\.\d+\.\d+)"'),
    # p5.sound
    re.compile(r'p5\.sound\.js\s+v(\d+\.\d+\.\d+)'),
    # generic: first semver in first 500 chars
]

# Recommended pinned versions
RECOMMENDED = {
    "p5.js": {
        "version": "1.11.13",
        "url": "https://cdn.jsdelivr.net/npm/p5@1.11.13/lib/p5.min.js",
        "note": "Latest 1.x (use jsdelivr, not cdnjs). p5.js 2.x has breaking changes.",
    },
    "p5.sound": {
        "version": "1.11.13",
        "url": "https://cdn.jsdelivr.net/npm/p5@1.11.13/lib/addons/p5.sound.min.js",
        "note": "Bundled with p5.js on jsdelivr. Match your p5.js version.",
    },
    "ml5.js": {
        "version": "0.12.2",
        "url": "https://unpkg.com/ml5@0.12.2/dist/ml5.min.js",
        "note": "Last 0.x release. ml5 1.x has a completely different API.",
    },
    "serial.js": {
        "version": "n/a (from makeabilitylab/js)",
        "url": "https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.serial.iife.js",
        "note": "Already migrated via migrate_serial_imports.py.",
    },
}


def extract_version_from_url(src):
    """Try to extract a version number from a CDN URL."""
    # @latest
    if "@latest" in src:
        return "@latest"
    # @X.Y.Z
    m = re.search(r'@(\d+\.\d+[\d.]*)', src)
    if m:
        return m.group(1)
    # /X.Y.Z/ in path (cdnjs style)
    m = re.search(r'/(\d+\.\d+\.\d+)/', src)
    if m:
        return m.group(1)
    return None


def detect_local_version(filepath):
    """Try to detect the version of a local .js library file."""
    try:
        # Read first 5000 chars (version info is near the top)
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            head = f.read(5000)
    except Exception:
        return None

    name = filepath.name.lower()

    # p5.js: look for "p5.js vX.Y.Z"
    if "p5" in name and "sound" not in name and "ml5" not in name:
        m = re.search(r'p5\.js\s+v(\d+\.\d+\.\d+)', head)
        if m:
            return m.group(1)

    # p5.sound: look for "p5.sound.js vX.Y.Z"
    if "sound" in name:
        m = re.search(r'p5\.sound\.js\s+v(\d+\.\d+\.\d+)', head)
        if m:
            return m.group(1)

    # ml5: version is buried deep in minified code, read more
    if "ml5" in name:
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            # Look for the ml5 package.json embedded in the bundle
            m = re.search(r'"ml5"[^}]*?"version"\s*:\s*"(\d+\.\d+\.\d+)"', content)
            if m:
                return m.group(1)
            # Also try: version,"X.Y.Z" near "ml5"
            m = re.search(r'version[,:"\']+\s*(\d+\.\d+\.\d+)', content)
            if m:
                return m.group(1)
        except Exception:
            pass

    # Generic: first semver in file header
    m = re.search(r'(\d+\.\d+\.\d+)', head)
    if m:
        return f"{m.group(1)} (guessed)"

    return "unknown"


def classify_import(src):
    """Classify a script src as a known library or other."""
    for lib_name, info in CDN_LIBS.items():
        if info["detect"].search(src):
            return lib_name
    if src.startswith("http"):
        return "other CDN"
    if "libraries/" in src:
        return "local copy"
    return "local/relative"


def scan_html_files():
    """Find all script src attributes in HTML files."""
    results = []
    for html_file in sorted(REPO_ROOT.rglob("*.html")):
        rel = html_file.relative_to(REPO_ROOT)
        if any(p.startswith(".") or p == "node_modules" for p in rel.parts):
            continue
        try:
            content = html_file.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for match in SCRIPT_SRC.finditer(content):
            results.append((str(rel), match.group(1)))
    return results


def find_local_libraries():
    """Find all .js files in libraries/ folders."""
    results = []
    for js_file in sorted(REPO_ROOT.rglob("libraries/*.js")):
        rel = js_file.relative_to(REPO_ROOT)
        if any(p.startswith(".") or p == "node_modules" for p in rel.parts):
            continue
        size_kb = js_file.stat().st_size / 1024
        version = detect_local_version(js_file)
        results.append((str(rel), size_kb, version))
    return results


def main():
    print("=" * 72)
    print("LIBRARY AUDIT — makeabilitylab/p5js")
    print("=" * 72)

    imports = scan_html_files()
    html_files = set(f for f, _ in imports)
    print(f"\nScanned {len(html_files)} HTML files, found {len(imports)} <script> imports.\n")

    # ===== VERSION SUMMARY (the big picture) =====
    # Collect all versions per library from CDN imports
    cdn_versions = defaultdict(lambda: defaultdict(list))  # lib -> version -> [files]
    other_imports = []

    for filepath, src in imports:
        lib = classify_import(src)
        if lib in ("other CDN", "local copy", "local/relative"):
            if lib == "local copy":
                other_imports.append((filepath, src, lib))
            continue
        version = extract_version_from_url(src) or "(no version)"
        cdn_versions[lib][version].append(filepath)

    # Collect local library versions
    local_libs = find_local_libraries()
    local_versions = defaultdict(lambda: defaultdict(list))  # lib_name -> version -> [paths]
    for path, size_kb, version in local_libs:
        filename = Path(path).name
        v = version or "unknown"
        local_versions[filename][v].append(path)

    print("=" * 72)
    print("VERSION SUMMARY — What versions are you actually using?")
    print("=" * 72)

    for lib_name in sorted(cdn_versions.keys()):
        versions = cdn_versions[lib_name]
        total_files = sum(len(f) for f in versions.values())
        n_versions = len(versions)
        status = "⚠️  MULTIPLE VERSIONS" if n_versions > 1 else ""
        broken = any(v == "@latest" or v == "(no version)" for v in versions)
        if broken:
            status = "🔴 BROKEN/AT RISK"

        print(f"\n  {lib_name} — {total_files} files, {n_versions} version(s) {status}")
        for version in sorted(versions.keys()):
            files = versions[version]
            icon = "🔴" if version in ("@latest", "(no version)") else "✅"
            print(f"    {icon} v{version}: {len(files)} file(s)")
            if version in ("@latest", "(no version)") and len(files) <= 8:
                for f in files:
                    print(f"         {f}")

    if local_versions:
        print(f"\n  --- Local library copies (in libraries/ folders) ---")
        for filename in sorted(local_versions.keys()):
            versions = local_versions[filename]
            total = sum(len(p) for p in versions.values())
            print(f"\n  {filename} — {total} copies:")
            for version, paths in sorted(versions.items()):
                print(f"    📦 v{version}: {len(paths)} copies")
                for p in paths[:5]:
                    size = next((s for path, s, _ in local_libs if path == p), 0)
                    print(f"         {p} ({size:.0f} KB)")
                if len(paths) > 5:
                    print(f"         ... and {len(paths) - 5} more")

    # ===== DETAILED CDN IMPORT TABLE =====
    print(f"\n{'=' * 72}")
    print("DETAILED CDN IMPORTS")
    print("=" * 72)

    for lib_name in sorted(cdn_versions.keys()):
        versions = cdn_versions[lib_name]
        total = sum(len(f) for f in versions.values())
        print(f"\n  {lib_name} ({total} imports):")

        # Show unique URLs
        url_to_files = defaultdict(list)
        for filepath, src in imports:
            if classify_import(src) == lib_name:
                url_to_files[src].append(filepath)

        for url in sorted(url_to_files.keys()):
            files = url_to_files[url]
            v = extract_version_from_url(url) or "none"
            icon = "🔴" if v in ("@latest", "none") else "✅"
            print(f"    {icon} {url}")
            print(f"       Version: {v} | {len(files)} file(s)")

    # ===== LOCAL COPY STATS =====
    if local_libs:
        total_size = sum(s for _, s, _ in local_libs)
        print(f"\n{'=' * 72}")
        print(f"LOCAL LIBRARY COPIES — {len(local_libs)} files, {total_size / 1024:.1f} MB total")
        print("=" * 72)

        # Check which local copies are actually referenced in HTML
        local_refs = set()
        for filepath, src in imports:
            if "libraries/" in src:
                local_refs.add(Path(src).name)

        all_local_names = set(Path(p).name for p, _, _ in local_libs)
        referenced = all_local_names & local_refs
        orphaned = all_local_names - local_refs

        if referenced:
            print(f"\n  Referenced in HTML: {', '.join(sorted(referenced))}")
        if orphaned:
            print(f"  NOT referenced (orphaned): {', '.join(sorted(orphaned))}")
        print(f"\n  These are redundant if CDN versions are pinned.")
        print(f"  Removing them saves {total_size / 1024:.1f} MB from your repo.")

    # ===== RECOMMENDATIONS =====
    print(f"\n{'=' * 72}")
    print("RECOMMENDED PINNED VERSIONS")
    print("=" * 72)

    for lib, info in RECOMMENDED.items():
        print(f"\n  {lib}:")
        print(f"    Pin to:  {info['url']}")
        print(f"    Note:    {info['note']}")

    print(f"\n{'=' * 72}")
    print("ACTION PLAN")
    print("=" * 72)
    print("""
  1. FIX BROKEN: Replace all @latest and unversioned CDN imports
     with pinned versions (see recommended versions above).

  2. STANDARDIZE: Pick one version of p5.js for the whole repo.
     Your examples currently use multiple versions — this is fine
     functionally but confusing for students.

  3. DELETE LOCAL COPIES: Remove all libraries/ folders and add
     'libraries/' to .gitignore. These bloat the repo and create
     version confusion (the local file may differ from the CDN URL
     in the same index.html).

  4. PREVENT FUTURE ISSUES: Never use @latest in teaching examples.
     Always pin to a specific version like @0.12.2 or /1.11.13/.
""")


if __name__ == "__main__":
    main()
