import { Injectable, InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';
import { ServerError, CombinedGraphQLErrors, type FetchPolicy, type OperationVariables } from '@apollo/client';

/**
 * Normalised transport error so `WclApiService` can react to auth failures without
 * knowing the underlying GraphQL client. `status` is the HTTP status when known
 * (e.g. 401 for a rejected token), or 0 for a GraphQL-level / network error.
 */
export class WclTransportError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'WclTransportError';
  }
}

/**
 * The low-level GraphQL transport `WclApiService` delegates to. Swapped per
 * environment: the browser binds {@link ApolloWclTransport}; the Node ingestion
 * binds a plain-`fetch` implementation (apollo-angular does not run headless).
 * Everything above `query()` - auth, the typed `get*` reads, the slice transforms -
 * is identical in both environments.
 */
export interface WclTransport {
  /**
   * Run one GraphQL operation with the given bearer token. `cacheFirst` lets the
   * transport dedupe repeat reads within a session (Apollo's in-memory cache in the
   * browser; an in-process map in Node); pass false to always hit the network.
   * Throws {@link WclTransportError} on failure.
   */
  query<TData>(gqlString: string, variables: object, token: string, cacheFirst: boolean): Promise<TData>;
}

export const WCL_TRANSPORT = new InjectionToken<WclTransport>('WCL_TRANSPORT');

/**
 * Browser transport: apollo-angular. Attaches the bearer per request via operation
 * context (it must not be baked into the link, since it is renewed on expiry) and maps
 * Apollo's error shapes to {@link WclTransportError}.
 */
@Injectable({ providedIn: 'root' })
export class ApolloWclTransport implements WclTransport {
  private readonly apollo = inject(Apollo);

  async query<TData>(gqlString: string, variables: object, token: string, cacheFirst: boolean): Promise<TData> {
    const fetchPolicy: FetchPolicy = cacheFirst ? 'cache-first' : 'network-only';
    try {
      const result = await firstValueFrom(this.apollo.query<TData, OperationVariables>({
        query: gql(gqlString),
        variables: variables as OperationVariables,
        fetchPolicy,
        context: { headers: { Authorization: `Bearer ${token}` } },
      }));
      return result.data as TData;
    } catch (error) {
      // apollo-angular maps a non-2xx HTTP response to ServerError (with statusCode).
      if (ServerError.is(error)) {
        throw new WclTransportError(`WCL API error (${error.statusCode})`, error.statusCode);
      }
      // A 200 response carrying a top-level `errors` array surfaces as CombinedGraphQLErrors.
      if (CombinedGraphQLErrors.is(error)) {
        throw new WclTransportError(error.errors[0]?.message || 'WCL GraphQL error', 0);
      }
      throw error;
    }
  }
}
