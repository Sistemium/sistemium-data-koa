import lo from 'lodash'
import log from 'sistemium-debug'
import { ContextType, KoaModel, KoaModelController } from './types'
import { authorizedFindOne } from './getOne'

const { debug } = log('rest:PATCH')

export default function(model: KoaModel, controller?: KoaModelController) {

  const normalizeItemWrite = controller?.normalizeItemWrite
    || controller?.normalizeItem
    || model.normalizeItem

  return async (ctx: ContextType) => {

    const {
      params: { id },
      path,
      request: { body },
    } = ctx

    ctx.assert(lo.isObject(body), 410, 'PATCH body must be object')

    debug('PATCH', path, id, body)

    const item = await authorizedFindOne(model, id, ctx, controller)

    ctx.assert(item, 404)

    const props = {
      ...normalizeItemWrite.call(model, body),
      [model.idProperty]: id,
    }

    await model.updateOne(props)

    const result = await authorizedFindOne(model, id, ctx, controller)

    if (!result) {
      ctx.status = 310
    }

    ctx.body = result || ''

  }
}
