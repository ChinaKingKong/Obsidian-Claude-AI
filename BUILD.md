# 构建和安装指南

## 开发环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 安装步骤

### 1. 安装依赖

```bash
cd obsidian-claude-ai
npm install
```

### 2. 构建插件

开发模式（热重载）：
```bash
npm run dev
```

生产构建：
```bash
npm run build
```

构建成功后会生成 `main.js` 文件。

### 3. 安装到Obsidian

#### 方法1：手动安装

1. 将整个项目文件夹复制到Obsidian的插件目录：

   - **Windows**: `%APPDATA%\Obsidian\plugins\obsidian-claude-ai\`
   - **macOS**: `~/Library/Application Support/Obsidian/Plugins/obsidian-claude-ai/`
   - **Linux**: `~/.config/obsidian/plugins/obsidian-claude-ai/`

2. 在Obsidian中打开设置
3. 进入"第三方插件"或"社区插件"
4. 找到"Claude AI Assistant"并启用

#### 方法2：符号链接（推荐用于开发）

在项目目录执行：

**macOS/Linux:**
```bash
ln -s $(pwd) ~/Library/Application\ Support/Obsidian/Plugins/obsidian-claude-ai
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType SymbolicLink -Path "$env:APPDATA\Obsidian\plugins\obsidian-claude-ai" -Target (Get-Location).Path
```

## 配置

### 1. 获取Claude API Key

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册或登录账号
3. 创建API Key
4. 保存API Key（格式：`sk-ant-...`）

### 2. 配置插件

在Obsidian设置中找到"Claude AI Assistant"：

#### 方法A：设置面板输入
- 在"API Key"字段粘贴你的API Key
- 点击"验证"按钮确认有效

#### 方法B：环境变量
设置系统环境变量：
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

### 3. 选择模型

推荐使用 **Claude 3.5 Sonnet**（默认）

## 使用

### 基本对话

1. 按 `Ctrl/Cmd + P` 打开命令面板
2. 输入"打开Claude AI助手"
3. 在侧边栏中与Claude对话

### 使用Skills

1. 在编辑器中选中一段文本
2. 按 `Ctrl/Cmd + P` 打开命令面板
3. 输入"对选中文本执行Skill"
4. 选择要执行的Skill（如"生成摘要"）

### 创建自定义Skill

1. 打开插件设置
2. 在"Skills设置"中点击"添加自定义Skill"
3. 填写以下信息：
   - **名称**：Skill的显示名称
   - **描述**：简要说明Skill的功能
   - **提示词模板**：使用 `{{input}}` 作为输入占位符

示例：
```
请将以下文本改写成更专业的语气：

{{input}}

改写后的文本：
```

### 使用SubAgent并行任务

1. 按 `Ctrl/Cmd + P` 打开命令面板
2. 输入"启动SubAgent并行任务"
3. 输入复杂的任务描述，例如：
   ```
   分析Obsidian插件的开发流程，包括：
   1. 项目初始化
   2. 插件API使用
   3. 构建和发布
   4. 最佳实践
   ```
4. 等待任务分解和并行执行
5. 查看合并后的综合结果

## 开发

### 项目结构

```
obsidian-claude-ai/
├── src/
│   ├── main.ts                 # 插件入口
│   ├── plugin.ts               # 核心插件类
│   ├── api/                    # API集成层
│   ├── skills/                 # Skills系统
│   ├── subagent/               # SubAgent引擎
│   ├── ui/                     # 用户界面
│   ├── storage/                # 数据持久化
│   └── utils/                  # 工具函数
├── resources/
│   └── styles.css              # 样式文件
├── manifest.json               # 插件清单
├── package.json
└── tsconfig.json
```

### 调试

1. 在Obsidian中打开开发者工具（`Ctrl+Shift+I` 或 `Cmd+Option+I`）
2. 查看Console标签中的日志
3. 修改代码后，插件会自动重新加载（开发模式）

### 常见问题

#### 构建失败
- 确保Node.js版本 >= 18.0.0
- 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`

#### 插件不显示
- 检查 `manifest.json` 中的 `minAppVersion` 是否与Obsidian版本匹配
- 查看"第三方插件"是否已启用

#### API Key无效
- 确认API Key格式正确（以 `sk-ant-` 开头）
- 使用设置面板中的"验证API Key"功能
- 检查API Key是否已过期

#### SubAgent任务失败
- 查看开发者工具的Console错误日志
- 检查网络连接
- 确认API配额充足

## 发布

### 更新版本号

```bash
npm version patch  # 或 minor, major
```

### 构建生产版本

```bash
npm run build
```

### 发布到GitHub

1. 提交代码
2. 创建Release
3. 上传构建产物

### 提交到Obsidian插件库

1. 在 [Obsidian插件列表](https://obsidian.md/plugins) 提交插件
2. 等待审核

## 许可证

MIT License
