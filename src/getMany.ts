import log from 'sistemium-debug'
import { FULL_RESPONSE_OPTION, Model, OFFSET_HEADER, PAGE_SIZE_HEADER } from 'sistemium-data'
import qs from 'qs'
import lo from 'lodash'
import { queryToFilter, whereToFilter } from './predicates'
import type { ContextType, NormalizeItem, RolesFilter } from './types'

const { debug } = log('rest:GET')
export const WHERE_KEY = 'where:'

export default function(model: Model & { rolesFilter?: RolesFilter, normalizeItem: NormalizeItem }) {
  return async (ctx: ContextType) => {

    const {
      path,
    } = ctx

    const query = qs.parse(ctx.query as unknown as string)
    const pageSize = queryOrHeader(ctx, PAGE_SIZE_HEADER) || '10'
    const offset = queryOrHeader(ctx, OFFSET_HEADER) as string
    const filters = queryToFilter(query, model.schema)
    const where = query[WHERE_KEY]

    if (where) {
      const jsonWhere = lo.isString(where) ? JSON.parse(where) : where
      debug('where', jsonWhere)
      Object.assign(filters, whereToFilter(jsonWhere, model.schema))
    }

    const { rolesFilter } = model
    const filterOfRoles = rolesFilter && rolesFilter(ctx.state)
    const pipeFilter = Array.isArray(filterOfRoles)

    const allFilters = lo.filter([
      !pipeFilter && filterOfRoles,
      Object.keys(filters).length && filters,
      // ...(ctx.state.filters || []),
    ]) as Object[]

    debug('GET', path, allFilters)
    const pipeline = allFilters.map($match => ({ $match }))
    if (pipeFilter) {
      pipeline.push(...filterOfRoles)
    }

    const options = {
      headers: {
        ...ctx.headers,
        [PAGE_SIZE_HEADER]: pageSize,
      },
      [FULL_RESPONSE_OPTION]: true,
    }

    const {
      data,
      headers,
    } = await model.aggregate(pipeline, options) as unknown as {
      data: Object[]
      headers: Record<string, any>
    }

    const newOffset = headers[OFFSET_HEADER]

    if (offset && newOffset) {
      debug('offsets:', offset, newOffset, data.length)
      ctx.set(OFFSET_HEADER, newOffset)
    } else if (offset) {
      ctx.set(OFFSET_HEADER, offset)
    }

    if (!data.length) {
      ctx.status = 204
    } else {
      ctx.body = lo.map(data, item => model.normalizeItem(item))
    }

  }
}

function queryOrHeader(ctx: ContextType, headerName: string) {
  return ctx.query[`${headerName}:`] || ctx.header[headerName]
}
