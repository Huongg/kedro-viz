import React from 'react';
import { connect } from 'react-redux';
import Modal from '../ui/modal';
import Button from '../ui/button';
import { toggleExportModal } from '../../actions';
import exportGraph from './export-graph';
import './export-modal.css';

/**
 * Modal to allow users to choose between SVG/PNG export formats
 */
const ExportModal = ({ graphSize, theme, onToggle, visible }) => {
  if (!visible.exportBtn) {
    return null;
  }
  return (
    <Modal
      title="Export pipeline visualisation"
      onClose={() => onToggle(false)}
      visible={visible.exportModal}
    >
      <div className="pipeline-export-modal">
        <Button
          onClick={() => {
            exportGraph({ format: 'png', theme, graphSize });
            onToggle(false);
          }}
        >
          Download PNG
        </Button>
        <Button
          onClick={() => {
            exportGraph({ format: 'svg', theme, graphSize });
            onToggle(false);
          }}
        >
          Download SVG
        </Button>
      </div>
    </Modal>
  );
};

export const mapStateToProps = (state) => ({
  graphSize: state.graph.size || {},
  visible: state.visible,
  theme: state.theme,
});

export const mapDispatchToProps = (dispatch) => ({
  onToggle: (value) => {
    dispatch(toggleExportModal(value));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportModal);
