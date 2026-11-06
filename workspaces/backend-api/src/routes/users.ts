import { Router, Request, Response } from 'express';
import {
  UpdateUserRequestSchema,
  User
} from '../schemas/users.js';

export const usersRouter = Router();

const usersStore: Map<string, User> = new Map([
  [
    'usr_441',
    {
      id: 'usr_441',
      name: 'Alex Chen',
      email: 'alex@pactroom.dev',
      role: 'member',
      organizationId: 'org_switch_corp',
      createdAt: '2026-01-15T08:30:00.000Z'
    }
  ],
  [
    'usr_442',
    {
      id: 'usr_442',
      name: 'Sarah Connor',
      email: 'sarah@pactroom.dev',
      role: 'admin',
      organizationId: 'org_switch_corp',
      createdAt: '2026-02-01T10:00:00.000Z'
    }
  ]
]);

// GET /api/users
usersRouter.get('/', (_req: Request, res: Response) => {
  const users = Array.from(usersStore.values());
  res.json({
    users,
    total: users.length
  });
});

// GET /api/users/:id
usersRouter.get('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const user = usersStore.get(id);
  if (!user) {
    res.status(404).json({ error: `User with ID '${id}' not found` });
    return;
  }
  res.json(user);
});

// PUT /api/users/:id
usersRouter.put('/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const user = usersStore.get(id);
  if (!user) {
    res.status(404).json({ error: `User with ID '${id}' not found` });
    return;
  }

  const parseResult = UpdateUserRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid user payload', details: parseResult.error.flatten() });
    return;
  }

  if (parseResult.data.name !== undefined) user.name = parseResult.data.name;
  if (parseResult.data.role !== undefined) user.role = parseResult.data.role;

  usersStore.set(user.id, user);
  res.json(user);
});

