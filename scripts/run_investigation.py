"""Run the pinned REA source-analysis probe and retain its real output."""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time

from summarize import summarize

REFERENCE_COMMIT = '3b2c671c0ab50f052a219b987dea8738ea75886e'
REA_VERSION = '6.7.0'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--reference', type=Path, required=True)
    parser.add_argument('--rea', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    reference = args.reference.resolve()
    rea = args.rea.resolve()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    commit = subprocess.check_output(['git', '-C', str(reference), 'rev-parse', 'HEAD'], text=True).strip()
    if commit != REFERENCE_COMMIT:
        raise SystemExit(f'Reference commit differs: expected {REFERENCE_COMMIT}, got {commit}')
    version = subprocess.check_output([str(rea), '--version'], text=True).strip()
    if version != REA_VERSION:
        raise SystemExit(f'REA version differs: expected {REA_VERSION}, got {version}')
    command = [str(rea), 'analyze-javascript-application', str(reference / 'packages/core'),
               '--source-path', 'src/storage_manager/index.ts',
               '--source-path', 'src/editor/index.ts',
               '--analysis-timeout-ms', '60000', '--format', 'json', '--full-output']
    raw = output / 'rea-analysis.json'
    started = time.monotonic()
    with raw.open('w') as stdout, (output / 'rea-progress.log').open('w') as stderr:
        try:
            result = subprocess.run(command, stdout=stdout, stderr=stderr, timeout=180)
            exit_code = result.returncode
        except subprocess.TimeoutExpired:
            exit_code = 124
    try:
        envelope = json.loads(raw.read_text())
    except (json.JSONDecodeError, UnicodeDecodeError):
        envelope = {'ok': False, 'error': {'code': 'invalid_output', 'message': 'REA output was incomplete or not valid JSON.'}}
    summary = summarize(envelope, exit_code)
    metadata = {
        'timestamp_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'rea_version': version, 'reference_repository': 'https://github.com/GrapesJS/grapesjs',
        'reference_commit': commit, 'command': command,
        'node_version': subprocess.check_output(['node', '--version'], text=True).strip(),
        'elapsed_seconds': round(time.monotonic() - started, 3),
        'output_sha256': hashlib.sha256(raw.read_bytes()).hexdigest(),
        'exit_code': exit_code
    }
    (output / 'manifest.json').write_text(json.dumps(metadata, indent=2) + '\n')
    (output / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
    report = ('# REA investigation result\n\n'
              f"Status: **{summary['status']}**\n\n"
              f"REA: {version}\n\nReference: `{commit}`\n\n"
              f"Evidence ID: `{summary['evidence_id'] or 'unavailable'}`\n\n"
              f"Selected-file static analysis succeeded: {summary['analysis_succeeded']}\n\n"
              f"Error: {summary['error_code'] or 'none'}\n\n"
              f"{summary['error_message'] or ''}\n\n"
              'Browser behaviour, visual editing, save/reopen and export are not validated by this probe.\n')
    (output / 'summary.md').write_text(report)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with Path(os.environ['GITHUB_STEP_SUMMARY']).open('a') as destination:
            destination.write(report)
    print(json.dumps(summary, indent=2))
    return 0 if summary['analysis_succeeded'] else 1


if __name__ == '__main__':
    sys.exit(main())
