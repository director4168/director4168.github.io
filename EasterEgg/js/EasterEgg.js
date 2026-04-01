// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 负责处理彩蛋

// 因为将此js分离出来造成一些bug（个人测试），此js已重新加进ContactInformation.html中，暂时不使用此文件

// 引入彩蛋弹窗css样式
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/EasterEgg/css/EasterEggPop-upWindow.css';
document.head.appendChild(link);


const avatar = document.getElementById('avatar');
const easterEggModal = document.getElementById('easterEggModal');
const easterEggClose = document.getElementById('easterEggClose');
const easterEggCloseDialog = document.getElementById('easterEggCloseDialog');
const easterEggCloseDialogConfirm = document.getElementById('easterEggCloseDialogConfirm');
let clickCount = 0;
let lastClickTime = 0;

// 彩蛋触发逻辑
avatar.addEventListener('click', function() {
	const now = new Date().getTime();
	if (now - lastClickTime > 300) {
		clickCount = 0;
	}
	clickCount++;
	lastClickTime = now;

	if (clickCount >= 10) {
		easterEggModal.classList.add('show');
		clickCount = 0;
	}
});

// 修改关闭彩蛋逻辑
easterEggClose.addEventListener('click', function() {
	easterEggModal.classList.remove('show');
	easterEggCloseDialog.classList.add('show');
});

// 专用关闭对话框确认按钮事件
easterEggCloseDialogConfirm.addEventListener('click', function() {
	easterEggCloseDialog.classList.remove('show');
});

// 点击对话框外部关闭专用关闭对话框
easterEggCloseDialog.addEventListener('click', function(e) {
	if (e.target === easterEggCloseDialog) {
		easterEggCloseDialog.classList.remove('show');
	}
});