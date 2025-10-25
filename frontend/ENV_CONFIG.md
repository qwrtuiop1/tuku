# 前端环境变量配置说明

## 环境变量文件

在 `frontend` 目录下创建 `.env` 文件，配置以下环境变量：

```bash
# Geetest 验证码配置
VITE_GEETEST_CAPTCHA_ID=7922d406fb215d02770d5a4cd71af066

# QQ 登录配置
VITE_QQ_APP_ID=102816534
VITE_QQ_REDIRECT_URI=https://tukufrontend.vtart.cn/auth/qq/callback

# API 配置
VITE_API_BASE_URL=https://tukubackend.vtart.cn
```

## 重要说明

1. **Vite 环境变量规则**：前端环境变量必须以 `VITE_` 开头才能在客户端代码中访问
2. **与后端配置对应**：
   - `VITE_GEETEST_CAPTCHA_ID` 对应后端的 `GEETEST_CAPTCHA_ID`
   - `VITE_QQ_APP_ID` 对应后端的 `QQ_APP_ID`
   - `VITE_QQ_REDIRECT_URI` 对应后端的 `QQ_REDIRECT_URI`
   - `VITE_API_BASE_URL` 用于前端API请求的基础URL

## 当前配置状态

- ✅ Geetest验证码ID已正确配置：`7922d406fb215d02770d5a4cd71af066`
- ✅ API基础URL已正确配置：`https://tukubackend.vtart.cn`
- ⚠️ QQ登录配置需要创建 `.env` 文件

## 部署建议

1. 在生产环境中，确保 `.env` 文件包含正确的配置
2. 不要将 `.env` 文件提交到版本控制系统
3. 使用 `.env.example` 作为配置模板


