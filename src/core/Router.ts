import { Context } from './Context';

export type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

export type Handler = (ctx: Context) => Promise<void>;

interface Route {
	method: string;
	path: RegExp;
	pathKeys: string[];
	handler: Handler;
	middlewares: Middleware[];
}

export class Router {
	private routes: Route[] = [];
	private globalMiddlewares: Middleware[] = [];

	public use(middleware: Middleware | Middleware[]): this {
		const middlewares = Array.isArray(middleware) ? middleware : [middleware];
		this.globalMiddlewares.push(...middlewares);
		return this;
	}

	public get(path: string, handler: Handler, middlewares: Middleware[] = []): this {
		return this.register('GET', path, handler, middlewares);
	}

	public post(path: string, handler: Handler, middlewares: Middleware[] = []): this {
		return this.register('POST', path, handler, middlewares);
	}

	public put(path: string, handler: Handler, middlewares: Middleware[] = []): this {
		return this.register('PUT', path, handler, middlewares);
	}

	public delete(path: string, handler: Handler, middlewares: Middleware[] = []): this {
		return this.register('DELETE', path, handler, middlewares);
	}

	private register(method: string, path: string, handler: Handler, middlewares: Middleware[]): this {
		const { regex, keys } = this.pathToRegex(path);
		this.routes.push({
			method: method.toUpperCase(),
			path: regex,
			pathKeys: keys,
			handler,
			middlewares,
		});
		return this;
	}

	private pathToRegex(path: string): { regex: RegExp; keys: string[] } {
		const keys: string[] = [];
		const regexStr = path.replace(/:(\w+)/g, (_, key) => {
			keys.push(key);
			return '([^/]+)';
		});
		const regex = new RegExp(`^${regexStr}$`, 'i');
		return { regex, keys };
	}

	private matchRoute(method: string, path: string): { route: Route; params: Record<string, string> } | null {
		for (const route of this.routes) {
			if (route.method !== method.toUpperCase()) continue;
			const match = path.match(route.path);
			if (!match) continue;

			const params: Record<string, string> = {};
			route.pathKeys.forEach((key, index) => {
				params[key] = match[index + 1];
			});
			return { route, params };
		}
		return null;
	}

	private async executeMiddlewareChain(ctx: Context, middlewares: Middleware[], handler: Handler): Promise<void> {
		const chain = [
			...middlewares,
			async (ctx: Context, next: () => Promise<void>) => {
				await handler(ctx);
				await next();
			},
		];

		const dispatch = async (index: number): Promise<void> => {
			if (index >= chain.length) return;
			const middleware = chain[index];
			await middleware(ctx, () => dispatch(index + 1));
		};

		await dispatch(0);
	}

	public async handleRequest(req: Request, env: Env): Promise<Response> {
		const ctx = new Context(req, env);
		const url = new URL(req.url);
		const method = req.method;
		const path = url.pathname;

		try {
			const match = this.matchRoute(method, path);
			if (!match) {
				ctx.error('接口不存在', 404);
				return new Response(ctx.body, ctx.res);
			}

			const { route, params } = match;
			ctx.params = params;

			await this.executeMiddlewareChain(ctx, [...this.globalMiddlewares, ...route.middlewares], route.handler);

			return new Response(ctx.body, ctx.res);
		} catch (err: any) {
			console.error(err);
			ctx.error(err.message || '服务器内部错误', 500);
			return new Response(ctx.body, ctx.res);
		}
	}
}
