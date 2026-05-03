// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 负责处理Code代码复制功能
// Version: v26.05.03.1407

function initLineNumbers() {
	const codeBlocks = document.querySelectorAll('.code-container');
	
	codeBlocks.forEach(container => {
		const codeElement = container.querySelector('code');
		const lineNumContainer = container.querySelector('.line-numbers');
		
		if (!lineNumContainer || !codeElement) return;

		// 获取代码文本&按行分割
		const text = codeElement.innerText.replace(/\n$/, '');
		const lines = text.split('\n');
		
		let lineNumbersHTML = '';
		for (let i = 1; i <= lines.length; i++) {
			lineNumbersHTML += `<span>${i}</span><br>`;
		}
		lineNumContainer.innerHTML = lineNumbersHTML;
	});
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initLineNumbers);

// 复制功能
function copyCode(btn) {
	const container = btn.closest('.code-container');
	const codeElement = container.querySelector("code");
	const codeText = codeElement.innerText;

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
