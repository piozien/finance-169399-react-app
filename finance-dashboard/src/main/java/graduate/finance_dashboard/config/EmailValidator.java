package graduate.finance_dashboard.config;

import org.springframework.stereotype.Service;

import java.util.function.Predicate;
import java.util.regex.Pattern;

@Service
public class EmailValidator implements Predicate<String> {

    /**
     * Regular expression pattern for email validation
     * This pattern checks for:
     * - Local part (before @): letters, numbers, and common special characters
     * - Domain part (after @): letters, numbers, dots, and hyphens
     * - Top-level domain: at least 2 characters
     */
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    /**
     * Validates the provided email address against the EMAIL_PATTERN
     * @param email The email address to validate
     * @return true if the email is valid, false otherwise
     */
    @Override
    public boolean test(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }
}