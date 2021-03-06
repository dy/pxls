'use strict'

var u8 = require('to-uint8')
var dims = require('compute-dims')
var flat = require('arr-flatten')
var isBuffer = require('is-buffer')
var isBrowser = require('is-browser')
var flip = require('flip-pixels')

module.exports = pxls

var context

function pxls (data, step) {
  if (!data) return data

  // handle ndarrays
  if (isNdarray(data)) {
    var i = 0
    // rgb array
    if (data.shape[2] === 3) {
      var len = data.shape[0] * data.shape[1]
      var out = Array(len << 2)
      var hasInt = false
      for (var x = 0; x < data.shape[0]; x++) {
        for (var y = 0; y < data.shape[1]; y++) {
          var r = data.get(y, x, 0)
          var g = data.get(y, x, 1)
          var b = data.get(y, x, 2)
          out[(i << 2)] = r
          out[(i << 2) + 1] = g
          out[(i << 2) + 2] = b
          if (!hasInt && (r > 1 || g > 1 || b > 1)) hasInt = true
          i++
        }
      }
      var a = hasInt ? 255 : 1
      for (var i = 0; i < len; i++) {
        out[(i << 2) + 3] = a
      }
      data = out
    }
    // bitmap array
    else if (data.shape[2] === 1 || !data.shape[2]) {
      var len = data.shape[0] * data.shape[1]
      var out = Array(len << 2)
      var hasInt = false
      for (var x = 0; x < data.shape[0]; x++) {
        for (var y = 0; y < data.shape[1]; y++) {
          var r = data.get(y, x, 0)
          out[(i << 2)] = r
          out[(i << 2) + 1] = r
          out[(i << 2) + 2] = r
          if (!hasInt && r > 1) hasInt = true
          i++
        }
      }
      var a = hasInt ? 255 : 1
      for (var i = 0; i < len; i++) {
        out[(i << 2) + 3] = a
      }
      data = out
    }
    // direct data
    else {
      data = data.data
    }

    return u8(data)
  }

  // detect w/h/step from options
  var width, height
  if (Array.isArray(step)) {
    width = step[0]
    height = step[1]
    step = step[2]
  }

  // detect w/h from data
  if (!width) width = data.shape ? data.shape[0] : data.width
  if (!height) height = data.shape ? data.shape[1] : data.height

  // intercept absent canvas (useful for headless-gl)
  if (data.gl || data._gl || data.regl) data = data.regl ? data.regl._gl : data.gl || data._gl

  // faster to use drawImage(WrbGLContext), but it has some weird async function/raf side-effect
  if (data.readPixels) {
    var gl = data
    var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4)
    gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    return flip(pixels, gl.drawingBufferWidth, gl.drawingBufferHeight)
  }

  // DOM load async shortcut, expects data to be loaded though
  if (isBrowser) {
    if (data.canvas) data = data.canvas
    if (data.tagName || typeof ImageBitmap !== 'undefined' && data instanceof ImageBitmap) {
      if (!context) context = document.createElement('canvas').getContext('2d')

      // clears canvas too
      context.canvas.width = data.width || width
      context.canvas.height = data.height || height

      context.drawImage(data, 0, 0)

      data = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
    }
  }

  // unfold ImageData
  if (data.data) data = data.data

  // detect nested data shape
  if (Array.isArray(data)) {
    var shape = dims(data, 3)

    if (shape) {
      // [[[r,g,b], [r,g,b], ...], [[r,g,b], [r,g,b], ...]]
      if (shape[2]) step = shape[2]
      // [[r,g,b], [r,g,b], ...]
      // not [[r,g,b,a,r,g,b,a], [r,g,b,a,r,g,b,a]]
      else if (shape[1] && shape[1] <= 4) step = shape[1]
    }

    data = flat(data)
  }

  // if no step detected, figure out step from width/height
  if (step == null && width && height) {
    step = Math.floor(data.length / (width * height))
  }

  // refold buffers
  if (data instanceof ArrayBuffer || isBuffer(data)) data = new Uint8Array(data)

  // ignore bad data
  if (data.length == null) return null

  // [r,g,b, r,g,b, ...]
  if (step === 3) {
    var len = Math.floor(data.length / 3)
    var out = Array(len << 2)
    var hasInt = false
    for (var i = 0; i < len; i++) {
      var r = data[i * 3]
      var g = data[i * 3 + 1]
      var b = data[i * 3 + 2]
      out[(i << 2)] = r
      out[(i << 2) + 1] = g
      out[(i << 2) + 2] = b
      if (!hasInt && (r > 1 || g > 1 || b > 1)) hasInt = true
    }
    var a = hasInt ? 255 : 1
    for (var i = 0; i < len; i++) {
      out[(i << 2) + 3] = a
    }
    data = out
  }
  // [v,v,v,v...]
  else if (step === 1) {
    var len = data.length
    var out = Array(len << 2)
    var hasInt = false
    for (var i = 0; i < len; i++) {
      var r = data[i]
      out[(i << 2)] = r
      out[(i << 2) + 1] = r
      out[(i << 2) + 2] = r
      if (!hasInt && r > 1) hasInt = true
    }
    var a = hasInt ? 255 : 1
    for (var i = 0; i < len; i++) {
      out[(i << 2) + 3] = a
    }
    data = out
  }

  return u8(data)
}


function isNdarray(v) {
  return v &&
      v.shape &&
      v.stride &&
      v.offset != null &&
      v.dtype
}
