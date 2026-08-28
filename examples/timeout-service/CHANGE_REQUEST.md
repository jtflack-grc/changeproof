# Change Request: CHG-WEB-017

## Title
Increase outbound request timeout for Report Gateway

## Affected System
REPORT-GW — small Node.js HTTP service

## Description
Increase the Report Gateway application request timeout from 30 seconds to 60 seconds. Long-running report generation has begun exceeding the existing 30-second application timeout during peak periods.

The requested change is limited to the application request timeout. No API contract or response-shape changes are requested.

## Acceptance Criteria
1. The application request timeout is 60 seconds.
2. Existing request handling remains unchanged apart from the timeout value.
3. The timeout configuration is reviewable in source and covered by a local automated test.

## Keywords
Keywords: timeout, request, API, gateway, 30, 60, seconds
