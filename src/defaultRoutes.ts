import Router from '@koa/router'
import log from 'sistemium-debug'
import getOne from './getOne'
import getMany from './getMany'
import postAny from './postAny'
import patchOne from './patchOne'
import type { KoaModel } from './types'
import deleteOne, { archiveConfig } from './deleteOne'
import type { Model } from 'sistemium-data'

const { debug } = log('rest:defaultRoutes')

/**
 * Populate REST API methods for all models.
 * Optional ModelClass is to define Archive collection.
 */
export default function(router: Router, models: KoaModel[], ModelClass?: typeof Model) {
  const Archive = ModelClass && new ModelClass(archiveConfig)
  models.forEach(model => {
    const { collection } = model
    debug(collection)
    router.post(`/${collection}/:id?`, postAny(model))
    router.put(`/${collection}/:id?`, postAny(model))
    router.get(`/${collection}/:id`, getOne(model))
    router.get(`/${collection}`, getMany(model))
    router.delete(`/${collection}/:id`, deleteOne(model, Archive))
    router.patch(`/${collection}/:id`, patchOne(model))
  })
}
