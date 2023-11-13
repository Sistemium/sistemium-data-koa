import Router from '@koa/router'
import log from 'sistemium-debug'
import getOne from './getOne'
import getMany from './getMany'
import postAny from './postAny'
import patchOne from './patchOne'
import type { KoaModel, KoaModelController } from './types'
import deleteOne, { archiveConfig } from './deleteOne'
import type { Model } from 'sistemium-data'

const { debug } = log('rest:defaultRoutes')

/**
 * Populate REST API methods for all models.
 * Optional ModelClass is to define Archive collection.
 */
export default function(router: Router, models: KoaModel[], ModelClass?: typeof Model, controllers?: Record<string, KoaModelController>) {
  const Archive = ModelClass && new ModelClass(archiveConfig)
  models.forEach(model => {
    const { collection } = model
    const controller = controllers && controllers[collection]
    debug(collection, !!controller)
    router.post(`/${collection}/:id?`, postAny(model))
    router.put(`/${collection}/:id?`, postAny(model))
    router.get(`/${collection}/:id`, getOne(model, controller))
    router.get(`/${collection}`, getMany(model, controller))
    router.delete(`/${collection}/:id`, deleteOne(model, Archive))
    router.patch(`/${collection}/:id`, patchOne(model))
  })
}
