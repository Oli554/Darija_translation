
package ma.darija.translator;

import jakarta.annotation.security.RolesAllowed;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

@Path("/translator")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class TranslatorResource {

    @Inject
    TranslationService translationService;

    @GET
    @Path("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "Darija Translator");
    }

    @OPTIONS
    @Path("/translate")
    @PermitAll
    public Response preflight() {
        return Response.ok().build();
    }

    @POST
    @Path("/translate")
    @RolesAllowed("USER")
    public Response translate(TranslateRequest request) {

        if (request == null || request.text() == null || request.text().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "The 'text' field is required."))
                    .build();
        }

        if (request.text().length() > 10000) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Text must be 10,000 characters or fewer."))
                    .build();
        }

        try {
            String translated = translationService.translate(request.text().trim());

            return Response.ok(
                    new TranslateResponse(
                            request.text(),
                            translated,
                            "English",
                            "Moroccan Darija"
                    )
            ).build();

        } catch (IllegalStateException e) {
            return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity(Map.of("error", e.getMessage()))
                    .build();

        } catch (Exception e) {
            e.printStackTrace();

            return Response.status(Response.Status.BAD_GATEWAY)
                    .entity(Map.of(
                            "error", e.getClass().getSimpleName() + ": " + e.getMessage()
                    ))
                    .build();
        }
    }
}
