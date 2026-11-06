import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'member', 'billing_manager']);

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  organizationId: z.string(),
  createdAt: z.string()
});

export const UserListResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number()
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;

