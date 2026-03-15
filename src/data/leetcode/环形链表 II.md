# 环形链表 II

## 【问题】
请解释 环形链表 II 的解题思路和实现方法。

题目链接: https://leetcode.cn/problems/linked-list-cycle-ii/

![题目图示](https://cdn.nlark.com/yuque/0/2026/png/27223229/1772773575052-8efc4a3e-dad1-4e4c-a12f-775c1290cdda.png)

## 【回答】
**口诀速记：**

先用快慢指针判断链表是否有环，再利用双指针从链表头和相遇点同步移动，找到入环的第一个节点。【 头节点到入环点的步数 a，等于相遇点到入环点的步数 c】



- 初始化快慢指针slow和fast均指向链表头节点head
- 第一步：遍历链表找快慢指针相遇点（判断是否有环）：
- 循环条件：fast和fast.next均不为空（避免空指针异常）
- 慢指针走 1 步，快指针走 2 步
- 若快慢指针相遇（说明有环），进入第二步找入环点；若循环结束未相遇，返回 None（无环）
- 第二步：找入环点（核心规律：头节点到入环点的距离 = 相遇点到入环点的距离）：
- 初始化两个指针p（从头节点出发）、q（从相遇点出发）
- 两个指针均每次走 1 步，直到相遇
- 相遇的节点即为入环点，返回该节点

**代码实现：**

```python
class ListNode:
    def __init__(self, x):
        self.val = x
        self.next = None

class Solution:
    def detectCycle(self, head: ListNode) -> ListNode:
        # 初始化快慢指针
        slow, fast = head, head  # 对应口诀1：快慢指针初始指向头节点
        
        # 第一步：找到相遇点，判断是否有环
        while fast and fast.next:  # 对应口诀2：循环条件（快指针未到末尾）
            slow = slow.next       # 对应口诀2：慢指针走1步
            fast = fast.next.next  # 对应口诀2：快指针走2步
            if slow == fast:       # 对应口诀2：快慢指针相遇（有环）
                # 第二步：有环，从头节点和相遇点同时出发找入环点
                p = head           # 对应口诀3：p从头节点出发
                q = slow           # 对应口诀3：q从相遇点出发
                while p != q:      # 对应口诀3：双指针同步走直到相遇
                    p = p.next
                    q = q.next
                return p  # p 和 q 相遇的点就是入环点  # 对应口诀3：返回入环点
        
        # 无环
        return None  # 对应口诀2：无环返回None
```
