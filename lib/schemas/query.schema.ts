import { z } from 'zod';

// Strict allowlist — any unknown parameter is rejected by Zod's strict() mode
export const DashboardQuerySchema = z
  .object({
    range: z.enum(['today', 'yesterday', '7days', '1month', 'custom']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    timezone: z.string().optional().default('Asia/Kolkata'),
    page: z
      .string()
      .regex(/^\d+$/, 'page must be a positive integer string')
      .transform(Number)
      .refine((v) => v >= 1, { message: 'page must be >= 1' })
      .optional()
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/, 'limit must be a positive integer string')
      .transform(Number)
      .refine((v) => v >= 1 && v <= 100, { message: 'limit must be between 1 and 100' })
      .optional()
      .default('10'),
  })
  .strict() // Rejects unknown keys
  .superRefine((data, ctx) => {
    const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

    if (data.range === 'custom') {
      if (!data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startDate'],
          message: 'startDate is required when range is custom',
        });
      } else if (!ISO_DATE.test(data.startDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startDate'],
          message: 'startDate must be a valid YYYY-MM-DD date',
        });
      }

      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'endDate is required when range is custom',
        });
      } else if (!ISO_DATE.test(data.endDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'endDate must be a valid YYYY-MM-DD date',
        });
      }

      if (
        data.startDate &&
        data.endDate &&
        ISO_DATE.test(data.startDate) &&
        ISO_DATE.test(data.endDate) &&
        data.startDate > data.endDate
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message: 'endDate must be on or after startDate',
        });
      }
    }
  });

export type DashboardQuery = z.output<typeof DashboardQuerySchema>;
