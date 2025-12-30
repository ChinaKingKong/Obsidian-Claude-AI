# Obsidian Claude AI Assistant

> 在Obsidian中嵌入多种AI服务，支持Skills和SubAgent多线程并行处理

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Obsidian](https://img.shields.io/badge/Obsidian-Compatible-blue)](https://obsidian.md)

## ✨ 功能特性

### 🤖 多AI服务商支持

| 服务商 | 模型 | 环境变量 | 推荐场景 |
|--------|------|----------|----------|
| **智谱AI (GLM)** | glm-4-plus, glm-4-air, glm-4-flash, glm-4 | `ZHIPUAI_API_KEY` | 💰 性价比高 |
| **OpenAI (GPT)** | gpt-4o, gpt-4o-mini, gpt-4-turbo | `OPENAI_API_KEY` | 🌍 国际化 |
| **Anthropic (Claude)** | claude-3-5-sonnet, claude-3-opus | `ANTHROPIC_API_KEY` | 🧠 复杂推理 |
| **阿里云 (通义千问)** | qwen-max, qwen-plus, qwen-turbo | `DASHSCOPE_API_KEY` | 🇨🇳 中文优化 |
| **DeepSeek** | deepseek-chat, deepseek-coder | `DEEPSEEK_API_KEY` | 💻 编程助手 |
| **月之暗面 (Kimi)** | moonshot-v1-8k/32k/128k | `MOONSHOT_API_KEY` | 📚 长文本 |

### 🎯 核心功能

- **多AI服务商支持**：灵活切换6种主流AI服务
- **AI对话**：实时对话，支持流式输出
- **Skills系统**：一键执行预定义或自定义AI技能
- **SubAgent并行引擎**：智能任务分解与并行处理
- **灵活认证**：支持设置面板和环境变量配置

### 🛠️ Skills系统

#### 预定义Skills

- 📝 **生成摘要**：为文本生成简洁摘要
- 🌐 **翻译成英文**：将文本翻译成英文
- 🔍 **代码分析**：分析代码质量并提供改进建议

#### 自定义Skills

创建你自己的Skills：
- 自定义名称和描述
- 提示词模板（支持`{{input}}`、`{{selection}}`占位符）
- 自定义图标

### ⚡ SubAgent并行引擎

**三种执行模式：**

1. **完全并行**：所有子任务同时执行
2. **顺序执行**：按顺序依次执行
3. **混合模式**：智能调度，考虑任务依赖关系（推荐）

**任务特性：**
- AI智能任务分解
- 自动分析依赖关系
- 多种结果合并策略

## 📦 安装

### 从源码安装

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/obsidian-claude-ai.git
cd obsidian-claude-ai

# 2. 安装依赖
npm install

# 3. 构建
npm run build

# 4. 部署到Obsidian
npm run deploy
```

### 手动安装

1. 下载最新版本的[Release](https://github.com/yourusername/obsidian-claude-ai/releases)
2. 解压到你的Obsidian vault目录：`你的vault/.obsidian/plugins/obsidian-claude-ai/`
3. 在Obsidian设置中启用插件

### 插件目录位置

⚠️ **重要**：插件应安装在vault目录下，而非全局目录

```
你的vault/
└── .obsidian/
    └── plugins/
        └── obsidian-claude-ai/
            ├── main.js
            ├── manifest.json
            └── resources/
```

## ⚙️ 配置

### 快速开始（推荐智谱GLM）

1. 打开Obsidian设置 → Claude AI Assistant
2. 选择"智谱AI (GLM)"
3. 输入你的智谱API Key
4. 选择模型"glm-4-flash"
5. 开始使用！

### API Key配置

#### 方式1：插件设置面板（推荐）

1. 打开Obsidian设置
2. 找到"Claude AI Assistant"
3. 选择AI服务商
4. 在对应字段输入API Key
5. 选择模型
6. 保存

#### 方式2：环境变量

**智谱GLM：**
```bash
export ZHIPUAI_API_KEY=你的密钥
```

**OpenAI：**
```bash
export OPENAI_API_KEY=你的密钥
```

**Claude：**
```bash
export ANTHROPIC_API_KEY=你的密钥
```

**通义千问：**
```bash
export DASHSCOPE_API_KEY=你的密钥
```

**DeepSeek：**
```bash
export DEEPSEEK_API_KEY=你的密钥
```

**Kimi：**
```bash
export MOONSHOT_API_KEY=你的密钥
```

**优先级**：环境变量 > 设置面板

### 获取API Key

| 服务商 | 注册地址 | 价格 | 免费额度 |
|--------|----------|------|----------|
| [智谱AI](https://open.bigmodel.cn/) | [点击注册](https://open.bigmodel.cn/) | 💰 | 新用户赠送 |
| [OpenAI](https://platform.openai.com/) | [点击注册](https://platform.openai.com/) | 💎💎💎 | $5免费额度 |
| [Anthropic](https://console.anthropic.com/) | [点击注册](https://console.anthropic.com/) | 💎💎 | 新用户赠送 |
| [通义千问](https://bailian.console.aliyun.com/) | [点击注册](https://bailian.console.aliyun.com/) | 💰💰 | 新用户赠送 |
| [DeepSeek](https://platform.deepseek.com/) | [点击注册](https://platform.deepseek.com/) | 💰 | 极低价格 |
| [Kimi](https://platform.moonshot.cn/) | [点击注册](https://platform.moonshot.cn/) | 💰💰 | 新用户赠送 |

## 📚 使用指南

### 基本对话

1. 点击侧边栏的AI图标
2. 输入消息
3. 按Enter发送（Shift+Enter换行）

### 使用Skills

**快速执行：**
1. 选中文本
2. 按`Cmd+P`打开命令面板
3. 选择"对选中文本执行Skill"
4. 选择Skill

**创建自定义Skill：**
1. 打开插件设置
2. 点击"添加自定义Skill"
3. 填写信息：
   - 名称
   - 描述
   - 提示词模板（使用`{{input}}`作为占位符）

### SubAgent并行引擎

**使用步骤：**
1. 打开命令面板
2. 选择"启动SubAgent并行任务"
3. 输入任务描述
4. 等待分解和执行
5. 查看合并结果

**示例任务：**
```
分析如何学习TypeScript，包括：
1. 基础语法
2. 类型系统
3. 实战项目
4. 最佳实践
```

## 🏗️ 开发

### 项目结构

```
obsidian-claude-ai/
├── src/
│   ├── main.ts                 # 插件入口
│   ├── plugin.ts               # 核心插件类
│   ├── types/                  # 类型定义
│   ├── api/                    # API集成层
│   │   ├── auth/               # 认证管理
│   │   └── claude/             # AI客户端
│   ├── skills/                 # Skills系统
│   ├── subagent/               # SubAgent引擎
│   ├── ui/                     # 用户界面
│   └── storage/                # 数据持久化
├── resources/
│   └── styles.css              # 样式文件
└── manifest.json
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 生产构建
npm run build

# 部署到Obsidian
npm run deploy
```

### 技术栈

- **TypeScript** - 类型安全
- **Obsidian Plugin API** - 插件框架
- **esbuild** - 快速打包

## ❓ 常见问题

### Q: 插件不显示怎么办？

A: 确保插件安装在vault目录：
```
你的vault/.obsidian/plugins/obsidian-claude-ai/
```

### Q: API Key无效？

A:
1. 检查API Key格式是否正确
2. 确认API Key未过期
3. 使用设置面板中的验证功能

### Q: SubAgent任务失败？

A:
1. 检查网络连接
2. 确认API配额充足
3. 查看开发者工具Console（`Cmd+Option+I`）

### Q: 如何切换AI服务商？

A:
1. 打开插件设置
2. 在"AI服务商"下拉框中选择
3. 输入对应服务商的API Key
4. 选择模型
5. 保存

### Q: 支持哪些模型？

A: 每个服务商支持不同模型，详见上方"支持的AI服务商"表格。推荐配置：
- **性价比**：智谱GLM-4-flash
- **质量**：Claude 3.5 Sonnet / GPT-4o
- **编程**：DeepSeek-coder
- **长文本**：Kimi moonshot-v1-128k

## 🗺️ 路线图

- [x] 多AI服务商支持
- [x] Skills系统
- [x] SubAgent并行引擎
- [ ] 流式输出SubAgent
- [ ] 更多预定义Skills
- [ ] Skill市场
- [ ] 对话历史导出
- [ ] 多语言UI
- [ ] 主题定制
- [ ] 更多AI服务商

## 🤝 贡献

欢迎贡献！请查看[CONTRIBUTING.md](CONTRIBUTING.md)

### 贡献步骤

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Obsidian](https://obsidian.md/) - 强大的知识管理工具
- [智谱AI](https://open.bigmodel.cn/) - 国产AI服务
- [OpenAI](https://openai.com/) - GPT提供商
- [Anthropic](https://www.anthropic.com/) - Claude提供商
- [阿里云](https://aliyun.com) - 通义千问提供商
- [DeepSeek](https://www.deepseek.com/) - DeepSeek提供商
- [月之暗面](https://www.moonshot.cn/) - Kimi提供商

## ⭐ 支持

如果这个插件对你有帮助，请给个⭐️支持一下！

有问题或建议？欢迎提交[Issue](https://github.com/yourusername/obsidian-claude-ai/issues)！

## 📞 联系方式

- 作者：Your Name
- 邮箱：your.email@example.com
- GitHub：[@yourusername](https://github.com/yourusername)

---

<div align="center">

**Made with ❤️ by the community**

</div>
