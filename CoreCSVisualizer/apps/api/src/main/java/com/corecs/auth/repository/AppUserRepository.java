package com.corecs.auth.repository;

import com.corecs.auth.model.AppUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
  Optional<AppUser> findByEmailIgnoreCase(String email);
  Optional<AppUser> findBySessionToken(String sessionToken);
}
