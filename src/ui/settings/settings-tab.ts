import { App, PluginSettingTab, Setting } from 'obsidian';
import { ClaudeAIPlugin } from '../../plugin';
import { AIProvider, AI_PROVIDERS, CustomSkillConfig } from '../../types';
import { setLanguage, getLanguage, Language, t } from '../../i18n/i18n';

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
		containerEl.createEl('h2', { text: t('settings.title') });

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
		containerEl.createEl('h3', { text: t('settings.aiService') });

		// 服务商选择
		new Setting(containerEl)
			.setName(t('settings.aiService'))
			.setDesc(t('settings.aiServiceDesc'))
			.addDropdown(dropdown => {
				// 添加所有服务商选项
				Object.values(AIProvider).forEach(provider => {
					const config = AI_PROVIDERS[provider];
					dropdown.addOption(provider, t(`providers.${provider}` as any));
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
			.setName(t('settings.providerInfo'))
			.setDesc(
				`${t('settings.fromEnv')}: ${providerConfig.envKey}\n` +
				`Models: ${providerConfig.models.join(', ')}`
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

		containerEl.createEl('h4', { text: t('settings.apiKeyConfig') });

		// 当前服务商的API Key
		new Setting(containerEl)
			.setName(`${t(`providers.${currentProvider}` as any)} API Key`)
			.setDesc(
				t('settings.enterYourProviderApiKey')
					.replace('{provider}', t(`providers.${currentProvider}` as any))
					.replace('{envKey}', AI_PROVIDERS[currentProvider].envKey)
			)
			.addText(text => text
				.setPlaceholder(t('settings.enterApiKey'))
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
			<summary>${t('settings.otherProviders')}</summary>
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
				.setName(`${t(`providers.${provider}` as any)} API Key`)
				.setDesc(`${t('settings.fromEnv')}: ${config.envKey}`)
				.addText(text => text
					.setPlaceholder(t('settings.enterApiKeyOptional'))
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
			.setName(t('settings.currentApiSource'))
			.setDesc(t('settings.currentApiSourceDesc'))
			.addText(text => text
				.setValue(t('settings.checking'))
				.setDisabled(true)
				.then(async () => {
					const authManager = (this.plugin as any).authManager;
					const source = await authManager.getApiKeySource();
					const provider = authManager.getCurrentProvider();
					const envKey = AI_PROVIDERS[provider as AIProvider].envKey;

					text.setValue(
						source === 'env' ? `${t('settings.fromEnv')} (${envKey})` :
						source === 'settings' ? t('settings.fromSettings') :
						t('settings.notConfigured')
					);
				})
			);
	}

	/**
	 * 创建模型设置
	 * @private
	 */
	private createModelSettings(containerEl: HTMLElement) {
		containerEl.createEl('h3', { text: t('settings.model') });

		const settings = this.plugin.getSettings();
		const currentProvider = settings.provider;
		const providerConfig = AI_PROVIDERS[currentProvider];

		// 模型选择
		new Setting(containerEl)
			.setName(t('settings.model'))
			.setDesc(t('settings.modelDesc'))
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
			.setName(t('settings.maxTokens'))
			.setDesc(t('settings.maxTokensDesc'))
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
			.setName(t('settings.temperature'))
			.setDesc(t('settings.temperatureDesc'))
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
			.setName(t('settings.enableStreaming'))
			.setDesc(t('settings.enableStreamingDesc'))
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
		containerEl.createEl('h3', { text: t('settings.skillsSettings') });

		const skillManager = this.plugin.getSkillManager();
		const predefinedSkills = skillManager.getAllSkills()
			.filter(s => s.category === 'predefined');

		// 预定义Skills列表
		new Setting(containerEl)
			.setName(t('settings.predefinedSkills'))
			.setDesc(t('settings.predefinedSkillsDesc'))
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
			.setName(t('settings.customSkills'))
			.setDesc(t('settings.customSkillsDesc'))
			.addButton(button => button
				.setButtonText(t('settings.addCustomSkill'))
				.onClick(() => {
					this.showAddSkillDialog();
				})
			);

		// 显示已添加的自定义Skills
		const customSkills = skillManager.getAllSkills()
			.filter(s => s.category === 'custom');

		if (customSkills.length > 0) {
			new Setting(containerEl)
				.setName(t('settings.addedCustomSkills'))
				.then(setting => {
					customSkills.forEach(skill => {
						const skillEl = setting.descEl.createEl('div', {
							cls: 'claude-ai-custom-skill-item'
						});

						skillEl.createEl('strong', { text: skill.name });
						skillEl.createEl('p', { text: skill.description });

						const deleteBtn = skillEl.createEl('button', {
							text: t('settings.delete'),
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
		containerEl.createEl('h3', { text: t('settings.uiSettings') });

		const settings = this.plugin.getSettings();

		// 语言设置
		new Setting(containerEl)
			.setName(t('settings.language'))
			.setDesc(t('settings.languageDesc'))
			.addDropdown(dropdown => {
				dropdown.addOption('zh-CN', '简体中文');
				dropdown.addOption('en-US', 'English');

				dropdown.setValue(settings.language);

				dropdown.onChange(async (value: Language) => {
					await this.plugin.updateSettings({ language: value });
					setLanguage(value);

					// 刷新设置面板以更新语言
					this.display();
				});
			});

		new Setting(containerEl)
			.setName(t('settings.sidebarWidth'))
			.setDesc(t('settings.sidebarWidthDesc'))
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
		const name = prompt(t('settings.skillName'));
		if (!name) return;

		const description = prompt(t('settings.skillDescription'));
		if (!description) return;

		const promptTemplate = prompt(t('settings.promptTemplate'));
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
