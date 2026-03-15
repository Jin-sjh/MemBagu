# 删除链表的倒数第 N 个结点

## 【问题】
请解释 删除链表的倒数第 N 个结点 的解题思路和实现方法。

题目链接: https://leetcode.cn/problems/remove-nth-node-from-end-of-list/

![题目图示](https://cdn.nlark.com/yuque/0/2026/png/27223229/1772710941594-de24cc37-3c21-4a5d-8901-a2d428a5936a.png)

## 【回答】
**口诀速记：**

利用双指针（快慢指针）的间距控制，在一次遍历中精准定位到待删除节点的前驱节点，从而高效完成删除操作。

- 创建虚拟头结点，指向原链表头
- 初始化快慢指针均指向虚拟头
- 快指针先移动 n+1 步（防空判断）
- 快慢指针同步移动，直到快指针为空
- 慢指针跳过下一节点（删除倒数第 n 个）
- 返回虚拟头的下一个节点（新链表头）

**代码实现：**

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def removeNthFromEnd(self, head: ListNode, n: int) -> ListNode:
        # 创建虚拟头结点
        dummy = ListNode(0)
        dummy.next = head  # 对应口诀1：创建虚拟头结点，指向原链表头
        
        slow = dummy
        fast = dummy  # 对应口诀2：初始化快慢指针均指向虚拟头
        
        # 快指针先移动 n+1 步
        for _ in range(n + 1):
            if fast:
                fast = fast.next  # 对应口诀3：快指针先移动n+1步
        
        # 快慢指针同时移动，直到快指针到达末尾
        while fast:
            slow = slow.next
            fast = fast.next  # 对应口诀4：快慢指针同步移动
        
        # 删除倒数第n个节点
        slow.next = slow.next.next  # 对应口诀5：慢指针跳过下一节点
        
        return dummy.next  # 对应口诀6：返回虚拟头的下一个节点
```
