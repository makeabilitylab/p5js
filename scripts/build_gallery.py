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
import html
from pathlib import Path
from collections import defaultdict

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REPO_ROOT = Path(os.getcwd())
BASE_URL = ""  # Relative paths work for GitHub Pages

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
    """Return the filename of a screenshot image if one exists."""
    for name in ("screenshot.png", "screenshot.jpg", "screenshot.gif",
                 "thumbnail.png", "thumbnail.jpg", "thumbnail.gif"):
        if (app_dir / name).exists():
            return name
    return None


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

        title = extract_title_from_html(index_file)
        screenshot = has_screenshot(index_file.parent)

        entries.append({
            "category": category,
            "subcategory": subcategory,
            "name": name,
            "rel_path": str(rel).replace("\\", "/"),
            "title": title,
            "screenshot": screenshot,
        })

    return entries


# ---------------------------------------------------------------------------
# HTML Generation
# ---------------------------------------------------------------------------

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


def build_html(entries: list[dict]) -> str:
    """Generate the full gallery HTML string."""

    # Group: category -> subcategory -> [entries]
    grouped = defaultdict(lambda: defaultdict(list))
    for e in entries:
        sub = e["subcategory"] or ""
        grouped[e["category"]][sub].append(e)

    # Sort categories alphabetically
    sorted_categories = sorted(grouped.keys())

    # Count totals
    total = len(entries)
    cat_count = len(sorted_categories)

    # Build category nav and sections
    nav_items = []
    sections = []

    for category in sorted_categories:
        subs = grouped[category]
        cat_total = sum(len(v) for v in subs.values())
        cat_id = category.lower().replace(" ", "-")
        nav_items.append(
            f'<a class="nav-pill" href="#{cat_id}">'
            f'{html.escape(category)}'
            f'<span class="pill-count">{cat_total}</span></a>'
        )

        cards_html = ""

        # Sort subcategories: empty string (no sub) first, then alpha
        sorted_subs = sorted(subs.keys(), key=lambda s: (s != "", s))

        for sub in sorted_subs:
            items = subs[sub]
            if sub:
                cards_html += (
                    f'<h3 class="subcategory">{html.escape(human_readable(sub))}</h3>\n'
                )

            for item in sorted(items, key=lambda x: x["name"]):
                display_name = item["title"] or human_readable(item["name"])
                path = item["rel_path"]
                code_url = f"https://github.com/makeabilitylab/p5js/tree/master/{path}"

                thumb = ""
                if item["screenshot"]:
                    thumb = (
                        f'<div class="card-thumb">'
                        f'<img src="{path}/{item["screenshot"]}" '
                        f'alt="{html.escape(display_name)} screenshot" loading="lazy">'
                        f'</div>'
                    )

                cards_html += f"""      <div class="card">
        {thumb}<div class="card-body">
          <div class="card-name">{html.escape(display_name)}</div>
          <div class="card-meta">{html.escape(item['name'])}</div>
          <div class="card-links">
            <a href="{path}/" class="btn btn-primary" aria-label="Run {html.escape(display_name)}">▶ Run</a>
            <a href="{code_url}" class="btn btn-secondary" aria-label="View source for {html.escape(display_name)}">Code</a>
          </div>
        </div>
      </div>\n"""

        sections.append(
            f'<section id="{cat_id}">\n'
            f'  <h2>{html.escape(category)}'
            f'<span class="section-count">{cat_total} example{"s" if cat_total != 1 else ""}</span></h2>\n'
            f'  <div class="grid">\n{cards_html}  </div>\n'
            f'</section>\n'
        )

    nav_html = "\n    ".join(nav_items)
    sections_html = "\n".join(sections)

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

    body {{
      font-family: var(--font-sans);
      background: var(--color-bg);
      color: var(--color-text);
      line-height: 1.6;
    }}

    /* --- Header --- */
    .site-header {{
      padding: 2.5rem 2rem 1.5rem;
      max-width: 1120px;
      margin: 0 auto;
    }}
    .site-header h1 {{
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }}
    .site-header h1 span {{ color: var(--color-accent); }}
    .site-header p {{
      color: var(--color-muted);
      font-size: 0.95rem;
      margin-top: 0.35rem;
    }}
    .header-links {{
      margin-top: 0.75rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.85rem;
    }}
    .header-links a {{
      color: var(--color-accent);
      text-decoration: none;
    }}
    .header-links a:hover {{ text-decoration: underline; }}

    /* --- Search & Filter --- */
    .controls {{
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--color-bg);
      border-bottom: 1px solid var(--color-border);
      padding: 0.75rem 2rem;
    }}
    .controls-inner {{
      max-width: 1120px;
      margin: 0 auto;
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

    .category-nav {{
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.6rem;
    }}
    .nav-pill {{
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.25rem 0.65rem;
      font-size: 0.8rem;
      border-radius: 999px;
      background: var(--color-card-bg);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      text-decoration: none;
      transition: background 0.15s, border-color 0.15s;
    }}
    .nav-pill:hover {{ background: var(--color-accent-light); border-color: var(--color-accent); }}
    .pill-count {{
      font-size: 0.7rem;
      background: var(--color-accent-light);
      color: var(--color-accent);
      padding: 0.1rem 0.4rem;
      border-radius: 999px;
      font-weight: 600;
    }}

    /* --- Sections & Cards --- */
    main {{
      max-width: 1120px;
      margin: 0 auto;
      padding: 1.5rem 2rem 4rem;
    }}

    section {{ margin-bottom: 2.5rem; }}
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
      margin: 1.25rem 0 0.5rem;
    }}

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
    .card.hidden, section.hidden {{ display: none; }}
    .subcategory.hidden {{ display: none; }}

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
    @media (max-width: 640px) {{
      .site-header {{ padding: 1.5rem 1rem 1rem; }}
      .controls {{ padding: 0.5rem 1rem; }}
      main {{ padding: 1rem; }}
      .grid {{ grid-template-columns: 1fr; }}
    }}
  </style>
