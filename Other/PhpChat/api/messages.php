<?php
define('IN_CHAT', true);
require_once '../config.php';
header('Content-Type: application/json');

// 检查用户是否登录
if (!isset($_SESSION['user_id'])) {
    die(json_encode(['error' => '未登录']));
}

// 获取消息
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $last_id = isset($_GET['last_id']) ? (int)$_GET['last_id'] : 0;
    
    $stmt = $pdo->prepare("
        SELECT m.*, u.username, u.nickname, u.avatar, u.is_admin, 
               CASE WHEN u.is_admin = 1 THEN u.custom_location 
                    ELSE (SELECT city FROM user_locations WHERE user_id = u.id ORDER BY id DESC LIMIT 1)
               END as location
        FROM messages m 
        JOIN users u ON m.user_id = u.id 
        WHERE m.id > ? 
        ORDER BY m.created_at ASC 
        LIMIT 50
    ");
    $stmt->execute([$last_id]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['messages' => $messages]);
    exit;
}

// 发送消息
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $content = trim($_POST['content'] ?? '');
    
    if (empty($content)) {
        die(json_encode(['error' => '消息不能为空']));
    }
    
    // 检查用户状态
    $stmt = $pdo->prepare("SELECT status FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user || $user['status'] != 1) {
        die(json_encode(['error' => '您的账号已被禁用']));
    }
    
    try {
        // 添加调试信息
        error_log("Trying to send message: " . $content);
        
        // 插入消息
        $stmt = $pdo->prepare("INSERT INTO messages (user_id, content) VALUES (?, ?)");
        $result = $stmt->execute([$_SESSION['user_id'], $content]);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message_id' => $pdo->lastInsertId()
            ]);
        } else {
            error_log("Failed to insert message: " . print_r($stmt->errorInfo(), true));
            echo json_encode(['error' => '发送失败，数据库错误']);
        }
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        echo json_encode(['error' => '发送失败，请稍后重试']);
    }
    exit;
} 