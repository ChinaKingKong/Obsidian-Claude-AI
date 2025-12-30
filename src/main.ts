import { Plugin } from 'obsidian';
import { ClaudeAIPlugin } from './plugin';
import { ChatView } from './ui/sidebar/chat-view';

/**
 * Obsidian Claude AI 插件入口
 * 这个文件是插件的入口点，Obsidian会从这里加载插件
 */
class ClaudeAIPluginWrapper extends Plugin {
	private plugin: ClaudeAIPlugin | null = null;

	/**
	 * 插件加载时调用
	 * 初始化插件核心功能
	 */
	async onload() {
		console.log('🚀 ClaudeAIPluginWrapper 开始加载...');

		// 先创建 plugin 实例
		console.log('🔍 创建 ClaudeAIPlugin 实例...');
		this.plugin = new ClaudeAIPlugin(
			this.app,
			this.manifest,
			() => this.loadData(),
			(data: any) => this.saveData(data),
			(tab) => this.addSettingTab(tab),
			(iconId: string, iconTitle: string, callback: () => void) => this.addRibbonIcon(iconId, iconTitle, callback)
		);
		console.log('✅ ClaudeAIPlugin 实例已创建');

		// 注册视图类型 - 使用包装函数避免初始化顺序问题
		console.log('🔍 注册视图类型...');
		this.registerView('claude-ai-chat', (leaf) => {
			return new ChatView(leaf, this.plugin!);
		});
		console.log('✅ 视图类型已注册');

		// 加载插件
		console.log('🔍 加载插件...');
		await this.plugin.onload();
		console.log('✅ 插件加载完成');

		// 注册插件的所有命令和功能
		console.log('🔍 准备注册命令...');
		this.registerCommands();
		console.log('🎉 ClaudeAIPluginWrapper 加载完成');
	}

	/**
	 * 插件卸载时调用
	 * 清理资源
	 */
	onunload() {
		if (this.plugin) {
			this.plugin.onunload();
		}
	}

	/**
	 * 注册插件命令
	 */
	private registerCommands() {
		console.log('🔍 开始注册命令...');

		try {
			// 打开Claude AI侧边栏
			this.addCommand({
				id: 'open-claude-ai-sidebar',
				name: '打开Claude AI助手',
				callback: () => {
					console.log('🔍 命令被触发: 打开Claude AI助手');
					this.plugin?.openSidebar();
				}
			});
			console.log('✅ 命令已注册: open-claude-ai-sidebar');

			// 快速唤起Skills面板
			this.addCommand({
				id: 'open-skills-panel',
				name: '打开Skills面板',
				callback: () => {
					console.log('🔍 命令被触发: 打开Skills面板');
					this.plugin?.openSkillsPanel();
				}
			});
			console.log('✅ 命令已注册: open-skills-panel');

			// 对选中文本执行Skill
			this.addCommand({
				id: 'execute-skill-on-selection',
				name: '对选中文本执行Skill',
				checkCallback: (checking: boolean) => {
					const selection = this.getSelection();

					if (!selection) {
						return false;
					}

					if (!checking) {
						console.log('🔍 命令被触发: 对选中文本执行Skill');
						this.plugin?.executeSkillOnSelection(selection);
					}

					return true;
				}
			});
			console.log('✅ 命令已注册: execute-skill-on-selection');

			// 启动SubAgent并行任务
			this.addCommand({
				id: 'start-subagent-task',
				name: '启动SubAgent并行任务',
				callback: () => {
					console.log('🔍 命令被触发: 启动SubAgent并行任务');
					this.plugin?.startSubAgentTask();
				}
			});
			console.log('✅ 命令已注册: start-subagent-task');

			console.log('✅ 所有命令注册完成');
		} catch (error) {
			console.error('❌ 命令注册失败:', error);
			console.error('❌ 错误堆栈:', error instanceof Error ? error.stack : 'No stack');
		}
	}

	/**
	 * 获取当前编辑器的选中文本
	 */
	private getSelection(): string | null {
		const activeView = this.app.workspace.activeLeaf?.view;
		if (!activeView) return null;

		// 尝试获取选中文本
		if ('editor' in activeView) {
			const editor = (activeView as any).editor;
			if (editor && typeof editor.getSelection === 'function') {
				const selection = editor.getSelection();
				return selection || null;
			}
		}

		return null;
	}
}

// CommonJS导出
export default ClaudeAIPluginWrapper;
