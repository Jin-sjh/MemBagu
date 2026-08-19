# 前端登录实现的主要技术方式研究报告

## 摘要

前端登录的本质是"身份认证"在前端的落地，其技术方式可按演进路径分为五大类：基于 Cookie+Session 的服务端会话认证、基于 JWT/Bearer Token 的无状态认证、基于 OAuth2/OIDC 的第三方登录与 SSO 单点登录、基于 Magic Link/OTP 的无密码认证，以及基于 WebAuthn/FIDO2 的 Passkeys 通行密钥。截至 2025-2026 年的行业共识是：凭证应尽量交由 httpOnly+Secure+SameSite Cookie 与后端（BFF）托管，避免把 Token 暴露在浏览器 JS 中；同时 Passkeys 正快速成为防钓鱼的首选方案。本报告将逐类拆解前端核心实现、优劣与适用场景。

## 背景

随着前后端分离架构与 SPA 的普及，前端不再只是提交表单，而是直接承担登录态持有、凭证携带、令牌刷新、第三方回调处理等职责。不同的技术方式在安全性、用户体验、跨域与跨设备能力上差异巨大。理清这些方式，既能指导新项目选型，也是前端面试中"登录是怎么做的"这一高频题的核心知识。

## 一、Cookie + Session 服务端会话认证

这是最传统的方案。前端通过表单或 fetch 把用户名密码 POST 给后端，后端校验成功后，在响应头写入 Set-Cookie，例如 `Set-Cookie: SID=...; Path=/; Secure; HttpOnly; SameSite=Lax`。此后浏览器对该域的每次请求会自动带上这个会话标识，前端无需手动处理，登录态由服务端会话存储维持。失效可通过客户端清 Cookie 或服务端使会话作废（logout、空闲超时、绝对超时）实现。

SameSite 属性是此方案的安全核心：Strict 完全阻止跨站携带 Cookie 防护最强但外部链接进入会丢失登录态；Lax 仅允许顶级导航的安全方法携带，兼顾可用性；None 不限制跨站但必须配 Secure。CSRF 攻击正是利用"仅凭 Cookie 自动携带、参数可预测"的接口，因此除 SameSite 外还需配合不可预测的 CSRF 令牌、Fetch Metadata（Sec-Fetch-Site 头）以及把状态变更请求设为非简单请求来阻断自动提交。该方案对前端最简单，但要求前后端同域或依赖 CORS 凭据，且服务端需维护会话存储。

## 二、JWT / Bearer Token 无状态认证

登录成功后，后端在 JSON 响应体返回 Token（如 `{"accessToken":"eyJ..."}`），前端将其存入 localStorage、sessionStorage 或内存变量，之后每次请求在 Authorization 头携带：`fetch('/api', {headers:{'Authorization':`Bearer ${token}`}})`。Bearer 方案源自 RFC 6750。其优势是无须服务端会话存储、天然适配跨域与微服务，但 Token 一旦签发服务端难以即时吊销（除非引入黑名单或短过期）。

凭证存储是此方案的关键取舍。OWASP 指出 localStorage/sessionStorage 不受 HttpOnly 保护、易被 XSS 一锅端窃取，2024-2026 业界推荐敏感会话标识用 httpOnly Cookie，Access Token 存内存变量（SPA 最佳实践），并对过期做拦截器预判或在收到 401 后触发刷新。

## 三、刷新令牌与双 Token 机制

为兼顾安全与体验，主流采用 Access Token（短期，如 15 分钟）+ Refresh Token（长期）双令牌。Refresh Token 应存于 httpOnly Cookie 以防 XSS 读取，前端通过 `fetch('/refresh', {credentials:'include'})` 静默刷新。Auth0 等进一步推荐 Refresh Token Rotation：每次用旧刷新令牌换出新令牌对，旧令牌立即作废、变为短期单次使用；一旦检测到已作废令牌被重用，作废整个令牌族，有效防御重放。前端典型实现是 axios/fetch 拦截器：响应 401 时调用刷新接口更新内存 Token 并重试原请求，刷新失败则清凭证跳登录。

## 四、跨域场景下的凭证携带

