<?php
/**
 * Creative Asset Validator - Database Core
 * PDO wrapper with transactions, helpers, and encryption
 */

namespace CAV\Core;

class Database {
    private static ?Database $instance = null;
    private ?\PDO $pdo = null;
    private array $config;
    
    private function __construct(array $config) {
        $this->config = $config;
        $this->connect();
    }
    
    public static function getInstance(array $config = []): Database {
        if (self::$instance === null) {
            self::$instance = new self($config);
        }
        return self::$instance;
    }
    
    private function connect(): void {
        $db = $this->config['database'];
        
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $db['host'],
            $db['port'] ?? 3306,
            $db['name'],
            $db['charset'] ?? 'utf8mb4'
        );
        
        $options = [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
            \PDO::ATTR_EMULATE_PREPARES => false,
            \PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        
        try {
            $this->pdo = new \PDO($dsn, $db['user'], $db['pass'], $options);
        } catch (\PDOException $e) {
            throw new ApiException('Database connection failed', 500);
        }
    }
    
    public function getPdo(): \PDO {
        return $this->pdo;
    }
    
    // ========================================================
    // QUERY HELPERS
    // ========================================================
    
    public function query(string $sql, array $params = []): \PDOStatement {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
    
    public function fetch(string $sql, array $params = []): ?array {
        return $this->query($sql, $params)->fetch() ?: null;
    }
    
    public function fetchAll(string $sql, array $params = []): array {
        return $this->query($sql, $params)->fetchAll();
    }
    
    public function fetchColumn(string $sql, array $params = [], int $column = 0) {
        return $this->query($sql, $params)->fetchColumn($column);
    }
    
    public function insert(string $table, array $data): int {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        
        $sql = "INSERT INTO `{$table}` ({$columns}) VALUES ({$placeholders})";
        $this->query($sql, array_values($data));
        
        return (int) $this->pdo->lastInsertId();
    }
    
    public function update(string $table, array $data, string $where, array $whereParams = []): int {
        $set = implode(', ', array_map(fn($k) => "`{$k}` = ?", array_keys($data)));
        $sql = "UPDATE `{$table}` SET {$set} WHERE {$where}";
        
        $stmt = $this->query($sql, array_merge(array_values($data), $whereParams));
        return $stmt->rowCount();
    }
    
    public function delete(string $table, string $where, array $params = []): int {
        $sql = "DELETE FROM `{$table}` WHERE {$where}";
        return $this->query($sql, $params)->rowCount();
    }
    
    // ========================================================
    // TRANSACTIONS
    // ========================================================
    
    public function beginTransaction(): bool {
        return $this->pdo->beginTransaction();
    }
    
    public function commit(): bool {
        return $this->pdo->commit();
    }
    
    public function rollBack(): bool {
        return $this->pdo->rollBack();
    }
    
    public function transaction(callable $callback) {
        $this->beginTransaction();
        try {
            $result = $callback($this);
            $this->commit();
            return $result;
        } catch (\Exception $e) {
            $this->rollBack();
            throw $e;
        }
    }
}

// ========================================================
// API EXCEPTION
// ========================================================

class ApiException extends \Exception {
    private int $httpCode;
    private array $details;
    
    public function __construct(string $message, int $httpCode = 400, array $details = []) {
        parent::__construct($message);
        $this->httpCode = $httpCode;
        $this->details = $details;
    }
    
    public function getHttpCode(): int {
        return $this->httpCode;
    }
    
    public function getDetails(): array {
        return $this->details;
    }
    
    public function toArray(): array {
        return [
            'error' => true,
            'message' => $this->getMessage(),
            'code' => $this->httpCode,
            'details' => $this->details
        ];
    }
}

// ========================================================
// LOGGER
// ========================================================

class Logger {
    private static ?string $logFile = null;
    private static string $level = 'info';
    
    private static array $levels = [
        'debug' => 0,
        'info' => 1,
        'warning' => 2,
        'error' => 3
    ];
    
    public static function init(string $logFile, string $level = 'info'): void {
        self::$logFile = $logFile;
        self::$level = $level;
        
        $dir = dirname($logFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
    
    public static function log(string $level, string $message, array $context = []): void {
        if (self::$levels[$level] < self::$levels[self::$level]) {
            return;
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = $context ? ' ' . json_encode($context) : '';
        $line = "[{$timestamp}] [{$level}] {$message}{$contextStr}\n";
        
        if (self::$logFile) {
            file_put_contents(self::$logFile, $line, FILE_APPEND | LOCK_EX);
        }
    }
    
    public static function debug(string $message, array $context = []): void {
        self::log('debug', $message, $context);
    }
    
    public static function info(string $message, array $context = []): void {
        self::log('info', $message, $context);
    }
    
    public static function warning(string $message, array $context = []): void {
        self::log('warning', $message, $context);
    }
    
    public static function error(string $message, array $context = []): void {
        self::log('error', $message, $context);
    }
}

// ========================================================
// ENCRYPTION
// ========================================================

class Encryption {
    private string $key;
    private string $cipher = 'aes-256-gcm';
    
    public function __construct(string $hexKey) {
        $this->key = hex2bin($hexKey);
    }
    
    public function encrypt(string $plaintext): string {
        $ivLength = openssl_cipher_iv_length($this->cipher);
        $iv = random_bytes($ivLength);
        $tag = '';
        
        $ciphertext = openssl_encrypt(
            $plaintext,
            $this->cipher,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
        
        // Format: base64(iv + tag + ciphertext)
        return base64_encode($iv . $tag . $ciphertext);
    }
    
    public function decrypt(string $encoded): ?string {
        try {
            $data = base64_decode($encoded);
            $ivLength = openssl_cipher_iv_length($this->cipher);
            $tagLength = 16; // GCM tag is 16 bytes
            
            $iv = substr($data, 0, $ivLength);
            $tag = substr($data, $ivLength, $tagLength);
            $ciphertext = substr($data, $ivLength + $tagLength);
            
            return openssl_decrypt(
                $ciphertext,
                $this->cipher,
                $this->key,
                OPENSSL_RAW_DATA,
                $iv,
                $tag
            ) ?: null;
        } catch (\Exception $e) {
            return null;
        }
    }
}

