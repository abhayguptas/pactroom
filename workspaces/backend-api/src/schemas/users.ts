import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const UserRoleEnum = z.enum(['admin', 'member', 'billing_manager']);

export const UserSchema = z
  .object({
    id: z.string().openapi({ example: 'usr_441' }),
    name: z.string().openapi({ example: 'Alex Chen' }),
    email: z.string().email().openapi({ example: 'alex@pactroom.dev' }),
    role: UserRoleEnum.openapi({ example: 'member' }),
    organizationId: z.string().openapi({ example: 'org_switch_corp' }),
    createdAt: z.string().openapi({ example: '2026-01-15T08:30:00Z' })
  })
  .openapi('User');

export const UpdateUserRequestSchema = z
  .object({
    name: z.string().optional(),
    role: UserRoleEnum.optional()
  })
  .openapi('UpdateUserRequest');

export const UserListResponseSchema = z
  .object({
    users: z.array(UserSchema),
    total: z.number()
  })
  .openapi('UserListResponse');

export type User = z.infer<typeof UserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserRequestSchema>;

