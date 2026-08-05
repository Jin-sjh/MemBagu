import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 微信 webview / 部分移动浏览器中 Navigator LockManager 会超时或异常，
// 导致服务端已登录成功、但客户端在锁内保存会话时报错（表象：登录框不关闭但已登录）。
// 用无操作锁绕过（官方对 React Native 等环境的推荐做法）。
const noOpLock = async (name, acquireTimeout, fn) => await fn()

// 网络抖动（大陆访问 supabase.co 偶发连接重置）时自动重试，最多 3 次，指数退避
async function fetchWithRetry(url, options, retries = 2, delayMs = 1000) {
  try {
    return await fetch(url, options)
  } catch (err) {
    if (retries <= 0) throw err
    await new Promise(resolve => setTimeout(resolve, delayMs))
    return fetchWithRetry(url, options, retries - 1, delayMs * 2)
  }
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { lock: noOpLock },
      global: { fetch: fetchWithRetry }
    })
  : null

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
