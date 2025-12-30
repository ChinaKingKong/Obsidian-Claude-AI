import { ClaudeAIPlugin } from '../plugin';
import { ConversationSession, ChatMessage } from '../types';

/**
 * 对话历史存储
 */
export class ConversationStore {
	private plugin: ClaudeAIPlugin;
	private sessions: Map<string, ConversationSession> = new Map();
	private currentSessionId: string | null = null;

	constructor(plugin: ClaudeAIPlugin) {
		this.plugin = plugin;
	}

	/**
	 * 创建新会话
	 */
	createSession(title?: string): ConversationSession {
		const sessionId = this.generateId();
		const session: ConversationSession = {
			id: sessionId,
			title: title || `对话 ${this.sessions.size + 1}`,
			messages: [],
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		this.sessions.set(sessionId, session);
		this.currentSessionId = sessionId;

		return session;
	}

	/**
	 * 获取当前会话
	 */
	getCurrentSession(): ConversationSession | null {
		if (!this.currentSessionId) {
			return null;
		}

		return this.sessions.get(this.currentSessionId) || null;
	}

	/**
	 * 获取指定会话
	 */
	getSession(sessionId: string): ConversationSession | null {
		return this.sessions.get(sessionId) || null;
	}

	/**
	 * 获取所有会话
	 */
	getAllSessions(): ConversationSession[] {
		return Array.from(this.sessions.values())
			.sort((a, b) => b.updatedAt - a.updatedAt);
	}

	/**
	 * 删除会话
	 */
	deleteSession(sessionId: string): boolean {
		const deleted = this.sessions.delete(sessionId);

		if (deleted && this.currentSessionId === sessionId) {
			this.currentSessionId = null;
		}

		return deleted;
	}

	/**
	 * 添加消息
	 */
	addMessage(message: ChatMessage, sessionId?: string): void {
		const targetSessionId = sessionId || this.currentSessionId;

		if (!targetSessionId) {
			throw new Error('没有活动会话');
		}

		const session = this.sessions.get(targetSessionId);
		if (!session) {
			throw new Error('会话不存在');
		}

		session.messages.push(message);
		session.updatedAt = Date.now();

		// 自动保存
		this.saveToDisk();
	}

	/**
	 * 更新会话标题
	 */
	updateSessionTitle(sessionId: string, newTitle: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return;
		}

		session.title = newTitle;
		session.updatedAt = Date.now();

		this.saveToDisk();
	}

	/**
	 * 清理所有会话
	 */
	cleanup(): void {
		this.sessions.clear();
		this.currentSessionId = null;
	}

	/**
	 * 从磁盘加载
	 */
	async loadFromDisk(): Promise<void> {
		try {
			const data = await this.plugin.loadData();
			if (data && data.conversations) {
				data.conversations.forEach((session: ConversationSession) => {
					this.sessions.set(session.id, session);
				});

				if (data.currentSessionId) {
					this.currentSessionId = data.currentSessionId;
				}
			}
		} catch (error) {
			console.error('加载对话历史失败:', error);
		}
	}

	/**
	 * 保存到磁盘
	 * @private
	 */
	private async saveToDisk(): Promise<void> {
		try {
			const data = {
				conversations: Array.from(this.sessions.values()),
				currentSessionId: this.currentSessionId
			};

			await this.plugin.saveData(data);
		} catch (error) {
			console.error('保存对话历史失败:', error);
		}
	}

	/**
	 * 生成唯一ID
	 * @private
	 */
	private generateId(): string {
		return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}
}
