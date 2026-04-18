package com.smartcampus.security;

import com.smartcampus.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String fullName;
    private final Collection<? extends GrantedAuthority> authorities;

    private UserPrincipal(Long id, String email, String fullName,
                          Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))
                .collect(Collectors.toList());
        return new UserPrincipal(user.getId(), user.getEmail(), user.getFullName(), authorities);
    }

    @Override public String getUsername()  { return email; }
    @Override public String getPassword()  { return null; }
    @Override public boolean isAccountNonExpired()   { return true; }
    @Override public boolean isAccountNonLocked()    { return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()             { return true; }
}

