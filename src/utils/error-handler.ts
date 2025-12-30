/**
 * 错误处理工具
 */

export class ClaudeAIError extends Error {
	constructor(
		message: string,
		public code: string,
		public details?: any
	) {
		super(message);
		this.name = 'ClaudeAIError';
	}
}

export class AuthenticationError extends ClaudeAIError {
	constructor(message: string, details?: any) {
		super(message, 'AUTH_ERROR', details);
		this.name = 'AuthenticationError';
	}
}

export class APIError extends ClaudeAIError {
	constructor(message: string, details?: any) {
		super(message, 'API_ERROR', details);
		this.name = 'APIError';
	}
}

export class TaskExecutionError extends ClaudeAIError {
	constructor(message: string, details?: any) {
		super(message, 'TASK_ERROR', details);
		this.name = 'TaskExecutionError';
	}
}

/**
 * 错误处理器
 */
export class ErrorHandler {
	/**
	 * 处理并格式化错误消息
	 */
	static formatError(error: unknown): string {
		if (error instanceof ClaudeAIError) {
			return `[${error.code}] ${error.message}`;
		}

		if (error instanceof Error) {
			return error.message;
		}

		if (typeof error === 'string') {
			return error;
		}

		return '未知错误';
	}

	/**
	 * 判断错误是否可重试
	 */
	static isRetryable(error: unknown): boolean {
		if (error instanceof ClaudeAIError) {
			// API错误通常可以重试
			return error.code === 'API_ERROR';
		}

		return false;
	}

	/**
	 * 记录错误
	 */
	static log(error: unknown, context?: string) {
		const message = this.formatError(error);
		console.error(`[Claude AI]${context ? ` [${context}]` : ''} ${message}`);

		if (error instanceof Error && error.stack) {
			console.error(error.stack);
		}
	}
}
