import { ClaudeAIPlugin } from '../plugin';
import { SubAgentResult, MergeStrategy } from '../types';

/**
 * 结果合并器
 * 负责合并多个SubAgent的执行结果
 */
export class ResultMerger {
	private plugin: ClaudeAIPlugin;

	constructor(plugin: ClaudeAIPlugin) {
		this.plugin = plugin;
	}

	/**
	 * 合并结果
	 */
	async merge(
		results: SubAgentResult[],
		strategy: MergeStrategy = MergeStrategy.Concatenate
	): Promise<string> {
		switch (strategy) {
			case MergeStrategy.Concatenate:
				return this.concatenate(results);

			case MergeStrategy.SmartSummary:
				return await this.smartSummary(results);

			case MergeStrategy.CustomStructure:
				return this.customStructure(results);

			default:
				return this.concatenate(results);
		}
	}

	/**
	 * 拼接合并
	 * @private
	 */
	private concatenate(results: SubAgentResult[]): string {
		return results
			.map((result, index) => {
				const header = `## 子任务 ${index + 1}: ${result.taskId}`;
				const content = result.success ? result.content : `执行失败: ${result.error}`;
				return `${header}\n\n${content}`;
			})
			.join('\n\n---\n\n');
	}

	/**
	 * 智能摘要
	 * @private
	 */
	private async smartSummary(results: SubAgentResult[]): Promise<string> {
		try {
			const client = this.plugin.getApiClient();
			if (!client) {
				// 降级到简单拼接
				return this.concatenate(results);
			}

			// 构建所有结果的摘要
			const allResults = results
				.map((r, i) => `[任务${i + 1}]: ${r.success ? r.content : `失败: ${r.error}`}`)
				.join('\n\n');

			const systemPrompt = `你是一个专业的结果整合专家。你的任务是将多个子任务的执行结果整合成一个清晰、有条理的综合报告。

整合要求：
1. 提取关键信息和要点
2. 逻辑清晰，层次分明
3. 使用中文输出
4. 如果有任务失败，明确指出`;

			const userPrompt = `请整合以下子任务的执行结果：

\`\`\`
${allResults}
\`\`\`

请生成综合报告：`;

			return await client.sendMessage(
				[
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt }
				]
			);
		} catch (error) {
			console.error('智能摘要失败，降级到简单拼接:', error);
			return this.concatenate(results);
		}
	}

	/**
	 * 自定义结构
	 * @private
	 */
	private customStructure(results: SubAgentResult[]): string {
		const structure = {
			summary: {
				total: results.length,
				successful: results.filter(r => r.success).length,
				failed: results.filter(r => !r.success).length
			},
			results: results.map((r, i) => ({
				id: r.taskId,
				index: i + 1,
				success: r.success,
				content: r.success ? r.content : null,
				error: r.error || null,
				executionTime: r.executionTime
			}))
		};

		return JSON.stringify(structure, null, 2);
	}
}
