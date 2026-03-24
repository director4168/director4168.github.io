<?php
define('IN_CHAT', true);
require_once '../config.php';

// 检查是否是管理员
if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    header("Location: ../login.php");
    exit;
}

// 获取统计数据
$stats = [
    'total_users' => $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
    'active_users' => $pdo->query("SELECT COUNT(*) FROM users WHERE status = 1")->fetchColumn(),
    'banned_users' => $pdo->query("SELECT COUNT(*) FROM users WHERE status = 0")->fetchColumn(),
    'total_messages' => $pdo->query("SELECT COUNT(*) FROM messages")->fetchColumn(),
    'banned_ips' => $pdo->query("SELECT COUNT(*) FROM ip_blacklist")->fetchColumn(),
    'today_messages' => $pdo->query("SELECT COUNT(*) FROM messages WHERE DATE(created_at) = CURDATE()")->fetchColumn(),
    'today_users' => $pdo->query("SELECT COUNT(DISTINCT user_id) FROM messages WHERE DATE(created_at) = CURDATE()")->fetchColumn()
];
?>

<!DOCTYPE html>
<html>
<head>
    <title>管理后台 - 在线聊天室</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
    <style>
        .sidebar {
            min-height: 100vh;
            background: #343a40;
            padding-top: 1rem;
        }
        .sidebar .nav-link {
            color: rgba(255,255,255,.75);
            padding: 1rem;
        }
        .sidebar .nav-link:hover {
            color: #fff;
            background: rgba(255,255,255,.1);
        }
        .sidebar .nav-link.active {
            color: #fff;
            background: #007bff;
        }
        .sidebar .nav-link i {
            margin-right: 10px;
        }
        .stat-card {
            border: none;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,.1);
            transition: transform .2s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-icon {
            font-size: 2.5rem;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- 侧边栏 -->
            <div class="col-md-2 px-0 sidebar">
                <div class="text-center mb-4">
                    <h4 class="text-white">管理后台</h4>
                </div>
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a class="nav-link active" href="index.php">
                            <i class="fas fa-tachometer-alt"></i> 仪表盘
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="users.php">
                            <i class="fas fa-users"></i> 用户管理
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="ip_blacklist.php">
                            <i class="fas fa-ban"></i> IP封禁
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="../chat.php">
                            <i class="fas fa-comments"></i> 返回聊天室
                        </a>
                    </li>
                </ul>
            </div>

            <!-- 主要内容区 -->
            <div class="col-md-10 p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>系统概况</h2>
                    <div class="text-muted">
                        <i class="far fa-clock"></i> 
                        <?php echo date('Y-m-d H:i:s'); ?>
                    </div>
                </div>

                <div class="row">
                    <!-- 总用户数 -->
                    <div class="col-md-3 mb-4">
                        <div class="card stat-card bg-primary text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title mb-0">总用户数</h6>
                                        <h2 class="mt-2 mb-0"><?php echo $stats['total_users']; ?></h2>
                                    </div>
                                    <i class="fas fa-users stat-icon"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 活跃用户 -->
                    <div class="col-md-3 mb-4">
                        <div class="card stat-card bg-success text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title mb-0">活跃用户</h6>
                                        <h2 class="mt-2 mb-0"><?php echo $stats['active_users']; ?></h2>
                                    </div>
                                    <i class="fas fa-user-check stat-icon"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 被封禁用户 -->
                    <div class="col-md-3 mb-4">
                        <div class="card stat-card bg-danger text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title mb-0">被封禁用户</h6>
                                        <h2 class="mt-2 mb-0"><?php echo $stats['banned_users']; ?></h2>
                                    </div>
                                    <i class="fas fa-user-slash stat-icon"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- IP黑名单 -->
                    <div class="col-md-3 mb-4">
                        <div class="card stat-card bg-warning text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title mb-0">IP黑名单</h6>
                                        <h2 class="mt-2 mb-0"><?php echo $stats['banned_ips']; ?></h2>
                                    </div>
                                    <i class="fas fa-ban stat-icon"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 总消息数 -->
                    <div class="col-md-3 mb-4">
                        <div class="card stat-card bg-info text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title mb-0">总消息数</h6>
                                        <h2 class="mt-2 mb-0"><?php echo $stats['total_messages']; ?></h2>
                                    </div>
                                    <i class="fas fa-comments stat-icon"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 今日消息数 -->
                    <div class="col-md-3 mb-4">
                        <div class="card stat-card bg-secondary text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title mb-0">今日消息数</h6>
                                        <h2 class="mt-2 mb-0"><?php echo $stats['today_messages']; ?></h2>
                                    </div>
                                    <i class="fas fa-comment-dots stat-icon"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 今日活跃用户 -->
                    <div class="col-md-3 mb-4">
                        <div class="card stat-card" style="background: #6f42c1; color: white;">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="card-title mb-0">今日活跃用户</h6>
                                        <h2 class="mt-2 mb-0"><?php echo $stats['today_users']; ?></h2>
                                    </div>
                                    <i class="fas fa-user-clock stat-icon"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html> 