'use strict'

var pxls = require('./')
var Ndarray = require('ndarray')
var t = require('tape')
var zeros = require('ndarray-scratch').zeros
var isBrowser = require('is-browser')

t('4-channel array', t => {
	t.deepEqual(pxls([0,0,0,1, 1,1,1,1]), [0,0,0,255, 255,255,255,255])
	t.deepEqual(pxls([[0,0,0,1], [1,1,1,1]]), [0,0,0,255, 255,255,255,255])
	t.deepEqual(pxls([[[0,0,0,1], [1,1,1,1]]]), [0,0,0,255, 255,255,255,255])
	t.deepEqual(pxls([[0,0,0,1, 1,1,1,1]]), [0,0,0,255, 255,255,255,255])

	t.end()
})

t('3-channel array', t => {
	t.deepEqual(pxls([0,0,1, 1,1,1], 3), [0,0,255,255, 255,255,255,255])
	t.deepEqual(pxls([[0,0,0,1], [1,1,1,1]]), [0,0,0,255, 255,255,255,255])
	t.deepEqual(pxls([[[0,0,0,1], [1,1,1,1]]]), [0,0,0,255, 255,255,255,255])
	t.deepEqual(pxls([[0,0,0,1, 1,1,1,1]]), [0,0,0,255, 255,255,255,255])

	t.end()
})
t('1-channel array', t => {
	t.deepEqual(pxls([0,1], 1), [0,0,0,255, 255,255,255,255])
	t.deepEqual(pxls([0,.5], 1), [0,0,0,255, 127,127,127,255])
	t.deepEqual(pxls([0,255], 1), [0,0,0,255, 255,255,255,255])

	t.end()
})
t('shapes', t => {
	t.deepEqual(pxls([0,0,0,1, 1,1,1,1], [1,1]), [0,0,0,255, 255,255,255,255])
	t.deepEqual(pxls([0,0,0, 1,1,1, 1,1,0], [3,1]), [0,0,0,255, 255,255,255,255, 255,255,0,255])
	t.deepEqual(pxls([0,0,0, 1,1,1, 1,1,0], [1,3]), [0,0,0,255, 255,255,255,255, 255,255,0,255])

	t.end()
})

t('4-channel ndarray', t => {
	var x = zeros([5, 3])

	t.deepEqual(pxls(x), [
		0,0,0,255, 0,0,0,255, 0,0,0,255, 0,0,0,255, 0,0,0,255,
		0,0,0,255, 0,0,0,255, 0,0,0,255, 0,0,0,255, 0,0,0,255,
		0,0,0,255, 0,0,0,255, 0,0,0,255, 0,0,0,255, 0,0,0,255
	])

	t.end()
})
t('3-channel ndarray', t => {
	var x = zeros([3, 5, 3])

	t.deepEqual(pxls(x), [
		0,0,0,255, 0,0,0,255, 0,0,0,255,
		0,0,0,255, 0,0,0,255, 0,0,0,255,
		0,0,0,255, 0,0,0,255, 0,0,0,255,
		0,0,0,255, 0,0,0,255, 0,0,0,255,
		0,0,0,255, 0,0,0,255, 0,0,0,255
	])

	t.end()
})
t('1-channel ndarray', t => {
	var x = zeros([3, 5, 1])

	t.deepEqual(pxls(x), [
		0,0,0,255, 0,0,0,255, 0,0,0,255,
		0,0,0,255, 0,0,0,255, 0,0,0,255,
		0,0,0,255, 0,0,0,255, 0,0,0,255,
		0,0,0,255, 0,0,0,255, 0,0,0,255,
		0,0,0,255, 0,0,0,255, 0,0,0,255
	])

	t.end()
})

t('ImageData or alike', t => {
	var data
	if (isBrowser) {
		data = document.createElement('canvas').getContext('2d').createImageData(3,5)
	}
	else {
		data = {
			data: new Uint8ClampedArray(3 * 5 * 4),
			width: 3,
			height: 5
		}
	}

	t.deepEqual(pxls(data), [
		0,0,0,0, 0,0,0,0, 0,0,0,0,
		0,0,0,0, 0,0,0,0, 0,0,0,0,
		0,0,0,0, 0,0,0,0, 0,0,0,0,
		0,0,0,0, 0,0,0,0, 0,0,0,0,
		0,0,0,0, 0,0,0,0, 0,0,0,0
	])

	t.end()
})

t('DOM containers', t => {
	if (!isBrowser) return t.end()

	var context = document.createElement('canvas').getContext('2d')
	context.canvas.width = 3
	context.canvas.height = 5

	var fix = [
		0,0,0,0, 0,0,0,0, 0,0,0,0,
		0,0,0,0, 0,0,0,0, 0,0,0,0,
		0,0,0,0, 0,0,0,0, 0,0,0,0,
		0,0,0,0, 0,0,0,0, 0,0,0,0,
		0,0,0,0, 0,0,0,0, 0,0,0,0
	]

	context.canvas.toBlob(async function (blob) {
		let file = new File([blob], 'x.png')
		let bmpromise = createImageBitmap(blob)
		let bm = await bmpromise

		let canvas = context.canvas
		let idata = context.getImageData(0,0,canvas.width,canvas.height)

		t.deepEqual(pxls(idata), fix)
		t.deepEqual(pxls(idata.data), fix)
		t.deepEqual(pxls(canvas), fix)
		t.deepEqual(pxls(context), fix)
		t.deepEqual(pxls(bm), fix)

		let im = new Image()
		im.src = canvas.toDataURL()
		im.onload = function () {
			t.deepEqual(pxls(im), fix)
			t.end()
		}
	})
})

t('playing aroung', t => {
	t.deepEqual(pxls([0,0,0,0,1,1,1,1]), [0,0,0,0,255,255,255,255])
	t.deepEqual(pxls([0,0,0,0,255,255,255,255]), [0,0,0,0,255,255,255,255])
	t.deepEqual(pxls([0,255],1), [0,0,0,255,255,255,255,255])

	// bad step
	t.deepEqual(pxls([0,0,1,1,0,0,1,1], 2), [0,0,255,255, 0,0,255,255])

	t.end()
})

t('readme', t => {
	t.deepEqual(pxls([[0,0,0], [1,1,1]]), [0,0,0,255, 255,255,255,255])
	t.deepEqual(pxls([0, 1], 1), [0,0,0,255, 255,255,255,255])
	t.deepEqual(pxls([0,0,0, 1,1,1], [2,1]), [0,0,0,255, 255,255,255,255])
	t.deepEqual(pxls(new Ndarray([0,1], [2,1])), [0,0,0,255, 255,255,255,255])
	t.deepEqual(pxls(new Ndarray([0,0,0,1,1,1], [2,1,3])), [0,0,0,255, 255,255,255,255])

	t.end()
})

t('arraybuffer, buffer', t => {
	var b = new Uint8Array([0,0,0,1,0,0,0,1])
	t.deepEqual(b, [0,0,0,1,0,0,0,1])
	t.deepEqual(pxls(b.buffer), [0,0,0,1,0,0,0,1])
	t.deepEqual(pxls(Buffer.from(b.buffer)), [0,0,0,1,0,0,0,1])

	t.end()
})

t('float array', t => {
	var arr = new Float32Array([0,0,1,1])
	t.deepEqual(pxls(arr), [0,0,255,255])
	t.end()
})

t('regl')
