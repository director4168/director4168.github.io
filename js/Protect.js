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
window.__PROTECT = true;
});