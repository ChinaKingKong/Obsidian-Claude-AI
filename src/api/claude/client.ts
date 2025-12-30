import Anthropic from '@anthropic-ai/sdk';
import { Message, ApiRequest, ApiResponse } from '../../types';

/**
 * Claude API客户端
 * 封装Anthropic SDK，提供简化的API调用接口
 */
export class ClaudeClient {
	private client: Anthropic;
	private model: string;

	constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
		this.client = new Anthropic({
			apiKey,
			dangerouslyAllowBrowser: true // Obsidian插件在桌面端运行
		});
		this.model = model;
	}

	/**
	 * 发送消息（非流式）
	 */
	async sendMessage(
		messages: Message[],
		options?: {
			model?: string;
			maxTokens?: number;
			temperature?: number;
		}
	): Promise<string> {
		try {
			const model = options?.model || this.model;
			const maxTokens = options?.maxTokens || 4096;

			// 调用Anthropic API
			const response = await this.client.messages.create({
				model,
				max_tokens: maxTokens,
				temperature: options?.temperature,
				messages: messages
					.filter(m => m.role !== 'system')
					.map(m => ({
						role: m.role as 'user' | 'assistant',
						content: m.content
					})),
				// 系统消息单独处理
				system: messages.find(m => m.role === 'system')?.content
			});

			// 提取文本内容
			const content = response.content
				.filter(block => block.type === 'text')
				.map(block => (block.type === 'text' ? block.text : ''))
				.join('\n');

			return content;
		} catch (error) {
			this.handleError(error);
			throw error; // TypeScript需要这行
		}
	}

	/**
	 * 发送消息（流式）
	 */
	async sendMessageStream(
		messages: Message[],
		options?: {
			model?: string;
			maxTokens?: number;
			temperature?: number;
			onChunk?: (chunk: string) => void;
		}
	): Promise<string> {
		try {
			const model = options?.model || this.model;
			const maxTokens = options?.maxTokens || 4096;

			// 调用Anthropic API（流式）
			const stream = await this.client.messages.create({
				model,
				max_tokens: maxTokens,
				temperature: options?.temperature,
				messages: messages
					.filter(m => m.role !== 'system')
					.map(m => ({
						role: m.role as 'user' | 'assistant',
						content: m.content
					})),
				system: messages.find(m => m.role === 'system')?.content,
				stream: true
			});

			let fullContent = '';

			// 处理流式响应
			for await (const event of stream) {
				if (event.type === 'content_block_delta' &&
					event.delta.type === 'text_delta') {
					const chunk = event.delta.text;
					fullContent += chunk;

					// 回调处理每个chunk
					if (options?.onChunk) {
						options.onChunk(chunk);
					}
				}
			}

			return fullContent;
		} catch (error) {
			this.handleError(error);
			throw error; // TypeScript需要这行
		}
	}

	/**
	 * 并行调用多个API请求（用于SubAgent）
	 */
	async parallelCall(
		requests: ApiRequest[],
		maxConcurrency: number = 5
	): Promise<string[]> {
		// 使用并发控制的并行执行
		const results: string[] = new Array(requests.length);

		// 分批执行以控制并发数
		for (let i = 0; i < requests.length; i += maxConcurrency) {
			const batch = requests.slice(i, i + maxConcurrency);
			const batchResults = await Promise.all(
				batch.map((req, index) =>
					this.sendMessage(req.messages, {
						model: req.model,
						maxTokens: req.maxTokens,
						temperature: req.temperature
					})
				)
			);

			// 将结果存入对应位置
			batchResults.forEach((result, index) => {
				results[i + index] = result;
			});
		}

		return results;
	}

	/**
	 * 计算输入的token数量（估算）
	 */
	estimateTokens(text: string): number {
		// 简单估算：英文约4字符/token，中文约1.5字符/token
		const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
		const otherChars = text.length - chineseChars;

		return Math.ceil(chineseChars / 1.5 + otherChars / 4);
	}

	/**
	 * 更新模型
	 */
	setModel(model: string) {
		this.model = model;
	}

	/**
	 * 获取当前模型
	 */
	getModel(): string {
		return this.model;
	}

	/**
	 * 错误处理
	 * @private
	 */
	private handleError(error: unknown) {
		if (error instanceof Error) {
			// Anthropic API错误
			if ('status' in error) {
				const status = (error as any).status;

				switch (status) {
					case 401:
						throw new Error('API Key无效或已过期');
					case 429:
						throw new Error('API请求速率超限，请稍后重试');
					case 500:
						throw new Error('Claude API服务器错误，请稍后重试');
					default:
						throw new Error(`API请求失败: ${error.message}`);
				}
			}

			throw error;
		}

		throw new Error('未知错误');
	}
}

/**
 * 类型守卫：检查错误是否为Anthropic API错误
 */
export function isAnthropicError(error: unknown): error is Error & { status?: number; error?: any } {
	return (
		typeof error === 'object' &&
		error !== null &&
		error instanceof Error &&
		'status' in error &&
		'error' in error
	);
}
