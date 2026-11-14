import os

replacements = [
    # General gradients
    ('from-violet-600 to-cyan-600', 'from-blue-600 to-cyan-500'),
    ('from-violet-600 via-indigo-600 to-cyan-500', 'from-blue-600 via-indigo-600 to-cyan-400'),
    ('from-violet-600 to-indigo-600', 'from-blue-600 to-cyan-600'),
    ('hover:from-violet-500 hover:to-indigo-500', 'hover:from-blue-500 hover:to-cyan-500'),
    ('from-violet-500 to-cyan-400', 'from-blue-500 to-cyan-400'),
    ('shadow-violet-600/50', 'shadow-cyan-600/50'),
    ('shadow-violet-900/40', 'shadow-cyan-900/40'),
    ('shadow-violet-900/30', 'shadow-cyan-900/30'),
    ('shadow-glow-violet', 'shadow-glow-cyan'),
    ('border-violet-500/30', 'border-cyan-500/30'),
    ('border-violet-500/20', 'border-cyan-500/20'),
    ('border-violet-500/25', 'border-cyan-500/25'),
    ('border-violet-500/40', 'border-cyan-500/40'),
    ('border-violet-500/50', 'border-cyan-500/50'),
    ('bg-violet-500/10', 'bg-cyan-500/10'),
    ('bg-violet-500/15', 'bg-cyan-500/15'),
    ('bg-violet-500/20', 'bg-cyan-500/20'),
    ('bg-violet-600/20', 'bg-blue-600/20'),
    ('bg-violet-600/30', 'bg-blue-600/30'),
    ('hover:bg-violet-600/50', 'hover:bg-blue-600/50'),
    ('hover:bg-violet-500/10', 'hover:bg-cyan-500/10'),
    ('hover:bg-violet-500/20', 'hover:bg-cyan-500/20'),
    ('text-violet-400', 'text-cyan-400'),
    ('text-violet-300', 'text-cyan-300'),
    ('text-violet-200', 'text-cyan-200'),
    ('bg-violet-600', 'bg-blue-600'),
    ('hover:bg-violet-500', 'hover:bg-blue-500'),
    ('to-violet-950/40', 'to-blue-950/40'),
    ('from-violet-600/10 via-transparent to-cyan-500/10', 'from-blue-600/15 via-transparent to-cyan-500/15'),
    ('from-cyan-500/5 via-transparent to-violet-500/5', 'from-cyan-500/10 via-transparent to-blue-600/10'),
    ('from-violet-600 to-indigo-500', 'from-blue-600 to-cyan-500'),
    ('shadow-violet-600/30', 'shadow-cyan-600/30'),
]

files_to_check = [
    'src/App.jsx',
    'src/components/common/Avatar.jsx',
    'src/components/common/InlineVideoPlayer.jsx',
    'src/components/feed/ChipsBar.jsx',
    'src/components/feed/CreatePostTrigger.jsx',
    'src/components/feed/PostCard.jsx',
    'src/components/layout/BottomNav.jsx',
    'src/components/layout/MobileDrawer.jsx',
    'src/components/layout/Navbar.jsx',
    'src/components/layout/SidebarLeft.jsx',
    'src/components/layout/SidebarRight.jsx',
    'src/components/modals/AuthModal.jsx',
    'src/components/modals/DJProfileModal.jsx',
    'src/components/modals/EditProfileModal.jsx',
    'src/components/modals/UploadModal.jsx',
    'src/components/player/PersistentPlayer.jsx',
]

total_mods = 0
for filepath in files_to_check:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    for old, new in replacements:
        content = content.replace(old, new)
    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        total_mods += 1
        print(f"Harmonized colors in {filepath}")

print(f"Total files updated: {total_mods}")
