// Vercel Cron 保活任务：每天请求一次 Supabase REST API，
// 防止免费项目因 7 天无活动被自动暂停。
// 环境变量复用项目里已有的 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
//（Vercel 上所有项目环境变量对 Serverless Function 运行时同样可见）。
export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'missing supabase env' })
  }

  try {
    const resp = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    })
    return res.status(200).json({
      ok: true,
      supabaseStatus: resp.status,
      at: new Date().toISOString()
    })
  } catch (err) {
    // 仍返回 200，避免 Vercel 把偶发网络失败标记为 cron 错误
    return res.status(200).json({
      ok: false,
      error: String(err),
      at: new Date().toISOString()
    })
  }
}
