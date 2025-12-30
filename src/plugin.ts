import { App, PluginManifest, WorkspaceLeaf } from 'obsidian';
import { AuthManager } from './api/auth/auth-manager';
import { ClaudeClient } from './api/claude/client';
import { SkillManager } from './skills/skill-manager';
import { ParallelExecutor } from './subagent/parallel-executor';
import { ChatView } from './ui/sidebar/chat-view';
import { SettingsTab } from './ui/settings/settings-tab';
import { ConversationStore } from './storage/conversation-store';
import { DEFAULT_SETTINGS, ClaudeAIPluginSettings } from './types';

/**
 * Claude AI 插件核心类
 * 负责协调所有模块的初始化和交互
 */
export class ClaudeAIPlugin {
	private authManager: AuthManager;
	private claudeClient: ClaudeClient | null = null;
	private skillManager: SkillManager;
	private parallelExecutor: ParallelExecutor;
	private conversationStore: ConversationStore;
	private settings: ClaudeAIPluginSettings;
	private settingsTab: SettingsTab | null = null;
	private loadDataFn?: () => Promise<any>;
	private saveDataFn?: (data: any) => Promise<void>;
	private addSettingTabFn?: (tab: SettingsTab) => void;

	constructor(
		private app: App,
		private manifest: PluginManifest,
		loadDataFn?: () => Promise<any>,
		saveDataFn?: (data: any) => Promise<void>,
		addSettingTabFn?: (tab: SettingsTab) => void
	) {
		// 初始化设置
		this.settings = { ...DEFAULT_SETTINGS };
		this.loadDataFn = loadDataFn;
		this.saveDataFn = saveDataFn;
		this.addSettingTabFn = addSettingTabFn;

		// 初始化各个管理器
		this.authManager = new AuthManager(this);
		this.skillManager = new SkillManager(this);
		this.parallelExecutor = new ParallelExecutor(this);
		this.conversationStore = new ConversationStore(this);
	}

	/**
	 * 插件加载
	 */
	async onload() {
		console.log('加载Claude AI插件');

		// 加载插件设置
		await this.loadSettings();

		// 初始化Claude客户端
		const apiKey = await this.authManager.getApiKey();
		if (apiKey) {
			this.claudeClient = new ClaudeClient(apiKey, this.settings.model);
		}

		// 初始化Skills
		await this.skillManager.initialize();

		// 注册侧边栏视图类型
		this.registerSidebarView();

		// 注册设置面板
		this.settingsTab = new SettingsTab(this.app, this as any);
		if (this.addSettingTabFn) {
			this.addSettingTabFn(this.settingsTab);
		}

		// 添加Ribbon图标
		this.addRibbonIcon();
	}

	/**
	 * 插件卸载
	 */
	onunload() {
		console.log('卸载Claude AI插件');
		this.conversationStore.cleanup();
	}

	/**
	 * 注册侧边栏视图
	 */
	private registerSidebarView() {
		// 注册侧边栏视图类型
		if (typeof (this.app.workspace as any).registerView === 'function') {
			(this.app.workspace as any).registerView('claude-ai-chat', (leaf: WorkspaceLeaf) => {
				return new ChatView(leaf, this);
			});
		}
	}

	/**
	 * 添加Ribbon图标
	 */
	private addRibbonIcon() {
		// 使用 addRibbonIcon 方法（如果可用）
		if (typeof (this.app.workspace as any).addRibbonIcon === 'function') {
			const ribbonIconEl = (this.app.workspace as any).addRibbonIcon(
				'claude-ai-icon',
				'打开Claude AI助手',
				() => this.openSidebar()
			);

			if (ribbonIconEl && typeof ribbonIconEl.addClass === 'function') {
				ribbonIconEl.addClass('claude-ai-ribbon-icon');
			}
		}
	}

	// ==================== 公共方法 ====================

	/**
	 * 打开侧边栏
	 */
	async openSidebar() {
		const { workspace } = this.app;

		// 尝试找到已存在的侧边栏叶子
		let leaf = workspace.getLeftLeaf(false);

		if (!leaf) {
			leaf = workspace.getLeftLeaf(true);
		}

		if (leaf) {
			await leaf.setViewState({
				type: 'claude-ai-chat',
				active: true,
			});
			workspace.revealLeaf(leaf);
		}
	}

	/**
	 * 打开Skills面板
	 */
	async openSkillsPanel() {
		// 打开侧边栏并切换到Skills标签
		await this.openSidebar();
		// TODO: 实现Skills面板UI
	}

	/**
	 * 对选中文本执行Skill
	 */
	async executeSkillOnSelection(selection: string) {
		if (!this.claudeClient) {
			throw new Error('Claude客户端未初始化，请先配置API Key');
		}

		// TODO: 显示Skill选择对话框
		// 这里先使用默认的摘要Skill
		const result = await this.skillManager.executeSkill('summarize', {
			input: selection,
			selection
		});

		return result;
	}

	/**
	 * 启动SubAgent并行任务
	 */
	async startSubAgentTask() {
		if (!this.claudeClient) {
			throw new Error('Claude客户端未初始化，请先配置API Key');
		}

		// TODO: 显示SubAgent任务配置对话框
		// 这里需要用户输入任务描述
		console.log('SubAgent并行任务功能开发中...');
	}

	// ==================== Getter 方法 ====================

	getApiClient(): ClaudeClient | null {
		return this.claudeClient;
	}

	getSkillManager(): SkillManager {
		return this.skillManager;
	}

	getParallelExecutor(): ParallelExecutor {
		return this.parallelExecutor;
	}

	getConversationStore(): ConversationStore {
		return this.conversationStore;
	}

	getSettings(): ClaudeAIPluginSettings {
		return this.settings;
	}

	getManifest(): PluginManifest {
		return this.manifest;
	}

	// ==================== 设置管理 ====================

	/**
	 * 加载设置
	 */
	async loadSettings() {
		if (this.loadDataFn) {
			const savedSettings = await this.loadDataFn();
			if (savedSettings) {
				this.settings = { ...DEFAULT_SETTINGS, ...savedSettings };
			}
		}
	}

	/**
	 * 保存设置
	 */
	async saveSettings() {
		if (this.saveDataFn) {
			await this.saveDataFn(this.settings);
		}
	}

	/**
	 * 加载数据（委托给 wrapper）
	 */
	async loadData(): Promise<any> {
		if (this.loadDataFn) {
			return await this.loadDataFn();
		}
		return null;
	}

	/**
	 * 保存数据（委托给 wrapper）
	 */
	async saveData(data: any): Promise<void> {
		if (this.saveDataFn) {
			await this.saveDataFn(data);
		}
	}

	/**
	 * 更新设置
	 */
	async updateSettings(newSettings: Partial<ClaudeAIPluginSettings>) {
		this.settings = { ...this.settings, ...newSettings };
		await this.saveSettings();

		// 如果API Key、provider或模型改变，重新初始化客户端
		if (newSettings.apiKeys || newSettings.provider || newSettings.model) {
			try {
				const apiKey = await this.authManager.getApiKey();
				if (apiKey) {
					this.claudeClient = new ClaudeClient(apiKey, this.settings.model);
				}
			} catch (error) {
				// 如果API Key不存在，清空客户端
				this.claudeClient = null;
			}
		}
	}
}
