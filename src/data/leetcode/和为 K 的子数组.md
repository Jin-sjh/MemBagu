# 和为 K 的子数组

## 【问题】
请解释 和为 K 的子数组 的解题思路和实现方法。

题目链接: https://leetcode.cn/problems/subarray-sum-equals-k/

![题目图示](https://cdn.nlark.com/yuque/0/2026/png/27223229/1772781654921-9778330f-9fc9-4b04-b6b3-1e418e6a64b0.png)

## 【回答】
**口诀速记：**

利用前缀和与哈希表，将 “寻找和为 k 的子数组” 转化为 “统计满足 prefix [i] - k 的前缀和出现次数”，从而在单次遍历中高效求解。

- 初始化计数与前缀和为 0
- 哈希表初存 0:1
- 遍历数组累加前缀和
- 查前缀和减 k 的出现次数
- 次数累加到总计数
- 更新哈希表当前前缀和
- 最终返回总计数

**代码实现：**

```python
def subarraySum(nums, k):
    count = 0
    prefix_sum = 0  # 对应口诀1：初始化计数与前缀和为0
    # 初始化哈希表，前缀和 0 出现 1 次
    # 用于处理从数组开头到当前元素的子数组和恰好为 k 的情况
    sum_count = {0: 1}  # 对应口诀2：哈希表初存0:1
    
    for num in nums:
        prefix_sum += num  # 对应口诀3：遍历数组累加前缀和
        # 查找当前前缀和减去 k 的值在哈希表中出现的次数
        if (prefix_sum - k) in sum_count:
            count += sum_count[prefix_sum - k]  # 对应口诀4：查前缀和减k的出现次数 + 口诀5：次数累加到总计数
        # 将当前前缀和更新到哈希表中
        sum_count[prefix_sum] = sum_count.get(prefix_sum, 0) + 1  # 对应口诀6：更新哈希表当前前缀和
    return count  # 对应口诀7：最终返回总计数
```
