package graduate.finance_dashboard.service;

import graduate.finance_dashboard.config.EmailValidator;
import graduate.finance_dashboard.dto.LoginRequest;
import graduate.finance_dashboard.dto.RegistrationRequest;
import graduate.finance_dashboard.exception.ApiException;
import graduate.finance_dashboard.model.User;
import graduate.finance_dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final EmailValidator emailValidator;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found with provided email", HttpStatus.NOT_FOUND));
    }

    public User login(LoginRequest loginRequest) {
        User user = getUserByEmail(loginRequest.getEmail());
        if (!bCryptPasswordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
        return user;
    }

    public String register(RegistrationRequest request) {
        if (!emailValidator.test(request.getEmail())) {
            throw new ApiException("Invalid email format", HttpStatus.BAD_REQUEST);
        }

        boolean emailExists = userRepository.findByEmail(request.getEmail()).isPresent();
        if (emailExists) {
            throw new ApiException("User with this email already exists", HttpStatus.CONFLICT);
        }

        User user = new User(
            request.getFirstName(),
            request.getLastName(),
            request.getEmail(), 
            bCryptPasswordEncoder.encode(request.getPassword()),
            request.getEmail(),
            LocalDateTime.now()
        );

        userRepository.save(user);
        return "Registration successful! You can now log in.";
    }
}
