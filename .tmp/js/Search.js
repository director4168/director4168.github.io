// Version: v26.04.27.1708

document.addEventListener('DOMContentLoaded', function() {
	const searchInput = document.getElementById('SearchInput');

	if (searchInput) {
		searchInput.addEventListener('input', function(e) {
			const searchTerm = e.target.value.toLowerCase().trim();
			const listItems = document.querySelectorAll('.list-item');

			listItems.forEach(item => {
				const title = item.querySelector('.list-title').textContent.toLowerCase();
				const subtitle = item.querySelector('.list-subtitle')?.textContent.toLowerCase() || "";

				if (title.includes(searchTerm) || subtitle.includes(searchTerm)) {
					item.style.display = 'flex';

				} else {
					item.style.display = 'none';
				}
			});

			document.querySelectorAll('.card').forEach(card => {
				const visibleItems = card.querySelectorAll('.list-item[style*="display: flex"]');
				const allItems = card.querySelectorAll('.list-item');

				if (allItems.length > 0 && visibleItems.length === 0 && searchTerm !== "") {
					card.style.display = 'none';
				} else {
					card.style.display = 'block';
				}
			});
		});
	}
});