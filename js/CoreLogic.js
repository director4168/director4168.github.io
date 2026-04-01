// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 负责处理网站大部分功能，比如手动/自动日间切换、页脚版权声明年份更新等……


const checkScript = "./Protect.js";
function isScriptLoaded(filename) {
	const scripts = document.getElementsByTagName("script");
	const targetName = filename.split('/').pop();
	const regex = new RegExp(`${targetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\?.*)?$`, 'i');
	for (let s of scripts) {
		if (s.src && regex.test(s.src)) return true;
	}
	return false;
}
let count = 0;
const checkInterval = setInterval(() => {
	count++;
	if (isScriptLoaded(checkScript)) {
		clearInterval(checkInterval);
		try {
			initCoreLogic();
		} catch (error) {}
	}
	if (count > 30) {
		clearInterval(checkInterval);
	}
}, 100);
function initCoreLogic() {
	const body = document.body;





	// 主题切换功能
	const themeToggle = document.getElementById('themeToggle');
	if (!themeToggle) return;
	const themeIcon = themeToggle.querySelector('.material-icons');
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

	const updateTheme = (isDark) => {
		body.classList.toggle('dark-theme', isDark);
		themeIcon.textContent = isDark ? 'light_mode': 'dark_mode';
	};
	updateTheme(prefersDark.matches);
	prefersDark.addEventListener('change', e => updateTheme(e.matches));
	themeToggle.addEventListener('click', () => updateTheme(!body.classList.contains('dark-theme')));





	// 更新页脚年份
	const currentYear = new Date().getFullYear();
	['chinese-copyright-year',
		'english-copyright-year'].forEach(id => {
			const el = document.getElementById(id);
			if (el) el.textContent = currentYear > 2025 ? `2025-${currentYear}`: '2025';
		});





	// 列表项点击动画修复
	const listItems = document.querySelectorAll('.list-item');
	let activeItem = null;
	document.addEventListener('click',
		e => {
			if (!e.target.closest('.list-item') && activeItem) {
				activeItem.classList.remove('active');
				activeItem = null;
			}
		});





	// MD3对话框功能
	const dialog = document.getElementById('md3Dialog');
	if (!dialog) return;
	const [header,
		bodyEl,
		cancelBtn,
		confirmBtn] = [
		'md3DialogHeader',
		'md3DialogBody',
		'md3DialogCancel',
		'md3DialogConfirm'
	].map(id => document.getElementById(id)).filter(Boolean);

	let currentHref = '';
	const showDialog = (title, content, href) => {
		header.textContent = title;
		bodyEl.textContent = content;
		currentHref = href;
		dialog.classList.add('show');
	};
	const hideDialog = () => dialog.classList.remove('show');

	cancelBtn?.addEventListener('click', hideDialog);
confirmBtn?.addEventListener('click', () => {
    if (currentHref) {
        window.location.href = currentHref;
    }
    hideDialog();
});
	dialog.addEventListener('click', e => e.target === dialog && hideDialog());





	// 列表项点击事件绑定
	listItems.forEach(item => {
		item.addEventListener('click', e => {
			e.stopPropagation();
			if (activeItem && activeItem !== item) activeItem.classList.remove('active');
			item.classList.toggle('active');
			activeItem = item.classList.contains('active') ? item: null;

			const href = item.dataset.href,
			title = item.dataset.title,
			content = item.dataset.content;
			if (href && title && content) showDialog(title, content, href);
		});
	});
}