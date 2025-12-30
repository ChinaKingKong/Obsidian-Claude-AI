import { ClaudeAIPlugin } from '../plugin';
import { BaseSkill } from './base-skill';
import { SummarizerSkill } from './predefined/summarizer';
import { TranslatorSkill } from './predefined/translator';
import { CodeAnalyzerSkill } from './predefined/code-analyzer';
import { Skill, SkillContext, SkillResult, CustomSkillConfig } from '../types';

/**
 * Skills管理器
 * 负责管理所有预定义和自定义Skills
 */
export class SkillManager {
	private plugin: ClaudeAIPlugin;
	private skills: Map<string, BaseSkill> = new Map();
	private customSkills: Map<string, Skill> = new Map();

	constructor(plugin: ClaudeAIPlugin) {
		this.plugin = plugin;
	}

	/**
	 * 初始化Skills系统
	 */
	async initialize() {
		// 注册预定义Skills
		this.registerPredefinedSkills();

		// 加载自定义Skills
		await this.loadCustomSkills();
	}

	/**
	 * 注册预定义Skills
	 */
	private registerPredefinedSkills() {
		const predefinedSkills = [
			new SummarizerSkill(this.plugin),
			new TranslatorSkill(this.plugin),
			new CodeAnalyzerSkill(this.plugin)
		];

		predefinedSkills.forEach(skill => {
			this.skills.set(skill.getId(), skill);
		});
	}

	/**
	 * 加载用户自定义Skills
	 */
	async loadCustomSkills() {
		const settings = this.plugin.getSettings();
		const customSkillsConfig = settings.customSkills || [];

		customSkillsConfig.forEach(config => {
			const skill = this.createCustomSkill(config);
			this.customSkills.set(config.id, skill);
		});
	}

	/**
	 * 创建自定义Skill
	 * @private
	 */
	private createCustomSkill(config: CustomSkillConfig): Skill {
		return {
			id: config.id,
			name: config.name,
			description: config.description,
			icon: config.icon,
			category: 'custom',
			execute: async (context: SkillContext): Promise<SkillResult> => {
				try {
					const client = this.plugin.getApiClient();
					if (!client) {
						throw new Error('Claude客户端未初始化');
					}

					// 使用模板构建提示词
					const prompt = this.buildPromptFromTemplate(
						config.promptTemplate,
						context
					);

					// 调用Claude API
					const content = await client.sendMessage([
						{ role: 'user', content: prompt }
					]);

					return {
						success: true,
						content
					};
				} catch (error) {
					return {
						success: false,
						content: '',
						error: error instanceof Error ? error.message : '未知错误'
					};
				}
			}
		};
	}

	/**
	 * 从模板构建提示词
	 * @private
	 */
	private buildPromptFromTemplate(
		template: string,
		context: SkillContext
	): string {
		const { input, selection, metadata } = context;

		let prompt = template;

		// 替换占位符
		prompt = prompt.replace(/\{\{input\}\}/g, input);
		prompt = prompt.replace(/\{\{selection\}\}/g, selection || input);

		// 替换元数据占位符
		if (metadata) {
			Object.keys(metadata).forEach(key => {
				prompt = prompt.replace(
					new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
					String(metadata[key])
				);
			});
		}

		return prompt;
	}

	/**
	 * 执行单个Skill
	 */
	async executeSkill(skillId: string, context: SkillContext): Promise<SkillResult> {
		// 先查找预定义Skills
		const predefinedSkill = this.skills.get(skillId);
		if (predefinedSkill) {
			return await predefinedSkill.execute(context);
		}

		// 再查找自定义Skills
		const customSkill = this.customSkills.get(skillId);
		if (customSkill) {
			return await customSkill.execute(context);
		}

		throw new Error(`未找到Skill: ${skillId}`);
	}

	/**
	 * 并行执行多个Skills
	 */
	async executeParallel(
		skillIds: string[],
		context: SkillContext
	): Promise<SkillResult[]> {
		const promises = skillIds.map(skillId =>
			this.executeSkill(skillId, context)
		);

		return await Promise.all(promises);
	}

	/**
	 * 获取所有可用的Skills
	 */
	getAllSkills(): Skill[] {
		const skills: Skill[] = [];

		// 添加预定义Skills
		this.skills.forEach(skill => {
			skills.push({
				id: skill.getId(),
				name: skill.getName(),
				description: skill.getDescription(),
				icon: skill.getIcon(),
				category: skill.getCategory(),
				execute: (context) => skill.execute(context)
			});
		});

		// 添加自定义Skills
		this.customSkills.forEach(skill => {
			skills.push(skill);
		});

		return skills;
	}

	/**
	 * 获取Skill
	 */
	getSkill(skillId: string): Skill | undefined {
		const predefinedSkill = this.skills.get(skillId);
		if (predefinedSkill) {
			return {
				id: predefinedSkill.getId(),
				name: predefinedSkill.getName(),
				description: predefinedSkill.getDescription(),
				icon: predefinedSkill.getIcon(),
				category: predefinedSkill.getCategory(),
				execute: (context) => predefinedSkill.execute(context)
			};
		}

		return this.customSkills.get(skillId);
	}

	/**
	 * 添加自定义Skill
	 */
	async addCustomSkill(config: CustomSkillConfig) {
		const settings = this.plugin.getSettings();
		settings.customSkills = settings.customSkills || [];
		settings.customSkills.push(config);

		await this.plugin.updateSettings({ customSkills: settings.customSkills });

		// 创建并注册Skill
		const skill = this.createCustomSkill(config);
		this.customSkills.set(config.id, skill);
	}

	/**
	 * 删除自定义Skill
	 */
	async removeCustomSkill(skillId: string) {
		const settings = this.plugin.getSettings();
		settings.customSkills = settings.customSkills.filter(s => s.id !== skillId);

		await this.plugin.updateSettings({ customSkills: settings.customSkills });

		this.customSkills.delete(skillId);
	}
}
