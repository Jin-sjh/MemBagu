---
category: HTTP
topic: 大文件分片上传与断点续传
type: bagu
tags: [HTTP, 文件上传]
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
