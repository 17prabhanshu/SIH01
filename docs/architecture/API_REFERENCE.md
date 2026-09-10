# API Reference

## Authentication Domain

### `POST /api/v1/auth/register`
Register a new user.
- **Request**: `{"email": "...", "password": "...", "full_name": "..."}`
- **Response**: `{"id": 1, "email": "...", "role": "USER"}`
- **Auth**: None.

### `POST /api/v1/auth/login`
Login and get tokens.
- **Request**: OAuth2 form data (`username`, `password`)
- **Response**: `{"access_token": "...", "refresh_token": "...", "token_type": "bearer"}`
- **Rate Limit**: 5 attempts per minute per IP.

### `POST /api/v1/auth/refresh`
Rotate tokens.
- **Request**: `{"refresh_token": "..."}`
- **Response**: New access and refresh tokens.

### `GET /api/v1/auth/me`
Current user profile.
- **Auth**: Bearer token required.

---

## Admin Domain

### `GET /api/v1/admin/users`
List system users. (Requires `ADMIN` role).

### `PATCH /api/v1/admin/users/{id}/role`
Update a user's role. (Requires `ADMIN` role).

### `GET /api/v1/admin/audit-log`
View system audit trails. (Requires `ADMIN` role).

---

## Data Domain

### `GET /api/v1/data/rainfall/latest`
Latest rainfall data. Query: `?state=assam`.

### `GET /api/v1/data/sensors`
List of registered IoT sensors and their status.

---

## Landslides Domain

### `GET /api/v1/landslides`
Query landslide events with filters (`?start_date=...&end_date=...`).

### `POST /api/v1/landslides`
Add a new event. (Requires `ANALYST` role or higher).

---

## Error Codes
- **400 Bad Request**: Invalid input parameters.
- **401 Unauthorized**: Missing or invalid token.
- **403 Forbidden**: Insufficient role privileges.
- **404 Not Found**: Resource does not exist.
- **429 Too Many Requests**: Rate limit exceeded.
- **500 Internal Server Error**: Unexpected backend failure.

## WebSockets
- Connect to `wss://api.domain.com/ws/alerts` for real-time push notifications of high-risk landslide zones.
