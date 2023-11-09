import { RouterContext } from '@koa/router'
import { DefaultState, Context } from 'koa'
import { Model, FULL_RESPONSE_OPTION } from 'sistemium-data'

export type BaseItem = Record<string, any>
export type ContextType = RouterContext<DefaultState, Context>
export type RolesFilter = undefined | ((state: DefaultState) => Object | Object[])
export type NormalizeItem = (i: BaseItem, d?: BaseItem, o?: BaseItem) => Record<string, any>
interface IFullResponse {
  data: object[]
  headers: BaseItem
}

export interface KoaModel extends Model {
  normalizeItem: NormalizeItem
  rolesFilter?: RolesFilter
  mergeBy?: string[]

  aggregate(pipeline?: any[]): Promise<object[]>
  aggregate(pipeline?: any[], fullResponseOptions?: BaseItem & { [FULL_RESPONSE_OPTION]: true }): Promise<IFullResponse>
  aggregate(pipeline?: any[], options?: BaseItem): Promise<object[]>
}
