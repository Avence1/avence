import { type Middleware } from '../core/Router';

export const errorHandler: Middleware = async (ctx, next) => {
	try {
		await next();
	} catch (err: any) {
		console.error('请求错误：', err.message);
		const status = err.message.includes('无权限')
			? 403
			: err.message.includes('未找到')
			? 404
			: err.message.includes('格式错误')
			? 400
			: 500;
		ctx.error(err.message, status);
	}
};
