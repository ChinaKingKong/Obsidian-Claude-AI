#!/usr/bin/env node

// 测试插件是否可以正常加载
import fs from 'fs';
import path from 'path';

const pluginDir = '/Users/lizhigang/Library/Application Support/Obsidian/Plugins/obsidian-claude-ai';
const mainJsPath = path.join(pluginDir, 'main.js');
const manifestPath = path.join(pluginDir, 'manifest.json');

console.log('🔍 检查插件文件...\n');

// 1. 检查manifest.json
console.log('1️⃣ 检查 manifest.json');
if (fs.existsSync(manifestPath)) {
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
	console.log('   ✅ manifest.json 存在');
	console.log('   - ID:', manifest.id);
	console.log('   - 名称:', manifest.name);
	console.log('   - 版本:', manifest.version);
	console.log('   - 最低版本:', manifest.minAppVersion);
} else {
	console.log('   ❌ manifest.json 不存在');
	process.exit(1);
}

// 2. 检查main.js
console.log('\n2️⃣ 检查 main.js');
if (fs.existsSync(mainJsPath)) {
	const content = fs.readFileSync(mainJsPath, 'utf-8');
	console.log('   ✅ main.js 存在');
	console.log('   - 文件大小:', (content.length / 1024).toFixed(2), 'KB');
	console.log('   - 行数:', content.split('\n').length);

	// 检查是否有导出
	if (content.includes('module.exports')) {
		console.log('   ✅ 包含 module.exports');
	} else {
		console.log('   ❌ 缺少 module.exports');
	}

	// 检查是否有Plugin类
	if (content.includes('ClaudeAIPluginWrapper')) {
		console.log('   ✅ 包含 ClaudeAIPluginWrapper 类');
	} else {
		console.log('   ❌ 缺少 ClaudeAIPluginWrapper 类');
	}
} else {
	console.log('   ❌ main.js 不存在');
	process.exit(1);
}

// 3. 检查resources/styles.css
console.log('\n3️⃣ 检查 resources/styles.css');
const stylesPath = path.join(pluginDir, 'resources', 'styles.css');
if (fs.existsSync(stylesPath)) {
	console.log('   ✅ styles.css 存在');
} else {
	console.log('   ❌ styles.css 不存在');
}

console.log('\n✅ 所有必需文件都存在！');
console.log('\n💡 提示：');
console.log('1. 完全退出Obsidian（Cmd+Q）');
console.log('2. 重新打开Obsidian');
console.log('3. 设置 → 社区插件 → 关闭安全模式');
console.log('4. 点击"浏览"查看已安装的插件');
console.log('\n如果还是看不到，请按 Cmd+Option+I 打开开发者工具，查看Console中的错误信息。');
