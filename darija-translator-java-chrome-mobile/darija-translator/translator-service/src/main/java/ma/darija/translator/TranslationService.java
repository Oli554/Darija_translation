
package ma.darija.translator;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.json.JsonValue;

import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@ApplicationScoped
public class TranslationService {

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public String translate(String text) throws Exception {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text cannot be empty.");
        }

        String apiKey = System.getenv("GEMINI_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Gemini API key is not configured."
            );
        }

        String prompt =
                "Translate the following text into natural, everyday Moroccan Arabic (Darija), " +
                        "not Modern Standard Arabic. Use Arabic script. " +
                        "Preserve meaning, tone, names, and formatting. " +
                        "Return only the translation, without explanations.\n\nTEXT:\n" + text;

        JsonObject payload = Json.createObjectBuilder()
                .add("contents", Json.createArrayBuilder()
                        .add(Json.createObjectBuilder()
                                .add("parts", Json.createArrayBuilder()
                                        .add(Json.createObjectBuilder()
                                                .add("text", prompt)))))
                .add("generationConfig", Json.createObjectBuilder()
                        .add("temperature", 0.2)
                        .add("maxOutputTokens", 512))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GEMINI_URL + "?key=" + apiKey))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(
                        payload.toString(),
                        StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = client.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException(
                    "Gemini returned HTTP " + response.statusCode()
                            + ". " + response.body()
            );
        }

        try (JsonReader reader = Json.createReader(
                new StringReader(response.body()))) {

            JsonObject root = reader.readObject();

            JsonValue candidates = root.get("candidates");

            if (candidates == null
                    || candidates.getValueType() != JsonValue.ValueType.ARRAY
                    || candidates.asJsonArray().isEmpty()) {

                throw new IllegalStateException(
                        "Gemini returned no translation candidate."
                );
            }

            JsonObject candidate =
                    candidates.asJsonArray().getJsonObject(0);

            String result = candidate
                    .getJsonObject("content")
                    .getJsonArray("parts")
                    .getJsonObject(0)
                    .getString("text", "")
                    .trim();

            if (result.isBlank()) {
                throw new IllegalStateException(
                        "Gemini returned an empty translation."
                );
            }

            return result;
        }
    }
}
