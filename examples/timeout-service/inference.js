'use strict';

/**
 * Scenario-specific inference plug-in for the reusable ChangeProof core.
 * It does not scan files itself. It consumes the common RawSymbol inventory
 * produced by core.js and emits a normal ChangeProof Finding only when the
 * application timeout exceeds the upstream proxy timeout.
 */
function inferTimeoutOrdering({ allSymbols, model }) {
  const { Finding, EVIDENCE_BASIS, STATUS, VALIDATION_TARGET, ARTIFACT_TYPE } = model;

  const app = allSymbols.find(symbol =>
    symbol.name === 'REQUEST_TIMEOUT_SECONDS' && symbol.type === 'numeric_literal'
  );
  const proxy = allSymbols.find(symbol =>
    String(symbol.name).toLowerCase() === 'proxy_read_timeout_seconds'
  );

  if (!app || !proxy) return null;

  const appSeconds = Number(app.value);
  const proxySeconds = Number(proxy.value);
  if (!Number.isFinite(appSeconds) || !Number.isFinite(proxySeconds)) return null;
  if (appSeconds <= proxySeconds) return null;

  return new Finding({
    id: 'inferred-upstream-timeout-ordering',
    artifact: proxy._relFile,
    artifactType: ARTIFACT_TYPE.CONFIG,
    evidenceBasis: EVIDENCE_BASIS.INFERRED,
    status: STATUS.OPEN,
    validationTarget: VALIDATION_TARGET.LOCAL,
    symbol: `proxy(${proxySeconds}) < app(${appSeconds})`,
    finding: `The application request timeout is ${appSeconds}s, but the upstream proxy timeout remains ${proxySeconds}s. Requests may be terminated by the proxy before the application timeout can take effect. Remediation: set the upstream timeout above ${appSeconds}s or document an intentional shorter boundary.`,
    lineRef: proxy.lineRef,
    keywords: ['timeout', String(appSeconds), String(proxySeconds), 'proxy', 'upstream'],
    relevanceScore: 8
  });
}

module.exports = { inferTimeoutOrdering };
