#!/usr/bin/env python3
"""
build_gallery.py — Auto-generate an interactive gallery page for the
Makeability Lab p5.js example repository.

Walks the repo tree looking for index.html files, groups them by
category (top-level folder) and optional subcategory, and writes a
self-contained index.html to the repo root.

Run from the repository root:
    python scripts/build_gallery.py

The generated index.html is meant to be served via GitHub Pages and
should NOT be edited by hand — it is overwritten on every build.
"""

import os
import re
import sys
import json
import html
import argparse
from pathlib import Path
from collections import defaultdict

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REPO_ROOT = Path(os.getcwd())
BASE_URL = ""  # Relative paths work for GitHub Pages
DEFAULT_BRANCH = "main"
GITHUB_REPO = "makeabilitylab/p5js"

# Where scripts/capture_previews.mjs writes auto-generated thumbnails:
#   previews/<rel_path>.webp        (animated loop)
#   previews/<rel_path>.poster.png  (static fallback / reduced-motion)
PREVIEWS_DIR = REPO_ROOT / "previews"

# Final-tier fallback when an example has no preview/poster/screenshot: a single
# emoji keyed on its top-level category. Unknown categories fall back to 🎨.
CATEGORY_EMOJI = {
    "Animation": "🎞️",
    "Art": "🎨",
    "Color": "🌈",
    "DOM": "📄",
    "Drawing": "✏️",
    "Games": "🎮",
    "Interaction": "🖱️",
    "ml5js": "🤖",
    "PerlinNoise": "🌫️",
    "Sound": "🔊",
    "Vectors": "➗",
    "WebSerial": "🔌",
}

# Directories that should never be treated as example categories.
EXCLUDED_DIRS = {
    "_libraries",
    "_p5types",
    ".vscode",
    ".github",
    "scripts",
    "node_modules",
    "Arduino",       # Contains .ino files, not web examples
    "Node",          # Node.js experiments, not browser demos
    "Sandbox",       # Scratch / WIP folder
    "Templates",     # Starter templates, not finished demos
}

# ---------------------------------------------------------------------------
# Discovery
# ---------------------------------------------------------------------------

def extract_title_from_html(index_path: Path) -> str | None:
    """Try to pull a <title> from the index.html file."""
    try:
        text = index_path.read_text(encoding="utf-8", errors="ignore")
        match = re.search(r"<title>(.*?)</title>", text, re.IGNORECASE | re.DOTALL)
        if match:
            title = match.group(1).strip()
            # Skip generic / empty titles
            if title and title.lower() not in ("", "p5.js", "p5js", "index"):
                return title
    except Exception:
        pass
    return None


def has_screenshot(app_dir: Path) -> str | None:
    """Return the filename of a hand-added screenshot image if one exists."""
    for name in ("screenshot.png", "screenshot.jpg", "screenshot.gif",
                 "thumbnail.png", "thumbnail.jpg", "thumbnail.gif"):
        if (app_dir / name).exists():
            return name
    return None


def find_preview(rel_path: str) -> dict:
    """
    Look up auto-generated previews for an example (see capture_previews.mjs).

    Returns {"webp": <relpath|None>, "poster": <relpath|None>} where each value
    is a path relative to the repo root (forward slashes), or None if absent.
    """
    webp = PREVIEWS_DIR / f"{rel_path}.webp"
    poster = PREVIEWS_DIR / f"{rel_path}.poster.png"
    return {
        "webp": f"previews/{rel_path}.webp" if webp.exists() else None,
        "poster": f"previews/{rel_path}.poster.png" if poster.exists() else None,
    }


