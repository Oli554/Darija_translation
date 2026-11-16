# Additional Darija Translator Clients

These are two separate clients for the existing Java REST API. They do not call Gemini directly.

## Shared API endpoint

`POST http://localhost:8080/darija-translator/api/translator/translate`

JSON body:

```json
{"text":"Good morning! How are you?"}
```

The clients use HTTP Basic Authentication.

**Important credential note:** In the Java source included in the supplied ZIP, `DemoIdentityStore` defaults to username `translator` and password `Oumnia123!`. The included Postman collection currently says `ChangeMe123!`, so those values do not match. Set the same `TRANSLATOR_USERNAME` and `TRANSLATOR_PASSWORD` values for Payara and both clients. The examples below match the Java source's current default. For a real deployment, use a strong secret supplied through environment variables and HTTPS; do not commit passwords or API keys.

## PHP client

Requirements: PHP 8+ with the cURL extension enabled.

From the `php-client` directory, in PowerShell:

```powershell
$env:TRANSLATOR_USERNAME = "translator"
$env:TRANSLATOR_PASSWORD = "Oumnia123!"
php -S 127.0.0.1:8000
```

Open `http://127.0.0.1:8000`.

If PHP is not recognized, install PHP and add its folder to PATH. Ensure `extension=curl` is enabled in `php.ini`.

## Python client

Requirements: Python 3.10+.

From the `python-client` directory, in PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:TRANSLATOR_USERNAME = "translator"
$env:TRANSLATOR_PASSWORD = "Oumnia123!"
py app.py
```

Open `http://127.0.0.1:5000`.

## If you changed the Java credentials

Set the same values in the PowerShell session before starting the client:

```powershell
$env:TRANSLATOR_USERNAME = "your-username"
$env:TRANSLATOR_PASSWORD = "your-password"
```

If the API runs on a different host or port, also set:

```powershell
$env:TRANSLATOR_API_URL = "http://HOST:PORT/darija-translator/api/translator/translate"
```

Start Payara and deploy the Java WAR before using either client.
