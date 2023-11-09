import { RouterContext } from '@koa/router';
import { DefaultState, Context } from 'koa';

export type BaseItem = Record<string, any>
export type ContextType = RouterContext<DefaultState, Context>
export type RolesFilter = undefined | ((state: DefaultState) => Object | Object[])
export type NormalizeItem = (i: BaseItem, d?: BaseItem, o?: BaseItem ) => Record<string, any>
