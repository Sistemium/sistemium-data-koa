import { RouterContext } from '@koa/router'
import { DefaultState, Context } from 'koa'
import { BaseItem, Model } from 'sistemium-data'

export type { BaseItem }
export type ContextType = RouterContext<DefaultState, Context>
export type RolesFilter = undefined | ((state: DefaultState) => Object | Object[])
export type NormalizeItem = (i: BaseItem, d?: BaseItem, o?: BaseItem) => Record<string, any>


export interface KoaModel extends Model {
  normalizeItem: NormalizeItem
  rolesFilter?: RolesFilter
  mergeBy?: string[]
}


export interface KoaModelController<T = BaseItem, RT = BaseItem> {
  normalizeItem?(item: T): RT
  normalizeItemRead?(item: T): RT
  normalizeItemWrite?(item: T, defaults?: T, overwrites?: T): RT
  getPipeline?(ctx: ContextType) : BaseItem[]
}
