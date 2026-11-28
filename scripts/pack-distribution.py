#!/usr/bin/env python3
"""Build the reviewable seven-channel handoff without publishing any service."""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {'.git', 'node_modules', 'dist', '__pycache__', '.venv', 'build', '.cache', '.m365', '.local'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist' / 'Ultiwrite_Remaining_MCP_Submission_Kit.zip')
    args = parser.parse_args()
    subprocess.run(['node', str(ROOT / 'scripts' / 'validate-distribution.mjs')], check=True, cwd=ROOT)
    payload = {}
    for folder in ('distribution/aws', 'distribution/google', 'distribution/meta', 'distribution/microsoft',
                   'distribution/salesforce', 'distribution/shared', 'cursor', 'microsoft365', 'registry', 'copilot'):
        for path in sorted((ROOT / folder).rglob('*')):
            rel = path.relative_to(ROOT)
            if any(part in EXCLUDED for part in rel.parts) or rel.parts[:2] == ('microsoft365', 'env'):
                continue
            if path.is_symlink():
                raise ValueError(f'Symlink cannot be packaged: {rel}')
            if path.is_file():
                local_file = '.local.' in path.name and rel.as_posix() != 'microsoft365/m365agents.local.yml'
                if path.name.startswith('.env') or path.suffix in {'.pem', '.key', '.p12'} or local_file:
                    raise ValueError(f'Private/local configuration cannot be packaged: {rel}')
                payload[rel.as_posix()] = path.read_bytes()
    manifest = json.loads((ROOT / 'cursor' / '.cursor-plugin' / 'plugin.json').read_text(encoding='utf-8'))
    microsoft = json.loads((ROOT / 'microsoft365' / 'package.json').read_text(encoding='utf-8'))
    version = microsoft['version']
    microsoft_packages = (f'ultiwrite-m365-source-{version}.zip', f'ultiwrite-copilot-plugin-{version}.zip',
                          f'ultiwrite-vscode-{version}.vsix', f'Ultiwrite_Microsoft_Distribution_{version}.zip',
                          f'MICROSOFT_SHA256SUMS_{version}.txt', f'MICROSOFT_VERIFICATION_{version}.json')
    cursor_zip = f'release/ultiwrite-cursor-plugin-{manifest["version"]}.zip'
    for rel in ('LICENSE', 'NOTICE', 'POSITIONING.md', 'server.json', 'distribution/MARKETPLACES.md',
                'hosts/muse.md', 'vscode/README.md', cursor_zip, 'DISTRIBUTION.md',
                *(f'release/{name}' for name in microsoft_packages)):
        payload[rel] = (ROOT / rel).read_bytes()
    payload['START_HERE.md'] = (
        '# Ultiwrite marketplace handoffs\n\n'
        'Open [the channel guide](distribution/MARKETPLACES.md). '
        'The Microsoft source and Cursor archives are in `release/`.\n'
    ).encode()
    profile = json.loads((ROOT / 'distribution/shared/profile.json').read_text(encoding='utf-8'))
    inventory = {'product': profile['product'], 'legalEntity': profile['legalEntity'], 'dba': profile['dba'],
                 'kitVersion': profile['kitVersion'], 'cursorVersion': manifest['version'],
                 'microsoftSourceVersion': microsoft['version'], 'files': [
        {'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
        for name, data in sorted(payload.items())
    ]}
    payload['CONTENTS.json'] = (json.dumps(inventory, indent=2) + '\n').encode()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(payload.items()):
            info = zipfile.ZipInfo(name, (2026, 11, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, data)
    with zipfile.ZipFile(args.output) as archive:
        if archive.testzip() is not None:
            raise ValueError('Archive CRC verification failed')
        for name, data in payload.items():
            if archive.read(name) != data:
                raise ValueError(f'Archive/source mismatch: {name}')
    digest = hashlib.sha256(args.output.read_bytes()).hexdigest()
    args.output.with_suffix('.sha256').write_text(f'{digest}  {args.output.name}\n', encoding='utf-8')
    print(json.dumps({'archive': str(args.output), 'files': len(payload), 'bytes': args.output.stat().st_size, 'sha256': digest, 'submitted': False}))


if __name__ == '__main__':
    main()
