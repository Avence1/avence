import { type Middleware } from '../core/Router';

export const keyAuth: Middleware = async (ctx, next) => {
	const request = ctx.req;
	const requestSecret = request.headers.get('x-request-key');
	if (requestSecret !== ctx.env.REQUEST_KEY) {
		throw new Error('缺少 request 令牌');
	} else {
		await next();
	}
};
