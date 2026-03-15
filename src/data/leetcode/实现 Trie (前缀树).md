# 实现 Trie (前缀树)

## 【问题】
请解释 实现 Trie (前缀树) 的解题思路和实现方法。

题目链接: https://leetcode.cn/problems/implement-trie-prefix-tree/

![题目图示](https://cdn.nlark.com/yuque/0/2026/png/27223229/1772776256097-b3284820-ccd5-43ba-8278-5b931c21b813.png)

## 【回答】
**口诀速记：**

用多叉树（Trie）的结构，按字符逐位存储字符串，通过节点间的路径表示前缀关系，用节点标记区分 “完整单词” 和 “前缀”，从而高效实现插入、查找和前缀检查操作。

- 节点存子标结尾
- 根节点初始化树
- 插入逐字符建节点
- 末尾标记词结束
- 搜索逐字符查存在
- 完检结尾判单词
- 前缀逐字符查存在
- 全存在则返回真

**代码实现：**

```python
class TrieNode:
    def __init__(self):
        self.children = [None] * 26  # 对应口诀1：节点存子标结尾（存子）
        self.is_end = False          # 对应口诀1：节点存子标结尾（标结尾）

class Trie:
    def __init__(self):
        self.root = TrieNode()  # 对应口诀2：根节点初始化树（初始化根节点）

    def insert(self, word: str) -> None:
        node = self.root
        for c in word:
            idx = ord(c) - ord('a')  # 计算字符对应的索引
            if not node.children[idx]:
                node.children[idx] = TrieNode()  # 对应口诀3：插入逐字符建节点（建节点）
            node = node.children[idx]            # 对应口诀3：插入逐字符建节点（逐字符移动）
        node.is_end = True  # 对应口诀4：末尾标记词结束（标记结束）

    def search(self, word: str) -> bool:
        node = self.root
        for c in word:
            idx = ord(c) - ord('a')
            if not node.children[idx]:
                return False  # 对应口诀5：搜索逐字符查存在（字符不存在返回假）
            node = node.children[idx]
        return node.is_end  # 对应口诀6：完检结尾判单词（检查结尾）

    def startsWith(self, prefix: str) -> bool:
        node = self.root
        for c in prefix:
            idx = ord(c) - ord('a')
            if not node.children[idx]:
                return False  # 对应口诀7：前缀逐字符查存在（字符不存在返回假）
            node = node.children[idx]
        return True  # 对应口诀8：全存在则返回真（全存在返回真）
```
