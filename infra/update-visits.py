#!/usr/bin/env python3
"""
Bake visitor counts into config/visits.json.

The site embeds a hidden badge <img> on each page, which makes the badge
service tally a hit server-side on every real visit. That count can't be
read from the browser (the badge sends no CORS header), so instead this
script reads it server-side — from CI, where CORS doesn't apply — and
writes a static JSON the site serves same-origin.

Run by .github/workflows/visitor-count.yml on a daily cron. Safe to run
locally too. Adding a page = one line in PAGES.
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

# page_id must match what the badge <img> and desktop.js use:
#   `pauljunsukhan.com` + window.location.pathname
PAGES = [
    "pauljunsukhan.com/",
    "pauljunsukhan.com/desktop/writing/ai-will-not-tell-you-your-database-schema-sucks/",
    "pauljunsukhan.com/desktop/projects/biohacking/",
]

BADGE = "https://visitor-badge.laobi.icu/badge?page_id={}"
OUT = Path(__file__).resolve().parent.parent / "config" / "visits.json"


def read_count(page_id: str) -> int | None:
    url = BADGE.format(urllib.parse.quote(page_id, safe=""))
    try:
        with urllib.request.urlopen(url, timeout=20) as resp:
            svg = resp.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001 - any failure → keep prior value
        print(f"warn: {page_id}: {e}", file=sys.stderr)
        return None
    nums = re.findall(r">(\d+)</text>", svg)
    return int(nums[-1]) if nums else None


def main() -> int:
    # Start from existing values so a transient fetch failure never
    # regresses a count to zero.
    counts = {}
    if OUT.exists():
        counts = json.loads(OUT.read_text())

    for page in PAGES:
        n = read_count(page)
        if n is not None:
            counts[page] = n
        counts.setdefault(page, 0)

    OUT.write_text(json.dumps(counts, indent=2) + "\n")
    print(json.dumps(counts, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
