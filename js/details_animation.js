// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 对折叠系统添加平滑过渡动画
// Version: v26.04.18.2049

document.addEventListener('DOMContentLoaded', () => {
	const details = document.getElementById('version-details');
	if (!details) return;

	const wrapper = details.querySelector('.details-animated-wrapper');
	if (!wrapper) return;

	details.open = false;
	wrapper.style.gridTemplateRows = '0fr';

	const summary = details.querySelector('summary');

	summary.addEventListener('click', (e) => {
		e.preventDefault();

		if (!details.open) {

			details.open = true;

			void wrapper.offsetHeight;

			requestAnimationFrame(() => {
				wrapper.style.gridTemplateRows = '1fr';
			});

		} else {
			wrapper.style.gridTemplateRows = '0fr';

			const transitionEndHandler = () => {
				details.open = false;
				wrapper.removeEventListener('transitionend', transitionEndHandler);
			};

			wrapper.addEventListener('transitionend', transitionEndHandler, {
				once: true
			});
		}
	});
});