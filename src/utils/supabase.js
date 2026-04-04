import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
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
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
  return supabase.auth.onAuthStateChange(callback)
}

export function isSupabaseConfigured() {
  return !!supabase
}
