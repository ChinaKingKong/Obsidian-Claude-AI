/**
 * SubAgent相关类型定义
 */

export interface SubAgentTask {
	id: string;
	description: string;
	prompt: string;
	dependencies?: string[];
	priority?: number;
}

export interface SubAgentResult {
	taskId: string;
	success: boolean;
	content: string;
	error?: string;
	executionTime: number;
}

export interface AggregatedResult {
	totalTasks: number;
	successfulTasks: number;
	failedTasks: number;
	results: SubAgentResult[];
	mergedContent?: string;
	totalExecutionTime: number;
}

export interface TaskExecutionContext {
	mainTask: string;
	context?: string;
	constraints?: {
		maxSubTasks?: number;
		maxDepth?: number;
		allowDependencies?: boolean;
	};
}

export interface DependencyGraph {
	nodes: Map<string, SubAgentTask>;
	edges: Map<string, string[]>; // taskId -> 依赖它的任务列表
}
