import Router from '@koa/router'
import log from 'sistemium-debug'
import getOne from './getOne'
import getMany from './getMany'
import postAny from './postAny'
import type { KoaModel } from './types'

const { debug } = log('rest:defaultRoutes')

export default function(router: Router, models: KoaModel[]) {
  models.forEach(model => {
    const { collection } = model
    debug(collection)
    router.post(`/${collection}/:id?`, postAny(model))
    router.put(`/${collection}/:id?`, postAny(model))
    router.get(`/${collection}/:id`, getOne(model))
    router.get(`/${collection}`, getMany(model))
  })
}
