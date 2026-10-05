import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NgHttpCachingService } from 'ng-http-caching';
import { FetchOutcomes, StoreTally, WclTransport, WclTransportError, WCL_UNUSABLE_STATUS } from '../wcl/wcl-transport';
import { ENVIRONMENT } from '../../../../../environments/environment-token';
import { WclCaching } from '../wcl/wcl-caching';
import { WCL_STORE_TALLY } from './wcl-response-store-interceptor';

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: { message: string }[];
}

interface OpenScope {
  failedCodes: Set<string>;
  store: StoreTally;
}

// The bearer is attached per request because the token renews on expiry.
@Injectable({ providedIn: 'root' })
export class HttpWclTransport implements WclTransport {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(NgHttpCachingService);
  private readonly apiUrl = inject(ENVIRONMENT).wclApiUrl;
  private scope: OpenScope | null = null;

  forget(gqlString: string, variables: object): void {
    this.cache.clearCacheByKey(WclCaching.cacheKey(new HttpRequest('POST', this.apiUrl, this.body(gqlString, variables))));
  }

  private body(gqlString: string, variables: object): object {
    return { query: gqlString, variables };
  }

  async withFetchOutcomes<T>(run: () => Promise<T>): Promise<{ result: T; outcomes: FetchOutcomes }> {
    const enclosing = this.scope;
    const outcomes: OpenScope = { failedCodes: new Set(), store: { hits: 0, misses: 0 } };
    this.scope = outcomes;
    try {
      return { result: await run(), outcomes };
    } finally {
      this.scope = enclosing;
    }
  }

  private recordFailure(code: string | undefined): void {
    if (!code || !this.scope) return;
    this.scope.failedCodes.add(code);
  }

  async query<TData>(gqlString: string, variables: object, token: string): Promise<TData> {
    const headers: Record<string, string> = { Authorization: `Bearer ${token}`, ...WclCaching.headersFor(gqlString) };
    const code = (variables as { code?: string }).code;
    const context = this.scope ? new HttpContext().set(WCL_STORE_TALLY, this.scope.store) : undefined;
    let body: GraphQLResponse<TData>;
    try {
      body = await firstValueFrom(this.http.post<GraphQLResponse<TData>>(
        this.apiUrl,
        this.body(gqlString, variables),
        { headers, context },
      ));
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        // 401 is the auth layer's to retry; any other HTTP error has spent the transient-retry interceptor.
        if (error.status !== 401) this.recordFailure(code);
        throw new WclTransportError(`WCL API error (${error.status})`, error.status);
      }
      throw error;
    }
    return this.usableData(body);
  }

  // A 200 that carries no usable data never improves on retry, so it classifies permanent and records no failure.
  private usableData<TData>(body: GraphQLResponse<TData>): TData {
    if (body.errors?.length) throw new WclTransportError(body.errors[0]?.message ?? 'WCL GraphQL error', WCL_UNUSABLE_STATUS);
    if (body.data === undefined) throw new WclTransportError('WCL response had no data', WCL_UNUSABLE_STATUS);
    return body.data;
  }
}
