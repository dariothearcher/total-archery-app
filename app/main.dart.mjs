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
      AI: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      AJ: x0 => x0.data,
      AK: (x0,x1) => x0.sqlite3_close_v2(x1),
      AL: (x0,x1,x2) => new DataView(x0,x1,x2),
      AM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      AN: x0 => globalThis.IDBKeyRange.only(x0),
      AO: x0 => x0.url,
      AP: (x0,x1) => { x0.display = x1 },
      AQ: x0 => x0.error,
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BF: x0 => x0.wheelDeltaX,
      BG: x0 => x0.parentElement,
      BH: x0 => x0.readText(),
      BI: () => Date.now(),
      BJ: x0 => x0.close(),
      BK: (x0,x1) => x0.sqlite3_finalize(x1),
      BL: () => globalThis.Uint8Array,
      BM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BN: (x0,x1,x2) => x0.put(x1,x2),
      BO: x0 => x0.status,
      BP: x0 => x0.style,
      BQ: x0 => x0.duration,
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: x0 => new ResizeObserver(x0),
      CF: x0 => x0.key,
      CG: (x0,x1) => x0.querySelectorAll(x1),
      CH: x0 => x0.clipboard,
      CI: x0 => x0.update(),
      CJ: (x0,x1) => x0.postMessage(x1),
      CK: (x0,x1) => x0.sqlite3_reset(x1),
      CL: x0 => x0.communicationBuffer,
      CM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      CN: (x0,x1) => x0.getKey(x1),
      CO: x0 => x0.getReader(),
      CP: x0 => ({files: x0}),
      CQ: (x0,x1) => { x0.playbackRate = x1 },
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
      DI: () => globalThis.totalArchery,
      DJ: (x0,x1) => ({kind: x0,table: x1}),
      DK: (x0,x1) => x0.sqlite3_step(x1),
      DL: () => globalThis.Int32Array,
      DM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      DN: (x0,x1) => x0.delete(x1),
      DO: x0 => x0.read(),
      DP: () => ({}),
      DQ: (x0,x1) => { x0.loop = x1 },
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
      EI: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      EJ: () => new AbortController(),
      EK: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      EL: x0 => x0.byteLength,
      EM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      EN: (x0,x1) => x0.put(x1),
      EO: x0 => x0.value,
      EP: (x0,x1,x2) => new File(x0,x1,x2),
      EQ: (x0,x1) => { x0.crossOrigin = x1 },
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
      FI: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      FJ: () => ({}),
      FK: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      FL: x0 => x0.synchronizationBuffer,
      FM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      FN: (x0,x1,x2) => x0.postMessage(x1,x2),
      FO: x0 => x0.done,
      FP: (x0,x1) => { x0.type = x1 },
      FQ: (x0,x1) => { x0.preload = x1 },
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: x0 => x0.documentElement,
      GF: x0 => x0.tiltY,
      GG: x0 => x0.performance,
      GH: x0 => x0.orientation,
      GI: x0 => x0.installPrompt,
      GJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      GK: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      GL: (x0,x1,x2) => x0.postMessage(x1,x2),
      GM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GN: x0 => x0.port2,
      GO: x0 => x0.cancel(),
      GP: (x0,x1) => { x0.target = x1 },
      GQ: x0 => x0.length,
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.computedStyleMap(),
      HF: x0 => x0.tiltX,
      HG: (d, digits) => d.toFixed(digits),
      HH: (x0,x1) => x0.querySelector(x1),
      HI: x0 => x0.updateReady,
      HJ: (x0,x1,x2,x3) => x0.request(x1,x2,x3),
      HK: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      HL: x0 => new SharedArrayBuffer(x0),
      HM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HN: x0 => x0.terminate(),
      HO: x0 => x0.body,
      HP: x0 => x0.document,
      HQ: x0 => x0.getReader(),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: (x0,x1) => x0.get(x1),
      IF: x0 => x0.pointerType,
      IG: x0 => x0.maxHeight,
      IH: (x0,x1) => { x0.title = x1 },
      II: (x0,x1) => { x0.onInstall = x1 },
      IJ: x0 => x0.name,
      IK: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      IL: (x0,x1,x2,x3) => ({clientVersion: x0,root: x1,synchronizationBuffer: x2,communicationBuffer: x3}),
      IM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      IN: (x0,x1) => new SharedWorker(x0,x1),
      IO: x0 => x0.headers,
      IP: (x0,x1) => x0.getElementById(x1),
      IQ: x0 => x0.value,
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
      JI: (x0,x1) => { x0.onUpdate = x1 },
      JJ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      JK: x0 => globalThis.BigInt(x0),
      JL: x0 => x0.close(),
      JM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      JN: x0 => x0.start(),
      JO: x0 => x0.signal,
      JP: (x0,x1,x2) => x0.setAttribute(x1,x2),
      JQ: x0 => x0.done,
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (x0,x1) => { x0.textContent = x1 },
      KF: x0 => x0.getCoalescedEvents(),
      KG: x0 => x0.minHeight,
      KH: x0 => x0.arrayBuffer(),
      KI: x0 => new WeakRef(x0),
      KJ: (o, p, v) => o[p] = v,
      KK: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      KL: x0 => x0.getSize(),
      KM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      KN: x0 => x0.port,
      KO: (x0,x1,x2) => x0.insertBefore(x1,x2),
      KP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KQ: x0 => x0.read(),
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
      LI: x0 => x0.deref(),
      LJ: (o,s,v) => o[s] = v,
      LK: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      LL: (x0,x1) => x0.truncate(x1),
      LM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      LN: x0 => x0.persist(),
      LO: x0 => x0.id,
      LP: (x0,x1,x2) => x0.addEventListener(x1,x2),
      LQ: x0 => x0.body,
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: x0 => x0.matches,
      MF: s => s.trimLeft(),
      MG: (x0,x1) => x0.removeProperty(x1),
      MH: x0 => x0.status,
      MI: () => globalThis.WeakRef,
      MJ: () => Symbol("jsBoxedDartObjectProperty"),
      MK: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      ML: x0 => ({at: x0}),
      MM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      MN: (x0,x1) => x0.match(x1),
      MO: x0 => x0.offsetHeight,
      MP: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      MQ: x0 => x0.assetBase,
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
      NI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      NJ: (x0,x1) => x0.call(x1),
      NK: (x0,x1) => x0.dart_sqlite3_free(x1),
      NL: (x0,x1) => x0.write(x1),
      NM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      NN: x0 => x0.arrayBuffer(),
      NO: x0 => x0.offsetWidth,
      NP: (x0,x1) => { x0.innerHTML = x1 },
      NQ: x0 => x0.loader,
      O: o => o === undefined,
      OB: x0 => new Uint16Array(x0),
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: x0 => x0.matches,
      OF: x0 => x0.pop(),
      OG: x0 => x0.data,
      OH: x0 => x0.content,
      OI: (a, s, e) => a.slice(s, e),
      OJ: x0 => x0.abort(),
      OK: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      OL: (x0,x1,x2) => x0.write(x1,x2),
      OM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      ON: x0 => globalThis.fetch(x0),
      OO: x0 => x0.stopPropagation(),
      OP: (x0,x1) => x0.querySelector(x1),
      OQ: () => globalThis._flutter,
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      PF: x0 => x0.flags,
      PG: (x0,x1) => { x0.scrollTop = x1 },
      PH: x0 => x0.document,
      PI: (o, p) => p in o,
      PJ: x0 => x0.locks,
      PK: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      PL: x0 => x0.createSyncAccessHandle(),
      PM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      PN: x0 => x0.arrayBuffer(),
      PO: x0 => x0.disabled,
      PP: (x0,x1) => x0.removeChild(x1),
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
      QI: x0 => x0.groups,
      QJ: () => globalThis.navigator,
      QK: (x0,x1) => x0.sqlite3_changes(x1),
      QL: x0 => ({create: x0}),
      QM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      QN: x0 => ({type: x0}),
      QO: (x0,x1) => { x0.min = x1 },
      QP: x0 => x0.firstChild,
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RF: (x0,x1) => x0.error(x1),
      RG: (x0,x1) => { x0.value = x1 },
      RH: () => Date.now(),
      RI: (x0,x1) => x0.getRandomValues(x1),
      RJ: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      RK: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      RL: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      RM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      RN: (x0,x1) => new Blob(x0,x1),
      RO: (x0,x1) => { x0.max = x1 },
      RP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
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
      SI: () => globalThis.crypto,
      SJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      SK: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      SL: x0 => ({create: x0}),
      SM: (x0,x1) => x0.getBigInt64(x1),
      SN: (x0,x1) => x0.append(x1),
      SO: (x0,x1) => { x0.disabled = x1 },
      SP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
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
      TI: l => new DataView(new ArrayBuffer(l)),
      TJ: (x0,x1) => x0.postMessage(x1),
      TK: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      TL: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      TM: (x0,x1) => x0.getInt32(x1),
      TN: x0 => x0.click(),
      TO: (x0,x1) => { x0.scrollLeft = x1 },
      TP: x0 => x0.length,
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
      UI: (x0,x1,x2) => x0.setItem(x1,x2),
      UJ: x0 => x0.close(),
      UK: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      UL: (x0,x1) => new URL(x0,x1),
      UM: (x0,x1) => x0.read(x1),
      UN: x0 => x0.remove(),
      UO: (x0,x1) => { x0.spellcheck = x1 },
      UP: (x0,x1) => x0.item(x1),
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
      VI: x0 => x0.localStorage,
      VJ: (x0,x1) => ({i: x0,p: x1}),
      VK: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      VL: x0 => x0.pathname,
      VM: (x0,x1,x2) => x0.read(x1,x2),
      VN: x0 => globalThis.URL.revokeObjectURL(x0),
      VO: (x0,x1) => { x0.disabled = x1 },
      VP: x0 => x0.size,
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
      WI: () => globalThis.window,
      WJ: () => new Array(),
      WK: x0 => globalThis.Number(x0),
      WL: x0 => x0.getDirectory(),
      WM: x0 => x0.flush(),
      WN: x0 => x0.body,
      WO: (x0,x1) => x0.getContext(x1),
      WP: x0 => x0.name,
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.clientY,
      XE: x0 => x0.language,
      XF: x0 => x0.innerWidth,
      XG: x0 => x0.selectionStart,
      XH: x0 => x0.first(),
      XI: (x0,x1) => x0.getItem(x1),
      XJ: (x0,x1) => ({c: x0,r: x1}),
      XK: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      XL: x0 => x0.storage,
      XM: () => globalThis.WebAssembly,
      XN: () => globalThis.document,
      XO: (x0,x1) => { x0.height = x1 },
      XP: x0 => x0.type,
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientX,
      YE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      YF: x0 => x0.height,
      YG: x0 => x0.selectionEnd,
      YH: x0 => x0.next(),
      YI: x0 => globalThis.URL.createObjectURL(x0),
      YJ: (x0,x1) => { x0.onmessage = x1 },
      YK: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      YL: () => globalThis.navigator,
      YM: x0 => x0.href,
      YN: (x0,x1) => { x0.download = x1 },
      YO: (x0,x1) => { x0.width = x1 },
      YP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.changedTouches,
      ZE: () => globalThis.window.FinalizationRegistry,
      ZF: x0 => x0.width,
      ZG: x0 => x0.value,
      ZH: x0 => x0.current(),
      ZI: x0 => new Blob(x0),
      ZJ: (o, a) => o == a,
      ZK: (x0,x1) => x0.sqlite3_column_count(x1),
      ZL: (x0,x1) => globalThis.fetch(x0,x1),
      ZM: (x0,x1) => x0.openCursor(x1),
      ZN: (x0,x1) => { x0.href = x1 },
      ZO: x0 => x0.canvasKitMaximumSurfaces,
      ZP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.offsetY,
      aE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aF: x0 => x0.clientHeight,
      aG: x0 => x0.selectionDirection,
      aH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      aI: () => new FileReader(),
      aJ: (o, t) => typeof o === t,
      aK: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      aL: (x0,x1) => x0.sqlite3session_delete(x1),
      aM: x0 => x0.arrayBuffer(),
      aN: (x0,x1) => x0.createElement(x1),
      aO: x0 => x0.hostElement,
      aP: x0 => x0.files,
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
      bI: (x0,x1) => x0.readAsArrayBuffer(x1),
      bJ: x0 => x0.r,
      bK: (x0,x1,x2,x3,x4,x5,x6) => x0.dart_sqlite3_create_function_v2(x1,x2,x3,x4,x5,x6),
      bL: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      bM: () => globalThis.Blob,
      bN: x0 => x0.maxTouchPoints,
      bO: x0 => x0.location,
      bP: x0 => x0.target,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.type,
      cE: (x0,x1) => x0.unregister(x1),
      cF: (x0,x1) => { x0.content = x1 },
      cG: x0 => x0.selectionEnd,
      cH: () => globalThis.Intl,
      cI: x0 => x0.result,
      cJ: x0 => x0.c,
      cK: (x0,x1,x2,x3) => x0.sqlite3_result_error(x1,x2,x3),
      cL: (x0,x1) => x0.unregister(x1),
      cM: x0 => x0.value,
      cN: x0 => x0.userAgent,
      cO: (x0,x1) => x0.getModifierState(x1),
      cP: (x0,x1) => { x0.accept = x1 },
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.maxTouchPoints,
      dE: (x0,x1) => x0.contains(x1),
      dF: (x0,x1) => { x0.name = x1 },
      dG: x0 => x0.keyCode,
      dH: (x0,x1) => x0.segment(x1),
      dI: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      dJ: x0 => x0.p,
      dK: (x0,x1,x2) => x0.sqlite3_result_subtype(x1,x2),
      dL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      dM: x0 => x0.key,
      dN: (x0,x1) => { x0.installPrompt = x1 },
      dO: x0 => x0.metaKey,
      dP: (x0,x1) => { x0.multiple = x1 },
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.platform,
      eE: (s) => +s,
      eF: x0 => x0.head,
      eG: (x0,x1) => x0.scrollIntoView(x1),
      eH: x0 => x0.index,
      eI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eJ: x0 => x0.i,
      eK: (x0,x1,x2,x3,x4) => x0.sqlite3_result_blob64(x1,x2,x3,x4),
      eL: x0 => new FinalizationRegistry(x0),
      eM: x0 => x0.continue(),
      eN: (x0,x1) => x0.matchMedia(x1),
      eO: x0 => x0.altKey,
      eP: (x0,x1) => { x0.draggable = x1 },
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
      fI: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      fJ: x0 => x0.port1,
      fK: (x0,x1,x2,x3,x4) => x0.sqlite3_result_text(x1,x2,x3,x4),
      fL: () => globalThis.FinalizationRegistry,
      fM: x0 => x0.error,
      fN: x0 => x0.matches,
      fO: x0 => x0.ctrlKey,
      fP: (x0,x1) => { x0.type = x1 },
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: () => globalThis.document,
      gE: s => s.trim(),
      gF: x0 => x0.firstChild,
      gG: (x0,x1) => x0.replaceWith(x1),
      gH: x0 => x0.value,
      gI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gJ: (x0,x1,x2) => x0.transaction(x1,x2),
      gK: (x0,x1,x2) => x0.sqlite3_result_double(x1,x2),
      gL: (x0,x1) => x0.sqlite3changeset_finalize(x1),
      gM: x0 => x0.result,
      gN: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      gO: x0 => x0.isComposing,
      gP: x0 => x0.close(),
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      hE: x0 => x0.classList,
      hF: x0 => x0.viewConstraints,
      hG: (x0,x1) => { x0.type = x1 },
      hH: x0 => x0.done,
      hI: () => new XMLHttpRequest(),
      hJ: x0 => x0.close(),
      hK: (x0,x1,x2) => x0.sqlite3_result_int64(x1,x2),
      hL: x0 => x0.exports,
      hM: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      hN: x0 => x0.arrayBuffer(),
      hO: x0 => x0.code,
      hP: x0 => x0.disconnect(),
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
      iI: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      iJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      iK: (x0,x1) => x0.sqlite3_result_null(x1),
      iL: x0 => x0.call(),
      iM: x0 => x0.length,
      iN: (x0,x1) => x0.transferFromImageBitmap(x1),
      iO: x0 => x0.repeat,
      iP: (x0,x1) => { x0.src = x1 },
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.relatedTarget,
      jE: x0 => x0.parent,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: (x0,x1) => { x0.tabIndex = x1 },
      jH: x0 => x0.iterator,
      jI: x0 => x0.send(),
      jJ: () => globalThis.Promise.resolve(),
      jK: (x0,x1) => x0.sqlite3_value_blob(x1),
      jL: x0 => x0.instance,
      jM: (x0,x1) => x0.get(x1),
      jN: x0 => x0.height,
      jO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jP: x0 => x0.pause(),
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
      kI: x0 => x0.type,
      kJ: (x0,x1) => x0.then(x1),
      kK: (x0,x1) => x0.sqlite3_value_bytes(x1),
      kL: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      kM: (x0,x1) => x0.index(x1),
      kN: x0 => x0.width,
      kO: x0 => globalThis.Wakelock.toggle(x0),
      kP: x0 => x0.currentTime,
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: (decoder, codeUnits) => decoder.decode(codeUnits),
      lE: (x0,x1) => x0.hasAttribute(x1),
      lF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      lG: (x0,x1) => { x0.placeholder = x1 },
      lH: (x0,x1) => new Intl.Segmenter(x0,x1),
      lI: x0 => x0.response,
      lJ: x0 => x0.abort(),
      lK: (x0,x1) => x0.sqlite3_value_text(x1),
      lL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      lM: x0 => x0.openKeyCursor(),
      lN: x0 => x0.rasterEndMilliseconds,
      lO: (x0,x1) => x0.appendChild(x1),
      lP: (x0,x1) => { x0.currentTime = x1 },
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: () => new TextDecoder("utf-8", {fatal: true}),
      mE: x0 => x0.buttons,
      mF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      mG: (x0,x1) => { x0.autocomplete = x1 },
      mH: x0 => x0.Segmenter,
      mI: (x0,x1) => { x0.responseType = x1 },
      mJ: x0 => x0.commit(),
      mK: (x0,x1) => x0.sqlite3_value_double(x1),
      mL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      mM: x0 => x0.primaryKey,
      mN: x0 => x0.rasterStartMilliseconds,
      mO: x0 => x0.id,
      mP: x0 => x0.resume(),
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
      nI: x0 => x0.vendor,
      nJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      nK: (x0,x1) => x0.sqlite3_value_int64(x1),
      nL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      nM: (x0,x1,x2) => x0.open(x1,x2),
      nN: x0 => x0.imageBitmaps,
      nO: (x0,x1) => { x0.id = x1 },
      nP: x0 => x0.play(),
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: (a, i, v) => a[i] = v,
      oE: x0 => x0.y,
      oF: o => o.byteLength,
      oG: (x0,x1) => { x0.placeholder = x1 },
      oH: x0 => x0.wasmMemory,
      oI: x0 => x0.navigator,
      oJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      oK: (x0,x1) => x0.sqlite3_value_type(x1),
      oL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      oM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      oN: (x0,x1) => { x0.height = x1 },
      oO: (x0,x1) => { x0.src = x1 },
      oP: x0 => x0.state,
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
      pI: (x0,x1) => x0.open(x1),
      pJ: (x0,x1) => { x0.onerror = x1 },
      pK: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      pL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      pM: (x0,x1) => { x0.onupgradeneeded = x1 },
      pN: (x0,x1) => { x0.width = x1 },
      pO: (x0,x1) => { x0.async = x1 },
      pP: () => new AudioContext(),
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
      qI: (x0,x1) => x0.delete(x1),
      qJ: x0 => new DOMException(x0),
      qK: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      qL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      qM: x0 => ({autoIncrement: x0}),
      qN: x0 => x0.convertToBlob(),
      qO: (x0,x1) => { x0.charset = x1 },
      qP: (x0,x1) => x0.createMediaElementSource(x1),
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
      rH: (a, i) => a.splice(i, 1),
      rI: x0 => new Response(x0),
      rJ: x0 => x0.error,
      rK: x0 => x0.sqlite3_initialize(),
      rL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      rM: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      rN: (x0,x1,x2) => new ImageData(x0,x1,x2),
      rO: (x0,x1) => { x0.type = x1 },
      rP: x0 => x0.createGain(),
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: x0 => x0.visibilityState,
      sE: x0 => x0.scrollLeft,
      sF: x0 => x0.location,
      sG: (x0,x1) => x0.removeAttribute(x1),
      sH: a => a.pop(),
      sI: (x0,x1,x2) => x0.put(x1,x2),
      sJ: (x0,x1) => { x0.onabort = x1 },
      sK: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      sL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      sM: x0 => ({unique: x0}),
      sN: (x0,x1) => x0.getContext(x1),
      sO: (x0,x1) => x0.querySelector(x1),
      sP: x0 => x0.createStereoPanner(),
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      tE: x0 => x0.offsetLeft,
      tF: x0 => x0.pathname,
      tG: x0 => x0.isConnected,
      tH: (map, o, v) => map.set(o, v),
      tI: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      tJ: (x0,x1) => { x0.oncomplete = x1 },
      tK: (x0,x1) => globalThis.Atomics.load(x0,x1),
      tL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      tM: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      tN: (x0,x1) => new OffscreenCanvas(x0,x1),
      tO: x0 => x0.head,
      tP: (x0,x1) => x0.connect(x1),
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: x0 => x0.disconnect(),
      uE: x0 => x0.offsetParent,
      uF: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      uG: x0 => x0.click(),
      uH: (map, o) => map.get(o),
      uI: x0 => x0.caches,
      uJ: (x0,x1) => x0.objectStore(x1),
      uK: (x0,x1,x2) => globalThis.Atomics.wait(x0,x1,x2),
      uL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uM: (x0,x1) => x0.createObjectStore(x1),
      uN: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      uO: (x0,x1) => x0.canShare(x1),
      uP: x0 => x0.load(),
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
      vH: () => new WeakMap(),
      vI: () => new MessageChannel(),
      vJ: x0 => x0.buffer,
      vK: (x0,x1,x2) => globalThis.Atomics.notify(x0,x1,x2),
      vL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      vM: x0 => x0.oldVersion,
      vN: (x0,x1) => globalThis.fetch(x0,x1),
      vO: (x0,x1) => x0.share(x1),
      vP: x0 => x0.destination,
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
      wH: x0 => x0.debugSkipFontRetryDelay,
      wI: x0 => new BroadcastChannel(x0),
      wJ: (x0,x1) => x0.sqlite3_errstr(x1),
      wK: (x0,x1,x2) => globalThis.Atomics.store(x0,x1,x2),
      wL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      wM: () => globalThis.indexedDB,
      wN: (x0,x1) => x0.get(x1),
      wO: x0 => x0.message,
      wP: (x0,x1) => { x0.value = x1 },
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
      xH: (x0,x1,x2) => x0.set(x1,x2),
      xI: x0 => globalThis.Array.isArray(x0),
      xJ: (x0,x1) => x0.sqlite3_errmsg(x1),
      xK: (x0,x1,x2) => x0.setInt32(x1,x2),
      xL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      xM: (x0,x1) => ({name: x0,length: x1}),
      xN: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      xO: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      xP: x0 => x0.gain,
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: x0 => x0.language,
      yE: x0 => x0.deltaY,
      yF: x0 => x0.hash,
      yG: (x0,x1) => x0.dispatchEvent(x1),
      yH: x0 => x0.fontFallbackBaseUrl,
      yI: x0 => x0.table,
      yJ: (x0,x1) => x0.sqlite3_error_offset(x1),
      yK: (x0,x1,x2) => x0.setBigInt64(x1,x2),
      yL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      yM: (x0,x1) => x0.update(x1),
      yN: (x0,x1) => x0.forEach(x1),
      yO: (o, a) => o + a,
      yP: x0 => x0.code,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.languages,
      zE: x0 => x0.deltaX,
      zF: x0 => x0.state,
      zG: (x0,x1) => x0.createEvent(x1),
      zH: (handle) => clearInterval(handle),
      zI: x0 => x0.kind,
      zJ: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      zK: x0 => new Worker(x0),
      zL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      zM: x0 => x0.name,
      zN: x0 => x0.statusText,
      zO: x0 => x0.children,
      zP: x0 => x0.message,

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
