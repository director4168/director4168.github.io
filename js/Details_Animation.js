// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0

function getCollapseDurationMs() {
	const raw = localStorage.getItem('collapseDurationMs');
	const value = Number(raw);
	if (Number.isFinite(value)) {
		return Math.min(Math.max(Math.round(value), 0), 10000);
	}
	const cssValue = getComputedStyle(document.documentElement).getPropertyValue('--md-collapse-duration').trim();
	const parsed = parseFloat(cssValue);
	if (!Number.isFinite(parsed)) return 400;
	return cssValue.includes('ms') ? parsed : parsed * 1000;
}



function createCollapseRipple(header, event) {
	const ripple = document.createElement('span');
	ripple.className = 'collapse-ripple';

	const rect = header.getBoundingClientRect();
	const size = Math.max(rect.width, rect.height) * 2;
	const x = event.clientX - rect.left - size / 2;
	const y = event.clientY - rect.top - size / 2;

	ripple.style.width = size + 'px';
	ripple.style.height = size + 'px';
	ripple.style.left = x + 'px';
	ripple.style.top = y + 'px';

	const relX = ((event.clientX - rect.left) / rect.width) * 100;
	const relY = ((event.clientY - rect.top) / rect.height) * 100;
	header.style.setProperty('--ripple-x', relX + '%');
	header.style.setProperty('--ripple-y', relY + '%');

	header.appendChild(ripple);

	ripple.addEventListener('animationend', () => {
		ripple.remove();
	});
}



function toggleCollapse(header, event) {
	const isActive = header.classList.contains('active');

	if (event) {
		createCollapseRipple(header, event);
	}

	header.classList.toggle('active');

	const body = header.nextElementSibling;
	if (body) {
		if (isActive) {

			body.style.maxHeight = body.scrollHeight + 'px';
			requestAnimationFrame(() => {
				body.classList.remove('open');
				body.style.maxHeight = '0';
			});
		} else {

			body.classList.add('open');
			body.style.maxHeight = body.scrollHeight + 'px';

			body.addEventListener('transitionend', function handler() {
				if (body.classList.contains('open')) {
					body.style.maxHeight = 'none';
				}
				body.removeEventListener('transitionend', handler);
			});
		}
	}
}



function initCollapse() {
	const headers = document.querySelectorAll('.collapse-header');
	headers.forEach(header => {
		if (!header.dataset.collapseInit) {
			header.addEventListener('click', function(e) {
				e.preventDefault();
				toggleCollapse(this, e);
			});
			header.dataset.collapseInit = 'true';
		}
	});
}



function initDetailsAnimation() {
	const allDetails = document.querySelectorAll('details');
	allDetails.forEach(details => {
		const wrapper = details.querySelector('.details-animated-wrapper');
		const summary = details.querySelector('summary');
		if (!wrapper || !summary) return;

		details.open = false;
		wrapper.style.display = 'grid';
		wrapper.style.gridTemplateRows = '0fr';
		wrapper.style.transition = 'grid-template-rows ' + getCollapseDurationMs() + 'ms ease-out';

		summary.addEventListener('click', (e) => {
			e.preventDefault();
			if (!details.open) {
				details.open = true;
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						wrapper.style.gridTemplateRows = '1fr';
					});
				});
			} else {
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
}



document.addEventListener('DOMContentLoaded', () => {
	initCollapse();
	initDetailsAnimation();
});