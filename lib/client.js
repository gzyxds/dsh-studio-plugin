window.__ModuleLoader__.load({
	id: "dsh-studio",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/qrcode/lib/can-promise.js
var require_can_promise = __commonJS({
  "node_modules/qrcode/lib/can-promise.js"(exports, module2) {
    module2.exports = function() {
      return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
    };
  }
});

// node_modules/qrcode/lib/core/utils.js
var require_utils = __commonJS({
  "node_modules/qrcode/lib/core/utils.js"(exports) {
    var toSJISFunction;
    var CODEWORDS_COUNT = [
      0,
      // Not used
      26,
      44,
      70,
      100,
      134,
      172,
      196,
      242,
      292,
      346,
      404,
      466,
      532,
      581,
      655,
      733,
      815,
      901,
      991,
      1085,
      1156,
      1258,
      1364,
      1474,
      1588,
      1706,
      1828,
      1921,
      2051,
      2185,
      2323,
      2465,
      2611,
      2761,
      2876,
      3034,
      3196,
      3362,
      3532,
      3706
    ];
    exports.getSymbolSize = function getSymbolSize(version) {
      if (!version) throw new Error('"version" cannot be null or undefined');
      if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40');
      return version * 4 + 17;
    };
    exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
      return CODEWORDS_COUNT[version];
    };
    exports.getBCHDigit = function(data) {
      let digit = 0;
      while (data !== 0) {
        digit++;
        data >>>= 1;
      }
      return digit;
    };
    exports.setToSJISFunction = function setToSJISFunction(f) {
      if (typeof f !== "function") {
        throw new Error('"toSJISFunc" is not a valid function.');
      }
      toSJISFunction = f;
    };
    exports.isKanjiModeEnabled = function() {
      return typeof toSJISFunction !== "undefined";
    };
    exports.toSJIS = function toSJIS(kanji) {
      return toSJISFunction(kanji);
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-level.js
var require_error_correction_level = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
    exports.L = { bit: 1 };
    exports.M = { bit: 0 };
    exports.Q = { bit: 3 };
    exports.H = { bit: 2 };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "l":
        case "low":
          return exports.L;
        case "m":
        case "medium":
          return exports.M;
        case "q":
        case "quartile":
          return exports.Q;
        case "h":
        case "high":
          return exports.H;
        default:
          throw new Error("Unknown EC Level: " + string);
      }
    }
    exports.isValid = function isValid(level) {
      return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
    };
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/bit-buffer.js
var require_bit_buffer = __commonJS({
  "node_modules/qrcode/lib/core/bit-buffer.js"(exports, module2) {
    function BitBuffer() {
      this.buffer = [];
      this.length = 0;
    }
    BitBuffer.prototype = {
      get: function(index) {
        const bufIndex = Math.floor(index / 8);
        return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
      },
      put: function(num, length) {
        for (let i = 0; i < length; i++) {
          this.putBit((num >>> length - i - 1 & 1) === 1);
        }
      },
      getLengthInBits: function() {
        return this.length;
      },
      putBit: function(bit) {
        const bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
          this.buffer.push(0);
        }
        if (bit) {
          this.buffer[bufIndex] |= 128 >>> this.length % 8;
        }
        this.length++;
      }
    };
    module2.exports = BitBuffer;
  }
});

// node_modules/qrcode/lib/core/bit-matrix.js
var require_bit_matrix = __commonJS({
  "node_modules/qrcode/lib/core/bit-matrix.js"(exports, module2) {
    function BitMatrix(size) {
      if (!size || size < 1) {
        throw new Error("BitMatrix size must be defined and greater than 0");
      }
      this.size = size;
      this.data = new Uint8Array(size * size);
      this.reservedBit = new Uint8Array(size * size);
    }
    BitMatrix.prototype.set = function(row, col, value, reserved) {
      const index = row * this.size + col;
      this.data[index] = value;
      if (reserved) this.reservedBit[index] = true;
    };
    BitMatrix.prototype.get = function(row, col) {
      return this.data[row * this.size + col];
    };
    BitMatrix.prototype.xor = function(row, col, value) {
      this.data[row * this.size + col] ^= value;
    };
    BitMatrix.prototype.isReserved = function(row, col) {
      return this.reservedBit[row * this.size + col];
    };
    module2.exports = BitMatrix;
  }
});

// node_modules/qrcode/lib/core/alignment-pattern.js
var require_alignment_pattern = __commonJS({
  "node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    exports.getRowColCoords = function getRowColCoords(version) {
      if (version === 1) return [];
      const posCount = Math.floor(version / 7) + 2;
      const size = getSymbolSize(version);
      const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
      const positions = [size - 7];
      for (let i = 1; i < posCount - 1; i++) {
        positions[i] = positions[i - 1] - intervals;
      }
      positions.push(6);
      return positions.reverse();
    };
    exports.getPositions = function getPositions(version) {
      const coords = [];
      const pos = exports.getRowColCoords(version);
      const posLength = pos.length;
      for (let i = 0; i < posLength; i++) {
        for (let j = 0; j < posLength; j++) {
          if (i === 0 && j === 0 || // top-left
          i === 0 && j === posLength - 1 || // bottom-left
          i === posLength - 1 && j === 0) {
            continue;
          }
          coords.push([pos[i], pos[j]]);
        }
      }
      return coords;
    };
  }
});

// node_modules/qrcode/lib/core/finder-pattern.js
var require_finder_pattern = __commonJS({
  "node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    var FINDER_PATTERN_SIZE = 7;
    exports.getPositions = function getPositions(version) {
      const size = getSymbolSize(version);
      return [
        // top-left
        [0, 0],
        // top-right
        [size - FINDER_PATTERN_SIZE, 0],
        // bottom-left
        [0, size - FINDER_PATTERN_SIZE]
      ];
    };
  }
});

// node_modules/qrcode/lib/core/mask-pattern.js
var require_mask_pattern = __commonJS({
  "node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
    exports.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    var PenaltyScores = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    exports.isValid = function isValid(mask) {
      return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
    };
    exports.from = function from(value) {
      return exports.isValid(value) ? parseInt(value, 10) : void 0;
    };
    exports.getPenaltyN1 = function getPenaltyN1(data) {
      const size = data.size;
      let points = 0;
      let sameCountCol = 0;
      let sameCountRow = 0;
      let lastCol = null;
      let lastRow = null;
      for (let row = 0; row < size; row++) {
        sameCountCol = sameCountRow = 0;
        lastCol = lastRow = null;
        for (let col = 0; col < size; col++) {
          let module3 = data.get(row, col);
          if (module3 === lastCol) {
            sameCountCol++;
          } else {
            if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
            lastCol = module3;
            sameCountCol = 1;
          }
          module3 = data.get(col, row);
          if (module3 === lastRow) {
            sameCountRow++;
          } else {
            if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
            lastRow = module3;
            sameCountRow = 1;
          }
        }
        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
      }
      return points;
    };
    exports.getPenaltyN2 = function getPenaltyN2(data) {
      const size = data.size;
      let points = 0;
      for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
          const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
          if (last === 4 || last === 0) points++;
        }
      }
      return points * PenaltyScores.N2;
    };
    exports.getPenaltyN3 = function getPenaltyN3(data) {
      const size = data.size;
      let points = 0;
      let bitsCol = 0;
      let bitsRow = 0;
      for (let row = 0; row < size; row++) {
        bitsCol = bitsRow = 0;
        for (let col = 0; col < size; col++) {
          bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
          if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
          bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
          if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
        }
      }
      return points * PenaltyScores.N3;
    };
    exports.getPenaltyN4 = function getPenaltyN4(data) {
      let darkCount = 0;
      const modulesCount = data.data.length;
      for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
      const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
      return k * PenaltyScores.N4;
    };
    function getMaskAt(maskPattern, i, j) {
      switch (maskPattern) {
        case exports.Patterns.PATTERN000:
          return (i + j) % 2 === 0;
        case exports.Patterns.PATTERN001:
          return i % 2 === 0;
        case exports.Patterns.PATTERN010:
          return j % 3 === 0;
        case exports.Patterns.PATTERN011:
          return (i + j) % 3 === 0;
        case exports.Patterns.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
        case exports.Patterns.PATTERN101:
          return i * j % 2 + i * j % 3 === 0;
        case exports.Patterns.PATTERN110:
          return (i * j % 2 + i * j % 3) % 2 === 0;
        case exports.Patterns.PATTERN111:
          return (i * j % 3 + (i + j) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + maskPattern);
      }
    }
    exports.applyMask = function applyMask(pattern, data) {
      const size = data.size;
      for (let col = 0; col < size; col++) {
        for (let row = 0; row < size; row++) {
          if (data.isReserved(row, col)) continue;
          data.xor(row, col, getMaskAt(pattern, row, col));
        }
      }
    };
    exports.getBestMask = function getBestMask(data, setupFormatFunc) {
      const numPatterns = Object.keys(exports.Patterns).length;
      let bestPattern = 0;
      let lowerPenalty = Infinity;
      for (let p = 0; p < numPatterns; p++) {
        setupFormatFunc(p);
        exports.applyMask(p, data);
        const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
        exports.applyMask(p, data);
        if (penalty < lowerPenalty) {
          lowerPenalty = penalty;
          bestPattern = p;
        }
      }
      return bestPattern;
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-code.js
var require_error_correction_code = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
    var ECLevel = require_error_correction_level();
    var EC_BLOCKS_TABLE = [
      // L  M  Q  H
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      1,
      2,
      2,
      4,
      1,
      2,
      4,
      4,
      2,
      4,
      4,
      4,
      2,
      4,
      6,
      5,
      2,
      4,
      6,
      6,
      2,
      5,
      8,
      8,
      4,
      5,
      8,
      8,
      4,
      5,
      8,
      11,
      4,
      8,
      10,
      11,
      4,
      9,
      12,
      16,
      4,
      9,
      16,
      16,
      6,
      10,
      12,
      18,
      6,
      10,
      17,
      16,
      6,
      11,
      16,
      19,
      6,
      13,
      18,
      21,
      7,
      14,
      21,
      25,
      8,
      16,
      20,
      25,
      8,
      17,
      23,
      25,
      9,
      17,
      23,
      34,
      9,
      18,
      25,
      30,
      10,
      20,
      27,
      32,
      12,
      21,
      29,
      35,
      12,
      23,
      34,
      37,
      12,
      25,
      34,
      40,
      13,
      26,
      35,
      42,
      14,
      28,
      38,
      45,
      15,
      29,
      40,
      48,
      16,
      31,
      43,
      51,
      17,
      33,
      45,
      54,
      18,
      35,
      48,
      57,
      19,
      37,
      51,
      60,
      19,
      38,
      53,
      63,
      20,
      40,
      56,
      66,
      21,
      43,
      59,
      70,
      22,
      45,
      62,
      74,
      24,
      47,
      65,
      77,
      25,
      49,
      68,
      81
    ];
    var EC_CODEWORDS_TABLE = [
      // L  M  Q  H
      7,
      10,
      13,
      17,
      10,
      16,
      22,
      28,
      15,
      26,
      36,
      44,
      20,
      36,
      52,
      64,
      26,
      48,
      72,
      88,
      36,
      64,
      96,
      112,
      40,
      72,
      108,
      130,
      48,
      88,
      132,
      156,
      60,
      110,
      160,
      192,
      72,
      130,
      192,
      224,
      80,
      150,
      224,
      264,
      96,
      176,
      260,
      308,
      104,
      198,
      288,
      352,
      120,
      216,
      320,
      384,
      132,
      240,
      360,
      432,
      144,
      280,
      408,
      480,
      168,
      308,
      448,
      532,
      180,
      338,
      504,
      588,
      196,
      364,
      546,
      650,
      224,
      416,
      600,
      700,
      224,
      442,
      644,
      750,
      252,
      476,
      690,
      816,
      270,
      504,
      750,
      900,
      300,
      560,
      810,
      960,
      312,
      588,
      870,
      1050,
      336,
      644,
      952,
      1110,
      360,
      700,
      1020,
      1200,
      390,
      728,
      1050,
      1260,
      420,
      784,
      1140,
      1350,
      450,
      812,
      1200,
      1440,
      480,
      868,
      1290,
      1530,
      510,
      924,
      1350,
      1620,
      540,
      980,
      1440,
      1710,
      570,
      1036,
      1530,
      1800,
      570,
      1064,
      1590,
      1890,
      600,
      1120,
      1680,
      1980,
      630,
      1204,
      1770,
      2100,
      660,
      1260,
      1860,
      2220,
      720,
      1316,
      1950,
      2310,
      750,
      1372,
      2040,
      2430
    ];
    exports.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
    exports.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
  }
});

// node_modules/qrcode/lib/core/galois-field.js
var require_galois_field = __commonJS({
  "node_modules/qrcode/lib/core/galois-field.js"(exports) {
    var EXP_TABLE = new Uint8Array(512);
    var LOG_TABLE = new Uint8Array(256);
    (function initTables() {
      let x = 1;
      for (let i = 0; i < 255; i++) {
        EXP_TABLE[i] = x;
        LOG_TABLE[x] = i;
        x <<= 1;
        if (x & 256) {
          x ^= 285;
        }
      }
      for (let i = 255; i < 512; i++) {
        EXP_TABLE[i] = EXP_TABLE[i - 255];
      }
    })();
    exports.log = function log(n) {
      if (n < 1) throw new Error("log(" + n + ")");
      return LOG_TABLE[n];
    };
    exports.exp = function exp(n) {
      return EXP_TABLE[n];
    };
    exports.mul = function mul(x, y) {
      if (x === 0 || y === 0) return 0;
      return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
    };
  }
});

// node_modules/qrcode/lib/core/polynomial.js
var require_polynomial = __commonJS({
  "node_modules/qrcode/lib/core/polynomial.js"(exports) {
    var GF = require_galois_field();
    exports.mul = function mul(p1, p2) {
      const coeff = new Uint8Array(p1.length + p2.length - 1);
      for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
          coeff[i + j] ^= GF.mul(p1[i], p2[j]);
        }
      }
      return coeff;
    };
    exports.mod = function mod(divident, divisor) {
      let result = new Uint8Array(divident);
      while (result.length - divisor.length >= 0) {
        const coeff = result[0];
        for (let i = 0; i < divisor.length; i++) {
          result[i] ^= GF.mul(divisor[i], coeff);
        }
        let offset = 0;
        while (offset < result.length && result[offset] === 0) offset++;
        result = result.slice(offset);
      }
      return result;
    };
    exports.generateECPolynomial = function generateECPolynomial(degree) {
      let poly = new Uint8Array([1]);
      for (let i = 0; i < degree; i++) {
        poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
      }
      return poly;
    };
  }
});

// node_modules/qrcode/lib/core/reed-solomon-encoder.js
var require_reed_solomon_encoder = __commonJS({
  "node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module2) {
    var Polynomial = require_polynomial();
    function ReedSolomonEncoder(degree) {
      this.genPoly = void 0;
      this.degree = degree;
      if (this.degree) this.initialize(this.degree);
    }
    ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
      this.degree = degree;
      this.genPoly = Polynomial.generateECPolynomial(this.degree);
    };
    ReedSolomonEncoder.prototype.encode = function encode(data) {
      if (!this.genPoly) {
        throw new Error("Encoder not initialized");
      }
      const paddedData = new Uint8Array(data.length + this.degree);
      paddedData.set(data);
      const remainder = Polynomial.mod(paddedData, this.genPoly);
      const start = this.degree - remainder.length;
      if (start > 0) {
        const buff = new Uint8Array(this.degree);
        buff.set(remainder, start);
        return buff;
      }
      return remainder;
    };
    module2.exports = ReedSolomonEncoder;
  }
});

// node_modules/qrcode/lib/core/version-check.js
var require_version_check = __commonJS({
  "node_modules/qrcode/lib/core/version-check.js"(exports) {
    exports.isValid = function isValid(version) {
      return !isNaN(version) && version >= 1 && version <= 40;
    };
  }
});

// node_modules/qrcode/lib/core/regex.js
var require_regex = __commonJS({
  "node_modules/qrcode/lib/core/regex.js"(exports) {
    var numeric = "[0-9]+";
    var alphanumeric = "[A-Z $%*+\\-./:]+";
    var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
    kanji = kanji.replace(/u/g, "\\u");
    var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
    exports.KANJI = new RegExp(kanji, "g");
    exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
    exports.BYTE = new RegExp(byte, "g");
    exports.NUMERIC = new RegExp(numeric, "g");
    exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
    var TEST_KANJI = new RegExp("^" + kanji + "$");
    var TEST_NUMERIC = new RegExp("^" + numeric + "$");
    var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
    exports.testKanji = function testKanji(str) {
      return TEST_KANJI.test(str);
    };
    exports.testNumeric = function testNumeric(str) {
      return TEST_NUMERIC.test(str);
    };
    exports.testAlphanumeric = function testAlphanumeric(str) {
      return TEST_ALPHANUMERIC.test(str);
    };
  }
});

// node_modules/qrcode/lib/core/mode.js
var require_mode = __commonJS({
  "node_modules/qrcode/lib/core/mode.js"(exports) {
    var VersionCheck = require_version_check();
    var Regex = require_regex();
    exports.NUMERIC = {
      id: "Numeric",
      bit: 1 << 0,
      ccBits: [10, 12, 14]
    };
    exports.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 1 << 1,
      ccBits: [9, 11, 13]
    };
    exports.BYTE = {
      id: "Byte",
      bit: 1 << 2,
      ccBits: [8, 16, 16]
    };
    exports.KANJI = {
      id: "Kanji",
      bit: 1 << 3,
      ccBits: [8, 10, 12]
    };
    exports.MIXED = {
      bit: -1
    };
    exports.getCharCountIndicator = function getCharCountIndicator(mode, version) {
      if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid version: " + version);
      }
      if (version >= 1 && version < 10) return mode.ccBits[0];
      else if (version < 27) return mode.ccBits[1];
      return mode.ccBits[2];
    };
    exports.getBestModeForData = function getBestModeForData(dataStr) {
      if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
      else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
      else if (Regex.testKanji(dataStr)) return exports.KANJI;
      else return exports.BYTE;
    };
    exports.toString = function toString(mode) {
      if (mode && mode.id) return mode.id;
      throw new Error("Invalid mode");
    };
    exports.isValid = function isValid(mode) {
      return mode && mode.bit && mode.ccBits;
    };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "numeric":
          return exports.NUMERIC;
        case "alphanumeric":
          return exports.ALPHANUMERIC;
        case "kanji":
          return exports.KANJI;
        case "byte":
          return exports.BYTE;
        default:
          throw new Error("Unknown mode: " + string);
      }
    }
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/version.js
var require_version = __commonJS({
  "node_modules/qrcode/lib/core/version.js"(exports) {
    var Utils = require_utils();
    var ECCode = require_error_correction_code();
    var ECLevel = require_error_correction_level();
    var Mode = require_mode();
    var VersionCheck = require_version_check();
    var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
    var G18_BCH = Utils.getBCHDigit(G18);
    function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    function getReservedBitsCount(mode, version) {
      return Mode.getCharCountIndicator(mode, version) + 4;
    }
    function getTotalBitsFromDataArray(segments, version) {
      let totalBits = 0;
      segments.forEach(function(data) {
        const reservedBits = getReservedBitsCount(data.mode, version);
        totalBits += reservedBits + data.getBitsLength();
      });
      return totalBits;
    }
    function getBestVersionForMixedData(segments, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        const length = getTotalBitsFromDataArray(segments, currentVersion);
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    exports.from = function from(value, defaultValue) {
      if (VersionCheck.isValid(value)) {
        return parseInt(value, 10);
      }
      return defaultValue;
    };
    exports.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid QR Code version");
      }
      if (typeof mode === "undefined") mode = Mode.BYTE;
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (mode === Mode.MIXED) return dataTotalCodewordsBits;
      const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
      switch (mode) {
        case Mode.NUMERIC:
          return Math.floor(usableBits / 10 * 3);
        case Mode.ALPHANUMERIC:
          return Math.floor(usableBits / 11 * 2);
        case Mode.KANJI:
          return Math.floor(usableBits / 13);
        case Mode.BYTE:
        default:
          return Math.floor(usableBits / 8);
      }
    };
    exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
      let seg;
      const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
      if (Array.isArray(data)) {
        if (data.length > 1) {
          return getBestVersionForMixedData(data, ecl);
        }
        if (data.length === 0) {
          return 1;
        }
        seg = data[0];
      } else {
        seg = data;
      }
      return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
    };
    exports.getEncodedBits = function getEncodedBits(version) {
      if (!VersionCheck.isValid(version) || version < 7) {
        throw new Error("Invalid QR Code version");
      }
      let d = version << 12;
      while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
        d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
      }
      return version << 12 | d;
    };
  }
});

// node_modules/qrcode/lib/core/format-info.js
var require_format_info = __commonJS({
  "node_modules/qrcode/lib/core/format-info.js"(exports) {
    var Utils = require_utils();
    var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
    var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
    var G15_BCH = Utils.getBCHDigit(G15);
    exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
      const data = errorCorrectionLevel.bit << 3 | mask;
      let d = data << 10;
      while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
        d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
      }
      return (data << 10 | d) ^ G15_MASK;
    };
  }
});

// node_modules/qrcode/lib/core/numeric-data.js
var require_numeric_data = __commonJS({
  "node_modules/qrcode/lib/core/numeric-data.js"(exports, module2) {
    var Mode = require_mode();
    function NumericData(data) {
      this.mode = Mode.NUMERIC;
      this.data = data.toString();
    }
    NumericData.getBitsLength = function getBitsLength(length) {
      return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
    };
    NumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    NumericData.prototype.getBitsLength = function getBitsLength() {
      return NumericData.getBitsLength(this.data.length);
    };
    NumericData.prototype.write = function write(bitBuffer) {
      let i, group, value;
      for (i = 0; i + 3 <= this.data.length; i += 3) {
        group = this.data.substr(i, 3);
        value = parseInt(group, 10);
        bitBuffer.put(value, 10);
      }
      const remainingNum = this.data.length - i;
      if (remainingNum > 0) {
        group = this.data.substr(i);
        value = parseInt(group, 10);
        bitBuffer.put(value, remainingNum * 3 + 1);
      }
    };
    module2.exports = NumericData;
  }
});

// node_modules/qrcode/lib/core/alphanumeric-data.js
var require_alphanumeric_data = __commonJS({
  "node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module2) {
    var Mode = require_mode();
    var ALPHA_NUM_CHARS = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      " ",
      "$",
      "%",
      "*",
      "+",
      "-",
      ".",
      "/",
      ":"
    ];
    function AlphanumericData(data) {
      this.mode = Mode.ALPHANUMERIC;
      this.data = data;
    }
    AlphanumericData.getBitsLength = function getBitsLength(length) {
      return 11 * Math.floor(length / 2) + 6 * (length % 2);
    };
    AlphanumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    AlphanumericData.prototype.getBitsLength = function getBitsLength() {
      return AlphanumericData.getBitsLength(this.data.length);
    };
    AlphanumericData.prototype.write = function write(bitBuffer) {
      let i;
      for (i = 0; i + 2 <= this.data.length; i += 2) {
        let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
        value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
        bitBuffer.put(value, 11);
      }
      if (this.data.length % 2) {
        bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
      }
    };
    module2.exports = AlphanumericData;
  }
});

// node_modules/qrcode/lib/core/byte-data.js
var require_byte_data = __commonJS({
  "node_modules/qrcode/lib/core/byte-data.js"(exports, module2) {
    var Mode = require_mode();
    function ByteData(data) {
      this.mode = Mode.BYTE;
      if (typeof data === "string") {
        this.data = new TextEncoder().encode(data);
      } else {
        this.data = new Uint8Array(data);
      }
    }
    ByteData.getBitsLength = function getBitsLength(length) {
      return length * 8;
    };
    ByteData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    ByteData.prototype.getBitsLength = function getBitsLength() {
      return ByteData.getBitsLength(this.data.length);
    };
    ByteData.prototype.write = function(bitBuffer) {
      for (let i = 0, l = this.data.length; i < l; i++) {
        bitBuffer.put(this.data[i], 8);
      }
    };
    module2.exports = ByteData;
  }
});

// node_modules/qrcode/lib/core/kanji-data.js
var require_kanji_data = __commonJS({
  "node_modules/qrcode/lib/core/kanji-data.js"(exports, module2) {
    var Mode = require_mode();
    var Utils = require_utils();
    function KanjiData(data) {
      this.mode = Mode.KANJI;
      this.data = data;
    }
    KanjiData.getBitsLength = function getBitsLength(length) {
      return length * 13;
    };
    KanjiData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    KanjiData.prototype.getBitsLength = function getBitsLength() {
      return KanjiData.getBitsLength(this.data.length);
    };
    KanjiData.prototype.write = function(bitBuffer) {
      let i;
      for (i = 0; i < this.data.length; i++) {
        let value = Utils.toSJIS(this.data[i]);
        if (value >= 33088 && value <= 40956) {
          value -= 33088;
        } else if (value >= 57408 && value <= 60351) {
          value -= 49472;
        } else {
          throw new Error(
            "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
          );
        }
        value = (value >>> 8 & 255) * 192 + (value & 255);
        bitBuffer.put(value, 13);
      }
    };
    module2.exports = KanjiData;
  }
});

// node_modules/dijkstrajs/dijkstra.js
var require_dijkstra = __commonJS({
  "node_modules/dijkstrajs/dijkstra.js"(exports, module2) {
    "use strict";
    var dijkstra = {
      single_source_shortest_paths: function(graph, s, d) {
        var predecessors = {};
        var costs = {};
        costs[s] = 0;
        var open = dijkstra.PriorityQueue.make();
        open.push(s, 0);
        var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
        while (!open.empty()) {
          closest = open.pop();
          u = closest.value;
          cost_of_s_to_u = closest.cost;
          adjacent_nodes = graph[u] || {};
          for (v in adjacent_nodes) {
            if (adjacent_nodes.hasOwnProperty(v)) {
              cost_of_e = adjacent_nodes[v];
              cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
              cost_of_s_to_v = costs[v];
              first_visit = typeof costs[v] === "undefined";
              if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                costs[v] = cost_of_s_to_u_plus_cost_of_e;
                open.push(v, cost_of_s_to_u_plus_cost_of_e);
                predecessors[v] = u;
              }
            }
          }
        }
        if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
          var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
          throw new Error(msg);
        }
        return predecessors;
      },
      extract_shortest_path_from_predecessor_list: function(predecessors, d) {
        var nodes = [];
        var u = d;
        var predecessor;
        while (u) {
          nodes.push(u);
          predecessor = predecessors[u];
          u = predecessors[u];
        }
        nodes.reverse();
        return nodes;
      },
      find_path: function(graph, s, d) {
        var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
        return dijkstra.extract_shortest_path_from_predecessor_list(
          predecessors,
          d
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(opts) {
          var T = dijkstra.PriorityQueue, t = {}, key;
          opts = opts || {};
          for (key in T) {
            if (T.hasOwnProperty(key)) {
              t[key] = T[key];
            }
          }
          t.queue = [];
          t.sorter = opts.sorter || T.default_sorter;
          return t;
        },
        default_sorter: function(a, b) {
          return a.cost - b.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(value, cost) {
          var item = { value, cost };
          this.queue.push(item);
          this.queue.sort(this.sorter);
        },
        /**
         * Return the highest priority element in the queue.
         */
        pop: function() {
          return this.queue.shift();
        },
        empty: function() {
          return this.queue.length === 0;
        }
      }
    };
    if (typeof module2 !== "undefined") {
      module2.exports = dijkstra;
    }
  }
});

// node_modules/qrcode/lib/core/segments.js
var require_segments = __commonJS({
  "node_modules/qrcode/lib/core/segments.js"(exports) {
    var Mode = require_mode();
    var NumericData = require_numeric_data();
    var AlphanumericData = require_alphanumeric_data();
    var ByteData = require_byte_data();
    var KanjiData = require_kanji_data();
    var Regex = require_regex();
    var Utils = require_utils();
    var dijkstra = require_dijkstra();
    function getStringByteLength(str) {
      return unescape(encodeURIComponent(str)).length;
    }
    function getSegments(regex, mode, str) {
      const segments = [];
      let result;
      while ((result = regex.exec(str)) !== null) {
        segments.push({
          data: result[0],
          index: result.index,
          mode,
          length: result[0].length
        });
      }
      return segments;
    }
    function getSegmentsFromString(dataStr) {
      const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
      const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
      let byteSegs;
      let kanjiSegs;
      if (Utils.isKanjiModeEnabled()) {
        byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
        kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
      } else {
        byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
        kanjiSegs = [];
      }
      const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
      return segs.sort(function(s1, s2) {
        return s1.index - s2.index;
      }).map(function(obj) {
        return {
          data: obj.data,
          mode: obj.mode,
          length: obj.length
        };
      });
    }
    function getSegmentBitsLength(length, mode) {
      switch (mode) {
        case Mode.NUMERIC:
          return NumericData.getBitsLength(length);
        case Mode.ALPHANUMERIC:
          return AlphanumericData.getBitsLength(length);
        case Mode.KANJI:
          return KanjiData.getBitsLength(length);
        case Mode.BYTE:
          return ByteData.getBitsLength(length);
      }
    }
    function mergeSegments(segs) {
      return segs.reduce(function(acc, curr) {
        const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
        if (prevSeg && prevSeg.mode === curr.mode) {
          acc[acc.length - 1].data += curr.data;
          return acc;
        }
        acc.push(curr);
        return acc;
      }, []);
    }
    function buildNodes(segs) {
      const nodes = [];
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        switch (seg.mode) {
          case Mode.NUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.ALPHANUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.KANJI:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
            break;
          case Mode.BYTE:
            nodes.push([
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
        }
      }
      return nodes;
    }
    function buildGraph(nodes, version) {
      const table = {};
      const graph = { start: {} };
      let prevNodeIds = ["start"];
      for (let i = 0; i < nodes.length; i++) {
        const nodeGroup = nodes[i];
        const currentNodeIds = [];
        for (let j = 0; j < nodeGroup.length; j++) {
          const node = nodeGroup[j];
          const key = "" + i + j;
          currentNodeIds.push(key);
          table[key] = { node, lastCount: 0 };
          graph[key] = {};
          for (let n = 0; n < prevNodeIds.length; n++) {
            const prevNodeId = prevNodeIds[n];
            if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
              graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
              table[prevNodeId].lastCount += node.length;
            } else {
              if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
              graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
            }
          }
        }
        prevNodeIds = currentNodeIds;
      }
      for (let n = 0; n < prevNodeIds.length; n++) {
        graph[prevNodeIds[n]].end = 0;
      }
      return { map: graph, table };
    }
    function buildSingleSegment(data, modesHint) {
      let mode;
      const bestMode = Mode.getBestModeForData(data);
      mode = Mode.from(modesHint, bestMode);
      if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
        throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
      }
      if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
        mode = Mode.BYTE;
      }
      switch (mode) {
        case Mode.NUMERIC:
          return new NumericData(data);
        case Mode.ALPHANUMERIC:
          return new AlphanumericData(data);
        case Mode.KANJI:
          return new KanjiData(data);
        case Mode.BYTE:
          return new ByteData(data);
      }
    }
    exports.fromArray = function fromArray(array) {
      return array.reduce(function(acc, seg) {
        if (typeof seg === "string") {
          acc.push(buildSingleSegment(seg, null));
        } else if (seg.data) {
          acc.push(buildSingleSegment(seg.data, seg.mode));
        }
        return acc;
      }, []);
    };
    exports.fromString = function fromString(data, version) {
      const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
      const nodes = buildNodes(segs);
      const graph = buildGraph(nodes, version);
      const path = dijkstra.find_path(graph.map, "start", "end");
      const optimizedSegs = [];
      for (let i = 1; i < path.length - 1; i++) {
        optimizedSegs.push(graph.table[path[i]].node);
      }
      return exports.fromArray(mergeSegments(optimizedSegs));
    };
    exports.rawSplit = function rawSplit(data) {
      return exports.fromArray(
        getSegmentsFromString(data, Utils.isKanjiModeEnabled())
      );
    };
  }
});

