import lo from 'lodash'
import log from 'sistemium-debug'
import { ContextType, KoaModel } from './types'

const { debug } = log('rest:PATCH')

export default function(model: KoaModel) {

  return async (ctx: ContextType) => {

    const {
      params: { id },
      path,
      request: { body },
    } = ctx

    ctx.assert(lo.isObject(body), 410, 'PATCH body must be object')

    debug('PATCH', path, id, body)

    const item = await model.findOne({ [model.idProperty]: id })

    ctx.assert(item, 404)

    const props = {
      ...body,
      [model.idProperty]: id,
      ...lo.pick(item, model.mergeBy || []),
    }

    ctx.body = await model.updateOne(props)

  }
}
