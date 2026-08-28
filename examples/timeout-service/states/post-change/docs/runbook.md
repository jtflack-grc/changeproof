# REPORT-GW Runbook

## Request handling

- Application request timeout: 60 seconds.
- Edge proxy read timeout: 75 seconds.
- Retry count: 1.

The upstream edge timeout remains deliberately longer than the application timeout so the service retains control of timeout behavior.
