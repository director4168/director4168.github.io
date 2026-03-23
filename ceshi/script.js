class ChatApp {
    constructor() {
        this.supabase = null;
        this.channel = null;
        this.username = '';
        this.userId = null;
        this.isConnected = false;
        this.onlineUsers = new Set();
        
        this.init();
    }
    
    init() {
        // 从 localStorage 加载配置
        this.loadConfig();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化 UI
        this.updateUI();
    }
    
    loadConfig() {
        const savedUrl = localStorage.getItem('supabaseUrl');
        const savedKey = localStorage.getItem('supabaseAnonKey');
        
        if (savedUrl && savedKey) {
            document.getElementById('supabaseUrl').value = savedUrl;
            document.getElementById('anonKey').value = savedKey;
            this.initSupabase(savedUrl, savedKey);
        }
    }
    
    saveConfig() {
        const url = document.getElementById('supabaseUrl').value.trim();
        const key = document.getElementById('anonKey').value.trim();
        
        if (!url || !key) {
            this.showNotification('请输入 Supabase URL 和 Anon Key', 'error');
            return false;
        }
        
        localStorage.setItem('supabaseUrl', url);
        localStorage.setItem('supabaseAnonKey', key);
        this.showNotification('配置已保存', 'success');
        return true;
    }
    
    async testConnection() {
        const url = document.getElementById('supabaseUrl').value.trim();
        const key = document.getElementById('anonKey').value.trim();
        
        if (!url || !key) {
            this.showNotification('请输入 Supabase URL 和 Anon Key', 'error');
            return false;
        }
        
        try {
            const tempSupabase = window.supabase.createClient(url, key);
            const { data, error } = await tempSupabase.from('_dummy').select('*').limit(1);
            
            if (error && error.code !== 'PGRST116') { // PGRST116 是表不存在的错误，说明连接成功
                throw error;
            }
            
            this.showNotification('连接测试成功！', 'success');
            return true;
        } catch (error) {
            this.showNotification('连接失败：' + error.message, 'error');
            return false;
        }
    }
    
    async initSupabase(url, key) {
        try {
            this.supabase = window.supabase.createClient(url, key);
            this.userId = this.generateUserId();
            await this.connectRealtime();
            this.isConnected = true;
            this.updateUI();
            this.showNotification('已连接到 Supabase', 'success');
        } catch (error) {
            this.showNotification('连接失败：' + error.message, 'error');
        }
    }
    
    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    async connectRealtime() {
        if (!this.supabase) return;
        
        // 断开旧连接
        if (this.channel) {
            await this.supabase.removeChannel(this.channel);
        }
        
        // 创建新频道
        this.channel = this.supabase.channel('chat-room', {
            config: {
                broadcast: { self: true }
            }
        });
        
        // 监听新消息
        this.channel.on('broadcast', { event: 'message' }, (payload) => {
            this.handleNewMessage(payload);
        }).on('broadcast', { event: 'user-join' }, (payload) => {
            this.handleUserJoin(payload);
        }).on('broadcast', { event: 'user-leave' }, (payload) => {
            this.handleUserLeave(payload);
        }).on('presence', { event: 'sync' }, () => {
            this.handlePresenceSync();
        }).on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('用户加入:', newPresences);
        }).on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('用户离开:', leftPresences);
        });
        
        // 订阅
        const presenceTrackStatus = await this.channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // 加入在线用户列表
                await this.channel.track({
                    user: this.userId,
                    username: this.username || '游客',
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    
    handleNewMessage(payload) {
        const message = payload.payload;
        this.addMessageToUI(message);
    }
    
    handleUserJoin(payload) {
        const user = payload.payload;
        this.onlineUsers.add(user.userId);
        this.updateOnlineUsers();
    }
    
    handleUserLeave(payload) {
        const user = payload.payload;
        this.onlineUsers.delete(user.userId);
        this.updateOnlineUsers();
    }
    
    handlePresenceSync() {
        if (!this.channel) return;
        
        const state = this.channel.presenceState();
        this.onlineUsers = new Set(Object.keys(state));
        this.updateOnlineUsers();
    }
    
    async sendMessage(message) {
        if (!this.isConnected || !this.channel || !this.username) {
            this.showNotification('请先设置用户名并连接到 Supabase', 'warning');
            return;
        }
        
        const messageData = {
            id: Date.now(),
            userId: this.userId,
            username: this.username,
            text: message,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        try {
            const res = await this.channel.send({
                type: 'broadcast',
                event: 'message',
                payload: messageData
            });
            
            if (res === 'ok') {
                this.addMessageToUI(messageData, true);
                document.getElementById('messageInput').value = '';
            }
        } catch (error) {
            this.showNotification('发送消息失败：' + error.message, 'error');
        }
    }
    
    setUsername() {
        const username = document.getElementById('usernameInput').value.trim();
        if (!username) {
            this.showNotification('请输入用户名', 'warning');
            return;
        }
        
        this.username = username;
        document.getElementById('usernameDisplay').textContent = username;
        
        // 切换 UI
        document.getElementById('usernameSection').style.display = 'none';
        document.getElementById('messageSection').style.display = 'block';
        document.getElementById('messageInput').disabled = false;
        document.getElementById('sendBtn').disabled = false;
        
        // 更新在线状态
        if (this.channel) {
            this.channel.track({
                user: this.userId,
                username: username,
                timestamp: new Date().toISOString()
            });
        }
        
        this.showNotification(`欢迎 ${username}！`, 'success');
        this.addSystemMessage(`用户 ${username} 加入了聊天`);
    }
    
    addMessageToUI(message, isSelf = false) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSelf ? 'user' : 'other'}`;
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-sender">${message.username}</span>
                <span class="message-time">${message.time}</span>
            </div>
            <div class="message-text">${this.escapeHtml(message.text)}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    addSystemMessage(text) {
        const messagesContainer = document.getElementById('messagesContainer');
        const systemDiv = document.createElement('div');
        systemDiv.className = 'system-message';
        systemDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
        messagesContainer.appendChild(systemDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    updateOnlineUsers() {
        const usersList = document.getElementById('usersList');
        const userCount = document.getElementById('userCount');
        
        usersList.innerHTML = '';
        userCount.textContent = this.onlineUsers.size;
        
        this.onlineUsers.forEach(userId => {
            const userTag = document.createElement('div');
            userTag.className = 'user-tag';
            if (userId === this.userId) {
                userTag.classList.add('self');
                userTag.innerHTML = `<i class="fas fa-user"></i> 你`;
            } else {
                userTag.innerHTML = `<i class="fas fa-user"></i> 用户 ${userId.substring(0, 6)}`;
            }
            usersList.appendChild(userTag);
        });
    }
    
    updateUI() {
        const statusIndicator = document.getElementById('statusIndicator');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (this.isConnected) {
            statusIndicator.innerHTML = '<i class="fas fa-circle" style="color: #10b981;"></i> 已连接';
            messageInput.disabled = false;
            sendBtn.disabled = false;
        } else {
            statusIndicator.innerHTML = '<i class="fas fa-circle" style="color: #ef4444;"></i> 未连接';
            messageInput.disabled = true;
            sendBtn.disabled = true;
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    bindEvents() {
        // 配置折叠
        document.getElementById('configToggle').addEventListener('click', () => {
            const content = document.getElementById('configContent');
            content.classList.toggle('open');
        });
        
        // 测试连接
        document.getElementById('testConnectionBtn').addEventListener('click', () => {
            this.testConnection();
        });
        
        // 保存配置
        document.getElementById('saveConfigBtn').addEventListener('click', async () => {
            if (this.saveConfig()) {
                const url = document.getElementById('supabaseUrl').value.trim();
                const key = document.getElementById('anonKey').value.trim();
                await this.initSupabase(url, key);
            }
        });
        
        // 设置用户名
        document.getElementById('setUsernameBtn').addEventListener('click', () => {
            this.setUsername();
        });
        
        document.getElementById('usernameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.setUsername();
            }
        });
        
        // 发送消息
        document.getElementById('sendBtn').addEventListener('click', () => {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (message) {
                this.sendMessage(message);
            }
        });
        
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const input = document.getElementById('messageInput');
                const message = input.value.trim();
                if (message) {
                    this.sendMessage(message);
                }
            }
        });
        
        // 一键部署
        document.getElementById('deployBtn').addEventListener('click', () => {
            window.open('https://vercel.com/import/git?s=https://github.com/your-repo/chat-app', '_blank');
        });
        
        // 自动加载保存的配置
        document.addEventListener('DOMContentLoaded', () => {
            const savedUrl = localStorage.getItem('supabaseUrl');
            const savedKey = localStorage.getItem('supabaseAnonKey');
            if (savedUrl && savedKey) {
                this.initSupabase(savedUrl, savedKey);
            }
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});
