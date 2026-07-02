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

		// 动画配置
		function applySiteTransitionSettings() {
			var root = document.documentElement;
			var settings = {
				'themeTransitionMs': {
					css: '--md-theme-transition-duration',
					def: 600,
					min: 0,
					max: 10000
				},
				'cardRadiusTransitionMs': {
					css: '--md-list-item-radius-transition-duration',
					def: 100,
					min: 0,
					max: 10000
				},
				'cardStateTransitionMs': {
					css: '--md-list-item-state-transition-duration',
					def: 150,
					min: 0,
					max: 10000
				},
				'cardRippleExpandMs': {
					css: '--md-ripple-expand-duration',
					def: 350,
					min: 0,
					max: 10000
				},
				'cardRippleFadeMs': {
					css: '--md-ripple-fade-duration',
					def: 300,
					min: 0,
					max: 10000
				},
				'collapseDurationMs': {
					css: '--md-collapse-duration',
					def: 400,
					min: 0,
					max: 10000
				}
			};
			Object.keys(settings).forEach(function(key) {
				var cfg = settings[key];
				var n = Number(localStorage.getItem(key));
				if (!isFinite(n)) n = cfg.def;
				n = Math.min(Math.max(Math.round(n), cfg.min), cfg.max);
				root.style.setProperty(cfg.css, n + 'ms');
			});
		}
		window.applySiteTransitionSettings = applySiteTransitionSettings;
		applySiteTransitionSettings();



		// 颜色配置
		var SITE_COLOR_VAR_IDS = [
			'--md-color-primary',
			'--md-color-on-primary',
			'--md-color-primary-container',
			'--md-color-on-primary-container',
			'--md-color-surface',
			'--md-color-on-surface',
			'--md-color-surface-variant',
			'--md-color-on-surface-variant',
			'--md-color-icon-background',
			'--md-color-outline',
			'--md-color-dialog-header',
			'--md-color-table-head',
			'--md-color-highlight',
			'--md-color-secondary',
			'--md-color-tertiary',
			'--md-color-error'
		];

		function getSiteColorSettings() {
			try {
				var data = JSON.parse(localStorage.getItem('siteColorVars') || '{}');
				return data && typeof data === 'object' ? data : {};
			} catch (e) {
				localStorage.removeItem('siteColorVars');
				return {};
			}
		}

		function normalizeSiteHexColor(value) {
			var v = String(value || '').replace(/^#/, '').toUpperCase();
			return /^[A-F0-9]{6}$/.test(v) ? '#' + v : '';
		}

		function applySiteColorSettings() {
			var themeName = body.classList.contains('dark-theme') ? 'dark' : 'light';
			var settings = getSiteColorSettings();
			var active = settings[themeName] || {};
			SITE_COLOR_VAR_IDS.forEach(function(varId) {
				body.style.removeProperty(varId);
				var value = normalizeSiteHexColor(active[varId]);
				if (value) {
					body.style.setProperty(varId, value);
				}
			});
		}
		window.applySiteColorSettings = applySiteColorSettings;
		applySiteColorSettings();



		// 依赖检查
		var REQUIRED_SCRIPTS = {
			'Protect.js': '__PROTECT',
			'Cookie.js': '__COOKIE'
		};

		function showResourceShortageWarning() {
			if (document.getElementById('resourceShortageWarning')) return;
			var bar = document.createElement('div');
			bar.id = 'resourceShortageWarning';
			bar.textContent = 'Warning: Resource shortage';
			bar.setAttribute('role', 'alert');
			bar.style.cssText = 'position:sticky;top:0;left:0;right:0;z-index:2147483647;background:#ff0000;color:#ffffff;text-align:center;font-weight:700;font-size:16px;line-height:1.4;padding:8px 12px;box-sizing:border-box;';
			if (document.body) {
				document.body.insertBefore(bar, document.body.firstChild);
			} else if (document.documentElement) {
				document.documentElement.insertBefore(bar, document.documentElement.firstChild);
			}
		}
		setTimeout(function() {
			var missingScripts = [];
			Object.keys(REQUIRED_SCRIPTS).forEach(function(scriptName) {
				if (!window[REQUIRED_SCRIPTS[scriptName]]) {
					missingScripts.push(scriptName);
				}
			});
			if (missingScripts.length > 0) {
				console.warn('CoreLogic: 缺少必需脚本: ' + missingScripts.join(', '));
				showResourceShortageWarning();
			}
		}, 5000);



		// 卡片基础保护
		document.querySelectorAll('a.list-item').forEach(function(el) {
			el.removeAttribute('href');
			el.setAttribute('role', 'button');
			el.style.cursor = 'pointer';
		});
		document.addEventListener('contextmenu', function(e) {
			var p = e.target.closest('.list-item');
			if (p) {
				e.preventDefault();
				return false;
			}
		}, true);



		// 底栏链接
		(function() {
			var btns = document.querySelectorAll('.home-btn, #settingsToggle, #languageToggle');
			btns.forEach(function(btn) {
				btn.addEventListener('contextmenu', function(e) {
					e.preventDefault();
					e.stopPropagation();
				});
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



		// 主题切换
		var themeToggle = document.getElementById('themeToggle');
		if (themeToggle) {
			var icon = themeToggle.querySelector('.material-icons');
			var pref = window.matchMedia('(prefers-color-scheme: dark)');
			var DEFAULT_THEME_MEMORY_MINUTES = 10;

			function getThemeMemoryMinutes() {
				var raw = localStorage.getItem('themeMemoryMinutes');
				var n = Number(raw);
				if (!isFinite(n) || n <= 0) return DEFAULT_THEME_MEMORY_MINUTES;
				return Math.min(Math.max(n, 1), 525600);
			}
			var setT = function(d) {
				body.classList.toggle('dark-theme', d);
				applySiteColorSettings();
				if (icon) icon.textContent = d ? 'light_mode' : 'dark_mode';
			};
			var saveT = function(d) {
				localStorage.setItem('userTheme', JSON.stringify({
					theme: d ? 'dark' : 'light',
					ts: Date.now()
				}));
			};
			var getT = function() {
				var s = localStorage.getItem('userTheme');
				if (!s) return null;
				try {
					var o = JSON.parse(s);
					var memoryMs = getThemeMemoryMinutes() * 60 * 1000;
					if (Date.now() - o.ts > memoryMs) {
						localStorage.removeItem('userTheme');
						return null;
					}
					return o.theme === 'dark';
				} catch (e) {
					localStorage.removeItem('userTheme');
					return null;
				}
			};
			var u = getT();
			setT(u !== null ? u : pref.matches);
			pref.addEventListener('change', function(e) {
				if (getT() === null) setT(e.matches);
			});
			themeToggle.addEventListener('click', function() {
				var nd = !body.classList.contains('dark-theme');
				setT(nd);
				saveT(nd);
			});
		}



		// 页脚年份
		var yr = new Date().getFullYear();
		document.getElementById('chinese-copyright-year') && (document.getElementById('chinese-copyright-year').textContent = yr > 2025 ? '2025-' + yr : '2025');
		document.getElementById('english-copyright-year') && (document.getElementById('english-copyright-year').textContent = yr > 2025 ? '2025-' + yr : '2025');



		// Toast
		function getToastElement() {
			return document.getElementById('siteToast') ||
				document.getElementById('pageToast') ||
				document.getElementById('debugToast') ||
				document.getElementById('docToast') ||
				document.querySelector('.site-toast');
		}

		function toast(text, timeout) {
			var el = getToastElement();
			if (!el) return;
			var textEl = el.querySelector('[data-toast-text], #siteToastText');
			if (textEl) textEl.textContent = text || '';
			else el.textContent = text || '';
			el.classList.add('show');
			clearTimeout(el._timer);
			el._timer = setTimeout(function() {
				el.classList.remove('show');
			}, Number(timeout) || 2200);
		}
		window.toast = toast;
		window.showToast = toast;
		window.showSiteToast = toast;
		document.querySelectorAll('[data-toast]').forEach(function(btn) {
			if (btn._toastBound) return;
			btn._toastBound = true;
			btn.addEventListener('click', function() {
				var text = btn.dataset.toast || btn.textContent.trim();
				var timeout = Number(btn.dataset.toastTimeout) || undefined;
				toast(text, timeout);
				if (btn.dataset.toastLog) console.info(btn.dataset.toastLog);
			});
		});



		// MD3 弹窗
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
					bodyEl.querySelectorAll('img').forEach(function(img) {
						img.classList.add('md3-dialog-img');
					});
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
		if (cancelBtn) cancelBtn.onclick = function(e) {
			e.stopPropagation();
			hide();
		};
		if (confirmBtn) confirmBtn.onclick = function(e) {
			e.stopPropagation();
			if (curHref) window.location.href = curHref;
			else hide();
		};
		dialog.addEventListener('click', function(e) {
			if (e.target === dialog && localStorage.getItem('mdDialogBackdropClose') !== 'false') hide();
		});



		// 卡片水波
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
				ripple._startTime = Date.now();
				currentRipple = ripple;
				requestAnimationFrame(function() {
					if (ripple.parentNode && !ripple.classList.contains('fade')) {
						ripple.classList.add('expand');
					}
				});
			});

			function getCssTimeMs(varName, fallback) {
				var raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
				var value = parseFloat(raw);
				if (!isFinite(value)) return fallback;
				return raw.indexOf('ms') !== -1 ? value : value * 1000;
			}

			function getRippleMustComplete() {
				return localStorage.getItem('cardRippleMustComplete') !== 'false';
			}

			function fadeRipple(r) {
				if (!r || !r.parentNode || r._fading) return;
				r._fading = true;
				var computed = getComputedStyle(r);
				r.style.transform = computed.transform && computed.transform !== 'none' ? computed.transform : 'scale(1)';
				r.style.opacity = computed.opacity || '1';
				r.classList.remove('expand');
				r.classList.add('fade');
				var fadeDuration = getCssTimeMs('--md-ripple-fade-duration', 300);
				setTimeout(function() {
					if (r.parentNode) r.remove();
				}, fadeDuration + 50);
			}

			function releaseRipple() {
				if (currentRipple && currentRipple.parentNode) {
					var r = currentRipple;
					currentRipple = null;
					if (getRippleMustComplete()) {
						var expandDuration = getCssTimeMs('--md-ripple-expand-duration', 350);
						var elapsed = Date.now() - (r._startTime || Date.now());
						var remain = Math.max(0, expandDuration - elapsed);
						if (remain > 0) {
							setTimeout(function() {
								fadeRipple(r);
							}, remain);
							return;
						}
					}
					fadeRipple(r);
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



		// 弹窗状态修复
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
	window.addEventListener('load', function() {
		setTimeout(init, 100);
	});
})();