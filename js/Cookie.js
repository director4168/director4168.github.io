// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 负责处理用户是否已同意协议
(function() {
	'use strict';

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
		return null;
	}



	function setPermanentCookie() {
		const days = 365 * 2;
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = `; expires=${date.toUTCString()}`;
		document.cookie = `cookie_agreement=agreed${expires}; path=/; SameSite=Lax`;
	}



	window.agreeAndContinue = function() {
		setPermanentCookie();
		console.log('已同意');
		window.location.href = './index.html';
	};



	function checkAgreementConsent() {
		const hasAgreed = getCookie('cookie_agreement') === 'agreed';
		const currentPath = (window.location.pathname || '').toLowerCase();
		if (!hasAgreed && currentPath.indexOf('agreement.html') === -1) {
			const pathSegments = currentPath.split('/').filter(Boolean);
			let depth = pathSegments.length;
			if (currentPath.endsWith('.html') || currentPath.endsWith('.htm')) {
				depth--;
			}
			const prefix = depth > 0 ? '../'.repeat(depth) : './';
			window.location.href = prefix + 'Agreement.html';
		}
	}



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