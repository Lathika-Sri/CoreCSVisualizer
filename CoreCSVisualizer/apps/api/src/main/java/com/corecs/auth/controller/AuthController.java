package com.corecs.auth.controller;

import com.corecs.auth.model.AppUser;
import com.corecs.auth.service.AuthService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService auth;
  public AuthController(AuthService auth) { this.auth = auth; }

  record AuthRequest(@NotBlank String name, @NotBlank @Email String email, @NotBlank @Size(min=6) String password) {}
  record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
  record AuthResponse(Long id, String name, String email, String token) {}
  record MeResponse(Long id, String name, String email) {}

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
    AppUser user = auth.register(request.name(), request.email(), request.password());
    return ResponseEntity.ok(new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getSessionToken()));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
    AppUser user = auth.login(request.email(), request.password());
    return ResponseEntity.ok(new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getSessionToken()));
  }

  @GetMapping("/me")
  public ResponseEntity<MeResponse> me(@RequestHeader(value="Authorization", required=false) String authorization) {
    String token = bearer(authorization);
    AppUser user = auth.fromToken(token);
    return ResponseEntity.ok(new MeResponse(user.getId(), user.getName(), user.getEmail()));
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(@RequestHeader(value="Authorization", required=false) String authorization) {
    auth.logout(bearer(authorization));
    return ResponseEntity.noContent().build();
  }

  private String bearer(String authorization) {
    if (authorization == null || !authorization.startsWith("Bearer ")) throw new IllegalArgumentException("Authentication required.");
    return authorization.substring(7).trim();
  }
}
