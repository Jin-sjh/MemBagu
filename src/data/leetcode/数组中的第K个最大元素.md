# 数组中的第K个最大元素

## 【问题】
请解释 数组中的第K个最大元素 的解题思路和实现方法。

题目链接: https://leetcode.cn/problems/kth-largest-element-in-an-array/

![题目图示](https://cdn.nlark.com/yuque/0/2026/png/27223229/1772776384012-971c7920-2c0a-4d24-b720-7348aefc6078.png)

## 【回答】
**口诀速记：**

快速选择算法：通过随机选基准、分区将数组划分为 “大于 / 小于基准” 的两部分，利用分治思想只递归查找包含目标的子数组，无需完全排序，在平均 O (n) 时间内定位第 k 个最大元素；若用堆解法，则是维护大小为 k 的小顶堆，遍历数组后堆顶即为结果，以 O (n log k) 时间实现。

- 递归先判左右同
- 随机选轴移末尾
- 分区小值移左侧
- 轴归位判目标位
- 小则左搜大则右
- 转最小索引递归

**解法1：**

```python
import random
from typing import List

class Solution:
    def quickselect(self, nums: List[int], l: int, r: int, k: int) -> int:
        # 递归终止条件：区间只有一个元素时，直接返回目标位置的值
        if l == r:
            return nums[k]
        
        # 核心优化：随机选择基准值（避免固定左边界导致的最坏情况）
        pivot_idx = random.randint(l, r)
        # 将随机选中的基准值交换到左边界，保持原有双指针逻辑不变
        nums[l], nums[pivot_idx] = nums[pivot_idx], nums[l]
        
        # 选取左边界（已替换为随机基准值）为分区值，初始化双指针
        partition = nums[l]
        i = l
        j = r
        
        # 双指针分区：i找大于等于基准值的元素，j找小于等于基准值的元素
        while i < j:
            # 右移i直到找到 >= partition 的元素
            i += 1
            while nums[i] < partition:
                i += 1
            # 左移j直到找到 <= partition 的元素
            j -= 1
            while nums[j] > partition:
                j -= 1
            # 交换i和j位置的元素（当i<j时）
            if i < j:
                nums[i], nums[j] = nums[j], nums[i]
        
        # 根据k的位置决定递归方向
        if k <= j:
            return self.quickselect(nums, l, j, k)
        else:
            return self.quickselect(nums, j + 1, r, k)
    
    def findKthLargest(self, nums: List[int], k: int) -> int:
        n = len(nums)
        # 转换k为升序数组中对应的索引（第k大 → 索引n-k）
        return self.quickselect(nums, 0, n - 1, n - k)
```

**解法2：**

```python
import heapq

def findKthLargest(nums, k):
    return heapq.nlargest(k, nums)[-1]

# 或者手动维护堆：
def findKthLargest(nums, k):
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]
```
