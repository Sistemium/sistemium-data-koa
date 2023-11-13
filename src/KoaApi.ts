import Koa, { Middleware } from 'koa';
import bodyParser, { Options as BodyParserOptions } from 'koa-bodyparser';
import log from 'sistemium-debug';
import morgan from 'koa-morgan';
import cors from '@koa/cors';
import Router from '@koa/router';
import type { Options as CorsOptions } from '@koa/cors'

const {
  debug,
  error,
} = log('rest');

const {
  REST_PORT,
  MORGAN_FORMAT = ':status :method :url :res[content-length] - :response-time ms',
} = process.env;

export { morgan };

interface KoaApiParams {
  morgan?: string
  port?: number
  router: Router
  cors?: boolean | CorsOptions
  bodyParser?: BodyParserOptions
  auth: Middleware
}

export default class KoaApi {

  readonly #app: Koa
  readonly #router: Router

  constructor(props: KoaApiParams) {

    this.#app = new Koa();

    const {
      router = new Router(),
      port = REST_PORT,
      morgan: morganFormat = MORGAN_FORMAT,
      bodyParser: bodyParserOptions = {},
    } = props;

    this.#router = router

    const corsOptions = props.cors === true ? { origin: '*' } : props.cors;

    if (corsOptions) {
      this.#app
        .use(cors(corsOptions))
    }

    if (morganFormat) {
      this.#app
        .use(morgan(morganFormat))
    }

    this.#app
      .use(bodyParser(bodyParserOptions))

    if (props.auth) {
      this.#app.use(props.auth)
    }

    this.#app
      .use(router.routes())
      .use(router.allowedMethods());

    if (port) {
      debug('starting on port', port);
      this.#app.listen(port);
    }

    process.on('SIGINT', () => {
      this.cleanup()
        .then(debug, error)
        .finally(() => {
          process.exit();
        });
    });

  }

  getRouter(): Router {
    return this.#router
  }

  async cleanup(): Promise<void> {
    error('cleanup');
  }

}
