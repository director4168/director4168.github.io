<?php
define('IN_CHAT', true);
require_once 'config.php';

// 检查用户是否登录
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

// 获取用户信息
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$current_user = $stmt->fetch();
?>

<!DOCTYPE html>
<html>
<head>
    <title>聊天室 - 在线聊天</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        .chat-container {
            height: calc(100vh - 2rem);
            background: #fff;
            border-radius: 15px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.15);
            overflow: hidden;
        }
        .chat-messages {
            height: calc(100% - 80px);
            overflow-y: auto;
            padding: 20px;
            background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
        }
        .message {
            margin-bottom: 20px;
            position: relative;
            clear: both;
            max-width: 80%;
        }
        .message-other {
            float: left;
        }
        .message-self {
            float: right;
        }
        .message .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            position: absolute;
            top: 0;
        }
        .message-other .avatar {
            left: -50px;
        }
        .message-self .avatar {
            right: -50px;
        }
        .message .message-content {
            display: inline-block;
            padding: 0 5px;
            width: 100%;
        }
        .message .bubble {
            padding: 12px 18px;
            border-radius: 20px;
            position: relative;
            word-wrap: break-word;
            box-shadow: 0 3px 8px rgba(0,0,0,0.08);
            transition: transform 0.2s;
            display: inline-block;
            max-width: 100%;
        }
        .message .bubble:hover {
            transform: translateY(-2px);
        }
        .message-other .bubble {
            float: left;
            background: #f1f3f5;
            color: #333;
            border-top-left-radius: 4px;
        }
        .message-self .bubble {
            float: right;
            background: #007bff;
            color: white;
            border-top-right-radius: 4px;
        }
        .message-self .bubble a {
            color: #fff !important;
            text-decoration: underline !important;
        }
        .message .time {
            font-size: 0.75em;
            color: #999;
            margin: 5px 0;
            clear: both;
            text-align: center;
        }
        .message .username {
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 5px;
            display: block;
            transition: color 0.2s;
        }
        .message .username:hover {
            text-decoration: underline;
        }
        .message-self .username {
            color: #0084ff;
            text-align: right;
            width: 100%;
        }
        .message-other .username {
            color: #1ed760;
            text-align: left;
        }
        .chat-input {
            padding: 1.2rem;
            background: #fff;
            border-top: 1px solid rgba(0,0,0,0.05);
            box-shadow: 0 -5px 15px rgba(0,0,0,0.03);
        }
        .chat-input form {
            max-width: 1200px;
            margin: 0 auto;
        }
        .emoji-picker-button {
            width: 45px;
            height: 45px;
            border-radius: 12px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            color: #666;
            background: #f8f9fa;
            border: 2px solid #eef1f5;
            transition: all 0.3s ease;
        }
        .emoji-picker-button:hover {
            background: #fff;
            border-color: #007bff;
            color: #007bff;
            transform: translateY(-1px);
        }
        #message-input {
            height: 45px;
            font-size: 0.95rem;
            padding: 0.8rem 1.2rem;
            border: 2px solid #eef1f5;
            border-radius: 12px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        #message-input:focus {
            border-color: #007bff;
            box-shadow: 0 2px 12px rgba(0,123,255,0.15);
        }
        .input-tips {
            position: absolute;
            right: 12px;
            bottom: -22px;
            font-size: 0.75rem;
            color: #999;
        }
        .btn-send {
            height: 45px;
            padding: 0 1.5rem;
            font-size: 0.95rem;
            border-radius: 12px;
            background: linear-gradient(45deg, #007bff, #0056b3);
            border: none;
            color: #fff;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        .btn-send:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,123,255,0.3);
            background: linear-gradient(45deg, #0056b3, #004494);
            color: #fff;
        }
        .btn-send:active {
            transform: translateY(1px);
        }
        .btn-send i {
            font-size: 0.9rem;
        }
        .emoji-panel {
            position: absolute;
            bottom: calc(100% + 10px);
            left: 0;
            background: #fff;
            border-radius: 15px;
            padding: 1rem;
            width: 320px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.15);
            border: 1px solid rgba(0,0,0,0.08);
            display: none;
            z-index: 1000;
        }
        .emoji-item {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        .emoji-item:hover {
            background: #f0f2f5;
            transform: scale(1.1);
        }
        .online-users {
            background: #fff;
            border-radius: 15px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .online-users .list-group-item {
            border: none;
            border-bottom: 1px solid #f0f2f5;
            padding: 15px;
            transition: background-color 0.2s;
        }
        .online-users .list-group-item:hover {
            background-color: #f8f9fa;
        }
        .online-users .list-group-item:last-child {
            border-bottom: none;
        }
        .user-card {
            background: #fff;
            border-radius: 15px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            padding: 25px;
            text-align: center;
            margin-bottom: 20px;
            transition: transform 0.2s;
        }
        .user-card:hover {
            transform: translateY(-5px);
        }
        .user-card .avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin-bottom: 15px;
            object-fit: cover;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: 3px solid #fff;
        }
        .emoji-picker-button {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: all 0.3s;
            border: 2px solid #eee;
        }
        .emoji-picker-button:hover {
            background: #f8f9fa;
            transform: scale(1.1);
        }
        #message-input {
            height: 45px;
            font-size: 1rem;
            padding: 10px 20px;
            border: 2px solid #eee;
            transition: all 0.3s;
        }
        #message-input:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.15);
        }
        .message-self .message-content {
            text-align: right;
        }
        .chat-messages {
            padding: 20px 60px;  /* 增加左右内边距，为头像留出空间 */
        }
        .admin-badge {
            display: inline-block;
            background: #ff3b30;
            color: white;
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 4px;
            margin-left: 5px;
        }
        .admin-badge i {
            margin-right: 3px;
            font-size: 11px;
        }
        .admin-badge:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(221, 36, 118, 0.4);
        }
        /* 针对右侧消息的管理员标识 */
        .message-self .admin-badge {
            background: linear-gradient(45deg, #0072ff, #00c6ff);
            box-shadow: 0 2px 8px rgba(0, 114, 255, 0.3);
        }
        .message-self .admin-badge:hover {
            box-shadow: 0 4px 12px rgba(0, 114, 255, 0.4);
        }
        /* 调整用户名容器的样式 */
        .message .username-container {
            display: inline-flex;
            align-items: center;
            margin-bottom: 5px;
            max-width: 100%;
            flex-wrap: wrap;
        }
        .message-self .username-container {
            justify-content: flex-end;
        }
        .message-other .username-container {
            justify-content: flex-start;
        }
        .location-text {
            font-size: 12px;
            color: #999;
            margin-left: 5px;
            font-weight: normal;
        }
        .message-self .location-text {
            margin-right: 5px;
        }
        /* 适配深色模式 */
        @media (prefers-color-scheme: dark) {
            .chat-input {
                background: #2d2d2d;
                border-top-color: rgba(255,255,255,0.1);
            }
            #message-input {
                background: #3d3d3d;
                border-color: #4d4d4d;
                color: #fff;
            }
            #message-input:focus {
                border-color: #0d6efd;
            }
            .emoji-picker-button {
                background: #3d3d3d;
                border-color: #4d4d4d;
                color: #fff;
            }
            .emoji-picker-button:hover {
                background: #4d4d4d;
                border-color: #0d6efd;
            }
            .emoji-panel {
                background: #2d2d2d;
                border-color: rgba(255,255,255,0.1);
            }
            .emoji-item:hover {
                background: #3d3d3d;
            }
            .input-tips {
                color: #777;
            }
        }
        /* 加密水印 */
        .encrypted-watermark {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.03;
            background-image: url('data:image/svg+xml;base64,<?php 
                // 生成加密的水印内容
                $watermark = "www.3qpd.com";
                $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">'
                     . '<text x="50%" y="50%" font-family="Arial" font-size="24" '
                     . 'fill="#000" text-anchor="middle" transform="rotate(-45, 100, 100)">'
                     . htmlspecialchars($watermark)
                     . '</text></svg>';
                echo base64_encode($svg);
            ?>');
            background-repeat: repeat;
            transform: rotate(-45deg);
            transform-origin: center;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }

        /* 防止水印被开发者工具修改 */
        .encrypted-watermark::before,
        .encrypted-watermark::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        /* 添加额外的保护层 */
        body::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            background: transparent;
        }
    </style>
