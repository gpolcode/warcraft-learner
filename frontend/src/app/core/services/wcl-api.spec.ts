import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclApiService } from './wcl-api';
import { WclAuthService } from './wcl-auth';
import { LiveModeState } from './live-mode-state';
import { WCL_TRANSPORT, WCL_INGEST_MODE, WclTransport, WclTransportError } from './wcl-transport';

// Minimal valid report shape so getReport / getAllEvents complete without a network.
const REPORT_SHAPE = {
  reportData: { report: { fights: [], masterData: {}, events: { data: [], nextPageTimestamp: undefined } } },
};

/**
 * Records the `cacheFirst` flag of every query so the fetch policy can be asserted, and
 * returns a valid report shape. `cacheFirstCalls.length` is the transport hit count, so a
 * memo hit (no transport call) is observable.
 */
class RecordingTransport implements WclTransport {
  readonly cacheFirstCalls: boolean[] = [];
  async query<TData>(_gqlString: string, _variables: object, _token: string, cacheFirst: boolean): Promise<TData> {
    this.cacheFirstCalls.push(cacheFirst);
    return REPORT_SHAPE as unknown as TData;
  }
}

/** Throws a non-401 transport error on the first call, then succeeds, to test memo eviction. */
class FailOnceTransport implements WclTransport {
  calls = 0;
  async query<TData>(): Promise<TData> {
    this.calls++;
    if (this.calls === 1) throw new WclTransportError('boom', 0);
    return REPORT_SHAPE as unknown as TData;
  }
}

const authStub = { getToken: async () => 'test-token', invalidate: () => undefined };

function setup<T extends WclTransport = RecordingTransport>(
  opts: { ingest: boolean; transport?: T },
): { api: WclApiService; transport: T; live: LiveModeState } {
  const transport = (opts.transport ?? new RecordingTransport()) as T;
  TestBed.configureTestingModule({
    providers: [
      WclApiService,
      { provide: WclAuthService, useValue: authStub as unknown as WclAuthService },
      { provide: WCL_TRANSPORT, useValue: transport },
      { provide: WCL_INGEST_MODE, useValue: opts.ingest },
    ],
  });
  return { api: TestBed.inject(WclApiService), transport, live: TestBed.inject(LiveModeState) };
}

describe('WclApiService fetch policy', () => {
  it('reads the report cache-first for a saved (non-live) report', async () => {
    const { api, transport, live } = setup({ ingest: false });
    live.active.set(false);
    await api.getReport('code');
    expect(transport.cacheFirstCalls).toEqual([true]);
  });

  it('reads the report network-only while live-syncing', async () => {
    const { api, transport, live } = setup({ ingest: false });
    live.active.set(true);
    await api.getReport('code');
    expect(transport.cacheFirstCalls).toEqual([false]);
  });

  it('reads events cache-first for a saved report and network-only while live-syncing', async () => {
    const { api, transport, live } = setup({ ingest: false });
    live.active.set(false);
    await api.getAllEvents('code', 1, 'Casts', 0, 100, 6);
    live.active.set(true);
    await api.getAllEvents('code', 1, 'Casts', 0, 100, 6);
    expect(transport.cacheFirstCalls).toEqual([true, false]);
  });

  it('always reads cache-first under ingest mode, regardless of live state', async () => {
    const { api, transport, live } = setup({ ingest: true });
    live.active.set(true);
    await api.getReport('code');
    await api.getAllEvents('code', 1, 'Casts', 0, 100, 6);
    expect(transport.cacheFirstCalls).toEqual([true, true]);
  });
});

describe('WclApiService response memo', () => {
  it('serves a repeated cache-first read from the memo without a second transport hit', async () => {
    const { api, transport, live } = setup({ ingest: false });
    live.active.set(false);
    await api.getReport('code');
    await api.getReport('code');
    expect(transport.cacheFirstCalls).toEqual([true]);
  });

  it('refetches when the query variables differ', async () => {
    const { api, transport, live } = setup({ ingest: false });
    live.active.set(false);
    await api.getReport('code-a');
    await api.getReport('code-b');
    expect(transport.cacheFirstCalls.length).toBe(2);
  });

  it('does not memoize while live-syncing, so each poll refetches', async () => {
    const { api, transport, live } = setup({ ingest: false });
    live.active.set(true);
    await api.getReport('code');
    await api.getReport('code');
    expect(transport.cacheFirstCalls).toEqual([false, false]);
  });

  it('does not memoize under ingest mode (the Node transport dedupes on its own)', async () => {
    const { api, transport, live } = setup({ ingest: true });
    live.active.set(false);
    await api.getReport('code');
    await api.getReport('code');
    expect(transport.cacheFirstCalls.length).toBe(2);
  });

  it('evicts a failed read so a retry refetches instead of replaying the error', async () => {
    const { api, transport, live } = setup({ ingest: false, transport: new FailOnceTransport() });
    live.active.set(false);
    await expect(api.getReport('code')).rejects.toBeInstanceOf(WclTransportError);
    await api.getReport('code');
    expect(transport.calls).toBe(2);
  });
});
