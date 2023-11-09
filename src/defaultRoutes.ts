import Router from '@koa/router'
import { Model } from 'sistemium-data'
import log from 'sistemium-debug'
import getOne from './getOne'
import getMany from './getMany'
import type { NormalizeItem } from './types'

const { debug } = log('rest:defaultRoutes')

export default function(router: Router, models: (Model & { normalizeItem: NormalizeItem })[]) {
  models.forEach(model => {
    const { collection } = model
    debug(collection)
    router.get(`/${collection}/:id`, getOne(model))
    router.get(`/${collection}`, getMany(model))
  })
}