def discover_examples():
    """
    Walk the repo and find all directories containing an index.html.

    Returns a list of dicts:
        { category, subcategory, name, rel_path, title, screenshot }
    """
    entries = []

    for index_file in sorted(REPO_ROOT.rglob("index.html")):
        # Compute path relative to repo root
        rel = index_file.parent.relative_to(REPO_ROOT)
        parts = rel.parts  # e.g. ("Sound", "FrequencyBarGraph1-Simple")

        if not parts:
            continue  # root index.html — skip (that's us)

        # Skip excluded top-level dirs
        if parts[0] in EXCLUDED_DIRS:
            continue

        # Skip hidden directories
        if any(p.startswith(".") for p in parts):
            continue

        # Category is always the first directory
        category = parts[0]

        # Name is the immediate parent of index.html
        name = parts[-1]

        # Subcategory: if depth >= 3 (e.g. WebSerial/p5js/CircleSizeIn)
        # the middle segments form the subcategory path
        if len(parts) >= 3:
            subcategory = "/".join(parts[1:-1])
        elif len(parts) == 2:
            subcategory = None
        else:
            subcategory = None

        # Skip if this looks like a nested non-example dir
        # (e.g. Arduino/ folders inside examples that hold .ino companion code)
        if any(p in ("Arduino", "AdafruitCpx") for p in parts[1:]):
            continue

        rel_path = str(rel).replace("\\", "/")
        title = extract_title_from_html(index_file)
        screenshot = has_screenshot(index_file.parent)
        preview = find_preview(rel_path)

        entries.append({
            "category": category,
            "subcategory": subcategory,
            "name": name,
            "rel_path": rel_path,
            "title": title,
            "screenshot": screenshot,
            "preview_webp": preview["webp"],
            "preview_poster": preview["poster"],
        })

    return entries


# ---------------------------------------------------------------------------
# HTML Generation
# ---------------------------------------------------------------------------

def slugify(text: str) -> str:
    """Make a stable, URL-safe anchor id from a category/subcategory name."""
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def human_readable(name: str) -> str:
    """Turn 'FrequencyBarGraph1-Simple' into 'Frequency Bar Graph 1 – Simple'."""
    # Protect known compound terms from being split
    protected = {
        "p5js": "p5.js", "ml5js": "ml5.js", "p5.js": "p5.js",
        "PoseNet": "PoseNet", "HandPose": "HandPose",
        "WebSerial": "Web Serial", "WiFi": "WiFi",
    }
    for key, replacement in protected.items():
        if name.lower() == key.lower():
            return replacement
        name = re.sub(re.escape(key), f"\x00{replacement}\x00", name, flags=re.IGNORECASE)

    # Insert space before uppercase letters preceded by a lowercase letter
    name = re.sub(r"([a-z])([A-Z])", r"\1 \2", name)
    # Insert space before a digit sequence preceded by a letter
    name = re.sub(r"([A-Za-z])(\d)", r"\1 \2", name)
    # Replace hyphens and underscores with spaces
    name = name.replace("-", " – ").replace("_", " ")
    # Restore protected terms
    name = name.replace("\x00", "")
    return name


def thumb_html(item: dict, category: str, display_name: str) -> str:
    """
    Build a card thumbnail, picking the best available tier (graceful degradation):
        animated .webp (+ poster for reduced-motion)
          > static poster .png
          > hand-added screenshot.*
          > category emoji placeholder.
    """
    alt = html.escape(f"{display_name} preview")
    webp = item.get("preview_webp")
    poster = item.get("preview_poster")

    if webp:
        # Animated loop, with the poster shown instead under prefers-reduced-motion.
        anim = f'<img class="thumb-anim" src="{webp}" alt="{alt}" loading="lazy">'
        still = (f'<img class="thumb-still" src="{poster}" alt="{alt}" loading="lazy">'
                 if poster else "")
        return f'<div class="card-thumb">{anim}{still}</div>'

    if poster:
        return f'<div class="card-thumb"><img src="{poster}" alt="{alt}" loading="lazy"></div>'

    if item.get("screenshot"):
        src = f'{item["rel_path"]}/{item["screenshot"]}'
        return f'<div class="card-thumb"><img src="{src}" alt="{alt}" loading="lazy"></div>'

    # Final tier: decorative category emoji (hidden from assistive tech).
    emoji = CATEGORY_EMOJI.get(category, "🎨")
    return (f'<div class="card-thumb card-thumb-empty" aria-hidden="true">'
            f'<span class="thumb-emoji">{emoji}</span></div>')


