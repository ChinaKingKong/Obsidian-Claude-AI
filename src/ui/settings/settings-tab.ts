import { App, PluginSettingTab, Setting } from 'obsidian';
import { ClaudeAIPlugin } from '../../plugin';
import { AIProvider, AI_PROVIDERS, CustomSkillConfig } from '../../types';

/**
 * Claude AI 插件设置面板
 * 支持多种AI服务商配置
 */
export class SettingsTab extends PluginSettingTab {
	private plugin: ClaudeAIPlugin;

	constructor(app: App, plugin: ClaudeAIPlugin) {
		super(app, plugin as any);
		this.plugin = plugin;
	}

	/**
	 * 显示设置面板
	 */
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// 标题
		containerEl.createEl('h2', { text: 'Claude AI Assistant 设置' });

		// AI服务设置
		this.createProviderSettings(containerEl);

		// 模型设置
		this.createModelSettings(containerEl);

		// Skills设置
		this.createSkillsSettings(containerEl);

		// UI设置
		this.createUISettings(containerEl);
	}

	/**
	 * 创建AI服务商设置
	 * @private
	 */
	private createProviderSettings(containerEl: HTMLElement) {
		containerEl.createEl('h3', { text: 'AI服务设置' });

		// 服务商选择
		new Setting(containerEl)
			.setName('AI服务商')
			.setDesc('选择要使用的AI服务提供商')
			.addDropdown(dropdown => {
				// 添加所有服务商选项
				Object.values(AIProvider).forEach(provider => {
					const config = AI_PROVIDERS[provider];
					dropdown.addOption(provider, config.name);
				});

				// 设置当前值
				const currentProvider = this.plugin.getSettings().provider;
				dropdown.setValue(currentProvider);

				// 监听变化
				dropdown.onChange(async (value: AIProvider) => {
					await this.plugin.updateSettings({ provider: value });

					// 刷新设置面板以更新模型列表
					this.display();
				});
			});

		// 当前服务商信息
		const currentProvider = this.plugin.getSettings().provider;
		const providerConfig = AI_PROVIDERS[currentProvider];

		new Setting(containerEl)
			.setName('服务商信息')
			.setDesc(
				`当前选中：${providerConfig.name}\n` +
				`环境变量名：${providerConfig.envKey}\n` +
				`支持模型：${providerConfig.models.join(', ')}`
			);

		// API Key配置
		this.createApiKeySettings(containerEl);
	}

	/**
	 * 创建API Key配置
	 * @private
	 */
	private createApiKeySettings(containerEl: HTMLElement) {
		const settings = this.plugin.getSettings();
		const currentProvider = settings.provider;

		containerEl.createEl('h4', { text: 'API Key配置' });

		// 当前服务商的API Key
		new Setting(containerEl)
			.setName(`${AI_PROVIDERS[currentProvider].name} API Key`)
			.setDesc(`输入你的${AI_PROVIDERS[currentProvider].name} API Key（也可通过环境变量 ${AI_PROVIDERS[currentProvider].envKey} 配置）`)
			.addText(text => text
				.setPlaceholder('输入API Key')
				.setValue(settings.apiKeys[currentProvider] || '')
				.onChange(async (value) => {
					const newApiKeys = { ...settings.apiKeys };
					newApiKeys[currentProvider] = value;
					await this.plugin.updateSettings({ apiKeys: newApiKeys });
				})
			);

		// 其他服务商的API Key配置（折叠显示）
		const otherProvidersContainer = containerEl.createDiv();
		otherProvidersContainer.createEl('details', { cls: 'collapsible' }).innerHTML = `
			<summary>配置其他服务商的API Key（可选）</summary>
			<div style="margin-top: 10px;"></div>
		`;

		const detailsEl = otherProvidersContainer.querySelector('details');
		if (!detailsEl) return;

		const contentEl = detailsEl.querySelector('div');
		if (!contentEl) return;

		// 为每个服务商添加API Key输入框
		Object.values(AIProvider).forEach(provider => {
			if (provider === currentProvider) return;

			const config = AI_PROVIDERS[provider];

			new Setting(contentEl)
				.setName(`${config.name} API Key`)
				.setDesc(`环境变量：${config.envKey}`)
				.addText(text => text
					.setPlaceholder('输入API Key（可选）')
					.setValue(settings.apiKeys[provider] || '')
					.onChange(async (value) => {
						const newApiKeys = { ...settings.apiKeys };
						newApiKeys[provider] = value;
						await this.plugin.updateSettings({ apiKeys: newApiKeys });
					})
				);
		});

		// API来源显示
		new Setting(containerEl)
			.setName('当前API来源')
			.setDesc('显示当前使用的API Key来源')
			.addText(text => text
				.setValue('检测中...')
				.setDisabled(true)
				.then(async () => {
					const authManager = (this.plugin as any).authManager;
					const source = await authManager.getApiKeySource();
					const provider = authManager.getCurrentProvider();
					const envKey = AI_PROVIDERS[provider as AIProvider].envKey;

					text.setValue(
						source === 'env' ? `环境变量 (${envKey})` :
						source === 'settings' ? '设置面板' :
						'未配置'
					);
				})
			);
	}

	/**
	 * 创建模型设置
	 * @private
	 */
	private createModelSettings(containerEl: HTMLElement) {
		containerEl.createEl('h3', { text: '模型设置' });

		const settings = this.plugin.getSettings();
		const currentProvider = settings.provider;
		const providerConfig = AI_PROVIDERS[currentProvider];

		// 模型选择
		new Setting(containerEl)
			.setName('模型')
			.setDesc('选择AI模型')
			.addDropdown(dropdown => {
				// 添加当前服务商支持的模型
				providerConfig.models.forEach(model => {
					dropdown.addOption(model, model);
				});

				// 设置当前值
				dropdown.setValue(settings.model);

				// 监听变化
				dropdown.onChange(async (value) => {
					await this.plugin.updateSettings({ model: value });
				});
			});

		// 最大Tokens
		new Setting(containerEl)
			.setName('最大Tokens')
			.setDesc('单次请求的最大token数')
			.addText(text => text
				.setPlaceholder('4096')
				.setValue(String(settings.maxTokens))
				.onChange(async (value) => {
					const num = parseInt(value);
					if (!isNaN(num)) {
						await this.plugin.updateSettings({ maxTokens: num });
					}
				})
			);

		// 温度
		new Setting(containerEl)
			.setName('温度')
			.setDesc('控制输出的随机性（0-1）')
			.addSlider(slider => slider
				.setLimits(0, 1, 0.1)
				.setValue(settings.temperature)
				.setDynamicTooltip()
				.onChange(async (value) => {
					await this.plugin.updateSettings({ temperature: value });
				})
			);

		// 流式输出
		new Setting(containerEl)
			.setName('启用流式输出')
			.setDesc('实时显示AI的响应')
			.addToggle(toggle => toggle
				.setValue(settings.enableStreaming)
				.onChange(async (value) => {
					await this.plugin.updateSettings({ enableStreaming: value });
				})
			);
	}

	/**
	 * 创建Skills设置
	 * @private
	 */
	private createSkillsSettings(containerEl: HTMLElement) {
		containerEl.createEl('h3', { text: 'Skills设置' });

		const skillManager = this.plugin.getSkillManager();
		const predefinedSkills = skillManager.getAllSkills()
			.filter(s => s.category === 'predefined');

		// 预定义Skills列表
		new Setting(containerEl)
			.setName('预定义Skills')
			.setDesc('可用的预定义Skills')
			.then(setting => {
				predefinedSkills.forEach(skill => {
					setting.descEl.createEl('div', {
						text: `${skill.icon || ''} ${skill.name}: ${skill.description}`,
						cls: 'claude-ai-skill-item'
					});
				});
			});

		// 自定义Skills管理
		new Setting(containerEl)
			.setName('自定义Skills')
			.setDesc('管理你的自定义Skills')
			.addButton(button => button
				.setButtonText('添加自定义Skill')
				.onClick(() => {
					this.showAddSkillDialog();
				})
			);

		// 显示已添加的自定义Skills
		const customSkills = skillManager.getAllSkills()
			.filter(s => s.category === 'custom');

		if (customSkills.length > 0) {
			new Setting(containerEl)
				.setName('已添加的自定义Skills')
				.then(setting => {
					customSkills.forEach(skill => {
						const skillEl = setting.descEl.createEl('div', {
							cls: 'claude-ai-custom-skill-item'
						});

						skillEl.createEl('strong', { text: skill.name });
						skillEl.createEl('p', { text: skill.description });

						const deleteBtn = skillEl.createEl('button', {
							text: '删除',
							cls: 'claude-ai-btn-delete'
						});
						deleteBtn.onclick = async () => {
							await skillManager.removeCustomSkill(skill.id);
							this.display(); // 刷新设置面板
						};
					});
				});
		}
	}

	/**
	 * 创建UI设置
	 * @private
	 */
	private createUISettings(containerEl: HTMLElement) {
		containerEl.createEl('h3', { text: '界面设置' });

		const settings = this.plugin.getSettings();

		new Setting(containerEl)
			.setName('侧边栏宽度')
			.setDesc('设置侧边栏的宽度（像素）')
			.addText(text => text
				.setPlaceholder('400')
				.setValue(String(settings.sidebarWidth))
				.onChange(async (value) => {
					const num = parseInt(value);
					if (!isNaN(num)) {
						await this.plugin.updateSettings({ sidebarWidth: num });
					}
				})
			);
	}

	/**
	 * 显示添加Skill对话框
	 * @private
	 */
	private showAddSkillDialog() {
		// TODO: 实现添加Skill对话框
		// 临时实现：使用prompt
		const name = prompt('Skill名称：');
		if (!name) return;

		const description = prompt('Skill描述：');
		if (!description) return;

		const promptTemplate = prompt('提示词模板（使用{{input}}表示输入）：');
		if (!promptTemplate) return;

		const skillConfig: CustomSkillConfig = {
			id: `custom-${Date.now()}`,
			name,
			description,
			promptTemplate
		};

		const skillManager = this.plugin.getSkillManager();
		skillManager.addCustomSkill(skillConfig);

		// 刷新设置面板
		this.display();
	}
}
