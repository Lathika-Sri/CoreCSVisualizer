package com.corecs.auth.service;

import com.corecs.auth.model.AppUser;
import com.corecs.auth.repository.AppUserRepository;
import java.util.UUID;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final AppUserRepository users;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public AuthService(AppUserRepository users) { this.users = users; }

  @Transactional
  public AppUser register(String name, String email, String password) {
    String normalized = email.trim().toLowerCase();
    if (users.findByEmailIgnoreCase(normalized).isPresent()) throw new IllegalArgumentException("An account with this email already exists.");
    if (password == null || password.length() < 6) throw new IllegalArgumentException("Password must contain at least 6 characters.");
    AppUser user = new AppUser();
    user.setName(name.trim());
    user.setEmail(normalized);
    user.setPasswordHash(encoder.encode(password));
    user.setSessionToken(UUID.randomUUID().toString());
    return users.save(user);
  }

  @Transactional
  public AppUser login(String email, String password) {
    AppUser user = users.findByEmailIgnoreCase(email.trim().toLowerCase())
        .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
    if (!encoder.matches(password, user.getPasswordHash())) throw new IllegalArgumentException("Invalid email or password.");
    user.setSessionToken(UUID.randomUUID().toString());
    return users.save(user);
  }

  public AppUser fromToken(String token) {
    if (token == null || token.isBlank()) throw new IllegalArgumentException("Authentication required.");
    return users.findBySessionToken(token).orElseThrow(() -> new IllegalArgumentException("Session expired. Please sign in again."));
  }

  @Transactional
  public void logout(String token) {
    if (token == null || token.isBlank()) return;
    users.findBySessionToken(token).ifPresent(user -> { user.setSessionToken(null); users.save(user); });
  }
}
