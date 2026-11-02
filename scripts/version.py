"""Keep HomeDeck's version identical across manifest, const.py and the frontend.

Usage:
  python3 scripts/version.py check [TAG]   # TAG like v0.2.12 must match too
  python3 scripts/version.py set 0.2.13
"""

import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "custom_components/homedeck/manifest.json"
CONST = ROOT / "custom_components/homedeck/const.py"
PACKAGE = ROOT / "frontend/package.json"
LOCK = ROOT / "frontend/package-lock.json"
CONST_RE = re.compile(r'^VERSION: Final = "([^"]+)"$', re.MULTILINE)
SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+$")


def current() -> dict[str, str]:
    lock = json.loads(LOCK.read_text())
    match = CONST_RE.search(CONST.read_text())
    return {
        "manifest.json": json.loads(MANIFEST.read_text())["version"],
        "const.py": match.group(1) if match else "?",
        "package.json": json.loads(PACKAGE.read_text())["version"],
        "package-lock.json": lock["packages"][""]["version"],
    }


def check(tag: str | None) -> int:
    versions = current()
    if tag is not None:
        versions["tag"] = tag.removeprefix("v")
    if len(set(versions.values())) != 1:
        for source, version in versions.items():
            print(f"{source}: {version}")
        print("Versions differ.")
        return 1
    print(f"Version {versions['manifest.json']} is consistent.")
    return 0


def _write_json(path: Path, update) -> None:
    data = json.loads(path.read_text())
    update(data)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def set_version(version: str) -> int:
    if not SEMVER_RE.fullmatch(version):
        print("Use X.Y.Z, without a leading v.")
        return 1
    _write_json(MANIFEST, lambda data: data.update(version=version))
    _write_json(PACKAGE, lambda data: data.update(version=version))

    def update_lock(data):
        data["version"] = version
        data["packages"][""]["version"] = version

    _write_json(LOCK, update_lock)
    CONST.write_text(CONST_RE.sub(f'VERSION: Final = "{version}"', CONST.read_text()))
    return check(None)


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "check":
        sys.exit(check(sys.argv[2] if len(sys.argv) > 2 else None))
    if len(sys.argv) == 3 and sys.argv[1] == "set":
        sys.exit(set_version(sys.argv[2]))
    print(__doc__)
    sys.exit(2)
