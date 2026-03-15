# Checklist

- [x] POST /api/libraries/create 接口正常工作，能创建文件夹
- [x] 输入验证能阻止路径注入攻击（如 ../ 或特殊字符）
- [x] DELETE /api/libraries/{id}/folder 接口能删除空文件夹
- [x] GET /api/libraries/{id}/exists 接口能正确检查文件夹存在状态
- [x] 前端创建题库时成功调用后端 API
- [x] 后端服务不可用时显示警告但仍能创建题库
- [x] UI 提示文字准确反映实际行为
