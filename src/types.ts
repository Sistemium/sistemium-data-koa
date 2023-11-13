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

  aggregate(pipeline?: BaseItem[]): Promise<BaseItem[]>
  aggregate(pipeline?: BaseItem[], fullResponseOptions?: BaseItem & { [FULL_RESPONSE_OPTION]: true }): Promise<IFullResponse>
  aggregate(pipeline?: BaseItem[], options?: BaseItem): Promise<BaseItem[]>
}


export interface KoaModelController<T = BaseItem, RT = BaseItem> {
  normalizeItem?(item: T): RT
  normalizeItemRead?(item: T): RT
  normalizeItemWrite?(item: T, defaults?: T, overwrites?: T): RT
  getPipeline?(ctx: ContextType) : BaseItem[]
}
