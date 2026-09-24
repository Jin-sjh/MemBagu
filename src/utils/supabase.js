import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 微信 webview / 部分移动浏览器中 Navigator LockManager 会超时或异常，
// 导致服务端已登录成功、但客户端在锁内保存会话时报错（表象：登录框不关闭但已登录）。
// 用无操作锁绕过（官方对 React Native 等环境的推荐做法）。
const noOpLock = async (name, acquireTimeout, fn) => await fn()

const REQUEST_TIMEOUT_MS = 15000
const MAX_RETRIES = 2
const BASE_DELAY_MS = 800

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

function abortReason(signal) {
  return signal.reason instanceof Error ? signal.reason : new DOMException('Aborted', 'AbortError')
}

// 网络抖动（大陆访问 supabase.co 偶发连接重置 ERR_CONNECTION_CLOSED）时自动重试，
// MAX_RETRIES = 2 → 最多 3 次尝试，指数退避 + 抖动。
// 与早期实现相比修掉了三个放大器：
//   1. 离线时直接失败，不再白等退避；
//   2. 单次请求带超时，避免弱网下请求悬挂把 UI 卡死；
//   3. 外部 signal 一旦取消（supabase 主动放弃请求 / 上游超时）立即抛出，不再重试"复活"。
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES, delayMs = BASE_DELAY_MS) {
  if (isOffline()) throw new TypeError('Failed to fetch: offline')

  const externalSignal = options.signal

  for (let attempt = 0; ; attempt++) {
    if (externalSignal?.aborted) throw abortReason(externalSignal)

    const controller = new AbortController()
    const onExternalAbort = () => controller.abort(externalSignal.reason)
    externalSignal?.addEventListener('abort', onExternalAbort, { once: true })
    const timer = setTimeout(
      () => controller.abort(new DOMException('Request timeout', 'TimeoutError')),
      REQUEST_TIMEOUT_MS
    )

    try {
      return await fetch(url, { ...options, signal: controller.signal })
    } catch (err) {
      if (externalSignal?.aborted || attempt >= retries || isOffline()) throw err
      await sleep(delayMs * 2 ** attempt + Math.floor(Math.random() * 200))
    } finally {
      clearTimeout(timer)
      externalSignal?.removeEventListener('abort', onExternalAbort)
    }
  }
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { lock: noOpLock },
      global: { fetch: fetchWithRetry }
    })
  : null

// 断网时暂停自动续期：否则 auth-js 会周期性重发
// POST /auth/v1/token?grant_type=refresh_token 并刷屏 ERR_CONNECTION_CLOSED。
// 恢复联网后交还控制权，由 auth-js 自行判断是否需要刷新。
if (supabase && typeof window !== 'undefined') {
  window.addEventListener('offline', () => { supabase.auth.stopAutoRefresh() })
  window.addEventListener('online', () => { supabase.auth.startAutoRefresh() })
}

export async function handleAuthCallback() {
  if (!supabase) return { success: false }
  
  // 支持 hash 和 query 两种参数格式
  let hashParams
  if (window.location.hash && window.location.hash.length > 1) {
    hashParams = new URLSearchParams(window.location.hash.substring(1))
  } else if (window.location.search) {
    hashParams = new URLSearchParams(window.location.search)
  } else {
    return { success: false }
  }
  
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')
  const type = hashParams.get('type')
  
  if (accessToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })
    
    if (!error) {
      window.history.replaceState({}, document.title, window.location.pathname)
      return { success: true, type, user: data.user }
    }
    return { success: false, error }
  }
  
  return { success: false }
}

export async function signIn(email, password) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signUp(email, password) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  return { data, error }
}

export async function signOut() {
  if (!supabase) return { error: new Error('Supabase not configured') }
  const { error } = await supabase.auth.signOut()
  return { error }
}

// 只读本地持久化的会话用户，不发起任何网络请求。
// 用于弱网/云服务不可达时保持登录态展示：auth-js 刷新令牌失败（网络错误）时
// getSession() 会抛错，此时不该把用户判为"未登录"。
export function getCachedSessionUser() {
  try {
    const ref = new URL(supabaseUrl).hostname.split('.')[0]
    const raw = localStorage.getItem(`sb-${ref}-auth-token`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.user || parsed?.currentSession?.user || null
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  if (!supabase) return null
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
  try {
    return supabase.auth.onAuthStateChange(callback)
  } catch {
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
}

export function isSupabaseConfigured() {
  return !!supabase
}
