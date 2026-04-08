// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0

(function() {
	'use strict';
	const PROTECT_SRC = './js/Protect.js';
	let coreInitialized = false;
	function isProtectReallyLoaded() {
		const scripts = document.querySelectorAll('script[src]');
		let scriptFound = false;
		for (let s of scripts) {
			const src = s.src || '';
			if (src.includes('Protect.js') || src.endsWith('Protect.js')) {
				scriptFound = true;
				break;
			}
		}
		const flagSet = window.__PROTECT_LOADED === true;
		return scriptFound && flagSet;
	}
	function runCoreFeatures() {
		if (coreInitialized) return;
		coreInitialized = true;


		const body = document.body;

		// 主题切换
		const themeToggle = document.getElementById('themeToggle');
		if (themeToggle) {
			const icon = themeToggle.querySelector('.material-icons');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

			const setTheme = (dark) => {
				body.classList.toggle('dark-theme', dark);
				if (icon) icon.textContent = dark ? 'light_mode': 'dark_mode';
			};

			setTheme(prefersDark.matches);
			prefersDark.addEventListener('change', e => setTheme(e.matches));
			themeToggle.addEventListener('click', () => setTheme(!body.classList.contains('dark-theme')));
		}

		// 更新版权年份
		const year = new Date().getFullYear();
		['chinese-copyright-year',
			'english-copyright-year'].forEach(id => {
				const el = document.getElementById(id);
				if (el) el.textContent = year > 2025 ? `2025-${year}`: '2025';
			});

		// MD3 对话框&列表项点击
		const dialog = document.getElementById('md3Dialog');
		if (!dialog) return;

		const header = document.getElementById('md3DialogHeader');
		const bodyEl = document.getElementById('md3DialogBody');
		const cancelBtn = document.getElementById('md3DialogCancel');
		const confirmBtn = document.getElementById('md3DialogConfirm');

		let currentHref = '';

		const showDialog = (title, content, href) => {
			if (header) header.textContent = title || '提示';
			if (bodyEl) bodyEl.textContent = content || '';
			currentHref = href || '';
			dialog.classList.add('show');
		};

		const hideDialog = () => dialog.classList.remove('show');

		if (cancelBtn) cancelBtn.onclick = hideDialog;
		if (confirmBtn) confirmBtn.onclick = () => {
			if (currentHref) window.location.href = currentHref;
			hideDialog();
		};

		dialog.addEventListener('click', e => {
			if (e.target === dialog) hideDialog();
		});

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
				document.body.innerHTML = '<h1 style="color:red;text-align:center;padding:50px;">ERROR</h1>';
			}
		},
			600);
	}
	function checkAndRun() {
		if (coreInitialized) return;
		let attempts = 0;
		const maxAttempts = 20;

		const checker = setInterval(() => {
			attempts++;

			if (isProtectReallyLoaded()) {
				clearInterval(checker);
				runCoreFeatures();
				return;
			}
			if (attempts >= maxAttempts) {
				clearInterval(checker);
				console.warn('[ERROR] ERROR');
				const warnDiv = document.createElement('div');
				warnDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#d32f2f;color:#fff;padding:14px;text-align:center;z-index:99999;font-size:15px;';
				warnDiv.textContent = 'ERROR';
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
	window.__CORE_READY = true;
})();