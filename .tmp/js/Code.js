// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// Version: v26.05.03.1945

// 反转义
function unescapeHtml(text) {
	const map = {
		'&lt;': '<',
		'&gt;': '>',
		'&amp;': '&',
		'&quot;': '"',
		'&#039;': "'",
		'&#39;': "'",
		'&nbsp;': ' '
	};
	return text.replace(/&lt;|&gt;|&amp;|&quot;|&#039;|&#39;|&nbsp;/g, matched => map[matched]);
}

function initLineNumbers() {
	const containers = document.querySelectorAll('.code-container');

	containers.forEach(container => {
		const source = container.querySelector('#code-source');
		const displayCode = container.querySelector('#display-code');
		const lineNumContainer = container.querySelector('.line-numbers');

		if (!source || !displayCode) return;

		// 获取原始内容
		let rawText = source.textContent;

		// 反转义
		let codeText = unescapeHtml(rawText.trim());

		// 显示代码
		displayCode.innerHTML = escapeHtml(codeText);

		// 生成行号
		const lines = codeText.split('\n');
		let lineNumbersHTML = '';
		for (let i = 1; i <= lines.length; i++) {
			lineNumbersHTML += `<span>${i}</span><br>`;
		}
		lineNumContainer.innerHTML = lineNumbersHTML;

		// 触发高亮
		if (window.hljs) {
			hljs.highlightElement(displayCode);
		}
	});
}





// 转义
function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

// 复制功能
function copyCode(btn) {
	const container = btn.closest('.code-container');
	const source = container.querySelector('#code-source');

	let codeText = source ? source.textContent : '';
	codeText = unescapeHtml(codeText.trim()); // 反转义后复制

	navigator.clipboard.writeText(codeText).then(() => {
		const originalText = btn.innerText;
		btn.innerText = "已复制";
		btn.style.background = "#28a745";
		setTimeout(() => {
			btn.innerText = originalText;
			btn.style.background = "";
		}, 1500);
	});
}

// 初始化
window.addEventListener('DOMContentLoaded', initLineNumbers);