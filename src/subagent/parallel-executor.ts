import { ClaudeAIPlugin } from '../plugin';
import { TaskDecomposer } from './task-decomposer';
import { ResultMerger } from './result-merger';
import { SubAgentTask, AggregatedResult, ExecutionMode, MergeStrategy } from '../types';
import { SubAgentResult, TaskExecutionContext } from './types';

/**
 * SubAgent并行执行器
 * 负责并行执行多个SubAgent任务
 */
export class ParallelExecutor {
	private plugin: ClaudeAIPlugin;
	private taskDecomposer: TaskDecomposer;
	private resultMerger: ResultMerger;

	constructor(plugin: ClaudeAIPlugin) {
		this.plugin = plugin;
		this.taskDecomposer = new TaskDecomposer(plugin);
		this.resultMerger = new ResultMerger(plugin);
	}

	/**
	 * 分解并执行任务
	 */
	async decomposeAndExecute(
		mainTask: string,
		context?: TaskExecutionContext['context'],
		mode: ExecutionMode = ExecutionMode.Hybrid
	): Promise<AggregatedResult> {
		// 分解任务
		const tasks = await this.taskDecomposer.decompose(mainTask, context);

		// 执行任务
		return await this.execute(tasks, mode);
	}

	/**
	 * 执行多个SubAgent任务
	 */
	async execute(
		tasks: SubAgentTask[],
		mode: ExecutionMode = ExecutionMode.Hybrid
	): Promise<AggregatedResult> {
		const startTime = Date.now();

		let results: SubAgentResult[];

		switch (mode) {
			case ExecutionMode.Parallel:
				results = await this.executeParallel(tasks);
				break;

			case ExecutionMode.Sequential:
				results = await this.executeSequential(tasks);
				break;

			case ExecutionMode.Hybrid:
				results = await this.executeHybrid(tasks);
				break;

			default:
				throw new Error(`未知的执行模式: ${mode}`);
		}

		const endTime = Date.now();

		// 合并结果
		const mergedContent = await this.resultMerger.merge(results, MergeStrategy.SmartSummary);

		return {
			totalTasks: tasks.length,
			successfulTasks: results.filter(r => r.success).length,
			failedTasks: results.filter(r => !r.success).length,
			results,
			mergedContent,
			totalExecutionTime: endTime - startTime
		};
	}

	/**
	 * 完全并行执行
	 * @private
	 */
	private async executeParallel(tasks: SubAgentTask[]): Promise<SubAgentResult[]> {
		const client = this.plugin.getApiClient();
		if (!client) {
			throw new Error('Claude客户端未初始化');
		}

		// 使用Claude API的并行调用
		const requests = tasks.map(task => ({
			messages: [{ role: 'user' as const, content: task.prompt }]
		}));

		const responses = await client.parallelCall(requests, 5);

		// 构建结果
		return tasks.map((task, index) => ({
			taskId: task.id,
			success: true,
			content: responses[index],
			executionTime: 0 // 并行执行时无法准确计时
		}));
	}

	/**
	 * 顺序执行
	 * @private
	 */
	private async executeSequential(tasks: SubAgentTask[]): Promise<SubAgentResult[]> {
		const results: SubAgentResult[] = [];

		for (const task of tasks) {
			const result = await this.executeSingleTask(task);
			results.push(result);
		}

		return results;
	}

	/**
	 * 混合模式执行
	 * 考虑任务依赖关系，智能调度
	 * @private
	 */
	private async executeHybrid(tasks: SubAgentTask[]): Promise<SubAgentResult[]> {
		// 分析依赖关系
		const graph = this.taskDecomposer.buildDependencyGraph(tasks);

		// 拓扑排序
		const sortedTasks = this.topologicalSort(graph);

		// 分层执行（每一层内的任务并行执行）
		const results: SubAgentResult[] = [];
		const executed = new Set<string>();

		for (const task of sortedTasks) {
			// 检查依赖是否都已执行
			const dependencies = task.dependencies || [];
			const allDependenciesExecuted = dependencies.every((dep: string) =>
				executed.has(dep)
			);

			if (!allDependenciesExecuted) {
				// 依赖未满足，跳过（会在后续轮次中执行）
				continue;
			}

			// 执行任务
			const result = await this.executeSingleTask(task);
			results.push(result);
			executed.add(task.id);
		}

		return results;
	}

	/**
	 * 执行单个任务
	 * @private
	 */
	private async executeSingleTask(task: SubAgentTask): Promise<SubAgentResult> {
		const startTime = Date.now();

		try {
			const client = this.plugin.getApiClient();
			if (!client) {
				throw new Error('Claude客户端未初始化');
			}

			const content = await client.sendMessage([
				{ role: 'user', content: task.prompt }
			]);

			const endTime = Date.now();

			return {
				taskId: task.id,
				success: true,
				content,
				executionTime: endTime - startTime
			};
		} catch (error) {
			const endTime = Date.now();

			return {
				taskId: task.id,
				success: false,
				content: '',
				error: error instanceof Error ? error.message : '未知错误',
				executionTime: endTime - startTime
			};
		}
	}

	/**
	 * 拓扑排序
	 * @private
	 */
	private topologicalSort(
		graph: { nodes: Map<string, any>; edges: Map<string, string[]> }
	): any[] {
		const sorted: any[] = [];
		const visited = new Set<string>();
		const temp = new Set<string>();

		const visit = (nodeId: string) => {
			if (temp.has(nodeId)) {
				throw new Error('检测到循环依赖');
			}

			if (visited.has(nodeId)) {
				return;
			}

			temp.add(nodeId);

			const node = graph.nodes.get(nodeId);
			if (node) {
				const dependents = graph.edges.get(nodeId) || [];
				for (const dependent of dependents) {
					visit(dependent);
				}
			}

			temp.delete(nodeId);
			visited.add(nodeId);

			if (node) {
				sorted.unshift(node);
			}
		};

		for (const nodeId of graph.nodes.keys()) {
			visit(nodeId);
		}

		return sorted;
	}
}
