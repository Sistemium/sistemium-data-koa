import { RouterContext } from '@koa/router';
import { DefaultState, Context } from 'koa';

export type ContextType = RouterContext<DefaultState, Context>
export type RolesFilter = undefined | ((state: DefaultState) => Object | Object[])
export type NormalizeItem = (o: Record<string, any>) => Record<string, any>
