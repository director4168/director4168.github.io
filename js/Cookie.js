// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 负责本网站几乎所有逻辑处理
// Version: v26.04.18.2036

(function() {
	'use strict';
	const REQUIRED_SCRIPTS = [
		'./js/Protect.js',
		//'./js/d.js',
	];
	let coreInitialized = false;

	function areAllScriptsLoaded() {
		const loadedScripts = new Set();
		document.querySelectorAll('script[src]').forEach(script => {
			const src = script.src || '';
			if (src) {
				const filename = src.split('/').pop().split('?')[0];
				loadedScripts.add(filename);
			}
		});
		for (let required of REQUIRED_SCRIPTS) {
			const requiredName = required.split('/').pop().split('?')[0];
			if (!loadedScripts.has(requiredName)) {
				return false;
			}
		}
		return window.__PROTECT === true &&
			window.__COOKIE === true
	}

	function CoreFeatures() {
		if (coreInitialized) return;
		coreInitialized = true;





		// Goodbye
		if (window.location.href !== 'https://director4168.github.io/Goodbye.html') {
			window.location.replace('https://director4168.github.io/Goodbye.html');
		}





		const body = document.body;

		// 主题切换
		const themeToggle = document.getElementById('themeToggle');
		if (themeToggle) {
			const icon = themeToggle.querySelector('.material-icons');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

			const setTheme = (dark) => {
				body.classList.toggle('dark-theme', dark);
				if (icon) icon.textContent = dark ? 'light_mode' : 'dark_mode';
			};

			setTheme(prefersDark.matches);
			prefersDark.addEventListener('change', e => setTheme(e.matches));
			themeToggle.addEventListener('click', () => setTheme(!body.classList.contains('dark-theme')));
		}

		// 更新版权年份
		const year = new Date().getFullYear();
		['chinese-copyright-year',
			'english-copyright-year'
		].forEach(id => {
			const el = document.getElementById(id);
			if (el) el.textContent = year > 2025 ? `2025-${year}` : '2025';
		});

		// MD3 对话框&列表项点击
		const dialog = document.getElementById('md3Dialog');
		if (!dialog) return;

		const header = document.getElementById('md3DialogHeader');
		const bodyEl = document.getElementById('md3DialogBody');
		const cancelBtn = document.getElementById('md3DialogCancel');
		const confirmBtn = document.getElementById('md3DialogConfirm');

		let currentHref = '';
		let scrollPosition = 0;

		const showDialog = (title, content, href) => {
			if (header) header.textContent = title || '提示';
			if (bodyEl) bodyEl.innerHTML = (content || '').replace(/\\n/g, '<br>');
			currentHref = href || '';


			// 禁止在弹窗开启时能够滑动页面
			scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
			document.body.style.position = 'fixed';
			document.body.style.top = `-${scrollPosition}px`;
			document.body.style.width = '100%';
			document.body.style.overflow = 'hidden';


			dialog.classList.add('show');
		};

		const hideDialog = () => {
			dialog.classList.remove('show');
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			document.body.style.overflow = '';
			window.scrollTo(0, scrollPosition);
		};

		if (cancelBtn) cancelBtn.onclick = hideDialog;
		if (confirmBtn) confirmBtn.onclick = () => {
			if (currentHref) window.location.href = currentHref;
			hideDialog();
		};

		// 点击空白处关闭弹窗
		// dialog.addEventListener('click', e => {
		//	if (e.target === dialog) hideDialog();
		// });

		// 列表项点击
		document.querySelectorAll('.list-item').forEach(item => {
			item.addEventListener('click', e => {
				e.stopPropagation();
				const href = item.dataset.href;
				const title = item.dataset.title;
				const content = item.dataset.content;

				if (href && title && content) {
					showDialog(title, content, href);
				}
			});
		});





		startAntiDebug();
	}

	function startAntiDebug() {
		setInterval(() => {
				const devtools = window.outerWidth - window.innerWidth > 200 ||
					window.outerHeight - window.innerHeight > 200;
				if (devtools) {
					console.clear();
					document.body.innerHTML = '<h1 style="color:red;text-align:center;padding:50px;">WARN</h1>';
				}
			},
			600);
	}

	function checkAndRun() {
		if (coreInitialized) return;
		let attempts = 0;
		const maxAttempts = 10;
		const checker = setInterval(() => {
				attempts++;

				if (areAllScriptsLoaded()) {
					clearInterval(checker);
					CoreFeatures();
					return;
				}
				if (attempts >= maxAttempts) {
					CoreFeatures();
					clearInterval(checker);
					console.warn('%c[主JS] 检测到疑似部分资源缺失', 'color: #FFC900;');
					const warnDiv = document.createElement('div');
					warnDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#FFC900;color:#FF0000;padding:2px;text-align:center;z-index:99999;font-size:15px;';
					warnDiv.textContent = '警告: 疑似资源缺失！';
					document.body.prepend(warnDiv);
				}
			},
			100);
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', checkAndRun);
	} else {
		checkAndRun();
	}
	window.__PROTECT = true;
	window.__COOKIE === true
})();