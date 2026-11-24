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

/**
 * Resolves the effective author profile for a post, checking Super Admin proxy
 * attribution (`post.profiles.socials.post_author_overrides[post.id]`) first.
 */
export function resolvePostAuthor(post, currentUser = null, currentProfile = null) {
  const baseAuthor =
    (currentUser && currentProfile && post?.author_id === currentUser.id
      ? currentProfile
      : post?.profiles) || { dj_name: 'DJ Creador', role: 'DJ de Worship 🕊️' };

  const baseSocials = baseAuthor?.socials || {};
  const override = post?.id && baseSocials.post_author_overrides?.[post.id];

  if (override && typeof override === 'object') {
    return {
      ...override,
      socials: {
        display_as: override.display_as || 'dj_name',
        ...(override.post_display_modes ? { post_display_modes: override.post_display_modes } : {}),
      },
      _isProxyAttribution: true,
    };
  }

  return baseAuthor;
}

/**
 * Resolves how an author should be displayed on posts and profile cards:
 * - 'full_name': Real/full name
 * - 'dj_name': DJ alias / artistic name (default)
 * - 'role': Institutional or ministerial role directly (e.g. "Super Admin 👑")
 * Checks per-post override in `profile.socials.post_display_modes[postId]` first,
 * then falls back to `profile.socials.display_as`.
 */
export function getAuthorDisplay(profile, postId = null) {
  const socials = profile?.socials || {};
  const postOverride = postId && socials.post_display_modes?.[postId];
  const mode = postOverride || socials.display_as || 'dj_name';

  const fullName = (profile?.full_name || '').trim();
  const djName = (profile?.dj_name || '').trim();
  const roleName = (profile?.role || '').trim();
  const username = (profile?.username || '').trim();

  let displayName;
  let subtitle;

  if (mode === 'role') {
    displayName = roleName || djName || fullName || username || 'DJ de Worship';
    subtitle = username ? `@${username}` : (fullName && fullName !== displayName ? fullName : '');
  } else if (mode === 'full_name') {
    displayName = fullName || djName || username || 'DJ Creador';
    subtitle = roleName || 'DJ de Worship 🕊️';
  } else {
    displayName = djName || fullName || username || 'DJ Creador';
    subtitle = roleName || 'DJ de Worship 🕊️';
  }

  return {
    mode,
    displayName,
    subtitle,
    fullName,
    djName,
    roleName,
  };
}
