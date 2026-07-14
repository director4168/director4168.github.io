// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 负责页面保护相关逻辑
(function() {
	'use strict';
	var hasRun = false;
	window.__PROTECT = true;

	function protectLongPressTargets() {
		var selector = [
			'a',
			'button',
			'summary',
			'[role="button"]',
			'[data-href]',
			'.avatar',
			'.avatar img',
			'.list-item',
			'.site-button',
			'.md3-button',
			'.btn',
			'.home-btn',
			'.collapse-header',
			'.bottom-actions a',
			'.bottom-actions .btn',
			'img'
		].join(', ');

		document.querySelectorAll(selector).forEach(function(el) {
			if (el._longPressProtected) return;
			el._longPressProtected = true;
			el.style.webkitTouchCallout = 'none';
			el.style.webkitUserSelect = 'none';
			el.style.userSelect = 'none';
			if (el.style.touchAction !== undefined) {
				el.style.touchAction = 'manipulation';
			}
			if (el.tagName && el.tagName.toLowerCase() === 'img') {
				el.setAttribute('draggable', 'false');
				el.style.webkitUserDrag = 'none';
				if (el.closest('.avatar')) {
					el.style.pointerEvents = 'none';
				}
			}
			['contextmenu', 'dragstart', 'selectstart'].forEach(function(type) {
				el.addEventListener(type, function(e) {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}, true);
			});
		});
	}



	function init() {
		if (hasRun) return;
		hasRun = true;
		try {
			Object.defineProperty(document, 'designMode', {
				value: 'off',
				writable: false,
				configurable: false
			});
		} catch (e) {}
		document.onkeydown = function(e) {
			if (
				e.key === 'F12' ||
				(e.ctrlKey && e.shiftKey && e.key === 'I') ||
				(e.ctrlKey && e.shiftKey && e.key === 'J') ||
				(e.ctrlKey && e.key === 'u')
			) {
				return false;
			}
		};
		protectLongPressTargets();
	}



	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();