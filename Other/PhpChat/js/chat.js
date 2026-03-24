$(document).ready(function() {
    let lastMessageId = 0;
    let isScrolledToBottom = true;
    let picker = null;
    
    // 检测是否滚动到底部
    $('#chat-messages').scroll(function() {
        const element = $(this)[0];
        isScrolledToBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    });
    
    // 定期获取新消息
    function fetchMessages() {
        $.get('api/messages.php', { last_id: lastMessageId })
            .done(function(response) {
                if (response.messages && response.messages.length > 0) {
                    response.messages.forEach(function(message) {
                        appendMessage(message);
                        lastMessageId = Math.max(lastMessageId, message.id);
                    });
                    if (isScrolledToBottom) {
                        scrollToBottom();
                    }
                }
            })
            .fail(function(xhr, status, error) {
                console.error('获取消息失败:', error);
            });
    }
    
    // 添加消息到聊天窗口
    function appendMessage(message) {
        const isSelf = message.user_id == $('#current-user-id').val();
        const html = `
            <div class="message ${isSelf ? 'message-self' : 'message-other'}" data-message-id="${message.id}">
                <img src="${message.avatar || 'assets/default-avatar.png'}" class="avatar" data-user-id="${message.user_id}">
                <div class="message-content">
                    <span class="username" data-user-id="${message.user_id}">
                        ${message.nickname || message.username}
                        ${message.is_admin === '1' ? '<span class="admin-badge"><i class="fas fa-shield-alt"></i>管理员</span>' : ''}
                        <small class="text-muted location-text">${message.location ? `(${message.location})` : ''}</small>
                    </span>
                    <div class="bubble">
                        ${formatMessage(message.content)}
                    </div>
                    <div class="time small text-muted">
                        ${new Date(message.created_at).toLocaleString()}
                    </div>
                </div>
            </div>
        `;
        const $message = $(html);
        $('#chat-messages').append($message);
        $message.hide().fadeIn(200);
        if (isScrolledToBottom) {
            scrollToBottom();
        }
    }
    
    // 格式化消息内容
    function formatMessage(content) {
        // 转义HTML
        content = escapeHtml(content);
        // 将URL转换为可点击的链接
        content = content.replace(
            /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g, 
            '<a href="$1" target="_blank">$1</a>'
        );
        // 支持换行符
        content = content.replace(/\n/g, '<br>');
        // 支持表情显示
        return content;
    }
    
    // 发送消息
    $('#message-form').submit(function(e) {
        e.preventDefault();
        const content = $('#message-input').val().trim();
        
        if (content) {
            console.log('Sending message:', content); // 添加调试日志
            
            $.post('api/messages.php', { content: content })
                .done(function(response) {
                    console.log('Server response:', response); // 添加调试日志
                    if (response.success) {
                        $('#message-input').val('');
                        fetchMessages();
                        scrollToBottom();
                    } else {
                        alert(response.error || '发送失败');
                    }
                })
                .fail(function(xhr, status, error) {
                    console.error('发送失败:', error);
                    console.error('状态码:', xhr.status);
                    console.error('响应文本:', xhr.responseText);
                    alert('发送失败，请检查网络连接');
                });
        }
    });
    
    // 更新在线用户列表
    function updateOnlineUsers() {
        $.get('api/users.php')
            .done(function(response) {
                if (response.users) {
                    const html = response.users.map(user => `
                        <a href="#" class="list-group-item list-group-item-action d-flex align-items-center" 
                           data-user-id="${user.id}">
                            <img src="${user.avatar || 'assets/default-avatar.png'}" 
                                 class="rounded-circle me-2" style="width: 32px; height: 32px;">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center">
                                    <span class="fw-bold">${user.nickname || user.username}</span>
                                    ${user.is_admin === '1' ? '<span class="admin-badge ms-2"><i class="fas fa-shield-alt"></i>管理员</span>' : ''}
                                    <small class="text-muted ms-2">${user.location ? `(${user.location})` : ''}</small>
                                </div>
                                <small class="text-muted">${user.signature || '这个人很懒，什么都没写~'}</small>
                            </div>
                        </a>
                    `).join('');
                    $('#online-users').html(html);
                }
            })
            .fail(function(error) {
                console.error('获取在线用户失败:', error);
            });
    }
    
    // 显示用户名片
    $(document).on('click', '.username, .avatar, .list-group-item', function(e) {
        e.preventDefault();
        const userId = $(this).data('user-id');
        $.get('api/users.php', { user_id: userId })
            .done(function(response) {
                if (response.user) {
                    const user = response.user;
                    const html = `
                        <div class="text-center">
                            <img src="${user.avatar || 'assets/default-avatar.png'}" 
                                 class="rounded-circle mb-3" style="width: 100px; height: 100px;">
                            <h5>${user.nickname || user.username}</h5>
                            <p class="text-muted">${user.signature || '这个人很懒，什么都没写~'}</p>
                            <p>注册时间：${new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                    `;
                    $('.modal-body').html(html);
                    $('#userModal').modal('show');
                }
            });
    });
    
    // 表情按钮点击事件
    $('.emoji-picker-button').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('.emoji-panel').toggle();
    });
    
    // 选择表情
    $(document).on('click', '.emoji-item', function(e) {
        e.preventDefault();
        const emoji = $(this).text();
        const input = $('#message-input');
        const cursorPos = input[0].selectionStart;
        const text = input.val();
        const newText = text.slice(0, cursorPos) + emoji + text.slice(cursorPos);
        input.val(newText);
        input.focus();
        input[0].setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
        $('.emoji-panel').hide();
    });
    
    // 点击其他地方关闭表情面板
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.emoji-picker-button, .emoji-panel').length) {
            $('.emoji-panel').hide();
        }
    });
    
    // 转义HTML特殊字符
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 滚动到底部
    function scrollToBottom() {
        const chatMessages = $('#chat-messages');
        chatMessages.scrollTop(chatMessages[0].scrollHeight);
    }
    
    // 初始化
    fetchMessages();
    setInterval(fetchMessages, 3000);  // 每3秒更新一次消息
    updateOnlineUsers();
    setInterval(updateOnlineUsers, 15000);  // 每15秒更新一次在线用户
    scrollToBottom();
    
    // 更新用户最后活动时间
    setInterval(function() {
        $.post('api/users.php', { action: 'heartbeat' });
    }, 60000);  // 每分钟更新一次
    
    // 支持按Enter发送消息，按Shift+Enter换行
    $('#message-input').keydown(function(e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            $('#message-form').submit();
        }
    });
    
    // 更新用户位置信息
    $.get('api/update_location.php');
}); 