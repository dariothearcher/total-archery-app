// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.setInt16),
      AD: x0 => x0.height,
      AE: (x0,x1) => x0.observe(x1),
      AF: x0 => x0.wheelDeltaY,
      AG: (x0,x1) => x0.go(x1),
      AH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      AI: x0 => x0.offsetWidth,
      AJ: (x0,x1) => ({i: x0,p: x1}),
      AK: x0 => globalThis.BigInt(x0),
      AL: x0 => x0.createSyncAccessHandle(),
      AM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      AN: x0 => x0.navigator,
      AO: (x0,x1) => { x0.onInstall = x1 },
      AP: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      AQ: x0 => x0.gain,
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BF: x0 => x0.wheelDeltaX,
      BG: x0 => x0.parentElement,
      BH: x0 => x0.readText(),
      BI: x0 => x0.stopPropagation(),
      BJ: () => new Array(),
      BK: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      BL: x0 => ({create: x0}),
      BM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BN: () => globalThis.window,
      BO: (x0,x1) => { x0.onUpdate = x1 },
      BP: (o, a) => o + a,
      BQ: x0 => x0.code,
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: x0 => new ResizeObserver(x0),
      CF: x0 => x0.key,
      CG: (x0,x1) => x0.querySelectorAll(x1),
      CH: x0 => x0.clipboard,
      CI: x0 => x0.disabled,
      CJ: (x0,x1) => ({c: x0,r: x1}),
      CK: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      CL: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      CM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      CN: (x0,x1) => x0.getItem(x1),
      CO: (x0,x1) => x0.matchMedia(x1),
      CP: x0 => x0.children,
      CQ: x0 => x0.message,
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.setInt8),
      DD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      DE: (x0,x1) => x0.getPropertyValue(x1),
      DF: x0 => x0.identifier,
      DG: (x0,x1) => x0.requestAnimationFrame(x1),
      DH: (x0,x1) => x0.writeText(x1),
      DI: (x0,x1) => { x0.min = x1 },
      DJ: (x0,x1) => { x0.onmessage = x1 },
      DK: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      DL: x0 => ({create: x0}),
      DM: (x0,x1) => x0.getBigInt64(x1),
      DN: x0 => x0.localStorage,
      DO: x0 => x0.matches,
      DP: (x0,x1) => { x0.display = x1 },
      DQ: x0 => x0.error,
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: Function.prototype.call.bind(DataView.prototype.getInt8),
      ED: x0 => x0.tabIndex,
      EE: x0 => globalThis.parseFloat(x0),
      EF: x0 => x0.touches,
      EG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      EH: x0 => x0.unlock(),
      EI: (x0,x1) => { x0.max = x1 },
      EJ: (o, a) => o == a,
      EK: (x0,x1) => x0.dart_sqlite3_free(x1),
      EL: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      EM: (x0,x1) => x0.getInt32(x1),
      EN: x0 => new WeakRef(x0),
      EO: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      EP: x0 => x0.style,
      EQ: x0 => x0.duration,
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      FD: (x0,x1) => x0.contains(x1),
      FE: (x0,x1) => x0.getComputedStyle(x1),
      FF: x0 => x0.pressure,
      FG: x0 => x0.now(),
      FH: (x0,x1) => x0.lock(x1),
      FI: (x0,x1) => { x0.disabled = x1 },
      FJ: (o, t) => typeof o === t,
      FK: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      FL: (x0,x1) => new URL(x0,x1),
      FM: (x0,x1) => x0.read(x1),
      FN: x0 => x0.deref(),
      FO: x0 => x0.arrayBuffer(),
      FP: x0 => ({files: x0}),
      FQ: (x0,x1) => { x0.playbackRate = x1 },
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: x0 => x0.documentElement,
      GF: x0 => x0.tiltY,
      GG: x0 => x0.performance,
      GH: x0 => x0.orientation,
      GI: (x0,x1) => { x0.scrollLeft = x1 },
      GJ: x0 => x0.r,
      GK: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      GL: x0 => x0.pathname,
      GM: (x0,x1,x2) => x0.read(x1,x2),
      GN: () => globalThis.WeakRef,
      GO: (x0,x1) => { x0.height = x1 },
      GP: () => ({}),
      GQ: (x0,x1) => { x0.loop = x1 },
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.computedStyleMap(),
      HF: x0 => x0.tiltX,
      HG: (d, digits) => d.toFixed(digits),
      HH: (x0,x1) => x0.querySelector(x1),
      HI: (x0,x1) => { x0.spellcheck = x1 },
      HJ: x0 => x0.c,
      HK: (x0,x1) => x0.sqlite3_close_v2(x1),
      HL: x0 => x0.getDirectory(),
      HM: x0 => x0.flush(),
      HN: (x0,x1) => x0.postMessage(x1),
      HO: (x0,x1) => { x0.width = x1 },
      HP: (x0,x1,x2) => new File(x0,x1,x2),
      HQ: (x0,x1) => { x0.crossOrigin = x1 },
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: (x0,x1) => x0.get(x1),
      IF: x0 => x0.pointerType,
      IG: x0 => x0.maxHeight,
      IH: (x0,x1) => { x0.title = x1 },
      II: (x0,x1) => { x0.disabled = x1 },
      IJ: x0 => x0.p,
      IK: (x0,x1,x2,x3,x4,x5,x6) => x0.dart_sqlite3_create_function_v2(x1,x2,x3,x4,x5,x6),
      IL: x0 => x0.storage,
      IM: () => globalThis.WebAssembly,
      IN: (x0,x1) => ({kind: x0,table: x1}),
      IO: x0 => x0.convertToBlob(),
      IP: (x0,x1) => { x0.type = x1 },
      IQ: (x0,x1) => { x0.preload = x1 },
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.target,
      JE: (o, p) => p in o,
      JF: x0 => x0.pointerId,
      JG: x0 => x0.maxWidth,
      JH: (x0,x1) => x0.vibrate(x1),
      JI: (x0,x1) => x0.transferFromImageBitmap(x1),
      JJ: x0 => x0.i,
      JK: (x0,x1,x2,x3) => x0.sqlite3_result_error(x1,x2,x3),
      JL: () => globalThis.navigator,
      JM: x0 => x0.href,
      JN: (x0,x1) => x0.sqlite3_changes(x1),
      JO: (x0,x1,x2) => new ImageData(x0,x1,x2),
      JP: (x0,x1) => { x0.target = x1 },
      JQ: x0 => x0.length,
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (x0,x1) => { x0.textContent = x1 },
      KF: x0 => x0.getCoalescedEvents(),
      KG: x0 => x0.minHeight,
      KH: x0 => x0.arrayBuffer(),
      KI: (x0,x1) => x0.getContext(x1),
      KJ: x0 => x0.port1,
      KK: (x0,x1,x2) => x0.sqlite3_result_subtype(x1,x2),
      KL: (x0,x1) => globalThis.fetch(x0,x1),
      KM: (x0,x1) => x0.openCursor(x1),
      KN: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      KO: (x0,x1) => x0.getContext(x1),
      KP: x0 => x0.document,
      KQ: x0 => x0.getReader(),
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      LD: x0 => x0.clientX,
      LE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LF: (x0,x1) => x0.getModifierState(x1),
      LG: x0 => x0.minWidth,
      LH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      LI: (x0,x1) => { x0.height = x1 },
      LJ: (x0,x1) => x0.getRandomValues(x1),
      LK: (x0,x1,x2,x3,x4) => x0.sqlite3_result_blob64(x1,x2,x3,x4),
      LL: (x0,x1) => x0.sqlite3session_delete(x1),
      LM: x0 => x0.arrayBuffer(),
      LN: (x0,x1,x2) => x0.setItem(x1,x2),
      LO: (x0,x1) => new OffscreenCanvas(x0,x1),
      LP: (x0,x1) => x0.getElementById(x1),
      LQ: x0 => x0.value,
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: x0 => x0.matches,
      MF: s => s.trimLeft(),
      MG: (x0,x1) => x0.removeProperty(x1),
      MH: x0 => x0.status,
      MI: (x0,x1) => { x0.width = x1 },
      MJ: () => globalThis.crypto,
      MK: (x0,x1,x2,x3,x4) => x0.sqlite3_result_text(x1,x2,x3,x4),
      ML: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      MM: () => globalThis.Blob,
      MN: x0 => globalThis.URL.createObjectURL(x0),
      MO: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      MP: (x0,x1,x2) => x0.setAttribute(x1,x2),
      MQ: x0 => x0.done,
      N: o => String(o),
      NB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      NC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      ND: x0 => x0.getBoundingClientRect(),
      NE: (x0,x1) => x0.matchMedia(x1),
      NF: s => s.toUpperCase(),
      NG: (x0,x1) => x0.add(x1),
      NH: (x0,x1) => x0.fetch(x1),
      NI: x0 => x0.height,
      NJ: l => new DataView(new ArrayBuffer(l)),
      NK: (x0,x1,x2) => x0.sqlite3_result_double(x1,x2),
      NL: (x0,x1) => x0.unregister(x1),
      NM: x0 => x0.value,
      NN: x0 => new Blob(x0),
      NO: (x0,x1) => globalThis.fetch(x0,x1),
      NP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NQ: x0 => x0.read(),
      O: o => o === undefined,
      OB: x0 => new Uint16Array(x0),
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: x0 => x0.matches,
      OF: x0 => x0.pop(),
      OG: x0 => x0.data,
      OH: x0 => x0.content,
      OI: x0 => x0.width,
      OJ: (x0,x1,x2) => x0.transaction(x1,x2),
      OK: (x0,x1,x2) => x0.sqlite3_result_int64(x1,x2),
      OL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OM: x0 => x0.key,
      ON: () => new FileReader(),
      OO: (x0,x1) => x0.get(x1),
      OP: (x0,x1,x2) => x0.addEventListener(x1,x2),
      OQ: x0 => x0.body,
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      PF: x0 => x0.flags,
      PG: (x0,x1) => { x0.scrollTop = x1 },
      PH: x0 => x0.document,
      PI: x0 => x0.rasterEndMilliseconds,
      PJ: x0 => x0.close(),
      PK: (x0,x1) => x0.sqlite3_result_null(x1),
      PL: x0 => new FinalizationRegistry(x0),
      PM: x0 => x0.continue(),
      PN: (x0,x1) => x0.readAsArrayBuffer(x1),
      PO: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      PP: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      PQ: x0 => x0.assetBase,
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      QC: (x0,x1) => x0.item(x1),
      QD: Date.now,
      QE: f => f.dartFunction,
      QF: (a, s) => a.join(s),
      QG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      QH: () => typeof dartUseDateNowForTicks !== "undefined",
      QI: x0 => x0.rasterStartMilliseconds,
      QJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      QK: (x0,x1) => x0.sqlite3_value_blob(x1),
      QL: () => globalThis.FinalizationRegistry,
      QM: x0 => x0.error,
      QN: x0 => x0.result,
      QO: (x0,x1) => x0.forEach(x1),
      QP: (x0,x1) => { x0.innerHTML = x1 },
      QQ: x0 => x0.loader,
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RF: (x0,x1) => x0.error(x1),
      RG: (x0,x1) => { x0.value = x1 },
      RH: () => Date.now(),
      RI: x0 => x0.imageBitmaps,
      RJ: () => globalThis.Promise.resolve(),
      RK: (x0,x1) => x0.sqlite3_value_bytes(x1),
      RL: (x0,x1) => x0.sqlite3changeset_finalize(x1),
      RM: x0 => x0.result,
      RN: () => new XMLHttpRequest(),
      RO: x0 => x0.statusText,
      RP: (x0,x1) => x0.querySelector(x1),
      RQ: () => globalThis._flutter,
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: x0 => new Float32Array(x0),
      SC: (x0,x1) => x0.querySelectorAll(x1),
      SD: (x0,x1) => x0.closest(x1),
      SE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SF: () => globalThis.console,
      SG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      SH: () => 1000 * performance.now(),
      SI: x0 => x0.canvasKitMaximumSurfaces,
      SJ: (x0,x1) => x0.then(x1),
      SK: (x0,x1) => x0.sqlite3_value_text(x1),
      SL: x0 => x0.exports,
      SM: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      SN: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      SO: x0 => x0.url,
      SP: (x0,x1) => x0.removeChild(x1),
      T: o => o instanceof RegExp,
      TB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      TC: (x0,x1) => x0.getAttribute(x1),
      TD: x0 => x0.bottom,
      TE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      TF: s => s.trimRight(),
      TG: (x0,x1) => { x0.value = x1 },
      TH: x0 => new Uint8Array(x0),
      TI: (a, i) => a.splice(i, 1),
      TJ: x0 => x0.abort(),
      TK: (x0,x1) => x0.sqlite3_value_double(x1),
      TL: x0 => x0.call(),
      TM: x0 => x0.length,
      TN: x0 => x0.send(),
      TO: x0 => x0.status,
      TP: x0 => x0.firstChild,
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: x0 => x0.top,
      UE: (o, i) => o[i],
      UF: x0 => x0.blur(),
      UG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      UH: (x0,x1,x2) => x0.slice(x1,x2),
      UI: a => a.pop(),
      UJ: x0 => x0.commit(),
      UK: (x0,x1) => x0.sqlite3_value_int64(x1),
      UL: x0 => x0.instance,
      UM: (x0,x1) => x0.get(x1),
      UN: x0 => x0.type,
      UO: x0 => x0.getReader(),
      UP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      V: o => o,
      VB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      VC: (x0,x1) => x0.appendChild(x1),
      VD: x0 => x0.right,
      VE: o => o.length,
      VF: x0 => x0.button,
      VG: x0 => x0.value,
      VH: (x0,x1) => x0.decode(x1),
      VI: () => new MessageChannel(),
      VJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      VK: (x0,x1) => x0.sqlite3_value_type(x1),
      VL: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      VM: (x0,x1) => x0.index(x1),
      VN: x0 => x0.response,
      VO: x0 => x0.read(),
      VP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: x0 => new ArrayBuffer(x0),
      WC: (x0,x1) => x0.append(x1),
      WD: x0 => x0.left,
      WE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      WF: x0 => x0.innerHeight,
      WG: x0 => x0.selectionDirection,
      WH: (x0,x1) => x0.adoptText(x1),
      WI: x0 => new BroadcastChannel(x0),
      WJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      WK: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      WL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WM: x0 => x0.openKeyCursor(),
      WN: (x0,x1) => { x0.responseType = x1 },
      WO: x0 => x0.value,
      WP: x0 => x0.length,
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.clientY,
      XE: x0 => x0.language,
      XF: x0 => x0.innerWidth,
      XG: x0 => x0.selectionStart,
      XH: x0 => x0.first(),
      XI: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      XJ: (x0,x1) => { x0.onerror = x1 },
      XK: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      XL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      XM: x0 => x0.primaryKey,
      XN: x0 => x0.vendor,
      XO: x0 => x0.done,
      XP: (x0,x1) => x0.item(x1),
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientX,
      YE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      YF: x0 => x0.height,
      YG: x0 => x0.selectionEnd,
      YH: x0 => x0.next(),
      YI: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      YJ: x0 => new DOMException(x0),
      YK: x0 => x0.sqlite3_initialize(),
      YL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      YM: (x0,x1,x2) => x0.open(x1,x2),
      YN: (x0,x1) => x0.open(x1),
      YO: x0 => x0.cancel(),
      YP: x0 => x0.size,
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.changedTouches,
      ZE: () => globalThis.window.FinalizationRegistry,
      ZF: x0 => x0.width,
      ZG: x0 => x0.value,
      ZH: x0 => x0.current(),
      ZI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZJ: x0 => x0.error,
      ZK: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      ZL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      ZM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZN: (x0,x1) => x0.delete(x1),
      ZO: x0 => x0.body,
      ZP: x0 => x0.name,
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.offsetY,
      aE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aF: x0 => x0.clientHeight,
      aG: x0 => x0.selectionDirection,
      aH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      aI: x0 => globalThis.Array.isArray(x0),
      aJ: (x0,x1) => { x0.onabort = x1 },
      aK: (map, o, v) => map.set(o, v),
      aL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      aM: (x0,x1) => { x0.onupgradeneeded = x1 },
      aN: x0 => new Response(x0),
      aO: x0 => x0.headers,
      aP: x0 => x0.type,
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      bC: x0 => x0.console,
      bD: x0 => x0.offsetX,
      bE: x0 => new window.FinalizationRegistry(x0),
      bF: x0 => x0.clientWidth,
      bG: x0 => x0.selectionStart,
      bH: x0 => x0.v8BreakIterator,
      bI: x0 => x0.table,
      bJ: (x0,x1) => { x0.oncomplete = x1 },
      bK: () => new WeakMap(),
      bL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      bM: x0 => ({autoIncrement: x0}),
      bN: (x0,x1,x2) => x0.put(x1,x2),
      bO: x0 => x0.signal,
      bP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.type,
      cE: (x0,x1) => x0.unregister(x1),
      cF: (x0,x1) => { x0.content = x1 },
      cG: x0 => x0.selectionEnd,
      cH: () => globalThis.Intl,
      cI: x0 => x0.kind,
      cJ: (x0,x1) => x0.objectStore(x1),
      cK: (map, o) => map.get(o),
      cL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      cM: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      cN: x0 => x0.caches,
      cO: x0 => x0.update(),
      cP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.maxTouchPoints,
      dE: (x0,x1) => x0.contains(x1),
      dF: (x0,x1) => { x0.name = x1 },
      dG: x0 => x0.keyCode,
      dH: (x0,x1) => x0.segment(x1),
      dI: x0 => x0.data,
      dJ: (x0,x1) => x0.sqlite3_get_autocommit(x1),
      dK: (x0,x1) => globalThis.Atomics.load(x0,x1),
      dL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      dM: x0 => ({unique: x0}),
      dN: (x0,x1) => x0.match(x1),
      dO: x0 => x0.hostElement,
      dP: x0 => x0.files,
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.platform,
      eE: (s) => +s,
      eF: x0 => x0.head,
      eG: (x0,x1) => x0.scrollIntoView(x1),
      eH: x0 => x0.index,
      eI: x0 => x0.close(),
      eJ: (x0,x1) => x0.sqlite3_finalize(x1),
      eK: (x0,x1,x2) => globalThis.Atomics.wait(x0,x1,x2),
      eL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      eM: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      eN: x0 => x0.arrayBuffer(),
      eO: x0 => x0.location,
      eP: x0 => x0.target,
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o) => new DataView(b, o),
      fC: x0 => x0.length,
      fD: x0 => x0.body,
      fE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      fF: (x0,x1) => x0.removeChild(x1),
      fG: x0 => x0.multiViewEnabled,
      fH: x0 => x0.next(),
      fI: x0 => x0.locks,
      fJ: (x0,x1) => x0.sqlite3_reset(x1),
      fK: (x0,x1,x2) => globalThis.Atomics.notify(x0,x1,x2),
      fL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fM: (x0,x1) => x0.createObjectStore(x1),
      fN: x0 => globalThis.fetch(x0),
      fO: (x0,x1) => x0.getModifierState(x1),
      fP: (x0,x1) => { x0.accept = x1 },
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: () => globalThis.document,
      gE: s => s.trim(),
      gF: x0 => x0.firstChild,
      gG: (x0,x1) => x0.replaceWith(x1),
      gH: x0 => x0.value,
      gI: () => globalThis.navigator,
      gJ: x0 => x0.buffer,
      gK: (x0,x1,x2) => globalThis.Atomics.store(x0,x1,x2),
      gL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      gM: x0 => x0.oldVersion,
      gN: x0 => x0.arrayBuffer(),
      gO: x0 => x0.metaKey,
      gP: (x0,x1) => { x0.multiple = x1 },
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      hE: x0 => x0.classList,
      hF: x0 => x0.viewConstraints,
      hG: (x0,x1) => { x0.type = x1 },
      hH: x0 => x0.done,
      hI: () => new AbortController(),
      hJ: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      hK: (x0,x1,x2) => x0.setInt32(x1,x2),
      hL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      hM: () => globalThis.indexedDB,
      hN: x0 => ({type: x0}),
      hO: x0 => x0.altKey,
      hP: (x0,x1) => { x0.draggable = x1 },
      i: x0 => new Promise(x0),
      iB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      iC: (a, i) => a[i],
      iD: x0 => x0.hasFocus(),
      iE: x0 => x0.preventDefault(),
      iF: x0 => x0.hostElement,
      iG: (x0,x1) => { x0.className = x1 },
      iH: (o, m, a) => o[m].apply(o, a),
      iI: () => ({}),
      iJ: (x0,x1) => x0.sqlite3_errstr(x1),
      iK: (x0,x1,x2) => x0.setBigInt64(x1,x2),
      iL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      iM: (x0,x1) => ({name: x0,length: x1}),
      iN: (x0,x1) => new Blob(x0,x1),
      iO: x0 => x0.ctrlKey,
      iP: (x0,x1) => { x0.type = x1 },
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.relatedTarget,
      jE: x0 => x0.parent,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: (x0,x1) => { x0.tabIndex = x1 },
      jH: x0 => x0.iterator,
      jI: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      jJ: (x0,x1) => x0.sqlite3_errmsg(x1),
      jK: x0 => new Worker(x0),
      jL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      jM: (x0,x1) => x0.update(x1),
      jN: (x0,x1) => x0.append(x1),
      jO: x0 => x0.isComposing,
      jP: x0 => x0.close(),
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: (t, s) => t.set(s),
      kC: (x0,x1) => x0.test(x1),
      kD: x0 => x0.shiftKey,
      kE: x0 => x0.timeStamp,
      kF: x0 => ({runApp: x0}),
      kG: (x0,x1) => { x0.name = x1 },
      kH: () => globalThis.Symbol,
      kI: (x0,x1,x2,x3) => x0.request(x1,x2,x3),
      kJ: (x0,x1) => x0.sqlite3_error_offset(x1),
      kK: (x0,x1,x2) => new DataView(x0,x1,x2),
      kL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      kM: x0 => x0.name,
      kN: x0 => x0.click(),
      kO: x0 => x0.code,
      kP: x0 => x0.disconnect(),
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: (decoder, codeUnits) => decoder.decode(codeUnits),
      lE: (x0,x1) => x0.hasAttribute(x1),
      lF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      lG: (x0,x1) => { x0.placeholder = x1 },
      lH: (x0,x1) => new Intl.Segmenter(x0,x1),
      lI: x0 => x0.name,
      lJ: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      lK: () => globalThis.Uint8Array,
      lL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      lM: x0 => globalThis.IDBKeyRange.only(x0),
      lN: x0 => x0.remove(),
      lO: x0 => x0.repeat,
      lP: (x0,x1) => { x0.src = x1 },
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: () => new TextDecoder("utf-8", {fatal: true}),
      mE: x0 => x0.buttons,
      mF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      mG: (x0,x1) => { x0.autocomplete = x1 },
      mH: x0 => x0.Segmenter,
      mI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      mJ: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      mK: x0 => x0.communicationBuffer,
      mL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      mM: (x0,x1,x2) => x0.put(x1,x2),
      mN: x0 => globalThis.URL.revokeObjectURL(x0),
      mO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      mP: x0 => x0.pause(),
      n: (o0, o1) => [o0, o1],
      nB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      nC: Function.prototype.call.bind(String.prototype.toLowerCase),
      nD: () => new TextDecoder("utf-8", {fatal: false}),
      nE: x0 => x0.ctrlKey,
      nF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      nG: (x0,x1) => { x0.name = x1 },
      nH: x0 => x0.buffer,
      nI: (o, p, v) => o[p] = v,
      nJ: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      nK: () => globalThis.Int32Array,
      nL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      nM: (x0,x1) => x0.getKey(x1),
      nN: x0 => x0.body,
      nO: x0 => globalThis.Wakelock.toggle(x0),
      nP: x0 => x0.currentTime,
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: (a, i, v) => a[i] = v,
      oE: x0 => x0.y,
      oF: o => o.byteLength,
      oG: (x0,x1) => { x0.placeholder = x1 },
      oH: x0 => x0.wasmMemory,
      oI: (o,s,v) => o[s] = v,
      oJ: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      oK: x0 => x0.byteLength,
      oL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      oM: (x0,x1) => x0.delete(x1),
      oN: () => globalThis.document,
      oO: (x0,x1) => x0.appendChild(x1),
      oP: x0 => x0.resume(),
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      pC: x0 => x0.vendor,
      pD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      pE: x0 => x0.x,
      pF: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      pG: (x0,x1) => { x0.action = x1 },
      pH: () => globalThis.window._flutter_skwasmInstance,
      pI: () => Symbol("jsBoxedDartObjectProperty"),
      pJ: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      pK: x0 => x0.synchronizationBuffer,
      pL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      pM: (x0,x1) => x0.put(x1),
      pN: (x0,x1) => { x0.download = x1 },
      pO: x0 => x0.id,
      pP: x0 => x0.play(),
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: Function.prototype.call.bind(DataView.prototype.getInt32),
      qC: (x0,x1) => x0.createTextNode(x1),
      qD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      qE: x0 => x0.scrollTop,
      qF: x0 => x0.history,
      qG: (x0,x1) => { x0.method = x1 },
      qH: () => new TextDecoder(),
      qI: (x0,x1) => x0.call(x1),
      qJ: x0 => globalThis.Number(x0),
      qK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qM: (x0,x1,x2) => x0.postMessage(x1,x2),
      qN: (x0,x1) => { x0.href = x1 },
      qO: (x0,x1) => { x0.id = x1 },
      qP: (x0,x1) => { x0.currentTime = x1 },
      r: (o, p) => o[p],
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      rC: (x0,x1) => { x0.id = x1 },
      rD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      rE: x0 => x0.offsetTop,
      rF: x0 => x0.search,
      rG: (x0,x1) => { x0.noValidate = x1 },
      rH: x0 => x0.debugSkipFontRetryDelay,
      rI: x0 => x0.abort(),
      rJ: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      rK: (x0,x1,x2) => x0.postMessage(x1,x2),
      rL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      rM: x0 => x0.randomUUID(),
      rN: (x0,x1) => x0.createElement(x1),
      rO: (x0,x1) => { x0.src = x1 },
      rP: x0 => x0.state,
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: x0 => x0.visibilityState,
      sE: x0 => x0.scrollLeft,
      sF: x0 => x0.location,
      sG: (x0,x1) => x0.removeAttribute(x1),
      sH: (x0,x1,x2) => x0.set(x1,x2),
      sI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      sJ: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      sK: x0 => new SharedArrayBuffer(x0),
      sL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sM: () => globalThis.crypto,
      sN: x0 => x0.maxTouchPoints,
      sO: (x0,x1) => { x0.async = x1 },
      sP: () => new AudioContext(),
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      tE: x0 => x0.offsetLeft,
      tF: x0 => x0.pathname,
      tG: x0 => x0.isConnected,
      tH: x0 => x0.fontFallbackBaseUrl,
      tI: (o, p) => p in o,
      tJ: (x0,x1) => x0.sqlite3_column_count(x1),
      tK: (x0,x1,x2,x3) => ({clientVersion: x0,root: x1,synchronizationBuffer: x2,communicationBuffer: x3}),
      tL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      tM: x0 => x0.port2,
      tN: x0 => x0.userAgent,
      tO: (x0,x1) => { x0.charset = x1 },
      tP: (x0,x1) => x0.createMediaElementSource(x1),
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: x0 => x0.disconnect(),
      uE: x0 => x0.offsetParent,
      uF: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      uG: x0 => x0.click(),
      uH: (handle) => clearInterval(handle),
      uI: x0 => x0.groups,
      uJ: (x0,x1) => x0.sqlite3_step(x1),
      uK: x0 => x0.close(),
      uL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      uM: x0 => x0.terminate(),
      uN: (x0,x1) => { x0.installPrompt = x1 },
      uO: (x0,x1) => { x0.type = x1 },
      uP: x0 => x0.createGain(),
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: Function.prototype.call.bind(DataView.prototype.getInt16),
      vC: (x0,x1) => x0.attachShadow(x1),
      vD: x0 => new Intl.Locale(x0),
      vE: (o, p, r) => o.replace(p, () => r),
      vF: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      vG: (x0,x1) => x0.getElementsByClassName(x1),
      vH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      vI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      vJ: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      vK: x0 => x0.getSize(),
      vL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      vM: (x0,x1) => new SharedWorker(x0,x1),
      vN: x0 => x0.installPrompt,
      vO: (x0,x1) => x0.querySelector(x1),
      vP: x0 => x0.createStereoPanner(),
      w: (l, r) => l === r,
      wB: o => o instanceof Uint8ClampedArray,
      wC: (x0,x1) => x0.createElement(x1),
      wD: x0 => x0.region,
      wE: (o, p, r) => o.replaceAll(p, () => r),
      wF: o => Object.keys(o),
      wG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      wH: () => Date.now(),
      wI: (a, s, e) => a.slice(s, e),
      wJ: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      wK: (x0,x1) => x0.truncate(x1),
      wL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      wM: x0 => x0.start(),
      wN: () => globalThis.totalArchery,
      wO: x0 => x0.head,
      wP: (x0,x1) => x0.connect(x1),
      x: x0 => x0.random(),
      xB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      xC: x0 => x0.scale,
      xD: x0 => x0.script,
      xE: x0 => x0.deltaMode,
      xF: x0 => x0.state,
      xG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      xH: (x0,x1,x2) => x0.insertBefore(x1,x2),
      xI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xJ: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      xK: x0 => ({at: x0}),
      xL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      xM: x0 => x0.port,
      xN: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      xO: (x0,x1) => x0.canShare(x1),
      xP: x0 => x0.load(),
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: x0 => x0.language,
      yE: x0 => x0.deltaY,
      yF: x0 => x0.hash,
      yG: (x0,x1) => x0.dispatchEvent(x1),
      yH: x0 => x0.id,
      yI: (x0,x1) => x0.postMessage(x1),
      yJ: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      yK: (x0,x1) => x0.write(x1),
      yL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      yM: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      yN: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      yO: (x0,x1) => x0.share(x1),
      yP: x0 => x0.destination,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.languages,
      zE: x0 => x0.deltaX,
      zF: x0 => x0.state,
      zG: (x0,x1) => x0.createEvent(x1),
      zH: x0 => x0.offsetHeight,
      zI: x0 => x0.close(),
      zJ: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      zK: (x0,x1,x2) => x0.write(x1,x2),
      zL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      zM: x0 => x0.persist(),
      zN: x0 => x0.updateReady,
      zO: x0 => x0.message,
      zP: (x0,x1) => { x0.value = x1 },

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
