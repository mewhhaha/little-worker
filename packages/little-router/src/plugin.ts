import { Queries } from "./fetch.js";
import { AnyResponse } from "./types.js";

export type PluginContext<
  HINT extends {
    init?: RequestInit;
    search?: Queries;
  } = {
    init?: RequestInit;
    search?: Queries;
  }
> = {
  readonly request: Request;
  readonly url: URL;
  readonly params: Record<string, string>;
  /**
   * This is only used for adding typing hints to requests
   * @private */
  readonly __hint?: HINT;
};
/**
 * _hint is for giving hints to the consumer making the request
 * regarding the request init and any possible search params
 * */
export type Plugin<REST_ARGS extends unknown[] = unknown[]> = (
  { request, url, params }: PluginContext<any>,
  ...rest: REST_ARGS
) =>
  | Promise<Record<string, any> | AnyResponse>
  | Record<string, any>
  | AnyResponse;
