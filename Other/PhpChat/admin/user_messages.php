<?php
define('IN_CHAT', true);
require_once '../config.php';

// 检查是否是管理员
if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    header("Location: ../login.php");
    exit;
}

// 获取用户信息
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch();

if (!$user) {
    die("用户不存在");
}

// 获取用户的聊天记录
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$per_page = 50;
$offset = ($page - 1) * $per_page;

$total_messages = $pdo->prepare("SELECT COUNT(*) FROM messages WHERE user_id = ?");
$total_messages->execute([$user_id]);
$total_pages = ceil($total_messages->fetchColumn() / $per_page);

$stmt = $pdo->prepare("
    SELECT * FROM messages 
    WHERE user_id = :user_id 
    ORDER BY created_at DESC 
    LIMIT $per_page OFFSET $offset
");
$stmt->execute(['user_id' => $user_id]);
$messages = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html>
<head>
    <title>用户聊天记录 - 在线聊天室</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="index.php">管理后台</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="users.php">用户管理</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="ip_blacklist.php">IP封禁</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="../chat.php">返回聊天室</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <?php echo htmlspecialchars($user['nickname'] ?: $user['username']); ?> 的聊天记录
                </h5>
                <a href="users.php" class="btn btn-primary btn-sm">返回用户列表</a>
            </div>
            <div class="card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>消息内容</th>
                            <th>发送时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($messages as $message): ?>
                        <tr>
                            <td><?php echo $message['id']; ?></td>
                            <td><?php echo htmlspecialchars($message['content']); ?></td>
                            <td><?php echo $message['created_at']; ?></td>
                            <td>
                                <form method="POST" class="d-inline">
                                    <input type="hidden" name="message_id" value="<?php echo $message['id']; ?>">
                                    <button type="submit" name="action" value="delete" 
                                            class="btn btn-danger btn-sm"
                                            onclick="return confirm('确定要删除此消息吗？')">删除</button>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                
                <!-- 分页 -->
                <?php if ($total_pages > 1): ?>
                <nav>
                    <ul class="pagination">
                        <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                            <li class="page-item <?php echo $i == $page ? 'active' : ''; ?>">
                                <a class="page-link" href="?user_id=<?php echo $user_id; ?>&page=<?php echo $i; ?>">
                                    <?php echo $i; ?>
                                </a>
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