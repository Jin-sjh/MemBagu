# 题库文件夹自动创建功能 Spec

## Why
当前创建题库时，前端只将题库信息保存到 localStorage，不会在文件系统中创建对应的文件夹。UI 提示"将创建 src/data/xxx/ 目录"具有误导性，用户创建题库后无法实际添加题目文件。

## What Changes
- 在现有 Express 服务器上添加题库管理 API
- 实现创建题库时自动创建对应文件夹
- 前端调用后端 API 完成文件夹创建
- 删除题库时可选删除对应文件夹

## Impact
- Affected code: 
  - `server/audio-server.js` - 添加题库管理 API
  - `src/composables/useLibraries.js` - 调用后端 API
  - `src/components/LibraryManager.vue` - 更新 UI 提示

## ADDED Requirements

### Requirement: 题库文件夹创建 API
系统 SHALL 提供后端 API 用于创建题库对应的文件夹。

#### Scenario: 成功创建文件夹
- **WHEN** 前端调用 POST /api/libraries/create 请求，包含 { id: "llm", name: "LLM" }
- **THEN** 服务器在 src/data/llm/ 目录下创建文件夹
- **AND** 返回 { success: true, path: "src/data/llm" }

#### Scenario: 文件夹已存在
- **WHEN** 请求创建的文件夹已存在
- **THEN** 返回 { success: true, path: "src/data/llm", exists: true }

#### Scenario: 无效的题库 ID
- **WHEN** 请求的 id 包含非法字符（如 ../ 或特殊字符）
- **THEN** 返回 { success: false, error: "无效的题库ID" }

### Requirement: 题库文件夹删除 API
系统 SHALL 提供后端 API 用于删除题库对应的文件夹。

#### Scenario: 成功删除空文件夹
- **WHEN** 前端调用 DELETE /api/libraries/{id}/folder 请求
- **AND** 文件夹为空
- **THEN** 删除该文件夹
- **AND** 返回 { success: true }

#### Scenario: 文件夹非空
- **WHEN** 文件夹内包含文件
- **THEN** 返回 { success: false, error: "文件夹非空，请手动处理" }

### Requirement: 前端集成
前端 SHALL 在创建题库时调用后端 API 创建对应文件夹。

#### Scenario: 创建题库流程
- **WHEN** 用户在前端创建新题库
- **THEN** 前端先调用后端 API 创建文件夹
- **AND** 成功后再保存题库信息到 localStorage

#### Scenario: 后端服务不可用
- **WHEN** 后端服务未启动或不可达
- **THEN** 显示警告提示，但仍允许创建题库（仅保存到 localStorage）
