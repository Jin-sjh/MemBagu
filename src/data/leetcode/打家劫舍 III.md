# 打家劫舍 III

## 【问题】
请解释 打家劫舍 III 的解题思路和实现方法。

题目链接: https://leetcode.cn/problems/house-robber-iii/

![题目图示](https://cdn.nlark.com/yuque/0/2026/png/27223229/1772778837074-b9c53d26-faca-4a65-a8bb-c78e0d1f5daa.png)

## 【回答】
**口诀速记：**

对每个节点维护「偷」与「不偷」两种状态，通过自底向上的树形动态规划，在保证父子节点不同时被选的约束下，递归计算子树的最大收益，最终取根节点两种状态的最大值作为答案。

- 空节点返双零
- 递归求左右偷与不偷
- 不偷取左右最值和
- 偷则加当前值与左右不偷
- 最终返根节点偷与不偷最大值

**代码实现：**

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def rob(self, root: TreeNode) -> int:
        def dfs(node):
            if not node:
                return (0, 0)  # (不偷当前节点的最大收益, 偷当前节点的最大收益)
                # 对应口诀1：空节点返双零
            
            left_not_rob, left_rob = dfs(node.left)
            right_not_rob, right_rob = dfs(node.right)
            # 对应口诀2：递归求左右偷与不偷
            
            # 不偷当前节点：左右子节点可以偷或不偷，取最大值
            not_rob = max(left_not_rob, left_rob) + max(right_not_rob, right_rob)
            # 对应口诀3：不偷取左右最值和
            # 偷当前节点：左右子节点不能偷
            rob = node.val + left_not_rob + right_not_rob
            # 对应口诀4：偷则加当前值与左右不偷
            
            return (not_rob, rob)
        
        return max(dfs(root))  # 对应口诀5：最终返根节点偷与不偷最大值
```
