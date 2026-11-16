<?php
$apiUrl = getenv('TRANSLATOR_API_URL') ?: 'http://localhost:8080/darija-translator/api/translator/translate';
$username = getenv('TRANSLATOR_USERNAME') ?: 'translator';
$password = getenv('TRANSLATOR_PASSWORD') ?: 'Oumnia123!';

$inputText = '';
$translation = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputText = trim($_POST['text'] ?? '');

    if ($inputText === '') {
        $error = 'Please enter some English text.';
    } elseif (mb_strlen($inputText) > 10000) {
        $error = 'Text must be 10,000 characters or fewer.';
    } elseif (!function_exists('curl_init')) {
        $error = 'PHP cURL is not enabled. Enable the cURL extension in your PHP configuration.';
    } else {
        $payload = json_encode(['text' => $inputText], JSON_UNESCAPED_UNICODE);

        $ch = curl_init($apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_USERPWD => $username . ':' . $password,
            CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
        ]);

        $responseBody = curl_exec($ch);
        $curlError = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($responseBody === false) {
            $error = 'Could not connect to the Java REST API: ' . $curlError;
        } else {
            $data = json_decode($responseBody, true);

            if ($httpCode >= 200 && $httpCode < 300 && isset($data['translation'])) {
                $translation = $data['translation'];
            } elseif ($httpCode === 401 || $httpCode === 403) {
                $error = 'Authentication failed. Check TRANSLATOR_USERNAME and TRANSLATOR_PASSWORD.';
            } else {
                $error = $data['error'] ?? ('The API returned HTTP ' . $httpCode . '.');
            }
        }
    }
}

function h(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>English to Darija Translator — PHP Client</title>
    <style>
        body { font-family: Arial, sans-serif; background:#f3f6fb; color:#172b4d; margin:0; padding:32px 16px; }
        main { max-width:720px; margin:auto; background:white; padding:28px; border-radius:14px; box-shadow:0 4px 18px #102a4318; }
        h1 { margin-top:0; color:#123b5d; }
        label { display:block; font-weight:bold; margin:18px 0 8px; }
        textarea { width:100%; min-height:130px; padding:12px; border:1px solid #bcccdc; border-radius:8px; font:16px Arial; box-sizing:border-box; }
        button { margin-top:14px; background:#087e8b; color:white; border:0; border-radius:8px; padding:12px 20px; font-size:16px; cursor:pointer; }
        .result,.error { margin-top:22px; padding:16px; border-radius:8px; white-space:pre-wrap; overflow-wrap:anywhere; }
        .result { background:#e8f5f2; border-left:4px solid #087e8b; }
        .error { background:#fff0ef; border-left:4px solid #c0392b; color:#8e2b22; }
        .hint { color:#52667a; font-size:14px; }
    </style>
</head>
<body>
<main>
    <h1>English → Moroccan Darija</h1>
    <p class="hint">PHP client connected to the Java Jakarta REST API.</p>
    <form method="post">
        <label for="text">English text</label>
        <textarea id="text" name="text" maxlength="10000" required><?= h($inputText) ?></textarea>
        <button type="submit">Translate</button>
    </form>

    <?php if ($translation !== ''): ?>
        <section class="result">
            <strong>Moroccan Darija translation</strong>
            <p><?= h($translation) ?></p>
        </section>
    <?php endif; ?>

    <?php if ($error !== ''): ?>
        <section class="error"><?= h($error) ?></section>
    <?php endif; ?>
</main>
</body>
</html>
