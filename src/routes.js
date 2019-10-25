import { Router } from 'express';

import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import PlanController from './app/controllers/PlanController';
import RegistrationController from './app/controllers/RegistrationController';
import CheckinController from './app/controllers/CheckinController';
import StudentHelpOrderController from './app/controllers/StudentHelpOrderController';
import GymHelpOrderController from './app/controllers/GymHelpOrderController';

import authMiddleware from './app/middlewares/auth';
import adminMiddleware from './app/middlewares/admin';
import sutdentValidation from './app/middlewares/studentValidation';

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.post(
  '/students/:id/checkins',
  sutdentValidation,
  CheckinController.store
);
routes.get(
  '/students/:id/checkins',
  sutdentValidation,
  CheckinController.index
);
routes.get(
  '/students/:id/help-orders',
  sutdentValidation,
  StudentHelpOrderController.index
);
routes.post(
  '/students/:id/help-orders',
  sutdentValidation,
  StudentHelpOrderController.store
);
routes.get('/help-orders', GymHelpOrderController.index);
routes.post('/help-orders/:id/answer', GymHelpOrderController.store);

routes.use(authMiddleware);

routes.post('/students', StudentController.store);

routes.use(adminMiddleware);

routes.post('/plans', PlanController.store);
routes.get('/plans', PlanController.index);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.post('/registrations', RegistrationController.store);
routes.get('/registrations', RegistrationController.index);
routes.put('/registrations/:id', RegistrationController.update);
routes.delete('/registrations/:id', RegistrationController.delete);

export default routes;
