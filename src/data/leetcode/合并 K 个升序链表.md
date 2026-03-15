# 合并 K 个升序链表

## 【问题】
请解释 合并 K 个升序链表 的解题思路和实现方法。

题目链接: https://leetcode.cn/problems/merge-k-sorted-lists/

![题目图示](https://cdn.nlark.com/yuque/0/2026/png/27223229/1772711857761-f9bed375-4ef6-4717-846d-405e44c662bb.png)

## 【回答】
**口诀速记：**

通过分治法（两两归并）或小顶堆（每次取最小头节点），高效地从 K 个有序链表中持续选取最小节点，最终合并成一个整体有序的链表。

- 输入链表列表为空则直接返回空
- 定义归并函数（参数：列表、左边界、右边界）
- 归并终止：左 = 右时返回对应链表
- 计算中点，递归归并左半区和右半区链表
- 调用两链表合并函数，合并左右归并结果
- 两链表合并：建哑节点 + 游标指针，循环选较小节点接入
- 拼接剩余节点，返回哑节点的下一个节点
- 启动归并（左 0、右列表长度 - 1），返回最终合并结果

**解法1：**

```python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeKLists(self, lists: list[ListNode | None]) -> ListNode | None:
        if not lists:
            return None  # 对应口诀1：输入为空返回空
        return self.merge(lists, 0, len(lists) - 1)  # 对应口诀8：启动归并
    
    def merge(self, lists: list[ListNode | None], left: int, right: int) -> ListNode | None:
        if left == right:
            return lists[left]  # 对应口诀3：归并终止条件
        mid = (left + right) // 2
        l1 = self.merge(lists, left, mid)
        l2 = self.merge(lists, mid + 1, right)  # 对应口诀4：递归归并左右半区
        return self.merge_two_lists(l1, l2)  # 对应口诀5：合并左右归并结果
    
    def merge_two_lists(self, l1: ListNode | None, l2: ListNode | None) -> ListNode | None:
        dummy = ListNode()
        current = dummy  # 对应口诀6：建哑节点+游标指针
        while l1 and l2:
            if l1.val < l2.val:
                current.next = l1
                l1 = l1.next
            else:
                current.next = l2
                l2 = l2.next
            current = current.next  # 对应口诀6：循环选较小节点接入
        current.next = l1 if l1 else l2  # 对应口诀7：拼接剩余节点
        return dummy.next  # 对应口诀7：返回哑节点后继
```

**解法2：**

```python
import heapq

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeKLists(self, lists: list[ListNode | None]) -> ListNode | None:
        # 为了避免heapq比较相同val的ListNode时出错，我们用一个计数器来区分
        # 或者直接比较 (node.val, id(node))
        heap = []
        for node in lists:
            if node:
                heapq.heappush(heap, (node.val, id(node), node))
        
        dummy = ListNode()
        current = dummy
        
        while heap:
            val, _, node = heapq.heappop(heap)
            current.next = node
            current = current.next
            if node.next:
                heapq.heappush(heap, (node.next.val, id(node.next), node.next))
        
        return dummy.next
```
