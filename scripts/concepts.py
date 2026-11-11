"""Assemble the three portfolio designs into dist/ with a shared design switcher.

Usage: python3 scripts/concepts.py <path to the seymur-portfolio concepts repo>
Design 1 is served at /, design 2 at /2/, design 3 at /3/.
"""
import pathlib, subprocess, sys

src = sys.argv[1]
dist = pathlib.Path(__file__).resolve().parent.parent / "dist"
designs = [("main", "", "Soft"), ("concept-2", "2/", "Bold"), ("concept-3", "3/", "Board")]

CSS = """<style>
#vsw{position:fixed;left:14px;bottom:14px;z-index:2147483000;display:flex;align-items:center;gap:2px;padding:4px;border-radius:999px;
  background:#111;box-shadow:0 6px 24px rgba(0,0,0,.28),0 0 0 1px rgba(255,255,255,.14);font:600 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em;text-transform:uppercase}
#vsw span{padding:0 8px 0 10px;color:#8a8a8a}
#vsw a{display:block;padding:8px 11px;border-radius:999px;color:#fff;text-decoration:none;cursor:pointer;transition:background .2s,color .2s}
#vsw a:hover{background:#2c2c2c}
#vsw a[aria-current]{background:#fff;color:#111}
@media(max-width:560px){#vsw span{display:none}#vsw{left:10px;bottom:10px}}
@media print{#vsw{display:none}}
</style>"""

for i, (branch, path, _) in enumerate(designs):
    html = subprocess.run(["git", "-C", src, "show", f"{branch}:index.html"], check=True, capture_output=True, text=True).stdout
    up = "../" if path else ""
    links = "".join(
        f'<a href="{up}{p or "./"}"{" aria-current=\"page\"" if j == i else ""} title="Design {j + 1}: {name}">{j + 1} {name}</a>'
        for j, (_, p, name) in enumerate(designs)
    )
    # Design 2 has its own dock at the bottom centre; lift the switcher above it on narrow screens.
    lift = "<style>@media(max-width:900px){#vsw{bottom:74px}}</style>" if branch == "concept-2" else ""
    nav = f'{CSS}{lift}<nav id="vsw" aria-label="Switch design"><span>Design</span>{links}</nav>'
    assert html.count("</body>") == 1
    out = dist / path / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html.replace("</body>", nav + "\n</body>"))
    print("wrote", out.relative_to(dist.parent))
