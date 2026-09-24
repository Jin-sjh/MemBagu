// 前端数据 ↔ 本地 SQLite 的同步 API。
// 语义：快照式读写 + updated_at 时间戳比较（同机单用户，时钟一致）。
// 前端 localStorage 始终是工作副本，写后防抖推送到这里；启动时按时间戳双向合并。
import { Router } from 'express'
import {
  getSnapshot,
  replaceProgress,
  replaceUIState,
  replaceLibraries,
  setActiveLibraryId
} from './sync-store.js'

export function createSyncRouter() {
  const router = Router()

  router.get('/health', (req, res) => {
    res.json({ ok: true, store: 'sqlite' })
  })

  router.get('/snapshot', (req, res) => {
    try {
      res.json({ ok: true, data: getSnapshot() })
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message })
    }
  })

  router.put('/progress/:libraryId', (req, res) => {
    const { libraryId } = req.params
    const { data, updatedAt } = req.body || {}
    if (!libraryId || typeof data !== 'object' || data === null) {
      return res.status(400).json({ ok: false, error: 'libraryId 与 data 必填' })
    }
    try {
      replaceProgress(libraryId, data, updatedAt || Date.now())
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message })
    }
  })

  router.put('/ui-state/:libraryId', (req, res) => {
    const { libraryId } = req.params
    const { data, updatedAt } = req.body || {}
    if (!libraryId || typeof data !== 'object' || data === null) {
      return res.status(400).json({ ok: false, error: 'libraryId 与 data 必填' })
    }
    try {
      replaceUIState(libraryId, data, updatedAt || Date.now())
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message })
    }
  })

  router.put('/libraries', (req, res) => {
    const { data, activeLibraryId, updatedAt } = req.body || {}
    if (!Array.isArray(data)) {
      return res.status(400).json({ ok: false, error: 'data 必须是题库数组' })
    }
    try {
      replaceLibraries(data, updatedAt || Date.now())
      if (activeLibraryId !== undefined) {
        setActiveLibraryId(activeLibraryId, updatedAt || Date.now())
      }
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message })
    }
  })

  return router
}
