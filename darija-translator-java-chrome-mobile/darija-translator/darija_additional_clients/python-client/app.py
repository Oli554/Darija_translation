import os
import requests
from flask import Flask, render_template_string, request

app = Flask(__name__)

API_URL = os.getenv(
    "TRANSLATOR_API_URL",
    "http://localhost:8080/darija-translator/api/translator/translate",
)
API_USERNAME = os.getenv("TRANSLATOR_USERNAME", "translator")

API_PASSWORD = os.getenv("TRANSLATOR_PASSWORD", "Oumnia123!")

PAGE = """
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>English to Darija Translator — Python Client</title>
  <style>
    body { font-family: Arial, sans-serif; background:#f3f6fb; color:#172b4d; margin:0; padding:32px 16px; }
    main { max-width:720px; margin:auto; background:white; padding:28px; border-radius:14px; box-shadow:0 4px 18px #102a4318; }
    h1 { margin-top:0; color:#123b5d; }
    label { display:block; font-weight:bold; margin:18px 0 8px; }
    textarea { width:100%; min-height:130px; padding:12px; border:1px solid #bcccdc; border-radius:8px; font:16px Arial; box-sizing:border-box; }
    button { margin-top:14px; background:#087e8b; color:white; border:0; border-radius:8px; padding:12px 20px; font-size:16px; cursor:pointer; }
    .result,.error { margin-top:22px; padding:16px; border-radius:8px; overflow-wrap:anywhere; }
    .result { background:#e8f5f2; border-left:4px solid #087e8b; }
    .error { background:#fff0ef; border-left:4px solid #c0392b; color:#8e2b22; }
    .hint { color:#52667a; font-size:14px; }
  </style>
</head>
<body>
<main>
  <h1>English → Moroccan Darija</h1>
  <p class="hint">Python Flask client connected to the Java Jakarta REST API.</p>
  <form method="post">
    <label for="text">English text</label>
    <textarea id="text" name="text" maxlength="10000" required>{{ input_text }}</textarea>
    <button type="submit">Translate</button>
  </form>
  {% if translation %}
    <section class="result">
      <strong>Moroccan Darija translation</strong>
      <p>{{ translation }}</p>
    </section>
  {% endif %}
  {% if error %}
    <section class="error">{{ error }}</section>
  {% endif %}
</main>
</body>
</html>
"""


@app.route("/", methods=["GET", "POST"])
def index():
    input_text = ""
    translation = ""
    error = ""

    if request.method == "POST":
        input_text = request.form.get("text", "").strip()

        if not input_text:
            error = "Please enter some English text."
        elif len(input_text) > 10000:
            error = "Text must be 10,000 characters or fewer."
        else:
            try:
                response = requests.post(
                    API_URL,
                    json={"text": input_text},
                    auth=(API_USERNAME, API_PASSWORD),
                    headers={"Accept": "application/json"},
                    timeout=60,
                )

                if response.status_code in (401, 403):
                    error = "Authentication failed. Check the API username and password."
                else:
                    response.raise_for_status()
                    data = response.json()
                    translation = data.get("translation", "")
                    if not translation:
                        error = "The API response did not contain a translation."
            except requests.exceptions.ConnectionError:
                error = "Could not connect to the Java REST API. Check that Payara is running."
            except requests.exceptions.Timeout:
                error = "The translation request timed out. Please try again."
            except requests.exceptions.HTTPError:
                try:
                    error = response.json().get("error", f"The API returned HTTP {response.status_code}.")
                except ValueError:
                    error = f"The API returned HTTP {response.status_code}."
            except requests.exceptions.RequestException as exc:
                error = f"Request failed: {exc}"
            except ValueError:
                error = "The API returned an invalid JSON response."

    return render_template_string(
        PAGE,
        input_text=input_text,
        translation=translation,
        error=error,
    )


if __name__ == "__main__":
    # Local development client only. Do not expose Flask's debug server publicly.
    app.run(host="127.0.0.1", port=5000, debug=False)
