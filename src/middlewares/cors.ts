import { type Middleware } from '../core/Router';

const ALLOWED_ORIGINS = ['*'];

export const corsMiddleWare: Middleware = async (ctx, next) => {
	const origin = ctx.req.headers.get('Origin');

	if (ctx.req.method === 'OPTIONS') {
		ctx.setHeader('Access-Control-Allow-Origin', origin || ALLOWED_ORIGINS[0]);
		ctx.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		ctx.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
		ctx.setHeader('Access-Control-Max-Age', '86400');
		ctx.status(204).body = '';
		return;
	}

	if (origin && ALLOWED_ORIGINS.includes(origin)) {
		ctx.setHeader('Access-Control-Allow-Origin', origin);
	}
	await next();
};
