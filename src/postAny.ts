import log from 'sistemium-debug'
import lo from 'lodash'
import { mapSeries } from 'async'
import type { BaseItem, ContextType, KoaModel, KoaModelController } from './types'

const { debug } = log('rest:POST')

export default function(model: KoaModel, controller?: KoaModelController) {

  const normalizeItemRead = controller?.normalizeItemRead
    || controller?.normalizeItem
    || model.normalizeItem

  const normalizeItemWrite = controller?.normalizeItemWrite
    || controller?.normalizeItem
    || model.normalizeItem

  return async (ctx: ContextType) => {

    const {
      request: { body },
      path,
      params: { id },
      state: { account },
    } = ctx
    const options = { headers: { ...ctx.headers } }
    const isArray = Array.isArray(body)

    ctx.assert(!isArray || !id, 400, 'Can not post array with id')

    const { authId: creatorAuthId } = account || {}
    const data: BaseItem[] = isArray ? body : [id ? { ...(body as any[]), id } : body]
    const normalized = data.map(item => normalizeItemWrite.call(model, item, {}, { creatorAuthId }))

    debug('POST', path, data.length, 'records', creatorAuthId, options)

    const $in = await model.merge(normalized, options) as unknown as string[]
    const foundMerged = await findMerged()
    const merged = foundMerged.map(item => normalizeItemRead.call(model, item))

    ctx.body = isArray ? merged : lo.first(merged)

    async function findMerged() {
      if (mergeById(model)) {
        return $in.length ? model.findAll({ [model.idProperty]: { $in } }) : []
      }
      return mapSeries(data, async (item: BaseItem) => {
        const keys = lo.pick(item, model.mergeBy || [model.idProperty])
        const [res] = await model.findAll(keys)
        return res
      })
    }

  }

}

function mergeById(model: KoaModel): boolean {
  const { mergeBy } = model
  return !mergeBy
    || (mergeBy.length === 1 && mergeBy[0] === model.idProperty)
}
