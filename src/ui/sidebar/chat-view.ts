import { ItemView, WorkspaceLeaf, MarkdownRenderer, Component } from 'obsidian';
import { ClaudeAIPlugin } from '../../plugin';
import { ChatMessage } from '../../types';
import { LOGO_BASE64 } from '../../logo-base64';

/**
 * Claude AI 聊天视图
 * 基于 Chatbox 的设计思路重新实现
 */
export class ChatView extends ItemView {
	private plugin: ClaudeAIPlugin;
	private chatContainer: HTMLElement;
	private inputContainer: HTMLElement;
	private messageList: HTMLElement;
	private textareaElement: HTMLTextAreaElement;
	private sendButtonElement: HTMLButtonElement;
	private menuButtonElement: HTMLButtonElement;
	private dropdownMenu: HTMLElement;
	private isSending: boolean = false;

	constructor(leaf: WorkspaceLeaf, plugin: ClaudeAIPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	/**
	 * 视图类型
	 */
	getViewType(): string {
		return 'claude-ai-chat';
	}

	/**
	 * 显示名称
	 */
	getDisplayText(): string {
		return 'Claude AI Assistant';
	}

	/**
	 * 获取图标
	 */
	getIcon(): string {
		return 'bot';
	}

	/**
	 * 渲染视图
	 */
	async onOpen() {
		try {
			this.containerEl.empty();
			this.containerEl.addClass('claude-ai-view');

			// 创建主容器
			this.chatContainer = this.containerEl.createDiv('claude-ai-chat-container');

			// 创建头部
			this.createHeader();

			// 创建消息列表
			this.messageList = this.chatContainer.createDiv('claude-ai-message-list');

			// 创建输入区域
			this.inputContainer = this.chatContainer.createDiv('claude-ai-input-container');
			this.createInputArea();

			// 加载历史消息
			await this.loadMessages();
		} catch (error) {
			console.error('ChatView onOpen 错误:', error);
		}
	}

	/**
	 * 关闭视图
	 */
	async onClose() {
		// 清理资源
		this.isSending = false;
	}

	/**
	 * 创建头部
	 */
	private createHeader(): void {
		const header = this.chatContainer.createDiv('claude-ai-header');

		// 左侧：Logo、标题和状态
		const headerLeft = header.createDiv('claude-ai-header-left');

		const titleGroup = headerLeft.createDiv('claude-ai-title-group');

		// AI Logo
		const logoContainer = titleGroup.createDiv('claude-ai-logo-container');
		const logoImg = logoContainer.createEl('img');
		logoImg.addClass('claude-ai-logo');
		// 使用Base64编码的图片
		logoImg.src = `data:image/png;base64,${LOGO_BASE64}`;
		logoImg.alt = 'Claude AI Logo';

		const title = titleGroup.createEl('h2', { text: 'Obsidian Claude AI Assistant' });

		// 状态信息
		const statusInfo = headerLeft.createDiv('claude-ai-status-info');
		statusInfo.innerHTML = `
			<span class="claude-ai-status-item">
				<span class="claude-ai-status-dot"></span>
				<span>就绪</span>
			</span>
		`;

		// 右侧：设置按钮
		const settingsButton = header.createEl('button', {
			cls: 'claude-ai-settings-button'
		});
		settingsButton.type = 'button';
		settingsButton.setAttribute('aria-label', '打开设置');
		settingsButton.innerHTML = `
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="3"></circle>
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
			</svg>
		`;

		// 设置按钮点击事件
		settingsButton.addEventListener('click', () => {
			// 打开 Obsidian 设置页面并定位到本插件设置
			this.plugin.openSettings();
		});
	}

	/**
	 * 创建输入区域
	 */
	private createInputArea(): void {
		// 创建输入区域容器（包含输入框和底部栏）
		const inputWrapper = this.inputContainer.createDiv('claude-ai-input-wrapper');

		// 输入框
		this.textareaElement = inputWrapper.createEl('textarea', {
			placeholder: '给 Claude 发送消息...',
			cls: 'claude-ai-input'
		});

		// 底部栏：左侧标签 + 右侧发送按钮
		const bottomBar = inputWrapper.createDiv('claude-ai-bottom-bar');

		// 左侧：模型和思考模式标签
		const tagsContainer = bottomBar.createDiv('claude-ai-tags-container');

		const settings = this.plugin.getSettings();
		const providerName = this.getProviderDisplayName(settings.provider);

		tagsContainer.innerHTML = `
			<span class="claude-ai-status-tag">
				<span class="claude-ai-status-icon">⚡</span>
				${providerName}
			</span>
			<span class="claude-ai-status-tag">
				<span class="claude-ai-status-icon">💭</span>
				思考模式
			</span>
		`;

		// 占据剩余空间
		const spacer = bottomBar.createSpan();
		spacer.style.flex = '1';

		// 发送按钮
		this.sendButtonElement = bottomBar.createEl('button', {
			cls: 'claude-ai-send-button'
		});
		this.sendButtonElement.type = 'button';
		this.sendButtonElement.setAttribute('disabled', 'true');
		this.sendButtonElement.innerHTML = `
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="22" y1="2" x2="11" y2="13"></line>
				<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
			</svg>
		`;

		// 绑定事件处理器
		this.bindEvents();
	}

	/**
	 * 获取提供商显示名称
	 */
	private getProviderDisplayName(provider: any): string {
		const names: Record<string, string> = {
			'zhipu': '智谱 GLM',
			'openai': 'GPT-4',
			'anthropic': 'Claude',
			'qwen': '通义千问',
			'deepseek': 'DeepSeek',
			'moonshot': 'Kimi'
		};
		return names[provider] || 'AI';
	}

	/**
	 * 绑定事件处理器
	 */
	private bindEvents(): void {
		// 发送按钮点击
		this.sendButtonElement.addEventListener('click', () => {
			this.handleSendButtonClick();
		});

		// 回车发送
		this.textareaElement.addEventListener('keydown', (e) => {
			this.handleKeyDown(e);
		});

		// 输入变化
		this.textareaElement.addEventListener('input', () => {
			this.handleInputChange();
		});
	}

	/**
	 * 处理发送按钮点击
	 */
	private handleSendButtonClick(): void {
		const content = this.textareaElement.value.trim();
		if (content && !this.isSending) {
			this.sendMessage(content);
		}
	}

	/**
	 * 处理键盘事件
	 */
	private handleKeyDown(e: KeyboardEvent): void {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			const content = this.textareaElement.value.trim();
			if (content && !this.isSending) {
				this.sendMessage(content);
			}
		}
	}

