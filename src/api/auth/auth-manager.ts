import { ClaudeAIPlugin } from '../../plugin';
import { AIProvider, AI_PROVIDERS } from '../../types';

/**
 * 认证管理器
 * 负责管理多个AI服务商的API Key认证
 */
export class AuthManager {
	private plugin: ClaudeAIPlugin;

	constructor(plugin: ClaudeAIPlugin) {
		this.plugin = plugin;
	}

	/**
	 * 获取当前选中的API Key
	 * 优先级：环境变量 > 设置面板
	 */
	async getApiKey(): Promise<string> {
		const settings = this.plugin.getSettings();
		const provider = settings.provider;

		// 首先尝试从环境变量获取
		const envKey = this.getEnvApiKey(provider);
		if (envKey) {
			return envKey;
		}

		// 然后尝试从设置面板获取
		const settingsKey = this.getSettingsApiKey(provider);
		if (settingsKey) {
			return settingsKey;
		}

		// 构建友好的错误提示
		const providerConfig = AI_PROVIDERS[provider];
		throw new Error(
			`未找到${providerConfig.name}的API Key。\n\n` +
			`请通过以下方式之一配置：\n` +
			`1. 在插件设置中输入API Key\n` +
			`2. 设置环境变量 ${providerConfig.envKey}\n\n` +
			`当前选中的服务商：${providerConfig.name}`
		);
	}

	/**
	 * 验证API Key
	 */
	async validateApiKey(apiKey: string, provider: AIProvider): Promise<boolean> {
		try {
			// TODO: 根据不同的provider调用相应的验证接口
			// 暂时简单验证：API Key不为空
			return apiKey.trim().length > 0;
		} catch (error) {
			console.error('API Key验证失败:', error);
			return false;
		}
	}

	/**
	 * 检查是否有可用的API Key
	 */
	async hasApiKey(): Promise<boolean> {
		try {
			await this.getApiKey();
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * 从环境变量获取API Key
	 * @private
	 */
	private getEnvApiKey(provider: AIProvider): string | null {
		// 在Obsidian桌面端可以访问process.env
		if (typeof process !== 'undefined' && process.env) {
			const providerConfig = AI_PROVIDERS[provider];
			const envKey = providerConfig.envKey;

			const value = process.env[envKey];
			if (value && value.trim().length > 0) {
				console.log(`从环境变量 ${envKey} 读取${providerConfig.name}的API Key`);
				return value.trim();
			}
		}

		return null;
	}

	/**
	 * 从设置面板获取API Key
	 * @private
	 */
	private getSettingsApiKey(provider: AIProvider): string | null {
		const settings = this.plugin.getSettings();
		const apiKey = settings.apiKeys[provider];

		if (apiKey && apiKey.trim().length > 0) {
			return apiKey.trim();
		}

		return null;
	}

	/**
	 * 获取API Key的来源信息
	 */
	async getApiKeySource(): Promise<'env' | 'settings' | 'none'> {
		const settings = this.plugin.getSettings();
		const provider = settings.provider;

		if (this.getEnvApiKey(provider)) {
			return 'env';
		}

		if (this.getSettingsApiKey(provider)) {
			return 'settings';
		}

		return 'none';
	}

	/**
	 * 获取当前选中的服务商
	 */
	getCurrentProvider(): AIProvider {
		return this.plugin.getSettings().provider;
	}

	/**
	 * 获取服务商配置
	 */
	getProviderConfig(provider: AIProvider) {
		return AI_PROVIDERS[provider];
	}
}
