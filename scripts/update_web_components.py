import os

def update_file(path, old_str, new_str):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {path}")
    else:
        print(f"Old string not found in {path}")

# MobileDrawer.jsx
with open('src/components/layout/MobileDrawer.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = 0
for i, line in enumerate(lines):
    if 'src="/logo_emblem.png"' in line and 'MobileDrawer' not in line:
        # Check if line before has <img
        new_lines.pop() # remove <img
        new_lines.append('              <img \n')
        new_lines.append('                src="/logo_full.png?v=2.0.1" \n')
        new_lines.append('                alt="DJ\'s Revolution" \n')
        new_lines.append('                className="h-10 w-auto max-w-[160px] object-contain drop-shadow-[0_0_10px_rgba(14,165,233,0.4)]"\n')
        new_lines.append('              />\n')
        skip = 7 # skip old attributes and duplicate text div
        continue
    if skip > 0:
        skip -= 1
        continue
    new_lines.append(line)

with open('src/components/layout/MobileDrawer.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("MobileDrawer updated")

# AuthModal.jsx
with open('src/components/modals/AuthModal.jsx', 'r', encoding='utf-8') as f:
    txt = f.read()
txt = txt.replace('src="/logo_emblem.png"', 'src="/logo_full.png?v=2.0.1"').replace('className="w-16 h-16 object-contain', 'className="h-16 w-auto max-w-[200px] object-contain')
with open('src/components/modals/AuthModal.jsx', 'w', encoding='utf-8') as f:
    f.write(txt)
print("AuthModal updated")

# DonationModal.jsx
with open('src/components/modals/DonationModal.jsx', 'r', encoding='utf-8') as f:
    txt = f.read()
txt = txt.replace('src="/logo_emblem.png"', 'src="/logo_full.png?v=2.0.1"').replace('className="w-16 h-16 object-contain', 'className="h-16 w-auto max-w-[200px] object-contain')
with open('src/components/modals/DonationModal.jsx', 'w', encoding='utf-8') as f:
    f.write(txt)
print("DonationModal updated")

# CreatePostTrigger.jsx
with open('src/components/feed/CreatePostTrigger.jsx', 'r', encoding='utf-8') as f:
    txt = f.read()
txt = txt.replace('src="/logo_emblem.png"', 'src="/logo_full.png?v=2.0.1"').replace('className="w-12 h-12 object-contain', 'className="h-12 w-auto max-w-[160px] object-contain')
with open('src/components/feed/CreatePostTrigger.jsx', 'w', encoding='utf-8') as f:
    f.write(txt)
print("CreatePostTrigger updated")

