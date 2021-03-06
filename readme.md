# pxls [![unstable](https://img.shields.io/badge/stability-unstable-green.svg)](http://github.com/badges/stability-badges) [![Build Status](https://travis-ci.org/dy/pxls.svg?branch=master)](https://travis-ci.org/dy/pxls)

Take in custom pixels container, return normalized 4-channel Uint8Array with pixels. Detects float/int input pixels, handles Infinities, unfolds structures.

[![npm install pxls](https://nodei.co/npm/pxls.png?mini=true)](https://npmjs.org/package/pxls/)

```js
var pxls = require('pxls')
var ndarray = require('ndarray')

pxls([[0,0,0], [1,1,1]]) // <uint8 0,0,0,255, 255,255,255,255>
pxls([0, 1], 1) // <uint8 0,0,0,255, 255,255,255,255>
pxls([0,0,0, 1,1,1], [2,1]) // <uint8 0,0,0,255, 255,255,255,255>
pxls(new Ndarray([0,1], [2,1]) // <uint8 0,0,0,255, 255,255,255,255>
pxls(new Ndarray([0,0,0,1,1,1], [2,1,3]) // <uint8 0,0,0,255, 255,255,255,255>
```

## `let pixels = pxls(arr, shape|step?)`

Takes input actual pixels container `arr` and returns 4 channels flat _Uint8Array_ `pixels` with layout `[r,g,b,a, r,g,b,a, r,g,b,a, ...]`.

`arr` can be an Array of Arrays, TypedArray, Ndarray, ImageData or DOM container Image, Video, ImageBitmap, Canvas2D, Context2D, WebGLContext.

1-channel input is mapped as grayscale `[v,v,v,255, v,v,v,255]`. 3-channel input fills last channel with `255` `[r,g,b,255, r,g,b,255]`.

`shape` can describe the shape of input array, eg. `[100,100,3]` or `[10,10]`.

`step` optionally can define input number of channels in flat array, that is detected automatically for nested/ndarrays.


## See also

* [to-uint8](https://ghub.io/to-uint8) − convert input argument to uint8 array.
* [ndarray-to-bitmap-rgba](https://github.com/Jam3/ndarray-bitmap-to-rgba) − convert ndarray to rgba bitmap ndarray.

## License

(c) 2018 Dmitry Yv. MIT License
