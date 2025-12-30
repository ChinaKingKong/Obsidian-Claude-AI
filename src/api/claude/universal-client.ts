import { Message, ApiRequest } from '../../types';
import { AIProvider, AI_PROVIDERS } from '../../types';

/**
 * 通用AI客户端
 * 支持多个AI服务提供商
 */
export class UniversalAIClient {
	private apiKey: string;
	private provider: AIProvider;
	private model: string;

	constructor(apiKey: string, provider: AIProvider, model: string) {
		this.apiKey = apiKey;
		this.provider = provider;
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
		// 直接调用流式方法，不使用onChunk回调
		return await this.sendMessageStream(messages, {});
	}

	/**
	 * 发送消息（流式）
	 */
	async sendMessageStream(
		messages: Message[],
		options?: {
			onChunk?: (chunk: string) => void;
		}
	): Promise<string> {
		const providerConfig = AI_PROVIDERS[this.provider];

		try {
			// 根据不同提供商调用不同的API
			switch (this.provider) {
				case AIProvider.Zhipu:
					return await this.callZhipuAPI(messages, options);
				case AIProvider.OpenAI:
					return await this.callOpenAIAPI(messages, options);
				case AIProvider.Anthropic:
					return await this.callAnthropicAPI(messages, options);
				default:
					throw new Error(`暂不支持 ${providerConfig.name}`);
			}
		} catch (error) {
			this.handleError(error);
			throw error;
		}
	}

	/**
	 * 调用智谱AI API
	 * @private
	 */
	private async callZhipuAPI(
		messages: Message[],
		options?: {
			onChunk?: (chunk: string) => void;
		}
	): Promise<string> {
		const providerConfig = AI_PROVIDERS[AIProvider.Zhipu];

		const response = await fetch(`${providerConfig.baseUrl}/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.apiKey}`
			},
			body: JSON.stringify({
				model: this.model,
				messages: messages.map(m => ({
					role: m.role,
					content: m.content
				})),
				stream: false
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(`智谱AI API错误 (${response.status}): ${errorData.message || response.statusText}`);
		}

		const data = await response.json();
		const content = data.choices[0]?.message?.content || '';

		// 如果有回调，模拟流式输出
		if (options?.onChunk && content) {
			// 模拟逐字输出（因为智谱非流式API返回完整内容）
			const chars = content.split('');
			for (const char of chars) {
				await new Promise(resolve => setTimeout(resolve, 10)); // 10ms延迟
				options.onChunk(char);
			}
		}

		return content;
	}

	/**
	 * 调用OpenAI API
	 * @private
	 */
	private async callOpenAIAPI(
		messages: Message[],
		options?: {
			onChunk?: (chunk: string) => void;
		}
	): Promise<string> {
		const providerConfig = AI_PROVIDERS[AIProvider.OpenAI];

		const response = await fetch(`${providerConfig.baseUrl}/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.apiKey}`
			},
			body: JSON.stringify({
				model: this.model,
				messages: messages.map(m => ({
					role: m.role,
					content: m.content
				}))
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(`OpenAI API错误 (${response.status}): ${errorData.error?.message || response.statusText}`);
		}

		const data = await response.json();
		const content = data.choices[0]?.message?.content || '';

		if (options?.onChunk && content) {
			const chars = content.split('');
			for (const char of chars) {
				await new Promise(resolve => setTimeout(resolve, 10));
				options.onChunk(char);
			}
		}

		return content;
	}

	/**
	 * 调用Anthropic API
	 * @private
	 */
	private async callAnthropicAPI(
		messages: Message[],
		options?: {
			onChunk?: (chunk: string) => void;
		}
	): Promise<string> {
		const providerConfig = AI_PROVIDERS[AIProvider.Anthropic];

		const response = await fetch(`${providerConfig.baseUrl}/v1/messages`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': this.apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: this.model,
				max_tokens: 4096,
				messages: messages
					.filter(m => m.role !== 'system')
					.map(m => ({
						role: m.role as 'user' | 'assistant',
						content: m.content
					})),
				system: messages.find(m => m.role === 'system')?.content
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(`Anthropic API错误 (${response.status}): ${errorData.error?.message || response.statusText}`);
		}

		const data = await response.json();
		const content = data.content
			.filter((block: any) => block.type === 'text')
			.map((block: any) => block.text)
			.join('\n');

		if (options?.onChunk && content) {
			const chars = content.split('');
			for (const char of chars) {
				await new Promise(resolve => setTimeout(resolve, 10));
				options.onChunk(char);
			}
		}

		return content;
	}

	/**
	 * 错误处理
	 * @private
	 */
	private handleError(error: unknown) {
		if (error instanceof Error) {
			console.error('AI API错误:', error.message);
		} else {
			console.error('未知错误:', error);
		}
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
				batch.map((req) =>
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
}
