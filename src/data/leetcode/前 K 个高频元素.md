# 前 K 个高频元素

## 【问题】
请解释 前 K 个高频元素 的解题思路和实现方法。

题目链接: https://leetcode.cn/problems/top-k-frequent-elements/

![题目图示](https://cdn.nlark.com/yuque/0/2026/png/27223229/1772779076183-3977b302-04ec-419f-a4bf-0dea16c289de.png)

## 【回答】
**口诀速记：**

先用哈希表统计元素频率，再利用 “频率桶” 按频率从高到低快速筛选出前 K 个高频元素。

- 统计元素出现频率
- 频率为索引建桶
- 逆序遍历桶收元素
- 收够 K 个即返回

**代码实现：**

```python
def topKFrequent(nums, k):
    # 1. 统计每个元素的频率
    freq_map = {}
    for num in nums:
        freq_map[num] = freq_map.get(num, 0) + 1  # 对应口诀1：统计元素出现频率
    
    # 2. 创建频率桶，索引为频率，值为对应元素列表
    max_freq = len(nums)
    bucket = [[] for _ in range(max_freq + 1)]
    for num, freq in freq_map.items():
        bucket[freq].append(num)  # 对应口诀2：频率为索引建桶
    
    # 3. 从后往前遍历桶，收集前 K 个高频元素
    res = []
    for i in range(max_freq, 0, -1):  # 对应口诀3：逆序遍历桶收元素（逆序遍历）
        res.extend(bucket[i])         # 对应口诀3：逆序遍历桶收元素（收元素）
        if len(res) == k:
            break                     # 对应口诀4：收够K个即返回（收够K个）
    return res                        # 对应口诀4：收够K个即返回（返回）
```
