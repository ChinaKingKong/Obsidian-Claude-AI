import { App, PluginManifest, WorkspaceLeaf } from 'obsidian';
import { AuthManager } from './api/auth/auth-manager';
import { ClaudeClient } from './api/claude/client';
import { UniversalAIClient } from './api/claude/universal-client';
import { SkillManager } from './skills/skill-manager';
import { ParallelExecutor } from './subagent/parallel-executor';
import { SettingsTab } from './ui/settings/settings-tab';
import { ConversationStore } from './storage/conversation-store';
import { DEFAULT_SETTINGS, ClaudeAIPluginSettings, AIProvider } from './types';

/**
 * Claude AI 插件核心类
 * 负责协调所有模块的初始化和交互
 */
export class ClaudeAIPlugin {
	private authManager: AuthManager;
	private claudeClient: ClaudeClient | null = null;
	private universalClient: UniversalAIClient | null = null;
	private skillManager: SkillManager;
	private parallelExecutor: ParallelExecutor;
	private conversationStore: ConversationStore;
	private settings: ClaudeAIPluginSettings;
	private settingsTab: SettingsTab | null = null;
	private loadDataFn?: () => Promise<any>;
	private saveDataFn?: (data: any) => Promise<void>;
	private addSettingTabFn?: (tab: SettingsTab) => void;
	private addRibbonIconFn?: (iconId: string, iconTitle: string, callback: () => void) => HTMLElement;
	private cachedData: any = {}; // 缓存完整数据（settings + conversations）

	constructor(
		private app: App,
		private manifest: PluginManifest,
		loadDataFn?: () => Promise<any>,
		saveDataFn?: (data: any) => Promise<void>,
		addSettingTabFn?: (tab: SettingsTab) => void,
		addRibbonIconFn?: (iconId: string, iconTitle: string, callback: () => void) => HTMLElement
	) {
		// 初始化设置
		this.settings = { ...DEFAULT_SETTINGS };
		this.loadDataFn = loadDataFn;
		this.saveDataFn = saveDataFn;
		this.addSettingTabFn = addSettingTabFn;
		this.addRibbonIconFn = addRibbonIconFn;

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

		// 尝试初始化通用AI客户端（如果API Key存在）
		try {
			const apiKey = await this.authManager.getApiKey();
			if (apiKey) {
				this.universalClient = new UniversalAIClient(
					apiKey,
					this.settings.provider,
					this.settings.model
				);
				console.log(`✅ AI客户端初始化成功 (提供商: ${this.settings.provider}, 模型: ${this.settings.model})`);
			} else {
				console.log('⚠️ 未检测到API Key，请先在设置中配置');
				this.universalClient = null;
			}
		} catch (error) {
			// API Key不存在是正常情况，不需要抛出错误
			console.log('⚠️ 未配置API Key，插件将在配置后启用AI功能');
			this.universalClient = null;
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
	 * 注意：视图注册已在 main.ts 中完成，此方法保留为占位符
	 */
	private registerSidebarView() {
		// 视图已在 main.ts 中注册
		console.log('✅ 视图已在main.ts中注册');
	}

	/**
	 * 添加Ribbon图标
	 */
	private addRibbonIcon() {
		// 使用 addRibbonIcon 方法
		if (this.addRibbonIconFn) {
			try {
				const ribbonIconEl = this.addRibbonIconFn(
					'claude-ai-icon',
					'打开Claude AI助手',
					() => this.openSidebar()
				);

				if (ribbonIconEl) {
					ribbonIconEl.addClass('claude-ai-ribbon-icon');
					console.log('✅ Ribbon图标添加成功');
				}
			} catch (error) {
				console.error('❌ Ribbon图标添加失败:', error);
			}
		} else {
			console.log('⚠️ addRibbonIconFn 未提供');
		}
	}

	// ==================== 公共方法 ====================

	/**
	 * 打开侧边栏（右侧）
	 */
	async openSidebar() {
		const { workspace } = this.app;

		console.log('🔍 正在打开Claude AI侧边栏...');
		console.log('🔍 workspace 对象:', workspace);

		// 尝试找到已存在的右侧侧边栏叶子
		let leaf = workspace.getRightLeaf(false);
		console.log('🔍 getRightLeaf(false) 结果:', leaf);

		if (!leaf) {
			// 如果没有已存在的，创建新的右侧侧边栏
			console.log('⚠️ 没有已存在的侧边栏，创建新的...');
			leaf = workspace.getRightLeaf(true);
			console.log('🔍 getRightLeaf(true) 结果:', leaf);
		}

		if (leaf) {
			console.log('✅ 侧边栏叶子已获取，准备设置视图状态...');
			try {
				const viewState = {
					type: 'claude-ai-chat',
					active: true,
				};
				console.log('🔍 视图状态:', viewState);

				await leaf.setViewState(viewState);
				console.log('✅ 视图状态已设置');

				workspace.revealLeaf(leaf);
				console.log('✅ 侧边栏已显示');
			} catch (error) {
				console.error('❌ 打开侧边栏失败:', error);
				console.error('❌ 错误堆栈:', error instanceof Error ? error.stack : 'No stack');
			}
		} else {
			console.error('❌ 无法获取右侧侧边栏叶子');
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

	getApiClient(): UniversalAIClient | ClaudeClient | null {
		// 优先返回通用客户端
		if (this.universalClient) {
			return this.universalClient;
		}
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
			const savedData = await this.loadDataFn();
			if (savedData) {
				// 缓存完整数据
				this.cachedData = savedData;

				// 提取settings部分
				if (savedData.settings) {
					this.settings = { ...DEFAULT_SETTINGS, ...savedData.settings };
				} else {
					// 兼容旧格式（直接是settings对象）
					this.settings = { ...DEFAULT_SETTINGS, ...savedData };
					this.cachedData = { settings: this.settings };
				}
			}
		}
	}

	/**
	 * 保存设置（同时保存settings和conversations）
	 */
	async saveSettings() {
		if (this.saveDataFn) {
			// 更新cachedData中的settings部分
			this.cachedData.settings = this.settings;
			// 保存完整数据
			await this.saveDataFn(this.cachedData);
		}
	}

	/**
	 * 加载数据（返回缓存的完整数据）
	 */
	async loadData(): Promise<any> {
		return this.cachedData;
	}

	/**
	 * 保存数据（更新conversations部分并保存完整数据）
	 */
	async saveData(data: any): Promise<void> {
		if (this.saveDataFn) {
			// 更新cachedData中的conversations部分
			this.cachedData = { ...this.cachedData, ...data };
			// 保存完整数据
			await this.saveDataFn(this.cachedData);
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
					this.universalClient = new UniversalAIClient(
						apiKey,
						this.settings.provider,
						this.settings.model
					);
					console.log(`✅ AI客户端已更新 (提供商: ${this.settings.provider}, 模型: ${this.settings.model})`);
				} else {
					this.universalClient = null;
				}
			} catch (error) {
				// 如果API Key不存在，清空客户端
				this.universalClient = null;
			}
		}
	}
}