// node_modules/qrcode/lib/core/qrcode.js
var require_qrcode = __commonJS({
  "node_modules/qrcode/lib/core/qrcode.js"(exports) {
    var Utils = require_utils();
    var ECLevel = require_error_correction_level();
    var BitBuffer = require_bit_buffer();
    var BitMatrix = require_bit_matrix();
    var AlignmentPattern = require_alignment_pattern();
    var FinderPattern = require_finder_pattern();
    var MaskPattern = require_mask_pattern();
    var ECCode = require_error_correction_code();
    var ReedSolomonEncoder = require_reed_solomon_encoder();
    var Version = require_version();
    var FormatInfo = require_format_info();
    var Mode = require_mode();
    var Segments = require_segments();
    function setupFinderPattern(matrix, version) {
      const size = matrix.size;
      const pos = FinderPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -1; r <= 7; r++) {
          if (row + r <= -1 || size <= row + r) continue;
          for (let c = -1; c <= 7; c++) {
            if (col + c <= -1 || size <= col + c) continue;
            if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupTimingPattern(matrix) {
      const size = matrix.size;
      for (let r = 8; r < size - 8; r++) {
        const value = r % 2 === 0;
        matrix.set(r, 6, value, true);
        matrix.set(6, r, value, true);
      }
    }
    function setupAlignmentPattern(matrix, version) {
      const pos = AlignmentPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupVersionInfo(matrix, version) {
      const size = matrix.size;
      const bits = Version.getEncodedBits(version);
      let row, col, mod;
      for (let i = 0; i < 18; i++) {
        row = Math.floor(i / 3);
        col = i % 3 + size - 8 - 3;
        mod = (bits >> i & 1) === 1;
        matrix.set(row, col, mod, true);
        matrix.set(col, row, mod, true);
      }
    }
    function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
      const size = matrix.size;
      const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
      let i, mod;
      for (i = 0; i < 15; i++) {
        mod = (bits >> i & 1) === 1;
        if (i < 6) {
          matrix.set(i, 8, mod, true);
        } else if (i < 8) {
          matrix.set(i + 1, 8, mod, true);
        } else {
          matrix.set(size - 15 + i, 8, mod, true);
        }
        if (i < 8) {
          matrix.set(8, size - i - 1, mod, true);
        } else if (i < 9) {
          matrix.set(8, 15 - i - 1 + 1, mod, true);
        } else {
          matrix.set(8, 15 - i - 1, mod, true);
        }
      }
      matrix.set(size - 8, 8, 1, true);
    }
    function setupData(matrix, data) {
      const size = matrix.size;
      let inc = -1;
      let row = size - 1;
      let bitIndex = 7;
      let byteIndex = 0;
      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        while (true) {
          for (let c = 0; c < 2; c++) {
            if (!matrix.isReserved(row, col - c)) {
              let dark = false;
              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) === 1;
              }
              matrix.set(row, col - c, dark);
              bitIndex--;
              if (bitIndex === -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || size <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
    function createData(version, errorCorrectionLevel, segments) {
      const buffer = new BitBuffer();
      segments.forEach(function(data) {
        buffer.put(data.mode.bit, 4);
        buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
        data.write(buffer);
      });
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
        buffer.put(0, 4);
      }
      while (buffer.getLengthInBits() % 8 !== 0) {
        buffer.putBit(0);
      }
      const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
      for (let i = 0; i < remainingByte; i++) {
        buffer.put(i % 2 ? 17 : 236, 8);
      }
      return createCodewords(buffer, version, errorCorrectionLevel);
    }
    function createCodewords(bitBuffer, version, errorCorrectionLevel) {
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewords = totalCodewords - ecTotalCodewords;
      const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
      const blocksInGroup2 = totalCodewords % ecTotalBlocks;
      const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
      const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
      const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
      const rs = new ReedSolomonEncoder(ecCount);
      let offset = 0;
      const dcData = new Array(ecTotalBlocks);
      const ecData = new Array(ecTotalBlocks);
      let maxDataSize = 0;
      const buffer = new Uint8Array(bitBuffer.buffer);
      for (let b = 0; b < ecTotalBlocks; b++) {
        const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
        dcData[b] = buffer.slice(offset, offset + dataSize);
        ecData[b] = rs.encode(dcData[b]);
        offset += dataSize;
        maxDataSize = Math.max(maxDataSize, dataSize);
      }
      const data = new Uint8Array(totalCodewords);
      let index = 0;
      let i, r;
      for (i = 0; i < maxDataSize; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          if (i < dcData[r].length) {
            data[index++] = dcData[r][i];
          }
        }
      }
      for (i = 0; i < ecCount; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          data[index++] = ecData[r][i];
        }
      }
      return data;
    }
    function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
      let segments;
      if (Array.isArray(data)) {
        segments = Segments.fromArray(data);
      } else if (typeof data === "string") {
        let estimatedVersion = version;
        if (!estimatedVersion) {
          const rawSegments = Segments.rawSplit(data);
          estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
        }
        segments = Segments.fromString(data, estimatedVersion || 40);
      } else {
        throw new Error("Invalid data");
      }
      const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
      if (!bestVersion) {
        throw new Error("The amount of data is too big to be stored in a QR Code");
      }
      if (!version) {
        version = bestVersion;
      } else if (version < bestVersion) {
        throw new Error(
          "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
        );
      }
      const dataBits = createData(version, errorCorrectionLevel, segments);
      const moduleCount = Utils.getSymbolSize(version);
      const modules = new BitMatrix(moduleCount);
      setupFinderPattern(modules, version);
      setupTimingPattern(modules);
      setupAlignmentPattern(modules, version);
      setupFormatInfo(modules, errorCorrectionLevel, 0);
      if (version >= 7) {
        setupVersionInfo(modules, version);
      }
      setupData(modules, dataBits);
      if (isNaN(maskPattern)) {
        maskPattern = MaskPattern.getBestMask(
          modules,
          setupFormatInfo.bind(null, modules, errorCorrectionLevel)
        );
      }
      MaskPattern.applyMask(maskPattern, modules);
      setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
      return {
        modules,
        version,
        errorCorrectionLevel,
        maskPattern,
        segments
      };
    }
    exports.create = function create(data, options) {
      if (typeof data === "undefined" || data === "") {
        throw new Error("No input text");
      }
      let errorCorrectionLevel = ECLevel.M;
      let version;
      let mask;
      if (typeof options !== "undefined") {
        errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
        version = Version.from(options.version);
        mask = MaskPattern.from(options.maskPattern);
        if (options.toSJISFunc) {
          Utils.setToSJISFunction(options.toSJISFunc);
        }
      }
      return createSymbol(data, version, errorCorrectionLevel, mask);
    };
  }
});

// node_modules/qrcode/lib/renderer/utils.js
var require_utils2 = __commonJS({
  "node_modules/qrcode/lib/renderer/utils.js"(exports) {
    function hex2rgba(hex) {
      if (typeof hex === "number") {
        hex = hex.toString();
      }
      if (typeof hex !== "string") {
        throw new Error("Color should be defined as hex string");
      }
      let hexCode = hex.slice().replace("#", "").split("");
      if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
        throw new Error("Invalid hex color: " + hex);
      }
      if (hexCode.length === 3 || hexCode.length === 4) {
        hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
          return [c, c];
        }));
      }
      if (hexCode.length === 6) hexCode.push("F", "F");
      const hexValue = parseInt(hexCode.join(""), 16);
      return {
        r: hexValue >> 24 & 255,
        g: hexValue >> 16 & 255,
        b: hexValue >> 8 & 255,
        a: hexValue & 255,
        hex: "#" + hexCode.slice(0, 6).join("")
      };
    }
    exports.getOptions = function getOptions(options) {
      if (!options) options = {};
      if (!options.color) options.color = {};
      const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
      const width = options.width && options.width >= 21 ? options.width : void 0;
      const scale = options.scale || 4;
      return {
        width,
        scale: width ? 4 : scale,
        margin,
        color: {
          dark: hex2rgba(options.color.dark || "#000000ff"),
          light: hex2rgba(options.color.light || "#ffffffff")
        },
        type: options.type,
        rendererOpts: options.rendererOpts || {}
      };
    };
    exports.getScale = function getScale(qrSize, opts) {
      return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
    };
    exports.getImageWidth = function getImageWidth(qrSize, opts) {
      const scale = exports.getScale(qrSize, opts);
      return Math.floor((qrSize + opts.margin * 2) * scale);
    };
    exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
      const size = qr.modules.size;
      const data = qr.modules.data;
      const scale = exports.getScale(size, opts);
      const symbolSize = Math.floor((size + opts.margin * 2) * scale);
      const scaledMargin = opts.margin * scale;
      const palette = [opts.color.light, opts.color.dark];
      for (let i = 0; i < symbolSize; i++) {
        for (let j = 0; j < symbolSize; j++) {
          let posDst = (i * symbolSize + j) * 4;
          let pxColor = opts.color.light;
          if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
            const iSrc = Math.floor((i - scaledMargin) / scale);
            const jSrc = Math.floor((j - scaledMargin) / scale);
            pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
          }
          imgData[posDst++] = pxColor.r;
          imgData[posDst++] = pxColor.g;
          imgData[posDst++] = pxColor.b;
          imgData[posDst] = pxColor.a;
        }
      }
    };
  }
});

// node_modules/qrcode/lib/renderer/canvas.js
var require_canvas = __commonJS({
  "node_modules/qrcode/lib/renderer/canvas.js"(exports) {
    var Utils = require_utils2();
    function clearCanvas(ctx, canvas, size) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!canvas.style) canvas.style = {};
      canvas.height = size;
      canvas.width = size;
      canvas.style.height = size + "px";
      canvas.style.width = size + "px";
    }
    function getCanvasElement() {
      try {
        return document.createElement("canvas");
      } catch (e) {
        throw new Error("You need to specify a canvas element");
      }
    }
    exports.render = function render(qrData, canvas, options) {
      let opts = options;
      let canvasEl = canvas;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!canvas) {
        canvasEl = getCanvasElement();
      }
      opts = Utils.getOptions(opts);
      const size = Utils.getImageWidth(qrData.modules.size, opts);
      const ctx = canvasEl.getContext("2d");
      const image = ctx.createImageData(size, size);
      Utils.qrToImageData(image.data, qrData, opts);
      clearCanvas(ctx, canvasEl, size);
      ctx.putImageData(image, 0, 0);
      return canvasEl;
    };
    exports.renderToDataURL = function renderToDataURL(qrData, canvas, options) {
      let opts = options;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!opts) opts = {};
      const canvasEl = exports.render(qrData, canvas, opts);
      const type = opts.type || "image/png";
      const rendererOpts = opts.rendererOpts || {};
      return canvasEl.toDataURL(type, rendererOpts.quality);
    };
  }
});

// node_modules/qrcode/lib/renderer/svg-tag.js
var require_svg_tag = __commonJS({
  "node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
    var Utils = require_utils2();
    function getColorAttrib(color, attrib) {
      const alpha = color.a / 255;
      const str = attrib + '="' + color.hex + '"';
      return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
    }
    function svgCmd(cmd, x, y) {
      let str = cmd + x;
      if (typeof y !== "undefined") str += " " + y;
      return str;
    }
    function qrToPath(data, size, margin) {
      let path = "";
      let moveBy = 0;
      let newRow = false;
      let lineLength = 0;
      for (let i = 0; i < data.length; i++) {
        const col = Math.floor(i % size);
        const row = Math.floor(i / size);
        if (!col && !newRow) newRow = true;
        if (data[i]) {
          lineLength++;
          if (!(i > 0 && col > 0 && data[i - 1])) {
            path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
            moveBy = 0;
            newRow = false;
          }
          if (!(col + 1 < size && data[i + 1])) {
            path += svgCmd("h", lineLength);
            lineLength = 0;
          }
        } else {
          moveBy++;
        }
      }
      return path;
    }
    exports.render = function render(qrData, options, cb) {
      const opts = Utils.getOptions(options);
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const qrcodesize = size + opts.margin * 2;
      const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
      const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
      const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
      const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
      const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
      if (typeof cb === "function") {
        cb(null, svgTag);
      }
      return svgTag;
    };
  }
});

// node_modules/qrcode/lib/browser.js
var require_browser = __commonJS({
  "node_modules/qrcode/lib/browser.js"(exports) {
    var canPromise = require_can_promise();
    var QRCode2 = require_qrcode();
    var CanvasRenderer = require_canvas();
    var SvgRenderer = require_svg_tag();
    function renderCanvas(renderFunc, canvas, text, opts, cb) {
      const args = [].slice.call(arguments, 1);
      const argsNum = args.length;
      const isLastArgCb = typeof args[argsNum - 1] === "function";
      if (!isLastArgCb && !canPromise()) {
        throw new Error("Callback required as last argument");
      }
      if (isLastArgCb) {
        if (argsNum < 2) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 2) {
          cb = text;
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 3) {
          if (canvas.getContext && typeof cb === "undefined") {
            cb = opts;
            opts = void 0;
          } else {
            cb = opts;
            opts = text;
            text = canvas;
            canvas = void 0;
          }
        }
      } else {
        if (argsNum < 1) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 1) {
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 2 && !canvas.getContext) {
          opts = text;
          text = canvas;
          canvas = void 0;
        }
        return new Promise(function(resolve, reject) {
          try {
            const data = QRCode2.create(text, opts);
            resolve(renderFunc(data, canvas, opts));
          } catch (e) {
            reject(e);
          }
        });
      }
      try {
        const data = QRCode2.create(text, opts);
        cb(null, renderFunc(data, canvas, opts));
      } catch (e) {
        cb(e);
      }
    }
    exports.create = QRCode2.create;
    exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
    exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
    exports.toString = renderCanvas.bind(null, function(data, _, opts) {
      return SvgRenderer.render(data, opts);
    });
  }
});

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/App.tsx
var import_react2 = require("react");

// src/data/config/operators.ts
var OPERATOR_META = {
  mobile: {
    key: "mobile",
    label: "\u4E2D\u56FD\u79FB\u52A8",
    shortLabel: "\u79FB\u52A8",
    icon: "mdi:cellphone",
    bgColor: "bg-green-50 dark:bg-green-900/15",
    textColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800/30",
    chipColor: "text-green-600 bg-green-500/10",
    dotColor: "bg-green-500"
  },
  unicom: {
    key: "unicom",
    label: "\u4E2D\u56FD\u8054\u901A",
    shortLabel: "\u8054\u901A",
    icon: "mdi:transmission-tower",
    bgColor: "bg-orange-50 dark:bg-orange-900/15",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800/30",
    chipColor: "text-orange-500 bg-orange-500/10",
    dotColor: "bg-orange-500"
  },
  telecom: {
    key: "telecom",
    label: "\u4E2D\u56FD\u7535\u4FE1",
    shortLabel: "\u7535\u4FE1",
    icon: "mdi:satellite-variant",
    bgColor: "bg-blue-50 dark:bg-blue-900/15",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800/30",
    chipColor: "text-blue-500 bg-blue-500/10",
    dotColor: "bg-blue-500"
  },
  broadcast: {
    key: "broadcast",
    label: "\u4E2D\u56FD\u5E7F\u7535",
    shortLabel: "\u5E7F\u7535",
    icon: "mdi:broadcast",
    bgColor: "bg-purple-50 dark:bg-purple-900/15",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800/30",
    chipColor: "text-purple-500 bg-purple-500/10",
    dotColor: "bg-purple-500"
  },
  unknown: {
    key: "unknown",
    label: "\u5176\u4ED6",
    shortLabel: "\u5176\u4ED6",
    icon: "mdi:help-circle-outline",
    bgColor: "bg-gray-50 dark:bg-gray-900/15",
    textColor: "text-gray-600 dark:text-gray-400",
    borderColor: "border-gray-200 dark:border-gray-800/30",
    chipColor: "text-gray-500 bg-gray-500/10",
    dotColor: "bg-gray-400"
  }
};
var OPERATOR_KEYWORDS = [
  { key: "broadcast", words: ["\u5E7F\u7535", "\u5E7F\u64AD\u7535\u89C6"] },
  { key: "mobile", words: ["\u79FB\u52A8"] },
  { key: "unicom", words: ["\u8054\u901A"] },
  { key: "telecom", words: ["\u7535\u4FE1"] }
];
var OPERATOR_LABEL = Object.fromEntries(
  Object.keys(OPERATOR_META).map((key) => [key, OPERATOR_META[key].label])
);
var OPERATOR_SHORT_LABEL = Object.fromEntries(
  Object.keys(OPERATOR_META).map((key) => [key, OPERATOR_META[key].shortLabel])
);
function detectOperator(text) {
  const normalized = (text || "").toLowerCase();
  if (!normalized) return "unknown";
  for (const { key, words } of OPERATOR_KEYWORDS) {
    if (words.some((word) => normalized.includes(word))) return key;
  }
  return "unknown";
}

// src/client/panels/Source.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var OPERATOR_KEYS = ["mobile", "unicom", "telecom", "broadcast", "unknown"];
var LEVEL_TEXT = {
  pass: "compliance.pass",
  warn: "compliance.warn",
  block: "compliance.block"
};
function SourcePanel({ state, actions, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ds-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { className: "ds-card-title", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("section.source") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ds-hint", children: t("hint.source") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "textarea",
      {
        className: "ds-textarea",
        value: state.raw,
        spellCheck: false,
        placeholder: "\u3010\u5B9E\u4F53\u5361\u3011\u91CD\u5E86\u8054\u901A49\u5143200G\n\n\u4EA7\u54C1\u5957\u9910\uFF1A49\u5143200G\n\u2026",
        onChange: (event) => actions.setRaw(event.target.value)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-row", style: { marginTop: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ds-btn ds-btn-primary", onClick: actions.parse, children: t("btn.parse") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ds-btn", onClick: actions.fillSample, children: t("btn.sample") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: "ds-btn ds-btn-ghost",
          onClick: () => actions.setRaw(""),
          disabled: state.raw === "",
          children: t("btn.clear")
        }
      )
    ] })
  ] });
}
function SpecPanel({ state, actions, t }) {
  const spec = state.spec;
  if (spec === null) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ds-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "ds-card-title", children: t("section.spec") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ds-empty", children: t("status.empty") })
    ] });
  }
  const missing = new Set(state.parsed?.missing ?? []);
  const numberField = (key, label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-field", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: `ds-${key}`, children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        id: `ds-${key}`,
        className: "ds-input",
        type: "number",
        min: 0,
        value: String(spec[key]),
        onChange: (event) => {
          const next = Number(event.target.value);
          actions.patchSpec(key, Number.isFinite(next) && next >= 0 ? Math.floor(next) : 0);
        }
      }
    )
  ] }, key);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ds-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { className: "ds-card-title", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("section.spec") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ds-hint", children: [
        Math.round(spec.confidence * 100),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-grid", children: [
      numberField("monthlyFee", t("field.monthlyFee")),
      numberField("flowGb", t("field.flowGb")),
      numberField("voiceMinutes", t("field.voiceMinutes")),
      numberField("firstCharge", t("field.firstCharge")),
      numberField("contractMonths", t("field.contractMonths")),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: "ds-operator", children: t("field.operator") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "select",
          {
            id: "ds-operator",
            className: "ds-select",
            value: spec.operator,
            onChange: (event) => actions.patchSpec("operator", event.target.value),
            children: OPERATOR_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: key, children: OPERATOR_LABEL[key] }, key))
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: "ds-ship", children: t("field.shipRegion") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            id: "ds-ship",
            className: "ds-input",
            value: spec.shipRegion,
            onChange: (event) => actions.patchSpec("shipRegion", event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: "ds-age", children: t("field.ageRange") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            id: "ds-age",
            className: "ds-input",
            value: spec.ageRange,
            onChange: (event) => actions.patchSpec("ageRange", event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: "ds-activate", children: t("field.activateType") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            id: "ds-activate",
            className: "ds-input",
            value: spec.activateType,
            onChange: (event) => actions.patchSpec("activateType", event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: "ds-express", children: t("field.expressType") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            id: "ds-express",
            className: "ds-input",
            value: spec.expressType,
            onChange: (event) => actions.patchSpec("expressType", event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: "ds-duration", children: t("field.duration") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            id: "ds-duration",
            className: "ds-input",
            value: spec.duration,
            onChange: (event) => actions.patchSpec("duration", event.target.value)
          }
        )
      ] })
    ] }),
    spec.perks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-row", style: { marginTop: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ds-hint", children: t("field.perks") }),
      spec.perks.map((perk) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ds-chip", children: perk }, perk))
    ] }) : null,
    missing.size > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-row", style: { marginTop: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ds-hint", children: t("status.missing") }),
      [...missing].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ds-chip", children: item }, item))
    ] }) : null
  ] });
}
function CompliancePanel({ state, t }) {
  const report = state.compliance;
  if (report === null) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ds-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "ds-card-title", children: t("section.compliance") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ds-empty", children: t("compliance.empty") })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ds-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { className: "ds-card-title", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("section.compliance") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `ds-level-${report.level}`, style: { fontSize: 12 }, children: t(LEVEL_TEXT[report.level] ?? "compliance.pass") })
    ] }),
    report.issues.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ds-empty", style: { padding: "12px 4px" }, children: t("compliance.pass") }) : report.issues.map((issue, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ds-issue", "data-level": issue.level, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { className: `ds-level-${issue.level}`, children: issue.rule }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
        "\u547D\u4E2D ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: issue.matched })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: issue.reason }),
      issue.suggestion ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
        "\u5EFA\u8BAE\uFF1A",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: issue.suggestion })
      ] }) : null
    ] }, `${issue.id}-${index}`))
  ] });
}

// src/lib/studio/platforms.ts
var PLATFORMS = [
  {
    id: "xiaohongshu",
    label: "\u5C0F\u7EA2\u4E66",
    icon: "mdi:book-heart-outline",
    hint: "\u5C01\u9762\u51B3\u5B9A\u70B9\u51FB\uFF0C\u6B63\u6587\u51B3\u5B9A\u8F6C\u5316\uFF0C\u5FCC\u786C\u5E7F",
    lengthHint: "300-600\u5B57",
    tones: ["seed", "direct", "story", "value", "qa"]
  },
  {
    id: "douyin",
    label: "\u6296\u97F3",
    icon: "mdi:music-note-outline",
    hint: "\u53E3\u64AD 15-30 \u79D2\uFF0C\u524D 3 \u79D2\u5B9A\u751F\u6B7B",
    lengthHint: "15-30\u79D2\u53E3\u64AD\uFF08\u7EA6150-250\u5B57\uFF09",
    tones: ["seed", "direct", "story", "value", "qa"]
  },
  {
    id: "kuaishou",
    label: "\u5FEB\u624B",
    icon: "mdi:video-outline",
    hint: "\u8001\u94C1\u6587\u5316\uFF0C\u771F\u5B9E\u611F\u5F3A\uFF0C\u5FCC\u7AEF\u7740",
    lengthHint: "80-200\u5B57",
    tones: ["seed", "direct", "story", "value"]
  },
  {
    id: "moments",
    label: "\u670B\u53CB\u5708",
    icon: "mdi:account-multiple-outline",
    hint: "\u719F\u4EBA\u573A\u666F\uFF0C\u8D8A\u50CF\u5E7F\u544A\u8D8A\u6CA1\u4EBA\u770B",
    lengthHint: "60-150\u5B57",
    tones: ["seed", "direct", "story", "value"]
  },
  {
    id: "channels",
    label: "\u89C6\u9891\u53F7",
    icon: "mdi:play-box-outline",
    hint: "\u4E2D\u8001\u5E74\u7528\u6237\u591A\uFF0C\u8BB2\u6E05\u695A\u6BD4\u8BB2\u597D\u542C\u91CD\u8981",
    lengthHint: "60-90\u79D2\u53E3\u64AD\uFF08\u7EA6250-400\u5B57\uFF09",
    tones: ["direct", "story", "value", "qa"]
  },
  {
    id: "weibo",
    label: "\u5FAE\u535A",
    icon: "mdi:sina-weibo",
    hint: "\u77ED\u5E73\u5FEB + \u8BDD\u9898\u8BCD\uFF0C\u8D85\u8FC7\u4E09\u6BB5\u5C31\u6CA1\u4EBA\u770B\u5B8C",
    lengthHint: "80-200\u5B57",
    tones: ["direct", "value", "qa"]
  },
  {
    id: "bilibili",
    label: "B\u7AD9",
    icon: "mdi:television-play",
    hint: "\u5F39\u5E55\u6587\u5316\uFF0C\u53EF\u957F\u6587\u79D1\u666E\uFF0C\u53C2\u6570\u8D8A\u7EC6\u8D8A\u53EF\u4FE1",
    lengthHint: "800-1500\u5B57",
    tones: ["direct", "value", "qa", "story"]
  },
  {
    id: "group",
    label: "\u7FA4\u804A",
    icon: "mdi:chat-outline",
    hint: "\u4FE1\u606F\u5BC6\u5EA6\u4F18\u5148\uFF0C\u76F4\u63A5\u7ED9\u53C2\u6570",
    lengthHint: "80-200\u5B57",
    tones: ["direct", "value", "qa"]
  }
];
var TONES = [
  {
    id: "seed",
    label: "\u79CD\u8349",
    hint: "\u4EE5\u771F\u5B9E\u4F7F\u7528\u4F53\u9A8C\u5207\u5165\uFF0C\u5148\u8BB2\u573A\u666F\u518D\u8BB2\u53C2\u6570\uFF0C\u9002\u5408\u6CDB\u6D41\u91CF"
  },
  {
    id: "direct",
    label: "\u76F4\u63A8",
    hint: "\u5F00\u95E8\u89C1\u5C71\u6446\u53C2\u6570\uFF0C\u9002\u5408\u5DF2\u6709\u660E\u786E\u9700\u6C42\u7684\u7528\u6237"
  },
  {
    id: "story",
    label: "\u6545\u4E8B",
    hint: "\u7528\u4E00\u4E2A\u5177\u4F53\u7ECF\u5386\u5E26\u51FA\u5957\u9910\uFF0C\u522B\u7F16\u7EC6\u8282\uFF0C\u7F16\u4E86\u4F1A\u88AB\u8BC4\u8BBA\u533A\u62C6\u7A7F"
  },
  {
    id: "value",
    label: "\u6027\u4EF7\u6BD4",
    hint: "\u505A\u5BF9\u6BD4\u3001\u7B97\u8D26\uFF0C\u7528\u771F\u5B9E\u6570\u5B57\u8BF4\u8BDD\uFF0C\u522B\u7528\u6781\u9650\u8BCD"
  },
  {
    id: "qa",
    label: "\u7B54\u7591",
    hint: "\u7528\u95EE\u7B54\u6D88\u9664\u987E\u8651\uFF0C\u9002\u5408\u627F\u63A5\u8BC4\u8BBA\u533A\u548C\u79C1\u4FE1\u6D41\u91CF"
  }
];
var PLATFORM_MAP = Object.fromEntries(
  PLATFORMS.map((platform) => [platform.id, platform])
);
var TONE_MAP = Object.fromEntries(
  TONES.map((tone) => [tone.id, tone])
);
function getPlatform(id) {
  return PLATFORM_MAP[id] ?? PLATFORMS[0];
}
function getTone(id) {
  return TONE_MAP[id] ?? TONES[0];
}

// src/client/panels/Copy.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function CopySettings({ state, actions, t }) {
  const platform = getPlatform(state.platform);
  const available = TONES.filter((tone) => platform.tones.includes(tone.id));
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "ds-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("h2", { className: "ds-card-title", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("section.copy") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "ds-hint", children: [
        platform.lengthHint,
        " \xB7 ",
        platform.hint
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { marginBottom: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "ds-hint", style: { marginBottom: 6 }, children: t("label.platform") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "ds-pills", children: PLATFORMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          type: "button",
          className: "ds-pill",
          "data-active": item.id === state.platform,
          onClick: () => actions.setPlatform(item.id),
          children: item.label
        },
        item.id
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { marginBottom: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "ds-hint", style: { marginBottom: 6 }, children: t("label.tone") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "ds-pills", children: available.map((item) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          type: "button",
          className: "ds-pill",
          "data-active": item.id === state.tone,
          title: item.hint,
          onClick: () => actions.setTone(item.id),
          children: item.label
        },
        item.id
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ds-grid", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ds-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { htmlFor: "ds-count", children: t("label.count") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "select",
          {
            id: "ds-count",
            className: "ds-select",
            value: String(state.count),
            onChange: (event) => actions.setCount(Number(event.target.value)),
            children: [1, 2, 3, 4, 5].map((value) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value, children: value }, value))
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ds-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { htmlFor: "ds-brand", children: t("label.brand") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            id: "ds-brand",
            className: "ds-input",
            value: state.brand,
            onChange: (event) => actions.setBrand(event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ds-field ds-field-wide", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { htmlFor: "ds-link", children: [
          t("label.link"),
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "ds-hint", children: [
            "\xB7 ",
            t("hint.link")
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            id: "ds-link",
            className: "ds-input",
            value: state.link,
            placeholder: "https://\u2026",
            onChange: (event) => actions.setLink(event.target.value)
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "ds-row", style: { marginTop: 10 }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "button",
      {
        type: "button",
        className: "ds-btn ds-btn-primary",
        onClick: actions.generate,
        disabled: state.spec === null,
        children: t("btn.generate")
      }
    ) })
  ] });
}
function CopyResults({ state, actions, t }) {
  if (state.variants.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "ds-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "ds-card-title", children: t("section.result") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "ds-empty", children: state.spec === null ? t("status.empty") : t("btn.generate") })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "ds-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("h2", { className: "ds-card-title", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("section.result") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ds-hint", children: state.variants.length })
    ] }),
    state.variants.map((variant, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("article", { className: "ds-variant", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("header", { className: "ds-variant-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "ds-chip", children: [
          index + 1,
          " \xB7 ",
          getPlatform(variant.platform).label,
          " \xB7 ",
          getTone(variant.tone).label
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "ds-row", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              type: "button",
              className: "ds-btn",
              onClick: () => actions.copy(variant.full, t("btn.copyAll")),
              children: t("btn.copyAll")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              type: "button",
              className: "ds-btn ds-btn-ghost",
              onClick: () => actions.copy(variant.tags.join(" "), t("note.tags")),
              children: t("btn.copyTags")
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "ds-variant-body", children: variant.full }),
      variant.notes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ds-notes", children: [
        t("note.publish"),
        "\uFF1A",
        variant.notes.join("\uFF1B")
      ] }) : null
    ] }, variant.id))
  ] });
}

