(function() {
	'use strict';

	// 工具函数
	function unescapeHtml(text) {
		const map = {
			'&lt;': '<',
			'&gt;': '>',
			'&amp;': '&',
			'&quot;': '"',
			'&#039;': "'",
			'&#39': "'",
			'&nbsp': ' '
		};
		return text.replace(/&lt;|&gt;|&amp;|&quot;|&#039;|&#39;|&nbsp;/g, m => map[m] || m);
	}

	function escapeHtml(unsafe) {
		return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
	}

	// 初始化当前可见区块中的所有代码块
	function initCodeBlocks() {
		document.querySelectorAll('.doc-section.active .code-container').forEach(function(container) {
			if (container.dataset.codeInited === 'true') return;
			container.dataset.codeInited = 'true';
			var source = container.querySelector('.code-source');
			var displayCode = container.querySelector('.display-code');
			var lineNum = container.querySelector('.line-numbers');
			if (!source || !displayCode) return;
			var raw = source.textContent;
			var code = unescapeHtml(raw.trim());
			displayCode.innerHTML = escapeHtml(code);
			var lines = code.split('\n');
			var html = '';
			for (var i = 1; i <= lines.length; i++) {
				html += '<span>' + i + '</span><br>';
			}
			if (lineNum) lineNum.innerHTML = html;
			if (window.hljs) {
				try {
					hljs.highlightElement(displayCode);
				} catch (e) {}
			}
		});
	}

	// 复制功能
	window.copyCode = function(btn) {
		var container = btn.closest('.code-container');
		var source = container.querySelector('.code-source');
		var txt = source ? unescapeHtml(source.textContent.trim()) : '';
		navigator.clipboard.writeText(txt).then(function() {
			var orig = btn.innerText;
			btn.innerText = "已复制";
			btn.style.background = "#28a745";
			setTimeout(function() {
				btn.innerText = orig;
				btn.style.background = "";
			}, 1500);
		});
	};


	// 侧滑栏
	var menuBtn = document.getElementById('menuBtn');
	var sidebar = document.getElementById('sidebar');
	var mask = document.getElementById('mask');

	function openS() {
		sidebar.classList.add('open');
		mask.classList.add('show');
		document.documentElement.style.overflow = 'hidden';
	}

	function closeS() {
		sidebar.classList.remove('open');
		mask.classList.remove('show');
		document.documentElement.style.overflow = '';
	}
	if (menuBtn) menuBtn.addEventListener('click', openS);
	if (mask) mask.addEventListener('click', closeS);
	document.querySelectorAll('.sidebar-group').forEach(function(g) {
		var h = g.querySelector('.group-header');
		var i = g.querySelector('.group-items');
		if (h && i) {
			h.addEventListener('click', function(e) {
				e.stopPropagation();
				i.classList.toggle('collapsed');
				h.classList.toggle('collapsed');
			});
		}
	});

	// 区块切换
	var sections = document.querySelectorAll('.doc-section');
	var links = document.querySelectorAll('.sidebar a[href^="#"]');

	function showSection(hash) {
		var id = hash.replace('#', '');
		if (!id) return;
		sections.forEach(function(s) {
			s.classList.remove('active');
		});
		var t = document.getElementById('sec-' + id);
		if (t) t.classList.add('active');
		else {
			var f = document.querySelector('.doc-section');
			if (f) f.classList.add('active');
		}
		links.forEach(function(l) {
			l.classList.remove('active');
		});
		var al = document.querySelector('.sidebar a[href="' + hash + '"]');
		if (al) al.classList.add('active');
		if (location.hash !== hash) history.pushState(null, '', hash);
		setTimeout(initCodeBlocks, 80);
	}
	links.forEach(function(l) {
		l.addEventListener('click', function(e) {
			e.preventDefault();
			showSection(this.getAttribute('href'));
			if (window.innerWidth < 768) closeS();
		});
	});
	window.addEventListener('hashchange', function() {
		showSection(location.hash || '#intro');
	});
	showSection(location.hash || '#intro');

	// 折叠动画
	function initDetails() {
		document.querySelectorAll('details').forEach(function(d) {
			if (d.dataset.detailsInited === 'true') return;
			d.dataset.detailsInited = 'true';
			var w = d.querySelector('.details-animated-wrapper');
			var s = d.querySelector('summary');
			if (!w || !s) return;
			d.open = false;
			w.style.display = 'grid';
			w.style.gridTemplateRows = '0fr';
			w.style.transition = 'grid-template-rows 0.4s ease-out';
			s.addEventListener('click', function(e) {
				e.preventDefault();
				if (!d.open) {
					d.open = true;
					requestAnimationFrame(function() {
						requestAnimationFrame(function() {
							w.style.gridTemplateRows = '1fr';
						});
					});
				} else {
					w.style.gridTemplateRows = '0fr';
					w.addEventListener('transitionend', function() {
						d.open = false;
					}, {
						once: true
					});
				}
			});
		});
	}
	initDetails();
	new MutationObserver(function(mutations) {
		let needsInit = false;
		mutations.forEach(function(m) {
			m.addedNodes.forEach(function(n) {
				if (n.nodeType === 1 && (n.tagName === 'DETAILS' || n.querySelector('details'))) {
					needsInit = true;
				}
			});
		});
		if (needsInit) initDetails();
	}).observe(document.getElementById('mainWrap'), {
		childList: true,
		subtree: true
	});

})();