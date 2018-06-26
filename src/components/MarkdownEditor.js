import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SimpleMDE from 'simplemde';
import hljs from 'highlight.js';
import Modal from 'react-modal';
import FileChooser from '../containers/views/FileChooser';

const classNames = [
  'editor-toolbar',
  'CodeMirror',
  'editor-preview-side',
  'editor-statusbar',
];

class MarkdownEditor extends Component {
  state = {
    showModal: false,
    startPoint: { line: 0, ch: 0 },
    endPoint: { line: 0, ch: 0 },
    value: '',
  };

  componentDidMount() {
    this.create();
    window.hljs = hljs; // TODO: fix this after the next release of SimpleMDE
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.initialValue !== this.props.initialValue ||
      nextState.showModal !== this.state.showModal
    );
  }

  componentDidUpdate() {
    this.destroy();
    this.create();
  }

  componentWillUnmount() {
    this.destroy();
  }

  showPopup() {
    const cm = this.editor.codemirror;
    const startPoint = cm.getCursor('start');
    const endPoint = cm.getCursor('end');
    this.setState({
      showModal: !this.state.showModal,
      startPoint: startPoint,
      endPoint: endPoint,
      value: cm.getValue(),
    });
  }

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  onClickPickerItem = (url, file) => {
    this.handleCloseModal();
    const { startPoint, endPoint } = this.state;
    const cm = this.editor.codemirror;
    cm.setSelection(startPoint, endPoint);
    cm.replaceSelection(`![caption](${file.path})`);
    this.setState({
      value: cm.getValue(),
    });
  };

  create() {
    const { onChange, onSave } = this.props;
    let opts = Object.assign({}, this.props);
    opts['element'] = this.text;
    opts['autoDownloadFontAwesome'] = false;
    opts['spellChecker'] = false;
    opts['renderingConfig'] = {
      codeSyntaxHighlighting: true,
    };
    let toolbarIcons = [
      'bold',
      'italic',
      'heading',
      '|',
      'code',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
    ];
    if (onSave) {
      toolbarIcons.push({
        name: 'save',
        action: onSave,
        className: 'fa fa-floppy-o',
        title: 'Save',
      });
    }
    toolbarIcons.push({
      name: 'open',
      action: this.showPopup.bind(this),
      className: 'fa fa-folder-open',
      title: 'Choose Image',
    });

    if (this.state.value) {
      opts['initialValue'] = this.state.value;
    }
    opts['toolbar'] = toolbarIcons;
    const editor = new SimpleMDE(opts);
    if (editor.codemirror) {
      editor.codemirror.on('change', () => {
        onChange(editor.value());
      });
    }
    this.editor = editor;
  }

  destroy() {
    for (let i in classNames) {
      let elementToRemove = this.container.querySelector('.' + classNames[i]);
      elementToRemove && elementToRemove.remove();
    }
  }

  render() {
    return (
      <div>
        <div ref={x => (this.container = x)}>
          <textarea ref={x => (this.text = x)} />
        </div>
        <Modal
          isOpen={this.state.showModal}
          onAfterOpen={this.fetchStaticFiles}
          contentLabel="onRequestClose Example"
          onRequestClose={this.handleCloseModal}
          style={{
            overlay: {
              backgroundColor: 'rgba(0,0,0,0.6)',
              zIndex: 10,
            },
            content: {
              margin: 20,
              paddingTop: 0,
              paddingRight: 10,
              paddingLeft: 15,
            },
          }}
        >
          <div className="content">
            <FileChooser onClickStaticFile={this.onClickPickerItem} />
          </div>
        </Modal>
      </div>
    );
  }
}

MarkdownEditor.propTypes = {
  initialValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default MarkdownEditor;
