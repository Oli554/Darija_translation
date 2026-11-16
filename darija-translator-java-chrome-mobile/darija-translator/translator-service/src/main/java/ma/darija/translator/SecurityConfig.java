package ma.darija.translator;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.security.enterprise.authentication.mechanism.http.BasicAuthenticationMechanismDefinition;
import jakarta.security.enterprise.credential.Credential;
import jakarta.security.enterprise.credential.UsernamePasswordCredential;
import jakarta.security.enterprise.identitystore.CredentialValidationResult;
import jakarta.security.enterprise.identitystore.IdentityStore;

import java.util.Set;

@BasicAuthenticationMechanismDefinition(realmName = "DarijaTranslator")
@ApplicationScoped
public class SecurityConfig {
}

@ApplicationScoped
class DemoIdentityStore implements IdentityStore {
    @Override
    public CredentialValidationResult validate(Credential credential) {
        if (!(credential instanceof UsernamePasswordCredential userCredential)) {
            return CredentialValidationResult.INVALID_RESULT;
        }
        String username = System.getenv().getOrDefault("TRANSLATOR_USERNAME", "translator");
        String password = System.getenv().getOrDefault("TRANSLATOR_PASSWORD", "Oumnia123!");
        if (userCredential.compareTo(username, password)) {
            return new CredentialValidationResult(username, Set.of("USER"));
        }
        return CredentialValidationResult.INVALID_RESULT;
    }
}
