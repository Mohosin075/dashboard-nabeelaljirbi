export type AdminAction = 'operations' | 'finance' | 'notify';
const tiers: Record<AdminAction, readonly string[]> = {
  operations: ['SUPER_ADMIN', 'OPERATIONS'],
  finance: ['SUPER_ADMIN', 'FINANCE'],
  notify: ['SUPER_ADMIN', 'OPERATIONS', 'SUPPORT'],
};
export function canAdminAction(tier: string | null | undefined, action: AdminAction) {
  return tiers[action].includes(tier || 'SUPER_ADMIN');
}
