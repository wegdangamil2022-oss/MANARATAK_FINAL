import { Router } from 'express';
import { ManageNotificationTemplatesUseCase } from '@manaratak/application';
import { ManageNotificationIntentsUseCase } from '@manaratak/application';

export class NotificationRouter {
  public static create({ templatesUseCase, intentsUseCase }: any


  ): Router {
    const router = Router();

    router.post('/templates', async (req, res, next) => {
      try {
        await templatesUseCase.createTemplate(req.body);
        res.status(201).json({ message: 'Template created successfully' });
      } catch (error: any) {
        next(error);
      }
    });

    router.post('/intents', async (req, res, next) => {
      try {
        // Handle dates parsing
        const dto = {
          ...req.body,
          scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
          expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
        };
        await intentsUseCase.createIntent(dto);
        res.status(201).json({ message: 'Intent created successfully' });
      } catch (error: any) {
        next(error);
      }
    });

    return router;
  }
}
