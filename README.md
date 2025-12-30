# Obsidian Claude AI Assistant

> 在Obsidian中嵌入Claude AI，支持Skills和SubAgent多线程并行处理

## 功能特性

### 核心功能

- **Claude AI对话**：与Claude进行实时对话，支持流式输出
- **Skills系统**：一键执行预定义或自定义的AI技能
- **SubAgent并行引擎**：将复杂任务分解成多个子任务并行处理
- **多种API认证方式**：支持设置面板和环境变量配置API Key

### Skills系统

#### 预定义Skills

- **生成摘要**：为文本生成简洁的摘要
- **翻译成英文**：将文本翻译成英文
- **代码分析**：分析代码质量并提供改进建议

#### 自定义Skills

用户可以创建自己的Skills，定义：
- Skill名称和描述
- 提示词模板（支持占位符如`{{input}}`、`{{selection}}`）
- 自定义图标

### SubAgent并行引擎

支持三种执行模式：

1. **完全并行**（Parallel）：所有子任务同时执行
2. **顺序执行**（Sequential）：按顺序依次执行
3. **混合模式**（Hybrid）：考虑任务依赖关系，智能调度（推荐）

#### 任务分解

使用Claude AI智能分解复杂任务：
- 自动识别可独立的子任务
- 分析任务依赖关系
- 生成可执行的子任务列表

#### 结果合并

三种合并策略：
- **拼接**：直接拼接所有结果
- **智能摘要**：使用Claude生成综合摘要
- **自定义结构**：JSON格式的结构化输出

## 安装

### 从源码安装

1. 克隆仓库
```bash
git clone https://github.com/yourusername/obsidian-claude-ai.git
cd obsidian-claude-ai
```

2. 安装依赖
```bash
npm install
```

3. 构建
```bash
npm run build
```

4. 在Obsidian中安装
   - 复制整个项目文件夹到Obsidian的插件目录
   - 在Obsidian设置中启用插件

### 插件目录位置

- **Windows**: `%APPDATA%\Obsidian\plugins\`
- **macOS**: `~/Library/Application Support/Obsidian/Plugins/`
- **Linux**: `~/.config/obsidian/plugins/`

## 配置

### API Key配置

支持两种方式配置Claude API Key：

#### 方式1：插件设置面板

1. 打开Obsidian设置
2. 找到"Claude AI Assistant"插件
3. 在"API Key"字段输入你的API Key

#### 方式2：环境变量

设置系统环境变量：
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

**优先级**：环境变量 > 设置面板

### 模型配置

可选择以下模型：
- Claude 3.5 Sonnet（推荐）
- Claude 3 Opus
- Claude 3 Sonnet
- Claude 3 Haiku

## 使用指南

### 基本对话

1. 点击侧边栏的Claude图标或使用快捷键打开侧边栏
2. 在输入框中输入消息
3. 点击发送或按Enter键（Shift+Enter换行）

### 使用Skills

#### 快速执行Skill

1. 在编辑器中选中一段文本
2. 使用命令面板（Ctrl/Cmd + P）
3. 选择"对选中文本执行Skill"
4. 选择要执行的Skill

#### 创建自定义Skill

1. 打开插件设置
2. 在"Skills设置"中点击"添加自定义Skill"
3. 填写Skill信息：
   - 名称：Skill的显示名称
   - 描述：简要说明Skill的功能
   - 提示词模板：使用`{{input}}`作为占位符

示例：
```
请将以下文本改写成更专业的语气：

{{input}}

改写后的文本：
```

### 使用SubAgent并行引擎

1. 打开命令面板
2. 选择"启动SubAgent并行任务"
3. 输入任务描述
4. 等待任务分解和执行
5. 查看合并后的结果

## 开发

### 项目结构

```
obsidian-claude-ai/
├── src/
│   ├── main.ts                 # 插件入口
│   ├── plugin.ts               # 核心插件类
│   ├── api/                    # API集成层
│   │   ├── claude/             # Claude API客户端
│   │   └── auth/               # 认证管理
│   ├── skills/                 # Skills系统
│   │   ├── predefined/         # 预定义Skills
│   │   └── custom-skill-loader.ts
│   ├── subagent/               # SubAgent引擎
│   │   ├── parallel-executor.ts
│   │   ├── task-decomposer.ts
│   │   └── result-merger.ts
│   ├── ui/                     # 用户界面
│   │   ├── sidebar/            # 侧边栏视图
│   │   └── settings/           # 设置面板
│   ├── storage/                # 数据持久化
│   └── types/                  # 类型定义
├── resources/
│   └── styles.css              # 样式文件
└── manifest.json               # 插件清单
```

### 构建

```bash
# 开发模式（热重载）
npm run dev

# 生产构建
npm run build
```

### 技术栈

- **TypeScript**: 类型安全的JavaScript
- **Obsidian Plugin API**: Obsidian插件开发框架
- **Anthropic SDK**: Claude AI官方SDK
- **esbuild**: 快速的JavaScript打包工具

## 常见问题

### API Key无效

- 确保API Key格式正确（以`sk-ant-`开头）
- 检查API Key是否已过期
- 使用设置面板中的"验证API Key"功能

### SubAgent任务失败

- 检查网络连接
- 确认API配额充足
- 查看控制台错误日志

### Skills不生效

- 确保已正确配置API Key
- 检查Skill的提示词模板语法
- 查看控制台错误日志

## 路线图

- [ ] 支持流式输出的SubAgent
- [ ] 更多预定义Skills
- [ ] Skill市场（分享和下载Skills）
- [ ] 对话历史导出
- [ ] 多语言支持
- [ ] 插件主题定制

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 致谢

- [Obsidian](https://obsidian.md/) - 强大的知识管理工具
- [Anthropic](https://www.anthropic.com/) - Claude AI提供商
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) - 插件开发模板
