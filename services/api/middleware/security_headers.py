from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # Prevent XSS and code injection
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; object-src 'none';"
        
        # Enforce HTTPS
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Prevent MIME-type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent Clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Control Referrer info
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Control browser features
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(self)"
        
        return response