前后端域名分离时，浏览器默认不在跨源请求带凭据，前端须显式设置 `fetch(url, {credentials:'include'})`，且服务端须返回 `Access-Control-Allow-Credentials: true`，同时 `Access-Control-Allow-Origin` 不能为通配符 `*`，必须是精确源。若使用 Bearer Token 方案则不受 Cookie 跨域限制，但仍受 CORS 对自定义头的校验。

## 五、第三方登录、OAuth2 与 OIDC

OAuth 2.0（RFC 6749）与 OIDC（2014）让前端得以接入微信、Google、GitHub 等身份提供方。SPA/移动端属于"公共客户端"，无法安全保管 client_secret，历史上用过的隐式流（Implicit）因 Token 暴露于 URL fragment 已被 OAuth 2.1 草案废弃。现代标准是授权码 + PKCE（RFC 7636）：前端用 crypto.getRandomValues 生成 code_verifier，以 S256 方法算出 code_challenge 随授权请求发送；回调拿到 code 后，用 code + code_verifier 向令牌端点换 Token。PKCE 在 OAuth 2.1 中已成为所有客户端的强制要求。

微信网页授权即 OAuth2 授权码模式，前端构造 open.weixin.qq.com 的授权链接并带 state 防 CSRF，用户同意后回调返回 code（5 分钟单次有效），由后端携 appid+secret+code 换 access_token 与 openid，严禁把 secret 交予客户端。Google 与 GitHub 同理，均要求后端用 code + client_secret 换 Token，state 校验一致以防 CSRF。

SSO 单点登录主流为 SAML 2.0 与 OIDC：前端在流程中只是"被重定向的浏览器"，不解析断言，由 SP/RP 后端验签后建立本地会话，多应用间靠 IdP 域下全局会话 Cookie 共享。

最关键的安全演进是 BFF（Backend for Frontend）模式：引入专用后端作为机密客户端完成 OIDC 协商并代管全部 Token，前端只持有后端签发的 HttpOnly+Secure 会话 Cookie，Token 永不到达前端 JS。这是 2024-2026 间 SPA 接入企业 IdP 与社交登录的推荐架构，也规避了第三方 Cookie 退场对传统 SSO 的冲击（Chrome 推迟禁用、Safari/Firefox 早已隔离，催生 CHIPS 分区 Cookie 与令牌中介方案）。

## 六、无密码与 Passkeys 通行密钥

无密码认证以"持有因素"替代"所知因素"。Magic Link 通过邮件签名链接建立会话；OTP/短信验证码由前端提交、后端比对限时随机码。但其局限明显：短信验证码易受 SIM 交换攻击与拦截，且人工输入的验证码均无法抵御钓鱼。OWASP 明确将 SMS OTP 列为不具备防钓鱼能力的机制，推荐 FIDO/WebAuthn/Passkey。

WebAuthn（W3C，当前 Level 3）与 CTAP 共同构成 FIDO2，核心是挑战-应答式非对称公钥密码学：注册时认证器生成密钥对，私钥永不离开设备、由生物识别或 PIN 保护，服务器仅存公钥；认证时服务器下发随机 challenge，认证器用私钥签名、服务端验签，全程不传密码或私钥，且凭据绑定域名（origin-bound），天然防钓鱼。前端入口是 Credential Management API：注册用 `navigator.credentials.create()`，认证用 `navigator.credentials.get()`，参数含 challenge、rp、user、pubKeyCredParams 等。

Passkeys 是 FIDO2 凭据，分平台通行密钥（Touch ID/Face ID/Windows Hello）与跨设备同步通行密钥（iCloud Keychain、Google Password Manager）。采用数据：FIDO 联盟 2024 年调查 53% 用户已在至少一个账户启用 passkey；Google 报告其生态超 8 亿账户使用、累计超 25 亿次 passkey 登录、登录成功率提升约 30%；FIDO《Passkey Index 2025》显示约 36% 已注册用户、26% 登录通过 passkey 完成。Thoughtworks 技术雷达于 2026-04 将其升级为 Adopt。前端集成靠条件式 UI：用户名框标注 `autocomplete="username webauthn"` 并挂起 `navigator.credentials.get({mediation:"conditional"})`，不支持的浏览器回退密码登录，实现渐进增强。

