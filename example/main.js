/**
 * @file 入口文件
 */

import App from './App.san';
import '../src/all.less';
import routes from './routes';
import {Router} from 'san-router';

const app = new App();
const router = new Router();

app.attach(document.getElementById('root'));

routes.forEach(route => router.add(route));
router.start();
