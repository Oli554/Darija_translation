package ma.darija.translator;

public record TranslateResponse(
        String sourceText,
        String translation,
        String sourceLanguage,
        String targetLanguage
) {
}