# Tasks

- [x] Task 1: 在 Express 服务器添加题库文件夹管理 API
  - [x] SubTask 1.1: 添加 POST /api/libraries/create 接口，创建 src/data/{id} 文件夹
  - [x] SubTask 1.2: 添加输入验证，防止路径注入攻击
  - [x] SubTask 1.3: 添加 DELETE /api/libraries/{id}/folder 接口，删除空文件夹
  - [x] SubTask 1.4: 添加 GET /api/libraries/{id}/exists 接口，检查文件夹是否存在

- [x] Task 2: 前端集成后端 API
  - [x] SubTask 2.1: 在 useLibraries.js 中添加调用后端 API 的函数
  - [x] SubTask 2.2: 修改 createLibrary 函数，先调用后端创建文件夹
  - [x] SubTask 2.3: 添加后端服务不可用时的降级处理

- [x] Task 3: 更新 UI 提示
  - [x] SubTask 3.1: 更新 LibraryManager.vue 中的提示文字，反映真实行为

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
