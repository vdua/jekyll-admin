import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';
import FilePreview from '../../components/FilePreview';
import Button from '../../components/Button';
import Breadcrumbs from '../../components/Breadcrumbs';
import InputSearch from '../../components/form/InputSearch';
import { search } from '../../ducks/utils';
import { existingUploadedFilenames } from '../../utils/helpers';
import {
  fetchStaticFiles,
  filterByFilename,
  deleteStaticFile,
} from '../../ducks/staticfiles';
import { getOverrideMessage } from '../../translations';
import { ADMIN_PREFIX } from '../../constants';
import Dropzone from '../../components/Dropzone';

export class FileChooser extends Component {
  state = {
    prevDirs: [],
    dir: '',
  };

  componentDidMount() {
    const { fetchStaticFiles } = this.props;
    fetchStaticFiles(this.state.dir);
  }

  componentDidUpdate(prevProps, prevState) {
    const { fetchStaticFiles } = this.props;
    if (this.state.dir !== prevState.dir) {
      fetchStaticFiles(this.state.dir);
    }
  }

  changeDir(dir) {
    let prevDirs = this.state.prevDirs;
    prevDirs.push(this.state.dir);
    this.setState({
      prevDirs: prevDirs,
      dir: dir,
    });
  }

  prevDir() {
    let prevDir = this.state.prevDirs.pop();
    this.setState({
      prevDirs: this.state.prevDirs,
      dir: prevDir,
    });
  }

  render() {
    const { isFetching } = this.props;

    if (isFetching) {
      return null;
    }

    const { files, search, onClickStaticFile } = this.props;
    const { prevDirs } = this.state;

    const dirs = _.filter(files, entity => {
      return entity.type && entity.type == 'directory';
    });

    const static_files = _.filter(files, entity => {
      return !entity.type;
    });

    const dir_rows = _.map(dirs, (dir, i) => {
      return (
        <tr key={i}>
          <td className="row-title">
            <strong>
              <span onClick={() => this.changeDir(dir.path)}>
                <i className="fa fa-folder" aria-hidden="true" />
                {dir.name}
              </span>
            </strong>
          </td>
        </tr>
      );
    });

    const dir_table = (
      <div className="content-table">
        <table>
          <thead>
            <tr>
              <th>Sub Directories</th>
            </tr>
          </thead>
          <tbody>{dir_rows}</tbody>
        </table>
      </div>
    );

    let node;
    if (files.length) {
      node = (
        <div className="preview-container">
          {_.map(files, (file, i) => {
            return (
              <FilePreview
                key={i}
                onClick={onClickStaticFile}
                splat="index"
                file={file}
              />
            );
          })}
        </div>
      );
    } else {
      node = (
        <div className="preview-info">
          <i className="fa fa-exclamation-triangle" aria-hidden="true" />
          <h2>No files found!</h2>
          <h4>
            Upload files at 'Directory Listing' to have them displayed here.
          </h4>
        </div>
      );
    }

    return (
      <div>
        <div className="content-header">
          {!_.isEmpty(prevDirs) && (
            <div className="pull-left">
              <Button
                onClick={this.prevDir.bind(this)}
                type="back"
                icon="chevron-circle-left"
                active={true}
              />
            </div>
          )}
          <div className="pull-right">
            <InputSearch searchBy="filename" search={search} />
          </div>
        </div>
        <div className="content-table">
          <table>
            <thead>
              <tr>
                <th>Directory Contents</th>
              </tr>
            </thead>
            <tbody>
              {!_.isEmpty(dirs) && dir_rows}
              <tr>
                <td>
                  <Dropzone
                    ref="dropzone"
                    splat={this.state.dir}
                    files={static_files}
                    onClickItem={onClickStaticFile}
                    onClickDelete={deleteStaticFile}
                    onDrop={static_files => this.onDrop(static_files)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

FileChooser.propTypes = {
  files: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  fetchStaticFiles: PropTypes.func.isRequired,
  search: PropTypes.func.isRequired,
  onClickStaticFile: PropTypes.func,
};

const mapStateToProps = state => ({
  files: filterByFilename(state.staticfiles.files, state.utils.input),
  isFetching: state.staticfiles.isFetching,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchStaticFiles,
      search,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FileChooser);
