document.addEventListener('DOMContentLoaded', function() {
	Object.defineProperty(document, 'designMode', {
		value: 'off',
		writable: false,
		configurable: false
	});

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

	document.oncontextmenu = function(e) {
		if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
			return false;
		}
	};

	const observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type === 'characterData') {
				mutation.target.textContent = mutation.oldValue;
			}
			if (mutation.type === 'childList') {
				mutation.removedNodes.forEach(node => {
					if (node.parentNode) {
						node.parentNode.appendChild(node);
					}
				});
			}
		});
	});

	observer.observe(document.body, {
		childList: true,
		characterData: true,
		characterDataOldValue: true,
		subtree: true
	});
});