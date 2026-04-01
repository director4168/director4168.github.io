// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 负责处理网站核心逻辑


// 主题切换功能
document.addEventListener('DOMContentLoaded', function() {
	const themeToggle = document.getElementById('themeToggle');
	const themeIcon = themeToggle.querySelector('.material-icons');

	// 检测系统主题偏好
	const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

	// 根据系统主题设置初始样式
	if (prefersDarkScheme.matches) {
		document.body.classList.add('dark-theme');
		themeIcon.textContent = 'light_mode';
	} else {
		document.body.classList.remove('dark-theme');
		themeIcon.textContent = 'dark_mode';
	}

	// 监听系统主题变化
	prefersDarkScheme.addEventListener('change', e => {
		if (e.matches) {
			document.body.classList.add('dark-theme');
			themeIcon.textContent = 'light_mode';
		} else {
			document.body.classList.remove('dark-theme');
			themeIcon.textContent = 'dark_mode';
		}
	});

	// 手动切换主题
	themeToggle.addEventListener('click',
		function() {
			if (document.body.classList.contains('dark-theme')) {
				document.body.classList.remove('dark-theme');
				themeIcon.textContent = 'dark_mode';
			} else {
				document.body.classList.add('dark-theme');
				themeIcon.textContent = 'light_mode';
			}
		});





	// 更新页脚年份
	const currentYear = new Date().getFullYear();

	// 获取中英文版权的元素
	const chineseYearElement = document.getElementById('chinese-copyright-year');
	const englishYearElement = document.getElementById('english-copyright-year');

	// 统一的年份更新逻辑
	function updateYearDisplay(yearElement) {
		if (currentYear > 2025) {
			yearElement.textContent = `2025-${currentYear}`;
		} else {
			yearElement.textContent = '2025';
		}
	}

	// 分别更新两个元素
	updateYearDisplay(chineseYearElement);
	updateYearDisplay(englishYearElement);





	// 修复列表项点击动画问题
	const listItems = document.querySelectorAll('.list-item');
	let activeItem = null;

	// 点击文档其他地方时移除所有激活状态
	document.addEventListener('click', function(e) {
		// 检查点击的是否是列表项
		const isListItem = e.target.closest('.list-item');

		if (!isListItem && activeItem) {
			// 如果点击的不是列表项，且有激活的列表项，则移除激活状态
			activeItem.classList.remove('active');
			activeItem = null;
		}
	});





	// MD3对话框功能
	const md3Dialog = document.getElementById('md3Dialog');
	const md3DialogHeader = document.getElementById('md3DialogHeader');
	const md3DialogBody = document.getElementById('md3DialogBody');
	const md3DialogCancel = document.getElementById('md3DialogCancel');
	const md3DialogConfirm = document.getElementById('md3DialogConfirm');

	let currentHref = '';

	// 显示对话框函数
	function showDialog(title,
		content,
		href) {
		md3DialogHeader.textContent = title;
		md3DialogBody.textContent = content;
		currentHref = href;
		md3Dialog.classList.add('show');
	}

	// 隐藏对话框函数
	function hideDialog() {
		md3Dialog.classList.remove('show');
	}

	// 对话框按钮事件
	md3DialogCancel.addEventListener('click',
		function() {
			hideDialog();
		});

	md3DialogConfirm.addEventListener('click',
		function() {
			window.open(currentHref, '_blank');
			hideDialog();
		});

	// 点击对话框外部关闭
	md3Dialog.addEventListener('click',
		function(e) {
			if (e.target === md3Dialog) {
				hideDialog();
			}
		});





	// 为每个列表项添加点击事件
	listItems.forEach(item => {
		item.addEventListener('click', function(e) {
			// 阻止事件冒泡，避免触发document的点击事件
			e.stopPropagation();

			// 如果已经有激活的项，先移除其激活状态
			if (activeItem && activeItem !== this) {
				activeItem.classList.remove('active');
			}

			// 切换当前项的激活状态
			this.classList.toggle('active');

			// 更新当前激活的项
			if (this.classList.contains('active')) {
				activeItem = this;
			} else {
				activeItem = null;
			}

			// 获取链接数据并显示对话框
			const href = this.getAttribute('data-href');
			const title = this.getAttribute('data-title');
			const content = this.getAttribute('data-content');

			if (href && title && content) {
				showDialog(title, content, href);
			}
		});
	});
})