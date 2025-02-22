import { RouterContext } from '@koa/router'
import { DefaultState, Context } from 'koa'
import { BaseItem, Model } from 'sistemium-data'
import { RequestOptions } from 'sistemium-data/lib/Model'

export type { BaseItem }
export type ContextType = RouterContext<DefaultState, Context>
export type RolesFilter = undefined | ((state: DefaultState) => BaseItem | BaseItem[])
export type NormalizeItem<T extends BaseItem = BaseItem> = (i: Partial<T>, d?: Partial<T>, o?: Partial<T>) => T

export interface KoaModel<T extends BaseItem = BaseItem> extends Model<T> {
  normalizeItem: NormalizeItem<T>
  rolesFilter?: RolesFilter
  mergeBy?: string[]
  merge(array: Partial<T>[], options?: RequestOptions): Promise<T>
}


export interface KoaModelController<T extends BaseItem = BaseItem> {
  // storageModel?: KoaModel<ST>
  normalizeItem?(this: KoaModel<T>, item: Partial<T>): T
  normalizeItemRead?(this: KoaModel<T>, item: T): T
  normalizeItemWrite?(this: KoaModel<T>, item: Partial<T>, defaults?: BaseItem & Partial<T>, overwrites?: BaseItem): Partial<T>
  getPipeline?(ctx: ContextType) : BaseItem[]
}
