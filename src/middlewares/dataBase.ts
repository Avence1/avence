import { type Middleware } from '../core/Router';

export const dataBase: Middleware = async (ctx, next) => {
	const { D1_DB } = ctx.env;
	const { tableName } = await ctx.parseParams();

	if (tableName) {
		const tableResult = await D1_DB.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`).first();
		if (!tableResult) {
			await D1_DB.prepare(
				`CREATE TABLE IF NOT EXISTS ${tableName} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				age INTEGER,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)`
			).run();
		}
	}

	await next();
};
