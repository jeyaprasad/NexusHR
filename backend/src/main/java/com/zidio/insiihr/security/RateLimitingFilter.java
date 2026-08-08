package com.zidio.insiihr.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitingFilter implements Filter {

    private final Map<String, UserRateLimit> rateLimitMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 100;
    private static final long WINDOW_MS = 60_000;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getRequestURI();

        if (path.startsWith("/api/auth/") || path.startsWith("/actuator/")) {
            chain.doFilter(request, response);
            return;
        }

        String key = getClientIp(httpRequest);

        UserRateLimit limit = rateLimitMap.computeIfAbsent(key, k -> new UserRateLimit());
        if (!limit.allowRequest()) {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\":\"Too many requests\",\"message\":\"Rate limit exceeded. Try again in 60 seconds.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) return xf.split(",")[0].trim();
        String ra = request.getRemoteAddr();
        return ra != null ? ra : "unknown";
    }

    private static class UserRateLimit {
        private final AtomicInteger counter = new AtomicInteger(0);
        private final long windowStart = System.currentTimeMillis();

        boolean allowRequest() {
            long elapsed = System.currentTimeMillis() - windowStart;
            if (elapsed > WINDOW_MS) {
                counter.set(0);
                return true;
            }
            return counter.incrementAndGet() <= MAX_REQUESTS;
        }
    }
}
