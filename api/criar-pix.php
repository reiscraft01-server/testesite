<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['total']) || $input['total'] <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

$totalCentavos = intval(round(floatval($input['total']) * 100));
if ($totalCentavos < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Valor inválido']);
    exit;
}

if (!function_exists('sodium_crypto_sign_detached')) {
    http_response_code(500);
    echo json_encode(['error' => 'Extensão Sodium não disponível no servidor']);
    exit;
}

try {
    $externalRef = 'rc-' . bin2hex(random_bytes(8));

    $body = json_encode([
        'type' => 'INSTANT',
        'amount_in_cents' => $totalCentavos,
        'expiration' => 86400,
        'external_reference_id' => $externalRef
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $timestamp = round(microtime(true) * 1000);

    $seed = hex2bin(CLIENT_SECRET);
    if ($seed === false || strlen($seed) !== 32) {
        http_response_code(500);
        echo json_encode(['error' => 'Configuração inválida: client_secret']);
        exit;
    }

    $keypair = sodium_crypto_sign_seed_keypair($seed);
    $secret_key = sodium_crypto_sign_secretkey($keypair);

    $message = "/v1/dynamic-qrcode:POST:$body:$timestamp";
    $signature = sodium_crypto_sign_detached($message, $secret_key);
    $signature_b64 = base64_encode($signature);

    $ch = curl_init('https://conta-public-api.kiwify.com/v1/dynamic-qrcode');
    if ($ch === false) {
        http_response_code(500);
        echo json_encode(['error' => 'cURL não disponível']);
        exit;
    }

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($body),
            'x-access-id: ' . ACCOUNT_ID,
            'X-PoP-Challenge: ' . $timestamp,
            'X-PoP-Format: service-account',
            'X-PoP-Signature: ' . $signature_b64
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true
    ]);

    $resposta = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro de conexão: ' . $curlError]);
        exit;
    }

    http_response_code($httpCode);
    echo $resposta;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno: ' . $e->getMessage()]);
}
