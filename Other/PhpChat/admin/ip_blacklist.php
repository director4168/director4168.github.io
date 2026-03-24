<?php
define('IN_CHAT', true);
require_once '../config.php';

// 检查是否是管理员
if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    header("Location: ../login.php");
    exit;
}

// 处理添加IP封禁
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] == 'add') {
        $ip = trim($_POST['ip']);
        $reason = trim($_POST['reason']);
        
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            $stmt = $pdo->prepare("INSERT INTO ip_blacklist (ip, reason) VALUES (?, ?)");
            $stmt->execute([$ip, $reason]);
            $success = "IP添加成功";
        } else {
            $error = "无效的IP地址";
        }
    } elseif ($_POST['action'] == 'delete') {
        $id = (int)$_POST['id'];
        $stmt = $pdo->prepare("DELETE FROM ip_blacklist WHERE id = ?");
        $stmt->execute([$id]);
        $success = "IP解封成功";
    }
}

// 获取IP黑名单列表
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$per_page = 20;
$offset = ($page - 1) * $per_page;

$total_ips = $pdo->query("SELECT COUNT(*) FROM ip_blacklist")->fetchColumn();
$total_pages = ceil($total_ips / $per_page);

$stmt = $pdo->query("
    SELECT * FROM ip_blacklist 
    ORDER BY created_at DESC 
    LIMIT $per_page OFFSET $offset
");
$blacklist = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html>
<head>
    <title>IP封禁管理 - 在线聊天室</title>
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
        .ip-table {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,.1);
        }
        .table > :not(caption) > * > * {
            padding: 1rem;
        }
        .add-ip-form {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,.1);
            padding: 1.5rem;
            margin-bottom: 2rem;
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
                        <a class="nav-link" href="users.php">
                            <i class="fas fa-users"></i> 用户管理
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="ip_blacklist.php">
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
                    <h2>IP封禁管理</h2>
                    <div class="text-muted">
                        <i class="far fa-clock"></i> 
                        <?php echo date('Y-m-d H:i:s'); ?>
                    </div>
                </div>

                <!-- 添加IP表单 -->
                <div class="add-ip-form">
                    <?php if (isset($success)): ?>
                        <div class="alert alert-success"><?php echo $success; ?></div>
                    <?php endif; ?>
                    <?php if (isset($error)): ?>
                        <div class="alert alert-danger"><?php echo $error; ?></div>
                    <?php endif; ?>

                    <form method="POST" class="row g-3">
                        <input type="hidden" name="action" value="add">
                        <div class="col-md-4">
                            <label class="form-label">IP地址</label>
                            <input type="text" name="ip" class="form-control" required 
                                   placeholder="例如: 192.168.1.1">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">封禁原因</label>
                            <input type="text" name="reason" class="form-control" required>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">&nbsp;</label>
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-plus"></i> 添加
                            </button>
                        </div>
                    </form>
                </div>

                <!-- IP列表 -->
                <div class="ip-table">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>IP地址</th>
                                    <th>封禁原因</th>
                                    <th>封禁时间</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($blacklist as $ip): ?>
                                <tr>
                                    <td><?php echo $ip['id']; ?></td>
                                    <td><?php echo htmlspecialchars($ip['ip']); ?></td>
                                    <td><?php echo htmlspecialchars($ip['reason']); ?></td>
                                    <td><?php echo $ip['created_at']; ?></td>
                                    <td>
                                        <form method="POST" class="d-inline" 
                                              onsubmit="return confirm('确定要解封这个IP吗？');">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $ip['id']; ?>">
                                            <button type="submit" class="btn btn-sm btn-danger">
                                                <i class="fas fa-trash"></i> 删除
                                            </button>
                                        </form>
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

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html> 