---
category: HTTP
topic: 大文件分片上传与断点续传
type: bagu
tags: [HTTP, 文件上传, 分片上传, 断点续传, 秒传]
difficulty: medium
created: 2026-07-24
---
# HTTP 大文件分片上传与断点续传

## 【问题】
前端如何实现大文件的分片上传和断点续传？

## 【回答】

### 一、文件分片（Chunking）

使用 `File.slice()` API 将大文件切割成固定大小的片段：

```js
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB 每片

function createChunks(file) {
  const chunks = []
  let start = 0
  while (start < file.size) {
    const end = Math.min(start + CHUNK_SIZE, file.size)
    chunks.push({
      blob: file.slice(start, end),
      index: chunks.length,
      start,
      end
    })
    start = end
  }
  return chunks
}
```

### 二、并发上传

使用 `Promise.all` 或并发池控制同时发送多个分片请求，每个分片携带 `index`（分片序号）和 `totalChunks`（总分片数）：

```js
async function uploadChunks(chunks, uploadId) {
  const MAX_CONCURRENT = 3 // 最多同时上传 3 片
  const pool = new Set()

  for (const chunk of chunks) {
    const formData = new FormData()
    formData.append('chunk', chunk.blob)
    formData.append('index', chunk.index)
    formData.append('uploadId', uploadId)
    formData.append('totalChunks', chunks.length)

    const task = fetch('/upload', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => { chunk.uploaded = data.ok })

    pool.add(task)
    task.finally(() => pool.delete(task))

    if (pool.size >= MAX_CONCURRENT) {
      await Promise.race(pool)
    }
  }
  await Promise.all(pool)
}
```

### 三、断点续传（Resumable Upload）

核心思路是**在本地记录每个分片的上传状态**。具体做法：

1. **计算文件指纹**：使用 `SparkMD5` 或 Web Crypto API 计算文件内容的唯一哈希值，作为文件的唯一标识。
2. **查询已上传分片**：上传前先请求服务器，返回该文件已经成功上传的分片索引列表。
3. **跳过已完成分片**：只上传服务器未收到的分片。
4. **本地持久化状态**：将上传进度（已完成的 chunk index）存储到 `localStorage`，即使页面刷新也能恢复。

```js
async function resumeUpload(file) {
  const fileHash = await computeHash(file)       // 计算文件哈希
  const uploaded = await fetch(`/status?hash=${fileHash}`)
    .then(r => r.json())                         // 获取已上传的分片列表

  const chunks = createChunks(file)
  const pending = chunks.filter(c => !uploaded.includes(c.index)) // 过滤已完成的分片

  await uploadChunks(pending, fileHash)
}
```

### 四、服务端合并文件

服务端收集完所有分片后，按 `index` 顺序合并为完整文件：

```js
// Node.js 服务端合并示例
async function mergeChunks(uploadId, totalChunks, fileName) {
  const writeStream = fs.createWriteStream(`./uploads/${fileName}`)
  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = `./temp/${uploadId}_${i}`
    const data = fs.readFileSync(chunkPath)
    writeStream.write(data)
    fs.unlinkSync(chunkPath) // 合并后删除临时分片
  }
  writeStream.end()
}
```

### 五、关键要点
- **文件哈希**用于标识唯一文件，支撑断点续传和秒传（服务器已有该文件时直接跳过）。
- **并发控制**避免同时发起过多请求耗尽浏览器连接（浏览器同一域名通常限制 6 个并发连接）。
- **重试机制**：单个分片上传失败时自动重试 2-3 次，而非直接中断整个上传。
- **进度计算**：`已上传字节 / 文件总字节`，需要将文件哈希计入总进度以保证准确。

---

## 【问题】
大文件上传的系统设计核心要点有哪些？

## 【回答】
完整设计要在已有分片/并发/断点基础上补齐工程细节：**固定或自适应 chunk 大小**、**大文件 hash（可放 Worker 避免阻塞主线程）**、**并发上限**（浏览器同域通常限 6 连接）、**重试退避**、**取消信号**、**已上传分片查询**（断点续传）、**幂等上传**（重复提交不产生脏数据）、**分片完整性校验**、**合并锁**（防止并发合并冲突）以及**清理过期临时文件**。服务端按 `fileId` 收集分片后顺序合并，并在合并后做完整性校验与完成通知。

---

## 【问题】
什么是秒传？如何保证秒传可靠？

## 【回答】
**秒传**是指服务端已存在该文件（通过可靠 hash 命中已有文件索引）时，前端无需真正上传分片，直接返回已完成。它依赖**可靠的文件哈希**作为唯一标识。但要明确：**秒传不代表不需要权限校验**——仍要校验当前用户是否有该文件的访问/上传权限，避免越权复用他人文件。hash 计算建议在 Worker 中进行，避免大文件计算阻塞 UI 主线程。

---

## 【问题】
大文件上传为什么要避免把所有 Blob 读入内存？进度该怎么算？

## 【回答】
浏览器端**不能因为切片就把所有 Blob 读入内存**，应**流式/分片处理**，逐片读取与上传，否则超大文件会撑爆内存导致卡死或崩溃。
进度计算要区分两个阶段：**分片上传进度**（各分片已传字节之和 / 文件总字节）和**服务端合并状态**（合并是否完成）。仅看上传字节会遗漏合并耗时，需把"上传完成"与"合并完成"分别反馈给用户，总进度才准确。

---

## 【问题】
面试时怎么答大文件上传的设计？

## 【回答】
我会讲：通过**切片、并发池、断点记录、重试**和服务端**幂等合并**来解决单请求大小限制、失败重传和浏览器内存问题；**Hash 支撑秒传和完整性校验**，大文件计算放到 **Worker**；并补齐**鉴权、过期临时文件清理、合并锁、取消信号和弱网测试**。验证要覆盖断网、刷新、重复上传、篡改 chunk、取消和并发压测。最后强调：秒传依赖可靠 hash 但不替代权限校验，进度要区分分片上传与服务端合并。