</head>
<body>

  <header class="site-header">
    <h1>Makeability Lab — <span>p5.js Examples</span></h1>
    <p>{total} examples across {cat_count} categories for teaching, learning, and experimenting.</p>
    <div class="header-links">
      <a href="https://github.com/makeabilitylab/p5js">GitHub Repo</a>
      <a href="https://makeabilitylab.github.io/physcomp/">Physical Computing Course</a>
      <a href="https://github.com/makeabilitylab/js">Makeability Lab JS Library</a>
      <a href="https://jonfroehlich.github.io/">Jon E. Froehlich</a>
    </div>
  </header>

  <div class="controls" role="search">
    <div class="controls-inner">
      <input
        class="search-box"
        type="search"
        id="search"
        placeholder="Search examples…"
        aria-label="Search examples"
      >
      <nav class="category-nav" aria-label="Category filters">
        {nav_html}
      </nav>
    </div>
  </div>

  <main>
    {sections_html}
  </main>

  <footer class="site-footer">
    Built with ❤️ by the <a href="https://makeabilitylab.cs.washington.edu/">Makeability Lab</a>
    at the University of Washington.
    Page auto-generated by
    <a href="https://github.com/makeabilitylab/p5js/blob/master/scripts/build_gallery.py">build_gallery.py</a>.
  </footer>

  <script>
    // Simple client-side search
    const searchBox = document.getElementById('search');
    const cards = document.querySelectorAll('.card');
    const sections = document.querySelectorAll('section');
    const subcategories = document.querySelectorAll('.subcategory');

    searchBox.addEventListener('input', () => {{
      const q = searchBox.value.toLowerCase().trim();

      cards.forEach(card => {{
        const text = card.textContent.toLowerCase();
        card.classList.toggle('hidden', q && !text.includes(q));
      }});

      // Hide sections where all cards are hidden
      sections.forEach(section => {{
        const visible = section.querySelectorAll('.card:not(.hidden)');
        section.classList.toggle('hidden', visible.length === 0);
      }});

      // Hide subcategory headers when no visible cards follow them
      subcategories.forEach(sub => {{
        let next = sub.nextElementSibling;
        let hasVisible = false;
        // Walk forward through siblings until next subcategory or section end
        while (next && !next.classList.contains('subcategory') && next.tagName !== 'H2') {{
          if (next.classList.contains('card') && !next.classList.contains('hidden')) {{
            hasVisible = true;
            break;
          }}
          // Check inside grid containers
          if (next.classList.contains('grid')) {{
            const visCards = next.querySelectorAll('.card:not(.hidden)');
            if (visCards.length > 0) {{ hasVisible = true; break; }}
          }}
          next = next.nextElementSibling;
        }}
        sub.classList.toggle('hidden', !hasVisible);
      }});
    }});
  </script>

</body>
</html>"""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
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
