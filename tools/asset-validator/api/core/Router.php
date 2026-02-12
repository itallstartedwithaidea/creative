<?php
/**
 * Creative Asset Validator - Request Router
 * Route matching, JSON handling, pagination
 */

namespace CAV\Core;

class Router {
    private array $routes = [];
    private array $middleware = [];
    
    // ========================================================
    // ROUTE REGISTRATION
    // ========================================================
    
    public function get(string $path, callable $handler): self {
        return $this->addRoute('GET', $path, $handler);
    }
    
    public function post(string $path, callable $handler): self {
        return $this->addRoute('POST', $path, $handler);
    }
    
    public function put(string $path, callable $handler): self {
        return $this->addRoute('PUT', $path, $handler);
    }
    
    public function delete(string $path, callable $handler): self {
        return $this->addRoute('DELETE', $path, $handler);
    }
    
    public function options(string $path, callable $handler): self {
        return $this->addRoute('OPTIONS', $path, $handler);
    }
    
    private function addRoute(string $method, string $path, callable $handler): self {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'pattern' => $this->pathToPattern($path)
        ];
        return $this;
    }
    
    public function middleware(callable $middleware): self {
        $this->middleware[] = $middleware;
        return $this;
    }
    
    // ========================================================
    // ROUTE MATCHING
    // ========================================================
    
    private function pathToPattern(string $path): string {
        // Convert {param} to named capture group
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }
    
    public function dispatch(Request $request): Response {
        // Run middleware
        foreach ($this->middleware as $middleware) {
            $result = $middleware($request);
            if ($result instanceof Response) {
                return $result;
            }
        }
        
        // Find matching route
        foreach ($this->routes as $route) {
            if ($route['method'] !== $request->method) {
                continue;
            }
            
            if (preg_match($route['pattern'], $request->path, $matches)) {
                // Extract named parameters
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                $request->params = $params;
                
                try {
                    $result = call_user_func($route['handler'], $request);
                    
                    if ($result instanceof Response) {
                        return $result;
                    }
                    
                    return Response::json($result);
                } catch (ApiException $e) {
                    return Response::error($e->getMessage(), $e->getHttpCode(), $e->getDetails());
                } catch (\Exception $e) {
                    Logger::error('Unhandled exception', [
                        'message' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    return Response::error('Internal server error', 500);
                }
            }
        }
        
        return Response::error('Not found', 404);
    }
}

// ========================================================
// REQUEST
// ========================================================

class Request {
    public string $method;
    public string $path;
    public array $query;
    public array $body;
    public array $headers;
    public array $params = [];
    
    public function __construct() {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->path = $this->parsePath();
        $this->query = $_GET;
        $this->body = $this->parseBody();
        $this->headers = $this->parseHeaders();
    }
    
    private function parsePath(): string {
        $uri = $_SERVER['REQUEST_URI'];
        $path = parse_url($uri, PHP_URL_PATH);
        
        // Remove /api prefix if present
        $path = preg_replace('#^/api#', '', $path);
        
        // Remove trailing slash
        return rtrim($path, '/') ?: '/';
    }
    
    private function parseBody(): array {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (strpos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            return json_decode($raw, true) ?? [];
        }
        
        return $_POST;
    }
    
    private function parseHeaders(): array {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $name = str_replace('_', '-', substr($key, 5));
                $headers[$name] = $value;
            }
        }
        return $headers;
    }
    
    public function header(string $name, $default = null) {
        $name = strtoupper(str_replace('-', '_', $name));
        return $this->headers[$name] ?? $default;
    }
    
    public function bearerToken(): ?string {
        $auth = $this->header('AUTHORIZATION');
        if ($auth && preg_match('/Bearer\s+(.+)$/i', $auth, $matches)) {
            return $matches[1];
        }
        return null;
    }
    
    public function get(string $key, $default = null) {
        return $this->query[$key] ?? $default;
    }
    
    public function input(string $key, $default = null) {
        return $this->body[$key] ?? $default;
    }
    
    public function validate(array $rules): array {
        $validated = [];
        $errors = [];
        
        foreach ($rules as $field => $rule) {
            $value = $this->body[$field] ?? null;
            $ruleSet = is_string($rule) ? explode('|', $rule) : $rule;
            
            foreach ($ruleSet as $r) {
                if ($r === 'required' && ($value === null || $value === '')) {
                    $errors[$field] = "{$field} is required";
                    continue 2;
                }
                
                if ($r === 'email' && $value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field] = "{$field} must be a valid email";
                }
                
                if ($r === 'string' && $value !== null && !is_string($value)) {
                    $errors[$field] = "{$field} must be a string";
                }
                
                if ($r === 'array' && $value !== null && !is_array($value)) {
                    $errors[$field] = "{$field} must be an array";
                }
                
                if (preg_match('/^max:(\d+)$/', $r, $m) && is_string($value) && strlen($value) > $m[1]) {
                    $errors[$field] = "{$field} must be at most {$m[1]} characters";
                }
                
                if (preg_match('/^min:(\d+)$/', $r, $m) && is_string($value) && strlen($value) < $m[1]) {
                    $errors[$field] = "{$field} must be at least {$m[1]} characters";
                }
            }
            
            if (!isset($errors[$field])) {
                $validated[$field] = $value;
            }
        }
        
        if (!empty($errors)) {
            throw new ApiException('Validation failed', 422, $errors);
        }
        
        return $validated;
    }
    
    // Pagination helpers
    public function page(): int {
        return max(1, (int) ($this->query['page'] ?? 1));
    }
    
    public function perPage(int $default = 20, int $max = 100): int {
        $perPage = (int) ($this->query['per_page'] ?? $this->query['limit'] ?? $default);
        return min($max, max(1, $perPage));
    }
    
    public function offset(): int {
        return ($this->page() - 1) * $this->perPage();
    }
}

// ========================================================
// RESPONSE
// ========================================================

class Response {
    private int $status;
    private array $headers;
    private $body;
    
    public function __construct($body = null, int $status = 200, array $headers = []) {
        $this->body = $body;
        $this->status = $status;
        $this->headers = array_merge([
            'Content-Type' => 'application/json'
        ], $headers);
    }
    
    public static function json($data, int $status = 200): self {
        return new self($data, $status);
    }
    
    public static function success(string $message = 'Success', $data = null): self {
        $response = ['success' => true, 'message' => $message];
        if ($data !== null) {
            $response['data'] = $data;
        }
        return new self($response);
    }
    
    public static function error(string $message, int $status = 400, array $details = []): self {
        $response = ['error' => true, 'message' => $message];
        if (!empty($details)) {
            $response['details'] = $details;
        }
        return new self($response, $status);
    }
    
    public static function paginated(array $data, int $total, int $page, int $perPage): self {
        return new self([
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($total / $perPage),
                'has_more' => ($page * $perPage) < $total
            ]
        ]);
    }
    
    public static function noContent(): self {
        return new self(null, 204);
    }
    
    public function header(string $name, string $value): self {
        $this->headers[$name] = $value;
        return $this;
    }
    
    public function send(): void {
        http_response_code($this->status);
        
        foreach ($this->headers as $name => $value) {
            header("{$name}: {$value}");
        }
        
        if ($this->body !== null) {
            echo json_encode($this->body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
    }
}

