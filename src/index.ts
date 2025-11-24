import { app } from './routes';

export default {
	fetch: app.handleRequest.bind(app),
};
