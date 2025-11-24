export class Context {
	public req: Request;
	public env: Env;
	public res: ResponseInit;
	public body: any;
	public params: Record<string, string> = {};
	public query: URLSearchParams;
	private bodyCache: any = null;

	constructor(req: Request, env: Env) {
		this.req = req;
		this.env = env;
		this.res = { status: 200, headers: {} };
		this.body = null;
		this.query = new URL(req.url).searchParams;
	}

	public status(code: number): this {
		this.res.status = code;
		return this;
	}

	public setHeader(key: string, value: string): this {
		this.res.headers = {
			...this.res.headers,
			[key]: value,
		};
		return this;
	}

	public json(data?: any, status = 200): this {
		this.status(status);
		this.setHeader('Content-Type', 'application/json');
		this.body = data ? JSON.stringify(data) : '';
		return this;
	}

	public success(data?: any, message = '操作成功'): this {
		return this.json({ success: true, message, data });
	}

	public error(message = '操作失败', status = 400): this {
		return this.json({ success: false, error: message }, status);
	}

	private async getBody(): Promise<any> {
		if (this.bodyCache !== null) {
			return this.bodyCache;
		}

		const contentType = this.req.headers.get('Content-Type');
		let body = {};

		try {
			if (contentType?.includes('application/json')) {
				body = (await this.req.json().catch((e) => {
					return Promise.resolve({});
				})) as Record<string, string>;
			} else if (contentType?.includes('multipart/form-data')) {
				body = await this.req.formData();
			} else if (contentType?.includes('application/x-www-form-urlencoded')) {
				const formText = await this.req.text();
				body = Object.fromEntries(new URLSearchParams(formText));
			}
		} catch (err) {
			console.warn('读取请求体失败:', err);
			body = {};
		}

		this.bodyCache = body;
		return body;
	}

	public async parseParams(): Promise<Record<string, string>> {
		const postParams = await this.getBody();
		const getParams = Object.fromEntries(this.query);
		return Promise.resolve({
			...postParams,
			...getParams,
			...this.params,
		});
	}
}