</head>
<body class="py-3">
    <!-- 添加加密水印 -->
    <div class="encrypted-watermark"></div>
    <input type="hidden" id="current-user-id" value="<?php echo $_SESSION['user_id']; ?>">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-3">
                <!-- 用户信息卡片 -->
                <div class="user-card">
                    <img src="<?php echo $current_user['avatar'] ?: 'assets/default-avatar.png'; ?>" 
                         class="avatar" alt="头像">
                    <h5 class="mb-2">
                        <?php echo htmlspecialchars($current_user['username']); ?>
                        <?php if ($current_user['is_admin']): ?>
                            <span class="admin-badge"><i class="fas fa-shield-alt"></i>管理员</span>
                        <?php endif; ?>
                    </h5>
                    <p class="text-muted mb-3"><?php echo htmlspecialchars($current_user['signature'] ?: '这个人很懒，什么都没写~'); ?></p>
                    <div class="d-grid gap-2">
                        <a href="profile.php" class="btn btn-outline-primary btn-sm">编辑资料</a>
                        <?php if ($current_user['is_admin']): ?>
                            <a href="admin/" class="btn btn-outline-danger btn-sm">管理后台</a>
                        <?php endif; ?>
                        <a href="logout.php" class="btn btn-outline-secondary btn-sm">退出登录</a>
                    </div>
                </div>
                
                <!-- 在线用户列表 -->
                <div class="online-users">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0"><i class="fas fa-users me-2"></i>在线用户</h6>
                    </div>
                    <div class="list-group list-group-flush" id="online-users">
                        <!-- 通过Ajax动态加载 -->
                    </div>
                </div>
            </div>
            
            <div class="col-md-9">
                <div class="chat-container">
                    <div id="chat-messages" class="chat-messages">
                        <!-- 消息内容通过Ajax动态加载 -->
                    </div>
                    <div class="chat-input">
                        <form id="message-form" class="d-flex align-items-center gap-2">
                            <div class="position-relative">
                                <button type="button" class="btn emoji-picker-button">
                                    <i class="far fa-smile"></i>
                                </button>
                                <div class="emoji-panel">
                                    <!-- 表情列表 -->
                                    <span class="emoji-item">😊</span>
                                    <span class="emoji-item">😂</span>
                                    <span class="emoji-item">🤣</span>
                                    <span class="emoji-item">😍</span>
                                    <span class="emoji-item">🥰</span>
                                    <span class="emoji-item">😘</span>
                                    <span class="emoji-item">😅</span>
                                    <span class="emoji-item">😁</span>
                                    <span class="emoji-item">🤔</span>
                                    <span class="emoji-item">🤗</span>
                                    <span class="emoji-item">😉</span>
                                    <span class="emoji-item">😎</span>
                                    <span class="emoji-item">😡</span>
                                    <span class="emoji-item">😭</span>
                                    <span class="emoji-item">😱</span>
                                    <span class="emoji-item">👍</span>
                                    <span class="emoji-item">👎</span>
                                    <span class="emoji-item">❤️</span>
                                    <span class="emoji-item">💔</span>
                                    <span class="emoji-item">🎉</span>
                                </div>
                            </div>
                            <div class="flex-grow-1 position-relative">
                                <input type="text" id="message-input" class="form-control" 
                                       placeholder="说点什么吧..." required>
                                <div class="input-tips">按Enter发送，Shift+Enter换行</div>
                            </div>
                            <button type="submit" class="btn btn-send">
                                <i class="fas fa-paper-plane"></i>
                                <span class="ms-1">发送</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 用户名片模态框 -->
    <div class="modal fade" id="userModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">用户信息</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <!-- 用户信息通过Ajax加载 -->
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="js/chat.js"></script>
    <script>
    // 防止水印被删除或修改
    (function() {
        const protectWatermark = () => {
            const watermark = document.querySelector('.encrypted-watermark');
            if (!watermark || watermark.style.display === 'none' || 
                watermark.style.opacity !== '' || watermark.style.visibility === 'hidden') {
                location.reload();
            }
        };

        // 定期检查水印是否存在
        setInterval(protectWatermark, 1000);

        // 监听DOM变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    protectWatermark();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });

        // 禁用右键菜单
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        // 禁用开发者工具快捷键
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J
                (e.ctrlKey && e.shiftKey && e.key === 'C') || // Ctrl+Shift+C
                (e.key === 'F12')) {                          // F12
                e.preventDefault();
            }
        });
    })();
    </script>
</body>
</html> 