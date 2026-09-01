import { z } from 'zod';

// Validated fields returned from the backend per touchpoint row
const TouchpointItemSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  profession: z.string().optional(),
  countryCode: z.string().optional(),
  timezone: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  monthlyAdSpend: z.string().optional(),
  productsSold: z.string().optional(),
  route: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
  platform: z.string().optional(),
  gclid: z.string().optional(),
  fbclid: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  matchtype: z.string().optional(),
  network: z.string().optional(),
  device: z.string().optional(),
  keyword: z.string().optional(),
  placement: z.string().optional(),
  campaignid: z.string().optional(),
  adgroupid: z.string().optional(),
  createdAt: z.string().optional(),
  // clientIp and userAgent are intentionally NOT included — stripped at source
});

const PaginationSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const BackendSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    data: z.array(TouchpointItemSchema),
    pagination: PaginationSchema,
  }),
});

export const BackendErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

// Safe DTO — only approved fields, explicitly constructed
// This prevents any unexpected backend fields from leaking to the browser
export type SafeTouchpoint = {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  profession?: string;
  countryCode?: string;
  timezone?: string;
  role?: string;
  status?: string;
  monthlyAdSpend?: string;
  productsSold?: string;
  route?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  platform?: string;
  gclid?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  matchtype?: string;
  network?: string;
  device?: string;
  keyword?: string;
  placement?: string;
  campaignid?: string;
  adgroupid?: string;
  createdAt?: string;
};

export type SafeLeadsResponse = {
  data: SafeTouchpoint[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function mapToSafeDTO(item: z.infer<typeof TouchpointItemSchema>): SafeTouchpoint {
  return {
    _id: item._id,
    userId: item.userId,
    name: item.name ?? 'N/A',
    email: item.email ?? 'N/A',
    phone: item.phone ?? 'N/A',
    profession: item.profession,
    countryCode: item.countryCode,
    timezone: item.timezone,
    role: item.role,
    status: item.status,
    monthlyAdSpend: item.monthlyAdSpend,
    productsSold: item.productsSold,
    route: item.route,
    utm_source: item.utm_source,
    utm_medium: item.utm_medium,
    utm_campaign: item.utm_campaign,
    utm_content: item.utm_content,
    utm_term: item.utm_term,
    platform: item.platform,
    gclid: item.gclid,
    fbclid: item.fbclid,
    fbp: item.fbp,
    fbc: item.fbc,
    matchtype: item.matchtype,
    network: item.network,
    device: item.device,
    keyword: item.keyword,
    placement: item.placement,
    campaignid: item.campaignid,
    adgroupid: item.adgroupid,
    createdAt: item.createdAt,
    // clientIp and userAgent deliberately excluded
  };
}
