// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 负责本网站几乎所有逻辑处理
(function() {
'use strict';
var hasRun = false;
if (hasRun) return;
function init() {
if (hasRun) return;
hasRun = true;
var body = document.body;

// 检查必需脚本是否加载
var REQUIRED_SCRIPTS = {
'Protect.js': '__PROTECT',
'Cookie.js': '__COOKIE'
};
var missingScripts = [];
Object.keys(REQUIRED_SCRIPTS).forEach(function(scriptName) {
if (!window[REQUIRED_SCRIPTS[scriptName]]) {
missingScripts.push(scriptName);
}
});
if (missingScripts.length > 0) {
console.warn('CoreLogic: 缺少必需脚本: ' + missingScripts.join(', '));
// 可选：显示警告给用户
// alert('页面加载不完整，缺少: ' + missingScripts.join(', '));
}

document.querySelectorAll('a.list-item').forEach(function(el) {
el.removeAttribute('href');
el.setAttribute('role', 'button');
el.style.cursor = 'pointer';
});
document.addEventListener('contextmenu', function(e) {
var p = e.target.closest('.list-item');
if (p) { e.preventDefault(); return false; }
}, true);
// 防止顶部/底部功能栏按钮长按锁定
// 原理：移动端长按 <a> 标签会触发浏览器预览/菜单，导致页面锁定
// 解决：移除 href 属性并用 JS 处理导航，阻止 contextmenu
(function() {
var btns = document.querySelectorAll('.home-btn, #languageToggle');
btns.forEach(function(btn) {
btn.addEventListener('contextmenu', function(e) { e.preventDefault(); e.stopPropagation(); });
var href = btn.getAttribute('href');
if (href) {
btn.dataset.href = href;
btn.removeAttribute('href');
btn.style.cursor = 'pointer';
btn.addEventListener('click', function(e) {
e.preventDefault();
window.location.href = href;
});
}
});
})();
var themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
var icon = themeToggle.querySelector('.material-icons');
var pref = window.matchMedia('(prefers-color-scheme: dark)');
var setT = function(d) {
body.classList.toggle('dark-theme', d);
if (icon) icon.textContent = d ? 'light_mode' : 'dark_mode';
};
var saveT = function(d) {
localStorage.setItem('userTheme', JSON.stringify({theme:d?'dark':'light',ts:Date.now()}));
};
var getT = function() {
var s = localStorage.getItem('userTheme');
if (!s) return null;
try {
var o = JSON.parse(s);
if (Date.now() - o.ts > 600000) { localStorage.removeItem('userTheme'); return null; }
return o.theme === 'dark';
} catch(e) { localStorage.removeItem('userTheme'); return null; }
};
var u = getT();
setT(u !== null ? u : pref.matches);
pref.addEventListener('change', function(e) { if (getT()===null) setT(e.matches); });
themeToggle.addEventListener('click', function() {
var nd = !body.classList.contains('dark-theme');
setT(nd); saveT(nd);
});
}
var yr = new Date().getFullYear();
document.getElementById('chinese-copyright-year') && (document.getElementById('chinese-copyright-year').textContent = yr > 2025 ? '2025-'+yr : '2025');
document.getElementById('english-copyright-year') && (document.getElementById('english-copyright-year').textContent = yr > 2025 ? '2025-'+yr : '2025');
var dialog = document.getElementById('md3Dialog');
if (!dialog) return;
var header = document.getElementById('md3DialogHeader');
var bodyEl = document.getElementById('md3DialogBody');
var cancelBtn = document.getElementById('md3DialogCancel');
var confirmBtn = document.getElementById('md3DialogConfirm');
var curHref = '';
var scrPos = 0;
function restore() {
body.style.position = '';
body.style.top = '';
body.style.width = '';
body.style.overflow = '';
}
function show(title, content, href) {
if (header) header.textContent = title || '';
if (bodyEl) {
bodyEl.innerHTML = (content || '').replace(/\\n/g, '<br>');
setTimeout(function() {
bodyEl.querySelectorAll('img').forEach(function(img) { img.classList.add('md3-dialog-img'); });
}, 10);
}
curHref = href || '';
scrPos = window.pageYOffset || document.documentElement.scrollTop;
body.style.position = 'fixed';
body.style.top = '-' + scrPos + 'px';
body.style.width = '100%';
body.style.overflow = 'hidden';
dialog.classList.add('show');
}
function hide() {
dialog.classList.remove('show');
restore();
window.scrollTo(0, scrPos);
}
if (cancelBtn) cancelBtn.onclick = function(e) { e.stopPropagation(); hide(); };
if (confirmBtn) confirmBtn.onclick = function(e) {
e.stopPropagation();
if (curHref) window.location.href = curHref;
else hide();
};
dialog.addEventListener('click', function(e) { if (e.target === dialog) hide(); });
var items = document.querySelectorAll('.list-item');
items.forEach(function(item) {
if (item._b) return;
item._b = true;
var currentRipple = null;
item.addEventListener('pointerdown', function(e) {
if (currentRipple && currentRipple.parentNode) currentRipple.remove();
var rect = item.getBoundingClientRect();
var size = Math.max(rect.width, rect.height) * 2.2;
var x = e.clientX - rect.left - size / 2;
var y = e.clientY - rect.top - size / 2;
var ripple = document.createElement('span');
ripple.className = 'list-ripple';
ripple.style.width = size + 'px';
ripple.style.height = size + 'px';
ripple.style.left = x + 'px';
ripple.style.top = y + 'px';
item.appendChild(ripple);
currentRipple = ripple;
requestAnimationFrame(function() {
ripple.classList.add('expand');
});
});
function releaseRipple() {
if (currentRipple && currentRipple.parentNode) {
currentRipple.classList.remove('expand');
currentRipple.classList.add('fade');
var r = currentRipple;
setTimeout(function() {
if (r.parentNode) r.remove();
}, 350);
currentRipple = null;
}
}
item.addEventListener('pointerup', releaseRipple);
item.addEventListener('pointerleave', releaseRipple);
item.addEventListener('pointercancel', releaseRipple);
item.addEventListener('click', function(e) {
if (dialog.classList.contains('show')) return;
var href = this.dataset.href;
var title = this.dataset.title;
var content = this.dataset.content;
if (href && title && content) {
e.preventDefault();
e.stopPropagation();
show(title, content, href);
}
});
});
setInterval(function() {
var b = document.body;
if ((b.style.position === 'fixed' || b.style.overflow === 'hidden') && 
dialog && !dialog.classList.contains('show')) {
restore();
}
}, 500);
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
} else {
setTimeout(init, 10);
}
window.addEventListener('load', function() { setTimeout(init, 100); });
})();