def build_html(entries: list[dict]) -> str:
    """Generate the full gallery HTML string."""

    # Group: category -> subcategory -> [entries]
    grouped = defaultdict(lambda: defaultdict(list))
    for e in entries:
        sub = e["subcategory"] or ""
        grouped[e["category"]][sub].append(e)

    sorted_categories = sorted(grouped.keys())
    total = len(entries)
    cat_count = len(sorted_categories)

    def card_html(item: dict, category: str) -> str:
        display_name = item["title"] or human_readable(item["name"])
        path = item["rel_path"]
        code_url = f"https://github.com/{GITHUB_REPO}/tree/{DEFAULT_BRANCH}/{path}"
        thumb = thumb_html(item, category, display_name)
        return (
            '<div class="card">'
            f'{thumb}<div class="card-body">'
            f'<div class="card-name">{html.escape(display_name)}</div>'
            f'<div class="card-meta">{html.escape(item["name"])}</div>'
            '<div class="card-links">'
            f'<a href="{path}/" class="btn btn-primary" aria-label="Run {html.escape(display_name)}">▶ Run</a>'
            f'<a href="{code_url}" class="btn btn-secondary" aria-label="View source for {html.escape(display_name)}">Code</a>'
            '</div></div></div>'
        )

    def grid_html(items: list) -> str:
        cards = "\n        ".join(
            card_html(i, category) for i in sorted(items, key=lambda x: x["name"])
        )
        return f'<div class="grid">\n        {cards}\n      </div>'

    # Build the sidebar tree (category -> subcategory) and the content sections.
    tree_items = []
    sections = []

    for category in sorted_categories:
        subs = grouped[category]
        cat_total = sum(len(v) for v in subs.values())
        cat_id = slugify(category)
        sec_id = f"cat-{cat_id}"
        real_subs = sorted(s for s in subs if s)  # "" holds examples directly under cat

        # --- content section ---
        blocks = []
        if subs.get(""):
            blocks.append(grid_html(subs[""]))
        for sub in real_subs:
            sub_id = f"{sec_id}--{slugify(sub)}"
            blocks.append(
                f'<div class="subsection" id="{sub_id}">\n'
                f'        <h3 class="subcategory">{html.escape(human_readable(sub))}'
                f'<span class="sub-count">{len(subs[sub])}</span></h3>\n'
                f'        {grid_html(subs[sub])}\n      </div>'
            )
        body = "\n      ".join(blocks)
        plural = "s" if cat_total != 1 else ""
        sections.append(
            f'<section class="cat-section" id="{sec_id}">\n'
            f'      <h2>{html.escape(category)}'
            f'<span class="section-count">{cat_total} example{plural}</span></h2>\n'
            f'      {body}\n    </section>'
        )

        # --- sidebar tree entry ---
        if real_subs:
            sublinks = "\n          ".join(
                f'<li><a class="tree-sublink" href="#{sec_id}--{slugify(sub)}" '
                f'data-target="{sec_id}--{slugify(sub)}">'
                f'<span class="tree-label">{html.escape(human_readable(sub))}</span>'
                f'<span class="tree-count">{len(subs[sub])}</span></a></li>'
                for sub in real_subs
            )
            tree_items.append(
                '<li class="tree-cat">'
                '<div class="tree-cat-row">'
                f'<button class="tree-toggle" aria-expanded="true" '
                f'aria-label="Toggle {html.escape(category)} subcategories">▾</button>'
                f'<a class="tree-link" href="#{sec_id}" data-target="{sec_id}">'
                f'<span class="tree-label">{html.escape(category)}</span>'
                f'<span class="tree-count">{cat_total}</span></a>'
                '</div>'
                f'<ul class="tree-subs">\n          {sublinks}\n        </ul>'
                '</li>'
            )
        else:
            tree_items.append(
                '<li class="tree-cat tree-cat--leaf">'
                '<div class="tree-cat-row">'
                '<span class="tree-toggle tree-toggle--empty" aria-hidden="true"></span>'
                f'<a class="tree-link" href="#{sec_id}" data-target="{sec_id}">'
                f'<span class="tree-label">{html.escape(category)}</span>'
                f'<span class="tree-count">{cat_total}</span></a>'
                '</div></li>'
            )

    tree_html = "\n        ".join(tree_items)
    sections_html = "\n    ".join(sections)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <!-- ⚠️  AUTO-GENERATED by scripts/build_gallery.py — do not edit by hand. -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Makeability Lab — p5.js Examples</title>
  <meta name="description" content="Interactive gallery of {total} p5.js examples for teaching, learning, and experimenting by the Makeability Lab at the University of Washington.">
  <style>
    :root {{
      --color-bg: #fdfdfd;
      --color-text: #1a1a2e;
      --color-muted: #64748b;
      --color-border: #e2e8f0;
      --color-card-bg: #ffffff;
      --color-card-hover: #f8fafc;
      --color-accent: #4338ca;
      --color-accent-light: #e0e7ff;
      --color-accent-text: #ffffff;
      --radius: 8px;
      --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
      --font-sans: "Segoe UI", system-ui, -apple-system, sans-serif;
      --font-mono: "SF Mono", "Cascadia Code", "Fira Code", monospace;
      --topbar-h: 56px;
      --sidebar-w: 244px;
    }}

    @media (prefers-color-scheme: dark) {{
      :root {{
        --color-bg: #0f172a;
        --color-text: #e2e8f0;
        --color-muted: #94a3b8;
        --color-border: #1e293b;
        --color-card-bg: #1e293b;
        --color-card-hover: #273449;
        --color-accent: #818cf8;
        --color-accent-light: #312e81;
        --color-accent-text: #ffffff;
        --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
        --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
      }}
    }}

    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

    html {{ scroll-behavior: smooth; }}

    body {{
      font-family: var(--font-sans);
      background: var(--color-bg);
      color: var(--color-text);
      line-height: 1.6;
    }}

    /* --- Skip link (a11y) --- */
    .skip-link {{
      position: absolute;
      left: -999px;
      top: 0;
      z-index: 100;
      background: var(--color-accent);
      color: var(--color-accent-text);
      padding: 0.5rem 0.75rem;
      border-radius: 0 0 var(--radius) 0;
    }}
    .skip-link:focus {{ left: 0; }}

    /* --- Top bar --- */
    .topbar {{
      position: sticky;
      top: 0;
      z-index: 30;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      height: var(--topbar-h);
      padding: 0 1rem;
      background: var(--color-card-bg);
      border-bottom: 1px solid var(--color-border);
    }}
    .sidebar-toggle {{
      display: none;  /* shown on narrow screens */
      align-items: center;
      justify-content: center;
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      color: var(--color-text);
      font-size: 1.1rem;
      line-height: 1;
      padding: 0.3rem 0.55rem;
      cursor: pointer;
    }}
    .topbar-title {{ font-weight: 700; letter-spacing: -0.02em; font-size: 1.05rem; }}
    .topbar-title span {{ color: var(--color-accent); }}
    .topbar-links {{
      margin-left: auto;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.82rem;
    }}
    .topbar-links a {{ color: var(--color-accent); text-decoration: none; }}
    .topbar-links a:hover {{ text-decoration: underline; }}

    /* --- Two-pane layout --- */
    .layout {{ display: flex; align-items: flex-start; }}

    .sidebar {{
      flex: 0 0 var(--sidebar-w);
      width: var(--sidebar-w);
      position: sticky;
      top: var(--topbar-h);
      height: calc(100vh - var(--topbar-h));
      overflow-y: auto;
      border-right: 1px solid var(--color-border);
      background: var(--color-bg);
    }}
    .sidebar-inner {{ padding: 1rem 0.85rem 2rem; }}
    .sidebar-meta {{
      font-size: 0.72rem;
      color: var(--color-muted);
      margin: 0.6rem 0.25rem 0.4rem;
    }}

    .search-box {{
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      font-size: 0.9rem;
      background: var(--color-card-bg);
      color: var(--color-text);
      outline: none;
    }}
    .search-box:focus {{ border-color: var(--color-accent); }}
    .search-box::placeholder {{ color: var(--color-muted); }}

    /* --- Sidebar tree --- */
    .tree, .tree ul {{ list-style: none; }}
    .tree {{ margin-top: 0.25rem; font-size: 0.86rem; }}
    .tree-cat {{ margin-bottom: 0.05rem; }}
    .tree-cat-row {{ display: flex; align-items: center; gap: 0.1rem; }}
    .tree-toggle {{
      flex: 0 0 1.25rem;
      width: 1.25rem;
      height: 1.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: var(--color-muted);
      font-size: 0.7rem;
      cursor: pointer;
      border-radius: 4px;
      transition: transform 0.12s, background 0.12s;
    }}
    .tree-toggle:hover {{ background: var(--color-accent-light); color: var(--color-accent); }}
    .tree-toggle--empty {{ cursor: default; }}
    .tree-cat.collapsed > .tree-cat-row .tree-toggle {{ transform: rotate(-90deg); }}
    .tree-cat.collapsed > .tree-subs {{ display: none; }}

    .tree-link, .tree-sublink {{
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.4rem;
      padding: 0.28rem 0.5rem;
      border-radius: var(--radius);
      color: var(--color-text);
      text-decoration: none;
      transition: background 0.12s, color 0.12s;
    }}
    .tree-link {{ font-weight: 600; }}
    .tree-link:hover, .tree-sublink:hover {{ background: var(--color-card-hover); }}
    .tree-link.active, .tree-sublink.active {{
      background: var(--color-accent-light);
      color: var(--color-accent);
    }}
    .tree-label {{ overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
    .tree-subs {{
      margin: 0.05rem 0 0.3rem 1.2rem;
      padding-left: 0.4rem;
      border-left: 1px solid var(--color-border);
    }}
    .tree-sublink {{ font-size: 0.82rem; font-weight: 500; }}
    .tree-count {{
      flex: 0 0 auto;
      font-size: 0.68rem;
      font-weight: 600;
      background: var(--color-accent-light);
      color: var(--color-accent);
      padding: 0.05rem 0.4rem;
      border-radius: 999px;
    }}
    .tree-hidden {{ display: none; }}  /* toggled by search */

    /* --- Content pane & sections --- */
    .content {{
      flex: 1 1 auto;
      min-width: 0;
      padding: 1.5rem 1.75rem 4rem;
    }}
    .cat-section, .subsection {{ scroll-margin-top: calc(var(--topbar-h) + 1rem); }}
    .cat-section {{ margin-bottom: 2.5rem; }}
    .subsection {{ margin-top: 1.25rem; }}
    section h2 {{
      font-size: 1.25rem;
      font-weight: 700;
      border-bottom: 2px solid var(--color-border);
      padding-bottom: 0.4rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }}
    .section-count {{
      font-size: 0.75rem;
      font-weight: 400;
      color: var(--color-muted);
    }}
    .subcategory {{
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-muted);
      margin: 0 0 0.6rem;
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }}
    .sub-count {{ font-size: 0.72rem; font-weight: 400; color: var(--color-muted); }}

    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 0.85rem;
    }}

    .card {{
      background: var(--color-card-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: box-shadow 0.15s, transform 0.15s;
      display: flex;
      flex-direction: column;
    }}
    .card:hover {{
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }}
    .card-thumb img {{
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      display: block;
      border-bottom: 1px solid var(--color-border);
    }}
    /* Animated previews ship with a static poster; show the poster only when the
       user prefers reduced motion. The `.card-thumb img` qualifier matches the
       specificity of the sizing rule above so these display toggles actually win. */
    .card-thumb img.thumb-still {{ display: none; }}
    @media (prefers-reduced-motion: reduce) {{
      .card-thumb img.thumb-anim {{ display: none; }}
      .card-thumb img.thumb-still {{ display: block; }}
    }}
    /* Final fallback tier: a category emoji on a tinted panel. */
    .card-thumb-empty {{
      aspect-ratio: 16/9;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-accent-light);
      border-bottom: 1px solid var(--color-border);
    }}
    .thumb-emoji {{ font-size: 2.5rem; line-height: 1; }}
    .card-body {{
      padding: 0.85rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }}
    .card-name {{
      font-weight: 600;
      font-size: 0.92rem;
      line-height: 1.3;
    }}
    .card-meta {{
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--color-muted);
      margin-top: 0.2rem;
    }}
    .card-links {{
      margin-top: auto;
      padding-top: 0.6rem;
      display: flex;
      gap: 0.5rem;
    }}
    .btn {{
      display: inline-block;
      padding: 0.3rem 0.7rem;
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: var(--radius);
      text-decoration: none;
      transition: background 0.15s;
    }}
    .btn-primary {{
      background: var(--color-accent);
      color: var(--color-accent-text);
    }}
    .btn-primary:hover {{ filter: brightness(1.15); }}
    .btn-secondary {{
      background: var(--color-accent-light);
      color: var(--color-accent);
    }}
    .btn-secondary:hover {{ filter: brightness(0.95); }}

    /* --- Search filtering --- */
    .card.hidden, .cat-section.hidden, .subsection.hidden {{ display: none; }}

    /* --- Mobile drawer backdrop --- */
    .backdrop {{
      display: none;
      position: fixed;
      inset: var(--topbar-h) 0 0 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 35;
    }}
    .backdrop.show {{ display: block; }}

    /* --- Footer --- */
    .site-footer {{
      max-width: 1120px;
      margin: 0 auto;
      padding: 1.5rem 2rem;
      border-top: 1px solid var(--color-border);
      font-size: 0.8rem;
      color: var(--color-muted);
    }}
    .site-footer a {{ color: var(--color-accent); text-decoration: none; }}

    /* --- Responsive --- */
    @media (max-width: 820px) {{
      .sidebar-toggle {{ display: inline-flex; }}
      .topbar-links {{ display: none; }}
      .sidebar {{
        position: fixed;
        top: var(--topbar-h);
        left: 0;
        bottom: 0;
        height: auto;
        width: 260px;
        z-index: 40;
        transform: translateX(-100%);
        transition: transform 0.2s ease;
        box-shadow: var(--shadow-md);
      }}
      .sidebar.open {{ transform: translateX(0); }}
      .content {{ padding: 1.25rem 1rem 3rem; }}
      .grid {{ grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }}
    }}
    @media (max-width: 460px) {{
      .grid {{ grid-template-columns: 1fr 1fr; }}
    }}
    @media (prefers-reduced-motion: reduce) {{
      .sidebar {{ transition: none; }}
      html {{ scroll-behavior: auto; }}
    }}
  </style>
