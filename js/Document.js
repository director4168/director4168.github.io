// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// Version: v26.05.14.1231

(function() {
	'use strict';

	const body = document.body;
	const menuBtn = document.getElementById('menuBtn');
	const sidebar = document.getElementById('sidebar');
	const mask = document.getElementById('mask');
	const navLinks = document.querySelectorAll('.sidebar a');
	const sections = document.querySelectorAll('.anchor');
	const themeToggle = document.getElementById('themeToggle');
	const themeIcon = document.getElementById('themeIcon');

	// 侧边栏功能
	function openSidebar() {
		sidebar.classList.add('open');
		mask.classList.add('show');
		document.documentElement.style.overflow = 'hidden';
	}

	function closeSidebar() {
		sidebar.classList.remove('open');
		mask.classList.remove('show');
		document.documentElement.style.overflow = '';
	}

	menuBtn.addEventListener('click', openSidebar);
	mask.addEventListener('click', closeSidebar);

	navLinks.forEach(link => {
		link.addEventListener('click', () => {
			if (window.innerWidth < 768) {
				closeSidebar();
			}
		});
	});

	// 滚动高亮
	window.addEventListener('scroll', () => {
		let curId = '';
		sections.forEach(sec => {
			if (window.scrollY >= sec.offsetTop - 80) {
				curId = sec.id;
			}
		});
		navLinks.forEach(link => {
			link.classList.remove('active');
			if (link.getAttribute('href') === '#' + curId) {
				link.classList.add('active');
			}
		});
	});

	window.addEventListener('load', () => {});

})();