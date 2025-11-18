// src/routes/ongRoutes.ts
import express from 'express'
import { OngController } from '../controller/ongController';
import { AuthMiddleware } from '../middlewares/authMiddleware';
import { AuthorizationMiddleware } from '../middlewares/authorizationMiddleware';
import { doacaoRouter } from './doacaoRoutes';

export const ongRouter = express.Router();

const ongController = new OngController();

//Lista todas as ONGs (Público)
ongRouter.get('/', ongController.getAll);

//  Busca por ID (Público)
ongRouter.get('/:id', ongController.getById);

//Cadastra uma nova ONG (apenas Admin)
ongRouter.post('/', AuthMiddleware.authenticate, AuthorizationMiddleware.authorize('ADMIN'), ongController.create);

// Atualiza uma ONG (Admin ou Admin da ONG)
ongRouter.put('/:id', AuthMiddleware.authenticate, AuthorizationMiddleware.authorize('ONG', 'ADMIN'), ongController.update);

// Remove uma ONG (apenas Admin)
ongRouter.delete('/:id', AuthMiddleware.authenticate, AuthorizationMiddleware.authorize('ADMIN'), ongController.delete);

//  router de Doações como sub-recurso: /ongs/:id/doacoes
ongRouter.use('/:id/doacoes', doacaoRouter);