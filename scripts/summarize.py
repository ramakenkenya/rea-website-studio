"""Describe REA output without treating partial inventory as completed analysis."""


def summarize(envelope, exit_code):
    def find_record(value):
        if isinstance(value, dict):
            if value.get('evidence_id') and isinstance(value.get('normalized_result'), dict):
                return value
            for child in value.values():
                match = find_record(child)
                if match:
                    return match
        elif isinstance(value, list):
            for child in value:
                match = find_record(child)
                if match:
                    return match
        return None

    error = envelope.get('error') or {}
    partial = error.get('details', {}).get('partial_observation', {})
    blocked = exit_code != 0 or envelope.get('ok') is False or bool(error)
    record = find_record(envelope) or {}
    normalized = record.get('normalized_result', {})
    succeeded = (not blocked and envelope.get('ok') is True
                 and record.get('operation') == 'analyze_javascript_application'
                 and isinstance(normalized.get('graph'), dict))
    selection = normalized.get('source_selection', {})
    graph = normalized.get('graph', {})
    return {
        'status': 'blocked' if blocked else ('analysis_returned_success' if succeeded else 'unverified'),
        'analysis_succeeded': succeeded,
        'exit_code': exit_code,
        'error_code': error.get('code'),
        'error_message': error.get('message'),
        'evidence_id': record.get('evidence_id'),
        'selected_sources': selection.get('requested_paths', []),
        'unselected_files': selection.get('unselected_files'),
        'graph_nodes': len(graph.get('nodes', [])),
        'graph_edges': len(graph.get('edges', [])),
        'partial_inventory_nodes': len(partial.get('normalized_result', {}).get('graph', {}).get('nodes', [])),
        'limitations': normalized.get('limitations', []),
        'interpretation': 'Static analysis only. Review recorded scope and limitations; browser behaviour is not yet verified.'
    }
