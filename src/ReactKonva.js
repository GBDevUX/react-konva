/**
 * Based on ReactArt.js
 * Copyright (c) 2017-present Lavrenov Anton.
 * All rights reserved.
 *
 * MIT
 */
'use strict';

const React = require('react');
const Konva = require('konva');
const ReactFiberReconciler = require('react-reconciler');
const ReactDOMComponentTree = require('./ReactDOMComponentTree');
const HostConfig = require('./ReactKonvaHostConfig');
const { applyNodeProps, toggleStrictMode } = require('./makeUpdates');

const REACT_VERSION = '16.6.1';

if (React.version !== REACT_VERSION) {
  console.error(
    `Version mismatch detected for react-konva and react. react-konva expects to have react version ${REACT_VERSION}, but it has version ${
      React.version
    }. Make sure versions are matched, otherwise, react-konva work is not guaranteed.`
  );
}

class Stage extends React.Component {
  componentDidMount() {
    if (!Konva.isBrowser) {
      return;
    }
    this._stage = new Konva.Stage({
      width: this.props.width,
      height: this.props.height,
      container: this._tagRef
    });

    this.props.forwardedRef && this.props.forwardedRef(this._stage);

    applyNodeProps(this._stage, this.props);

    this._mountNode = KonvaRenderer.createContainer(this._stage);
    KonvaRenderer.updateContainer(this.props.children, this._mountNode, this);
  }

  componentDidUpdate(prevProps) {
    if (!Konva.isBrowser) {
      return;
    }
    this.props.forwardedRef && this.props.forwardedRef(this._stage);
    applyNodeProps(this._stage, this.props, prevProps);

    KonvaRenderer.updateContainer(this.props.children, this._mountNode, this);
  }

  componentWillUnmount() {
    if (!Konva.isBrowser) {
      return;
    }
    this.props.forwardedRef && this.props.forwardedRef(null);
    KonvaRenderer.updateContainer(null, this._mountNode, this);
    this._stage.destroy();
  }

  getStage() {
    return this._stage;
  }

  render() {
    const props = this.props;

    return (
      <div
        ref={ref => (this._tagRef = ref)}
        accessKey={props.accessKey}
        className={props.className}
        role={props.role}
        style={props.style}
        tabIndex={props.tabIndex}
        title={props.title}
      />
    );
  }
}

const KONVA_NODES = [
  'Layer',
  'FastLayer',
  'Group',
  'Label',
  'Rect',
  'Circle',
  'Ellipse',
  'Wedge',
  'Line',
  'Sprite',
  'Image',
  'Text',
  'TextPath',
  'Star',
  'Ring',
  'Arc',
  'Tag',
  'Path',
  'RegularPolygon',
  'Arrow',
  'Shape',
  'Transformer'
];

const TYPES = {};

KONVA_NODES.forEach(function(nodeName) {
  TYPES[nodeName] = nodeName;
});

const KonvaRenderer = ReactFiberReconciler(HostConfig);

KonvaRenderer.injectIntoDevTools({
  findFiberByHostInstance: ReactDOMComponentTree.getClosestInstanceFromNode,
  bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
  version: React.version,
  rendererPackageName: 'react-konva',
  getInspectorDataForViewTag: (...args) => {
    console.log(args);
  }
});

/** API */

const StageWrap = React.forwardRef((props, ref) => {
  return <Stage {...props} forwardedRef={ref} />;
});

module.exports = {
  ...TYPES,
  Stage: StageWrap,
  useStrictMode: toggleStrictMode
};
