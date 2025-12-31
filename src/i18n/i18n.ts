import { zhCN } from './locales/zh-CN';
import { enUS } from './locales/en-US';

export type Language = 'zh-CN' | 'en-US';

export interface LocaleStrings {
	// 通用
	common: {
		ready: string;
		loading: string;
		error: string;
		success: string;
		copy: string;
		copySuccess: string;
	};

	// 头部
	header: {
		title: string;
		settings: string;
	};

	// 聊天视图
	chatView: {
		placeholder: string;
		sending: string;
		aiTitle: string;
		reply: string;
		defaultTitle: string;
	};

	// 设置面板
	settings: {
		title: string;
		aiService: string;
		aiServiceDesc: string;
		apiKey: string;
		apiKeyDesc: string;
		model: string;
		modelDesc: string;
		language: string;
		languageDesc: string;
		save: string;
	};

	// AI 服务商
	providers: {
		anthropic: string;
		openai: string;
		zhipu: string;
		qwen: string;
		deepseek: string;
		moonshot: string;
	};

	// 标签
	tags: {
		thinkingMode: string;
		ready: string;
	};
}

const locales: Record<Language, LocaleStrings> = {
	'zh-CN': zhCN,
	'en-US': enUS,
};

let currentLanguage: Language = 'zh-CN';

/**
 * 设置当前语言
 */
export function setLanguage(language: Language): void {
	currentLanguage = language;
}

/**
 * 获取当前语言
 */
export function getLanguage(): Language {
	return currentLanguage;
}

/**
 * 获取翻译文本
 */
export function t(path: string): string {
	const keys = path.split('.');
	let result: any = locales[currentLanguage];

	for (const key of keys) {
		if (result && typeof result === 'object') {
			result = result[key];
		} else {
			console.warn(`i18n: Missing translation for "${path}" in ${currentLanguage}`);
			return path;
		}
	}

	if (typeof result !== 'string') {
		console.warn(`i18n: Invalid translation path "${path}" in ${currentLanguage}`);
		return path;
	}

	return result;
}

/**
 * 初始化 i18n
 */
export function initI18n(language: Language = 'zh-CN'): void {
	currentLanguage = language;
}