// src/lib/studio/sizes.ts
var FALLBACK_SIZE_ID = "9:16";
var POSTER_SIZES = [
  {
    id: "9:16",
    label: "9:16 \u7AD6\u7248",
    width: 540,
    height: 960,
    usage: "\u5C0F\u7EA2\u4E66/\u6296\u97F3/\u5FEB\u624B\u4E3B\u56FE\u3001\u670B\u53CB\u5708\u957F\u56FE"
  },
  {
    id: "16:9",
    label: "16:9 \u6A2A\u7248",
    width: 960,
    height: 540,
    usage: "\u89C6\u9891\u5C01\u9762\u3001\u516C\u4F17\u53F7\u5934\u56FE\u3001B\u7AD9\u5C01\u9762"
  },
  {
    id: "1:1",
    label: "1:1 \u65B9\u56FE",
    width: 640,
    height: 640,
    usage: "\u670B\u53CB\u5708\u4E5D\u5BAB\u683C\u3001\u5546\u54C1\u4E3B\u56FE"
  },
  {
    id: "4:3",
    label: "4:3 \u6A2A\u56FE",
    width: 800,
    height: 600,
    usage: "\u8D44\u8BAF\u914D\u56FE\u3001\u5FAE\u535A\u914D\u56FE"
  },
  {
    id: "3:4",
    label: "3:4 \u7AD6\u56FE",
    width: 600,
    height: 800,
    usage: "\u5C0F\u7EA2\u4E66\u6B21\u56FE\u3001\u95F2\u9C7C/\u8F6C\u8F6C\u5546\u54C1\u56FE"
  }
];
function getPosterSize(id) {
  const matched = POSTER_SIZES.find((size) => size.id === id);
  if (matched) return matched;
  const fallback = POSTER_SIZES.find((size) => size.id === FALLBACK_SIZE_ID);
  return fallback ?? POSTER_SIZES[0];
}

// src/lib/studio/themes.ts
var FALLBACK_THEME_ID = "brand";
var POSTER_THEMES = [
  {
    id: "brand",
    label: "\u5B98\u65B9\u84DD",
    bg: "#0052D9",
    bgAlt: "#3758F9",
    fg: "#FFFFFF",
    // 蓝色底上的次要文字不能直接用半透明白：会掉到 3:1 以下，这里给一个够亮的蓝白
    fgMuted: "#EAF1FF",
    accent: "#FFD24A",
    accentFg: "#111928",
    // 比 bg 略深一档，面板/胶囊压在渐变上仍能分出层次
    card: "#0B4CC4",
    line: "#6E9BFF"
  },
  {
    id: "ink",
    label: "\u58A8\u9ED1\u8D28\u611F",
    bg: "#111928",
    bgAlt: "#1F2A37",
    fg: "#FFFFFF",
    fgMuted: "#A9B4C4",
    accent: "#FF6B6B",
    accentFg: "#111928",
    card: "#1B2634",
    line: "#3B4A60"
  },
  {
    id: "sunset",
    label: "\u6696\u9633\u6A59",
    bg: "#FFF4E6",
    bgAlt: "#FFE0B2",
    // 深字浅底：浅底主题的 fg 必须是深色，否则整张图在手机上会「发白看不清」
    fg: "#1F2329",
    fgMuted: "#5A5248",
    accent: "#FF6B35",
    accentFg: "#1F2329",
    card: "#FFFFFF",
    line: "#E8CBA8"
  },
  {
    id: "mint",
    label: "\u8584\u8377\u7EFF",
    bg: "#E8FFF5",
    bgAlt: "#C8F7E4",
    fg: "#10301F",
    fgMuted: "#3F6B57",
    accent: "#00B578",
    accentFg: "#10301F",
    card: "#FFFFFF",
    line: "#A8DFC9"
  },
  {
    id: "violet",
    label: "\u9713\u8679\u7D2B",
    bg: "#1B1035",
    bgAlt: "#2E1B5C",
    fg: "#FFFFFF",
    fgMuted: "#C9BCEB",
    accent: "#A78BFA",
    accentFg: "#111928",
    card: "#241545",
    line: "#4A3180"
  }
];
function getPosterTheme(id) {
  const matched = POSTER_THEMES.find((theme) => theme.id === id);
  if (matched) return matched;
  const fallback = POSTER_THEMES.find((theme) => theme.id === FALLBACK_THEME_ID);
  return fallback ?? POSTER_THEMES[0];
}

// src/client/panels/Poster.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function PosterSettings({ state, actions, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "ds-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("h2", { className: "ds-card-title", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: t("section.poster") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "ds-hint", children: state.posterMeta ? `${state.posterMeta.width}\xD7${state.posterMeta.height}` : "" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { marginBottom: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "ds-hint", style: { marginBottom: 6 }, children: t("label.size") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "ds-pills", children: POSTER_SIZES.map((size) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          className: "ds-pill",
          "data-active": size.id === state.size,
          title: `${size.width}\xD7${size.height} \xB7 ${size.usage}`,
          onClick: () => actions.setSize(size.id),
          children: size.id
        },
        size.id
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { marginBottom: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "ds-hint", style: { marginBottom: 6 }, children: t("label.theme") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "ds-pills", children: POSTER_THEMES.map((theme) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          className: "ds-pill",
          "data-active": theme.id === state.theme,
          onClick: () => actions.setTheme(theme.id),
          children: theme.label
        },
        theme.id
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "ds-grid", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "ds-field ds-field-wide", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { htmlFor: "ds-headline", children: t("label.headline") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            id: "ds-headline",
            className: "ds-input",
            value: state.headline,
            onChange: (event) => actions.setHeadline(event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "ds-field ds-field-wide", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { htmlFor: "ds-subline", children: t("label.subline") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            id: "ds-subline",
            className: "ds-input",
            value: state.subline,
            onChange: (event) => actions.setSubline(event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "ds-field ds-field-wide", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { htmlFor: "ds-chips", children: [
          t("label.chips"),
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "ds-hint", children: [
            "\xB7 ",
            t("hint.chips")
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            id: "ds-chips",
            className: "ds-input",
            value: state.chipsText,
            onChange: (event) => actions.setChipsText(event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "ds-field ds-field-wide", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { htmlFor: "ds-footer", children: t("label.footer") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            id: "ds-footer",
            className: "ds-input",
            value: state.footer,
            onChange: (event) => actions.setFooter(event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "ds-field ds-field-wide", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { htmlFor: "ds-qr", children: [
          t("label.qr"),
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "ds-hint", children: [
            "\xB7 ",
            t("hint.qr")
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            id: "ds-qr",
            className: "ds-input",
            value: state.qrUrl,
            placeholder: "https://\u2026",
            onChange: (event) => actions.setQrUrl(event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "ds-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { htmlFor: "ds-scale", children: t("label.scale") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "select",
          {
            id: "ds-scale",
            className: "ds-select",
            value: String(state.scale),
            onChange: (event) => actions.setScale(Number(event.target.value)),
            children: [1, 2, 3].map((value) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("option", { value, children: [
              value,
              "x"
            ] }, value))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "ds-row", style: { marginTop: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          className: "ds-btn ds-btn-primary",
          onClick: actions.render,
          disabled: state.spec === null || state.rendering,
          children: state.rendering ? t("status.rendering") : t("btn.render")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          className: "ds-btn",
          onClick: actions.download,
          disabled: state.posterUrl === null,
          children: t("btn.download")
        }
      )
    ] })
  ] });
}
function PosterPreview({ state, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "ds-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("h2", { className: "ds-card-title", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: t("section.preview") }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "ds-hint", children: state.posterMeta?.filename ?? "" })
    ] }),
    state.posterUrl === null ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "ds-empty", children: state.rendering ? t("status.rendering") : t("status.noPoster") }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "ds-preview", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("img", { src: state.posterUrl, alt: t("section.preview") }) })
  ] });
}

// src/client/useStudio.ts
var import_react = require("react");

// src/utils/parse.ts
var ZH_NUM = {
  \u4E00: "1",
  \u4E8C: "2",
  \u4E24: "2",
  \u4E09: "3",
  \u56DB: "4",
  \u4E94: "5",
  \u516D: "6",
  \u4E03: "7",
  \u516B: "8",
  \u4E5D: "9",
  \u5341: "10"
};
function normalizeDuration(raw) {
  const text = (raw || "").trim();
  if (!text) return "\u672A\u77E5";
  if (/长期|20年|永久/.test(text)) return "\u957F\u671F";
  const numYear = text.match(/(\d+)年/);
  if (numYear) return `${numYear[1]}\u5E74`;
  const zhYear = text.match(/([一两二三四五六七八九十]+)年/);
  if (zhYear) return `${ZH_NUM[zhYear[1]] || zhYear[1]}\u5E74`;
  const numMonth = text.match(/(\d+)个月/);
  if (numMonth) return `${numMonth[1]}\u4E2A\u6708`;
  if (/以套餐为准|套餐为准|未说明/.test(text)) return "\u672A\u77E5";
  return text;
}

