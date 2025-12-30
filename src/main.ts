import { Plugin } from 'obsidian';
import { ClaudeAIPlugin } from './plugin';

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
		this.plugin = new ClaudeAIPlugin(
			this.app,
			this.manifest,
			() => this.loadData(),
			(data: any) => this.saveData(data),
			(tab) => this.addSettingTab(tab)
		);
		await this.plugin.onload();

		// 注册插件的所有命令和功能
		this.registerCommands();
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
		// 打开Claude AI侧边栏
		this.addCommand({
			id: 'open-claude-ai-sidebar',
			name: '打开Claude AI助手',
			callback: () => {
				this.plugin?.openSidebar();
			}
		});

		// 快速唤起Skills面板
		this.addCommand({
			id: 'open-skills-panel',
			name: '打开Skills面板',
			callback: () => {
				this.plugin?.openSkillsPanel();
			}
		});

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
					this.plugin?.executeSkillOnSelection(selection);
				}

				return true;
			}
		});

		// 启动SubAgent并行任务
		this.addCommand({
			id: 'start-subagent-task',
			name: '启动SubAgent并行任务',
			callback: () => {
				this.plugin?.startSubAgentTask();
			}
		});
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
