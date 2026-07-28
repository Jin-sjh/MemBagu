#!/usr/bin/env python3
"""Segment a material file into 八股-worthy chunks to assist extraction.

Usage:
    python3 extract_candidates.py <material_file> [--max-excerpt 600]

Reads a .md / .txt / pasted-text file, splits it into topic segments
(by Markdown headings, or by blank lines when no headings exist), and for
each segment reports whether it already contains explicit Q&A, whether it
looks like a leetcode problem, an "八股 value score", and a few suggested
interview questions distilled from cue words.

This is a *helper*: it does NOT write any MemBagu file and never invents
answers. The agent uses the output to decide what to extract and how.

Output is a JSON array (one object per segment) printed to stdout.
"""
import os
import sys
import re
import json

EXCERPT_LIMIT = 600
MAX_SEGMENTS = 200

HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
# MemBagu block markers must NOT be treated as topic headings (they look like
# "## 【问题】"). When such a line is hit, keep it as body of the current segment.
BLOCK_MARKER_RE = re.compile(r"^【(问题|回答|题目链接|难点分析|考察点|衍生问题|口诀|代码)】")
EXPLICIT_QA_RE = re.compile(
    r"【问题】|【问】|^\s*问题[:：]|^\s*问[:：]|^\s*Q[:：]"
    r"|【回答】|^\s*回答[:：]|^\s*答[:：]|^\s*A[:：]",
    re.I | re.M,
)
LEETCODE_RE = re.compile(
    r"leetcode|力扣|剑指\s*offer|题目链接|时间复杂度|空间复杂度|算法题|"
    r"贪心|动态规划|二分|回溯|dfs|bfs",
    re.I,
)
# cue -> a natural 八股 question template ({} replaced by topic)
CUE_TEMPLATES = [
    ("原理", "{} 的底层原理/实现机制是什么？"),
    ("机制", "{} 的工作机制是什么？"),
    ("区别", "{} 与相关概念的区别是什么？"),
    ("对比", "{} 的对比（异同点）是什么？"),
    ("优缺点", "{} 有什么优缺点？"),
    ("优点", "{} 的优点是什么？"),
    ("缺点", "{} 的缺点/代价是什么？"),
    ("流程", "{} 的完整流程/步骤是什么？"),
    ("步骤", "{} 的步骤是什么？"),
    ("场景", "{} 适用于什么场景？"),
    ("应用", "{} 有哪些应用场景？"),
    ("实现", "{} 如何实现？"),
    ("作用", "{} 的作用是什么？"),
    ("是什么", "什么是 {}？"),
    ("为什么", "为什么需要 {}？"),
    ("如何", "如何 {}？"),
    ("怎么", "怎么 {}？"),
]


def load_text(path):
    if not os.path.isfile(path):
        sys.stderr.write(f"ERROR: file not found: {path}\n")
        sys.exit(1)
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def split_segments(text):
    lines = text.splitlines()
    segments = []  # (level, heading, body_lines)
    has_heading = any(HEADING_RE.match(l) for l in lines)
    if not has_heading:
        # fallback: group by blank-line separated paragraphs
        buf = []
        for l in lines:
            if l.strip() == "":
                if buf:
                    segments.append(("", "(无标题段落)", buf))
                    buf = []
            else:
                buf.append(l)
        if buf:
            segments.append(("", "(无标题段落)", buf))
        return segments

    cur_level = ""
    cur_heading = ""
    cur_body = []
    for l in lines:
        m = HEADING_RE.match(l)
        if m and not BLOCK_MARKER_RE.match(m.group(2)):
            if cur_heading or cur_body:
                segments.append((cur_level, cur_heading, cur_body))
            cur_level = len(m.group(1))
            cur_heading = m.group(2).strip()
            cur_body = []
        else:
            cur_body.append(l)
    if cur_heading or cur_body:
        segments.append((cur_level, cur_heading, cur_body))
    return segments


def suggest_questions(heading, body):
    blob = (heading + " " + " ".join(body)).lower()
    topic = heading if heading and heading != "(无标题段落)" else "该技术点"
    # strip leading markdown / numbering for a cleaner topic
    topic_clean = re.sub(r"^[\d.\、\-\*\s]+", "", topic).strip(" 。.：:")
    if not topic_clean:
        topic_clean = "该技术点"
    out = []
    for cue, tmpl in CUE_TEMPLATES:
        if cue in blob:
            out.append(tmpl.format(topic_clean))
    if not out:
        out.append(f"什么是 {topic_clean}？")
    return out[:6]


def main():
    args = sys.argv[1:]
    if not args:
        sys.stderr.write("ERROR: provide a material file path\n")
        sys.exit(1)
    path = args[0]
    excerpt_limit = EXCERPT_LIMIT
    if "--max-excerpt" in args:
        i = args.index("--max-excerpt")
        if i + 1 < len(args):
            try:
                excerpt_limit = int(args[i + 1])
            except ValueError:
                pass

    text = load_text(path)
    segments = split_segments(text)
    result = []
    for idx, (level, heading, body) in enumerate(segments[:MAX_SEGMENTS], 1):
        body_text = "\n".join(body).strip()
        has_qa = bool(EXPLICIT_QA_RE.search(body_text))
        leetcode = bool(LEETCODE_RE.search(body_text))
        cue_hits = sum(1 for cue, _ in CUE_TEMPLATES if cue in (heading + body_text).lower())
        result.append({
            "index": idx,
            "heading": heading,
            "heading_level": level,
            "has_explicit_qa": has_qa,
            "leetcode_flag": leetcode,
            "eightgu_score": cue_hits,
            "suggested_questions": suggest_questions(heading, body),
            "body_excerpt": body_text[:excerpt_limit],
            "body_chars": len(body_text),
        })

    print(json.dumps({
        "source": path,
        "segment_count": len(result),
        "segments": result,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
