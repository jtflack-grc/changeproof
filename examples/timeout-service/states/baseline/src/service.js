'use strict';

const REQUEST_TIMEOUT_SECONDS = 30;

function getRequestTimeoutSeconds() {
  return REQUEST_TIMEOUT_SECONDS;
}

function buildGatewayOptions() {
  return {
    timeoutSeconds: REQUEST_TIMEOUT_SECONDS,
    retryCount: 1,
    responseMode: 'stream'
  };
}

module.exports = { REQUEST_TIMEOUT_SECONDS, getRequestTimeoutSeconds, buildGatewayOptions };
