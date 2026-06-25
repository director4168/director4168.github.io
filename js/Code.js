// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
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
let rawText = source.textContent;
let codeText = unescapeHtml(rawText.trim());
displayCode.innerHTML = escapeHtml(codeText);
const lines = codeText.split('\n');
let lineNumbersHTML = '';
for (let i = 1; i <= lines.length; i++) {
lineNumbersHTML += `<span>${i}</span><br>`;
}
lineNumContainer.innerHTML = lineNumbersHTML;
if (window.hljs) {
hljs.highlightElement(displayCode);
}
});
}
function escapeHtml(unsafe) {
return unsafe
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");
}
function copyCode(btn) {
const container = btn.closest('.code-container');
const source = container.querySelector('#code-source');
let codeText = source ? source.textContent : '';
codeText = unescapeHtml(codeText.trim());
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
window.addEventListener('DOMContentLoaded', initLineNumbers);