<?php
define('IN_CHAT', true);
require_once '../config.php';

// 获取用户真实IP的函数
function getRealIP() {
    $ip = null;
    
    // 按优先级获取IP
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // 获取代理IP链中的第一个真实IP
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim($ips[0]);
    } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        $ip = $_SERVER['HTTP_X_REAL_IP'];
    } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    
    // 验证IP格式
    if ($ip && filter_var($ip, FILTER_VALIDATE_IP, 
        FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        return $ip;
    }
    
    // 如果无法获取有效的公网IP，返回REMOTE_ADDR
    return $_SERVER['REMOTE_ADDR'];
}

// 从多个IP定位API获取位置信息
function getLocationFromIP($ip) {
    // 尝试使用太平洋IP定位API
    try {
        $url = "http://whois.pconline.com.cn/ipJson.jsp?ip={$ip}&json=true";
        $response = file_get_contents($url);
        if ($response) {
            $data = json_decode($response, true);
            if ($data && isset($data['city'])) {
                return $data['pro'] . ' ' . $data['city'];
            }
        }
    } catch (Exception $e) {
        error_log("IP location error (pconline): " . $e->getMessage());
    }
    
    // 备用：使用IPAPI
    try {
        $url = "http://ip-api.com/json/{$ip}?lang=zh-CN";
        $response = file_get_contents($url);
        if ($response) {
            $data = json_decode($response, true);
            if ($data && $data['status'] === 'success') {
                return $data['regionName'] . ' ' . $data['city'];
            }
        }
    } catch (Exception $e) {
        error_log("IP location error (ip-api): " . $e->getMessage());
    }
    
    // 再次备用：使用ipapi.co
    try {
        $url = "https://ipapi.co/{$ip}/json/";
        $response = file_get_contents($url);
        if ($response) {
            $data = json_decode($response, true);
            if ($data && isset($data['city'])) {
                return $data['region'] . ' ' . $data['city'];
            }
        }
    } catch (Exception $e) {
        error_log("IP location error (ipapi.co): " . $e->getMessage());
    }
    
    return null;
}

if (isset($_SESSION['user_id'])) {
    try {
        $ip = getRealIP();
        $location = getLocationFromIP($ip);
        
        if ($location) {
            // 更新用户IP
            $stmt = $pdo->prepare("UPDATE users SET ip = ? WHERE id = ?");
            $stmt->execute([$ip, $_SESSION['user_id']]);
            
            // 检查是否已存在位置记录
            $stmt = $pdo->prepare("SELECT id FROM user_locations WHERE user_id = ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([$_SESSION['user_id']]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                // 更新现有记录
                $stmt = $pdo->prepare("UPDATE user_locations SET city = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$location, $existing['id']]);
            } else {
                // 插入新记录
                $stmt = $pdo->prepare("INSERT INTO user_locations (user_id, city) VALUES (?, ?)");
                $stmt->execute([$_SESSION['user_id'], $location]);
            }
            
            echo json_encode([
                'success' => true, 
                'location' => $location,
                'ip' => $ip
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'error' => '无法获取位置信息',
                'ip' => $ip
            ]);
        }
    } catch (Exception $e) {
        error_log("Location update error: " . $e->getMessage());
        echo json_encode([
            'success' => false, 
            'error' => '更新位置信息失败',
            'message' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'error' => '未登录']);
} 