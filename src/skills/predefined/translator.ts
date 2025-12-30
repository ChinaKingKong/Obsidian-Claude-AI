import { BaseSkill } from '../base-skill';
import { ClaudeAIPlugin } from '../../plugin';
import { SkillContext, SkillResult } from '../../types';

/**
 * 翻译Skill
 * 将文本翻译成英文
 */
export class TranslatorSkill extends BaseSkill {
	getId(): string {
		return 'translate';
	}

	getName(): string {
		return '翻译成英文';
	}

	getDescription(): string {
		return '将选中文本翻译成英文';
	}

	getIcon(): string {
		return '🌐';
	}

	async execute(context: SkillContext): Promise<SkillResult> {
		try {
			const systemPrompt = `你是一个专业的翻译助手。你的任务是将用户提供的文本翻译成英文。

翻译要求：
1. 准确传达原文含义
2. 使用自然流畅的英文表达
3. 保持专业术语的准确性
4. 如果是代码或技术文档，保持格式不变`;

			const userPrompt = `请将以下文本翻译成英文：

\`\`\`
${context.input}
\`\`\`

翻译：`;

			const content = await this.callClaude(userPrompt, systemPrompt);

			return {
				success: true,
				content
			};
		} catch (error) {
			return {
				success: false,
				content: '',
				error: error instanceof Error ? error.message : '翻译失败'
			};
		}
	}
}
