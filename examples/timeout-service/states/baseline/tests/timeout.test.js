'use strict';

const { getRequestTimeoutSeconds, buildGatewayOptions } = require('../src/service');

describe('CHG-WEB-017 timeout acceptance', () => {
  test('application request timeout is 60 seconds', () => {
    expect(getRequestTimeoutSeconds()).toBe(60);
  });

  test('existing gateway behavior remains unchanged apart from timeout', () => {
    const options = buildGatewayOptions();
    expect(options.retryCount).toBe(1);
    expect(options.responseMode).toBe('stream');
  });
});
