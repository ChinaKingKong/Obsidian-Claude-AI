import { ClaudeAIPlugin } from '../plugin';
import { SubAgentTask, DecompositionConstraints } from '../types';
import { DependencyGraph } from './types';

/**
 * 任务分解器
 * 使用Claude AI智能分解复杂任务
 */
export class TaskDecomposer {
	private plugin: ClaudeAIPlugin;

	constructor(plugin: ClaudeAIPlugin) {
		this.plugin = plugin;
	}

	/**
	 * 分解任务
	 */
	async decompose(
		taskDescription: string,
		context?: string,
		constraints?: DecompositionConstraints
	): Promise<SubAgentTask[]> {
		try {
			const client = this.plugin.getApiClient();
			if (!client) {
				throw new Error('Claude客户端未初始化');
			}

			// 构建分解提示词
			const systemPrompt = `你是一个专业的任务分解专家。你的任务是将复杂的任务分解成多个可以独立执行的子任务。

分解规则：
1. 每个子任务应该有明确的目标和可执行的步骤
2. 子任务之间应该尽量独立，减少依赖
3. 如果有依赖关系，明确标注
4. 子任务数量不超过${constraints?.maxSubTasks || 5}个

输出格式（JSON）：
\`\`\`json
{
  "subtasks": [
    {
      "id": "task-1",
      "description": "子任务描述",
      "prompt": "详细的执行指令",
      "dependencies": []
    }
  ]
}
\`\`\``;

			const userPrompt = `请将以下任务分解成多个子任务：

主任务：${taskDescription}
${context ? `上下文：${context}` : ''}

请按照JSON格式输出分解结果：`;

			const response = await client.sendMessage(
				[
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt }
				]
			);

			// 解析响应
			const tasks = this.parseDecompositionResponse(response);

			// 应用约束
			return this.applyConstraints(tasks, constraints);
		} catch (error) {
			console.error('任务分解失败:', error);

			// 降级策略：返回单个任务
			return [{
				id: 'task-1',
				description: taskDescription,
				prompt: `请完成以下任务：${taskDescription}${context ? `\n\n上下文：${context}` : ''}`
			}];
		}
	}

	/**
	 * 解析分解响应
	 * @private
	 */
	private parseDecompositionResponse(response: string): SubAgentTask[] {
		try {
			// 尝试提取JSON
			const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
				response.match(/\{[\s\S]*\}/);

			if (!jsonMatch) {
				throw new Error('未找到有效的JSON响应');
			}

			const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);

			if (!parsed.subtasks || !Array.isArray(parsed.subtasks)) {
				throw new Error('无效的响应格式');
			}

			return parsed.subtasks;
		} catch (error) {
			console.error('解析分解响应失败:', error);
			throw error;
		}
	}

	/**
	 * 应用约束
	 * @private
	 */
	private applyConstraints(
		tasks: SubAgentTask[],
		constraints?: DecompositionConstraints
	): SubAgentTask[] {
		let result = [...tasks];

		// 限制子任务数量
		if (constraints?.maxSubTasks && result.length > constraints.maxSubTasks) {
			result = result.slice(0, constraints.maxSubTasks);
		}

		// 清理依赖关系（如果不允许依赖）
		if (constraints?.allowDependencies === false) {
			result = result.map(task => ({
				...task,
				dependencies: undefined
			}));
		}

		return result;
	}

	/**
	 * 构建依赖关系图
	 */
	buildDependencyGraph(tasks: SubAgentTask[]): DependencyGraph {
		const nodes = new Map<string, SubAgentTask>();
		const edges = new Map<string, string[]>();

		// 添加所有节点
		tasks.forEach(task => {
			nodes.set(task.id, task);
			edges.set(task.id, []);
		});

		// 构建边（依赖关系）
		tasks.forEach(task => {
			if (task.dependencies) {
				task.dependencies.forEach(depId => {
					const dependents = edges.get(depId) || [];
					dependents.push(task.id);
					edges.set(depId, dependents);
				});
			}
		});

		return { nodes, edges };
	}
}
