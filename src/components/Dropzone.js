import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReactDropzone from 'react-dropzone';
import FilePreview from './FilePreview';
import Splitter from './Splitter';

export class Dropzone extends Component {
  openDropzone() {
    this.refs.ReactDropzone.open();
  }

  render() {
    const { files, splat, onDrop, onClickDelete, onClickItem } = this.props;
    return (
      <ReactDropzone
        onDrop={onDrop}
        ref="ReactDropzone"
        className="dropzone"
        activeClassName="dropzone-active"
        multiple={true}
        disableClick={true}
      >
        {files.length ? (
          <div className="preview-container">
            {_.map(files, (file, i) => (
              <FilePreview
                key={i}
                splat={splat}
                onClick={onClickItem}
                onClickDelete={onClickDelete}
                file={file}
              />
            ))}
            <Splitter />
            <div className="preview-tip">
              Drag and drop file(s) here to upload additional items
            </div>
          </div>
        ) : (
          <div className="preview-info">
            <i className="fa fa-upload" aria-hidden="true" />
            <p>Drag and drop file(s) here to upload</p>
          </div>
        )}
      </ReactDropzone>
    );
  }
}

Dropzone.propTypes = {
  files: PropTypes.array.isRequired,
  splat: PropTypes.string.isRequired,
  onDrop: PropTypes.func.isRequired,
  onClickDelete: PropTypes.func.isRequired,
  onClickItem: PropTypes.func,
};

export default Dropzone;
