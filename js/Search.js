// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 通用列表搜索：支持统计、清除、空结果提示和关键词高亮。
(function() {
	'use strict';

	var SEARCH_INPUT_SELECTOR = '#SearchInput, .search-InputBox, [data-search-input]';
	var DEFAULT_TARGET_SELECTOR = '.list-item';
	var HIGHLIGHT_CLASS = 'search-highlight';
	var HIDDEN_CLASS = 'search-hidden';
	var EMPTY_CLASS = 'search-empty';

	function normalizeText(value) {
		var text = String(value || '').toLowerCase();
		if (typeof text.normalize === 'function') text = text.normalize('NFKC');
		return text.replace(/\s+/g, ' ').trim();
	}

	function getSearchText(item) {
		var pieces = [];
		['.list-title', '.list-subtitle'].forEach(function(selector) {
			item.querySelectorAll(selector).forEach(function(el) {
				pieces.push(el.textContent || '');
			});
		});
		return pieces.join(' ');
	}

	function escapeRegExp(value) {
		return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	function clearHighlights(root) {
		root.querySelectorAll('mark.' + HIGHLIGHT_CLASS).forEach(function(mark) {
			var parent = mark.parentNode;
			if (!parent) return;
			parent.replaceChild(document.createTextNode(mark.textContent), mark);
			parent.normalize();
		});
	}

	function highlightTextNode(textNode, regex) {
		var text = textNode.nodeValue;
		if (!text || !regex.test(text)) return;
		regex.lastIndex = 0;
		var fragment = document.createDocumentFragment();
		var lastIndex = 0;
		var match;
		while ((match = regex.exec(text)) !== null) {
			if (match.index > lastIndex) {
				fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
			}
			var mark = document.createElement('mark');
			mark.className = HIGHLIGHT_CLASS;
			mark.textContent = match[0];
			fragment.appendChild(mark);
			lastIndex = match.index + match[0].length;
		}
		if (lastIndex < text.length) {
			fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
		}
		textNode.parentNode.replaceChild(fragment, textNode);
	}

	function highlightItem(item, term) {
		if (!term) return;
		var regex = new RegExp(escapeRegExp(term), 'gi');
		var walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT, {
			acceptNode: function(node) {
				var parent = node.parentElement;
				if (!parent) return NodeFilter.FILTER_REJECT;
				if (parent.closest('script, style, mark')) return NodeFilter.FILTER_REJECT;
				if (!parent.closest('.list-title, .list-subtitle')) return NodeFilter.FILTER_REJECT;
				return NodeFilter.FILTER_ACCEPT;
			}
		});
		var nodes = [];
		while (walker.nextNode()) nodes.push(walker.currentNode);
		nodes.forEach(function(node) {
			highlightTextNode(node, regex);
		});
	}

	function getSearchRoot(input) {
		var rootSelector = input.getAttribute('data-search-root');
		if (rootSelector) {
			var root = document.querySelector(rootSelector);
			if (root) return root;
		}
		return input.closest('.main-content') || document.body || document.documentElement;
	}

	function getTargetItems(input, root) {
		var targetSelector = input.getAttribute('data-search-target') || DEFAULT_TARGET_SELECTOR;
		return Array.prototype.slice.call(root.querySelectorAll(targetSelector));
	}

	function ensureStatus(input) {
		var wrapper = input.closest('.search-wrapper');
		if (!wrapper) return null;
		var status = wrapper.querySelector('.search-status');
		if (!status) {
			status = document.createElement('div');
			status.className = 'search-status';
			status.setAttribute('aria-live', 'polite');
			wrapper.appendChild(status);
		}
		return status;
	}

	function ensureClearButton(input) {
		var stroke = input.closest('.search-stroke');
		if (!stroke || stroke.querySelector('.search-clear')) return;
		var btn = document.createElement('button');
		btn.className = 'search-clear';
		btn.type = 'button';
		btn.setAttribute('aria-label', '清空搜索');
		btn.innerHTML = '<span class="material-icons" aria-hidden="true">close</span>';
		btn.addEventListener('click', function() {
			input.value = '';
			input.focus();
			applySearch(input);
		});
		stroke.appendChild(btn);
	}

	function ensureEmptyState(root) {
		var existing = null;
		Array.prototype.slice.call(root.children || []).some(function(child) {
			if (child.classList && child.classList.contains('search-empty-state')) {
				existing = child;
				return true;
			}
			return false;
		});
		if (existing) return existing;
		var empty = document.createElement('div');
		empty.className = 'search-empty-state';
		empty.innerHTML = '<span class="material-icons" aria-hidden="true">search_off</span><div><div class="search-empty-title">没有找到匹配内容</div><div class="search-empty-desc">换一个关键词再试试</div></div>';
		root.appendChild(empty);
		return empty;
	}

	function updateContainers(root, term) {
		root.querySelectorAll('.card, .card-section').forEach(function(container) {
			var items = Array.prototype.slice.call(container.querySelectorAll(DEFAULT_TARGET_SELECTOR));
			if (!items.length) return;
			var hasVisible = items.some(function(item) {
				return !item.classList.contains(HIDDEN_CLASS);
			});
			container.classList.toggle(HIDDEN_CLASS, Boolean(term) && !hasVisible);
		});
	}

	function applySearch(input) {
		var root = getSearchRoot(input);
		var items = getTargetItems(input, root);
		var rawTerm = input.value || '';
		var term = normalizeText(rawTerm);
		var matched = 0;

		items.forEach(function(item) {
			clearHighlights(item);
			var matchedItem = !term || normalizeText(getSearchText(item)).indexOf(term) !== -1;
			item.classList.toggle(HIDDEN_CLASS, !matchedItem);
			item.setAttribute('aria-hidden', matchedItem ? 'false' : 'true');
			if (matchedItem) {
				matched += 1;
				highlightItem(item, rawTerm.trim());
			}
		});

		updateContainers(root, term);

		var empty = ensureEmptyState(root);
		empty.classList.toggle('show', Boolean(term) && matched === 0);
		root.classList.toggle(EMPTY_CLASS, Boolean(term) && matched === 0);

		var status = ensureStatus(input);
		if (status) {
			status.textContent = term ? '找到 ' + matched + ' / ' + items.length + ' 个匹配项' : '共 ' + items.length + ' 个可搜索项';
		}

		var stroke = input.closest('.search-stroke');
		if (stroke) {
			stroke.classList.toggle('has-value', Boolean(term));
			stroke.classList.toggle('has-results', Boolean(term) && matched > 0);
			stroke.classList.toggle('no-results', Boolean(term) && matched === 0);
		}
	}

	function bindInput(input) {
		if (!input || input._siteSearchBound) return;
		input._siteSearchBound = true;
		ensureClearButton(input);
		input.setAttribute('autocomplete', input.getAttribute('autocomplete') || 'off');
		input.addEventListener('input', function() {
			applySearch(input);
		});
		input.addEventListener('keydown', function(e) {
			if (e.key === 'Escape' && input.value) {
				input.value = '';
				applySearch(input);
			}
		});
		applySearch(input);
	}

	function initSearch() {
		document.querySelectorAll(SEARCH_INPUT_SELECTOR).forEach(bindInput);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initSearch);
	} else {
		initSearch();
	}

	window.SiteSearch = {
		init: initSearch,
		refresh: initSearch,
		apply: applySearch
	};
})();
