import log from 'sistemium-debug'
import type { Model } from 'sistemium-data'
import type { ContextType, NormalizeItem, RolesFilter } from './types'

const { debug } = log('rest:GET')

export default function(model: Model & { rolesFilter?: RolesFilter, normalizeItem: NormalizeItem }) {

  return async (ctx: ContextType) => {

    const {
      params: { id },
      path,
    } = ctx

    debug(path, id)

    const rolesFilter = model.rolesFilter?.call(model, ctx.state)
    const pipe = [{ $match: { id } }]
    if (Array.isArray(rolesFilter)) {
      pipe.push(...rolesFilter)
    } else if (rolesFilter) {
      Object.assign(pipe[0].$match, rolesFilter)
    }
    const [result] = await model.aggregate(pipe)

    ctx.assert(result, 404)
    ctx.body = model.normalizeItem(result)

  }

}