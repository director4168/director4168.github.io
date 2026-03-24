<?php
define('IN_CHAT', true);
require_once '../config.php';

// 检查是否是管理员
if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    header("Location: ../login.php");
    exit;
}

// 处理用户操作
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = (int)$_POST['user_id'];
    $action = $_POST['action'];
    
    switch ($action) {
        case 'ban':
            $stmt = $pdo->prepare("UPDATE users SET status = 0 WHERE id = ?");
            $stmt->execute([$user_id]);
            break;
            
        case 'unban':
            $stmt = $pdo->prepare("UPDATE users SET status = 1 WHERE id = ?");
            $stmt->execute([$user_id]);
            break;
            
        case 'delete':
            $stmt = $pdo->prepare("DELETE FROM messages WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            break;
            
        case 'ban_ip':
            $stmt = $pdo->prepare("SELECT ip FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            $ip = $stmt->fetchColumn();
            
            if ($ip) {
                $stmt = $pdo->prepare("INSERT INTO ip_blacklist (ip, reason) VALUES (?, ?)");
                $stmt->execute([$ip, "管理员封禁"]);
            }
            break;
            
        case 'update_location':
            $custom_location = trim($_POST['custom_location']);
            $stmt = $pdo->prepare("UPDATE users SET custom_location = ? WHERE id = ?");
            $stmt->execute([$custom_location, $user_id]);
            break;
    }
}

// 获取用户列表
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$per_page = 20;
$offset = ($page - 1) * $per_page;

$total_users = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$total_pages = ceil($total_users / $per_page);

$stmt = $pdo->query("
    SELECT * FROM users 
    ORDER BY created_at DESC 
    LIMIT $per_page OFFSET $offset
");
$users = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html>
<head>
    <title>用户管理 - 在线聊天室</title>
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
        .user-table {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,.1);
        }
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }
        .table > :not(caption) > * > * {
            padding: 1rem;
        }
        .status-badge {
            padding: 0.5em 1em;
            border-radius: 20px;
            font-size: 0.85em;
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
                        <a class="nav-link" href="index.php">
                            <i class="fas fa-tachometer-alt"></i> 仪表盘
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="users.php">
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
                    <h2>用户管理</h2>
                    <div class="text-muted">
                        <i class="far fa-clock"></i> 
                        <?php echo date('Y-m-d H:i:s'); ?>
                    </div>
                </div>

                <div class="user-table">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>头像</th>
                                    <th>用户名</th>
                                    <th>昵称</th>
                                    <th>IP</th>
                                    <th>状态</th>
                                    <th>注册时间</th>
                                    <th>最后登录</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($users as $user): ?>
                                <tr>
                                    <td><?php echo $user['id']; ?></td>
                                    <td>
                                        <img src="<?php echo $user['avatar'] ? '../' . $user['avatar'] : '../assets/default-avatar.png'; ?>" 
                                             class="user-avatar">
                                    </td>
                                    <td><?php echo htmlspecialchars($user['username']); ?></td>
                                    <td><?php echo htmlspecialchars($user['nickname']); ?></td>
                                    <td><?php echo $user['ip']; ?></td>
                                    <td>
                                        <?php if ($user['status'] == 1): ?>
                                            <span class="status-badge bg-success">正常</span>
                                        <?php else: ?>
                                            <span class="status-badge bg-danger">禁用</span>
                                        <?php endif; ?>
                                    </td>
                                    <td><?php echo $user['created_at']; ?></td>
                                    <td><?php echo $user['last_login']; ?></td>
                                    <td>
                                        <div class="btn-group">
                                            <a href="user_messages.php?user_id=<?php echo $user['id']; ?>" 
                                               class="btn btn-sm btn-info">
                                                <i class="fas fa-comments"></i>
                                            </a>
                                            <?php if ($user['status'] == 1): ?>
                                                <button type="button" class="btn btn-sm btn-warning" 
                                                        onclick="banUser(<?php echo $user['id']; ?>)">
                                                    <i class="fas fa-user-slash"></i>
                                                </button>
                                            <?php else: ?>
                                                <button type="button" class="btn btn-sm btn-success" 
                                                        onclick="unbanUser(<?php echo $user['id']; ?>)">
                                                    <i class="fas fa-user-check"></i>
                                                </button>
                                            <?php endif; ?>
                                            <button type="button" class="btn btn-sm btn-danger" 
                                                    onclick="deleteUser(<?php echo $user['id']; ?>)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                            <button type="button" class="btn btn-sm btn-dark" 
                                                    onclick="banIP(<?php echo $user['id']; ?>)">
                                                <i class="fas fa-ban"></i>
                                            </button>
                                            <button type="button" class="btn btn-sm btn-primary" 
                                                    onclick="editLocation(<?php echo $user['id']; ?>, '<?php echo htmlspecialchars($user['custom_location'] ?? ''); ?>')">
                                                <i class="fas fa-map-marker-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 分页 -->
                <?php if ($total_pages > 1): ?>
                <nav class="mt-4">
                    <ul class="pagination justify-content-center">
                        <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                            <li class="page-item <?php echo $i == $page ? 'active' : ''; ?>">
                                <a class="page-link" href="?page=<?php echo $i; ?>"><?php echo $i; ?></a>
                            </li>
                        <?php endfor; ?>
                    </ul>
                </nav>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <div class="modal fade" id="locationModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">编辑用户位置</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="locationForm" method="POST">
                        <input type="hidden" name="action" value="update_location">
                        <input type="hidden" name="user_id" id="locationUserId">
                        <div class="mb-3">
                            <label class="form-label">自定义位置</label>
                            <input type="text" name="custom_location" id="customLocation" 
                                   class="form-control" placeholder="例如：火星">
                            <small class="text-muted">留空则使用系统自动检测的位置</small>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary">保存</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    function banUser(userId) {
        if (confirm('确定要封禁该用户吗？')) {
            submitAction(userId, 'ban');
        }
    }

    function unbanUser(userId) {
        if (confirm('确定要解封该用户吗？')) {
            submitAction(userId, 'unban');
        }
    }

    function deleteUser(userId) {
        if (confirm('确定要删除该用户吗？此操作不可恢复！')) {
            submitAction(userId, 'delete');
        }
    }

    function banIP(userId) {
        if (confirm('确定要封禁该用户的IP吗？')) {
            submitAction(userId, 'ban_ip');
        }
    }

    function editLocation(userId, currentLocation) {
        document.getElementById('locationUserId').value = userId;
        document.getElementById('customLocation').value = currentLocation || '';
        new bootstrap.Modal(document.getElementById('locationModal')).show();
    }

    function submitAction(userId, action, extraData = {}) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.innerHTML = `
            <input type="hidden" name="user_id" value="${userId}">
            <input type="hidden" name="action" value="${action}">
        `;
        
        for (const [key, value] of Object.entries(extraData)) {
            form.innerHTML += `<input type="hidden" name="${key}" value="${value}">`;
        }
        
        document.body.appendChild(form);
        form.submit();
    }
    </script>
</body>
</html> 