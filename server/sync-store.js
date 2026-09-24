// 本地 SQLite 存储层（sql.js = 编译成 WASM 的 SQLite，无原生编译依赖）。
// 数据落盘为 server/data/membagu.sqlite，是一个标准 SQLite 数据库文件，
// 可用任意 SQLite 工具（DB Browser / DBeaver / sqlite3 CLI）直接打开查询。
// 写操作在内存库中即时生效，防抖写回磁盘；进程退出时强制落盘。
import initSqlJs from 'sql.js'
import { createRequire } from 'module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, 'data')
const dbPath = join(dataDir, 'membagu.sqlite')

const require = createRequire(import.meta.url)
const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm')

let db = null
let persistTimer = null

const SCHEMA = `
CREATE TABLE IF NOT EXISTS progress (
  library_id      TEXT    NOT NULL,
  question_id     TEXT    NOT NULL,
  streak          INTEGER NOT NULL DEFAULT 0,
  mastered        INTEGER NOT NULL DEFAULT 0,
  pending_confirm INTEGER NOT NULL DEFAULT 0,
  last_wrong_time INTEGER,
  next_review_time INTEGER,
  history         TEXT    NOT NULL DEFAULT '[]',
  updated_at      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (library_id, question_id)
);
CREATE TABLE IF NOT EXISTS ui_state (
  library_id TEXT PRIMARY KEY,
  state      TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS libraries (
  library_id TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  config     TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS meta (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at INTEGER NOT NULL DEFAULT 0
);
`

function safeParse(text, fallback = null) {
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

function all(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

function run(sql, params = []) {
  db.run(sql, params)
}

function persistSoon() {
  if (persistTimer) return
  persistTimer = setTimeout(persistNow, 500)
}

function persistNow() {
  if (persistTimer) {
    clearTimeout(persistTimer)
    persistTimer = null
  }
  if (!db) return
  try {
    writeFileSync(dbPath, Buffer.from(db.export()))
  } catch (err) {
    console.error('SQLite 落盘失败:', err.message)
  }
}

export async function initStore() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
  const SQL = await initSqlJs({ locateFile: () => wasmPath })
  db = existsSync(dbPath) ? new SQL.Database(readFileSync(dbPath)) : new SQL.Database()
  db.run(SCHEMA)
  persistNow()

  process.on('exit', persistNow)
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      persistNow()
      process.exit(0)
    })
  }
  console.log(`SQLite 同步存储已就绪: ${dbPath}`)
  return true
}

// 全量快照：前端启动时拉取，与本地按 updated_at 逐项比较
export function getSnapshot() {
  const libraryRows = all('SELECT library_id, name, config, updated_at FROM libraries')
  const libraries = libraryRows.map(r => ({
    id: r.library_id,
    name: r.name,
    config: safeParse(r.config, {}),
    updatedAt: r.updated_at
  }))
  const librariesUpdatedAt = libraryRows.reduce((max, r) => Math.max(max, r.updated_at), 0)

  const progress = {}
  const progressUpdatedAt = {}
  for (const r of all('SELECT library_id, question_id, streak, mastered, pending_confirm, last_wrong_time, next_review_time, history, updated_at FROM progress')) {
    if (!progress[r.library_id]) progress[r.library_id] = {}
    progress[r.library_id][r.question_id] = {
      streak: r.streak,
      mastered: !!r.mastered,
      pendingConfirm: !!r.pending_confirm,
      lastWrongTime: r.last_wrong_time,
      nextReviewTime: r.next_review_time,
      history: safeParse(r.history, [])
    }
    progressUpdatedAt[r.library_id] = Math.max(progressUpdatedAt[r.library_id] || 0, r.updated_at)
  }

  const uiState = {}
  const uiStateUpdatedAt = {}
  for (const r of all('SELECT library_id, state, updated_at FROM ui_state')) {
    uiState[r.library_id] = safeParse(r.state, {})
    uiStateUpdatedAt[r.library_id] = r.updated_at
  }

  const activeRow = all("SELECT value, updated_at FROM meta WHERE key = 'activeLibraryId'")[0]

  return {
    savedAt: Date.now(),
    libraries,
    librariesUpdatedAt,
    progress,
    progressUpdatedAt,
    uiState,
    uiStateUpdatedAt,
    activeLibraryId: activeRow?.value || null,
    activeLibraryUpdatedAt: activeRow?.updated_at || 0
  }
}

// 快照式替换某个库的全部进度（幂等：重复推送结果一致）
export function replaceProgress(libraryId, progressMap, updatedAt = Date.now()) {
  run('BEGIN')
  try {
    run('DELETE FROM progress WHERE library_id = ?', [libraryId])
    const stmt = db.prepare(
      'INSERT INTO progress (library_id, question_id, streak, mastered, pending_confirm, last_wrong_time, next_review_time, history, updated_at) VALUES (?,?,?,?,?,?,?,?,?)'
    )
    for (const [questionId, p] of Object.entries(progressMap || {})) {
      stmt.run([
        libraryId,
        questionId,
        p.streak || 0,
        p.mastered ? 1 : 0,
        p.pendingConfirm ? 1 : 0,
        p.lastWrongTime || null,
        p.nextReviewTime || null,
        JSON.stringify(p.history || []),
        updatedAt
      ])
    }
    stmt.free()
    run('COMMIT')
  } catch (err) {
    run('ROLLBACK')
    throw err
  }
  persistSoon()
}

export function replaceUIState(libraryId, state, updatedAt = Date.now()) {
  run(
    'INSERT OR REPLACE INTO ui_state (library_id, state, updated_at) VALUES (?,?,?)',
    [libraryId, JSON.stringify(state || {}), updatedAt]
  )
  persistSoon()
}

export function replaceLibraries(libraries, updatedAt = Date.now()) {
  run('BEGIN')
  try {
    run('DELETE FROM libraries')
    const stmt = db.prepare(
      'INSERT INTO libraries (library_id, name, config, updated_at) VALUES (?,?,?,?)'
    )
    for (const lib of libraries || []) {
      stmt.run([
        lib.id,
        lib.name || '',
        JSON.stringify({
          description: lib.description || '',
          color: lib.color || '',
          createdAt: lib.createdAt || null
        }),
        updatedAt
      ])
    }
    stmt.free()
    run('COMMIT')
  } catch (err) {
    run('ROLLBACK')
    throw err
  }
  persistSoon()
}

export function setActiveLibraryId(id, updatedAt = Date.now()) {
  run(
    "INSERT OR REPLACE INTO meta (key, value, updated_at) VALUES ('activeLibraryId', ?, ?)",
    [id || null, updatedAt]
  )
  persistSoon()
}
