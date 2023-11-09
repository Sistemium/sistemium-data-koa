import log from 'sistemium-debug'
import { Model } from 'sistemium-data'
import { BaseItem, ContextType, KoaModel } from './types'

const { debug } = log('rest:DELETE')

export const archiveConfig = {
  collection: 'Archive',
  schema: {
    name: String,
    data: Object,
    creatorAuthId: String,
  },
}

async function archiveCreate(archive: Model, data: BaseItem, id: string, name: string, creatorAuthId?: string) {
  return archive.merge([{ id, name, data, creatorAuthId }])
}

export default function(model: KoaModel, archiveModel?: Model) {

  return async (ctx: ContextType) => {

    const { path, params: { id }, state } = ctx

    ctx.assert(id, 400, 'Need an ID to perform DELETE')

    const authId = state.authId as string
    const filter = { [model.idProperty]: id }

    debug('DELETE', path)

    const data = await model.findOne(filter)

    ctx.assert(data, 404)

    if (archiveModel) {
      await archiveCreate(archiveModel,data, id, model.collection, authId)
    }
    await model.deleteOne(filter)

    ctx.body = ''
    ctx.status = 204

  }

}
