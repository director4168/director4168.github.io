<?php
if (file_exists('config.php')) {
    die('聊天室已经安装，如需重新安装请先删除 config.php 文件。');
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $db_config = [
        'host' => $_POST['db_host'],
        'username' => $_POST['db_username'],
        'password' => $_POST['db_password'],
        'database' => $_POST['db_database']
    ];
    
    $admin_info = [
        'username' => $_POST['admin_username'],
        'password' => $_POST['admin_password'],
        'nickname' => $_POST['admin_nickname']
    ];
    
    try {
        // 连接数据库
        $pdo = new PDO(
            "mysql:host={$db_config['host']};charset=utf8mb4",
            $db_config['username'],
            $db_config['password']
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // 创建数据库
        $pdo->exec("CREATE DATABASE IF NOT EXISTS {$db_config['database']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE {$db_config['database']}");
        
        // 创建用户表
        $pdo->exec("CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            nickname VARCHAR(50),
            avatar VARCHAR(255),
            signature TEXT,
            ip VARCHAR(45),
            status TINYINT DEFAULT 1 COMMENT '1:正常,0:禁用',
            is_admin TINYINT DEFAULT 0,
            custom_location VARCHAR(100) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");
        
        // 创建消息表
        $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        
        // 创建用户位置表
        $pdo->exec("CREATE TABLE IF NOT EXISTS user_locations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            city VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        
        // 创建IP黑名单表
        $pdo->exec("CREATE TABLE IF NOT EXISTS ip_blacklist (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip VARCHAR(45) NOT NULL,
            reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY (ip)
        )");
        
        // 创建管理员账号
        $admin_password = password_hash($admin_info['password'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, password, nickname, is_admin) VALUES (?, ?, ?, 1)");
        $stmt->execute([$admin_info['username'], $admin_password, $admin_info['nickname']]);
        
        // 创建必要的目录
        $directories = [
            'uploads',
            'uploads/avatars',
            'assets'
        ];
        
        foreach ($directories as $dir) {
            if (!file_exists($dir)) {
                mkdir($dir, 0777, true);
            }
        }
        
        // 生成随机密钥
        $secret_key = bin2hex(random_bytes(32));
        
        // 创建配置文件
        $config_content = <<<EOT
<?php
// 安全检查：防止直接访问PHP文件
defined('IN_CHAT') or exit('Access Denied');

// 开启session
session_start();

// 设置时区
date_default_timezone_set('Asia/Shanghai');

// 数据库配置
\$db_config = [
    'host' => '{$db_config['host']}',
    'username' => '{$db_config['username']}',
    'password' => '{$db_config['password']}',
    'database' => '{$db_config['database']}'
];

// 站点配置
\$site_config = [
    'name' => '在线聊天室',
    'url' => (isset(\$_SERVER['HTTPS']) && \$_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://{$_SERVER['HTTP_HOST']}",
    'upload_path' => __DIR__ . '/uploads',
    'avatar_path' => __DIR__ . '/uploads/avatars',
    'max_upload_size' => 5 * 1024 * 1024, // 5MB
    'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif'],
    'online_timeout' => 300, // 5分钟未活动视为离线
    'messages_per_page' => 50,
    'secret_key' => '$secret_key' // 用于加密等操作的密钥
];

// 错误报告设置
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// 数据库连接
try {
    \$pdo = new PDO(
        "mysql:host={\$db_config['host']};dbname={\$db_config['database']};charset=utf8mb4",
        \$db_config['username'],
        \$db_config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]
    );
} catch(PDOException \$e) {
    error_log("数据库连接失败: " . \$e->getMessage());
    die("系统维护中，请稍后再试...");
}

// 辅助函数
function is_ajax_request() {
    return isset(\$_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower(\$_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}

function get_client_ip() {
    \$ip = '';
    if (isset(\$_SERVER['HTTP_CLIENT_IP'])) {
        \$ip = \$_SERVER['HTTP_CLIENT_IP'];
    } elseif (isset(\$_SERVER['HTTP_X_FORWARDED_FOR'])) {
        \$ip = \$_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (isset(\$_SERVER['REMOTE_ADDR'])) {
        \$ip = \$_SERVER['REMOTE_ADDR'];
    }
    return \$ip;
}

function check_login() {
    if (!isset(\$_SESSION['user_id'])) {
        if (is_ajax_request()) {
            header('Content-Type: application/json');
            die(json_encode(['error' => '未登录']));
        } else {
            header('Location: login.php');
            exit;
        }
    }
}

// 定义常量
define('IN_CHAT', true);
define('UPLOAD_PATH', \$site_config['upload_path']);
define('AVATAR_PATH', \$site_config['avatar_path']);
EOT;
        
        // 写入配置文件
        if (file_put_contents('config.php', $config_content)) {
            // 设置文件权限为640（所有者可读写，组可读，其他人无权限）
            chmod('config.php', 0640);
        } else {
            throw new Exception("无法创建配置文件");
        }
        
        $success = "安装成功！请删除 install.php 文件以确保安全。";
    } catch(PDOException $e) {
        $error = "安装失败: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>安装 - 在线聊天室</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow-sm">
                    <div class="card-header">
                        <h4 class="mb-0">在线聊天室 - 安装向导</h4>
                    </div>
                    <div class="card-body">
                        <?php if (isset($success)): ?>
                            <div class="alert alert-success">
                                <?php echo $success; ?>
                                <hr>
                                <p class="mb-0">
                                    管理员账号：<?php echo htmlspecialchars($admin_info['username']); ?><br>
                                    管理员密码：<?php echo htmlspecialchars($admin_info['password']); ?>
                                </p>
                                <hr>
                                <a href="login.php" class="btn btn-primary">前往登录</a>
                            </div>
                        <?php elseif (isset($error)): ?>
                            <div class="alert alert-danger"><?php echo $error; ?></div>
                        <?php endif; ?>

                        <?php if (!isset($success)): ?>
                        <form method="POST" class="needs-validation" novalidate>
                            <h5 class="mb-3">数据库配置</h5>
                            <div class="mb-3">
                                <label class="form-label">数据库主机</label>
                                <input type="text" name="db_host" class="form-control" value="localhost" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">数据库用户名</label>
                                <input type="text" name="db_username" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">数据库密码</label>
                                <input type="password" name="db_password" class="form-control">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">数据库名</label>
                                <input type="text" name="db_database" class="form-control" value="chat_room" required>
                            </div>

                            <hr class="my-4">

                            <h5 class="mb-3">管理员账号设置</h5>
                            <div class="mb-3">
                                <label class="form-label">管理员用户名</label>
                                <input type="text" name="admin_username" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">管理员密码</label>
                                <input type="password" name="admin_password" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">管理员昵称</label>
                                <input type="text" name="admin_nickname" class="form-control" value="管理员" required>
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">开始安装</button>
                            </div>
                        </form>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    // 表单验证
    (function () {
        'use strict'
        var forms = document.querySelectorAll('.needs-validation')
        Array.prototype.slice.call(forms)
            .forEach(function (form) {
                form.addEventListener('submit', function (event) {
                    if (!form.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    }
                    form.classList.add('was-validated')
                }, false)
            })
    })()
    </script>
</body>
</html> 