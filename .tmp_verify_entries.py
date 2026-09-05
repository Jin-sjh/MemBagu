import io, os, re, sys

sys.stdout.reconfigure(encoding="utf-8")
base = os.path.join("src", "data", "AI")
files = [
    "Skill_技能与提示词的边界.md",
    "Skill_技能适用性判断.md",
    "Skill_技能上下文与引用规范.md",
    "Skill_技能安全防护.md",
    "Skill_技能类型与迭代验证.md",
    "Skill_多技能工作流组合.md",
    "Skill_技能工程化设计.md",
    "Skill_技能上线与发布.md",
    "Skill_技能设计心法.md",
    "Agent_子智能体协作机制.md",
]
for f in files:
    p = os.path.join(base, f)
    t = io.open(p, encoding="utf-8").read()
    m = re.search(r"category:\s*(.+)", t)
    cat = m.group(1).strip() if m else None
    prefix = f.rsplit("_", 1)[0]
    q = t.count("## 【问题】")
    a = t.count("## 【回答】")
    status = []
    if cat != prefix:
        status.append(f"category({cat})!=prefix({prefix})")
    if q == 0:
        status.append("no QA")
    if q != a:
        status.append(f"Q{q}!=A{a}")
    print(f"{f}: {'OK' if not status else '; '.join(status)} (Q={q}, A={a}, bold={t.count('**')//2})")
