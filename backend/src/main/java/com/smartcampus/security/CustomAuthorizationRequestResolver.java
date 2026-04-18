package com.smartcampus.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.LinkedHashMap;
import java.util.Map;

public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final OAuth2AuthorizationRequestResolver defaultResolver;

    public CustomAuthorizationRequestResolver(ClientRegistrationRepository repo, String authorizationRequestBaseUri) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(repo, authorizationRequestBaseUri);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request);
        return customize(req);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request, clientRegistrationId);
        return customize(req);
    }

    private OAuth2AuthorizationRequest customize(OAuth2AuthorizationRequest req) {
        if (req == null) return null;
        Map<String, Object> extraParams = new LinkedHashMap<>(req.getAdditionalParameters());
        extraParams.put("prompt", "select_account");
        return OAuth2AuthorizationRequest.from(req)
                .additionalParameters(extraParams)
                .build();
    }
}
