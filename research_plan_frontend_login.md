# Research Plan: 前端登录实现的主要技术方式

## 研究目标
系统梳理前端登录（身份认证）实现的主要技术方式，覆盖从传统到前沿的方案，并给出各方案的适用场景、前端实现要点与安全权衡。目标是产出一份可直接用于技术分享 / 面试八股的权威资料。

## 查询类型判断
广度优先（Breadth-first）查询：前端登录可按技术路线拆分为多个相互独立、可并行研究的子主题。

## 子主题拆分与子agent分配
1. 传统会话认证与 Token 无状态认证
   - Cookie + Session（服务端会话）、JWT/Bearer Token、前端凭证存储（localStorage vs httpOnly Cookie）、刷新令牌（Refresh Token）与双 Token 机制。
   - 重点：前端如何发起登录、如何携带凭证、如何保持登录态、Token 续期。
2. 第三方登录、SSO 与开放协议
   - OAuth2.0、OpenID Connect、SAML、SSO 单点登录、社交登录（微信/Google/GitHub）、前端授权码流程（Authorization Code + PKCE）。
   - 重点：前端在 OAuth 流程中的角色、回调处理、跨域与状态校验。
3. 无密码与生物识别前沿方案 + 安全权衡
   - Magic Link、OTP/短信验证码、WebAuthn/FIDO2、Passkeys（平台/跨设备通行密钥）、设备绑定。
   - 重点：2024-2026 采用趋势、浏览器/平台支持度、前端集成（navigator.credentials）。
   - 综合安全：XSS、CSRF、Token 泄露、中间人、同源策略、安全头。

## 信息检索策略
- 因当前环境未提供 wechat-article-search 技能，改用 web_search + web_fetch 进行网络检索，并优先官方文档（MDN、W3C WebAuthn、OAuth RFC、OWASP）与权威博客（Auth0、Okta、Google Identity）。
- 检索关键词（含时间参数，聚焦 2024-2026）："frontend authentication methods 2025", "WebAuthn passkeys adoption 2025", "OAuth 2.1 PKCE best practice", "JWT vs session 2025", "前端登录 实现 方案 2025"。
- 综合验证：对照 MDN/OWASP 与厂商文档，剔除过时或推荐度低的做法（如明文存 localStorage Token）。

## 预期产出
一份结构化研究报告，包含：各技术方式的定义、前端核心实现步骤、示例（伪代码/API）、优缺点对比表、适用场景建议、2025-2026 趋势判断、安全注意事项。