</head>
<body>

  <a class="skip-link" href="#content">Skip to content</a>

  <header class="topbar">
    <button class="sidebar-toggle" aria-label="Toggle category navigation" aria-expanded="false" aria-controls="sidebar">☰</button>
    <div class="topbar-title">Makeability Lab — <span>p5.js Examples</span></div>
    <nav class="topbar-links" aria-label="External links">
      <a href="https://github.com/{GITHUB_REPO}">GitHub Repo</a>
      <a href="https://makeabilitylab.github.io/physcomp/">Physical Computing Course</a>
      <a href="https://github.com/makeabilitylab/js">Makeability Lab JS Library</a>
      <a href="https://jonfroehlich.github.io/">Jon E. Froehlich</a>
    </nav>
  </header>

  <div class="backdrop" id="backdrop"></div>

  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-inner">
        <div role="search">
          <input
            class="search-box"
            type="search"
            id="search"
            placeholder="Search examples…"
            aria-label="Search examples"
          >
        </div>
        <p class="sidebar-meta">{total} examples · {cat_count} categories</p>
        <nav class="tree" aria-label="Categories">
          <ul>
            {tree_html}
          </ul>
        </nav>
      </div>
    </aside>

    <main class="content" id="content">
      {sections_html}
    </main>
  </div>

  <footer class="site-footer">
    Built with ❤️ by the <a href="https://makeabilitylab.cs.washington.edu/">Makeability Lab</a>
    at the University of Washington.
    Page auto-generated by
    <a href="https://github.com/{GITHUB_REPO}/blob/{DEFAULT_BRANCH}/scripts/build_gallery.py">build_gallery.py</a>.
  </footer>

  <script>
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const isNarrow = () => window.matchMedia('(max-width: 820px)').matches;

    // --- Mobile drawer ---
    function setDrawer(open) {{
      sidebar.classList.toggle('open', open);
      backdrop.classList.toggle('show', open);
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }}
    toggleBtn.addEventListener('click', () => setDrawer(!sidebar.classList.contains('open')));
    backdrop.addEventListener('click', () => setDrawer(false));

    // --- Collapse / expand categories ---
    $$('.tree-toggle').forEach(btn => {{
      if (btn.classList.contains('tree-toggle--empty')) return;
      btn.addEventListener('click', () => {{
        const li = btn.closest('.tree-cat');
        const collapsed = li.classList.toggle('collapsed');
        btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      }});
    }});

    // --- Close the drawer after tapping a nav link on mobile ---
    const treeLinks = $$('.tree-link, .tree-sublink');
    treeLinks.forEach(a => a.addEventListener('click', () => {{ if (isNarrow()) setDrawer(false); }}));

    // --- Live search ---
    const searchBox = document.getElementById('search');
    const cards = $$('.card');
    const sections = $$('.cat-section');
    const subsections = $$('.subsection');

    searchBox.addEventListener('input', () => {{
      const q = searchBox.value.toLowerCase().trim();
      cards.forEach(c => c.classList.toggle('hidden', q && !c.textContent.toLowerCase().includes(q)));
      subsections.forEach(s => s.classList.toggle('hidden', !s.querySelector('.card:not(.hidden)')));
      sections.forEach(s => s.classList.toggle('hidden', !s.querySelector('.card:not(.hidden)')));
      // Mirror the filtering in the sidebar tree.
      treeLinks.forEach(a => {{
        const target = document.getElementById(a.dataset.target);
        const hidden = target && target.classList.contains('hidden');
        a.closest('li').classList.toggle('tree-hidden', !!hidden);
      }});
    }});

    // --- Scroll-spy: highlight the tree entry for the section in view ---
    const linkByTarget = {{}};
    treeLinks.forEach(a => {{ linkByTarget[a.dataset.target] = a; }});
    const spyTargets = sections.concat(subsections);
    if ('IntersectionObserver' in window && spyTargets.length) {{
      const observer = new IntersectionObserver(entries => {{
        entries.forEach(en => {{
          if (!en.isIntersecting) return;
          const a = linkByTarget[en.target.id];
          if (!a) return;
          treeLinks.forEach(l => l.classList.remove('active'));
          a.classList.add('active');
          const li = a.closest('.tree-cat');
          if (li) li.classList.remove('collapsed');
        }});
      }}, {{ rootMargin: '-70px 0px -72% 0px', threshold: 0 }});
      spyTargets.forEach(t => observer.observe(t));
    }}
  </script>

