import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FetchOutcomes, WclTransport, WclTransportError, WCL_UNUSABLE_STATUS } from '../wcl/wcl-transport';
import { ENVIRONMENT } from '../../../../../environments/environment-token';
import { WclCaching } from '../wcl/wcl-caching';

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: { message: string }[];
}

interface OpenScope {
  failedCodes: Set<string>;
}

// The bearer is attached per request because the token renews on expiry.
@Injectable({ providedIn: 'root' })
export class HttpWclTransport implements WclTransport {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(ENVIRONMENT).wclApiUrl;
  private scope: OpenScope | null = null;

  async withFetchOutcomes<T>(run: () => Promise<T>): Promise<{ result: T; outcomes: FetchOutcomes }> {
    const enclosing = this.scope;
    const outcomes: OpenScope = { failedCodes: new Set() };
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
    let body: GraphQLResponse<TData>;
    try {
      body = await firstValueFrom(this.http.post<GraphQLResponse<TData>>(
        this.apiUrl,
        { query: gqlString, variables },
        { headers },
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
