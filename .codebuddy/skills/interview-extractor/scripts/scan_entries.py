#!/usr/bin/env python3
"""List existing 面经 (interview experience) entries in MemBagu to assist
deduplication when deciding whether to create a new file or merge.

Usage:
    python3 scan_entries.py [repo_root]

Scans <repo>/src/data and prints:
  - All files whose name starts with "面经_"
  - Their library, category (from frontmatter if available), and topic
  - A plain list of every 面经 file, so the agent can check for duplicates
    before writing a new "面经_<公司><岗位>.md".

This is a *helper*: it never writes or modifies any file.
"""
import os
import re
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


def parse_frontmatter_category(text):
    m = re.match(r"^---\r?\n(.*?)\r?\n---", text, re.S)
    if not m:
        return None
    for line in m.group(1).splitlines():
        line = line.strip()
        if line.startswith("category:"):
            return line.split(":", 1)[1].strip().strip("\"'")
    return None


def main():
    repo = find_repo_root(__file__ if len(sys.argv) < 2 else sys.argv[1])
    data_dir = os.path.join(repo, "src", "data")
    if not os.path.isdir(data_dir):
        print(f"ERROR: src/data not found under {repo}", file=sys.stderr)
        sys.exit(1)

    print(f"# 面经 entries inventory (repo: {repo})\n")
    libraries = sorted(
        d for d in os.listdir(data_dir)
        if os.path.isdir(os.path.join(data_dir, d)) and not d.startswith(".")
    )
    total = 0
    for lib in libraries:
        lib_path = os.path.join(data_dir, lib)
        files = sorted(
            f for f in os.listdir(lib_path)
            if f.endswith(".md") and f.lower() != "readme.md" and f.startswith("面经_")
        )
        if not files:
            continue
        print(f"## library: {lib}  ({len(files)} file(s))")
        for f in files:
            total += 1
            path = os.path.join(lib_path, f)
            category = None
            try:
                with open(path, "r", encoding="utf-8", errors="replace") as fh:
                    category = parse_frontmatter_category(fh.read())
            except OSError:
                pass
            cat = category or f[:-3].split("_", 1)[0]
            print(f"    {f}    [category={cat}]")
        print()

    print(f"TOTAL 面经 files: {total}")
    print("\nBefore creating a new 面经 file, check the list above. If a file for the same")
    print("company+position already exists, merge into it instead of creating a duplicate.")


if __name__ == "__main__":
    main()
