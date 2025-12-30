import { ItemView, WorkspaceLeaf } from 'obsidian';
import { ClaudeAIPlugin } from '../../plugin';
import { ChatMessage } from '../../types';

/**
 * Claude AI 聊天视图
 * 侧边栏中显示的聊天界面
 */
export class ChatView extends ItemView {
	private plugin: ClaudeAIPlugin;
	private chatContainer: HTMLElement;
	private inputContainer: HTMLElement;
	private messageList: HTMLElement;

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
		this.containerEl.empty();

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
	}

	/**
	 * 关闭视图
	 */
	async onClose() {
		// 清理资源
	}

	/**
	 * 创建头部
	 * @private
	 */
	private createHeader() {
		const header = this.chatContainer.createDiv('claude-ai-header');

		// 标题
		const title = header.createEl('h2', { text: 'Claude AI Assistant' });

		// 操作按钮
		const actions = header.createDiv('claude-ai-header-actions');

		// 新对话按钮
		const newChatBtn = actions.createEl('button', {
			text: '新对话',
			cls: 'claude-ai-btn'
		});
		newChatBtn.onclick = () => this.startNewChat();

		// Skills按钮
		const skillsBtn = actions.createEl('button', {
			text: 'Skills',
			cls: 'claude-ai-btn'
		});
		skillsBtn.onclick = () => this.openSkillsPanel();
	}

	/**
	 * 创建输入区域
	 * @private
	 */
	private createInputArea() {
		// 文本输入框
		const textarea = this.inputContainer.createEl('textarea', {
			placeholder: '输入消息...',
			cls: 'claude-ai-input'
		});

		// 按钮容器
		const buttonContainer = this.inputContainer.createDiv('claude-ai-button-container');

		// 发送按钮
		const sendBtn = buttonContainer.createEl('button', {
			text: '发送',
			cls: 'claude-ai-btn claude-ai-btn-primary'
		});
		sendBtn.onclick = () => this.sendMessage(textarea.value);

		// SubAgent按钮
		const subAgentBtn = buttonContainer.createEl('button', {
			text: 'SubAgent并行',
			cls: 'claude-ai-btn claude-ai-btn-secondary'
		});
		subAgentBtn.onclick = () => this.startSubAgentTask(textarea.value);

		// 回车发送
		textarea.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage(textarea.value);
			}
		});
	}

	/**
	 * 加载历史消息
	 * @private
	 */
	private async loadMessages() {
		const store = this.plugin.getConversationStore();
		const session = store.getCurrentSession();

		if (session) {
			session.messages.forEach(msg => {
				this.appendMessageToUI(msg);
			});
		}
	}

	/**
	 * 发送消息
	 */
	private async sendMessage(content: string) {
		if (!content.trim()) {
			return;
		}

		const client = this.plugin.getApiClient();
		if (!client) {
			this.showErrorMessage('请先配置API Key');
			return;
		}

		// 添加用户消息
		const userMessage: ChatMessage = {
			role: 'user',
			content,
			timestamp: Date.now()
		};

		this.appendMessageToUI(userMessage);

		// 创建助手消息占位符
		const assistantMessage: ChatMessage = {
			role: 'assistant',
			content: '',
			timestamp: Date.now(),
			isStreaming: true
		};

		this.appendMessageToUI(assistantMessage);

		try {
			// 获取历史消息作为上下文
			const store = this.plugin.getConversationStore();
			const session = store.getCurrentSession();

			const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

			if (session) {
				session.messages.forEach(msg => {
					messages.push({
						role: msg.role,
						content: msg.content
					});
				});
			}

			messages.push({ role: 'user', content });

			// 流式调用
			const response = await client.sendMessageStream(messages, {
				onChunk: (chunk) => {
					this.updateLastMessage(chunk);
				}
			});

			// 完成流式传输
			assistantMessage.content = response;
			assistantMessage.isStreaming = false;
			this.updateLastMessage(response, false);

			// 保存到历史
			store.addMessage(userMessage);
			store.addMessage(assistantMessage);
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : '发送失败';
			this.showErrorMessage(errorMsg);
			this.updateLastMessage(`❌ ${errorMsg}`, false);
		}
	}

	/**
	 * 启动新对话
	 * @private
	 */
	private startNewChat() {
		const store = this.plugin.getConversationStore();
		store.createSession();
		this.messageList.empty();
	}

	/**
	 * 打开Skills面板
	 * @private
	 */
	private openSkillsPanel() {
		// TODO: 实现Skills面板
		this.showErrorMessage('Skills面板开发中...');
	}

	/**
	 * 启动SubAgent任务
	 * @private
	 */
	private async startSubAgentTask(taskDescription: string) {
		if (!taskDescription.trim()) {
			return;
		}

		try {
			const executor = this.plugin.getParallelExecutor();
			const result = await executor.decomposeAndExecute(taskDescription);

			// 显示结果
			this.appendMessageToUI({
				role: 'assistant',
				content: this.formatAggregatedResult(result),
				timestamp: Date.now()
			});
		} catch (error) {
			this.showErrorMessage(error instanceof Error ? error.message : 'SubAgent执行失败');
		}
	}

	/**
	 * 格式化聚合结果
	 * @private
	 */
	private formatAggregatedResult(result: any): string {
		return `## SubAgent执行结果

**总计**: ${result.totalTasks}个任务
**成功**: ${result.successfulTasks}个
**失败**: ${result.failedTasks}个
**总耗时**: ${result.totalExecutionTime}ms

---

### 合并结果

${result.mergedContent || '无'}`;
	}

	/**
	 * 添加消息到UI
	 * @private
	 */
	private appendMessageToUI(message: ChatMessage) {
		const messageEl = this.messageList.createDiv('claude-ai-message');
		messageEl.addClass(`claude-ai-message-${message.role}`);

		// 头部
		const header = messageEl.createDiv('claude-ai-message-header');
		header.createEl('span', {
			text: message.role === 'user' ? '你' : 'Claude'
		});

		// 内容
		const content = messageEl.createDiv('claude-ai-message-content');
		content.createEl('p', { text: message.content });

		// 滚动到底部
		this.messageList.scrollTop = this.messageList.scrollHeight;
	}

	/**
	 * 更新最后一条消息
	 * @private
	 */
	private updateLastMessage(content: string, isStreaming: boolean = true) {
		const lastMessage = this.messageList.lastElementChild;
		if (!lastMessage) {
			return;
		}

		const contentEl = lastMessage.querySelector('.claude-ai-message-content');
		if (contentEl) {
			contentEl.empty();
			contentEl.createEl('p', { text: content });
		}

		if (!isStreaming) {
			lastMessage.removeClass('streaming');
		}

		// 滚动到底部
		this.messageList.scrollTop = this.messageList.scrollHeight;
	}

	/**
	 * 显示错误消息
	 * @private
	 */
	private showErrorMessage(message: string) {
		// TODO: 实现更好的错误提示
		console.error('Claude AI错误:', message);
	}
}
