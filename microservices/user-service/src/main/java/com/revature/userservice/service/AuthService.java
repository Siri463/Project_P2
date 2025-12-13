package com.revature.userservice.service;

import com.revature.userservice.dto.AuthResponse;
import com.revature.userservice.dto.LoginRequest;
import com.revature.userservice.dto.RegisterRequest;
import com.revature.userservice.entity.User;
import com.revature.userservice.exception.DuplicateUserException;
import com.revature.userservice.exception.InvalidCredentialsException;
import com.revature.userservice.repository.UserRepository;
import com.revature.userservice.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateUserException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(User.UserRole.CUSTOMER);
        user.setIsActive(true);

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
            user.getUserId(),
            user.getEmail(),
            user.getFullName(),
            user.getPhone(),
            user.getRole().name()
        );
        return new AuthResponse(token, userDto);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
            user.getUserId(),
            user.getEmail(),
            user.getFullName(),
            user.getPhone(),
            user.getRole().name()
        );
        return new AuthResponse(token, userDto);
    }
}
