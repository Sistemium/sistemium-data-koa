import log from 'sistemium-debug'
import type { ContextType, KoaModel } from './types'
import { KoaModelController } from './types'

const { debug } = log('rest:GET')

export default function(model: KoaModel, controller?: KoaModelController) {

  const normalizeItem = controller?.normalizeItem || model.normalizeItem

  return async (ctx: ContextType) => {

    const {
      params: { id },
      path,
    } = ctx

    debug(path, id)

    const rolesFilter = ctx.state.rolesFilter || model.rolesFilter?.call(model, ctx.state)
    const pipe = [{ $match: { id } }]
    if (Array.isArray(rolesFilter)) {
      pipe.push(...rolesFilter)
    } else if (rolesFilter) {
      Object.assign(pipe[0].$match, rolesFilter)
    }

    if (controller?.getPipeline) {
      (pipe as object[]).push(...controller.getPipeline(ctx))
    }

    const [result] = await model.aggregate(pipe)

    ctx.assert(result, 404)
    ctx.body = normalizeItem.call(model, result)

  }

}
