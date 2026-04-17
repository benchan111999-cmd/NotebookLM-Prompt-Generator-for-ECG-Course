# Security Policy

## Supported versions

This project currently supports security updates on the latest `main` branch.

## Reporting a vulnerability

If you discover a vulnerability, please open a private security advisory on GitHub or contact the maintainers directly.

Please include:
- A clear description of the issue
- Reproduction steps
- Potential impact
- Suggested remediation (if available)

We will acknowledge reports as quickly as possible and prioritize severe issues such as secret exposure, data leakage, or remote code execution.

## Key handling requirements

- Never expose `GEMINI_API_KEY` in frontend bundles.
- Never place secrets in variables prefixed with `VITE_`.
- Store secrets only in local/server environment files (for example, `.env.local`) and keep them out of source control.
- Route Gemini calls through the backend API (`/api/refine-focus`).

## Rate limiting

To reduce abuse risk on Gemini-backed endpoints:

- `POST /api/refine-focus` is rate-limited to **20 requests per minute per IP**.
- `GET /api/health` is excluded so availability probes are not blocked.
- Exceeded requests return HTTP `429` with `{ "error": "Too many requests. Please retry in 1 minute." }`.
- The server logs key throttle telemetry (`path`, `method`, `ip`, `userAgent`, `windowMs`, `max`) for incident triage.