	/**
	 * 处理输入变化
	 */
	private handleInputChange(): void {
		const hasContent = this.textareaElement.value.trim().length > 0;
		if (hasContent) {
			this.sendButtonElement.removeAttribute('disabled');
		} else {
			this.sendButtonElement.setAttribute('disabled', 'true');
		}
	}

	/**
	 * 发送消息
	 */
	private async sendMessage(content: string): Promise<void> {
		if (!content.trim() || this.isSending) {
			return;
		}

		// 获取客户端
		const client = this.plugin.getApiClient();
		if (!client) {
			this.showConfigError();
			return;
		}

		// 设置发送状态
		this.isSending = true;
		this.updateSendButtonState();

		// 清空输入框
		this.textareaElement.value = '';
		this.sendButtonElement.setAttribute('disabled', 'true');

		// 添加用户消息到UI
		this.appendMessageToUI({
			role: 'user',
			content,
			timestamp: Date.now()
		});

		// 创建助手消息占位符
		const assistantMessage: ChatMessage = {
			role: 'assistant',
			content: '',
			timestamp: Date.now(),
			isStreaming: true,
			userQuestion: content // 保存用户的问题用于生成标题
		};
		this.appendMessageToUI(assistantMessage);

		try {
			// 获取历史消息
			const messages = await this.buildMessageHistory(content);

			// 流式调用
			let fullResponse = '';
			await client.sendMessageStream(messages, {
				onChunk: (chunk: string) => {
					fullResponse += chunk;
					this.updateLastMessage(fullResponse);
				}
			});

			// 完成流式传输
			assistantMessage.content = fullResponse;
			assistantMessage.isStreaming = false;
			this.updateLastMessage(fullResponse, false);

			// 保存到历史
			try {
				const store = this.plugin.getConversationStore();
				if (store) {
					// 确保有活动会话
					let currentSession = store.getCurrentSession();
					if (!currentSession) {
						store.createSession();
						currentSession = store.getCurrentSession();
					}

					if (currentSession) {
						store.addMessage({ role: 'user', content, timestamp: Date.now() });
						store.addMessage(assistantMessage);
					}
				}
			} catch (saveError) {
				// 静默处理保存错误，不影响对话显示
			}

		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : '发送失败';
			this.updateLastMessage(`❌ ${errorMsg}`, false);
		} finally {
			// 重置发送状态
			this.isSending = false;
			this.updateSendButtonState();
		}
	}

