import { BaseSkill } from '../base-skill';
import { ClaudeAIPlugin } from '../../plugin';
import { SkillContext, SkillResult } from '../../types';

/**
 * 代码分析Skill
 * 分析代码并提供改进建议
 */
export class CodeAnalyzerSkill extends BaseSkill {
	getId(): string {
		return 'code-analyze';
	}

	getName(): string {
		return '代码分析';
	}

	getDescription(): string {
		return '分析代码质量、找出问题并提供改进建议';
	}

	getIcon(): string {
		return '🔍';
	}

	async execute(context: SkillContext): Promise<SkillResult> {
		try {
			const systemPrompt = `你是一个专业的代码审查专家。你的任务是分析用户提供的代码，并提供详细的改进建议。

分析内容应包括：
1. 代码质量评估
2. 潜在的bug或问题
3. 性能优化建议
4. 代码可读性改进建议
5. 最佳实践建议

请使用中文回答，格式清晰。`;

			const userPrompt = `请分析以下代码：

\`\`\`
${context.input}
\`\`\`

请提供详细的分析和改进建议：`;

			const content = await this.callClaude(userPrompt, systemPrompt);

			return {
				success: true,
				content
			};
		} catch (error) {
			return {
				success: false,
				content: '',
				error: error instanceof Error ? error.message : '代码分析失败'
			};
		}
	}
}
