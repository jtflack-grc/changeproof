# REPORT-GW Runbook

## Request handling

- Application request timeout: 60 seconds.
- Edge proxy read timeout: 45 seconds.
- Retry count: 1.

The edge proxy terminates connections that remain open beyond its read timeout.