	/**
	 * 构建消息历史
	 */
	private async buildMessageHistory(userContent: string): Promise<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>> {
		const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

		try {
			const store = this.plugin.getConversationStore();
			if (!store) {
				// 如果 store 不存在，直接返回当前消息
				return [{ role: 'user', content: userContent }];
			}

			const session = store.getCurrentSession();
			if (session) {
				session.messages.forEach(msg => {
					messages.push({
						role: msg.role,
						content: msg.content
					});
				});
			}
		} catch (error) {
			console.warn('加载历史消息失败:', error);
			// 加载失败不影响新消息发送
		}

		messages.push({ role: 'user', content: userContent });

		return messages;
	}

	/**
	 * 更新发送按钮状态
	 */
	private updateSendButtonState(): void {
		if (this.isSending) {
			this.sendButtonElement.setAttribute('disabled', 'true');
			this.sendButtonElement.addClass('sending');
		} else {
			this.sendButtonElement.removeClass('sending');
			this.handleInputChange();
		}
	}

	/**
	 * 加载历史消息
	 */
	private async loadMessages(): Promise<void> {
		try {
			const store = this.plugin.getConversationStore();
			if (!store) {
				return;
			}

			const session = store.getCurrentSession();
			if (session) {
				session.messages.forEach(msg => {
					this.appendMessageToUI(msg);
				});
			}
		} catch (error) {
			console.warn('加载历史消息失败:', error);
		}
	}

	/**
	 * 添加消息到UI
	 */
	private appendMessageToUI(message: ChatMessage): void {
		const messageEl = this.messageList.createDiv('claude-ai-message');
		messageEl.addClass(`claude-ai-message-${message.role}`);
		if (message.isStreaming) {
			messageEl.addClass('streaming');
		}

		// 为AI消息添加标题栏和复制按钮
		if (message.role === 'assistant') {
			// 保存用户问题到 data 属性
			if (message.userQuestion) {
				messageEl.setAttribute('data-user-question', message.userQuestion);
			}

			// 标题栏容器
			const header = messageEl.createDiv('claude-ai-message-header-content');

			// 标题
			const title = header.createEl('h4', {
				text: message.isStreaming ? 'Claude AI' : this.generateTitle(message.content, message.userQuestion)
			});
			title.addClass('claude-ai-message-title');

			// 复制按钮
			const copyButton = header.createEl('button', {
				cls: 'claude-ai-copy-button'
			});
			copyButton.type = 'button';
			copyButton.setAttribute('aria-label', '复制消息');
			copyButton.innerHTML = `
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
				</svg>
			`;

			// 复制按钮点击事件
			copyButton.addEventListener('click', async () => {
				await this.copyToClipboard(message.content);
				this.showToast('复制成功');
			});
		}

		// 内容容器
		const content = messageEl.createDiv('claude-ai-message-content');

		// 渲染Markdown内容
		this.renderMarkdown(content, message.content, message.isStreaming);

		// 滚动到底部
		this.scrollToBottom();
	}

