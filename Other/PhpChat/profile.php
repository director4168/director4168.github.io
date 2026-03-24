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
$user = $stmt->fetch();

// 处理表单提交
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nickname = trim($_POST['nickname']);
    $signature = trim($_POST['signature']);
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    
    // 处理头像上传
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] == 0) {
        $allowed = ['jpg', 'jpeg', 'png', 'gif'];
        $filename = $_FILES['avatar']['name'];
        $filesize = $_FILES['avatar']['size'];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        // 检查文件大小（这里限制为5MB）
        if ($filesize > 5 * 1024 * 1024) {
            $error = "头像文件大小不能超过5MB";
        }
        // 检查文件类型
        elseif (!in_array($ext, $allowed)) {
            $error = "只支持 jpg、jpeg、png、gif 格式的图片";
        }
        else {
            $new_filename = uniqid() . '.' . $ext;
            $upload_path = 'uploads/avatars/' . $new_filename;
            
            if (move_uploaded_file($_FILES['avatar']['tmp_name'], $upload_path)) {
                // 删除旧头像
                if ($user['avatar'] && file_exists($user['avatar'])) {
                    unlink($user['avatar']);
                }
                
                // 更新头像路径
                $stmt = $pdo->prepare("UPDATE users SET avatar = ? WHERE id = ?");
                $stmt->execute([$upload_path, $_SESSION['user_id']]);
                $success = "头像更新成功";
            } else {
                $error = "头像上传失败，请重试";
            }
        }
    }
    
    // 更新基本信息
    $stmt = $pdo->prepare("UPDATE users SET nickname = ?, signature = ? WHERE id = ?");
    $stmt->execute([$nickname, $signature, $_SESSION['user_id']]);
    
    // 修改密码
    if (!empty($current_password) && !empty($new_password)) {
        if (password_verify($current_password, $user['password'])) {
            $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
            $stmt->execute([$hashed_password, $_SESSION['user_id']]);
            $success = "资料更新成功，密码已修改";
        } else {
            $error = "当前密码错误";
        }
    } else {
        $success = "资料更新成功";
    }
    
    // 重新获取用户信息
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>编辑资料 - 在线聊天室</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: 2rem 0;
        }
        
        .profile-card {
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        
        .profile-card:hover {
            transform: translateY(-5px);
        }
        
        .profile-header {
            background: linear-gradient(45deg, #007bff, #00c6ff);
            padding: 2rem;
            color: white;
            text-align: center;
            position: relative;
        }
        
        .avatar-wrapper {
            position: relative;
            width: 150px;
            height: 150px;
            margin: 0 auto 1rem;
        }
        
        .avatar-preview {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid white;
            box-shadow: 0 2px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        }
        
        .avatar-upload {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 40px;
            height: 40px;
            background: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .avatar-upload:hover {
            transform: scale(1.1);
            background: #007bff;
            color: white;
        }
        
        .avatar-upload input[type="file"] {
            display: none;
        }
        
        .form-section {
            padding: 2rem;
        }
        
        .form-floating {
            margin-bottom: 1.5rem;
        }
        
        .form-control {
            border: 2px solid #eef1f5;
            border-radius: 12px;
            padding: 1rem;
            height: auto;
            transition: all 0.3s ease;
        }
        
        .form-control:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.15);
        }
        
        .password-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 1.5rem;
            margin-top: 2rem;
        }
        
        .btn-save {
            background: linear-gradient(45deg, #007bff, #00c6ff);
            border: none;
            border-radius: 12px;
            padding: 0.8rem 2rem;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .btn-save:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,123,255,0.3);
        }
        
        .btn-back {
            color: #6c757d;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .btn-back:hover {
            color: #343a40;
            transform: translateX(-3px);
        }
        
        .alert {
            border-radius: 12px;
            border: none;
            padding: 1rem 1.5rem;
        }
        
        .alert-success {
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
            box-shadow: 0 3px 10px rgba(40,167,69,0.2);
        }
        
        .alert-danger {
            background: linear-gradient(45deg, #dc3545, #ff6b6b);
            color: white;
            box-shadow: 0 3px 10px rgba(220,53,69,0.2);
        }
        
        /* 深色模式支持 */
        @media (prefers-color-scheme: dark) {
            body {
                background: linear-gradient(135deg, #2d3436 0%, #1a1a1a 100%);
            }
            
            .profile-card {
                background: #2d2d2d;
                box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            }
            
            .form-control {
                background: #3d3d3d;
                border-color: #4d4d4d;
                color: #fff;
            }
            
            .form-control:focus {
                background: #3d3d3d;
                border-color: #007bff;
            }
            
            .password-section {
                background: #363636;
            }
            
            .btn-back {
                color: #adb5bd;
            }
            
            .btn-back:hover {
                color: #ced4da;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="profile-card">
                    <form method="POST" enctype="multipart/form-data" id="profileForm">
                        <div class="profile-header">
                            <a href="chat.php" class="btn btn-back position-absolute top-0 start-0 m-3">
                                <i class="fas fa-arrow-left me-2"></i>返回聊天室
                            </a>
                            <div class="avatar-wrapper">
                                <img src="<?php echo $user['avatar'] ?: 'assets/default-avatar.png'; ?>" 
                                     class="avatar-preview" alt="头像预览" id="avatarPreview">
                                <label class="avatar-upload" title="更换头像">
                                    <i class="fas fa-camera"></i>
                                    <input type="file" name="avatar" accept="image/*" 
                                           onchange="previewAvatar(this)">
                                </label>
                            </div>
                            <h4 class="mb-0"><?php echo htmlspecialchars($user['username']); ?></h4>
                            <small class="text-white-50">编辑个人资料</small>
                        </div>

                        <div class="form-section">
                            <?php if (isset($success)): ?>
                                <div class="alert alert-success mb-4">
                                    <i class="fas fa-check-circle me-2"></i><?php echo $success; ?>
                                </div>
                            <?php endif; ?>
                            
                            <?php if (isset($error)): ?>
                                <div class="alert alert-danger mb-4">
                                    <i class="fas fa-exclamation-circle me-2"></i><?php echo $error; ?>
                                </div>
                            <?php endif; ?>

                            <div class="form-floating mb-4">
                                <input type="text" name="nickname" class="form-control" id="nickname"
                                       value="<?php echo htmlspecialchars($user['nickname']); ?>"
                                       placeholder="输入昵称">
                                <label for="nickname">昵称</label>
                            </div>

                            <div class="form-floating mb-4">
                                <textarea name="signature" class="form-control" id="signature" 
                                          style="height: 100px" 
                                          placeholder="写点什么吧..."><?php echo htmlspecialchars($user['signature']); ?></textarea>
                                <label for="signature">个性签名</label>
                            </div>

                            <div class="password-section">
                                <h5 class="mb-4"><i class="fas fa-lock me-2"></i>修改密码</h5>
                                <div class="form-floating mb-3">
                                    <input type="password" name="current_password" class="form-control" 
                                           id="currentPassword" placeholder="当前密码">
                                    <label for="currentPassword">当前密码</label>
                                </div>
                                
                                <div class="form-floating">
                                    <input type="password" name="new_password" class="form-control" 
                                           id="newPassword" placeholder="新密码">
                                    <label for="newPassword">新密码</label>
                                </div>
                            </div>

                            <div class="d-grid mt-4">
                                <button type="submit" class="btn btn-save">
                                    <i class="fas fa-save me-2"></i>保存修改
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
    function previewAvatar(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('avatarPreview').src = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    </script>
</body>
</html> 