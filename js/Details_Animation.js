// (C) 2026 director_Carter All Rights Reserved.
// https://director4168.github.io
// 本JS与网站一同开源，开源协议MPL-2.0
// 折叠系统 - 支持新版 collapse-card 和旧版 details 元素

/**
 * 创建 ripple 效果
 * @param {HTMLElement} header - 折叠头部元素
 * @param {MouseEvent} event - 点击事件
 */
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
    
    // 记录点击位置到CSS变量，用于背景色扩散动画
    const relX = ((event.clientX - rect.left) / rect.width) * 100;
    const relY = ((event.clientY - rect.top) / rect.height) * 100;
    header.style.setProperty('--ripple-x', relX + '%');
    header.style.setProperty('--ripple-y', relY + '%');
    
    header.appendChild(ripple);
    
    // 动画结束后移除
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

/**
 * 切换折叠状态（新版 collapse-card）
 * @param {HTMLElement} header - 折叠头部元素
 * @param {MouseEvent} event - 点击事件（可选，用于 ripple 效果）
 */
function toggleCollapse(header, event) {
    const isActive = header.classList.contains('active');
    
    // 创建 ripple 效果
    if (event) {
        createCollapseRipple(header, event);
    }
    
    // 切换激活状态
    header.classList.toggle('active');
    
    // 切换内容展开
    const body = header.nextElementSibling;
    if (body) {
        if (isActive) {
            // 折叠：先设置当前高度，再过渡到0
            body.style.maxHeight = body.scrollHeight + 'px';
            requestAnimationFrame(() => {
                body.classList.remove('open');
                body.style.maxHeight = '0';
            });
        } else {
            // 展开：设置实际高度
            body.classList.add('open');
            body.style.maxHeight = body.scrollHeight + 'px';
            
            // 动画结束后移除固定高度，让内容自由伸缩
            body.addEventListener('transitionend', function handler() {
                if (body.classList.contains('open')) {
                    body.style.maxHeight = 'none';
                }
                body.removeEventListener('transitionend', handler);
            });
        }
    }
}

/**
 * 初始化新版折叠组件
 */
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

/**
 * 初始化旧版 details 折叠（兼容）
 */
function initDetailsAnimation() {
    const allDetails = document.querySelectorAll('details');
    allDetails.forEach(details => {
        const wrapper = details.querySelector('.details-animated-wrapper');
        const summary = details.querySelector('summary');
        if (!wrapper || !summary) return;
        
        details.open = false;
        wrapper.style.display = 'grid';
        wrapper.style.gridTemplateRows = '0fr';
        wrapper.style.transition = 'grid-template-rows 0.4s ease-out';
        
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initCollapse();
    initDetailsAnimation();
});