import { type Middleware } from '../core/Router';
import { jwtVerify, JWTVerifyResult, JWTPayload } from 'jose';

export const jwtAuth: Middleware = async (ctx, next) => {
	const authHeader = ctx.req.headers.get('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new Error('请先登录（缺少 JWT 令牌）');
	}

	const token = authHeader.split(' ')[1];
	const jwtSecret = new TextEncoder().encode(ctx.env.JWT_KEY);

	let verifyResult: JWTVerifyResult<JWTPayload>;
	try {
		verifyResult = await jwtVerify(token, jwtSecret, { issuer: 'avence', audience: 'avence' });
	} catch (err) {
		console.error('err', err);
		throw new Error('登录已过期，请重新登录');
	}
	if (verifyResult.payload) {
		await next();
	}
};