// src/lib/studio/parse.ts
var SECTION_LABELS = [
  "\u4EA7\u54C1\u5957\u9910",
  "\u5957\u9910\u5185\u5BB9",
  "\u5957\u9910\u8BE6\u60C5",
  "\u5957\u9910\u8D44\u8D39",
  "\u8D44\u8D39\u8BF4\u660E",
  "\u4F18\u60E0\u8BE6\u60C5",
  "\u4F18\u60E0\u671F",
  "\u6709\u6548\u671F",
  "\u5957\u9910\u6709\u6548\u671F",
  "\u5FEB\u9012\u65B9\u5F0F",
  "\u6FC0\u6D3B\u65B9\u5F0F",
  "\u6FC0\u6D3B\u6D41\u7A0B\u56FE",
  "\u5145\u503C\u94FE\u63A5",
  "\u529E\u5361\u5E74\u9F84",
  "\u5E74\u9F84\u9650\u5236",
  "\u5408\u7EA6\u671F",
  "\u5408\u7EA6\u671F\u9650",
  "\u4E0D\u53D1\u8D27\u5730\u533A",
  "\u53D1\u8D27\u5730\u533A",
  "\u53EF\u53D1\u5730\u533A",
  "\u5F52\u5C5E\u5730",
  "\u5B9A\u5411\u8303\u56F4",
  "\u5B9A\u5411\u6D41\u91CF",
  "\u901A\u7528\u6D41\u91CF",
  "\u6E29\u99A8\u63D0\u793A",
  "\u6CE8\u610F\u4E8B\u9879",
  "\u590D\u673A\u53CA\u6CE8\u9500\u65B9\u5F0F",
  "\u9996\u6708\u653F\u7B56",
  "\u529E\u7406\u65B9\u5F0F",
  "\u9009\u53F7\u65B9\u5F0F",
  "\u5957\u9910\u5916\u8D44\u8D39"
].sort((a, b) => b.length - a.length);
var TIMESTAMP_LINE_PATTERN = /^\S{0,12}?\d{4}\s*[/-]\s*\d{1,2}\s*[/-]\s*\d{1,2}\s+\d{1,2}:\d{2}/;
function parseLabelLine(line) {
  const colonMatch = line.match(/^([^：:]{2,12})[：:]\s*(.*)$/);
  if (colonMatch) {
    const label = colonMatch[1].trim();
    if (SECTION_LABELS.includes(label)) return { label, inline: colonMatch[2].trim() };
  }
  const bare = line.replace(/[：:]\s*$/, "").trim();
  if (SECTION_LABELS.includes(bare)) return { label: bare, inline: "" };
  const spaced = line.match(/^(\S{2,12})\s+(\S.*)$/);
  if (spaced && SECTION_LABELS.includes(spaced[1])) {
    return { label: spaced[1], inline: spaced[2].trim() };
  }
  return null;
}
function splitSections(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const titleIndex = lines.findIndex((line) => line !== "");
  const titleLine = titleIndex >= 0 ? lines[titleIndex] : "";
  const consumed = /* @__PURE__ */ new Set();
  if (titleIndex >= 0) consumed.add(titleIndex);
  const marks = [];
  lines.forEach((line, index) => {
    if (!line || consumed.has(index)) return;
    if (TIMESTAMP_LINE_PATTERN.test(line)) {
      consumed.add(index);
      return;
    }
    const parsed = parseLabelLine(line);
    if (parsed) marks.push({ index, label: parsed.label, inline: parsed.inline });
  });
  const sections = [];
  marks.forEach((mark, order) => {
    consumed.add(mark.index);
    const next = marks[order + 1];
    const end = next ? next.index : lines.length;
    const block = [];
    if (mark.inline) block.push(mark.inline);
    for (let i = mark.index + 1; i < end; i += 1) {
      const line = lines[i];
      if (!line) continue;
      consumed.add(i);
      if (TIMESTAMP_LINE_PATTERN.test(line)) continue;
      block.push(line);
    }
    sections.push({ label: mark.label, value: block.join("\n").trim() });
  });
  const leftovers = [];
  lines.forEach((line, index) => {
    if (!line || consumed.has(index)) return;
    leftovers.push(line);
  });
  return { titleLine, sections, leftovers };
}
function findSection(sections, labels) {
  for (const label of labels) {
    const hit = sections.find((section) => section.label === label);
    if (hit && hit.value) return hit.value;
  }
  return "";
}
var MONTHLY_FEE_PATTERNS = [
  /(\d+(?:\.\d+)?)\s*元\s*月租/,
  /月租\s*(?:是|为|仅|只要|只需)?\s*(\d+(?:\.\d+)?)\s*元/,
  /每月\s*(\d+(?:\.\d+)?)\s*元/,
  /月费\s*(?:是|为|仅|只要|只需)?\s*(\d+(?:\.\d+)?)\s*元/,
  /(\d+(?:\.\d+)?)\s*元\s*\/\s*月/,
  /(\d+(?:\.\d+)?)\s*元\s*包月/
];
function isPlausibleFee(value) {
  return Number.isFinite(value) && value >= 1 && value <= 999;
}
function feeFromTitle(titleLine) {
  const feeHit = titleLine.match(/(\d+(?:\.\d+)?)\s*元/);
  const flowHit = titleLine.match(/(\d+(?:\.\d+)?)\s*(?:GB|G)(?![A-Za-z])/i);
  if (!feeHit || !flowHit) return 0;
  const value = Number(feeHit[1]);
  return isPlausibleFee(value) ? value : 0;
}
function pickMonthlyFee(text, sections, titleLine) {
  for (const pattern of MONTHLY_FEE_PATTERNS) {
    const hit = text.match(pattern);
    const value = hit ? Number(hit[1]) : 0;
    if (isPlausibleFee(value)) return value;
  }
  const fromTitle = feeFromTitle(titleLine);
  if (fromTitle > 0) return fromTitle;
  const plan = findSection(sections, ["\u4EA7\u54C1\u5957\u9910", "\u5957\u9910\u5185\u5BB9", "\u5957\u9910\u8BE6\u60C5", "\u5957\u9910\u8D44\u8D39"]);
  if (plan) {
    const hit = plan.match(/(\d+(?:\.\d+)?)\s*元/);
    const value = hit ? Number(hit[1]) : 0;
    if (isPlausibleFee(value)) return value;
  }
  return 0;
}
var FLOW_TOKEN_PATTERN = /(\d+(?:\.\d+)?)\s*(?:GB|G)(?![A-Za-z])/gi;
function pickFlow(text) {
  let general = 0;
  let directional = 0;
  let neutral = 0;
  for (const match of text.matchAll(FLOW_TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    const before = text.slice(Math.max(0, index - 12), index);
    if (/元\s*\/\s*$/.test(before)) continue;
    const after = text.slice(index + match[0].length, index + match[0].length + 10);
    if (/^\s*(?:流量卡|网络|全网通|手机|套餐|信号)/.test(after)) continue;
    const value = Number(match[1]);
    if (!Number.isFinite(value) || value <= 0) continue;
    if (/^\s*(?:定向|专属)/.test(after)) {
      directional = Math.max(directional, value);
    } else if (/^\s*(?:全国)?通用|^\s*全国/.test(after)) {
      general = Math.max(general, value);
    } else {
      neutral = Math.max(neutral, value);
    }
  }
  return { general: general || neutral, directional };
}
function pickVoiceMinutes(text) {
  for (const match of text.matchAll(/(\d{1,6})\s*分钟/g)) {
    const index = match.index ?? 0;
    const before = text.slice(Math.max(0, index - 10), index);
    if (/元\s*\/\s*$/.test(before)) continue;
    const value = Number(match[1]);
    if (value > 0 && value <= 1e5) return value;
  }
  return 0;
}
var FIRST_CHARGE_PATTERNS = [
  /首充\s*(\d+(?:\.\d+)?)\s*元/,
  /(\d+(?:\.\d+)?)\s*元\s*首充/,
  /首充\s*(\d+(?:\.\d+)?)/,
  /(?:激活|务必|需|须)?充值\s*(\d+(?:\.\d+)?)\s*元/,
  /充值\s*(\d+(?:\.\d+)?)/
];
function pickFirstCharge(text) {
  for (const pattern of FIRST_CHARGE_PATTERNS) {
    const hit = text.match(pattern);
    const value = hit ? Number(hit[1]) : 0;
    if (Number.isFinite(value) && value >= 1 && value <= 1e4) return value;
  }
  return 0;
}
var FIRST_MONTH_PATTERN = /首月\s*(按天折算|按天计费|按天扣费|免月租|免费使用|半价|照常计费|全月全价|按自然月)/;
function pickFirstMonth(text) {
  const hit = text.match(FIRST_MONTH_PATTERN);
  return hit ? hit[1] : "";
}
function pickContract(text, sections) {
  const section = findSection(sections, ["\u5408\u7EA6\u671F", "\u5408\u7EA6\u671F\u9650"]);
  const raw = section.split("\n")[0].trim();
  if (raw) {
    if (/无合约|不限制|无限制|没有合约|不设合约|无锁定期/.test(raw)) {
      return { months: 0, text: "\u65E0\u5408\u7EA6" };
    }
    const yearHit = raw.match(/(\d+)\s*年/);
    if (yearHit) return { months: Number(yearHit[1]) * 12, text: `${yearHit[1]}\u5E74` };
    const monthHit = raw.match(/(\d+)\s*(?:个)?月/);
    if (monthHit) return { months: Number(monthHit[1]), text: `${monthHit[1]}\u4E2A\u6708` };
    return { months: 0, text: raw };
  }
  const fallback = text.match(/合约期[^\d\n]{0,8}(\d+)\s*(?:个)?月/);
  if (fallback) return { months: Number(fallback[1]), text: `${fallback[1]}\u4E2A\u6708` };
  return { months: 0, text: "" };
}
function pickDuration(text, sections) {
  const section = findSection(sections, ["\u4F18\u60E0\u671F", "\u6709\u6548\u671F", "\u5957\u9910\u6709\u6548\u671F"]);
  if (section) return normalizeDuration(section.split("\n")[0]);
  const free = text.match(/(?:优惠期|有效期|套餐期)[：:]?\s*([^\n，。；;]{1,24})/);
  if (free) return normalizeDuration(free[1]);
  return normalizeDuration("");
}
var AGE_PATTERN = /(\d{1,2})\s*[-—~～至到]\s*(\d{1,2})\s*(?:周)?岁/;
function pickAgeRange(text, sections) {
  const section = findSection(sections, ["\u529E\u5361\u5E74\u9F84", "\u5E74\u9F84\u9650\u5236"]);
  const hit = (section || text).match(AGE_PATTERN);
  if (hit) return `${hit[1]}-${hit[2]}\u5468\u5C81`;
  if (section) {
    const single = section.match(/(\d{1,2})\s*(?:周)?岁/);
    if (single) return section.split("\n")[0].trim();
  }
  return "";
}
function pickShipRegion(text, sections) {
  const section = findSection(sections, ["\u4E0D\u53D1\u8D27\u5730\u533A", "\u53D1\u8D27\u5730\u533A", "\u53EF\u53D1\u5730\u533A"]);
  if (section) return section.split("\n")[0].trim();
  const free = text.match(/(?:仅发|只发|限发|仅限)([^\n，。；;、]{1,12})/);
  return free ? `${free[0].trim()}`.split("\n")[0] : "";
}
var PERK_PATTERN = /(?:(\d+(?:\.\d+)?)\s*元)?\s*(云盘包|视频会员|音乐会员|来电显示|来显|宽带)/g;
function pickPerks(text) {
  const perks = [];
  for (const match of text.matchAll(PERK_PATTERN)) {
    const amount = match[1] ? `${match[1]}\u5143` : "";
    const rawName = match[2];
    const name = rawName === "\u6765\u663E" ? "\u6765\u7535\u663E\u793A" : rawName;
    if (perks.some((perk) => perk.includes(name))) continue;
    perks.push(`${amount}${name}`);
  }
  return perks.slice(0, 5);
}
var OUT_OF_PLAN_RULES = {
  voice: /(?:国内)?(?:语音|通话|拨打)[^0-9\n]{0,8}(\d+(?:\.\d+)?)\s*元\s*\/\s*分钟/,
  sms: /短信[^0-9\n]{0,8}(\d+(?:\.\d+)?)\s*元\s*\/\s*条/,
  data: /(?:国内)?(?:流量|上网)[^0-9\n]{0,8}(\d+(?:\.\d+)?)\s*元\s*\/\s*(?:GB|G|MB|M)/i
};
function pickOutOfPlan(text) {
  const voice = text.match(OUT_OF_PLAN_RULES.voice);
  const sms = text.match(OUT_OF_PLAN_RULES.sms);
  const data = text.match(OUT_OF_PLAN_RULES.data);
  return {
    voice: voice ? `${voice[1]}\u5143/\u5206\u949F` : "",
    sms: sms ? `${sms[1]}\u5143/\u6761` : "",
    data: data ? `${data[1]}\u5143/GB` : ""
  };
}
var FORM_BRACKET_PATTERN = /^[【[]\s*(?:实体卡|电子卡|虚拟卡|eSIM|esim|卡板|流量卡|正规卡|号卡|手机卡)\s*[】\]]/;
function pickName(titleLine) {
  let name = titleLine.trim();
  while (FORM_BRACKET_PATTERN.test(name)) {
    name = name.replace(FORM_BRACKET_PATTERN, "").trim();
  }
  return name || titleLine.trim();
}
function pickCardForm(rawTitle, text) {
  const head = rawTitle.slice(0, 40);
  if (/eSIM|esim|虚拟卡|电子卡|虚拟号/i.test(head)) return "esim";
  if (/实体卡|卡板/.test(head)) return "physical";
  if (/eSIM|esim|虚拟卡|电子卡/i.test(text)) return "esim";
  if (/实体卡|卡板/.test(text)) return "physical";
  return "unknown";
}
function pickOperator(rawTitle, text) {
  const fromTitle = detectOperator(rawTitle);
  return fromTitle === "unknown" ? detectOperator(text) : fromTitle;
}
var KEY_FIELDS = [
  "\u6708\u79DF",
  "\u901A\u7528\u6D41\u91CF",
  "\u8FD0\u8425\u5546",
  "\u901A\u8BDD\u5206\u949F",
  "\u9996\u5145",
  "\u5408\u7EA6\u671F",
  "\u529E\u5361\u5E74\u9F84",
  "\u53D1\u8D27\u5730\u533A",
  "\u6FC0\u6D3B\u65B9\u5F0F"
];
var TOTAL_TRACKED_FIELDS = 18;
var CRITICAL_FIELDS = ["\u6708\u79DF", "\u901A\u7528\u6D41\u91CF", "\u8FD0\u8425\u5546"];
function computeConfidence(matched) {
  const criticalHit = CRITICAL_FIELDS.filter((field) => matched.includes(field)).length;
  const breadth = Math.min(matched.length, TOTAL_TRACKED_FIELDS) / TOTAL_TRACKED_FIELDS;
  const score = criticalHit / CRITICAL_FIELDS.length * 0.7 + breadth * 0.3;
  return Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
}
function emptySpec() {
  return {
    rawTitle: "",
    name: "",
    operator: "unknown",
    cardForm: "unknown",
    monthlyFee: 0,
    firstCharge: 0,
    firstMonth: "",
    flowGb: 0,
    directionalGb: 0,
    voiceMinutes: 0,
    contractMonths: 0,
    contractText: "",
    duration: "\u672A\u77E5",
    ageRange: "",
    shipRegion: "",
    activateType: "",
    expressType: "",
    perks: [],
    outOfPlan: { voice: "", sms: "", data: "" },
    notices: [],
    leftovers: [],
    confidence: 0
  };
}
function parseProductText(text) {
  const source = String(text || "").replace(/\u3000/g, " ").trim();
  if (!source) {
    return { spec: emptySpec(), matched: [], missing: [...KEY_FIELDS] };
  }
  const { titleLine, sections, leftovers } = splitSections(source);
  const matched = [];
  const rawTitle = titleLine;
  const name = pickName(rawTitle);
  if (name) matched.push("\u5546\u54C1\u540D");
  const cardForm = pickCardForm(rawTitle, source);
  if (cardForm !== "unknown") matched.push("\u5361\u5F62\u6001");
  const operator = pickOperator(rawTitle, source);
  if (operator !== "unknown") matched.push("\u8FD0\u8425\u5546");
  const monthlyFee = pickMonthlyFee(source, sections, rawTitle);
  if (monthlyFee > 0) matched.push("\u6708\u79DF");
  const firstCharge = pickFirstCharge(source);
  if (firstCharge > 0) matched.push("\u9996\u5145");
  const firstMonth = pickFirstMonth(source);
  if (firstMonth) matched.push("\u9996\u6708\u653F\u7B56");
  const flow = pickFlow(source);
  if (flow.general > 0) matched.push("\u901A\u7528\u6D41\u91CF");
  if (flow.directional > 0) matched.push("\u5B9A\u5411\u6D41\u91CF");
  const voiceMinutes = pickVoiceMinutes(source);
  if (voiceMinutes > 0) matched.push("\u901A\u8BDD\u5206\u949F");
  const contract = pickContract(source, sections);
  if (contract.months > 0 || contract.text) matched.push("\u5408\u7EA6\u671F");
  const duration = pickDuration(source, sections);
  if (duration !== "\u672A\u77E5") matched.push("\u4F18\u60E0\u671F");
  const ageRange = pickAgeRange(source, sections);
  if (ageRange) matched.push("\u529E\u5361\u5E74\u9F84");
  const shipRegion = pickShipRegion(source, sections);
  if (shipRegion) matched.push("\u53D1\u8D27\u5730\u533A");
  const activateType = findSection(sections, ["\u6FC0\u6D3B\u65B9\u5F0F"]).split("\n")[0].trim();
  if (activateType) matched.push("\u6FC0\u6D3B\u65B9\u5F0F");
  const expressType = findSection(sections, ["\u5FEB\u9012\u65B9\u5F0F"]).split("\n")[0].trim();
  if (expressType) matched.push("\u5FEB\u9012\u65B9\u5F0F");
  const perks = pickPerks(source);
  if (perks.length > 0) matched.push("\u9644\u52A0\u6743\u76CA");
  const outOfPlan = pickOutOfPlan(source);
  if (outOfPlan.voice || outOfPlan.sms || outOfPlan.data) matched.push("\u5957\u9910\u5916\u8D44\u8D39");
  const notices = findSection(sections, ["\u6E29\u99A8\u63D0\u793A", "\u6CE8\u610F\u4E8B\u9879"]).split("\n").map((line) => line.trim()).filter((line) => line !== "");
  if (notices.length > 0) matched.push("\u6E29\u99A8\u63D0\u793A");
  const spec = {
    rawTitle,
    name,
    operator,
    cardForm,
    monthlyFee,
    firstCharge,
    firstMonth,
    flowGb: flow.general,
    directionalGb: flow.directional,
    voiceMinutes,
    contractMonths: contract.months,
    contractText: contract.text,
    duration,
    ageRange,
    shipRegion,
    activateType,
    expressType,
    perks,
    outOfPlan,
    notices,
    leftovers: leftovers.slice(0, 20),
    confidence: computeConfidence(matched)
  };
  const missing = KEY_FIELDS.filter((field) => !matched.includes(field));
  return { spec, matched, missing };
}

// src/lib/studio/compliance.ts
var LEVEL_WEIGHT = { pass: 0, warn: 1, block: 2 };
var COMPLIANCE_RULES = [
  // ===== block：直接违法 / 平台必罚 =====
  {
    id: "permanent-period",
    pattern: /(?:永久|终身|一辈子|长期有效|永久有效|永久套餐)/g,
    level: "block",
    rule: "\u8D44\u8D39\u671F\u9650\u4E0D\u5B9E",
    reason: "\u300C\u6C38\u4E45\u300D\u300C\u7EC8\u8EAB\u300D\u65E0\u6CD5\u88AB\u4EFB\u4F55\u8FD0\u8425\u5546\u5957\u9910\u8BC1\u5B9E\uFF0C\u5C5E\u4E8E\u865A\u5047\u5BA3\u4F20\uFF0C\u5E73\u53F0\u76F4\u63A5\u5224\u8FDD\u89C4\u3002",
    suggestion: "\u6309\u5408\u7EA6\u671F\u5982\u5B9E\u5199\uFF0C\u4F8B\u5982\u300C\u4F18\u60E0\u671F12\u4E2A\u6708\uFF0C\u5230\u671F\u540E\u6309\u8FD0\u8425\u5546\u516C\u793A\u8D44\u8D39\u6267\u884C\u300D\u3002",
    fixes: [
      ["\u957F\u671F\u6709\u6548", "\u957F\u671F\u53EF\u7528"],
      ["\u6C38\u4E45\u6709\u6548", "\u957F\u671F\u53EF\u7528"],
      ["\u6C38\u4E45\u5957\u9910", "\u957F\u671F\u5957\u9910"],
      ["\u6C38\u4E45", "\u957F\u671F"],
      ["\u7EC8\u8EAB", "\u957F\u671F"],
      ["\u4E00\u8F88\u5B50", "\u957F\u671F"]
    ]
  },
  {
    id: "low-price-packaging",
    pattern: /(?<![\d.])(?:0|1|8|9)(?:\.\d+)?\s*元(?!\s*\/\s*(?:分钟|条|GB|G|MB|M))|零月租|0月租/g,
    level: "block",
    rule: "\u4F4E\u4EF7\u5305\u88C5",
    reason: "\u4E0A\u6E38\u660E\u786E\u7981\u6B62\u628A\u5957\u9910\u5305\u88C5\u6210 9 \u5143 / 8 \u5143 / 0 \u5143\u7B49\u4F4E\u4EF7\uFF0C\u4E0E\u5B9E\u9645\u6708\u79DF\u4E0D\u7B26\u5373\u5C5E\u4EF7\u683C\u6B3A\u8BC8\u3002",
    suggestion: "\u53EA\u5199\u771F\u5B9E\u6708\u79DF\uFF08\u5982 49 \u5143/\u6708\uFF09\uFF0C\u9996\u5145\u91D1\u989D\u5355\u72EC\u8BF4\u660E\u3002"
  },
  {
    id: "unlimited-claim",
    pattern: /无限流量|不限量|无限量|随便用|用不完|无限用|流量无限/g,
    level: "block",
    rule: "\u7EDD\u5BF9\u5316\u6D41\u91CF\u627F\u8BFA",
    reason: "\u8FD0\u8425\u5546\u5957\u9910\u5747\u6709\u9650\u901F\u6216\u8FBE\u91CF\u89C4\u5219\uFF0C\u300C\u65E0\u9650\u300D\u300C\u7528\u4E0D\u5B8C\u300D\u5C5E\u65E0\u6CD5\u5C65\u884C\u7684\u7EDD\u5BF9\u5316\u627F\u8BFA\u3002",
    suggestion: "\u5199\u6E05\u771F\u5B9E\u989D\u5EA6\uFF0C\u4F8B\u5982\u300C\u6BCF\u6708 200G \u5168\u56FD\u901A\u7528\u6D41\u91CF\u300D\u3002"
  },
  {
    id: "origin-region",
    pattern: /归属地/g,
    level: "block",
    rule: "\u5BA3\u4F20\u5F52\u5C5E\u5730",
    reason: "\u4E0A\u6E38\u660E\u4EE4\u7981\u6B62\u5BA3\u4F20\u5F52\u5C5E\u5730\uFF1B\u5F52\u5C5E\u5730\u5C5E\u8FD0\u8425\u5546\u5185\u90E8\u89C4\u5219\uFF0C\u5BA3\u4F20\u5373\u8FDD\u89C4\u3002",
    suggestion: "\u53EA\u63CF\u8FF0\u53D1\u8D27\u8303\u56F4\uFF0C\u4F8B\u5982\u300C\u4EC5\u53D1\u91CD\u5E86\u300D\u3002",
    fixes: [["\u5F52\u5C5E\u5730", "\u53D1\u8D27\u5730"]]
  },
  {
    id: "fake-authority",
    pattern: /官方授权|运营商直签|官方直签|内部渠道|内部名额|官方合作|官方指定|独家代理|一级代理|总代理|官方渠道授权/g,
    level: "block",
    rule: "\u865A\u5047\u6388\u6743\u8868\u8FF0",
    reason: "\u65E0\u6388\u6743\u6587\u4EF6\u5374\u81EA\u79F0\u300C\u5B98\u65B9\u6388\u6743\u300D\u300C\u5185\u90E8\u6E20\u9053\u300D\uFF0C\u5C5E\u865A\u5047\u8D44\u8D28\u5BA3\u4F20\uFF0C\u5E73\u53F0\u6309\u6B3A\u8BC8\u5904\u7406\u3002",
    suggestion: "\u5220\u9664\u6388\u6743\u7C7B\u8868\u8FF0\uFF0C\u6539\u4E3A\u300C\u5957\u9910\u5185\u5BB9\u4EE5\u8FD0\u8425\u5546\u5B98\u65B9\u9875\u9762\u4E3A\u51C6\u300D\u3002"
  },
  {
    id: "absolute-wording",
    pattern: /100\s*%|百分之百|绝对(?:不会|能|可以|没问题|放心)?|保证(?:不会|能|可|通过|成功|有效)?|必过|包过|一定能|肯定能/g,
    level: "block",
    rule: "\u7EDD\u5BF9\u5316\u7528\u8BED",
    reason: "\u300A\u5E7F\u544A\u6CD5\u300B\u7B2C\u4E5D\u6761\u7981\u6B62\u4F7F\u7528\u300C100%\u300D\u300C\u7EDD\u5BF9\u300D\u300C\u4FDD\u8BC1\u300D\u7B49\u7EDD\u5BF9\u5316\u7528\u8BED\u3002",
    suggestion: "\u6539\u6210\u6709\u4F9D\u636E\u7684\u8868\u8FF0\uFF0C\u4F8B\u5982\u300C\u5B9E\u6D4B\u53EF\u7528\u300D\u300C\u591A\u6570\u7528\u6237\u53CD\u9988\u7A33\u5B9A\u300D\u3002",
    fixes: [
      ["100%", "\u5B9E\u6D4B"],
      ["100 %", "\u5B9E\u6D4B"],
      ["\u767E\u5206\u4E4B\u767E", "\u5B9E\u6D4B"],
      ["\u7EDD\u5BF9", "\u57FA\u672C"]
    ]
  },
  {
    id: "free-claim",
    pattern: /0元(?:领|拿|办|用|送|得)|免费(?:领取|送|拿|办|得)|白嫖|不要钱/g,
    level: "block",
    rule: "\u514D\u8D39\u8BF1\u5BFC",
    reason: "\u5957\u9910\u6709\u9996\u5145\u95E8\u69DB\uFF08\u5982\u9996\u5145 200 \u5143\uFF09\uFF0C\u300C0 \u5143\u9886\u300D\u300C\u514D\u8D39\u9001\u300D\u4E0E\u5B9E\u9645\u529E\u7406\u6761\u4EF6\u77DB\u76FE\u3002",
    suggestion: "\u5199\u660E\u771F\u5B9E\u95E8\u69DB\uFF0C\u4F8B\u5982\u300C\u9996\u5145 200 \u5143\u8BDD\u8D39\uFF0C\u8BDD\u8D39\u76F4\u63A5\u5230\u8D26\u300D\u3002"
  },
  {
    id: "income-claim",
    pattern: /日入过万|月入过万|月入十万|年入百万|躺赚|稳赚|日赚\d+|月赚\d+|保证收益|收益保底|零风险赚钱/g,
    level: "block",
    rule: "\u627F\u8BFA\u6536\u76CA",
    reason: "\u627F\u8BFA\u5177\u4F53\u6536\u76CA\u5C5E\u8FDD\u89C4\uFF0C\u63A8\u5E7F\u4F63\u91D1\u968F\u8BA2\u5355\u6CE2\u52A8\uFF0C\u65E0\u6CD5\u4FDD\u8BC1\u3002",
    suggestion: "\u5220\u9664\u6536\u76CA\u6570\u5B57\uFF0C\u6539\u4E3A\u300C\u6309\u5B9E\u9645\u6FC0\u6D3B\u8BA2\u5355\u7ED3\u7B97\u4F63\u91D1\uFF0C\u4EE5\u540E\u53F0\u6570\u636E\u4E3A\u51C6\u300D\u3002"
  },
  {
    id: "superlative",
    pattern: /最(?:便宜|低价|划算|优惠|实惠|省钱|好|强|快|稳|大|低|高)|全网最低|史上最低|性价比最高|行业第一|全国第一|销量第一|第一(?!个月|时间|次|天)|唯一(?!一)|顶级|No\.?\s*1|NO\.?\s*1/gi,
    level: "block",
    rule: "\u6781\u9650\u7528\u8BED",
    reason: "\u300C\u6700\u300D\u300C\u7B2C\u4E00\u300D\u300C\u552F\u4E00\u300D\u300C\u9876\u7EA7\u300D\u5C5E\u300A\u5E7F\u544A\u6CD5\u300B\u660E\u4EE4\u7981\u6B62\u7684\u6781\u9650\u7528\u8BED\u3002",
    suggestion: "\u6539\u6210\u53EF\u6BD4\u8F83\u7684\u4E2D\u6027\u8868\u8FF0\uFF0C\u4F8B\u5982\u300C\u540C\u6863\u4F4D\u66F4\u5212\u7B97\u300D\u300C\u76EE\u524D\u6BD4\u8F83\u5C11\u89C1\u300D\u3002",
    fixes: [
      ["\u5168\u7F51\u6700\u4F4E", "\u540C\u6863\u66F4\u5B9E\u60E0"],
      ["\u53F2\u4E0A\u6700\u4F4E", "\u540C\u6863\u66F4\u5B9E\u60E0"],
      ["\u6700\u4FBF\u5B9C", "\u66F4\u5212\u7B97"],
      ["\u6700\u4F4E\u4EF7", "\u66F4\u5B9E\u60E0"],
      ["\u6700\u5212\u7B97", "\u66F4\u5212\u7B97"],
      ["\u6700\u4F18\u60E0", "\u66F4\u5B9E\u60E0"],
      ["\u6027\u4EF7\u6BD4\u6700\u9AD8", "\u6027\u4EF7\u6BD4\u4E0D\u9519"],
      ["\u6700\u7701\u94B1", "\u66F4\u7701\u94B1"],
      ["\u9876\u7EA7", "\u9760\u8C31"],
      ["\u552F\u4E00", "\u5C11\u89C1"]
    ]
  },
  // ===== warn：建议改，否则影响转化与限流 =====
  {
    id: "speed-promise",
    pattern: /秒批|秒过|秒发|当天到账|当天发货|立即生效|马上到账|即刻到账|当天激活/g,
    level: "warn",
    rule: "\u65F6\u6548\u627F\u8BFA",
    reason: "\u5BA1\u6838\u3001\u53D1\u8D27\u3001\u5230\u8D26\u65F6\u95F4\u7531\u8FD0\u8425\u5546\u4E0E\u5FEB\u9012\u51B3\u5B9A\uFF0C\u627F\u8BFA\u5177\u4F53\u65F6\u6548\u5BB9\u6613\u5F15\u53D1\u6295\u8BC9\u3002",
    suggestion: "\u6539\u4E3A\u300C\u63D0\u4EA4\u540E\u6309\u8FD0\u8425\u5546\u5BA1\u6838\u8FDB\u5EA6\u53D1\u8D27\u300D\u3002"
  },
  {
    id: "no-throttle",
    pattern: /不限速|全程不限速|永不限速|高速不限速/g,
    level: "warn",
    rule: "\u4E0D\u9650\u901F\u627F\u8BFA",
    reason: "\u8FBE\u91CF\u9650\u901F\u89C4\u5219\u7531\u8FD0\u8425\u5546\u8BBE\u5B9A\uFF0C\u5BA3\u4F20\u300C\u4E0D\u9650\u901F\u300D\u65E0\u6CD5\u4FDD\u8BC1\u3002",
    suggestion: "\u6539\u4E3A\u300C\u6309\u8FD0\u8425\u5546\u516C\u793A\u7684\u901F\u7387\u89C4\u5219\u6267\u884C\u300D\u3002"
  },
  {
    id: "fake-urgency",
    pattern: /最后一天|仅剩\s*\d+\s*张|限量\s*\d+\s*张|错过就没|最后\s*\d+\s*个名额|马上截止|今晚截止/g,
    level: "warn",
    rule: "\u865A\u5047\u7D27\u8FEB\u611F",
    reason: "\u865A\u6784\u5E93\u5B58\u4E0E\u5012\u8BA1\u65F6\u5C5E\u8BEF\u5BFC\u6027\u8425\u9500\uFF0C\u5E73\u53F0\u4F1A\u5224\u4E3A\u865A\u5047\u4FC3\u9500\u3002",
    suggestion: "\u6539\u4E3A\u300C\u6D3B\u52A8\u4EE5\u8FD0\u8425\u5546\u9875\u9762\u516C\u793A\u4E3A\u51C6\u300D\u3002"
  },
  {
    id: "vague-quantity",
    pattern: /高达\s*\d+|最高\s*\d+\s*(?:G|GB|元)|多达\s*\d+|超过\s*\d+\s*(?:G|GB)/gi,
    level: "warn",
    rule: "\u6A21\u7CCA\u989D\u5EA6",
    reason: "\u300C\u9AD8\u8FBE\u300D\u300C\u6700\u9AD8\u300D\u628A\u989D\u5EA6\u8BF4\u6210\u6D6E\u52A8\u4E0A\u9650\uFF0C\u4E0E\u5B9E\u9645\u5957\u9910\u4E0D\u7B26\u65F6\u6784\u6210\u5938\u5927\u3002",
    suggestion: "\u76F4\u63A5\u5199\u5957\u9910\u5185\u771F\u5B9E\u989D\u5EA6\uFF0C\u4F8B\u5982\u300C200G \u5168\u56FD\u901A\u7528\u6D41\u91CF\u300D\u3002"
  },
  {
    id: "cashback",
    pattern: /返现|全返|话费全返|返费|返红包/g,
    level: "warn",
    rule: "\u8FD4\u73B0\u8868\u8FF0",
    reason: "\u8FD4\u73B0 / \u8FD4\u8D39\u9700\u5199\u660E\u5230\u8D26\u65B9\u5F0F\u4E0E\u5468\u671F\uFF0C\u5426\u5219\u6613\u88AB\u5224\u4E3A\u8BF1\u5BFC\u6027\u627F\u8BFA\u3002",
    suggestion: "\u6539\u4E3A\u300C\u8BDD\u8D39\u6309\u8FD0\u8425\u5546\u89C4\u5219\u5206\u6708\u8FD4\u8FD8\uFF0C\u53EF\u5728\u5B98\u65B9 APP \u67E5\u8BE2\u300D\u3002"
  }
];
function highestLevel(issues) {
  return issues.reduce(
    (level, issue) => LEVEL_WEIGHT[issue.level] > LEVEL_WEIGHT[level] ? issue.level : level,
    "pass"
  );
}
function applyFixes(text, issues) {
  const hitIds = new Set(issues.map((issue) => issue.id));
  const pairs = [];
  for (const rule of COMPLIANCE_RULES) {
    if (!rule.fixes || !hitIds.has(rule.id)) continue;
    pairs.push(...rule.fixes);
  }
  if (pairs.length === 0) return text;
  const ordered = [...pairs].sort((a, b) => b[0].length - a[0].length);
  return ordered.reduce((result, [from, to]) => result.split(from).join(to), text);
}
function checkCompliance(text) {
  const source = String(text || "");
  if (!source.trim()) {
    return { level: "pass", issues: [], sanitized: source, scanned: source.length };
  }
  const issues = [];
  for (const rule of COMPLIANCE_RULES) {
    for (const match of source.matchAll(rule.pattern)) {
      const matched = match[0];
      if (!matched) continue;
      issues.push({
        id: rule.id,
        matched,
        level: rule.level,
        rule: rule.rule,
        reason: rule.reason,
        suggestion: rule.suggestion,
        index: match.index ?? 0
      });
    }
  }
  issues.sort((a, b) => a.index - b.index);
  return {
    level: highestLevel(issues),
    issues,
    sanitized: applyFixes(source, issues),
    scanned: source.length
  };
}

// src/lib/studio/tags.ts
var PLATFORM_EXTRA_TAGS = {
  xiaohongshu: [
    "#\u6D41\u91CF\u5361\u63A8\u8350",
    "#\u9009\u5361\u653B\u7565",
    "#\u8BDD\u8D39\u7701\u94B1",
    "#\u5B66\u751F\u515A\u5FC5\u5907",
    "#\u624B\u673A\u5361\u63A8\u8350",
    "#\u907F\u5751\u6307\u5357",
    "#\u6570\u7801\u597D\u7269"
  ],
  douyin: ["#\u6D41\u91CF\u5361", "#\u624B\u673A\u5361", "#\u6570\u7801\u597D\u7269", "#\u6DA8\u77E5\u8BC6", "#\u624B\u673A\u6280\u5DE7"],
  kuaishou: ["#\u6D41\u91CF\u5361\u529E\u7406", "#\u624B\u673A\u5361", "#\u771F\u5B9E\u5206\u4EAB", "#\u672C\u5730\u751F\u6D3B", "#\u7701\u94B1"],
  moments: ["#\u6D41\u91CF\u5361", "#\u624B\u673A\u5361", "#\u8BDD\u8D39"],
  channels: ["#\u6D41\u91CF\u5361", "#\u624B\u673A\u5361", "#\u901A\u8BAF", "#\u7701\u94B1\u653B\u7565"],
  weibo: ["#\u6D41\u91CF\u5361", "#\u624B\u673A\u5361", "#\u8BDD\u8D39\u7701\u94B1", "#\u6570\u7801"],
  bilibili: ["#\u6D41\u91CF\u5361", "#\u624B\u673A\u5361", "#\u6570\u7801", "#\u79D1\u666E", "#\u901A\u4FE1"],
  group: ["#\u6D41\u91CF\u5361", "#\u624B\u673A\u5361", "#\u8BDD\u8D39"]
};
var FALLBACK_TAGS = ["#\u6D41\u91CF\u5361", "#\u624B\u673A\u5361", "#\u8BDD\u8D39\u7701\u94B1", "#\u6570\u7801", "#\u7701\u94B1\u653B\u7565"];
var TARGET_COUNT = {
  xiaohongshu: 10,
  douyin: 7,
  kuaishou: 7,
  moments: 5,
  channels: 6,
  weibo: 7,
  bilibili: 8,
  group: 5
};
function pickRegionNames(shipRegion) {
  const raw = (shipRegion || "").trim();
  if (!raw) return [];
  if (/不发|不支持|暂停|除外|禁发/.test(raw)) return [];
  const stripped = raw.replace(/^(?:仅发|只发|限发|仅限|可发|发往|支持)\s*/, "");
  const first = stripped.split(/[、,，/和及\s]+/).filter(Boolean)[0] || "";
  const name = first.replace(/(?:省|市|自治区|特别行政区|地区|本地)$/, "").trim();
  if (!name || name.length < 2 || name.length > 4) return [];
  if (/全国|不限|各地/.test(name)) return [];
  return [name];
}
function isSafeTag(tag) {
  return checkCompliance(tag).issues.length === 0;
}
function buildTags(spec, platform) {
  const tags = [];
  const push = (tag) => {
    if (!tag || tag === "#") return;
    if (tags.includes(tag)) return;
    tags.push(tag);
  };
  if (spec.operator !== "unknown") {
    const short = OPERATOR_SHORT_LABEL[spec.operator];
    push(`#\u4E2D\u56FD${short}`);
    push(`#${short}\u6D41\u91CF\u5361`);
  }
  if (spec.flowGb > 0) {
    push("#\u6D41\u91CF\u5361");
    if (spec.flowGb >= 100) push("#\u5927\u6D41\u91CF\u5361");
    if (spec.flowGb >= 100) push("#\u5237\u89C6\u9891\u4E0D\u5361");
  }
  if (spec.directionalGb > 0) push("#\u5B9A\u5411\u6D41\u91CF");
  if (spec.monthlyFee >= 10) {
    push(`#\u6708\u79DF${spec.monthlyFee}`);
    if (spec.monthlyFee <= 39) push("#\u4F4E\u6708\u79DF\u6D41\u91CF\u5361");
  }
  for (const region of pickRegionNames(spec.shipRegion)) {
    push(`#${region}\u6D41\u91CF\u5361`);
  }
  if (spec.voiceMinutes > 0) push("#\u5E26\u901A\u8BDD\u6D41\u91CF\u5361");
  if (spec.duration === "\u957F\u671F") push("#\u957F\u671F\u5957\u9910");
  if (spec.contractMonths > 0 && spec.contractMonths <= 12) push("#\u77ED\u671F\u5408\u7EA6");
  if (spec.monthlyFee > 0 && spec.monthlyFee <= 29) push("#\u5B66\u751F\u515A");
  if (spec.firstCharge > 0) push("#\u9996\u5145\u4F18\u60E0");
  for (const extra of PLATFORM_EXTRA_TAGS[platform] ?? []) push(extra);
  const target = TARGET_COUNT[getPlatform(platform).id] ?? 6;
  const safe = tags.filter(isSafeTag);
  for (const fallback of FALLBACK_TAGS) {
    if (safe.length >= target) break;
    if (isSafeTag(fallback) && !safe.includes(fallback)) safe.push(fallback);
  }
  return safe.slice(0, Math.max(5, target));
}

// src/lib/studio/copy.ts
var DEFAULT_BRAND = "\u53F7\u5361\u4E4B\u5BB6";
var MIN_COUNT = 1;
var MAX_COUNT = 10;
var COMPLIANCE_LINE = "\u8D44\u8D39\u4E0E\u4F18\u60E0\u4EE5\u8FD0\u8425\u5546\u5B98\u65B9\u9875\u9762\u4E3A\u51C6\uFF0C\u529E\u7406\u9875\u516C\u793A\u5185\u5BB9\u4F18\u5148\u3002";
function buildFacts(spec) {
  const known = spec.operator !== "unknown";
  const cardFormLabel = spec.cardForm === "physical" ? "\u5B9E\u4F53\u5361" : spec.cardForm === "esim" ? "\u7535\u5B50\u5361" : "";
  return {
    name: spec.name || spec.rawTitle,
    operatorLabel: known ? OPERATOR_LABEL[spec.operator] : "",
    operatorShort: known ? OPERATOR_SHORT_LABEL[spec.operator] : "",
    fee: spec.monthlyFee,
    flow: spec.flowGb,
    directional: spec.directionalGb,
    voice: spec.voiceMinutes,
    firstCharge: spec.firstCharge,
    firstMonth: spec.firstMonth,
    contractText: spec.contractText,
    contractMonths: spec.contractMonths,
    duration: spec.duration === "\u672A\u77E5" ? "" : spec.duration,
    ageRange: spec.ageRange,
    shipRegion: spec.shipRegion,
    activateType: spec.activateType,
    expressType: spec.expressType,
    perks: spec.perks,
    cardFormLabel
  };
}
function renderTemplate(template, values) {
  let missing = false;
  const result = template.replace(/\{(\w+)\}/g, (_all, key) => {
    const value = values[key];
    if (!value) {
      missing = true;
      return "";
    }
    return value;
  });
  return missing ? null : result;
}
function pick(list, index) {
  return list[(index % list.length + list.length) % list.length];
}
function pickTone(bank, tone, index) {
  const options = bank[tone] ?? bank.direct ?? bank.seed ?? ["\u5148\u628A\u53C2\u6570\u6446\u51FA\u6765\u3002"];
  return pick(options, index);
}
function paramLines(facts, style) {
  const rows = [];
  if (facts.fee > 0) rows.push(["\u6708\u79DF", `${facts.fee} \u5143/\u6708`]);
  const perkText = facts.perks.map((perk) => perk.replace(/(\d+)元/g, "$1 \u5143")).join("\u3001");
  if (facts.flow > 0) rows.push(["\u901A\u7528\u6D41\u91CF", `${facts.flow}G \u5168\u56FD\u901A\u7528`]);
  if (facts.directional > 0) rows.push(["\u5B9A\u5411\u6D41\u91CF", `${facts.directional}G`]);
  if (facts.voice > 0) rows.push(["\u901A\u8BDD", `${facts.voice} \u5206\u949F`]);
  if (facts.firstMonth) rows.push(["\u9996\u6708", facts.firstMonth]);
  if (facts.contractText) rows.push(["\u5408\u7EA6\u671F", facts.contractText]);
  if (facts.duration) rows.push(["\u4F18\u60E0\u671F", facts.duration]);
  if (facts.firstCharge > 0) rows.push(["\u9996\u5145", `${facts.firstCharge} \u5143\u8BDD\u8D39`]);
  if (facts.ageRange) rows.push(["\u529E\u5361\u5E74\u9F84", facts.ageRange]);
  if (facts.shipRegion) rows.push(["\u53D1\u8D27\u8303\u56F4", facts.shipRegion]);
  if (facts.activateType) rows.push(["\u6FC0\u6D3B\u65B9\u5F0F", facts.activateType]);
  if (facts.expressType) rows.push(["\u5FEB\u9012", facts.expressType]);
  if (facts.perks.length > 0) rows.push(["\u9644\u52A0\u6743\u76CA", perkText]);
  return rows.map(([key, value]) => {
    if (style === "kv") return `${key}\uFF1A${value}`;
    if (style === "quote") return `\u2705 ${key}\uFF1A${value}`;
    return `\xB7 ${key}\uFF1A${value}`;
  });
}
function cautionLines(facts) {
  const lines = [];
  if (facts.firstCharge > 0) {
    lines.push(`\u9996\u5145 ${facts.firstCharge} \u5143\u662F\u8BDD\u8D39\uFF0C\u76F4\u63A5\u5230\u8D26\uFF0C\u4E0D\u7B97\u989D\u5916\u6536\u8D39`);
  }
  if (facts.shipRegion) {
    lines.push(`\u53D1\u8D27\u8303\u56F4\u662F\u300C${facts.shipRegion}\u300D\uFF0C\u5176\u4ED6\u5730\u533A\u6682\u65F6\u53D1\u4E0D\u4E86`);
  }
  if (facts.contractMonths > 0) {
    lines.push(`\u5408\u7EA6\u671F ${facts.contractMonths} \u4E2A\u6708\uFF0C\u671F\u5185\u6CE8\u9500\u6309\u8FD0\u8425\u5546\u89C4\u5219\u5904\u7406`);
  }
  if (facts.ageRange) {
    lines.push(`\u529E\u5361\u5E74\u9F84 ${facts.ageRange}\uFF0C\u8D85\u9F84\u5BA1\u6838\u901A\u4E0D\u8FC7`);
  }
  return lines;
}
function coreNumbers(facts) {
  const parts = [];
  if (facts.fee > 0) parts.push(`${facts.fee} \u5143`);
  if (facts.flow > 0) parts.push(`${facts.flow}G`);
  if (facts.voice > 0) parts.push(`${facts.voice} \u5206\u949F`);
  return parts.length > 0 ? parts.join(" / ") : facts.name;
}
function perGJiao(facts) {
  if (facts.fee <= 0 || facts.flow <= 0) return "";
  const jiao = Math.ceil(facts.fee / facts.flow * 10);
  return jiao > 0 && jiao <= 200 ? String(jiao) : "";
}
function perDayYuan(facts) {
  if (facts.fee <= 0) return "";
  const yuan = Math.ceil(facts.fee / 30);
  return yuan > 0 ? String(yuan) : "";
}
function buildValues(facts) {
  return {
    fee: facts.fee > 0 ? String(facts.fee) : "",
    flow: facts.flow > 0 ? String(facts.flow) : "",
    voice: facts.voice > 0 ? String(facts.voice) : "",
    operator: facts.operatorShort,
    operatorFull: facts.operatorLabel,
    // 单独给一个带后缀空格的写法，供「{operatorSpaced}{fee} 元」这类模板使用，
    // 否则渲染出「联通49 元」这种中英文数字挤在一起的句子。
    operatorSpaced: facts.operatorShort ? `${facts.operatorShort} ` : "",
    region: facts.shipRegion,
    firstCharge: facts.firstCharge > 0 ? String(facts.firstCharge) : "",
    contract: facts.contractText,
    age: facts.ageRange,
    perG: perGJiao(facts),
    perDay: perDayYuan(facts),
    name: facts.name
  };
}
var HOOK_BANK = {
  xiaohongshu: {
    seed: [
      "\u59D0\u59B9\u4EEC\uFF0C\u8FD9\u5F20\u5361\u6211\u7528\u4E86\u4E00\u4E2A\u6708\uFF0C\u5148\u8BF4\u7ED3\u8BBA\uFF1A{fee} \u5143\u6708\u79DF\uFF0C{flow}G \u6D41\u91CF\u3002",
      "\u627E\u4E86\u5C0F\u534A\u5E74\u6D41\u91CF\u5361\uFF0C{operatorSpaced}{fee} \u5143 {flow}G \u8FD9\u4E2A\u6211\u662F\u771F\u7559\u4E0B\u6765\u4E86\u3002",
      "\u4E0D\u5439\u4E0D\u9ED1\uFF0C{fee} \u5143\u6708\u79DF\u914D {flow}G \u901A\u7528\u6D41\u91CF\uFF0C\u503C\u4E0D\u503C\u5F97\u529E\u6211\u628A\u8BDD\u8BF4\u5B8C\u3002",
      "\u5148\u522B\u6025\u7740\u529E\u5361\uFF0C\u770B\u5B8C\u8FD9\u5F20 {flow}G \u7684\u53C2\u6570\u518D\u51B3\u5B9A\u3002"
    ],
    direct: [
      "\u5148\u8BF4\u7ED3\u8BBA\uFF1A{operatorSpaced}{fee} \u5143\u6708\u79DF\uFF0C{flow}G \u5168\u56FD\u901A\u7528\u6D41\u91CF\u3002",
      "{flow}G \u901A\u7528\u6D41\u91CF\uFF0C\u6708\u79DF {fee} \u5143\uFF0C\u53C2\u6570\u5148\u6446\u8FD9\u513F\u3002",
      "\u4E0D\u6574\u865A\u7684\uFF0C\u628A\u8FD9\u5F20\u5361\u7684\u53C2\u6570\u4E00\u6761\u6761\u6284\u7ED9\u4F60\u3002",
      "\u6708\u79DF {fee} \u5143\u3001{flow}G \u6D41\u91CF\u3001{voice} \u5206\u949F\u901A\u8BDD\uFF0C\u5C31\u8FD9\u4E9B\u3002"
    ],
    story: [
      "\u4E0A\u4E2A\u6708\u5E2E\u6211\u5988\u6362\u5361\uFF0C\u624D\u53D1\u73B0\u5979\u4E00\u4E2A\u6708\u8BDD\u8D39\u4E00\u767E\u591A\u3002",
      "\u6211\u539F\u6765\u90A3\u4E2A\u5957\u9910\uFF0C\u6D41\u91CF\u7528\u8D85\u4E86\u8FD8\u5F97\u518D\u4E70\u52A0\u6CB9\u5305\u3002",
      "\u670B\u53CB\u95EE\u6211\u4E3A\u4EC0\u4E48\u8001\u6362\u5361\uFF0C\u5176\u5B9E\u5C31\u4E00\u4E2A\u539F\u56E0\uFF1A\u8D35\u3002",
      "\u53BB\u5E74\u8FD9\u65F6\u5019\u6211\u8FD8\u5728\u4E3A\u6BCF\u6708\u8BDD\u8D39\u53D1\u6101\uFF0C\u73B0\u5728\u6362\u6210 {fee} \u5143\u4E86\u3002"
    ],
    value: [
      "\u7B97\u7B14\u8D26\uFF1A{fee} \u5143\u6708\u79DF\u6362 {flow}G \u901A\u7528\u6D41\u91CF\u3002",
      "\u540C\u4EF7\u4F4D\u91CC\uFF0C{flow}G \u901A\u7528\u6D41\u91CF\u7B97\u662F\u7ED9\u5F97\u5B9E\u5728\u7684\u3002",
      "\u522B\u53EA\u76EF\u7740\u6708\u79DF\u770B\uFF0C\u5148\u770B\u8FD9\u4E00\u6863\u80FD\u62FF\u5230\u591A\u5C11\u6D41\u91CF\u3002",
      "\u4E00\u4E2A\u6708 {fee} \u5143\uFF0C\u6298\u4E0B\u6765\u4E00\u5929 {perDay} \u5757\u3002"
    ],
    qa: [
      "\u8BC4\u8BBA\u533A\u95EE\u6700\u591A\u7684\u4E09\u4E2A\u95EE\u9898\uFF0C\u6211\u4E00\u6B21\u8BF4\u6E05\u695A\u3002",
      "\u300C\u8FD9\u5F20\u5361\u9760\u8C31\u5417\u300D\u6211\u88AB\u95EE\u4E86\u4E0D\u4E0B\u4E8C\u5341\u904D\uFF0C\u7EDF\u4E00\u56DE\u3002",
      "\u5148\u56DE\u7B54\u6700\u591A\u4EBA\u95EE\u7684\uFF1A{fee} \u5143\u6708\u79DF\u5BF9\u5E94 {flow}G \u901A\u7528\u6D41\u91CF\u3002",
      "\u529E\u5361\u524D\u8FD9\u51E0\u4E2A\u95EE\u9898\u4E0D\u95EE\u6E05\u695A\uFF0C\u5BB9\u6613\u767D\u6298\u817E\u4E00\u8D9F\u3002"
    ]
  },
  douyin: {
    seed: [
      "\u522B\u518D\u82B1\u4E00\u767E\u591A\u4E70\u6D41\u91CF\u4E86\uFF0C{fee} \u5143 {flow}G \u7684\u5148\u770B\u5B8C\u8FD9\u6761\u3002",
      "{flow}G \u901A\u7528\u6D41\u91CF\uFF0C\u6708\u79DF {fee} \u5143\uFF0C\u5148\u522B\u5212\u8D70\u3002",
      "\u8FD9\u4E2A\u6708\u8BDD\u8D39\u53C8\u8D85\u4E86\uFF1F\u5148\u770B\u8FD9\u5F20\u5361\u7684\u53C2\u6570\u3002",
      "\u8BDD\u8D39\u82B1\u5F97\u51A4\u4E0D\u51A4\uFF0C\u770B\u4F60\u4F1A\u4E0D\u4F1A\u6311\u5361\u3002"
    ],
    direct: [
      "{operatorSpaced}{fee} \u5143 {flow}G\uFF0C\u53C2\u6570\u5C31\u8FD9\u51E0\u884C\u3002",
      "\u6708\u79DF {fee}\uFF0C\u6D41\u91CF {flow}G\uFF0C\u901A\u8BDD {voice} \u5206\u949F\uFF0C\u5C31\u8FD9\u4E9B\u3002",
      "\u4E09\u53E5\u8BDD\u8BF4\u5B8C\u8FD9\u5F20\u5361\uFF1A{fee} \u5143\u3001{flow}G\u3001{contract}\u3002",
      "{fee} \u5143\u4E00\u4E2A\u6708\uFF0C{flow}G \u5168\u56FD\u901A\u7528\uFF0C\u591F\u4E86\u3002"
    ],
    story: [
      "\u6211\u5988\u4E0A\u4E2A\u6708\u8BDD\u8D39\u4E00\u767E\u4E8C\uFF0C\u6211\u7ED9\u5979\u6362\u4E86\u5F20\u5361\u3002",
      "\u6709\u4E2A\u7C89\u4E1D\u79C1\u4FE1\u6211\uFF0C\u8BF4\u4ED6\u4E00\u4E2A\u6708\u6D41\u91CF\u8D39\u6BD4\u623F\u79DF\u8FD8\u9AD8\u3002",
      "\u6211\u81EA\u5DF1\u7528\u4E86\u4E09\u4E2A\u6708\uFF0C\u624D\u6562\u62CD\u8FD9\u6761\u3002",
      "\u4E4B\u524D\u8D2A\u4FBF\u5B9C\u529E\u8FC7\u4E00\u5F20\u5361\uFF0C\u7528\u4E24\u4E2A\u6708\u5C31\u53D8\u4E86\uFF0C\u8FD9\u6B21\u6211\u76EF\u7740\u770B\u3002"
    ],
    value: [
      "{fee} \u5143 {flow}G\uFF0C\u6298\u7B97\u4E0B\u6765\u4E00 G \u4E0D\u5230 {perG} \u6BDB\u3002",
      "\u540C\u6837 {flow}G\uFF0C\u8425\u4E1A\u5385\u7684\u4EF7\u683C\u81EA\u5DF1\u53BB\u95EE\uFF0C\u5BF9\u6BD4\u5B8C\u518D\u51B3\u5B9A\u3002",
      "{fee} \u5143\u6708\u79DF\uFF0C{flow}G \u6D41\u91CF\uFF0C\u503C\u4E0D\u503C\u81EA\u5DF1\u7B97\u3002",
      "\u4E00\u5929 {perDay} \u5757\uFF0C\u6362 {flow}G \u6D41\u91CF\u3002"
    ],
    qa: [
      "\u79C1\u4FE1\u95EE\u5F97\u6700\u591A\u7684\u4E09\u4E2A\u95EE\u9898\uFF0C\u4E00\u6B21\u8BF4\u5B8C\u3002",
      "{fee} \u5143\u662F\u6708\u79DF\u8FD8\u662F\u9996\u6708\u4EF7\uFF1F\u8FD9\u6761\u8BF4\u6E05\u695A\u3002",
      "\u9996\u5145 {firstCharge} \u5143\u5230\u5E95\u600E\u4E48\u56DE\u4E8B\uFF0C\u6211\u8BF4\u4E0B\u5B9E\u9645\u60C5\u51B5\u3002",
      "\u6709\u4EBA\u95EE\u8FD9\u5361\u80FD\u4E0D\u80FD\u4E70\uFF0C\u6211\u5148\u628A\u4E09\u4E2A\u524D\u63D0\u8BB2\u4E86\u3002"
    ]
  },
  kuaishou: {
    seed: [
      "\u8001\u94C1\u4EEC\uFF0C{fee} \u5143 {flow}G\uFF0C\u6211\u81EA\u5DF1\u5728\u7528\uFF0C\u4E0D\u5FFD\u60A0\u3002",
      "\u8FD9\u5F20\u5361\u6211\u5B9E\u62CD\u4E86\uFF0C{flow}G \u901A\u7528\u6D41\u91CF\uFF0C\u6708\u79DF {fee}\u3002",
      "\u522B\u542C\u4EBA\u5439\uFF0C\u5148\u770B\u53C2\u6570\uFF1A{fee} \u5143\uFF0C{flow}G\u3002",
      "\u54B1\u4E0D\u6574\u90A3\u4E9B\u865A\u7684\uFF0C\u5361\u597D\u4E0D\u597D\u7528\uFF0C\u53C2\u6570\u6446\u51FA\u6765\u770B\u3002"
    ],
    direct: [
      "{operator}\u7684\u5361\uFF0C{fee} \u5143\u6708\u79DF\uFF0C{flow}G \u901A\u7528\u6D41\u91CF\u3002",
      "\u53C2\u6570\u6446\u8FD9\u513F\uFF1A{fee} \u5143 / {flow}G / {voice} \u5206\u949F\u3002",
      "{region}\u80FD\u53D1\u7684\u5361\uFF0C{fee} \u5143 {flow}G\u3002",
      "\u6708\u79DF {fee}\uFF0C\u6D41\u91CF {flow}G\uFF0C\u522B\u7684\u4E0D\u7528\u591A\u95EE\u3002"
    ],
    story: [
      "\u6211\u8868\u54E5\u5728\u5DE5\u5730\uFF0C\u4E00\u4E2A\u6708\u6D41\u91CF\u8D39\u4E24\u767E\u591A\uFF0C\u6211\u7ED9\u4ED6\u6362\u4E86\u8FD9\u5F20\u3002",
      "\u4E4B\u524D\u4E70\u7684\u5361\u8BF4\u597D\u7684\u6D41\u91CF\uFF0C\u7528\u4E24\u4E2A\u6708\u5C31\u53D8\u4E86\uFF0C\u8FD9\u6B21\u6211\u76EF\u4E86\u4E09\u4E2A\u6708\u3002",
      "\u54B1\u666E\u901A\u4EBA\u529E\u5361\uFF0C\u5C31\u6015\u88AB\u5957\u8DEF\uFF0C\u8FD9\u5F20\u6211\u62C6\u5F00\u7ED9\u4F60\u770B\u3002",
      "\u6211\u5988\u4E0D\u4F1A\u770B\u8D26\u5355\uFF0C\u6BCF\u4E2A\u6708\u6263\u591A\u5C11\u5979\u90FD\u4E0D\u77E5\u9053\uFF0C\u6211\u7ED9\u5979\u6362\u4E86\u8FD9\u4E2A\u3002"
    ],
    value: [
      "{fee} \u5143 {flow}G\uFF0C\u4E00 G \u4E0D\u5230 {perG} \u6BDB\uFF0C\u81EA\u5DF1\u7B97\u3002",
      "\u540C\u6837\u7684\u94B1\uFF0C\u591A\u51FA\u6765\u7684\u6D41\u91CF\u5C31\u662F\u7701\u4E0B\u7684\u94B1\u3002",
      "{fee} \u5143\u80FD\u62FF\u5230 {flow}G\uFF0C\u5237\u4E00\u6574\u4E2A\u6708\u591F\u7528\u3002",
      "\u4E00\u5929 {perDay} \u5757\uFF0C\u6BD4\u4E00\u5305\u70DF\u4FBF\u5B9C\u3002"
    ]
  },
  moments: {
    seed: [
      "\u6700\u8FD1\u628A\u5957\u9910\u6362\u4E86\uFF0C{fee} \u5143 {flow}G\uFF0C\u7528\u7740\u8FD8\u884C\u3002",
      "\u6709\u670B\u53CB\u95EE\u6211\u5728\u7528\u5565\u5361\uFF0C\u7EDF\u4E00\u56DE\u4E00\u4E0B\uFF1A{fee} \u5143 {flow}G\u3002",
      "\u8BDD\u8D39\u8FD9\u4E8B\uFF0C\u80FD\u7701\u4E00\u70B9\u662F\u4E00\u70B9\u3002",
      "\u6362\u5361\u4E00\u4E2A\u6708\u4E86\uFF0C\u8BB0\u5F55\u4E00\u4E0B\uFF1A{fee} \u5143\uFF0C{flow}G\u3002"
    ],
    direct: [
      "{operatorSpaced}{fee} \u5143 {flow}G\uFF0C\u9700\u8981\u7684\u79C1\u6211\u3002",
      "\u6708\u79DF {fee} \u5143\uFF0C{flow}G \u901A\u7528\u6D41\u91CF\uFF0C\u6B63\u89C4\u5361\u3002",
      "{fee} \u5143 {flow}G\uFF0C\u529E\u5361\u5E74\u9F84 {age}\u3002",
      "{fee} \u5143\u4E00\u4E2A\u6708\uFF0C{flow}G \u6D41\u91CF\uFF0C\u529E\u5361\u5165\u53E3\u5728\u8FD9\u3002"
    ],
    story: [
      "\u4E0A\u4E2A\u6708\u8BDD\u8D39\u5355\u51FA\u6765\uFF0C\u6211\u81EA\u5DF1\u90FD\u6123\u4E86\u4E00\u4E0B\u3002",
      "\u6211\u5988\u4E00\u76F4\u7528\u4E00\u767E\u591A\u7684\u5957\u9910\uFF0C\u8BF4\u4E86\u4E24\u5E74\u624D\u80AF\u6362\u3002",
      "\u5E2E\u540C\u4E8B\u529E\u4E86\u5F20\u5361\uFF0C\u4ED6\u95EE\u6211\u4E3A\u5565\u4E0D\u65E9\u8BF4\u3002",
      "\u53BB\u5E74\u4E3A\u4E86\u7701\u8BDD\u8D39\u6298\u817E\u4E86\u534A\u4E2A\u6708\uFF0C\u73B0\u5728\u603B\u7B97\u5B89\u751F\u4E86\u3002"
    ],
    value: [
      "{fee} \u5143 {flow}G\uFF0C\u4E00\u5929 {perDay} \u5757\u3002",
      "\u540C\u6837\u5237\u89C6\u9891\uFF0C\u6708\u79DF\u80FD\u4F4E\u4E00\u622A\u3002",
      "\u7B97\u4E0B\u6765\u4E00\u4E2A\u6708 {fee} \u5143\uFF0C\u6BD4\u4E24\u676F\u5976\u8336\u4FBF\u5B9C\u3002",
      "{fee} \u5143\u6362 {flow}G\uFF0C\u4E00\u4E2A\u6708\u4E0D\u7528\u518D\u4E70\u52A0\u6CB9\u5305\u3002"
    ]
  },
  channels: {
    direct: [
      "{operator}\u7684\u5361\uFF0C\u6708\u79DF {fee} \u5143\uFF0C{flow}G \u901A\u7528\u6D41\u91CF\u3002",
      "\u4ECA\u5929\u8BB2\u6E05\u695A\u4E00\u5F20\u5361\uFF1A{fee} \u5143\uFF0C{flow}G\uFF0C{voice} \u5206\u949F\u3002",
      "\u7ED9\u4E0D\u592A\u61C2\u7684\u670B\u53CB\u8BB2\u4E00\u904D\uFF1A\u8FD9\u5F20\u5361\u6708\u79DF {fee} \u5143\u3002",
      "\u60F3\u6362\u5957\u9910\u7684\u542C\u6211\u8BF4\u5B8C\uFF0C{fee} \u5143 {flow}G \u662F\u600E\u4E48\u7B97\u7684\u3002"
    ],
    story: [
      "\u6709\u4F4D\u7C89\u4E1D\u516D\u5341\u591A\u5C81\uFF0C\u95EE\u6211\u6D41\u91CF\u5361\u5230\u5E95\u600E\u4E48\u9009\u3002",
      "\u6211\u90BB\u5C45\u4E0A\u4E2A\u6708\u6D41\u91CF\u8D85\u4E86\uFF0C\u6263\u4E86\u516D\u5341\u591A\u5757\u3002",
      "\u5F88\u591A\u670B\u53CB\u529E\u4E86\u5361\u4E0D\u4F1A\u770B\u8D26\u5355\uFF0C\u4ECA\u5929\u8BF4\u6E05\u695A\u3002",
      "\u4E00\u4F4D\u8001\u540C\u4E8B\u6362\u5361\u8E29\u4E86\u5751\uFF0C\u6211\u628A\u8FC7\u7A0B\u8BB2\u4E00\u904D\u3002"
    ],
    value: [
      "{fee} \u5143\u4E00\u4E2A\u6708\uFF0C{flow}G \u6D41\u91CF\uFF0C\u5237\u89C6\u9891\u770B\u65B0\u95FB\u90FD\u591F\u3002",
      "\u6309\u6708\u79DF\u7B97\uFF0C\u4E00\u5929 {perDay} \u5757\uFF0C\u6BD4\u60F3\u8C61\u4E2D\u4FBF\u5B9C\u3002",
      "\u6D41\u91CF\u591F\u7528\u3001\u6708\u79DF\u4E0D\u9AD8\uFF0C\u8FD9\u5C31\u662F\u5B83\u5B9E\u5728\u7684\u5730\u65B9\u3002",
      "{fee} \u5143\u80FD\u62FF\u5230 {flow}G\uFF0C\u6BD4\u591A\u6570\u5957\u9910\u90FD\u5B9E\u5728\u3002"
    ],
    qa: [
      "\u5E38\u6709\u670B\u53CB\u95EE\uFF1A\u8FD9\u79CD\u5361\u548C\u8425\u4E1A\u5385\u7684\u6709\u4EC0\u4E48\u533A\u522B\uFF1F",
      "\u6709\u4EBA\u62C5\u5FC3\u7F51\u4E0A\u529E\u7684\u5361\u4E0D\u80FD\u7528\uFF0C\u6211\u8BF4\u4E09\u70B9\u3002",
      "\u529E\u5361\u8981\u4E0D\u8981\u5148\u4EA4\u94B1\uFF1F\u9996\u5145 {firstCharge} \u5143\u662F\u600E\u4E48\u56DE\u4E8B\uFF0C\u8BB2\u6E05\u695A\u3002",
      "\u5408\u7EA6\u671F\u6CA1\u5230\u671F\u80FD\u4E0D\u80FD\u6CE8\u9500\uFF1F\u8FD9\u4E2A\u95EE\u9898\u6700\u591A\u4EBA\u95EE\u3002"
    ]
  },
  weibo: {
    direct: [
      "{operatorSpaced}{fee} \u5143 {flow}G\uFF0C\u53C2\u6570\u5982\u4E0B\u3002",
      "\u6708\u79DF {fee} \u5143\uFF0C{flow}G \u5168\u56FD\u901A\u7528\u6D41\u91CF\u3002",
      "{fee} \u5143 {flow}G \u7684\u5361\uFF0C\u6574\u7406\u4E86\u4E00\u4E0B\u3002",
      "\u4E00\u6761\u8BF4\u5B8C\uFF1A{fee} \u5143 / {flow}G / {voice} \u5206\u949F\u3002"
    ],
    value: [
      "{fee} \u5143 {flow}G\uFF0C\u540C\u6863\u4F4D\u91CC\u7B97\u5B9E\u5728\u7684\u3002",
      "\u6298\u7B97\u4E0B\u6765\u4E00 G \u4E0D\u5230 {perG} \u6BDB\uFF0C\u81EA\u5DF1\u5BF9\u6BD4\u3002",
      "\u6708\u79DF {fee}\uFF0C\u6D41\u91CF {flow}G\uFF0C\u503C\u4E0D\u503C\u81EA\u5DF1\u770B\u3002",
      "\u4E00\u5929 {perDay} \u5757\u7684\u6210\u672C\uFF0C\u6362 {flow}G \u6D41\u91CF\u3002"
    ],
    qa: [
      "\u95EE\u7684\u4EBA\u591A\uFF0C\u7EDF\u4E00\u56DE\u7B54\u51E0\u4E2A\u5173\u4E8E\u6D41\u91CF\u5361\u7684\u95EE\u9898\u3002",
      "\u6D41\u91CF\u5361\u80FD\u4E0D\u80FD\u957F\u671F\u7528\uFF1F\u5148\u8BF4\u7ED3\u8BBA\u518D\u8BF4\u539F\u56E0\u3002",
      "\u9996\u5145\u8FD9\u7B14\u94B1\u5230\u5E95\u600E\u4E48\u7B97\uFF1F\u8BF4\u6E05\u695A\u3002",
      "\u4E3A\u4EC0\u4E48\u7EBF\u4E0A\u529E\u7684\u5361\u4FBF\u5B9C\uFF0C\u7B54\u6848\u5728\u6210\u672C\u7ED3\u6784\u91CC\u3002"
    ]
  },
  bilibili: {
    direct: [
      "{operatorSpaced}{fee} \u5143 {flow}G\uFF0C\u8FD9\u671F\u628A\u53C2\u6570\u548C\u5751\u4E00\u8D77\u8BB2\u5B8C\u3002",
      "\u4E00\u5F20 {fee} \u5143 {flow}G \u7684\u5361\uFF0C\u503C\u4E0D\u503C\u5F97\u529E\uFF0C\u6211\u62C6\u5F00\u8BF4\u3002",
      "\u672C\u671F\u8BB2\u6E05\u695A\uFF1A{fee} \u5143\u6708\u79DF\u7684\u6D41\u91CF\u5361\u5230\u5E95\u600E\u4E48\u9009\u3002",
      "{fee} \u5143\u80FD\u62FF\u5230 {flow}G\uFF0C\u5148\u770B\u5B8C\u6574\u53C2\u6570\u3002"
    ],
    value: [
      "{fee} \u5143 {flow}G\uFF0C\u6211\u4EEC\u628A\u6BCF G \u5355\u4EF7\u7B97\u51FA\u6765\u3002",
      "\u540C\u4EF7\u4F4D\u5957\u9910\u6A2A\u5411\u5BF9\u6BD4\uFF0C\u53C2\u6570\u90FD\u5728\u8FD9\u671F\u91CC\u3002",
      "\u6708\u79DF {fee} \u5143\u80FD\u62FF\u5230 {flow}G\uFF0C\u8D26\u5148\u7B97\u6E05\u695A\u3002",
      "\u4E00\u5929 {perDay} \u5757\uFF0C\u4E00\u5E74\u4E0B\u6765\u662F\u591A\u5C11\uFF0C\u8FD9\u671F\u7B97\u7ED9\u4F60\u770B\u3002"
    ],
    qa: [
      "\u5F39\u5E55\u95EE\u6700\u591A\u7684\u51E0\u4E2A\u95EE\u9898\uFF0C\u8FD9\u671F\u7EDF\u4E00\u56DE\u7B54\u3002",
      "\u300C\u6D41\u91CF\u5361\u4F1A\u4E0D\u4F1A\u7A81\u7136\u6DA8\u4EF7\u300D\u8FD9\u671F\u8BB2\u660E\u767D\u3002",
      "\u9996\u5145\u3001\u5408\u7EA6\u671F\u3001\u53D1\u8D27\u8303\u56F4\uFF0C\u4E09\u4E2A\u6700\u5BB9\u6613\u8E29\u7684\u5751\u3002",
      "\u7EBF\u4E0A\u529E\u7684\u5361\u548C\u8425\u4E1A\u5385\u7684\u5361\uFF0C\u5230\u5E95\u5DEE\u5728\u54EA\u3002"
    ],
    story: [
      "\u8FD9\u671F\u4E0D\u8BB2\u53C2\u6570\uFF0C\u8BB2\u6211\u8E29\u8FC7\u7684\u4E09\u4E2A\u5751\u3002",
      "\u53BB\u5E74\u6211\u529E\u4E86\u5F20\u5361\uFF0C\u7528\u4E86\u4E24\u4E2A\u6708\u624D\u53D1\u73B0\u5408\u7EA6\u671F\u662F\u4E24\u5E74\u3002",
      "\u5E2E\u670B\u53CB\u6311\u5361\u6311\u4E86\u534A\u4E2A\u6708\uFF0C\u8FC7\u7A0B\u8BB0\u5F55\u4E00\u4E0B\u3002",
      "\u4E3A\u4E86\u6BCF\u6708\u7701\u51E0\u5341\u5757\uFF0C\u6211\u628A\u5E02\u9762\u4E0A\u7684\u5957\u9910\u7FFB\u4E86\u4E00\u904D\u3002"
    ]
  },
  group: {
    direct: [
      "{operatorSpaced}{fee} \u5143 {flow}G\uFF0C\u53C2\u6570\u5728\u4E0B\u3002",
      "\u3010{fee} \u5143 / {flow}G\u3011{operator}\u5361\uFF0C{region}\u53EF\u53D1\u3002",
      "\u6708\u79DF {fee} \u5143\uFF0C{flow}G \u901A\u7528\u6D41\u91CF\uFF0C{voice} \u5206\u949F\u901A\u8BDD\u3002",
      "{fee} \u5143 {flow}G\uFF0C\u6B63\u89C4\u5361\uFF0C\u9700\u8981\u79C1\u804A\u3002"
    ],
    value: [
      "{fee} \u5143 {flow}G\uFF0C\u4E00 G \u4E0D\u5230 {perG} \u6BDB\u3002",
      "\u540C\u4EF7\u4F4D\u5BF9\u6BD4\uFF1A{fee} \u5143\u62FF\u5230 {flow}G\u3002",
      "\u6708\u79DF {fee} \u5143\uFF0C\u5237\u4E00\u4E2A\u6708\u89C6\u9891\u591F\u7528\u3002",
      "\u4E00\u5929 {perDay} \u5757\uFF0C\u6BD4\u52A0\u6CB9\u5305\u5212\u7B97\u3002"
    ],
    qa: [
      "\u7FA4\u91CC\u6709\u670B\u53CB\u95EE\u8FD9\u5F20\u5361\u7684\u60C5\u51B5\uFF0C\u7EDF\u4E00\u56DE\u3002",
      "\u5E38\u89C1\u95EE\u9898\uFF1A\u6708\u79DF\u3001\u9996\u5145\u3001\u53D1\u8D27\uFF0C\u4E00\u6761\u6761\u8BF4\u3002",
      "\u529E\u4E4B\u524D\u5148\u770B\u8FD9\u4E09\u6761\uFF0C\u80FD\u7701\u4E0D\u5C11\u4E8B\u3002",
      "\u5173\u4E8E\u8FD9\u5F20\u5361\uFF0C\u95EE\u5F97\u6700\u591A\u7684\u8FD8\u662F\u9996\u5145\u548C\u5408\u7EA6\u671F\u3002"
    ]
  }
};
var FALLBACK_HOOKS = [
  "\u5148\u8BF4\u7ED3\u8BBA\uFF1A{name}\u3002",
  "\u8FD9\u5F20\u5361\u7684\u53C2\u6570\uFF0C\u4E00\u6761\u6761\u8BB2\u6E05\u695A\u3002",
  "\u4E0D\u7ED5\u5F2F\u5B50\uFF0C\u5148\u628A\u6838\u5FC3\u6570\u5B57\u6446\u51FA\u6765\u3002"
];
var CTA_BANK = {
  xiaohongshu: [
    "\u60F3\u770B\u7684\u53EF\u4EE5\u8BC4\u8BBA\u533A\u95EE\u6211\uFF0C\u770B\u5230\u90FD\u4F1A\u56DE\uFF5E",
    "\u6709\u9700\u8981\u7684\u59D0\u59B9\u8BC4\u8BBA\u533A\u6263\u300C1\u300D\uFF0C\u6211\u628A\u529E\u7406\u65B9\u5F0F\u53D1\u4F60\u3002",
    "\u4E0D\u786E\u5B9A\u81EA\u5DF1\u9002\u5408\u54EA\u4E2A\u7684\uFF0C\u8BC4\u8BBA\u533A\u8BF4\u4E0B\u6BCF\u6708\u7528\u91CF\uFF0C\u6211\u5E2E\u4F60\u770B\u770B\u3002"
  ],
  douyin: [
    "\u60F3\u8981\u7684\u8BC4\u8BBA\u533A\u6263\u300C\u5361\u300D\uFF0C\u4E3B\u9875\u6709\u5165\u53E3\u3002",
    "\u8FD8\u6709\u4E0D\u61C2\u7684\u8BC4\u8BBA\u533A\u95EE\uFF0C\u6211\u4E00\u6761\u6761\u56DE\u3002",
    "\u770B\u5B8C\u8FD8\u662F\u4E0D\u4F1A\u9009\uFF0C\u8BC4\u8BBA\u533A\u7559\u4E2A\u7528\u91CF\uFF0C\u6211\u7ED9\u4F60\u7B97\u3002"
  ],
  kuaishou: [
    "\u60F3\u529E\u7684\u8BC4\u8BBA\u533A\u8BF4\u4E00\u58F0\uFF0C\u6211\u7ED9\u4F60\u8BB2\u6E05\u695A\u3002",
    "\u6709\u5565\u4E0D\u660E\u767D\u7684\u8BC4\u8BBA\u533A\u95EE\u6211\uFF0C\u8001\u94C1\u4E0D\u5FFD\u60A0\u3002",
    "\u9700\u8981\u7684\u79C1\u4FE1\u6211\uFF0C\u5148\u95EE\u6E05\u695A\u518D\u529E\u3002"
  ],
  moments: [
    "\u9700\u8981\u7684\u79C1\u6211\uFF0C\u6211\u628A\u529E\u7406\u65B9\u5F0F\u53D1\u4F60\u3002",
    "\u60F3\u4E86\u89E3\u7684\u8BC4\u8BBA\u533A\u8BF4\u4E00\u58F0\u3002",
    "\u6709\u9700\u8981\u7684\u76F4\u63A5\u627E\u6211\uFF0C\u4E0D\u7740\u6025\uFF0C\u5148\u95EE\u6E05\u695A\u3002"
  ],
  channels: [
    "\u6709\u4E0D\u660E\u767D\u7684\u8BC4\u8BBA\u533A\u7559\u8A00\uFF0C\u6211\u4E0B\u671F\u8BB2\u3002",
    "\u60F3\u4E86\u89E3\u7684\u53EF\u4EE5\u79C1\u4FE1\u6211\uFF0C\u6162\u6162\u95EE\u3002",
    "\u89C9\u5F97\u6709\u7528\uFF0C\u8F6C\u7ED9\u5BB6\u91CC\u9700\u8981\u7684\u4EBA\u3002"
  ],
  weibo: [
    "\u9700\u8981\u7684\u8F6C\u8BC4\uFF0C\u6211\u628A\u5165\u53E3\u653E\u8BC4\u8BBA\u533A\u3002",
    "\u6709\u7591\u95EE\u8BC4\u8BBA\u533A\u95EE\uFF0C\u7EDF\u4E00\u56DE\u3002",
    "\u60F3\u4E86\u89E3\u7684\u70B9\u4E2A\u8D5E\uFF0C\u6211\u79C1\u4FE1\u53D1\u4F60\u3002"
  ],
  bilibili: [
    "\u53C2\u6570\u8868\u5728\u7F6E\u9876\u8BC4\u8BBA\uFF0C\u9700\u8981\u7684\u81EA\u53D6\u3002",
    "\u8FD8\u6709\u60F3\u770B\u7684\u5BF9\u6BD4\uFF0C\u5F39\u5E55\u544A\u8BC9\u6211\u3002",
    "\u529E\u4E4B\u524D\u6709\u7591\u95EE\uFF0C\u8BC4\u8BBA\u533A\u95EE\uFF0C\u6211\u5C3D\u91CF\u56DE\u3002"
  ],
  group: ["\u9700\u8981\u7684\u79C1\u804A\u6211\uFF0C\u6211\u53D1\u529E\u7406\u5165\u53E3\u3002", "\u6709\u7591\u95EE\u76F4\u63A5\u5728\u7FA4\u91CC\u95EE\u3002", "\u786E\u8BA4\u8981\u529E\u7684\u6263 1\uFF0C\u6211\u4E00\u4E2A\u4E2A\u53D1\u3002"]
};
function buildXiaohongshuBody(facts, tone, index) {
  const closes = {
    seed: [
      "\u7528\u4E0B\u6765\u611F\u89C9\u662F\uFF1A\u53EA\u8981\u7528\u91CF\u5BF9\u5F97\u4E0A\uFF0C\u8FD9\u5F20\u5361\u5C31\u591F\u7528\u3002",
      "\u4E00\u4E2A\u6708\u7684\u4F53\u611F\u662F\u7A33\u5B9A\uFF0C\u6CA1\u51FA\u73B0\u6211\u62C5\u5FC3\u7684\u60C5\u51B5\u3002",
      "\u76EE\u524D\u6CA1\u6362\u56DE\u53BB\u7684\u6253\u7B97\uFF0C\u540E\u7EED\u6709\u53D8\u5316\u518D\u6765\u66F4\u65B0\u3002"
    ],
    direct: [
      "\u53C2\u6570\u5C31\u8FD9\u4E9B\uFF0C\u5269\u4E0B\u7684\u770B\u81EA\u5DF1\u7528\u91CF\u662F\u5426\u5339\u914D\u3002",
      "\u6570\u5B57\u90FD\u5728\u8FD9\u513F\u4E86\uFF0C\u5408\u9002\u5C31\u529E\uFF0C\u4E0D\u5408\u9002\u5C31\u518D\u6311\u3002",
      "\u5173\u952E\u4FE1\u606F\u5C31\u4E0A\u9762\u51E0\u6761\uFF0C\u4E0D\u7528\u518D\u770B\u522B\u7684\u957F\u6587\u3002"
    ],
    story: [
      "\u6362\u5B8C\u4E4B\u540E\u6700\u5927\u7684\u53D8\u5316\u662F\uFF0C\u6708\u5E95\u4E0D\u7528\u76EF\u7740\u6D41\u91CF\u5269\u591A\u5C11\u4E86\u3002",
      "\u8D26\u5355\u4ECE\u4E00\u767E\u591A\u964D\u5230\u8FD9\u4E2A\u6570\uFF0C\u6211\u5988\u7EC8\u4E8E\u4E0D\u5FF5\u53E8\u4E86\u3002",
      "\u8FC7\u7A0B\u6BD4\u60F3\u8C61\u4E2D\u7B80\u5355\uFF0C\u6FC0\u6D3B\u90A3\u4E00\u6B65\u82B1\u7684\u65F6\u95F4\u6700\u591A\u3002"
    ],
    value: [
      "\u540C\u6837\u5237\u89C6\u9891\uFF0C\u8FD9\u4E00\u6863\u7684\u6708\u79DF\u786E\u5B9E\u4F4E\u4E00\u622A\u3002",
      "\u628A\u6D41\u91CF\u5355\u4EF7\u644A\u5F00\u770B\uFF0C\u6BD4\u53EA\u770B\u6708\u79DF\u6E05\u695A\u5F97\u591A\u3002",
      "\u5982\u679C\u6BCF\u6708\u7528\u91CF\u5728\u8FD9\u4E2A\u533A\u95F4\uFF0C\u8FD9\u4E00\u6863\u662F\u5212\u7B97\u7684\u3002"
    ],
    qa: [
      "\u8FD8\u6709\u522B\u7684\u95EE\u9898\u53EF\u4EE5\u8BC4\u8BBA\u533A\u8865\u5145\uFF0C\u6211\u770B\u5230\u5C31\u56DE\u3002",
      "\u4E0A\u9762\u6CA1\u8986\u76D6\u5230\u7684\u60C5\u51B5\uFF0C\u8BC4\u8BBA\u533A\u8BF4\u4E0B\u4F60\u7684\u7528\u91CF\u3002",
      "\u4E0D\u540C\u5730\u533A\u7684\u653F\u7B56\u4F1A\u6709\u5DEE\u5F02\uFF0C\u4EE5\u529E\u7406\u9875\u4E3A\u51C6\u3002"
    ]
  };
  const params = paramLines(facts, "plain");
  const cautions = cautionLines(facts);
  const blocks = [];
  if (params.length > 0) {
    blocks.push(["\u{1F4CC} \u8FD9\u5F20\u5361\u7684\u53C2\u6570", ...params].join("\n"));
  }
  if (cautions.length > 0) {
    blocks.push(["\u{1F4CC} \u529E\u4E4B\u524D\u5148\u786E\u8BA4", ...cautions.map((line) => `\xB7 ${line}`)].join("\n"));
  }
  blocks.push(pickTone(closes, tone, index));
  blocks.push(COMPLIANCE_LINE);
  return blocks.join("\n\n");
}
function buildDouyinBody(facts, tone, index) {
  const visuals = {
    seed: ["\u624B\u673A\u6D41\u91CF\u8BE6\u60C5\u9875\u603C\u8138\u62CD\uFF0C\u914D\u4E00\u53E5\u5410\u69FD", "\u4E3E\u7740\u5361\u677F\u6B63\u5BF9\u955C\u5934\uFF0C\u80CC\u666F\u662F\u81EA\u5BB6\u684C\u5B50"],
    direct: ["\u624B\u6301\u5361\u7247\u6B63\u5BF9\u955C\u5934\uFF0C\u80CC\u666F\u5E72\u51C0", "\u624B\u673A\u5C4F\u5E55\u5F55\u5236\u5957\u9910\u9875\uFF0C\u8FB9\u5212\u8FB9\u5FF5"],
    story: ["\u5750\u5728\u684C\u524D\u5BF9\u7740\u955C\u5934\u8BB2\uFF0C\u522B\u526A\u592A\u788E", "\u8D70\u8DEF\u8DDF\u62CD\uFF0C\u624B\u91CC\u62FF\u7740\u8D26\u5355"],
    value: ["\u628A\u6708\u79DF\u548C\u6D41\u91CF\u5199\u5728\u7EB8\u4E0A\u4E3E\u7740", "\u624B\u673A\u8BA1\u7B97\u5668\u754C\u9762\u7279\u5199\uFF0C\u8FB9\u6309\u8FB9\u5FF5"],
    qa: ["\u5C4F\u5E55\u5F55\u5236\u8BC4\u8BBA\u533A\uFF0C\u8FB9\u5212\u8FB9\u8BB2", "\u5BF9\u7740\u955C\u5934\u4E00\u6761\u6761\u56DE\u7B54\uFF0C\u914D\u5B57\u5E55"]
  };
  const first = [
    facts.operatorLabel ? `\u8FD9\u5F20\u662F${facts.operatorLabel}\u7684\u5361` : "\u8FD9\u5F20\u5361",
    facts.fee > 0 ? `\u6708\u79DF ${facts.fee} \u5143` : "",
    facts.flow > 0 ? `${facts.flow}G \u5168\u56FD\u901A\u7528\u6D41\u91CF` : "",
    facts.voice > 0 ? `${facts.voice} \u5206\u949F\u901A\u8BDD` : ""
  ].filter(Boolean).join("\uFF0C");
  const secondParts = [];
  if (facts.firstCharge > 0) {
    secondParts.push(`\u6FC0\u6D3B\u8981\u5148\u5145 ${facts.firstCharge} \u5143\u8BDD\u8D39\uFF0C\u8FD9\u7B14\u94B1\u662F\u4F60\u7684\u8BDD\u8D39\uFF0C\u4E0D\u662F\u989D\u5916\u6536\u8D39`);
  }
  if (facts.firstMonth) secondParts.push(`\u9996\u6708${facts.firstMonth}`);
  if (facts.contractMonths > 0) secondParts.push(`\u5408\u7EA6\u671F ${facts.contractMonths} \u4E2A\u6708`);
  const second = secondParts.length > 0 ? `${secondParts.join("\uFF0C")}\u3002` : "";
  const thirdParts = [];
  if (facts.shipRegion) thirdParts.push(`\u53D1\u8D27${facts.shipRegion}`);
  if (facts.ageRange) thirdParts.push(`\u529E\u5361\u5E74\u9F84 ${facts.ageRange}`);
  if (facts.activateType) thirdParts.push(`\u6FC0\u6D3B\u65B9\u5F0F\u662F${facts.activateType}`);
  const third = thirdParts.length > 0 ? `${thirdParts.join("\uFF0C")}\u3002\u53C2\u6570\u4EE5\u529E\u7406\u9875\u4E3A\u51C6\u3002` : "\u53C2\u6570\u4EE5\u8FD0\u8425\u5546\u529E\u7406\u9875\u516C\u793A\u4E3A\u51C6\uFF0C\u522B\u542C\u4E8C\u624B\u8F6C\u8FF0\u3002";
  const lines = [
    `\u30100-3\u79D2\u3011\u753B\u9762\uFF1A${pickTone(visuals, tone, index)}\uFF08\u8FD9\u53E5\u5C31\u662F\u94A9\u5B50\uFF0C\u522B\u518D\u53E6\u5199\u5F00\u573A\u767D\uFF09`,
    `\u30103-10\u79D2\u3011\u53E3\u64AD\uFF1A${first}\u3002`,
    second ? `\u301010-20\u79D2\u3011\u53E3\u64AD\uFF1A${second}` : "",
    `\u301020-30\u79D2\u3011\u53E3\u64AD\uFF1A${third}`,
    "",
    "\u{1F4F7} \u62CD\u6444\u5EFA\u8BAE\uFF1A\u524D 3 \u79D2\u53EA\u7ED9\u7ED3\u8BBA\uFF0C\u53C2\u6570\u653E 10 \u79D2\u4EE5\u540E\uFF1B\u5B57\u5E55\u7528\u5927\u5B57\uFF0C\u522B\u76D6\u4F4F\u4EBA\u8138"
  ].filter((line) => line !== "");
  return lines.join("\n");
}
function buildKuaishouBody(facts, tone, index) {
  const closes = {
    seed: ["\u7528\u4E86\u8FD9\u4E9B\u5929\uFF0C\u6CA1\u51FA\u8FC7\u5C94\u5B50\u3002", "\u771F\u5B9E\u611F\u53D7\u5C31\u8FD9\u4E9B\uFF0C\u4E0D\u5439\u3002"],
    direct: ["\u5C31\u8FD9\u4E9B\uFF0C\u5408\u9002\u5C31\u529E\u3002", "\u53C2\u6570\u6446\u8FD9\u513F\u4E86\uFF0C\u81EA\u5DF1\u5224\u65AD\u3002"],
    story: ["\u8FD9\u6B21\u603B\u7B97\u6CA1\u88AB\u5957\u8DEF\u3002", "\u529E\u4E4B\u524D\u95EE\u6E05\u695A\uFF0C\u6BD4\u5565\u90FD\u5F3A\u3002"],
    value: ["\u8FD9\u4E48\u7B97\u4E0B\u6765\u662F\u5212\u7B97\u7684\u3002", "\u8D26\u7B97\u660E\u767D\u4E86\u518D\u51B3\u5B9A\u3002"],
    qa: ["\u8FD8\u6709\u4E0D\u660E\u767D\u7684\u76F4\u63A5\u95EE\u3002", "\u95EE\u6E05\u695A\u518D\u529E\uFF0C\u4E0D\u7740\u6025\u3002"]
  };
  const params = paramLines(facts, "kv");
  const blocks = [];
  if (params.length > 0) blocks.push(params.join("\n"));
  if (facts.shipRegion && !/不发|不支持/.test(facts.shipRegion)) {
    blocks.push(`\u53D1\u8D27\u8FD9\u5757\uFF1A${facts.shipRegion}\uFF0C\u522B\u7684\u5730\u65B9\u6682\u65F6\u53D1\u4E0D\u4E86\u3002`);
  }
  if (facts.firstCharge > 0) {
    blocks.push(`\u9996\u5145 ${facts.firstCharge} \u5143\u662F\u8BDD\u8D39\uFF0C\u4F1A\u5230\u8D26\uFF0C\u4E0D\u662F\u767D\u4EA4\u3002`);
  }
  blocks.push(pickTone(closes, tone, index));
  return blocks.join("\n\n");
}
function buildMomentsBody(facts) {
  const lines = [];
  const core = [];
  if (facts.fee > 0) core.push(`\u6708\u79DF ${facts.fee} \u5143`);
  if (facts.flow > 0) core.push(`${facts.flow}G \u901A\u7528\u6D41\u91CF`);
  if (facts.voice > 0) core.push(`${facts.voice} \u5206\u949F\u901A\u8BDD`);
  if (core.length > 0) lines.push(core.join("\uFF0C"));
  if (facts.firstCharge > 0) lines.push(`\u6FC0\u6D3B\u5148\u5145 ${facts.firstCharge} \u5143\u8BDD\u8D39\uFF0C\u94B1\u662F\u4F60\u7684\u8BDD\u8D39\u3002`);
  if (facts.shipRegion) lines.push(`\u53D1\u8D27\uFF1A${facts.shipRegion}\u3002`);
  if (facts.contractMonths > 0) lines.push(`\u5408\u7EA6\u671F ${facts.contractMonths} \u4E2A\u6708\uFF0C\u529E\u4E4B\u524D\u770B\u6E05\u695A\u3002`);
  if (facts.ageRange) lines.push(`\u529E\u5361\u5E74\u9F84 ${facts.ageRange}\u3002`);
  return lines.slice(0, 5).join("\n");
}
function buildChannelsBody(facts, tone, index) {
  const opens = {
    direct: ["\u4ECA\u5929\u628A\u8FD9\u5F20\u5361\u8BB2\u6E05\u695A\u3002", "\u60F3\u6362\u5957\u9910\u7684\uFF0C\u542C\u6211\u8BF4\u5B8C\u3002"],
    story: ["\u6709\u4F4D\u516D\u5341\u591A\u5C81\u7684\u7C89\u4E1D\u95EE\u6211\uFF0C\u6D41\u91CF\u5361\u5230\u5E95\u600E\u4E48\u9009\u3002", "\u6211\u90BB\u5C45\u4E0A\u4E2A\u6708\u6D41\u91CF\u8D85\u4E86\uFF0C\u6263\u4E86\u516D\u5341\u591A\u5757\u3002"],
    value: ["\u8FD9\u5F20\u5361\u597D\u5728\u54EA\uFF0C\u6211\u4E00\u6761\u6761\u8BF4\u3002", "\u94B1\u82B1\u5728\u54EA\uFF0C\u5F97\u7B97\u660E\u767D\u3002"],
    qa: ["\u5927\u5BB6\u95EE\u5F97\u6700\u591A\u7684\u51E0\u4E2A\u95EE\u9898\uFF0C\u4ECA\u5929\u7EDF\u4E00\u56DE\u7B54\u3002", "\u5173\u4E8E\u529E\u5361\uFF0C\u5148\u628A\u8FD9\u51E0\u4E2A\u7591\u95EE\u89E3\u51B3\u3002"]
  };
  const blocks = [pickTone(opens, tone, index)];
  const params = paramLines(facts, "kv");
  if (params.length > 0) blocks.push(params.join("\n"));
  const notes = [];
  if (facts.firstCharge > 0) {
    notes.push(`\u6FC0\u6D3B\u65F6\u8981\u5148\u5145 ${facts.firstCharge} \u5143\uFF0C\u8FD9\u7B14\u94B1\u662F\u8BDD\u8D39\uFF0C\u4F1A\u5230\u8D26\u3002`);
  }
  if (facts.contractMonths > 0) {
    notes.push(`\u5408\u7EA6\u671F\u662F ${facts.contractMonths} \u4E2A\u6708\uFF0C\u4E2D\u9014\u6CE8\u9500\u6309\u8FD0\u8425\u5546\u89C4\u5B9A\u5904\u7406\u3002`);
  }
  if (facts.shipRegion) notes.push(`\u53D1\u8D27\u8303\u56F4\u662F${facts.shipRegion}\uFF0C\u5176\u4ED6\u5730\u533A\u529E\u4E0D\u4E86\u3002`);
  if (facts.ageRange) notes.push(`\u529E\u5361\u5E74\u9F84 ${facts.ageRange}\u3002`);
  if (notes.length > 0) blocks.push(notes.join("\n"));
  blocks.push("\u8D44\u8D39\u4EE5\u8FD0\u8425\u5546\u5B98\u65B9\u9875\u9762\u516C\u793A\u4E3A\u51C6\uFF0C\u529E\u4E4B\u524D\u81EA\u5DF1\u518D\u6838\u5BF9\u4E00\u904D\u3002");
  return blocks.join("\n\n");
}
function buildWeiboBody(facts, tone, index) {
  const opens = {
    direct: ["\u4E00\u6761\u8BF4\u5B8C\u8FD9\u5F20\u5361\u3002", "\u53C2\u6570\u5982\u4E0B\uFF0C\u81EA\u5DF1\u770B\u3002"],
    value: ["\u540C\u4EF7\u4F4D\u6BD4\u4E86\u4E00\u5708\uFF0C\u8BF4\u4E0B\u7ED3\u8BBA\u3002", "\u628A\u8D26\u7B97\u5F00\uFF0C\u6BD4\u542C\u4EBA\u8BF4\u5212\u7B97\u3002"],
    qa: ["\u95EE\u7684\u4EBA\u591A\uFF0C\u7EDF\u4E00\u56DE\u3002", "\u8FD9\u51E0\u4E2A\u95EE\u9898\uFF0C\u5148\u8BF4\u7ED3\u8BBA\u3002"]
  };
  const blocks = [pickTone(opens, tone, index)];
  const params = paramLines(facts, "kv");
  if (params.length > 0) blocks.push(params.join("\n"));
  const tail = [];
  if (facts.firstCharge > 0) tail.push(`\u9996\u5145 ${facts.firstCharge} \u5143\u662F\u8BDD\u8D39\uFF0C\u4F1A\u5230\u8D26`);
  if (facts.shipRegion) tail.push(`\u53D1\u8D27${facts.shipRegion}`);
  if (facts.contractMonths > 0) tail.push(`\u5408\u7EA6\u671F ${facts.contractMonths} \u4E2A\u6708`);
  if (tail.length > 0) blocks.push(`${tail.join("\uFF0C")}\u3002`);
  blocks.push("\u8D44\u8D39\u4EE5\u8FD0\u8425\u5546\u5B98\u65B9\u9875\u9762\u4E3A\u51C6\u3002");
  return blocks.join("\n\n");
}
function buildBilibiliBody(facts, tone, index) {
  const opens = {
    direct: ["\u5148\u8BF4\u7ED3\u8BBA\uFF0C\u518D\u8BF4\u7EC6\u8282\u3002", "\u8FD9\u671F\u4E0D\u5E9F\u8BDD\uFF0C\u76F4\u63A5\u62C6\u53C2\u6570\u3002"],
    value: ["\u8FD9\u671F\u505A\u4E00\u6B21\u6A2A\u5411\u5BF9\u6BD4\u3002", "\u628A\u6BCF G \u5355\u4EF7\u7B97\u6E05\u695A\uFF0C\u6BD4\u4EC0\u4E48\u90FD\u76F4\u89C2\u3002"],
    qa: ["\u8FD9\u671F\u56DE\u7B54\u5F39\u5E55\u91CC\u95EE\u5F97\u6700\u591A\u7684\u51E0\u4E2A\u95EE\u9898\u3002", "\u5173\u4E8E\u6D41\u91CF\u5361\uFF0C\u5148\u628A\u5E38\u89C1\u8BEF\u89E3\u8BB2\u6E05\u695A\u3002"],
    story: ["\u8FD9\u671F\u4E0D\u8BB2\u53C2\u6570\uFF0C\u8BB2\u8E29\u8FC7\u7684\u5751\u3002", "\u8BB0\u5F55\u4E00\u6B21\u5B8C\u6574\u7684\u6362\u5361\u8FC7\u7A0B\u3002"]
  };
  const blocks = [pickTone(opens, tone, index)];
  const params = paramLines(facts, "kv");
  if (params.length > 0) {
    blocks.push(["\u3010\u53C2\u6570\u3011", ...params].join("\n"));
  }
  const cautions = cautionLines(facts);
  if (cautions.length > 0) {
    const numbered = cautions.map((line, i) => `${i + 1}. ${line}`);
    blocks.push(["\u3010\u8981\u6CE8\u610F\u7684\u5730\u65B9\u3011", ...numbered].join("\n"));
  }
  const analysis = [];
  if (facts.fee > 0 && facts.flow > 0) {
    analysis.push(
      `\u6309 ${facts.fee} \u5143 / ${facts.flow}G \u6298\u7B97\uFF0C\u6BCF G \u5927\u6982 ${perGJiao(facts)} \u6BDB\uFF0C\u8FD9\u4E2A\u4EF7\u4F4D\u4E3B\u8981\u770B\u901A\u7528\u6D41\u91CF\u7ED9\u5F97\u591F\u4E0D\u591F\uFF0C\u5B9A\u5411\u6D41\u91CF\u518D\u591A\u4E5F\u8981\u5355\u72EC\u7B97\u3002`
    );
  }
  if (facts.contractMonths > 0) {
    analysis.push(
      `\u5408\u7EA6\u671F ${facts.contractMonths} \u4E2A\u6708\u610F\u5473\u7740\u4E2D\u9014\u6CE8\u9500\u8981\u6309\u8FD0\u8425\u5546\u89C4\u5219\u5904\u7406\uFF0C\u6253\u7B97\u77ED\u671F\u7528\u7684\u4EBA\u8981\u63D0\u524D\u60F3\u6E05\u695A\u3002`
    );
  }
  if (facts.firstCharge > 0) {
    analysis.push(
      `\u9996\u5145 ${facts.firstCharge} \u5143\u672C\u8D28\u662F\u9884\u5B58\u8BDD\u8D39\uFF0C\u4F1A\u5206\u6708\u6216\u4E00\u6B21\u6027\u5230\u8D26\uFF0C\u4E0D\u7B97\u5728\u6708\u79DF\u4E4B\u5916\u591A\u6536\u4E00\u7B14\u3002`
    );
  }
  if (analysis.length > 0) blocks.push(["\u3010\u600E\u4E48\u770B\u8FD9\u5F20\u5361\u3011", ...analysis].join("\n"));
  blocks.push(COMPLIANCE_LINE);
  return blocks.join("\n\n");
}
function buildGroupBody(facts, tone, index) {
  const heads = {
    direct: ["\u3010\u529E\u5361\u4FE1\u606F\u3011", "\u3010\u5957\u9910\u53C2\u6570\u3011"],
    value: ["\u3010\u6027\u4EF7\u6BD4\u53C2\u8003\u3011", "\u3010\u7B97\u8D26\u3011"],
    qa: ["\u3010\u5E38\u89C1\u95EE\u9898\u3011", "\u3010\u7EDF\u4E00\u56DE\u590D\u3011"]
  };
  const params = paramLines(facts, "kv");
  const blocks = [pickTone(heads, tone, index)];
  if (params.length > 0) blocks.push(params.join("\n"));
  const notes = [];
  if (facts.firstCharge > 0) notes.push(`\u9996\u5145 ${facts.firstCharge} \u5143\u662F\u8BDD\u8D39\uFF0C\u4F1A\u5230\u8D26`);
  if (facts.shipRegion) notes.push(`\u53D1\u8D27\u8303\u56F4\uFF1A${facts.shipRegion}`);
  if (facts.contractMonths > 0) notes.push(`\u5408\u7EA6\u671F ${facts.contractMonths} \u4E2A\u6708`);
  if (facts.activateType) notes.push(`\u6FC0\u6D3B\u65B9\u5F0F\uFF1A${facts.activateType}`);
  if (notes.length > 0) blocks.push(`${notes.join("\uFF1B")}\u3002`);
  return blocks.join("\n\n");
}
function buildBody(facts, platform, tone, index) {
  switch (platform) {
    case "xiaohongshu":
      return buildXiaohongshuBody(facts, tone, index);
    case "douyin":
      return buildDouyinBody(facts, tone, index);
    case "kuaishou":
      return buildKuaishouBody(facts, tone, index);
    case "moments":
      return buildMomentsBody(facts);
    case "channels":
      return buildChannelsBody(facts, tone, index);
    case "weibo":
      return buildWeiboBody(facts, tone, index);
    case "bilibili":
      return buildBilibiliBody(facts, tone, index);
    case "group":
    default:
      return buildGroupBody(facts, tone, index);
  }
}
var PLATFORM_NOTES = {
  xiaohongshu: "\u5C01\u9762\u7528\u5957\u9910\u622A\u56FE\u6216\u8D26\u5355\u5B9E\u62CD\uFF0C\u522B\u7528\u5927\u5B57\u62A5\uFF0C\u5BB9\u6613\u88AB\u5224\u8425\u9500\u53F7",
  douyin: "\u524D 3 \u79D2\u53EA\u7ED9\u7ED3\u8BBA\uFF0C\u53C2\u6570\u653E 10 \u79D2\u4EE5\u540E\uFF0C\u5B8C\u64AD\u7387\u66F4\u9AD8",
  kuaishou: "\u53E3\u64AD\u7528\u65B9\u8A00\u66F4\u81EA\u7136\uFF0C\u522B\u7AEF\u7740\u5FF5\u7A3F",
  moments: "\u4E00\u5929\u6700\u591A\u53D1\u4E00\u6761\uFF0C\u914D\u56FE\u6BD4\u6587\u5B57\u91CD\u8981",
  channels: "\u8BED\u901F\u653E\u6162\uFF0C\u628A\u300C\u9996\u5145\u300D\u300C\u5408\u7EA6\u671F\u300D\u5FF5\u6E05\u695A",
  weibo: "\u8BDD\u9898\u8BCD\u653E\u6B63\u6587\u672B\u5C3E\uFF0C\u522B\u5806\u5728\u5F00\u5934",
  bilibili: "\u7B80\u4ECB\u91CC\u653E\u53C2\u6570\u8868\u548C\u529E\u7406\u5165\u53E3\uFF0C\u6B63\u6587\u522B\u8D34\u957F\u94FE\u63A5",
  group: "\u540C\u4E00\u53E5\u8BDD\u522B\u5728\u591A\u4E2A\u7FA4\u590D\u5236\u7C98\u8D34\uFF0C\u5BB9\u6613\u88AB\u4E3E\u62A5"
};
var TONE_NOTES = {
  seed: "\u4EE5\u4E2A\u4EBA\u4F53\u9A8C\u53E3\u543B\u53D1\uFF0C\u522B\u7528\u300C\u5B98\u65B9\u300D\u81EA\u5C45",
  direct: "\u53C2\u6570\u4F18\u5148\uFF0C\u5C11\u52A0\u5F62\u5BB9\u8BCD",
  story: "\u6545\u4E8B\u91CC\u7684\u7EC6\u8282\u8981\u771F\u5B9E\uFF0C\u7F16\u4E86\u4F1A\u88AB\u8BC4\u8BBA\u533A\u62C6\u7A7F",
  value: "\u5BF9\u6BD4\u53EA\u8DDF\u516C\u5F00\u4EF7\u683C\u6BD4\uFF0C\u522B\u8BF4\u300C\u5168\u7F51\u6700\u4F4E\u300D",
  qa: "\u95EE\u9898\u6309\u771F\u5B9E\u79C1\u4FE1\u987A\u5E8F\u6392\uFF0C\u522B\u81EA\u95EE\u81EA\u7B54\u5F97\u592A\u5047"
};
function buildNotes(facts, spec, platform, tone) {
  const notes = [];
  if (spec.monthlyFee <= 0) {
    notes.push("\u672A\u89E3\u6790\u5230\u6708\u79DF\uFF0C\u8FD9\u6761\u6587\u6848\u91CC\u6CA1\u6709\u4EF7\u683C\u6570\u5B57\uFF0C\u786E\u8BA4\u540E\u518D\u53D1");
  }
  if (spec.flowGb <= 0) {
    notes.push("\u672A\u89E3\u6790\u5230\u901A\u7528\u6D41\u91CF\uFF0C\u6B63\u6587\u6CA1\u5199\u6D41\u91CF\u989D\u5EA6\uFF0C\u522B\u51ED\u5370\u8C61\u8865\u6570\u5B57");
  }
  if (facts.shipRegion) {
    notes.push(`\u53D1\u8D27\u8303\u56F4\u662F\u300C${facts.shipRegion}\u300D\uFF0C\u522B\u5199\u6210\u5168\u56FD\u53D1\u8D27`);
  }
  if (facts.firstCharge > 0) {
    notes.push(`\u9996\u5145 ${facts.firstCharge} \u5143\u5FC5\u987B\u5199\u8FDB\u6B63\u6587\uFF0C\u53EA\u5199\u6708\u79DF\u5BB9\u6613\u88AB\u5224\u4F4E\u4EF7\u5305\u88C5`);
  }
  if (!facts.duration && facts.fee > 0) {
    notes.push("\u4F18\u60E0\u671F\u672A\u6807\u6CE8\uFF0C\u6B63\u6587\u4E0D\u8981\u5199\u300C\u957F\u671F\u300D\uFF0C\u5EFA\u8BAE\u8865\u4E00\u53E5\u5230\u671F\u540E\u6309\u8FD0\u8425\u5546\u516C\u793A\u8D44\u8D39\u6267\u884C");
  }
  if (facts.contractMonths > 0) {
    notes.push(`\u5408\u7EA6\u671F ${facts.contractMonths} \u4E2A\u6708\uFF0C\u8BC4\u8BBA\u533A\u95EE\u5230\u8981\u5982\u5B9E\u8BF4`);
  }
  notes.push(PLATFORM_NOTES[platform]);
  notes.push(TONE_NOTES[tone]);
  return notes.slice(0, 4);
}
function generateVariants(spec, platform, tone, opts = {}) {
  const meta = getPlatform(platform);
  const finalTone = meta.tones.includes(tone) ? tone : meta.tones[0];
  const facts = buildFacts(spec);
  const values = buildValues(facts);
  const rawCount = Number(opts.count ?? 3);
  const count = Math.min(
    MAX_COUNT,
    Math.max(MIN_COUNT, Number.isFinite(rawCount) ? Math.floor(rawCount) : 3)
  );
  const brand = (opts.brand ?? DEFAULT_BRAND).trim() || DEFAULT_BRAND;
  const link = (opts.link ?? "").trim();
  const seed = Number.isFinite(opts.seed) ? Math.floor(opts.seed) : 0;
  const offset = Math.abs(seed) % 997;
  const tagList = buildTags(spec, platform);
  const hookPool = (HOOK_BANK[platform]?.[finalTone] ?? []).map((template) => renderTemplate(template, values)).filter((hook) => Boolean(hook));
  const fallbackPool = FALLBACK_HOOKS.map((template) => renderTemplate(template, values)).filter(
    (hook) => Boolean(hook)
  );
  const hooks = hookPool.length > 0 ? hookPool : fallbackPool;
  const ctaPool = CTA_BANK[platform] ?? CTA_BANK.xiaohongshu;
  return Array.from({ length: count }, (_unused, index) => {
    const hook = hooks.length > 0 ? pick(hooks, offset + index) : `\u5148\u8BF4\u7ED3\u8BBA\uFF1A${coreNumbers(facts)}\u3002`;
    const body = buildBody(facts, platform, finalTone, offset + index);
    const baseCta = pick(ctaPool, offset + index);
    const cta = link ? `${baseCta}
${link}` : baseCta;
    const tags = [...tagList];
    const signature = getBrandLine(brand);
    const full = [hook, body, cta, signature, tags.join(" ")].filter((part) => part !== "").join("\n\n");
    return {
      id: `${platform}-${finalTone}-${index}`,
      platform,
      tone: finalTone,
      hook,
      body,
      cta,
      tags,
      notes: buildNotes(facts, spec, platform, finalTone),
      full
    };
  });
}
function getBrandLine(brand) {
  const name = (brand ?? DEFAULT_BRAND).trim() || DEFAULT_BRAND;
  return `\u2014\u2014 ${name}`;
}

// src/lib/studio/poster.ts
var import_qrcode = __toESM(require_browser(), 1);
var FONT_STACK = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC",sans-serif';
var CHIP_LIMIT = 4;
var QR_PIXEL_SIZE = 512;
var QR_CACHE_LIMIT = 8;
var FIT_FACTORS = [1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72];
var NOOP_METHODS = /* @__PURE__ */ new Set([
  "beginPath",
  "closePath",
  "moveTo",
  "lineTo",
  "arc",
  "arcTo",
  "ellipse",
  "rect",
  "bezierCurveTo",
  "quadraticCurveTo",
  "fill",
  "stroke",
  "fillRect",
  "strokeRect",
  "clearRect",
  "fillText",
  "strokeText",
  "drawImage",
  "save",
  "restore",
  "translate",
  "rotate",
  "scale",
  "clip",
  "setLineDash",
  "setTransform",
  "resetTransform"
]);
var qrCache = /* @__PURE__ */ new Map();
function parseHex(hex) {
  const raw = hex.replace("#", "").trim();
  const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
  if (full.length !== 6) return [0, 0, 0];
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16)
  ];
}
function withAlpha(hex, alpha) {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}
function relativeLuminance(hex) {
  const channels = parseHex(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}
function mixColor(from, to, t) {
  const a = parseHex(from);
  const b = parseHex(to);
  const ratio = Math.max(0, Math.min(1, t));
  const channel = (index) => Math.round(a[index] + (b[index] - a[index]) * ratio).toString(16).padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}
function backgroundBase(theme) {
  return mixColor(theme.bg, theme.bgAlt, 0.5);
}
function readableAccent(accent, background, minRatio = 3) {
  if (contrastRatio(accent, background) >= minRatio) return accent;
  const isLightBackground = relativeLuminance(background) > 0.35;
  const target = isLightBackground ? "#000000" : "#FFFFFF";
  for (let step = 1; step <= 10; step += 1) {
    const candidate = mixColor(accent, target, step / 10);
    if (contrastRatio(candidate, background) >= minRatio) return candidate;
  }
  return target;
}
function roundRectPath(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
function fillRoundRect(ctx, x, y, width, height, radius, fill) {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}
function strokeRoundRect(ctx, x, y, width, height, radius, stroke, lineWidth = 1) {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}
function fontOf(size, weight = 400) {
  const safeSize = Math.max(1, Math.round(size * 100) / 100);
  return `${weight} ${safeSize}px ${FONT_STACK}`;
}
var TOKEN_RE = /[A-Za-z0-9][A-Za-z0-9.,+\-/]*|\s+|[\s\S]/gu;
function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  const paragraphs = text.split("\n");
  for (const paragraph of paragraphs) {
    const tokens = paragraph.match(TOKEN_RE) ?? [];
    let current = "";
    for (const token of tokens) {
      if (/^\s+$/.test(token) && current === "") continue;
      const candidate = current + token;
      if (current === "" || ctx.measureText(candidate.trimEnd()).width <= maxWidth) {
        current = candidate;
        continue;
      }
      lines.push(current.trimEnd());
      current = token.trimStart();
    }
    lines.push(current.trimEnd());
  }
  const cleaned = lines.filter((line) => line !== "");
  return cleaned.length > 0 ? cleaned : [""];
}
function ellipsize(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  const chars = Array.from(text);
  while (chars.length > 0) {
    chars.pop();
    const candidate = `${chars.join("")}\u2026`;
    if (ctx.measureText(candidate).width <= maxWidth) return candidate;
  }
  return "\u2026";
}
function fitText(ctx, text, options) {
  const { maxWidth, maxLines, size, weight = 400 } = options;
  const lineHeightRatio = options.lineHeight ?? 1.3;
  const minSize = options.minSize ?? size * 0.7;
  const trimmed = text.trim();
  if (!trimmed) {
    return { lines: [], size, lineHeight: size * lineHeightRatio, height: 0 };
  }
  for (let current = size; current >= minSize; current -= 1) {
    ctx.font = fontOf(current, weight);
    const lines2 = wrapLines(ctx, trimmed, maxWidth);
    if (lines2.length <= maxLines) {
      const lineHeight = current * lineHeightRatio;
      return { lines: lines2, size: current, lineHeight, height: lines2.length * lineHeight };
    }
  }
  ctx.font = fontOf(minSize, weight);
  const lines = wrapLines(ctx, trimmed, maxWidth);
  const kept = lines.slice(0, maxLines);
  kept[kept.length - 1] = ellipsize(ctx, kept[kept.length - 1], maxWidth);
  return {
    lines: kept,
    size: minSize,
    lineHeight: minSize * lineHeightRatio,
    height: kept.length * minSize * lineHeightRatio
  };
}
function drawFitted(ctx, fitted, x, top, color, weight = 400) {
  if (fitted.lines.length === 0) return;
  ctx.font = fontOf(fitted.size, weight);
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  fitted.lines.forEach((line, index) => {
    ctx.fillText(line, x, top + index * fitted.lineHeight);
  });
}
function operatorShortLabel(spec) {
  return OPERATOR_META[spec.operator]?.shortLabel ?? OPERATOR_META.unknown.shortLabel;
}
function normalizeScale(scale) {
  if (!Number.isFinite(scale) || scale <= 0) return 2;
  return Math.min(4, Math.max(1, scale));
}
function sanitizeFilename(name) {
  const cleaned = name.replace(/[:\\/*?"<>|]/g, "-").replace(/\s+/g, "").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "poster";
}
function buildFilename(spec, sizeId) {
  const parts = [operatorShortLabel(spec)];
  if (spec.flowGb > 0) parts.push(`${spec.flowGb}G`);
  if (spec.monthlyFee > 0) parts.push(`${spec.monthlyFee}\u5143`);
  parts.push(sizeId.replace(/:/g, "x"));
  return sanitizeFilename(parts.join("-"));
}
function buildSpecCells(spec) {
  const cells = [];
  if (spec.flowGb > 0) {
    cells.push({ value: `${spec.flowGb}G`, label: "\u5168\u56FD\u901A\u7528\u6D41\u91CF", highlight: true });
  }
  if (spec.voiceMinutes > 0) {
    cells.push({ value: `${spec.voiceMinutes}\u5206\u949F`, label: "\u56FD\u5185\u901A\u8BDD", highlight: false });
  }
  const contract = spec.contractText.trim() || (spec.contractMonths > 0 ? `${spec.contractMonths}\u4E2A\u6708` : "");
  if (contract) {
    cells.push({ value: contract, label: "\u5408\u7EA6\u671F", highlight: false });
  }
  return cells;
}
function chargeTextOf(spec) {
  return spec.firstCharge > 0 ? `\u9996\u5145${spec.firstCharge}\u5143` : "\u65E0\u9996\u5145\u95E8\u69DB";
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("[poster] \u4E8C\u7EF4\u7801\u56FE\u7247\u89E3\u7801\u5931\u8D25"));
    image.src = src;
  });
}
async function loadQrImage(url) {
  const text = url.trim();
  if (!text) return null;
  try {
    let dataUrl = qrCache.get(text);
    if (!dataUrl) {
      dataUrl = await import_qrcode.default.toDataURL(text, { margin: 1, width: QR_PIXEL_SIZE });
      if (qrCache.size >= QR_CACHE_LIMIT) {
        const oldest = qrCache.keys().next();
        if (!oldest.done) qrCache.delete(oldest.value);
      }
      qrCache.set(text, dataUrl);
    }
    return await loadImage(dataUrl);
  } catch (error) {
    console.warn("[poster] \u4E8C\u7EF4\u7801\u751F\u6210\u5931\u8D25\uFF0C\u5DF2\u8DF3\u8FC7\uFF1A", error);
    return null;
  }
}
function createMeasureContext(target) {
  const noop = () => void 0;
  return new Proxy(target, {
    get(object, property) {
      if (property === "measureText") {
        return (text) => object.measureText(text);
      }
      if (typeof property === "string" && NOOP_METHODS.has(property)) return noop;
      const value = Reflect.get(object, property, object);
      return typeof value === "function" ? value.bind(object) : value;
    },
    set(object, property, value) {
      return Reflect.set(object, property, value, object);
    }
  });
}
function measureWith(pc, run) {
  const real = pc.ctx;
  pc.ctx = pc.measureCtx;
  try {
    return run();
  } finally {
    pc.ctx = real;
  }
}
function drawSections(sections, top, bottom, minGap) {
  const contentHeight = sections.reduce((sum, section) => sum + section.height, 0);
  const gapCount = Math.max(sections.length - 1, 0);
  const free = bottom - top - contentHeight - minGap * gapCount;
  const weightSum = sections.reduce((sum, section) => sum + section.weight, 0) || 1;
  let cursor = top;
  sections.forEach((section, index) => {
    section.draw(cursor);
    cursor += section.height;
    if (index < sections.length - 1) {
      const extra = free > 0 ? free * section.weight / weightSum : 0;
      cursor += minGap + extra;
    }
  });
}
function requiredHeight(sections, minGap) {
  const contentHeight = sections.reduce((sum, section) => sum + section.height, 0);
  return contentHeight + minGap * Math.max(sections.length - 1, 0);
}
function paintBackground(pc) {
  const { ctx, width, height, theme } = pc;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, theme.bg);
  gradient.addColorStop(1, theme.bgAlt);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  const shortSide = Math.min(width, height);
  ctx.beginPath();
  ctx.arc(width * 0.94, height * 0.06, shortSide * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = withAlpha(theme.accent, 0.1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, height * 0.8);
  ctx.lineTo(width, height * 0.63);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = withAlpha(theme.fg, 0.045);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width * 0.1, height * 0.9, shortSide * 0.3, 0, Math.PI * 2);
  ctx.strokeStyle = withAlpha(theme.line, 0.28);
  ctx.lineWidth = Math.max(1, shortSide * 4e-3);
  ctx.stroke();
}
function drawBrandBar(pc, x, top, width, unit, factor) {
  const { ctx, theme, spec } = pc;
  const height = 26 * unit * factor;
  const fontSize = 13 * unit * factor;
  const padX = 11 * unit * factor;
  ctx.font = fontOf(fontSize, 600);
  const label = operatorShortLabel(spec);
  const pillWidth = ctx.measureText(label).width + padX * 2;
  const pillHeight = fontSize * 1.9;
  const pillY = top + (height - pillHeight) / 2;
  fillRoundRect(ctx, x, pillY, pillWidth, pillHeight, pillHeight / 2, withAlpha(theme.fg, 0.16));
  ctx.fillStyle = theme.fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + pillWidth / 2, pillY + pillHeight / 2 + fontSize * 0.04);
  ctx.font = fontOf(fontSize * 1.05, 500);
  ctx.fillStyle = theme.fgMuted;
  ctx.textAlign = "right";
  ctx.fillText("\u53F7\u5361\u4E4B\u5BB6", x + width, top + height / 2 + fontSize * 0.04);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  return height;
}
function layoutPrice(ctx, pc, x, width, unit, factor, compact) {
  const numberSize = (compact ? 68 : 96) * unit * factor;
  const markSize = numberSize * 0.3;
  const unitSize = numberSize * 0.24;
  const accent = readableAccent(pc.theme.accent, backgroundBase(pc.theme), 4.5);
  ctx.font = fontOf(numberSize, 800);
  const feeWidth = ctx.measureText(`${pc.spec.monthlyFee}`).width;
  ctx.font = fontOf(markSize, 700);
  const markWidth = ctx.measureText("\xA5").width;
  ctx.font = fontOf(unitSize, 500);
  const perMonthWidth = ctx.measureText("/\u6708").width;
  const blockHeight = numberSize * 1.05;
  const priceWidth = markWidth + feeWidth + perMonthWidth + markSize * 0.4;
  const chargeFontSize = 13 * unit * factor;
  const chargeText = chargeTextOf(pc.spec);
  ctx.font = fontOf(chargeFontSize, 600);
  const chargeWidth = ctx.measureText(chargeText).width + chargeFontSize * 1.6;
  const chargeHeight = chargeFontSize * 1.9;
  const chargeX = x + priceWidth + chargeFontSize * 0.9;
  const chargeBelow = chargeX + chargeWidth > x + width;
  return {
    height: chargeBelow ? blockHeight + chargeHeight + 6 * unit : blockHeight,
    numberSize,
    markSize,
    unitSize,
    feeWidth,
    markWidth,
    accent,
    charge: {
      text: chargeText,
      fontSize: chargeFontSize,
      width: chargeWidth,
      height: chargeHeight,
      x: chargeBelow ? x : chargeX,
      y: chargeBelow ? blockHeight + 6 * unit : blockHeight - chargeHeight
    }
  };
}
function drawPriceBlock(pc, x, top, width, unit, factor, compact = false) {
  if (pc.spec.monthlyFee <= 0) return 0;
  const { ctx, theme } = pc;
  const layout = layoutPrice(ctx, pc, x, width, unit, factor, compact);
  const baseline = top + layout.numberSize * 0.82;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = fontOf(layout.markSize, 700);
  ctx.fillStyle = layout.accent;
  ctx.fillText("\xA5", x, baseline - layout.numberSize * 0.06);
  ctx.font = fontOf(layout.numberSize, 800);
  ctx.fillText(`${pc.spec.monthlyFee}`, x + layout.markWidth + layout.markSize * 0.08, baseline);
  ctx.font = fontOf(layout.unitSize, 500);
  ctx.fillStyle = withAlpha(theme.fg, 0.72);
  ctx.fillText("/\u6708", x + layout.markWidth + layout.feeWidth + layout.markSize * 0.24, baseline);
  const charge = layout.charge;
  const chargeY = top + charge.y;
  fillRoundRect(
    ctx,
    charge.x,
    chargeY,
    charge.width,
    charge.height,
    charge.height / 2,
    theme.accent
  );
  ctx.font = fontOf(charge.fontSize, 700);
  ctx.fillStyle = theme.accentFg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(charge.text, charge.x + charge.width / 2, chargeY + charge.height / 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  return layout.height;
}
function drawSpecGrid(pc, x, top, width, unit, factor, compact = false) {
  const { ctx, theme, spec } = pc;
  const cells = buildSpecCells(spec);
  if (cells.length === 0) return 0;
  const height = (compact ? 62 : 74) * unit * factor;
  fillRoundRect(ctx, x, top, width, height, 16 * unit * factor, withAlpha(theme.card, 0.62));
  const valueSize = (compact ? 26 : 32) * unit * factor;
  const labelSize = (compact ? 10.5 : 12) * unit * factor;
  const cellWidth = width / cells.length;
  const accent = readableAccent(theme.accent, theme.card, 4.5);
  cells.forEach((cell, index) => {
    const centerX = x + cellWidth * (index + 0.5);
    if (index > 0) {
      ctx.beginPath();
      ctx.moveTo(x + cellWidth * index, top + height * 0.24);
      ctx.lineTo(x + cellWidth * index, top + height * 0.76);
      ctx.strokeStyle = withAlpha(theme.line, 0.5);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    const fitted = fitText(ctx, cell.value, {
      maxWidth: cellWidth - 16 * unit,
      maxLines: 1,
      size: valueSize,
      minSize: valueSize * 0.6,
      weight: 800
    });
    ctx.font = fontOf(fitted.size, 800);
    ctx.fillStyle = cell.highlight ? accent : theme.fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(fitted.lines[0], centerX, top + height * 0.56);
    ctx.font = fontOf(labelSize, 500);
    ctx.fillStyle = theme.fgMuted;
    ctx.fillText(cell.label, centerX, top + height * 0.56 + labelSize * 1.7);
  });
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  return height;
}
function drawChips(pc, x, top, width, unit, factor) {
  const { ctx, theme } = pc;
  const chips = pc.chips.filter((chip) => chip.trim() !== "").slice(0, CHIP_LIMIT);
  if (chips.length === 0) return 0;
  const baseFontSize = 14 * unit * factor;
  const padX = 13 * unit * factor;
  const padY = 7 * unit * factor;
  const gap = 9 * unit * factor;
  const rowHeight = baseFontSize + padY * 2;
  const items = chips.map((chip) => {
    let size = baseFontSize;
    ctx.font = fontOf(size, 600);
    let textWidth = ctx.measureText(chip).width;
    while (textWidth + padX * 2 > width && size > baseFontSize * 0.62) {
      size -= 1;
      ctx.font = fontOf(size, 600);
      textWidth = ctx.measureText(chip).width;
    }
    return { chip, size, textWidth: Math.min(textWidth, width - padX * 2) };
  });
  let cursorX = x;
  let cursorY = top;
  let rows = 1;
  for (const item of items) {
    const pillWidth = item.textWidth + padX * 2;
    if (cursorX > x && cursorX + pillWidth > x + width) {
      cursorX = x;
      cursorY += rowHeight + gap;
      rows += 1;
    }
    fillRoundRect(
      ctx,
      cursorX,
      cursorY,
      pillWidth,
      rowHeight,
      rowHeight / 2,
      withAlpha(theme.card, 0.7)
    );
    strokeRoundRect(
      ctx,
      cursorX,
      cursorY,
      pillWidth,
      rowHeight,
      rowHeight / 2,
      withAlpha(theme.line, 0.6)
    );
    ctx.font = fontOf(item.size, 600);
    ctx.fillStyle = theme.fg;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(item.chip, cursorX + padX, cursorY + rowHeight / 2 + item.size * 0.04);
    cursorX += pillWidth + gap;
  }
  ctx.textBaseline = "top";
  return rows * rowHeight + (rows - 1) * gap;
}
function drawFooterBlock(pc, x, top, width, unit, factor, qrSize) {
  const { ctx, theme, qr, footer } = pc;
  const footerText = footer.trim();
  if (!qr) {
    const fitted = fitText(ctx, footerText, {
      maxWidth: width,
      maxLines: 2,
      size: 13 * unit * factor,
      weight: 400,
      lineHeight: 1.45
    });
    drawFitted(ctx, fitted, x, top, theme.fgMuted);
    return fitted.height;
  }
  const platePad = 6 * unit * factor;
  const plateSize = qrSize + platePad * 2;
  fillRoundRect(ctx, x, top, plateSize, plateSize, 12 * unit * factor, "#FFFFFF");
  ctx.drawImage(qr, x + platePad, top + platePad, qrSize, qrSize);
  const textX = x + plateSize + 16 * unit * factor;
  const textWidth = Math.max(0, width - (textX - x));
  const ctaSize = 15 * unit * factor;
  const ctaText = "\u626B\u7801\u529E\u7406 \xB7 \u8BE6\u60C5\u9875\u67E5\u770B";
  ctx.font = fontOf(ctaSize, 700);
  const ctaWidth = ctx.measureText(ctaText).width;
  const ctaFitSize = ctaWidth > textWidth && ctaWidth > 0 ? Math.max(11 * unit, textWidth / ctaWidth * ctaSize) : ctaSize;
  const ctaHeight = ctaFitSize * 1.2;
  const footerFitted = fitText(ctx, footerText, {
    maxWidth: textWidth,
    maxLines: 2,
    size: 12 * unit * factor,
    weight: 400,
    lineHeight: 1.45
  });
  const textHeight = ctaHeight + 6 * unit + footerFitted.height;
  const textTop = top + Math.max(0, (plateSize - textHeight) / 2);
  ctx.font = fontOf(ctaFitSize, 700);
  ctx.fillStyle = theme.fg;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(ctaText, textX, textTop);
  drawFitted(ctx, footerFitted, textX, textTop + ctaHeight + 6 * unit, theme.fgMuted);
  return Math.max(plateSize, textHeight);
}
function paintVertical(pc) {
  const { width, height } = pc;
  const unit = width / 540;
  const pad = Math.round(40 * unit);
  const innerWidth = width - pad * 2;
  const minGap = 12 * unit;
  const qrSize = 96 * unit;
  const build = (factor) => {
    const sections2 = [];
    const brandHeight = measureWith(pc, () => drawBrandBar(pc, pad, 0, innerWidth, unit, factor));
    sections2.push({
      height: brandHeight,
      weight: 1,
      draw: (top) => {
        drawBrandBar(pc, pad, top, innerWidth, unit, factor);
      }
    });
    const headline = fitText(pc.ctx, pc.headline, {
      maxWidth: innerWidth,
      maxLines: 3,
      size: 40 * unit * factor,
      minSize: 26 * unit,
      weight: 800,
      lineHeight: 1.25
    });
    sections2.push({
      height: headline.height,
      weight: 1.6,
      draw: (top) => {
        drawFitted(pc.ctx, headline, pad, top, pc.theme.fg, 800);
      }
    });
    const subline = fitText(pc.ctx, pc.subline, {
      maxWidth: innerWidth,
      maxLines: 2,
      size: 19 * unit * factor,
      minSize: 13 * unit,
      weight: 500,
      lineHeight: 1.45
    });
    if (subline.height > 0) {
      sections2.push({
        height: subline.height,
        weight: 1.2,
        draw: (top) => {
          drawFitted(pc.ctx, subline, pad, top, pc.theme.fgMuted, 500);
        }
      });
    }
    const priceHeight = measureWith(
      pc,
      () => drawPriceBlock(pc, pad, 0, innerWidth, unit, factor)
    );
    if (priceHeight > 0) {
      sections2.push({
        height: priceHeight,
        weight: 1.5,
        draw: (top) => {
          drawPriceBlock(pc, pad, top, innerWidth, unit, factor);
        }
      });
    }
    const specHeight = measureWith(pc, () => drawSpecGrid(pc, pad, 0, innerWidth, unit, factor));
    if (specHeight > 0) {
      sections2.push({
        height: specHeight,
        weight: 1.2,
        draw: (top) => {
          drawSpecGrid(pc, pad, top, innerWidth, unit, factor);
        }
      });
    }
    const chipHeight = measureWith(pc, () => drawChips(pc, pad, 0, innerWidth, unit, factor));
    if (chipHeight > 0) {
      sections2.push({
        height: chipHeight,
        weight: 1,
        draw: (top) => {
          drawChips(pc, pad, top, innerWidth, unit, factor);
        }
      });
    }
    const footerHeight = measureWith(
      pc,
      () => drawFooterBlock(pc, pad, 0, innerWidth, unit, factor, qrSize)
    );
    if (footerHeight > 0) {
      sections2.push({
        height: footerHeight,
        weight: 0,
        draw: (top) => {
          drawFooterBlock(pc, pad, top, innerWidth, unit, factor, qrSize);
        }
      });
    }
    return sections2;
  };
  const available = height - pad * 2;
  let sections = build(1);
  for (const factor of FIT_FACTORS) {
    const candidate = build(factor);
    sections = candidate;
    if (requiredHeight(candidate, minGap) <= available) break;
  }
  paintBackground(pc);
  drawSections(sections, pad, height - pad, minGap);
}
function paintHorizontal(pc) {
  const { width, height } = pc;
  const unit = Math.min(width / 960, height / 540);
  const pad = Math.round(40 * unit);
  const hasQr = pc.qr !== null;
  const innerWidth = width - pad * 2;
  const cardWidth = hasQr ? Math.round(innerWidth * 0.34) : 0;
  const leftWidth = hasQr ? innerWidth - cardWidth - pad : innerWidth;
  const minGap = 12 * unit;
  const build = (factor) => {
    const sections2 = [];
    const brandHeight = measureWith(
      pc,
      () => drawBrandBar(pc, pad, 0, leftWidth, unit, factor)
    );
    sections2.push({
      height: brandHeight,
      weight: 0.8,
      draw: (top) => {
        drawBrandBar(pc, pad, top, leftWidth, unit, factor);
      }
    });
    const headline = fitText(pc.ctx, pc.headline, {
      maxWidth: leftWidth,
      maxLines: 3,
      size: 38 * unit * factor,
      minSize: 22 * unit,
      weight: 800,
      lineHeight: 1.22
    });
    sections2.push({
      height: headline.height,
      weight: 1.6,
      draw: (top) => {
        drawFitted(pc.ctx, headline, pad, top, pc.theme.fg, 800);
      }
    });
    const subline = fitText(pc.ctx, pc.subline, {
      maxWidth: leftWidth,
      maxLines: 2,
      size: 17 * unit * factor,
      minSize: 12 * unit,
      weight: 500,
      lineHeight: 1.4
    });
    if (subline.height > 0) {
      sections2.push({
        height: subline.height,
        weight: 1,
        draw: (top) => {
          drawFitted(pc.ctx, subline, pad, top, pc.theme.fgMuted, 500);
        }
      });
    }
    const priceHeight = measureWith(
      pc,
      () => drawPriceBlock(pc, pad, 0, leftWidth, unit, factor, true)
    );
    if (priceHeight > 0) {
      sections2.push({
        height: priceHeight,
        weight: 1.2,
        draw: (top) => {
          drawPriceBlock(pc, pad, top, leftWidth, unit, factor, true);
        }
      });
    }
    const specHeight = measureWith(
      pc,
      () => drawSpecGrid(pc, pad, 0, leftWidth, unit, factor, true)
    );
    if (specHeight > 0) {
      sections2.push({
        height: specHeight,
        weight: 1,
        draw: (top) => {
          drawSpecGrid(pc, pad, top, leftWidth, unit, factor, true);
        }
      });
    }
    const chipHeight = measureWith(pc, () => drawChips(pc, pad, 0, leftWidth, unit, factor));
    if (chipHeight > 0) {
      sections2.push({
        height: chipHeight,
        weight: 0.8,
        draw: (top) => {
          drawChips(pc, pad, top, leftWidth, unit, factor);
        }
      });
    }
    if (!hasQr) {
      const footerFitted2 = fitText(pc.ctx, pc.footer, {
        maxWidth: leftWidth,
        maxLines: 1,
        size: 12 * unit * factor,
        weight: 400
      });
      if (footerFitted2.height > 0) {
        sections2.push({
          height: footerFitted2.height,
          weight: 0,
          draw: (top) => {
            drawFitted(pc.ctx, footerFitted2, pad, top, pc.theme.fgMuted);
          }
        });
      }
    }
    return sections2;
  };
  const available = height - pad * 2;
  let sections = build(1);
  for (const factor of FIT_FACTORS) {
    const candidate = build(factor);
    sections = candidate;
    if (requiredHeight(candidate, minGap) <= available) break;
  }
  paintBackground(pc);
  drawSections(sections, pad, height - pad, minGap);
  if (!hasQr) return;
  const { ctx, theme } = pc;
  const cardX = width - pad - cardWidth;
  const cardY = pad;
  const cardH = height - pad * 2;
  const radius = 20 * unit;
  fillRoundRect(ctx, cardX, cardY, cardWidth, cardH, radius, withAlpha(theme.card, 0.9));
  strokeRoundRect(ctx, cardX, cardY, cardWidth, cardH, radius, withAlpha(theme.line, 0.5));
  const innerPad = 18 * unit;
  const qrSize = Math.min(cardWidth - innerPad * 2, 168 * unit);
  const plateSize = qrSize + 12 * unit;
  const plateX = cardX + (cardWidth - plateSize) / 2;
  const plateY = cardY + innerPad + 26 * unit;
  ctx.font = fontOf(13 * unit, 600);
  ctx.fillStyle = theme.fgMuted;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("\u626B\u7801\u67E5\u770B\u5957\u9910\u8BE6\u60C5", cardX + cardWidth / 2, cardY + innerPad);
  fillRoundRect(ctx, plateX, plateY, plateSize, plateSize, 12 * unit, "#FFFFFF");
  if (pc.qr) ctx.drawImage(pc.qr, plateX + 6 * unit, plateY + 6 * unit, qrSize, qrSize);
  const footerTop = plateY + plateSize + 20 * unit;
  ctx.font = fontOf(16 * unit, 700);
  ctx.fillStyle = theme.fg;
  ctx.fillText("\u53F7\u5361\u4E4B\u5BB6", cardX + cardWidth / 2, footerTop);
  const footerFitted = fitText(ctx, pc.footer, {
    maxWidth: cardWidth - innerPad * 2,
    maxLines: 3,
    size: 11.5 * unit,
    weight: 400,
    lineHeight: 1.5
  });
  footerFitted.lines.forEach((line, index) => {
    ctx.font = fontOf(footerFitted.size, 400);
    ctx.fillStyle = theme.fgMuted;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      line,
      cardX + cardWidth / 2,
      footerTop + 22 * unit + index * footerFitted.lineHeight
    );
  });
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}
function paintSquare(pc) {
  const { width, height } = pc;
  const unit = Math.min(width, height) / 640;
  const inset = 22 * unit;
  const cardX = inset;
  const cardY = inset;
  const cardW = width - inset * 2;
  const cardH = height - inset * 2;
  const cardRadius = 26 * unit;
  const pad = 30 * unit;
  const innerX = cardX + pad;
  const innerWidth = cardW - pad * 2;
  const minGap = 10 * unit;
  const qrSize = 84 * unit;
  const build = (factor) => {
    const sections2 = [];
    const brandHeight = measureWith(
      pc,
      () => drawBrandBar(pc, innerX, 0, innerWidth, unit, factor)
    );
    sections2.push({
      height: brandHeight,
      weight: 0.6,
      draw: (top) => {
        drawBrandBar(pc, innerX, top, innerWidth, unit, factor);
      }
    });
    const headline = fitText(pc.ctx, pc.headline, {
      maxWidth: innerWidth,
      maxLines: 2,
      size: 32 * unit * factor,
      minSize: 19 * unit,
      weight: 800,
      lineHeight: 1.24
    });
    sections2.push({
      height: headline.height,
      weight: 1.4,
      draw: (top) => {
        drawFitted(pc.ctx, headline, innerX, top, pc.theme.fg, 800);
      }
    });
    const subline = fitText(pc.ctx, pc.subline, {
      maxWidth: innerWidth,
      maxLines: 1,
      size: 15 * unit * factor,
      minSize: 11 * unit,
      weight: 500
    });
    if (subline.height > 0) {
      sections2.push({
        height: subline.height,
        weight: 1,
        draw: (top) => {
          drawFitted(pc.ctx, subline, innerX, top, pc.theme.fgMuted, 500);
        }
      });
    }
    const priceHeight = measureWith(
      pc,
      () => drawPriceBlock(pc, innerX, 0, innerWidth, unit, factor, true)
    );
    if (priceHeight > 0) {
      sections2.push({
        height: priceHeight,
        weight: 1.2,
        draw: (top) => {
          drawPriceBlock(pc, innerX, top, innerWidth, unit, factor, true);
        }
      });
    }
    const specHeight = measureWith(
      pc,
      () => drawSpecGrid(pc, innerX, 0, innerWidth, unit, factor, true)
    );
    if (specHeight > 0) {
      sections2.push({
        height: specHeight,
        weight: 1,
        draw: (top) => {
          drawSpecGrid(pc, innerX, top, innerWidth, unit, factor, true);
        }
      });
    }
    const chipHeight = measureWith(pc, () => drawChips(pc, innerX, 0, innerWidth, unit, factor));
    if (chipHeight > 0) {
      sections2.push({
        height: chipHeight,
        weight: 0.8,
        draw: (top) => {
          drawChips(pc, innerX, top, innerWidth, unit, factor);
        }
      });
    }
    const footerHeight = measureWith(
      pc,
      () => drawFooterBlock(pc, innerX, 0, innerWidth, unit, factor, qrSize)
    );
    if (footerHeight > 0) {
      sections2.push({
        height: footerHeight,
        weight: 0,
        draw: (top) => {
          drawFooterBlock(pc, innerX, top, innerWidth, unit, factor, qrSize);
        }
      });
    }
    return sections2;
  };
  paintBackground(pc);
  fillRoundRect(pc.ctx, cardX, cardY, cardW, cardH, cardRadius, withAlpha(pc.theme.card, 0.94));
  strokeRoundRect(
    pc.ctx,
    cardX,
    cardY,
    cardW,
    cardH,
    cardRadius,
    withAlpha(pc.theme.line, 0.45)
  );
  const available = cardH - pad * 2;
  let sections = build(1);
  for (const factor of FIT_FACTORS) {
    const candidate = build(factor);
    sections = candidate;
    if (requiredHeight(candidate, minGap) <= available) break;
  }
  drawSections(sections, cardY + pad, cardY + cardH - pad, minGap);
}
async function renderPoster(req) {
  const size = getPosterSize(req.size);
  const theme = getPosterTheme(req.theme);
  const scale = normalizeScale(req.scale);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(size.width * scale);
  canvas.height = Math.round(size.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("[poster] \u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301 Canvas 2D\uFF0C\u65E0\u6CD5\u751F\u6210\u5361\u7247\u56FE");
  ctx.scale(canvas.width / size.width, canvas.height / size.height);
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  const qr = await loadQrImage(req.qrUrl);
  const spec = req.spec;
  const headline = req.headline.trim() || spec.name.trim() || spec.rawTitle.trim() || "\u6D41\u91CF\u5361\u5957\u9910";
  const pc = {
    ctx,
    measureCtx: createMeasureContext(ctx),
    width: size.width,
    height: size.height,
    theme,
    spec,
    headline,
    subline: req.subline.trim(),
    chips: req.chips,
    footer: req.footer,
    qr
  };
  if (size.id === "16:9") {
    paintHorizontal(pc);
  } else if (size.width / size.height < 1) {
    paintVertical(pc);
  } else {
    paintSquare(pc);
  }
  return {
    canvas,
    width: canvas.width,
    height: canvas.height,
    filename: buildFilename(spec, size.id)
  };
}
function toBlob(canvas, format = "png", quality) {
  const mime = format === "jpeg" ? "image/jpeg" : "image/png";
  const safeQuality = Math.min(1, Math.max(0.1, quality ?? 0.92));
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("[poster] \u753B\u5E03\u7F16\u7801\u5931\u8D25\uFF0C\u53EF\u80FD\u662F\u8DE8\u57DF\u56FE\u7247\u6C61\u67D3\u4E86 canvas"));
      },
      mime,
      format === "jpeg" ? safeQuality : void 0
    );
  });
}
async function downloadPoster(result, format = "png") {
  const blob = await toBlob(result.canvas, format);
  const extension = format === "jpeg" ? "jpg" : "png";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${result.filename}.${extension}`;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4e3);
}

// src/client/sample.ts
var SAMPLE_TEXT = `\u3010\u5B9E\u4F53\u5361\u3011\u91CD\u5E86\u8054\u901A49\u5143200G

\u4EA7\u54C1\u5957\u9910\uFF1A49\u5143200G
\u6FC0\u6D3B\u9996\u5145200\u5143\u8BDD\u8D39,\u751F\u6548\u5957\u991039\u5143200G\u5168\u56FD\u901A\u7528\u6D41\u91CF+300\u5206\u949F\u901A\u8BDD+10\u5143\u4E91\u76D8\u5305;

\u9996\u6708\u6309\u5929\u6298\u7B97,\u5957\u9910\u5916\u53CA\u5176\u4ED6\u4E1A\u52A1\u8D44\u8D39,\u56FD\u5185\u8BED\u97F3\u62E8\u62530.15\u5143/\u5206\u949F,\u77ED\u4FE10.1\u5143/\u6761,\u56FD\u5185\u6D41\u91CF5\u5143/GB,\u8D60\u9001\u6765\u663E\u3002

\u4F18\u60E0\u8BE6\u60C5
\u5F00\u5361\u65F6\u5B9E\u4F53\u5E97\u94FA\u5185\u6FC0\u6D3B\u8FC7\u7A0B\u4E2D\u5145\u503C200\u5143

1\u3001\u6FC0\u6D3B\u540E\u52A1\u5FC5\u9996\u5145200\u5143\u8BDD\u8D39\uFF0C\u8BDD\u8D39\u76F4\u63A5\u5230\u8D26;

2\u3001\u7EFC\u4E0A\u6240\u8FF0:\u9996\u6708\u6309\u5929\u6298\u7B97\uFF0C\u6B21\u6708\u8D77\u6BCF\u670849\u5143\u6708\u79DF\u53EF\u4EAB200G\u5168\u56FD\u901A\u7528\u6D41\u91CF+300\u5206\u949F\u901A\u8BDD+\u4E91\u76D8\u5305\u3002

\u5FEB\u9012\u65B9\u5F0F
\u4E0A\u95E8

\u6FC0\u6D3B\u65B9\u5F0F
\u9762\u5BF9\u9762\u6FC0\u6D3B

\u5145\u503C\u94FE\u63A5
\u6FC0\u6D3B\u5355\u9875/\u5145\u503C\u94FE\u63A5\uFF1A\u5F00\u5361\u65F6\u5B9E\u4F53\u5E97\u94FA\u5185\u6FC0\u6D3B\u8FC7\u7A0B\u4E2D\u5145\u503C200\u5143

\u529E\u5361\u5E74\u9F84
18-60\u5468\u5C81

\u5408\u7EA6\u671F
12\u4E2A\u6708

\u4E0D\u53D1\u8D27\u5730\u533A
\u4EC5\u53D1\u91CD\u5E86

\u5B9A\u5411\u8303\u56F4
\u65E0

\u6FC0\u6D3B\u6D41\u7A0B\u56FE
\u65E0

\u6E29\u99A8\u63D0\u793A
\u5E73\u53F0\u6240\u6709\u4EA7\u54C1\u4E0D\u5141\u8BB8\u4EFB\u4F55\u5F62\u5F0F\u7684\u4E8C\u6B21\u5305\u88C5\u3001\u5305\u88C59\u5143\u3001\u5BA3\u4F20\u6C38\u4E45\u3001\u5E9F\u5355\u3001\u8F6C\u5355\u3001\u5BA3\u4F20\u5F52\u5C5E\u5730\uFF0C\u8FDD\u8005\u6C38\u4E0D\u5408\u4F5C

\u590D\u673A\u53CA\u6CE8\u9500\u65B9\u5F0F
\u8054\u901AAPP/\u5F53\u5730\u81EA\u6709\u8425\u4E1A\u5385`;

// src/client/useStudio.ts
var DEFAULT_BRAND2 = "\u53F7\u5361\u4E4B\u5BB6";
function splitChips(text) {
  return text.split(/[,，]/).map((item) => item.trim()).filter((item) => item !== "");
}
function defaultChips(spec) {
  const chips = [];
  if (spec.flowGb > 0) chips.push(`${spec.flowGb}G \u901A\u7528\u6D41\u91CF`);
  if (spec.voiceMinutes > 0) chips.push(`${spec.voiceMinutes} \u5206\u949F\u901A\u8BDD`);
  if (spec.contractMonths > 0) chips.push(`\u5408\u7EA6 ${spec.contractMonths} \u4E2A\u6708`);
  if (spec.firstCharge > 0) chips.push(`\u9996\u5145 ${spec.firstCharge} \u5143`);
  if (chips.length < 4 && spec.shipRegion) chips.push(spec.shipRegion);
  if (chips.length < 4 && spec.activateType) chips.push(spec.activateType);
  return chips.slice(0, 4);
}
function defaultSubline(spec) {
  const parts = [];
  if (spec.flowGb > 0) parts.push(`${spec.flowGb}G \u5168\u56FD\u901A\u7528`);
  if (spec.voiceMinutes > 0) parts.push(`${spec.voiceMinutes} \u5206\u949F\u901A\u8BDD`);
  if (spec.shipRegion) parts.push(spec.shipRegion);
  return parts.join(" \xB7 ");
}
var DEFAULT_FOOTER = `${DEFAULT_BRAND2} \xB7 \u5B98\u65B9\u81EA\u52A9\u4E0B\u5355`;
var INITIAL = {
  raw: "",
  parsed: null,
  spec: null,
  compliance: null,
  platform: "xiaohongshu",
  tone: "seed",
  count: 3,
  link: "",
  brand: DEFAULT_BRAND2,
  variants: [],
  size: "9:16",
  theme: "brand",
  headline: "",
  subline: "",
  chipsText: "",
  footer: DEFAULT_FOOTER,
  qrUrl: "",
  scale: 2,
  posterUrl: null,
  posterMeta: null,
  parsing: false,
  generating: false,
  rendering: false
};
async function writeClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
function useStudio(onToast) {
  const [state, setState] = (0, import_react.useState)(INITIAL);
  const posterRef = (0, import_react.useRef)(null);
  const patch = (0, import_react.useCallback)((next) => {
    setState((prev) => ({ ...prev, ...next }));
  }, []);
  const setRaw = (0, import_react.useCallback)((value) => patch({ raw: value }), [patch]);
  const parse = (0, import_react.useCallback)(() => {
    setState((prev) => {
      const text = prev.raw.trim();
      if (text === "") {
        onToast("\u8BF7\u5148\u7C98\u8D34\u5546\u54C1\u539F\u6587");
        return prev;
      }
      const parsed = parseProductText(text);
      const compliance = checkCompliance(text);
      const spec = parsed.spec;
      return {
        ...prev,
        parsed,
        spec,
        compliance,
        headline: spec.name || spec.rawTitle,
        subline: defaultSubline(spec),
        chipsText: defaultChips(spec).join("\uFF0C"),
        variants: [],
        posterUrl: null,
        posterMeta: null
      };
    });
    posterRef.current = null;
  }, [onToast]);
  const fillSample = (0, import_react.useCallback)(() => {
    setState((prev) => ({ ...prev, raw: SAMPLE_TEXT }));
  }, []);
  const patchSpec = (0, import_react.useCallback)(
    (key, value) => {
      setState((prev) => prev.spec === null ? prev : { ...prev, spec: { ...prev.spec, [key]: value } });
    },
    []
  );
  const setPlatform = (0, import_react.useCallback)((value) => {
    setState((prev) => {
      const tones = getPlatform(value).tones;
      const tone = tones.includes(prev.tone) ? prev.tone : tones[0];
      return { ...prev, platform: value, tone };
    });
  }, []);
  const setTone = (0, import_react.useCallback)((value) => patch({ tone: value }), [patch]);
  const setCount = (0, import_react.useCallback)((value) => patch({ count: value }), [patch]);
  const setLink = (0, import_react.useCallback)((value) => patch({ link: value }), [patch]);
  const setBrand = (0, import_react.useCallback)((value) => patch({ brand: value }), [patch]);
  const generate = (0, import_react.useCallback)(() => {
    setState((prev) => {
      if (prev.spec === null) {
        onToast("\u8BF7\u5148\u89E3\u6790\u5546\u54C1\u539F\u6587");
        return prev;
      }
      const variants = generateVariants(prev.spec, prev.platform, prev.tone, {
        link: prev.link,
        count: prev.count,
        brand: prev.brand
      });
      return { ...prev, variants };
    });
  }, [onToast]);
  const setSize = (0, import_react.useCallback)((value) => patch({ size: value }), [patch]);
  const setTheme = (0, import_react.useCallback)((value) => patch({ theme: value }), [patch]);
  const setHeadline = (0, import_react.useCallback)((value) => patch({ headline: value }), [patch]);
  const setSubline = (0, import_react.useCallback)((value) => patch({ subline: value }), [patch]);
  const setChipsText = (0, import_react.useCallback)((value) => patch({ chipsText: value }), [patch]);
  const setFooter = (0, import_react.useCallback)((value) => patch({ footer: value }), [patch]);
  const setQrUrl = (0, import_react.useCallback)((value) => patch({ qrUrl: value }), [patch]);
  const setScale = (0, import_react.useCallback)((value) => patch({ scale: value }), [patch]);
  const render = (0, import_react.useCallback)(() => {
    setState((prev) => {
      if (prev.spec === null) {
        onToast("\u8BF7\u5148\u89E3\u6790\u5546\u54C1\u539F\u6587");
        return prev;
      }
      void (async () => {
        try {
          const result = await renderPoster({
            spec: prev.spec,
            size: prev.size,
            theme: prev.theme,
            headline: prev.headline,
            subline: prev.subline,
            chips: splitChips(prev.chipsText),
            footer: prev.footer,
            qrUrl: prev.qrUrl,
            scale: prev.scale
          });
          posterRef.current = result;
          setState((current) => ({
            ...current,
            posterUrl: result.canvas.toDataURL("image/png"),
            posterMeta: { filename: result.filename, width: result.width, height: result.height },
            rendering: false
          }));
        } catch (error) {
          onToast(error instanceof Error ? error.message : "\u51FA\u56FE\u5931\u8D25");
          setState((current) => ({ ...current, rendering: false }));
        }
      })();
      return { ...prev, rendering: true };
    });
  }, [onToast]);
  const download = (0, import_react.useCallback)(() => {
    const result = posterRef.current;
    if (result === null) {
      onToast("\u8BF7\u5148\u751F\u6210\u5361\u7247\u56FE");
      return;
    }
    void downloadPoster(result, "png").catch(() => onToast("\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5"));
  }, [onToast]);
  const copy = (0, import_react.useCallback)(
    (text, label) => {
      void writeClipboard(text).then((ok) => {
        onToast(ok ? `\u5DF2\u590D\u5236${label ? ` ${label}` : ""}` : "\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u4E2D\u590D\u5236");
      });
    },
    [onToast]
  );
  const actions = (0, import_react.useMemo)(
    () => ({
      setRaw,
      parse,
      fillSample,
      patchSpec,
      setPlatform,
      setTone,
      setCount,
      setLink,
      setBrand,
      generate,
      setSize,
      setTheme,
      setHeadline,
      setSubline,
      setChipsText,
      setFooter,
      setQrUrl,
      setScale,
      render,
      download,
      copy
    }),
    [
      setRaw,
      parse,
      fillSample,
      patchSpec,
      setPlatform,
      setTone,
      setCount,
      setLink,
      setBrand,
      generate,
      setSize,
      setTheme,
      setHeadline,
      setSubline,
      setChipsText,
      setFooter,
      setQrUrl,
      setScale,
      render,
      download,
      copy
    ]
  );
  return { state, actions };
}

// src/client/i18n.ts
var NS = "studio";
var zh = {
  panel: "\u63A8\u5E7F\u521B\u4F5C\u53F0",
  title: "\u63A8\u5E7F\u521B\u4F5C\u53F0",
  subtitle: "\u7C98\u8D34\u5546\u54C1\u539F\u6587 \u2192 \u751F\u6210\u5408\u89C4\u6587\u6848\u4E0E\u5361\u7247\u56FE",
  "tab.copy": "\u63A8\u5E7F\u6587\u6848",
  "tab.poster": "\u5361\u7247\u56FE",
  "section.source": "\u5546\u54C1\u539F\u6587",
  "section.spec": "\u8BC6\u522B\u5230\u7684\u5957\u9910",
  "section.compliance": "\u5408\u89C4\u4F53\u68C0",
  "section.copy": "\u751F\u6210\u8BBE\u7F6E",
  "section.result": "\u751F\u6210\u7ED3\u679C",
  "section.poster": "\u51FA\u56FE\u8BBE\u7F6E",
  "section.preview": "\u9884\u89C8",
  "btn.parse": "\u89E3\u6790",
  "btn.sample": "\u586B\u5165\u793A\u4F8B",
  "btn.clear": "\u6E05\u7A7A",
  "btn.generate": "\u751F\u6210\u6587\u6848",
  "btn.render": "\u751F\u6210\u5361\u7247\u56FE",
  "btn.download": "\u4E0B\u8F7D\u56FE\u7247",
  "btn.copy": "\u590D\u5236",
  "btn.copyAll": "\u590D\u5236\u5168\u6587",
  "btn.copyTags": "\u590D\u5236\u6807\u7B7E",
  "hint.source": "\u628A\u4E0A\u6E38\u7ED9\u7684\u5546\u54C1\u6587\u6848\u6574\u6BB5\u7C98\u8FDB\u6765\uFF0C\u683C\u5F0F\u4E0D\u9650\u3002",
  "hint.chips": "\u9017\u53F7\u5206\u9694\uFF0C\u6700\u591A\u6E32\u67D3 4 \u4E2A",
  "hint.qr": "\u7559\u7A7A\u5219\u4E0D\u753B\u4E8C\u7EF4\u7801",
  "hint.link": "\u4F1A\u62FC\u5728\u884C\u52A8\u6307\u4EE4\u540E\u9762\uFF0C\u7559\u7A7A\u5219\u4E0D\u5E26\u94FE\u63A5",
  "label.platform": "\u53D1\u5E03\u5E73\u53F0",
  "label.tone": "\u6587\u6848\u4F53\u88C1",
  "label.count": "\u751F\u6210\u6761\u6570",
  "label.link": "\u63A8\u5E7F\u94FE\u63A5",
  "label.brand": "\u843D\u6B3E\u540D\u79F0",
  "label.size": "\u56FE\u7247\u5C3A\u5BF8",
  "label.theme": "\u914D\u8272\u4E3B\u9898",
  "label.headline": "\u4E3B\u6807\u9898",
  "label.subline": "\u526F\u6807\u9898",
  "label.chips": "\u5356\u70B9\u6807\u7B7E",
  "label.footer": "\u9875\u811A\u843D\u6B3E",
  "label.qr": "\u4E8C\u7EF4\u7801\u94FE\u63A5",
  "label.scale": "\u5BFC\u51FA\u500D\u7387",
  "field.monthlyFee": "\u6708\u79DF(\u5143)",
  "field.flowGb": "\u901A\u7528\u6D41\u91CF(GB)",
  "field.voiceMinutes": "\u901A\u8BDD(\u5206\u949F)",
  "field.firstCharge": "\u9996\u5145(\u5143)",
  "field.contractMonths": "\u5408\u7EA6\u671F(\u6708)",
  "field.operator": "\u8FD0\u8425\u5546",
  "field.shipRegion": "\u53D1\u8D27\u5730\u533A",
  "field.ageRange": "\u529E\u5361\u5E74\u9F84",
  "field.activateType": "\u6FC0\u6D3B\u65B9\u5F0F",
  "field.expressType": "\u5FEB\u9012\u65B9\u5F0F",
  "field.perks": "\u9644\u52A0\u6743\u76CA",
  "field.duration": "\u4F18\u60E0\u671F",
  "compliance.pass": "\u672A\u53D1\u73B0\u98CE\u9669\u8868\u8FF0",
  "compliance.warn": "\u6709\u9700\u8981\u7559\u610F\u7684\u5730\u65B9",
  "compliance.block": "\u53D1\u73B0\u7981\u7528\u8868\u8FF0\uFF0C\u53D1\u5E03\u524D\u5FC5\u987B\u4FEE\u6539",
  "compliance.empty": "\u89E3\u6790\u540E\u81EA\u52A8\u4F53\u68C0",
  "status.missing": "\u672A\u8BC6\u522B",
  "status.matched": "\u5DF2\u8BC6\u522B",
  "status.empty": "\u5148\u7C98\u8D34\u5546\u54C1\u539F\u6587\u5E76\u89E3\u6790",
  "status.rendering": "\u6B63\u5728\u51FA\u56FE\u2026",
  "status.noPoster": "\u8FD8\u6CA1\u6709\u751F\u6210\u5361\u7247\u56FE",
  "status.copied": "\u5DF2\u590D\u5236",
  "status.parseFirst": "\u8BF7\u5148\u89E3\u6790\u5546\u54C1\u539F\u6587",
  "note.tags": "\u6807\u7B7E",
  "note.publish": "\u53D1\u5E03\u6CE8\u610F"
};
var en = {
  panel: "Promo Studio",
  title: "Promo Studio",
  subtitle: "Paste a product sheet to generate compliant copy and cards",
  "tab.copy": "Copy",
  "tab.poster": "Card image",
  "section.source": "Product sheet",
  "section.spec": "Detected plan",
  "section.compliance": "Compliance check",
  "section.copy": "Generation settings",
  "section.result": "Results",
  "section.poster": "Card settings",
  "section.preview": "Preview",
  "btn.parse": "Parse",
  "btn.sample": "Load sample",
  "btn.clear": "Clear",
  "btn.generate": "Generate copy",
  "btn.render": "Render card",
  "btn.download": "Download",
  "btn.copy": "Copy",
  "btn.copyAll": "Copy all",
  "btn.copyTags": "Copy tags",
  "hint.source": "Paste the whole product sheet here; the format is free-form.",
  "hint.chips": "Comma separated, at most 4 are drawn",
  "hint.qr": "Leave empty to skip the QR code",
  "hint.link": "Appended to the call to action",
  "label.platform": "Platform",
  "label.tone": "Tone",
  "label.count": "Variants",
  "label.link": "Promo link",
  "label.brand": "Signature",
  "label.size": "Size",
  "label.theme": "Theme",
  "label.headline": "Headline",
  "label.subline": "Subline",
  "label.chips": "Selling points",
  "label.footer": "Footer",
  "label.qr": "QR link",
  "label.scale": "Export scale",
  "field.monthlyFee": "Monthly (CNY)",
  "field.flowGb": "Data (GB)",
  "field.voiceMinutes": "Minutes",
  "field.firstCharge": "First top-up",
  "field.contractMonths": "Contract (mo)",
  "field.operator": "Carrier",
  "field.shipRegion": "Ships to",
  "field.ageRange": "Age range",
  "field.activateType": "Activation",
  "field.expressType": "Delivery",
  "field.perks": "Extras",
  "field.duration": "Validity",
  "compliance.pass": "No risky wording found",
  "compliance.warn": "A few things to watch",
  "compliance.block": "Forbidden wording \u2014 fix before publishing",
  "compliance.empty": "Runs automatically after parsing",
  "status.missing": "Not detected",
  "status.matched": "Detected",
  "status.empty": "Paste a product sheet and parse it first",
  "status.rendering": "Rendering\u2026",
  "status.noPoster": "No card rendered yet",
  "status.copied": "Copied",
  "status.parseFirst": "Parse the product sheet first",
  "note.tags": "Tags",
  "note.publish": "Before publishing"
};
var DICTS = { zh, en };

// src/client/App.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var TOAST_MS = 1800;
function fallbackT(injected) {
  if (typeof injected === "function") return injected;
  const zh2 = DICTS.zh;
  return (key) => Object.prototype.hasOwnProperty.call(zh2, key) ? zh2[key] : key;
}
function StudioPanel({ t: injectedT }) {
  const t = fallbackT(injectedT);
  const [toast, setToast] = (0, import_react2.useState)(null);
  const [tab, setTab] = (0, import_react2.useState)("copy");
  const { state, actions } = useStudio((message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), TOAST_MS);
  });
  const panelProps = { state, actions, t };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "ds-studio-root", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("header", { className: "ds-studio-head", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h1", { children: t("title") }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { children: t("subtitle") })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "ds-studio-body", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "ds-studio-col", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SourcePanel, { ...panelProps }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SpecPanel, { ...panelProps }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CompliancePanel, { ...panelProps })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "ds-studio-col", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "ds-tabs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "button",
            {
              type: "button",
              className: "ds-tab",
              "data-active": tab === "copy",
              onClick: () => setTab("copy"),
              children: t("tab.copy")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "button",
            {
              type: "button",
              className: "ds-tab",
              "data-active": tab === "poster",
              onClick: () => setTab("poster"),
              children: t("tab.poster")
            }
          )
        ] }),
        tab === "copy" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CopySettings, { ...panelProps }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CopyResults, { ...panelProps })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(PosterSettings, { ...panelProps }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(PosterPreview, { ...panelProps })
        ] })
      ] })
    ] }),
    toast === null ? null : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "ds-toast", children: toast })
  ] });
}

// src/client/css.ts
var CSS = `
.ds-studio-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 1.6;
}

.ds-studio-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 24px 14px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  flex: none;
}

.ds-studio-head h1 {
  margin: 0;
  font-size: 17px;
  font-weight: 650;
  letter-spacing: 0.2px;
}

.ds-studio-head p {
  margin: 3px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}

.ds-studio-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  gap: 16px;
  padding: 16px 24px 28px;
  align-items: start;
}

@media (max-width: 1080px) {
  .ds-studio-body { grid-template-columns: minmax(0, 1fr); }
}

.ds-studio-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.ds-card {
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  padding: 14px 16px;
}

.ds-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
}

.ds-hint {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 400;
}

.ds-textarea,
.ds-input,
.ds-select {
  width: 100%;
  box-sizing: border-box;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  padding: 8px 10px;
  font: inherit;
  font-size: 12px;
  outline: none;
}

.ds-textarea {
  min-height: 148px;
  resize: vertical;
  line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.ds-textarea:focus,
.ds-input:focus,
.ds-select:focus {
  border-color: var(--dsw-alias-brand-primary);
}

.ds-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.ds-btn {
  appearance: none;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  border-radius: 8px;
  padding: 6px 12px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.ds-btn:hover { border-color: var(--dsw-alias-border-l2); }

.ds-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ds-btn-primary {
  background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary);
  color: #fff;
  font-weight: 600;
}

.ds-btn-primary:hover { filter: brightness(1.06); }

.ds-btn-ghost {
  background: transparent;
  border-color: transparent;
  color: var(--dsw-alias-label-secondary);
  padding: 4px 8px;
}

.ds-btn-ghost:hover {
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
}

.ds-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ds-pill {
  appearance: none;
  border: 1px solid var(--dsw-alias-border-l1);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  border-radius: 999px;
  padding: 4px 11px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.ds-pill:hover { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); }

.ds-pill[data-active='true'] {
  background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary);
  color: #fff;
  font-weight: 600;
}

.ds-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 10px;
}

.ds-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.ds-field > label {
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
}

.ds-field-wide { grid-column: 1 / -1; }

.ds-stat {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.ds-stat b {
  font-size: 15px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.ds-stat span { color: var(--dsw-alias-label-secondary); font-size: 11px; }

.ds-chip {
  display: inline-block;
  border-radius: 6px;
  padding: 1px 7px;
  font-size: 11px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  border: 1px solid var(--dsw-alias-border-l1);
}

.ds-level-pass { color: var(--dsw-alias-state-success-primary); }
.ds-level-warn { color: var(--dsw-alias-state-warn-primary); }
.ds-level-block { color: var(--dsw-alias-state-error-primary); }

.ds-issue {
  border-left: 3px solid var(--dsw-alias-border-l2);
  padding: 6px 0 6px 10px;
  margin-bottom: 8px;
}

.ds-issue[data-level='warn'] { border-left-color: var(--dsw-alias-state-warn-primary); }
.ds-issue[data-level='block'] { border-left-color: var(--dsw-alias-state-error-primary); }

.ds-issue b { font-size: 12px; }

.ds-issue p {
  margin: 2px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}

.ds-issue code {
  background: var(--dsw-alias-bg-layer-2);
  border-radius: 4px;
  padding: 0 4px;
  font-size: 11px;
}

.ds-variant {
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  padding: 12px 14px;
  background: var(--dsw-alias-bg-layer-1);
  margin-bottom: 10px;
}

.ds-variant-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.ds-variant-body {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12.5px;
  line-height: 1.7;
}

.ds-tags {
  margin-top: 8px;
  color: var(--dsw-alias-brand-primary);
  font-size: 12px;
  word-break: break-word;
}

.ds-notes {
  margin: 8px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  white-space: pre-wrap;
}

.ds-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
  border: 1px dashed var(--dsw-alias-border-l2);
  min-height: 200px;
}

.ds-preview img {
  max-width: 100%;
  max-height: 460px;
  border-radius: 8px;
  display: block;
}

.ds-empty {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  text-align: center;
  padding: 24px 8px;
}

.ds-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  margin-bottom: 12px;
}

.ds-tab {
  appearance: none;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  border-bottom: 2px solid transparent;
  padding: 6px 12px;
  font: inherit;
  font-size: 12.5px;
  cursor: pointer;
  margin-bottom: -1px;
}

.ds-tab[data-active='true'] {
  color: var(--dsw-alias-label-primary);
  border-bottom-color: var(--dsw-alias-brand-primary);
  font-weight: 600;
}

.ds-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
}

.ds-toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  background: var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-layer-2));
  color: var(--dsw-alias-label-primary);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  z-index: 60;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
`;

// src/client/icon.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function StudioIcon({ size, active }) {
  const style = { display: "block", width: size, height: size };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "svg",
    {
      style,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "rect",
          {
            x: "2.75",
            y: "2.75",
            width: "18.5",
            height: "18.5",
            rx: "5",
            fill: active ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-bg-layer-2)",
            stroke: active ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-border-l2)",
            strokeWidth: "1.4"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "rect",
          {
            x: "7",
            y: "6.4",
            width: "10",
            height: "11.2",
            rx: "1.8",
            fill: active ? "#fff" : "var(--dsw-alias-label-secondary)",
            fillOpacity: active ? 0.94 : 0.22
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "rect",
          {
            x: "9",
            y: "8.9",
            width: "6",
            height: "1.3",
            rx: "0.65",
            fill: active ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-label-secondary)",
            fillOpacity: active ? 0.9 : 0.75
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "rect",
          {
            x: "9",
            y: "11.4",
            width: "4.2",
            height: "1.1",
            rx: "0.55",
            fill: active ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-label-secondary)",
            fillOpacity: active ? 0.55 : 0.45
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "rect",
          {
            x: "9",
            y: "13.6",
            width: "5.2",
            height: "1.1",
            rx: "0.55",
            fill: active ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-label-secondary)",
            fillOpacity: active ? 0.55 : 0.45
          }
        )
      ]
    }
  );
}

// src/client/index.ts
var PANEL_ID = "studio";
var STYLE_ID = "dsh-studio/studio.css";
var inject = ["slots", "locale"];
function injectStyles() {
  if (typeof document === "undefined") return () => {
  };
  const selector = `style[data-plugin-css="${STYLE_ID}"]`;
  for (const stale of Array.from(document.querySelectorAll(selector))) {
    stale.remove();
  }
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-studio";
  tag.dataset.pluginCss = STYLE_ID;
  tag.textContent = CSS;
  document.head.appendChild(tag);
  return () => {
    tag.remove();
  };
}
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, DICTS), "dsh-studio: dictionaries");
  ctx.effect(injectStyles, "dsh-studio: stylesheet");
  const t = ctx.locale.bind(NS);
  ctx.slots.inject(
    "main",
    () => ctx.slots.register(
      {
        name: "main",
        key: PANEL_ID,
        locale: NS,
        inject: () => ({})
      },
      StudioPanel
    )
  );
  ctx.slots.inject(
    "sidebar.panellist",
    () => ctx.slots.register(
      {
        name: "sidebar.panellist",
        id: PANEL_ID,
        order: 20,
        locale: NS,
        label: () => t("panel")
      },
      StudioIcon
    )
  );
}

		return module.exports;
	},
});
