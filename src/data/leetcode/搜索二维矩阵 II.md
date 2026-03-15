# 搜索二维矩阵 II

## 【问题】
请解释 搜索二维矩阵 II 的解题思路和实现方法。

题目链接: https://leetcode.cn/problems/search-a-2d-matrix-ii/

![题目图示](https://cdn.nlark.com/yuque/0/2026/png/27223229/1772777413666-7b9c7130-f835-490a-8407-c508554a6306.png)

## 【回答】
**口诀速记：**

利用矩阵行递增、列递增的特性，从右上角（或左下角）这个 “特殊起点” 出发，通过一次比较排除一行或一列，从而在 O (m+n) 时间内线性缩小查找范围。

- 空矩阵直接返假
- 右上开始当起点
- 等于目标直接返真
- 大则左移小下移
- 遍历完返假



注意边界条件 col可以等于0

**代码实现：**

```python
def searchMatrix(matrix, target):
    if not matrix or not matrix[0]:
        return False  # 对应口诀1：空矩阵直接返假
    
    rows = len(matrix)
    cols = len(matrix[0])
    
    # 从右上角开始
    row, col = 0, cols - 1  # 对应口诀2：右上开始当起点
    
    while row < rows and col >= 0:
        current = matrix[row][col]
        if current == target:
            return True  # 对应口诀3：等于目标直接返真
        elif current > target:
            col -= 1  # 向左移动  # 对应口诀4：大则左移小下移（大则左移）
        else:
            row += 1  # 向下移动  # 对应口诀4：大则左移小下移（小下移）
    
    return False  # 对应口诀5：遍历完返假
```
