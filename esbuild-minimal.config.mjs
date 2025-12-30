import esbuild from "esbuild";
import fs from "fs";

await esbuild.build({
	entryPoints: ["minimal-main.ts"],
	bundle: true,
	external: ["obsidian", "electron", "@codemirror/..."],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	outfile: "main-minimal.js",
	platform: "node",
	treeShaking: false,
});

// 添加导出
const content = fs.readFileSync("main-minimal.js", "utf-8");
fs.writeFileSync("main-minimal.js", content + "\nmodule.exports = MinimalPlugin;\n");

console.log("✅ 最小插件构建完成: main-minimal.js");
