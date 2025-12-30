#!/usr/bin/env node
/**
 * 将插件部署到Obsidian插件目录
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const pluginDir = '/Users/lizhigang/Documents/Works/Obsidian/Obsidian/.obsidian/plugins/obsidian-claude-ai';
const sourceDir = '/Users/lizhigang/Documents/Works/Claude Code/obsidian-claude-ai';

console.log('🚀 开始部署 Claude AI 插件...\n');

// 1. 确保插件目录存在
if (!fs.existsSync(pluginDir)) {
	fs.mkdirSync(pluginDir, { recursive: true });
	console.log('✅ 创建插件目录');
}

// 2. 复制文件
console.log('📦 复制文件到插件目录...');

// 复制main.js
fs.copyFileSync(
	path.join(sourceDir, 'main.js'),
	path.join(pluginDir, 'main.js')
);
console.log('  ✅ main.js');

// 复制manifest.json
fs.copyFileSync(
	path.join(sourceDir, 'manifest.json'),
	path.join(pluginDir, 'manifest.json')
);
// 设置正确的权限
fs.chmodSync(path.join(pluginDir, 'manifest.json'), 0o644);
console.log('  ✅ manifest.json');

// 复制styles.css到根目录（Obsidian要求）
fs.copyFileSync(
	path.join(sourceDir, 'resources', 'styles.css'),
	path.join(pluginDir, 'styles.css')
);
fs.chmodSync(path.join(pluginDir, 'styles.css'), 0o644);
console.log('  ✅ styles.css');

console.log('\n✅ 部署完成！');
console.log('\n📝 下一步：');
console.log('1. 完全退出 Obsidian（Cmd+Q）');
console.log('2. 重新打开 Obsidian');
console.log('3. 打开设置 → 社区插件');
console.log('4. 如果"安全模式"开启，先关闭它');
console.log('5. 在"已安装的插件"列表中应该能看到"Claude AI Assistant"');
console.log('6. 点击启用插件\n');
