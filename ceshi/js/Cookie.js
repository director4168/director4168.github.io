// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 负责Cookie同意弹窗逻辑（永久Cookie）
// Version: v26.04.21.1305

(function () {
	'use strict';

	// 获取Cookie
	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
		return null;
	}

	// 设置永久Cookie（2年，实际永久）
	function setPermanentCookie() {
		const days = 365 * 2;
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = `; expires=${date.toUTCString()}`;
		document.cookie = `cookie_consent=agreed${expires}; path=/; SameSite=Lax`;
	}

	// 创建并显示弹窗
	function createAndShowModal() {
		if (document.getElementById('cookieConsentModal')) return;

		const isEnglish = document.documentElement.lang && document.documentElement.lang.includes('en');
		const cssPath = window.location.pathname.includes('/en_US/') 
			? '../css/Cookie.css' 
			: './css/Cookie.css';

		// 动态加载CSS（只需一次）
		if (!document.querySelector(`link[href*="${cssPath.split('/').pop()}"]`)) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = cssPath;
			document.head.appendChild(link);
		}

		const title = isEnglish ? '🍪 Cookie Consent' : '🍪 Cookie 同意';
		const p1 = isEnglish 
			? 'This website uses cookies to enhance your browsing experience, remember your preferences, and provide personalized content.' 
			: '本网站使用 Cookie 来提升您的浏览体验、记住您的偏好并提供个性化内容。';
		const p2 = isEnglish 
			? 'Clicking "I Agree" means you have read and agree to our cookie usage policy.' 
			: '点击「我同意」即表示您已阅读并同意我们的 Cookie 使用政策。';
		const btnText = isEnglish ? 'I Agree' : '我同意';
		const noteText = isEnglish 
			? 'This website complies with the MPL-2.0 open source license' 
			: '本网站遵守 MPL-2.0 开源协议';

		const modalHTML = `
			<div id="cookieConsentModal" class="cookie-consent-modal">
				<div class="cookie-consent-content">
					<h2>${title}</h2>
					<p>${p1}</p>
					<p>${p2}</p>
					<div class="cookie-consent-actions">
						<button id="cookieAgreeBtn" class="cookie-button contained">${btnText}</button>
					</div>
					<p class="note">${noteText}</p>
				</div>
			</div>
		`;

		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = modalHTML;
		document.body.appendChild(tempDiv.firstElementChild);

		const modal = document.getElementById('cookieConsentModal');
		const agreeBtn = document.getElementById('cookieAgreeBtn');

		// 显示弹窗
		modal.classList.add('show');

		// 同意按钮逻辑
		agreeBtn.addEventListener('click', () => {
			setPermanentCookie();
			modal.classList.remove('show');
			console.log('%c[Cookie] 已永久同意 Cookie 协议', 'color: #4CAF50; font-weight: bold;');
			
			// 动画结束后移除DOM
			setTimeout(() => {
				if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
			}, 500);
		});
	}

	// 初始化
	function init() {
		// 已同意过则不再显示
		if (getCookie('cookie_consent') === 'agreed') {
			console.log('%c[Cookie] Cookie 协议已同意，无需再次显示', 'color: #4CAF50;');
			return;
		}
		createAndShowModal();
	}

	// 页面加载完成后执行
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

	window.__COOKIE_CONSENT_LOADED = true;
})();