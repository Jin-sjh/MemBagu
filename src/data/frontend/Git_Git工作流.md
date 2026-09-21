---
category: Git
topic: Git工作流
type: bagu
tags: [Git, 工作流, 分支管理, 合并冲突, 版本控制]
difficulty: medium
created: 2026-09-21
---
# Git工作流

## 【问题】
如何理解 Git 团队工作流（日常流程）？

## 【回答】
Git 通过提交快照、分支和远程协作管理代码历史；**团队工作流的核心是让变更可追踪、可审查、可回滚**。日常流程为：

```
拉取主线 → 创建 feature 分支 → 小步提交
  ↓
本地测试/格式检查 → 同步主线并解决冲突
  ↓
Push → Pull Request/Code Review → CI
  ↓
合并、发布、Tag
```

**分支开发 + 小步提交**让变更可追溯；**PR / Code Review + CI** 保证质量；**Tag** 标记发布节点。

---

## 【问题】
merge 和 rebase 有什么区别？实际中怎么选？

## 【回答】
**merge 保留分叉合并历史**，**rebase 把本地提交重放到新基线**。二者选择取决于对历史可读性的偏好：

- **本地未共享的提交可以 rebase**，以获得线性、整洁的历史；
- **已公开的历史不应随意改写**，否则会影响协作者；
- 想保留真实的分叉与合并关系用 merge，想保持线性历史用 rebase。

---

## 【问题】
遇到合并冲突应该怎么处理？

## 【回答】
解决流程为：

```
查看状态 → 定位冲突文件 → 阅读上下文和业务意图
  → 决定保留、合并或重新实现 → 删除标记并测试
  → 暂存并完成当前操作
```

冲突文件中 `<<<<<<< HEAD` 到 `=======` 是当前分支内容，`=======` 到 `>>>>>>> origin/main` 是被合入的一侧。解决后：

```bash
git add src/components/Button.tsx
git commit -m "resolve merge conflict in Button.tsx"
```

**不要只点“接受本地 / 远程”按钮**，要结合 `git status` 确认事件处理、Props、类型、测试和业务行为没有被覆盖。

---

## 【问题】
用 rebase 同步主干时需要注意什么？force-with-lease 是什么？

## 【回答】
同步主干的命令：

```bash
git fetch origin
git rebase origin/main
```

冲突时编辑文件后 `git add <file>`，再 `git rebase --continue`；方向错误用 `git rebase --abort` 回退。若分支已被他人使用，**不能随意改写历史**；确需更新个人远程分支时优先 `git push --force-with-lease`。**它比 --force 更安全，会在远端有他人新提交时拒绝强制推送**，且不适合公共分支。

---

## 【问题】
cherry-pick 冲突怎么处理？

## 【回答】
`git cherry-pick <commit_id>` 重新应用某个提交的变更，常用于挑选 hotfix，但**会生成新的提交 ID**。解决文件后执行 `git add <file>` 与 `git cherry-pick --continue`；决定放弃时执行 `git cherry-pick --abort`。**cherry-pick 不是合并整个远程分支**，只是复制单个提交，因此可能产生新的提交身份。

---

## 【问题】
面试时怎么答 Git 工作流？

## 【回答】
我会讲：分支开发、小步提交、本地测试、推送、Code Review、CI、合并发布。**merge 与 rebase 的选择看历史可读性和是否已共享，不对公共分支改写历史**。遇到冲突先理解双方意图再解决，解决后跑测试和确认 diff；复杂冲突先 `git stash` 或建临时分支保护现场。

## 【考察点】
分支模型、merge/rebase 取舍、冲突定位与解决、历史改写边界（force-with-lease）、cherry-pick 语义。
