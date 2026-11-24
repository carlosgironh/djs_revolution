/**
 * Centralized role resolution for DJ's Revolution profiles.
 * Ensures consistent permission and badge checks across feed, modals, and auth.
 */
export function getUserRoleFlags(profile, authEmail = '') {
  const roleLower = (profile?.role || '').toLowerCase();
  const normalizedEmail = (authEmail || '').trim().toLowerCase();

  const isSuperAdmin = Boolean(
    profile?.is_super_admin ||
    roleLower.includes('admin') ||
    profile?.username === 'carlosgironh' ||
    normalizedEmail === 'carlosgironh@gmail.com'
  );

  const isModerator = Boolean(
    isSuperAdmin ||
    profile?.is_moderator ||
    roleLower.includes('moderador')
  );

  const isDJ = Boolean(
    isModerator ||
    profile?.is_dj ||
    roleLower.includes('dj') ||
    roleLower.includes('creador') ||
    roleLower.includes('vj')
  );

  return {
    isSuperAdmin,
    isModerator,
    isDJ,
    isModOnly: isModerator && !isSuperAdmin,
    isDJOnly: isDJ && !isModerator,
  };
}
