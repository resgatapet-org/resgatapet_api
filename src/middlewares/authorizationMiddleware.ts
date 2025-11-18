import { Request, Response, NextFunction } from 'express';

export class AuthorizationMiddleware {
  static authorizeOwner(req: Request, res: Response, next: NextFunction) {
    try {
      const authenticatedUserId = req.user?.userId;
      const targetUserId = Number(req.params.id);

      if (!authenticatedUserId) {
        return res.status(401).send({ error: 'Usuário não autenticado' });
      }

      if (req.user?.tipo === 'ADMIN') {
        return next();
      }

      if (authenticatedUserId !== targetUserId) {
        return res.status(403).send({
          error: 'Você só pode visualizar, editar ou deletar sua própria conta',
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).send({ error: error.message });
    }
  }

  static authorize(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).send({ error: 'Usuário não autenticado' });
        }

        if (!allowedRoles.includes(req.user.tipo)) {
          return res.status(403).send({
            error: 'Você não tem permissão para acessar este recurso',
          });
        }

        next();
      } catch (error: any) {
        return res.status(500).send({ error: error.message });
      }
    };
  }
}