// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 负责处理用户是否已同意协议
// Version: v26.04.22.1404

(function () {
	'use strict';

	// 获取Cookie
	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
		return null;
	}

	// 设置Cookie
	function setPermanentCookie() {
		const days = 365 * 2;
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = `; expires=${date.toUTCString()}`;
		document.cookie = `cookie_agreement=agreed${expires}; path=/; SameSite=Lax`;
	}

	// 同意协议后跳转首页
	window.agreeAndContinue = function () {
		setPermanentCookie();
		console.log('已同意');
		window.location.href = './index.html';
	};

	// 根据数据判断是否跳转
	function checkAgreementConsent() {
		const hasAgreed = getCookie('cookie_agreement') === 'agreed';
		const currentPath = (window.location.pathname || '').toLowerCase();

		// 如果已经同意协议但还在Agreement.html则跳转到index.html
/*		if (hasAgreed && currentPath.indexOf('agreement.html') !== -1) {
			window.location.href = './index.html';
			return;
		}*/

		// 如果没有同意协议并且不在Agreement.html，则跳转到Agreement.html
		if (!hasAgreed && currentPath.indexOf('agreement.html') === -1) {
			const isEnglishDir = currentPath.includes('/en_us/');
			const redirectUrl = isEnglishDir ? '../Agreement.html' : './Agreement.html';
			window.location.href = redirectUrl;
		}
	}

	// 页面加载后自动执行检测
	if (document.readyState === 'loading') {
		if (typeof document.addEventListener === 'function') {
			document.addEventListener('DOMContentLoaded', checkAgreementConsent);
		} else {
			checkAgreementConsent();
		}
	} else {
		checkAgreementConsent();
	}

	window.__COOKIE = true;
})();