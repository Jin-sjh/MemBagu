# 路径总和 III

## 【问题】
请解释 路径总和 III 的解题思路和实现方法。

题目链接: https://leetcode.cn/problems/path-sum-iii/

![题目图示](https://cdn.nlark.com/yuque/0/2026/png/27223229/1772780111490-44c609ba-db79-41e0-8969-9bc9366ae6be.png)

## 【回答】
**口诀速记：**

利用前缀和与哈希表，将 “路径和等于目标值” 的问题转化为 “查找前缀和差值” 的问题，在一次深度优先遍历中完成统计，从而将时间复杂度优化至线性。

- 前缀和字典初 0 次为 1
- DFS 传节点与当前和
- 空节点返回 0
- 累加节点更当前和
- 查目标差得路径数
- 入字典当前和计数 + 1
- 递归左右子树累加数
- 回溯减当前和计数
- 最终返回总路径数

**代码实现：**

```python
from collections import defaultdict

# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def pathSum(self, root: TreeNode, targetSum: int) -> int:
        # 前缀和字典，key是前缀和，value是该和出现的次数
        prefix_counts = defaultdict(int)
        # 初始化：前缀和为0的情况出现1次，用于处理从根节点开始的路径
        prefix_counts[0] = 1  # 对应口诀1：前缀和字典初0次为1
        
        def dfs(node, current_sum):
            if not node:
                return 0  # 对应口诀3：空节点返回0
            
            # 更新当前前缀和
            current_sum += node.val  # 对应口诀4：累加节点更当前和
            
            # 查找有多少个前缀和等于 current_sum - targetSum，这就是以当前节点结尾的合法路径数
            count = prefix_counts.get(current_sum - targetSum, 0)  # 对应口诀5：查目标差得路径数
            
            # 将当前前缀和加入字典
            prefix_counts[current_sum] += 1  # 对应口诀6：入字典当前和计数+1
            
            # 递归处理左右子树
            count += dfs(node.left, current_sum)  # 对应口诀7：递归左右子树累加数
            count += dfs(node.right, current_sum)
            
            # 回溯：离开当前节点前，从字典中移除当前前缀和，避免影响其他分支
            prefix_counts[current_sum] -= 1  # 对应口诀8：回溯减当前和计数
            
            return count  # 对应口诀9：最终返回总路径数
        
        return dfs(root, 0)  # 对应口诀2：DFS传节点与当前和
```