</body>
</html>"""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def list_json():
    """
    Print the discovered examples as JSON to stdout and exit.

    This makes build_gallery.py the single source of truth for *which* folders
    count as examples (excluded dirs, hidden dirs, variable depth, etc.).
    scripts/capture_previews.mjs consumes this instead of re-walking the tree,
    so the gallery and the preview generator can never disagree.
    """
    json.dump(discover_examples(), sys.stdout, indent=2)
    sys.stdout.write("\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--list-json", action="store_true",
        help="Print discovered examples as JSON and exit (used by capture_previews.mjs).",
    )
    args = parser.parse_args()

    if args.list_json:
        list_json()
        return

    entries = discover_examples()

    if not entries:
        print("⚠️  No examples found. Are you running from the repo root?")
        print(f"   CWD: {os.getcwd()}")
        return

    gallery_html = build_html(entries)

    out_path = REPO_ROOT / "index.html"
    out_path.write_text(gallery_html, encoding="utf-8")
    print(f"✅ Generated gallery with {len(entries)} examples → {out_path}")

    # Print summary
    cats = defaultdict(int)
    for e in entries:
        cats[e["category"]] += 1
    for cat in sorted(cats):
        print(f"   {cat}: {cats[cat]}")


if __name__ == "__main__":
    main()