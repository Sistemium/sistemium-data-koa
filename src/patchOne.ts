import lo from 'lodash'
import log from 'sistemium-debug'
import { ContextType, KoaModel, KoaModelController } from './types'
import { authorizedFindOne } from './getOne'
import { BaseItem } from 'sistemium-data'

const { debug } = log('rest:PATCH')

export default function<T extends BaseItem = BaseItem>(model: KoaModel<T>, controller?: KoaModelController<T>) {

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
    const data = body as Partial<T>

    debug('PATCH', path, id, data)

    const item = await authorizedFindOne<T>(model, id, ctx, controller)

    ctx.assert(item, 404)

    const props = {
      ...normalizeItemWrite.call(model, data, item),
      [model.idProperty]: id,
    }

    await model.updateOne(props)

    const result = await authorizedFindOne(model, id, ctx, controller)

    if (!result) {
      ctx.status = 410
    }

    ctx.body = result || ''

  }
}
