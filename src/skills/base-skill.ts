import { ClaudeAIPlugin } from '../plugin';
import { SkillContext, SkillResult } from '../types';

/**
 * Skill基类
 * 所有自定义Skill都应继承此类
 */
export abstract class BaseSkill {
	protected plugin: ClaudeAIPlugin;

	constructor(plugin: ClaudeAIPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Skill的唯一标识符
	 */
	abstract getId(): string;

	/**
	 * Skill的显示名称
	 */
	abstract getName(): string;

	/**
	 * Skill的描述
	 */
	abstract getDescription(): string;

	/**
	 * Skill的图标（可选）
	 */
	getIcon(): string | undefined {
		return undefined;
	}

	/**
	 * Skill的类别
	 */
	getCategory(): 'predefined' | 'custom' {
		return 'predefined';
	}

	/**
	 * 执行Skill
	 * 子类必须实现此方法
	 */
	abstract execute(context: SkillContext): Promise<SkillResult>;

	/**
	 * 构建Claude提示词（辅助方法）
	 */
	protected buildPrompt(userTemplate: string, context: SkillContext): string {
		const { input, selection, metadata } = context;

		let prompt = userTemplate;

		// 替换占位符
		prompt = prompt.replace('{{input}}', input);
		prompt = prompt.replace('{{selection}}', selection || input);

		// 替换元数据占位符
		if (metadata) {
			Object.keys(metadata).forEach(key => {
				prompt = prompt.replace(`{{${key}}}`, String(metadata[key]));
			});
		}

		return prompt;
	}

	/**
	 * 执行Claude API调用（辅助方法）
	 */
	protected async callClaude(
		prompt: string,
		systemPrompt?: string
	): Promise<string> {
		const client = this.plugin.getApiClient();
		if (!client) {
			throw new Error('Claude客户端未初始化');
		}

		const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

		if (systemPrompt) {
			messages.push({ role: 'system', content: systemPrompt });
		}

		messages.push({ role: 'user', content: prompt });

		return await client.sendMessage(messages);
	}
}
