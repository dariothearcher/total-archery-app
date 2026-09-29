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
      AJ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      AK: (x0,x1,x2) => x0.sqlite3_result_int64(x1,x2),
      AL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      AM: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      AN: x0 => x0.resume(),
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BF: x0 => x0.wheelDeltaX,
      BG: x0 => x0.parentElement,
      BH: x0 => x0.readText(),
      BI: () => Date.now(),
      BJ: (x0,x1) => x0.forEach(x1),
      BK: (x0,x1) => x0.sqlite3_result_null(x1),
      BL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BM: x0 => x0.click(),
      BN: x0 => x0.play(),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: x0 => new ResizeObserver(x0),
      CF: x0 => x0.key,
      CG: (x0,x1) => x0.querySelectorAll(x1),
      CH: x0 => x0.clipboard,
      CI: (x0,x1,x2) => x0.open(x1,x2),
      CJ: x0 => x0.name,
      CK: (x0,x1) => x0.sqlite3_value_blob(x1),
      CL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      CM: x0 => x0.remove(),
      CN: x0 => x0.state,
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
      DI: () => globalThis.window,
      DJ: x0 => x0.statusText,
      DK: (x0,x1) => x0.sqlite3_value_bytes(x1),
      DL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      DM: (o, a) => o + a,
      DN: () => new AudioContext(),
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
      EI: x0 => new WeakRef(x0),
      EJ: x0 => x0.url,
      EK: (x0,x1) => x0.sqlite3_value_text(x1),
      EL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      EM: x0 => x0.children,
      EN: (x0,x1) => x0.createMediaElementSource(x1),
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
      FI: x0 => x0.deref(),
      FJ: x0 => x0.status,
      FK: (x0,x1) => x0.sqlite3_value_double(x1),
      FL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      FM: x0 => x0.body,
      FN: x0 => x0.createGain(),
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: x0 => x0.documentElement,
      GF: x0 => x0.tiltY,
      GG: x0 => x0.performance,
      GH: x0 => x0.orientation,
      GI: () => globalThis.WeakRef,
      GJ: x0 => x0.getReader(),
      GK: (x0,x1) => x0.sqlite3_value_int64(x1),
      GL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      GM: (x0,x1) => { x0.download = x1 },
      GN: x0 => x0.createStereoPanner(),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.computedStyleMap(),
      HF: x0 => x0.tiltX,
      HG: (d, digits) => d.toFixed(digits),
      HH: (x0,x1) => x0.querySelector(x1),
      HI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      HJ: x0 => x0.read(),
      HK: (x0,x1) => x0.sqlite3_value_type(x1),
      HL: x0 => x0.pathname,
      HM: (x0,x1) => { x0.display = x1 },
      HN: (x0,x1) => x0.connect(x1),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: (x0,x1) => x0.get(x1),
      IF: x0 => x0.pointerType,
      IG: x0 => x0.maxHeight,
      IH: (x0,x1) => { x0.title = x1 },
      II: (a, s, e) => a.slice(s, e),
      IJ: x0 => x0.value,
      IK: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      IL: () => globalThis.WebAssembly,
      IM: x0 => x0.style,
      IN: x0 => x0.load(),
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
      JI: (o, p) => p in o,
      JJ: x0 => x0.done,
      JK: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      JL: x0 => x0.href,
      JM: (x0,x1) => { x0.href = x1 },
      JN: x0 => x0.destination,
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (x0,x1) => { x0.textContent = x1 },
      KF: x0 => x0.getCoalescedEvents(),
      KG: x0 => x0.minHeight,
      KH: x0 => x0.arrayBuffer(),
      KI: x0 => x0.groups,
      KJ: x0 => x0.cancel(),
      KK: x0 => x0.sqlite3_initialize(),
      KL: (x0,x1,x2) => x0.insertBefore(x1,x2),
      KM: x0 => ({files: x0}),
      KN: (x0,x1) => { x0.value = x1 },
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
      LI: (x0,x1) => x0.getRandomValues(x1),
      LJ: x0 => x0.body,
      LK: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      LL: x0 => x0.id,
      LM: () => ({}),
      LN: x0 => x0.gain,
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: x0 => x0.matches,
      MF: s => s.trimLeft(),
      MG: (x0,x1) => x0.removeProperty(x1),
      MH: x0 => x0.status,
      MI: () => globalThis.crypto,
      MJ: x0 => x0.headers,
      MK: (x0,x1) => new URL(x0,x1),
      ML: x0 => x0.offsetHeight,
      MM: (x0,x1,x2) => new File(x0,x1,x2),
      MN: x0 => x0.code,
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
      NI: l => new DataView(new ArrayBuffer(l)),
      NJ: x0 => x0.signal,
      NK: (x0,x1) => globalThis.fetch(x0,x1),
      NL: x0 => x0.offsetWidth,
      NM: (x0,x1) => { x0.type = x1 },
      NN: x0 => x0.message,
      O: o => o === undefined,
      OB: x0 => new Uint16Array(x0),
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: x0 => x0.matches,
      OF: x0 => x0.pop(),
      OG: x0 => x0.data,
      OH: x0 => x0.content,
      OI: x0 => globalThis.URL.createObjectURL(x0),
      OJ: (x0,x1) => x0.sqlite3_finalize(x1),
      OK: (x0,x1) => x0.sqlite3session_delete(x1),
      OL: x0 => x0.stopPropagation(),
      OM: x0 => ({type: x0}),
      ON: x0 => x0.error,
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      PF: x0 => x0.flags,
      PG: (x0,x1) => { x0.scrollTop = x1 },
      PH: x0 => x0.document,
      PI: x0 => new Blob(x0),
      PJ: (x0,x1) => x0.sqlite3_reset(x1),
      PK: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      PL: x0 => x0.disabled,
      PM: (x0,x1) => new Blob(x0,x1),
      PN: x0 => x0.duration,
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
      QI: () => new FileReader(),
      QJ: x0 => x0.buffer,
      QK: (x0,x1) => x0.unregister(x1),
      QL: (x0,x1) => { x0.min = x1 },
      QM: (x0,x1) => x0.append(x1),
      QN: (x0,x1) => { x0.playbackRate = x1 },
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RF: (x0,x1) => x0.error(x1),
      RG: (x0,x1) => { x0.value = x1 },
      RH: () => Date.now(),
      RI: (x0,x1) => x0.readAsArrayBuffer(x1),
      RJ: (x0,x1) => x0.sqlite3_errstr(x1),
      RK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RL: (x0,x1) => { x0.max = x1 },
      RM: (x0,x1) => { x0.target = x1 },
      RN: (x0,x1) => { x0.loop = x1 },
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
      SI: x0 => x0.result,
      SJ: (x0,x1) => x0.sqlite3_errmsg(x1),
      SK: x0 => new FinalizationRegistry(x0),
      SL: (x0,x1) => { x0.disabled = x1 },
      SM: x0 => x0.document,
      SN: (x0,x1) => { x0.crossOrigin = x1 },
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
      TI: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      TJ: (x0,x1) => x0.sqlite3_error_offset(x1),
      TK: () => globalThis.FinalizationRegistry,
      TL: (x0,x1) => { x0.scrollLeft = x1 },
      TM: (x0,x1) => x0.getElementById(x1),
      TN: (x0,x1) => { x0.preload = x1 },
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
      UI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      UJ: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      UK: (x0,x1) => x0.sqlite3changeset_finalize(x1),
      UL: (x0,x1) => { x0.spellcheck = x1 },
      UM: (x0,x1,x2) => x0.setAttribute(x1,x2),
      UN: x0 => x0.length,
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
      VI: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      VJ: (x0,x1) => x0.sqlite3_step(x1),
      VK: x0 => x0.exports,
      VL: (x0,x1) => { x0.disabled = x1 },
      VM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      VN: x0 => x0.getReader(),
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
      WI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WJ: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      WK: x0 => x0.call(),
      WL: (x0,x1) => x0.getContext(x1),
      WM: (x0,x1,x2) => x0.addEventListener(x1,x2),
      WN: x0 => x0.value,
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.clientY,
      XE: x0 => x0.language,
      XF: x0 => x0.innerWidth,
      XG: x0 => x0.selectionStart,
      XH: x0 => x0.first(),
      XI: () => new XMLHttpRequest(),
      XJ: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      XK: x0 => x0.instance,
      XL: (x0,x1) => { x0.height = x1 },
      XM: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      XN: x0 => x0.done,
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientX,
      YE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      YF: x0 => x0.height,
      YG: x0 => x0.selectionEnd,
      YH: x0 => x0.next(),
      YI: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      YJ: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      YK: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      YL: (x0,x1) => { x0.width = x1 },
      YM: (x0,x1) => { x0.innerHTML = x1 },
      YN: x0 => x0.read(),
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.changedTouches,
      ZE: () => globalThis.window.FinalizationRegistry,
      ZF: x0 => x0.width,
      ZG: x0 => x0.value,
      ZH: x0 => x0.current(),
      ZI: x0 => x0.send(),
      ZJ: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      ZK: (o, p, v) => o[p] = v,
      ZL: x0 => x0.canvasKitMaximumSurfaces,
      ZM: (x0,x1) => x0.querySelector(x1),
      ZN: x0 => x0.body,
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.offsetY,
      aE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aF: x0 => x0.clientHeight,
      aG: x0 => x0.selectionDirection,
      aH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      aI: x0 => x0.type,
      aJ: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      aK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aL: x0 => x0.hostElement,
      aM: (x0,x1) => x0.removeChild(x1),
      aN: x0 => x0.assetBase,
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
      bI: x0 => x0.response,
      bJ: x0 => globalThis.BigInt(x0),
      bK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      bL: x0 => x0.location,
      bM: x0 => x0.firstChild,
      bN: x0 => x0.loader,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.type,
      cE: (x0,x1) => x0.unregister(x1),
      cF: (x0,x1) => { x0.content = x1 },
      cG: x0 => x0.selectionEnd,
      cH: () => globalThis.Intl,
      cI: (x0,x1) => { x0.responseType = x1 },
      cJ: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      cK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      cL: (x0,x1) => x0.getModifierState(x1),
      cM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      cN: () => globalThis._flutter,
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.maxTouchPoints,
      dE: (x0,x1) => x0.contains(x1),
      dF: (x0,x1) => { x0.name = x1 },
      dG: x0 => x0.keyCode,
      dH: (x0,x1) => x0.segment(x1),
      dI: x0 => x0.vendor,
      dJ: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      dK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      dL: x0 => x0.metaKey,
      dM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.platform,
      eE: (s) => +s,
      eF: x0 => x0.head,
      eG: (x0,x1) => x0.scrollIntoView(x1),
      eH: x0 => x0.index,
      eI: x0 => x0.navigator,
      eJ: (x0,x1) => x0.dart_sqlite3_free(x1),
      eK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      eL: x0 => x0.altKey,
      eM: x0 => x0.length,
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
      fI: x0 => globalThis.fetch(x0),
      fJ: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      fK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      fL: x0 => x0.ctrlKey,
      fM: (x0,x1) => x0.item(x1),
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: () => globalThis.document,
      gE: s => s.trim(),
      gF: x0 => x0.firstChild,
      gG: (x0,x1) => x0.replaceWith(x1),
      gH: x0 => x0.value,
      gI: x0 => x0.arrayBuffer(),
      gJ: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      gK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      gL: x0 => x0.isComposing,
      gM: x0 => x0.size,
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      hE: x0 => x0.classList,
      hF: x0 => x0.viewConstraints,
      hG: (x0,x1) => { x0.type = x1 },
      hH: x0 => x0.done,
      hI: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      hJ: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      hK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hL: x0 => x0.code,
      hM: x0 => x0.name,
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
      iI: x0 => x0.arrayBuffer(),
      iJ: (x0,x1) => x0.sqlite3_changes(x1),
      iK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      iL: x0 => x0.repeat,
      iM: x0 => x0.type,
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.relatedTarget,
      jE: x0 => x0.parent,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: (x0,x1) => { x0.tabIndex = x1 },
      jH: x0 => x0.iterator,
      jI: (x0,x1) => x0.transferFromImageBitmap(x1),
      jJ: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      jK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
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
      kI: x0 => x0.height,
      kJ: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      kK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      kL: x0 => globalThis.Wakelock.toggle(x0),
      kM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: (decoder, codeUnits) => decoder.decode(codeUnits),
      lE: (x0,x1) => x0.hasAttribute(x1),
      lF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      lG: (x0,x1) => { x0.placeholder = x1 },
      lH: (x0,x1) => new Intl.Segmenter(x0,x1),
      lI: x0 => x0.width,
      lJ: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      lK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      lL: (x0,x1) => x0.appendChild(x1),
      lM: x0 => x0.files,
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: () => new TextDecoder("utf-8", {fatal: true}),
      mE: x0 => x0.buttons,
      mF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      mG: (x0,x1) => { x0.autocomplete = x1 },
      mH: x0 => x0.Segmenter,
      mI: x0 => x0.rasterEndMilliseconds,
      mJ: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      mK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      mL: x0 => x0.id,
      mM: x0 => x0.target,
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
      nI: x0 => x0.rasterStartMilliseconds,
      nJ: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      nK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      nL: (x0,x1) => x0.createElement(x1),
      nM: (x0,x1) => { x0.accept = x1 },
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: (a, i, v) => a[i] = v,
      oE: x0 => x0.y,
      oF: o => o.byteLength,
      oG: (x0,x1) => { x0.placeholder = x1 },
      oH: x0 => x0.wasmMemory,
      oI: x0 => x0.imageBitmaps,
      oJ: x0 => globalThis.Number(x0),
      oK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      oL: (x0,x1) => { x0.id = x1 },
      oM: (x0,x1) => { x0.multiple = x1 },
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
      pI: (x0,x1) => { x0.height = x1 },
      pJ: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      pK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      pL: (x0,x1) => { x0.src = x1 },
      pM: (x0,x1) => { x0.draggable = x1 },
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
      qI: (x0,x1) => { x0.width = x1 },
      qJ: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      qK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      qL: (x0,x1) => { x0.async = x1 },
      qM: (x0,x1) => { x0.type = x1 },
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
      rI: x0 => x0.convertToBlob(),
      rJ: (x0,x1) => x0.sqlite3_column_count(x1),
      rK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      rL: (x0,x1) => { x0.charset = x1 },
      rM: x0 => globalThis.URL.revokeObjectURL(x0),
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: x0 => x0.visibilityState,
      sE: x0 => x0.scrollLeft,
      sF: x0 => x0.location,
      sG: (x0,x1) => x0.removeAttribute(x1),
      sH: a => a.pop(),
      sI: (x0,x1,x2) => new ImageData(x0,x1,x2),
      sJ: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      sK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      sL: (x0,x1) => { x0.type = x1 },
      sM: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      tE: x0 => x0.offsetLeft,
      tF: x0 => x0.pathname,
      tG: x0 => x0.isConnected,
      tH: (map, o, v) => map.set(o, v),
      tI: (x0,x1) => x0.getContext(x1),
      tJ: (x0,x1) => x0.sqlite3_close_v2(x1),
      tK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      tL: (x0,x1) => x0.querySelector(x1),
      tM: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: x0 => x0.disconnect(),
      uE: x0 => x0.offsetParent,
      uF: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      uG: x0 => x0.click(),
      uH: (map, o) => map.get(o),
      uI: (x0,x1) => new OffscreenCanvas(x0,x1),
      uJ: (x0,x1,x2,x3,x4,x5,x6) => x0.dart_sqlite3_create_function_v2(x1,x2,x3,x4,x5,x6),
      uK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uL: x0 => x0.head,
      uM: x0 => x0.close(),
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
      vI: x0 => x0.abort(),
      vJ: (x0,x1,x2,x3) => x0.sqlite3_result_error(x1,x2,x3),
      vK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      vL: () => globalThis.document,
      vM: x0 => x0.disconnect(),
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
      wI: () => new AbortController(),
      wJ: (x0,x1,x2) => x0.sqlite3_result_subtype(x1,x2),
      wK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      wL: x0 => x0.userAgent,
      wM: (x0,x1) => { x0.src = x1 },
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
      xI: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      xJ: (x0,x1,x2,x3,x4) => x0.sqlite3_result_blob64(x1,x2,x3,x4),
      xK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      xL: (x0,x1) => x0.canShare(x1),
      xM: x0 => x0.pause(),
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: x0 => x0.language,
      yE: x0 => x0.deltaY,
      yF: x0 => x0.hash,
      yG: (x0,x1) => x0.dispatchEvent(x1),
      yH: x0 => x0.fontFallbackBaseUrl,
      yI: (x0,x1) => globalThis.fetch(x0,x1),
      yJ: (x0,x1,x2,x3,x4) => x0.sqlite3_result_text(x1,x2,x3,x4),
      yK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      yL: (x0,x1) => x0.share(x1),
      yM: x0 => x0.currentTime,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.languages,
      zE: x0 => x0.deltaX,
      zF: x0 => x0.state,
      zG: (x0,x1) => x0.createEvent(x1),
      zH: (handle) => clearInterval(handle),
      zI: (x0,x1) => x0.get(x1),
      zJ: (x0,x1,x2) => x0.sqlite3_result_double(x1,x2),
      zK: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      zL: x0 => x0.message,
      zM: (x0,x1) => { x0.currentTime = x1 },

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
