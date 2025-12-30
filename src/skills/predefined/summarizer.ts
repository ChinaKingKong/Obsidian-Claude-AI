import { BaseSkill } from '../base-skill';
import { ClaudeAIPlugin } from '../../plugin';
import { SkillContext, SkillResult } from '../../types';

/**
 * 摘要生成Skill
 * 自动生成文本摘要
 */
export class SummarizerSkill extends BaseSkill {
	getId(): string {
		return 'summarize';
	}

	getName(): string {
		return '生成摘要';
	}

	getDescription(): string {
		return '为选中文本生成简洁的摘要';
	}

	getIcon(): string {
		return '📝';
	}

	async execute(context: SkillContext): Promise<SkillResult> {
		try {
			const systemPrompt = `你是一个专业的文本摘要助手。你的任务是为用户提供的文本生成简洁、准确的摘要。

摘要要求：
1. 简洁明了，保留核心信息
2. 使用中文输出
3. 摘要长度不超过原文的30%
4. 突出关键要点`;

			const userPrompt = `请为以下文本生成摘要：

\`\`\`
${context.input}
\`\`\`

摘要：`;

			const content = await this.callClaude(userPrompt, systemPrompt);

			return {
				success: true,
				content
			};
		} catch (error) {
			return {
				success: false,
				content: '',
				error: error instanceof Error ? error.message : '生成摘要失败'
			};
		}
	}
}
