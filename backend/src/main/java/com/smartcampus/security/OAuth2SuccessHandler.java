package com.smartcampus.security;

import com.smartcampus.entity.User;
import com.smartcampus.service.OAuth2UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final OAuth2UserService oAuth2UserService;

    @Value("${app.oauth2.authorized-redirect-uris}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            // ─────────────────────────────────────────────────────────────
            // "sub" works for BOTH Google and Microsoft — it is the unique
            // user ID in both OAuth2 providers.
            String userId = oAuth2User.getAttribute("sub");

            // Microsoft sometimes sends email inside "preferred_username"
            // instead of "email", so we check both.
            String email = oAuth2User.getAttribute("email");
            if (email == null) {
                email = oAuth2User.getAttribute("preferred_username");
            }

            // Microsoft sends the display name as "name" (same as Google),
            // but may also use "givenname" + "surname" as fallback.
            String name = oAuth2User.getAttribute("name");
            if (name == null) {
                String given  = oAuth2User.getAttribute("givenname");
                String family = oAuth2User.getAttribute("surname");
                if (given != null || family != null) {
                    name = (given != null ? given : "") +
                           (family != null ? " " + family : "");
                }
            }
            if (name == null && email != null) {
                // Last resort — use the part before @ as display name
                name = email.split("@")[0];
            }

            // Google uses "picture"; Microsoft uses "picture" too via
            // the /oidc/userinfo endpoint we configured in properties.
            String avatarUrl = oAuth2User.getAttribute("picture");
            // ─────────────────────────────────────────────────────────────

            log.info("OAuth2 success for: {} (provider userId={})", email, userId);

            // Delegate all DB work to the @Transactional service
            User user = oAuth2UserService.processOAuthUser(userId, email, name, avatarUrl);
            String jwt = tokenProvider.generateTokenFromUserId(user.getId());

            String target = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("token", jwt)
                    .build().toUriString();

            log.info("Redirecting to: {}", target);
            getRedirectStrategy().sendRedirect(request, response, target);

        } catch (Exception e) {
            log.error("OAuth2 handler failed: {}", e.getMessage(), e);
            String errorUrl = redirectUri.replace("/oauth2/redirect", "/login?error=true");
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }
}

