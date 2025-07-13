/* webrtc-adapter version 8.2.3 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.adapter = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
/* eslint-env node */

'use strict';

// Shimming starts here.
(function() {
  // Utils.
  var logging = require('./utils').log;
  var browserDetails = require('./utils').browserDetails;

  // Export to the adapter global object visible in the browser.
  module.exports.browserDetails = browserDetails;
  module.exports.extractVersion = require('./utils').extractVersion;
  module.exports.disableLog = require('./utils').disableLog;

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;
  var commonShim = require('./common_shim') || null;

  // Export to the adapter global object visible in the browser.
  module.exports.commonShim = commonShim;

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection) {
        logging('Chrome shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = chromeShim;

      chromeShim.shimGetUserMedia();
      chromeShim.shimMediaStream();
      chromeShim.shimSourceObject();
      chromeShim.shimPeerConnection();
      chromeShim.shimOnTrack();
      chromeShim.shimAddTrackRemoveTrack();
      chromeShim.shimGetSendersWithDtmf();
      chromeShim.shimGetStats();
      chromeShim.shimSenderReceiverGetStats();
      chromeShim.fixNegotiationNeeded();

      commonShim.shimRTCIceCandidate();
      commonShim.shimConnectionState();
      commonShim.shimMaxMessageSize();
      commonShim.shimSendThrowTypeError();
      commonShim.removeAllowExtmapMixed();
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection) {
        logging('Firefox shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = firefoxShim;

      firefoxShim.shimGetUserMedia();
      firefoxShim.shimSourceObject();
      firefoxShim.shimPeerConnection();
      firefoxShim.shimOnTrack();
      firefoxShim.shimRemoveStream();
      firefoxShim.shimSenderGetStats();
      firefoxShim.shimReceiverGetStats();
      firefoxShim.shimRTCDataChannel();
      firefoxShim.shimAddTransceiver();
      firefoxShim.shimGetParameters();
      firefoxShim.shimCreateOffer();
      firefoxShim.shimCreateAnswer();

      commonShim.shimRTCIceCandidate();
      commonShim.shimConnectionState();
      commonShim.shimMaxMessageSize();
      commonShim.shimSendThrowTypeError();
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection) {
        logging('MS edge shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = edgeShim;

      edgeShim.shimGetUserMedia();
      edgeShim.shimPeerConnection();
      edgeShim.shimReplaceTrack();

      // the edge shim implements the full RTCIceCandidate object.

      commonShim.shimMaxMessageSize();
      commonShim.shimSendThrowTypeError();
      break;
    case 'safari':
      if (!safariShim) {
        logging('Safari shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = safariShim;

      safariShim.shimRTCIceServerUrls();
      safariShim.shimCreateOfferLegacy();
      safariShim.shimCallbacksAPI();
      safariShim.shimLocalStreamsAPI();
      safariShim.shimRemoteStreamsAPI();
      safariShim.shimTrackEventTransceiver();
      safariShim.shimGetUserMedia();
      safariShim.shimAudioContext();

      commonShim.shimRTCIceCandidate();
      commonShim.shimMaxMessageSize();
      commonShim.shimSendThrowTypeError();
      commonShim.removeAllowExtmapMixed();
      break;
    default:
      logging('Unsupported browser!');
  }
}());
