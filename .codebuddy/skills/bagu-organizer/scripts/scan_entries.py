#!/usr/bin/env python3
"""Inventory MemBagu 八股 entries to assist classification and deduplication.

Usage:
    python3 scan_entries.py [repo_root]

Scans <repo>/src/data and prints a compact inventory:
  - Each library (top-level folder) with its file count
  - Existing categories per library (to keep naming consistent)
  - Every "<category>_<topic>.md" filename

Use this BEFORE deciding a new entry's library/category/topic so that you
merge into an existing file when one already covers the topic, instead of
creating a divergent or duplicate file.
"""
import os
import sys


def find_repo_root(start):
    cur = os.path.abspath(start)
    for _ in range(6):
        if os.path.isdir(os.path.join(cur, "src", "data")):
            return cur
        parent = os.path.dirname(cur)
        if parent == cur:
            break
        cur = parent
    return os.getcwd()


def main():
    repo = find_repo_root(__file__ if len(sys.argv) < 2 else sys.argv[1])
    data_dir = os.path.join(repo, "src", "data")
    if not os.path.isdir(data_dir):
        print(f"ERROR: src/data not found under {repo}", file=sys.stderr)
        sys.exit(1)

    print(f"# MemBagu entries inventory (repo: {repo})")
    print(f"# data dir: {data_dir}\n")

    libraries = sorted(
        d for d in os.listdir(data_dir)
        if os.path.isdir(os.path.join(data_dir, d)) and not d.startswith(".")
    )
    for lib in libraries:
        lib_path = os.path.join(data_dir, lib)
        files = sorted(
            f for f in os.listdir(lib_path)
            if f.endswith(".md") and f.lower() != "readme.md"
        )
        print(f"## library: {lib}  ({len(files)} files)")
        cats = {}
        for f in files:
            name = f[:-3]
            cat = name.split("_", 1)[0] if "_" in name else "(none)"
            cats.setdefault(cat, []).append(name)
        for cat in sorted(cats):
            print(f"  - category {cat}: {len(cats[cat])} file(s)")
        print("  files:")
        for f in files:
            print(f"    {f}")
        print()


if __name__ == "__main__":
    main()