## 方案对比

| 方式 | 前端核心动作 | 防钓鱼 | 跨域/跨设备 | 推荐存储 |
| --- | --- | --- | --- | --- |
| Cookie+Session | 自动带 Cookie | 弱（靠 CSRF 令牌） | 同域或 CORS 凭据 | httpOnly+Secure+SameSite |
| JWT/Bearer | 内存存 Token+Authorization 头 | 弱 | 强 | 内存（勿用 localStorage） |
| OAuth2/OIDC | 授权码+PKCE 回调换 Token | 中（state 校验） | 强（第三方登录） | BFF 后端代管 |
| Magic Link/OTP | 收链接/填验证码 | 弱（OTP 不防钓鱼） | 强 | 一次性、限时 |
| WebAuthn/Passkeys | navigator.credentials 签名挑战 | 强（origin 绑定） | 跨设备同步密钥 | 设备安全区/密钥链 |

## 综合分析

从安全纵深看，方案演进的主线是把"秘密"从前端 JS 与网络传输中剥离：传统 Session 把会话 ID 锁进 HttpOnly Cookie；JWT 把暴露面限制的 Token 放进内存并靠双令牌续期；OAuth/BFF 则让 Token 完全不落地到浏览器；Passkeys 更进一步，连密码这个"所知因素"都替换为绑定域名的公钥凭据，从协议层杜绝钓鱼与重放。跨域与第三方 Cookie 退场是 2024-2026 最大的外部约束，推动 BFF 与令牌中介成为事实标准。对大多数新项目，务实选型是：同源用 Cookie+Session 或双 Token，跨域/第三方登录用 OAuth2+PKCE+BFF，并在密码登录之上叠加 Passkeys 作为渐进增强与首选登录。

## 结论

前端登录实现已从上单的"表单提交+服务端 Session"发展为多元技术谱系。当前（2025-2026）的最佳实践共识是：用 httpOnly+Secure+SameSite Cookie 或 BFF 后端托管凭证、避免 Token 落入前端 JS 与 localStorage；第三方登录统一采用授权码+PKCE 并交由后端换 Token；在密码体系之外优先引入 WebAuthn/Passkeys 以获得防钓鱼与更好的转化率。技术选型应结合同域/跨域、是否需 SSO、目标平台（Web/原生/跨设备）综合判断，并以 CSP、HSTS 等安全头做纵深防御。

## 局限

本报告基于公开权威文档与 2024-2026 行业资料，未覆盖具体业务（如金融级强认证、设备指纹、风控规则）的定制实现；Passkeys 的采用数据为厂商与联盟披露口径，统计方法不完全一致；OAuth 2.1 截至 2025 仍为草案，部分条款仍在演进。实际落地请以各身份提供方最新文档为准。

## 参考资料

1. [Authentication - OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
2. [Session Management - OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.ac.cn/cheatsheets/Session_Management_Cheat_Sheet.html)
3. [Refresh Token Rotation - Auth0 Docs](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)
4. [The Backend for Frontend Pattern (BFF) | Auth0](https://auth0.com/blog/the-backend-for-frontend-pattern-bff/)
5. [RFC 7636: Proof Key for Code Exchange (PKCE) | RFC Editor](https://www.rfc-editor.org/info/rfc7636)
6. [OpenID Connect Core 1.0 | OpenID Foundation](https://openid.net/specs/openid-connect-core-1_0.html)
7. [微信网页应用授权登录 | 微信开放平台](https://developers.weixin.qq.com/doc/oplatform/developers/dev/auth/h5.html)
8. [FIDO Passkeys | FIDO Alliance](https://fidoalliance.org/passkeys/)
9. [Web Authentication API | MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
10. [通过表单自动填充实现通行密钥登录 | web.dev](https://web.developers.google.cn/articles/passkey-form-autofill?hl=zh-cn)
11. [Passkeys | Thoughtworks Technology Radar](https://www.thoughtworks.com/zh-cn/radar/techniques/passkeys)
12. [Cross-site request forgery (CSRF) | MDN](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF)
