// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 对折叠系统添加平滑过渡动画
// Version: v26.04.21.2025

document.addEventListener('DOMContentLoaded', () => {
	const allDetails = document.querySelectorAll('details');

	allDetails.forEach(details => {
		const wrapper = details.querySelector('.details-animated-wrapper');
		const summary = details.querySelector('summary');

		if (!wrapper || !summary) return;

		// 初始化状态
		details.open = false;
		wrapper.style.display = 'grid';
		wrapper.style.gridTemplateRows = '0fr';
		wrapper.style.transition = 'grid-template-rows 0.4s ease-out';

		summary.addEventListener('click', (e) => {
			e.preventDefault();

			if (!details.open) {
				// 打开逻辑
				details.open = true;
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						wrapper.style.gridTemplateRows = '1fr';
					});
				});
			} else {
				// 关闭逻辑
				wrapper.style.gridTemplateRows = '0fr';

				const transitionEndHandler = () => {
					details.open = false;
				};

				wrapper.addEventListener('transitionend', transitionEndHandler, {
					once: true
				});
			}
		});
	});
});