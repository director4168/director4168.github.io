(function() {
'use strict';
function unescapeHtml(text) {
var map = {
'&lt;': '<',
'&gt;': '>',
'&amp;': '&',
'&quot;': '"',
'&#039;': "'",
'&#39': "'",
'&nbsp': ' '
};
return text.replace(/&lt;|&gt;|&amp;|&quot;|&#039;|&#39;|&nbsp;/g, function(m) { return map[m] || m; });
}
function escapeHtml(unsafe) {
return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function initCodeBlocks() {
document.querySelectorAll('.doc-section.active .code-container').forEach(function(container) {
if (container.dataset.codeInited === 'true') return;
container.dataset.codeInited = 'true';
var source = container.querySelector('.code-source');
var displayCode = container.querySelector('.display-code');
var lineNum = container.querySelector('.line-numbers');
if (!source || !displayCode) return;
var raw = source.textContent;
var code = unescapeHtml(raw.trim());
displayCode.innerHTML = escapeHtml(code);
var lines = code.split('\n');
var html = '';
for (var i = 1; i <= lines.length; i++) {
html += '<span>' + i + '</span><br>';
}
if (lineNum) lineNum.innerHTML = html;
if (window.hljs) {
try { hljs.highlightElement(displayCode); } catch (e) {}
}
});
}
window.copyCode = function(btn) {
var container = btn.closest('.code-container');
var source = container.querySelector('.code-source');
var txt = source ? unescapeHtml(source.textContent.trim()) : '';
navigator.clipboard.writeText(txt).then(function() {
var orig = btn.innerText;
btn.innerText = '已复制';
btn.style.background = '#28a745';
setTimeout(function() {
btn.innerText = orig;
btn.style.background = '';
}, 1500);
});
};
var menuBtn = document.getElementById('menuBtn');
var sidebar = document.getElementById('sidebar');
var mask = document.getElementById('mask');
var sidebarWidth = 260;
var currentProgress = 0; // 0 = 关闭, 1 = 完全打开

function updateSidebarTransform(progress) {
currentProgress = Math.max(0, Math.min(1, progress));
sidebar.style.transform = 'translateX(' + (currentProgress * sidebarWidth - sidebarWidth) + 'px)';
menuBtn.querySelector('.material-icons').style.transform = 'rotate(' + (currentProgress * 90) + 'deg)';
if (currentProgress > 0.01) {
mask.style.display = 'block';
mask.style.opacity = currentProgress * 0.45;
} else {
mask.style.display = 'none';
}
if (currentProgress > 0.5) {
document.documentElement.style.overflow = 'hidden';
} else {
document.documentElement.style.overflow = '';
}
}

function openS() {
updateSidebarTransform(1);
sidebar.classList.add('open');
mask.classList.add('show');
menuBtn.classList.add('open');
}
function closeS() {
updateSidebarTransform(0);
sidebar.classList.remove('open');
mask.classList.remove('show');
menuBtn.classList.remove('open');
}

// 滑动交互
var isDragging = false;
var startX = 0;
var startProgress = 0;

function onDragStart(e) {
var clientX = e.touches ? e.touches[0].clientX : e.clientX;
isDragging = true;
startX = clientX;
startProgress = currentProgress;
sidebar.style.transition = 'none';
menuBtn.querySelector('.material-icons').style.transition = 'none';
mask.style.transition = 'none';
}

function onDragMove(e) {
if (!isDragging) return;
var clientX = e.touches ? e.touches[0].clientX : e.clientX;
var deltaX = clientX - startX;
var newProgress = startProgress + deltaX / sidebarWidth;
updateSidebarTransform(newProgress);
}

function onDragEnd() {
if (!isDragging) return;
isDragging = false;
sidebar.style.transition = '';
menuBtn.querySelector('.material-icons').style.transition = '';
mask.style.transition = '';
if (currentProgress > 0.5) {
openS();
} else {
closeS();
}
}

// 菜单按钮滑动
menuBtn.addEventListener('touchstart', function(e) {
onDragStart(e);
}, { passive: true });
menuBtn.addEventListener('touchmove', function(e) {
onDragMove(e);
}, { passive: true });
menuBtn.addEventListener('touchend', onDragEnd);

menuBtn.addEventListener('mousedown', function(e) {
onDragStart(e);
e.preventDefault();
});
document.addEventListener('mousemove', onDragMove);
document.addEventListener('mouseup', onDragEnd);

// 点击切换（仅在没有滑动时触发）
menuBtn.addEventListener('click', function(e) {
if (Math.abs(currentProgress - (currentProgress > 0.5 ? 1 : 0)) > 0.01) return;
if (currentProgress > 0.5) {
closeS();
} else {
openS();
}
});
if (mask) mask.addEventListener('click', closeS);
function initSidebarGroups() {
document.querySelectorAll('.sidebar-group').forEach(function(g) {
if (g.dataset.groupInited === 'true') return;
g.dataset.groupInited = 'true';

var header = g.querySelector(':scope > .group-header');
var items = g.querySelector(':scope > .group-items');
if (!header || !items) return;
if (g.dataset.collapsed === 'true') {
items.classList.add('collapsed');
header.classList.add('collapsed');
}
header.addEventListener('click', function(e) {
e.stopPropagation();
var collapsed = items.classList.contains('collapsed');
if (collapsed) {
items.classList.remove('collapsed');
header.classList.remove('collapsed');
} else {
items.classList.add('collapsed');
header.classList.add('collapsed');
}
});
});
}
initSidebarGroups();
var sections = document.querySelectorAll('.doc-section');
var links = document.querySelectorAll('.sidebar a[href^="#"]');
function showSection(hash) {
var id = hash.replace('#', '');
if (!id) return;
sections.forEach(function(s) { s.classList.remove('active'); });
var t = document.getElementById('sec-' + id);
if (t) t.classList.add('active');
else {
var f = document.querySelector('.doc-section');
if (f) f.classList.add('active');
}
links.forEach(function(l) { l.classList.remove('active'); });
var al = document.querySelector('.sidebar a[data-href="' + hash + '"]') || document.querySelector('.sidebar a[href="' + hash + '"]');
if (al) al.classList.add('active');
if (location.hash !== hash) history.pushState(null, '', hash);
setTimeout(initCodeBlocks, 80);
}
links.forEach(function(l) {
l.addEventListener('click', function(e) {
e.preventDefault();
var href = this.dataset.href || this.getAttribute('href');
showSection(href);
if (window.innerWidth < 768) closeS();
});
});
window.addEventListener('hashchange', function() {
showSection(location.hash || '#Introduction');
});
showSection(location.hash || '#Introduction');
// 移除侧滑栏锚点链接的href属性，防止移动端长按锁定
document.querySelectorAll('.sidebar a').forEach(function(a) {
	var href = a.getAttribute('href');
	if (href && href.startsWith('#')) {
		a.dataset.href = href;
		a.removeAttribute('href');
	}
});
function initDetails() {
document.querySelectorAll('details').forEach(function(d) {
if (d.dataset.detailsInited === 'true') return;
d.dataset.detailsInited = 'true';
var w = d.querySelector('.details-animated-wrapper');
var s = d.querySelector('summary');
if (!w || !s) return;
d.open = false;
w.style.display = 'grid';
w.style.gridTemplateRows = '0fr';
w.style.transition = 'grid-template-rows 0.4s ease-out';
s.addEventListener('click', function(e) {
e.preventDefault();
if (!d.open) {
d.open = true;
requestAnimationFrame(function() {
requestAnimationFrame(function() {
w.style.gridTemplateRows = '1fr';
});
});
} else {
w.style.gridTemplateRows = '0fr';
w.addEventListener('transitionend', function() { d.open = false; }, { once: true });
}
});
});
}
initDetails();
new MutationObserver(function(mutations) {
var needsInit = false;
mutations.forEach(function(m) {
m.addedNodes.forEach(function(n) {
if (n.nodeType === 1 && (n.tagName === 'DETAILS' || n.querySelector('details'))) {
needsInit = true;
}
});
});
if (needsInit) initDetails();
}).observe(document.getElementById('mainWrap'), { childList: true, subtree: true });
})();