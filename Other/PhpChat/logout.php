<?php
define('IN_CHAT', true);
require_once 'config.php';
session_destroy();
header("Location: login.php");
exit; 