	/**
	 * 更新最后一条消息
	 */
	private updateLastMessage(content: string, isStreaming: boolean = true): void {
		const lastMessage = this.messageList.lastElementChild;
		if (!lastMessage) {
			return;
		}

		const contentEl = lastMessage.querySelector('.claude-ai-message-content') as HTMLElement;
		if (contentEl) {
			contentEl.empty();
			// 渲染Markdown内容
			this.renderMarkdown(contentEl, content, isStreaming);
		}

		// 流式输出完成后更新标题
		if (!isStreaming) {
			lastMessage.removeClass('streaming');

			const titleEl = lastMessage.querySelector('.claude-ai-message-title') as HTMLElement;
			if (titleEl) {
				// 从消息元素获取 userQuestion
				const userQuestion = lastMessage.getAttribute('data-user-question');
				titleEl.textContent = this.generateTitle(content, userQuestion || undefined);
			}
		}

		// 滚动到底部
		this.scrollToBottom();
	}

	/**
	 * 根据内容生成标题
	 */
	private generateTitle(content: string, userQuestion?: string): string {
		// 如果有用户的问题，优先使用
		if (userQuestion && userQuestion.trim()) {
			const question = userQuestion.trim();
			// 限制标题长度
			if (question.length <= 25) {
				return question;
			}
			// 如果问题太长，截取关键部分
			return question.substring(0, 25) + '...';
		}

		// 去除多余的空白字符
		const trimmedContent = content.trim();

		// 如果内容为空
		if (!trimmedContent) {
			return '回复';
		}

		// 检测是否包含代码块
		const codeBlockMatch = trimmedContent.match(/```(\w+)?/);
		if (codeBlockMatch) {
			const language = codeBlockMatch[1];
			return language ? `${language} 代码` : '代码片段';
		}

		// 检测内容类型并生成标题
		const lines = trimmedContent.split('\n').filter(line => line.trim());

		// 检查是否有 Markdown 标题
		const firstLine = lines[0]?.trim();
		if (firstLine && /^#{1,6}\s/.test(firstLine)) {
			const title = firstLine.replace(/^#{1,6}\s+/, '').trim();
			if (title.length <= 20) {
				return title;
			}
		}

		// 分析内容特征
		const hasList = /^\s*[-*+]\s|^\s*\d+\.\s/m.test(trimmedContent);
		const hasCode = /`[^`]+`/.test(trimmedContent);
		const hasSteps = /第[一二三四五六七八九十\d]+[步步]|步骤\d+/i.test(trimmedContent);
		const hasQuestion = /[？?]$/.test(lines[0] || '');
		const hasError = /错误|失败|异常|error|exception/i.test(trimmedContent.substring(0, 100));
		const hasSolution = /解决|修复|方法|方案|可以|应该|建议/i.test(trimmedContent.substring(0, 100));

		// 根据特征生成标题
		if (hasError && hasSolution) {
			return '问题解答';
		}

		if (hasSteps) {
			return '操作步骤';
		}

		if (hasList) {
			const listItems = trimmedContent.match(/^\s*[-*+]\s+.+$/gm) || [];
			if (listItems.length >= 3) {
				return '列表清单';
			}
			return '说明';
		}

		if (hasQuestion) {
			return '问答';
		}

		// 检查是否是解释性内容
		const explanatoryKeywords = /是|是指|表示|包括|包含|可以分为|主要|用于|用来|是一种|定义|意思|解释/i;
		if (explanatoryKeywords.test(trimmedContent.substring(0, 100))) {
			// 提取关键词作为标题
			const firstSentence = lines[0] || '';
			const keywordMatch = firstSentence.match(/(?:什么是|如何|怎么|什么是)(.+?)(?:的|？|\?|$)/);
			if (keywordMatch) {
				const keyword = keywordMatch[1].trim();
				if (keyword.length <= 15) {
					return keyword + '说明';
				}
			}
			return '说明';
		}

		// 检查是否是代码相关
		if (hasCode || /函数|方法|变量|参数|返回|调用/i.test(trimmedContent.substring(0, 100))) {
			return '代码说明';
		}

		// 检查是否是配置相关
		if (/配置|设置|选项|参数|开启|关闭|启用|禁用/i.test(trimmedContent.substring(0, 100))) {
			return '配置说明';
		}

		// 检查是否是示例
		if (/例如|比如|示例|演示|如下/i.test(trimmedContent.substring(0, 100))) {
			return '示例说明';
		}

		// 提取第一句话的关键词
		const firstSentence = (lines[0] || '').trim();
		if (firstSentence) {
			// 去除常见的开头词
			let shortTitle = firstSentence
				.replace(/^(好的|当然|没问题|我来|让我|根据|按照|以下是|这里|以上|这个)/, '')
				.replace(/[，,。.!！?？\s]*$/, '')
				.trim();

			// 如果太长，截取关键部分
			if (shortTitle.length > 20) {
				const words = shortTitle.split(/[，,、\s]+/);
				if (words.length > 0) {
					shortTitle = words[0].trim();
					if (shortTitle.length > 15) {
						shortTitle = shortTitle.substring(0, 15);
					}
				}
			}

			if (shortTitle.length >= 2 && shortTitle.length <= 20) {
				return shortTitle;
			}
		}

		// 默认标题
		return '回复';
	}

	/**
	 * 渲染Markdown内容
	 */
	private renderMarkdown(container: HTMLElement, content: string, isStreaming: boolean = false): void {
		if (!content || content.trim() === '') {
			container.createEl('p', { text: '...' });
			return;
		}

		// 流式输出时使用简单文本显示（性能优化）
		if (isStreaming) {
			container.createEl('p', { text: content });
			return;
		}

		// 完成后使用Markdown渲染
		MarkdownRenderer.renderMarkdown(
			content,
			container,
			this.plugin.getManifest().id,
			new Component()
		);
	}

	/**
	 * 滚动到底部
	 */
	private scrollToBottom(): void {
		this.messageList.scrollTop = this.messageList.scrollHeight;
	}

	/**
	 * 显示配置错误
	 */
	private showConfigError(): void {
		this.appendMessageToUI({
			role: 'assistant',
			content: '⚠️ 请先在设置中配置API Key',
			timestamp: Date.now()
		});
	}

	/**
	 * 处理新对话
	 */
	private handleNewChat(): void {
		try {
			const store = this.plugin.getConversationStore();
			if (store) {
				store.createSession();
			}
		} catch (error) {
			console.warn('创建新对话失败:', error);
		}
		this.messageList.empty();
	}

	/**
	 * 复制到剪贴板
	 */
	private async copyToClipboard(text: string): Promise<void> {
		try {
			await navigator.clipboard.writeText(text);
		} catch (error) {
			// 降级方案：使用传统的复制方法
			const textArea = document.createElement('textarea');
			textArea.value = text;
			textArea.style.position = 'fixed';
			textArea.style.opacity = '0';
			document.body.appendChild(textArea);
			textArea.select();
			try {
				document.execCommand('copy');
			} catch (err) {
				console.error('复制失败:', err);
			}
			document.body.removeChild(textArea);
		}
	}

	/**
	 * 显示Toast提示
	 */
	private showToast(message: string): void {
		// 移除已存在的Toast
		const existingToast = this.containerEl.querySelector('.claude-ai-toast');
		if (existingToast) {
			existingToast.remove();
		}

		// 创建新Toast
		const toast = this.containerEl.createDiv('claude-ai-toast');
	toast.textContent = message;
		this.containerEl.appendChild(toast);

		// 触发动画（使用requestAnimationFrame确保class生效）
		requestAnimationFrame(() => {
			toast.addClass('claude-ai-toast-show');
		});

		// 自动移除
		setTimeout(() => {
			toast.removeClass('claude-ai-toast-show');
			toast.addClass('claude-ai-toast-hiding');
			setTimeout(() => {
				toast.remove();
			}, 300);
		}, 2000);
	}

	/**
	 * 处理打开 Skills 面板
	 */
	private handleOpenSkills(): void {
		this.appendMessageToUI({
			role: 'assistant',
			content: 'Skills面板开发中...',
			timestamp: Date.now()
		});
	}
}
