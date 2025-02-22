import log from 'sistemium-debug'
import type { BaseItem, ContextType, KoaModel } from './types'
import { KoaModelController } from './types'

const { debug } = log('rest:GET')

export default function(model: KoaModel, controller?: KoaModelController) {
  return async (ctx: ContextType) => {

    const {
      params: { id },
      path,
    } = ctx

    debug(path, id)

    const result = await authorizedFindOne(model, id, ctx, controller)

    ctx.assert(result, 404)
    ctx.body = result

  }
}

export async function authorizedFindOne<T extends BaseItem = BaseItem>(model: KoaModel<T>, id: string, ctx: ContextType, controller?: KoaModelController<T>): Promise<T | undefined> {
  const rolesFilter = ctx.state.rolesFilter || model.rolesFilter?.call(model, ctx.state)
  const pipe = [{ $match: { [model.idProperty]: id } }]
  const normalizeItem = controller?.normalizeItemRead
    || controller?.normalizeItem
    || model.normalizeItem

  if (Array.isArray(rolesFilter)) {
    pipe.push(...rolesFilter)
  } else if (rolesFilter) {
    Object.assign(pipe[0].$match, rolesFilter)
  }

  if (controller?.getPipeline) {
    (pipe as BaseItem[]).push(...controller.getPipeline(ctx))
  }

  const [result] = await model.aggregate(pipe)
  return result && normalizeItem.call(model, result)
}
