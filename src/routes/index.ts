import { corsMiddleWare, dataBase, errorHandler, jwtAuth, keyAuth } from '../middlewares';
import { getUsersHandler, setUserHandler, deleteUserHandler } from './dataBase';
import { Router } from '../core/Router';

const app = new Router();

app.use([errorHandler, corsMiddleWare, keyAuth, jwtAuth]);

app.get('/api/get/users', getUsersHandler, [dataBase]);
app.post('/api/add/user', setUserHandler, [dataBase]);

app.post('/api/delete/user', deleteUserHandler, [dataBase]);

export { app };
