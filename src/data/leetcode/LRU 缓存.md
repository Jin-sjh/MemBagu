# LRU 缓存

## 【问题】
请解释 LRU 缓存 的解题思路和实现方法。

题目链接: https://leetcode.cn/problems/lru-cache/

![题目图示](https://cdn.nlark.com/yuque/0/2026/png/27223229/1772773772033-23175ee8-09ba-41fb-99a1-05beb36f5ad9.png)

## 【回答】
**口诀速记：**

通过\*\*哈希表实现 key 到节点的 O (1) 快速查找，结合双向链表维护节点的访问顺序（最近使用的节点在链表头部，最久未使用的在尾部），从而让 get 和 put 操作均达到 O (1) 的时间复杂度，同时在容量不足时淘汰链表尾部的节点。  【 节点先定义，缓存初配置，查改靠哈希，移删控头尾  \*\*】

**代码实现：**

```python
class DLinkedNode:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = dict()
        # 使用伪头部和伪尾部节点简化边界处理
        self.head = DLinkedNode()
        self.tail = DLinkedNode()
        self.head.next = self.tail
        self.tail.prev = self.head
        self.capacity = capacity
        self.size = 0

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        # 如果 key 存在，先通过哈希表定位，再移到头部
        node = self.cache[key]
        self.moveToHead(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        if key not in self.cache:
            # 如果 key 不存在，创建一个新的节点
            node = DLinkedNode(key, value)
            # 添加进哈希表
            self.cache[key] = node
            # 添加至双向链表的头部
            self.addToHead(node)
            self.size += 1
            if self.size > self.capacity:
                # 如果超出容量，删除双向链表的尾部节点
                removed = self.removeTail()
                # 删除哈希表中对应的项
                self.cache.pop(removed.key)
                self.size -= 1
        else:
            # 如果 key 存在，先通过哈希表定位，再修改 value，并移到头部
            node = self.cache[key]
            node.value = value
            self.moveToHead(node)
    
    def addToHead(self, node): 【控头】
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node
    
    def removeNode(self, node): 【删】
        node.prev.next = node.next
        node.next.prev = node.prev

    def moveToHead(self, node): 【移】
        self.removeNode(node)
        self.addToHead(node)

    def removeTail(self): 【控尾】
        node = self.tail.prev
        self.removeNode(node)
        return node
```
