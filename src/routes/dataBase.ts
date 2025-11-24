import { type Handler } from '../core/Router';

const getUsersHandler: Handler = async (ctx) => {
	const { D1_DB } = ctx.env;
	const { results } = await D1_DB.prepare(`SELECT * FROM user ORDER BY id ASC`).all();
	ctx.success({ total: results.length, users: results });
};

const setUserHandler: Handler = async (ctx) => {
	const { D1_DB } = ctx.env;
	try {
		const params = await ctx.parseParams();
		const { name, age } = params;
		if (!name) {
			ctx.error('姓名不能为空', 400);
			return;
		}

		const result = await D1_DB.prepare(`INSERT INTO user (name, age) VALUES (?, ?)`).bind(name, age).run();
		ctx.success({ id: result.meta.last_row_id });
	} catch (err) {
		console.log('setUserHandler error', err);
		throw new Error('接口错误');
	}
};

const deleteUserHandler: Handler = async (ctx) => {
	const { userID } = await ctx.parseParams();
	const id = Number(userID);
	if (isNaN(id) || id <= 0) {
		ctx.error('ID 必须是大于 0 的数字', 400);
		return;
	}
	const { D1_DB } = ctx.env;
	const existingRecord = await D1_DB.prepare(`SELECT id FROM user WHERE id = ?`).bind(id).run();
	if (existingRecord.results.length === 0) {
		ctx.error(`ID 为 ${id} 的记录不存在`, 200);
		return;
	}
	const result = await D1_DB.prepare(`DELETE FROM user WHERE id = ?`).bind(id).run();
	if (result.meta.changes === 0) {
		ctx.error('删除失败，请重试', 200);
		return;
	}

	ctx.success({}, `ID 为 ${id} 的记录已成功删除`);
};

export { getUsersHandler, setUserHandler, deleteUserHandler };
