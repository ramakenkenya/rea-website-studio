import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from summarize import summarize


class EvidenceSummaryTests(unittest.TestCase):
    def test_partial_inventory_is_never_reported_as_success(self):
        envelope = {
            'ok': False,
            'error': {
                'code': 'capability_unavailable',
                'message': 'process ownership inspection failed',
                'details': {'partial_observation': {
                    'evidence_id': 'ev_partial',
                    'normalized_result': {'graph': {'nodes': [{'kind': 'javascript-asset'}], 'edges': []}}
                }}
            }
        }
        result = summarize(envelope, 1)
        self.assertEqual(result.get('status'), 'blocked')
        self.assertFalse(result.get('analysis_succeeded'))
        self.assertEqual(result.get('partial_inventory_nodes'), 1)

    def test_nonzero_exit_prevents_a_success_claim(self):
        result = summarize({'ok': True, 'result': {'evidence_id': 'ev_1'}}, 1)
        self.assertEqual(result.get('status'), 'blocked')
        self.assertFalse(result.get('analysis_succeeded'))

    def test_zero_exit_without_explicit_success_is_unverified(self):
        result = summarize({'result': {'evidence_id': 'ev_1'}}, 0)
        self.assertEqual(result.get('status'), 'unverified')
        self.assertFalse(result.get('analysis_succeeded'))

    def test_success_requires_an_analysis_record_not_only_ok(self):
        result = summarize({'ok': True, 'result': {}}, 0)
        self.assertEqual(result.get('status'), 'unverified')

    def test_success_preserves_the_evidence_identity_and_scope(self):
        envelope = {'ok': True, 'result': {
            'evidence_id': 'ev_verified',
            'operation': 'analyze_javascript_application',
            'normalized_result': {
                'source_selection': {'requested_paths': ['src/editor/index.ts'], 'unselected_files': 500},
                'graph': {'nodes': [{'kind': 'javascript-asset'}], 'edges': []},
                'statistics': {'parsed_javascript_files': 1, 'skipped_javascript_files': 0, 'parse_failures': 0},
                'semantic_graph': {'nodes': [], 'relations': []},
                'limitations': ['Only selected sources were parsed.']
            }
        }}
        result = summarize(envelope, 0)
        self.assertEqual(result.get('status'), 'analysis_returned_success')
        self.assertTrue(result.get('analysis_succeeded'))
        self.assertEqual(result.get('evidence_id'), 'ev_verified')
        self.assertEqual(result.get('selected_sources'), ['src/editor/index.ts'])
        self.assertEqual(result.get('unselected_files'), 500)


    def test_failed_or_skipped_selected_sources_are_not_success(self):
        # Removing the completion checks must make this regression test fail.
        for stats in [
            {'parsed_javascript_files': 0, 'skipped_javascript_files': 0, 'parse_failures': 1},
            {'parsed_javascript_files': 0, 'skipped_javascript_files': 1, 'parse_failures': 0},
            {'parsed_javascript_files': 0, 'skipped_javascript_files': 0, 'parse_failures': 0},
            {},
        ]:
            with self.subTest(statistics=stats):
                envelope = {'ok': True, 'data': {
                    'evidence_id': 'ev_incomplete',
                    'operation': 'analyze_javascript_application',
                    'normalized_result': {
                        'source_selection': {'requested_paths': ['src/editor/index.ts']},
                        'graph': {'nodes': [], 'edges': []},
                        'semantic_graph': {'nodes': [], 'relations': []},
                        'statistics': stats,
                    }
                }}
                result = summarize(envelope, 0)
                self.assertFalse(result['analysis_succeeded'])
                self.assertEqual(result['status'], 'unverified')

    def test_inventory_without_semantic_graph_is_not_success(self):
        envelope = {'ok': True, 'data': {
            'evidence_id': 'ev_inventory_only',
            'operation': 'analyze_javascript_application',
            'normalized_result': {
                'source_selection': {'requested_paths': ['src/editor/index.ts']},
                'graph': {'nodes': [], 'edges': []},
                'statistics': {'parsed_javascript_files': 1, 'skipped_javascript_files': 0, 'parse_failures': 0},
            }
        }}
        self.assertFalse(summarize(envelope, 0)['analysis_succeeded'])


if __name__ == '__main__':
    unittest.main()
