// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/@sabasayer/module.core/dist/http-client/request-error.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestError = void 0;

class RequestError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }

}

exports.RequestError = RequestError;
},{}],"../node_modules/@sabasayer/module.core/dist/utils/url.utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.urlUtils = void 0;

class URLUtils {
  createBaseUrl(options) {
    var _a;

    const protocol = options.protocol ? `${options.protocol}:/` : "/";
    const currentHost = window.location.host;
    const hostName = options.hostName ? options.hostName : (_a = options.hostNames) === null || _a === void 0 ? void 0 : _a[currentHost];
    if (!hostName) throw "hostName or proper hostNames must be defined";
    const joined = [protocol, hostName, options.languagePrefix, options.prefix].filter(e => e).join("/");
    return this.ensureLastCharacterToBeSlash(joined);
  }

  ensureLastCharacterToBeSlash(baseUrl) {
    if (baseUrl[baseUrl.length - 1] != "/") return baseUrl + "/";
    return baseUrl;
  }

}

const urlUtils = new URLUtils();
exports.urlUtils = urlUtils;
},{}],"../node_modules/@sabasayer/module.core/dist/http-client/statics/request-error-type.enum.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnumRequestErrorType = void 0;
var EnumRequestErrorType;
exports.EnumRequestErrorType = EnumRequestErrorType;

(function (EnumRequestErrorType) {
  EnumRequestErrorType["aborted"] = "aborted";
  EnumRequestErrorType["serverError"] = "serverError";
})(EnumRequestErrorType || (exports.EnumRequestErrorType = EnumRequestErrorType = {}));
},{}],"../node_modules/@sabasayer/module.core/dist/http-client/fetch-http-client.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetchHTTPClient = void 0;

var _url = require("../utils/url.utils");

var _requestError = require("./request-error");

var _requestErrorType = require("./statics/request-error-type.enum");

class FetchHTTPClient {
  constructor(options) {
    this.pendingRequests = new Map();
    this.baseUrl = this.createBaseUrl(options);
    this.headers = options.headers;
    this.createErrorFn = options.createErrorFn;
    this.preventRequestDuplication = options.preventRequestDuplication;
  }

  createAbortController() {
    return new AbortController();
  }

  getPendingRequests() {
    return this.pendingRequests;
  }

  async get(url, options) {
    try {
      return await this.handleGet(url, options);
    } catch (e) {
      this.handleError(e, url);
    }
  }

  async post(url, data, options) {
    const key = this.createKey(url, data);

    try {
      return await this.handlePost({
        url,
        data,
        options,
        key
      });
    } catch (e) {
      this.handleError(e, key);
    }
  }

  async upload(url, formData) {
    try {
      return this.handleUpload(url, formData);
    } catch (e) {
      this.handleError(e, url);
    }
  }

  setHeader(key, value) {
    if (!this.headers) this.headers = {};
    this.headers[key] = value;
  }

  removeHeader(key) {
    var _a, _b;

    (_a = this.headers) === null || _a === void 0 ? true : delete _a[key];
    const isHeadersEmpty = !Object.keys((_b = this.headers) !== null && _b !== void 0 ? _b : {}).length;
    if (isHeadersEmpty) this.headers = undefined;
  }

  async handleUpload(url, formData) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "POST",
      headers: { ...this.headers,
        "Content-Type": "multipart/form-data"
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  createFetchInit(method, options, data) {
    const abortController = options === null || options === void 0 ? void 0 : options.abortController;
    const body = data ? JSON.stringify(data) : undefined;
    return {
      method,
      headers: this.headers,
      body: body,
      signal: abortController === null || abortController === void 0 ? void 0 : abortController.signal
    };
  }

  async handlePost(options) {
    const pendingRequest = this.pendingRequests.get(options.key);
    const init = this.createFetchInit("POST", options.options, options.data);
    let response = await this.createResponse({
      url: options.url,
      init,
      key: options.key,
      pendingRequest
    });
    this.pendingRequests.delete(options.key);
    return this.handleResponse(response);
  }

  createKey(url, data) {
    return `${url}_${data ? JSON.stringify(data) : ""}`;
  }

  async handleGet(url, options) {
    const pendingRequest = this.pendingRequests.get(url);
    const init = this.createFetchInit("GET", options);
    let response = await this.createResponse({
      url,
      init,
      key: url,
      pendingRequest
    });
    this.pendingRequests.delete(url);
    return this.handleResponse(response);
  }

  async createResponse(options) {
    if (options.pendingRequest) return await options.pendingRequest;
    const request = fetch(`${this.baseUrl}${options.url}`, options.init);
    if (this.preventRequestDuplication) this.pendingRequests.set(options.key, request);
    return await request;
  }

  async handleResponse(response) {
    if (response.ok) return response.json();
    await this.handleResponseError(response);
  }

  async handleResponseError(response) {
    if (this.createErrorFn) throw await this.createErrorFn(response);
    const body = response.body ? ` ${response.body}` : "";
    throw new Error(`${response.status}: ${response.statusText}.${body}`);
  }

  handleError(error, key) {
    this.pendingRequests.delete(key);
    if (error instanceof DOMException && error.name == "AbortError") throw new _requestError.RequestError(_requestErrorType.EnumRequestErrorType.aborted);
    throw new _requestError.RequestError(_requestErrorType.EnumRequestErrorType.serverError, error.message);
  }

  createBaseUrl(options) {
    if (options.baseUrl) return _url.urlUtils.ensureLastCharacterToBeSlash(options.baseUrl);
    return _url.urlUtils.createBaseUrl(options);
  }

}

exports.FetchHTTPClient = FetchHTTPClient;
},{"../utils/url.utils":"../node_modules/@sabasayer/module.core/dist/utils/url.utils.js","./request-error":"../node_modules/@sabasayer/module.core/dist/http-client/request-error.js","./statics/request-error-type.enum":"../node_modules/@sabasayer/module.core/dist/http-client/statics/request-error-type.enum.js"}],"../node_modules/@sabasayer/module.core/dist/http-client/types/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],"../node_modules/@sabasayer/module.core/dist/http-client/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  RequestError: true,
  FetchHTTPClient: true,
  EnumRequestErrorType: true
};
Object.defineProperty(exports, "RequestError", {
  enumerable: true,
  get: function () {
    return _requestError.RequestError;
  }
});
Object.defineProperty(exports, "FetchHTTPClient", {
  enumerable: true,
  get: function () {
    return _fetchHttpClient.FetchHTTPClient;
  }
});
Object.defineProperty(exports, "EnumRequestErrorType", {
  enumerable: true,
  get: function () {
    return _requestErrorType.EnumRequestErrorType;
  }
});

var _requestError = require("./request-error");

var _fetchHttpClient = require("./fetch-http-client");

var _requestErrorType = require("./statics/request-error-type.enum");

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
},{"./request-error":"../node_modules/@sabasayer/module.core/dist/http-client/request-error.js","./fetch-http-client":"../node_modules/@sabasayer/module.core/dist/http-client/fetch-http-client.js","./statics/request-error-type.enum":"../node_modules/@sabasayer/module.core/dist/http-client/statics/request-error-type.enum.js","./types":"../node_modules/@sabasayer/module.core/dist/http-client/types/index.js"}],"../node_modules/@sabasayer/module.core/dist/controller/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],"../node_modules/@sabasayer/module.core/dist/utils/env.utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isProduction = exports.isDevelopment = void 0;

const isDevelopment = () => "development" == "development";

exports.isDevelopment = isDevelopment;

const isProduction = () => !isDevelopment();

exports.isProduction = isProduction;
},{}],"../node_modules/@sabasayer/module.core/dist/logger/logger.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Logger = void 0;

class Logger {
  constructor(options) {
    var _a, _b;

    this.logStyle = "";
    this.disabled = false;
    this.logStyle = (_a = options === null || options === void 0 ? void 0 : options.logStyle) !== null && _a !== void 0 ? _a : "";
    this.disabled = (_b = options === null || options === void 0 ? void 0 : options.disabled) !== null && _b !== void 0 ? _b : false;
  }

  disable() {
    this.disabled = true;
  }

  enable() {
    this.disabled = false;
  }

  log(...args) {
    if (this.disabled) return;
    const nonObjects = args.filter(e => this.isPrimativeValue(e));
    const objects = args.filter(e => !this.isPrimativeValue(e));
    const joined = nonObjects.map(e => String(e)).join(" ");
    const primativeArgs = nonObjects.length ? [`%c${joined}`, this.logStyle] : [];
    console.log(...primativeArgs, ...objects);
  }

  logMethod() {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;
      const self = this;

      descriptor.value = function (...args) {
        var _a;

        let header = `${String(propertyKey)}()`;
        if ((_a = target.constructor) === null || _a === void 0 ? void 0 : _a.name) header = `${target.constructor.name} => ${header}`;
        self.log(header, ...args);
        return originalMethod === null || originalMethod === void 0 ? void 0 : originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }

  isPrimativeValue(value) {
    return typeof value !== "object" && typeof value !== "function";
  }

}

exports.Logger = Logger;
},{}],"../node_modules/@sabasayer/module.core/dist/logger/core.logger.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.coreLogger = void 0;

var _env = require("../utils/env.utils");

var _logger = require("./logger");

const coreLogger = new _logger.Logger({
  logStyle: "font-weight:500;border-left:3px solid black; color:#222; padding-left:3px;background-color: #ffffff;background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%);",
  disabled: (0, _env.isProduction)()
});
exports.coreLogger = coreLogger;
},{"../utils/env.utils":"../node_modules/@sabasayer/module.core/dist/utils/env.utils.js","./logger":"../node_modules/@sabasayer/module.core/dist/logger/logger.js"}],"../node_modules/@sabasayer/module.core/dist/module/core-module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModuleCore = void 0;

var _core = require("../logger/core.logger");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

class ModuleCore {
  constructor() {
    this.clients = new Map();
    this.providers = new Map();
    this.controllers = new Map();
    this.caches = new Map();
  }

  useDecorators(...decorators) {
    decorators.forEach(decorator => decorator.setModule(this));
    return this;
  }

  registerHttpClientImplementation(client, key) {
    const name = typeof key === "string" ? key : key.name;
    this.clients.set(name, client);
    return this;
  }

  registerHttpClient(client, options) {
    _core.coreLogger.log("registerHttpClient", client, options);

    const clientObj = new client(options);
    this.clients.set(client.name, clientObj);
    return this;
  }

  resolveHttpClient(client) {
    if (client) return this.resolveByConstructor(this.clients, client);else return this.clients.values().next().value;
  }

  registerProvider(provider, options) {
    var _a;

    const client = this.resolveHttpClient(options === null || options === void 0 ? void 0 : options.client);
    if (!client) throw new Error("Http-Client is not registered.");
    const name = (_a = options === null || options === void 0 ? void 0 : options.key) !== null && _a !== void 0 ? _a : provider.name;
    const providerObj = new provider(client);
    this.providers.set(name, providerObj);
    return this;
  }

  resolveProvider(key) {
    if (typeof key === "string") return this.providers.get(key);else return this.resolveByConstructor(this.providers, key);
  }

  registerController(controller, options) {
    var _a;

    const provider = this.resolveProvider(options.provider);
    if (!provider) return this;
    const name = (_a = options.key) !== null && _a !== void 0 ? _a : controller.name;
    const controllerObj = new controller(provider);
    this.controllers.set(name, controllerObj);
    return this;
  }

  resolveController(key) {
    if (typeof key === "string") return this.controllers.get(key);
    return this.resolveByConstructor(this.controllers, key);
  }

  registerCache(cache, key) {
    const name = key !== null && key !== void 0 ? key : cache.name;
    const cacheObj = new cache();
    this.caches.set(name, cacheObj);
    return this;
  }

  resolveCache(key) {
    if (typeof key === "string") return this.caches.get(key);
    return this.resolveByConstructor(this.caches, key);
  }

  clear() {
    this.clients.clear();
    this.providers.clear();
    this.controllers.clear();
    this.caches.clear();
  }

  resolveByConstructor(map, typeConstructor) {
    return map.get(typeConstructor.name);
  }

}

exports.ModuleCore = ModuleCore;

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "useDecorators", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerHttpClientImplementation", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerHttpClient", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerProvider", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerController", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerCache", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "clear", null);
},{"../logger/core.logger":"../node_modules/@sabasayer/module.core/dist/logger/core.logger.js"}],"../node_modules/@sabasayer/module.core/dist/module/create-module/create-module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createModule = void 0;

var _coreModule = require("../core-module");

const createModule = () => {
  return new _coreModule.ModuleCore();
};

exports.createModule = createModule;
},{"../core-module":"../node_modules/@sabasayer/module.core/dist/module/core-module.js"}],"../node_modules/@sabasayer/module.core/dist/module/decorators/injectable.decorators.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InjectableDecorators = void 0;

class InjectableDecorators {
  constructor() {
    this.module = null;
  }

  setModule(module) {
    this.module = module;
  }

  client(options) {
    return clientConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerHttpClient(clientConstructor, options);
    };
  }

  provider(options) {
    return providerConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerProvider(providerConstructor, options);
    };
  }

  controller(options) {
    return controllerConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerController(controllerConstructor, options);
    };
  }

  cache(key) {
    return cacheConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerCache(cacheConstructor, key);
    };
  }

}

exports.InjectableDecorators = InjectableDecorators;
},{}],"../node_modules/@sabasayer/module.core/dist/module/decorators/resolve.decorators.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResolveDecorators = void 0;

class ResolveDecorators {
  constructor() {
    this.module = null;
  }

  setModule(module) {
    this.module = module;
  }

  client(client) {
    return (target, key) => {
      var _a;

      const clientObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveHttpClient(client);
      if (!clientObj) return;
      this.defineProperty(target, key, clientObj);
    };
  }

  provider(provider) {
    return (target, key) => {
      var _a;

      const providerObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveProvider(provider);
      if (!providerObj) return;
      this.defineProperty(target, key, providerObj);
    };
  }

  controller(controller) {
    return (target, key) => {
      var _a;

      const controllerObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveController(controller);
      if (!controllerObj) return;
      this.defineProperty(target, key, controllerObj);
    };
  }

  cache(cache) {
    return (target, key) => {
      var _a;

      const cacheObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveCache(cache);
      if (!cacheObj) return;
      this.defineProperty(target, key, cacheObj);
    };
  }

  defineProperty(target, key, newValue) {
    Object.defineProperty(target, key, {
      get: () => newValue,
      enumerable: false,
      configurable: true
    });
  }

}

exports.ResolveDecorators = ResolveDecorators;
},{}],"../node_modules/@sabasayer/module.core/dist/module/decorators/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "InjectableDecorators", {
  enumerable: true,
  get: function () {
    return _injectable.InjectableDecorators;
  }
});
Object.defineProperty(exports, "ResolveDecorators", {
  enumerable: true,
  get: function () {
    return _resolve.ResolveDecorators;
  }
});

var _injectable = require("./injectable.decorators");

var _resolve = require("./resolve.decorators");
},{"./injectable.decorators":"../node_modules/@sabasayer/module.core/dist/module/decorators/injectable.decorators.js","./resolve.decorators":"../node_modules/@sabasayer/module.core/dist/module/decorators/resolve.decorators.js"}],"../node_modules/@sabasayer/module.core/dist/module/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  ModuleCore: true,
  createModule: true
};
Object.defineProperty(exports, "ModuleCore", {
  enumerable: true,
  get: function () {
    return _coreModule.ModuleCore;
  }
});
Object.defineProperty(exports, "createModule", {
  enumerable: true,
  get: function () {
    return _createModule.createModule;
  }
});

var _coreModule = require("./core-module");

var _createModule = require("./create-module/create-module");

var _index = require("./decorators/index");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _index[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index[key];
    }
  });
});
},{"./core-module":"../node_modules/@sabasayer/module.core/dist/module/core-module.js","./create-module/create-module":"../node_modules/@sabasayer/module.core/dist/module/create-module/create-module.js","./decorators/index":"../node_modules/@sabasayer/module.core/dist/module/decorators/index.js"}],"../node_modules/@sabasayer/module.core/dist/provider/core-provider.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreProvider = void 0;

class CoreProvider {
  constructor(client) {
    this.abortControllers = new Map();
    this.baseUrl = null;
    this.client = client;
  }

  async post(config, data, options) {
    let requestOptions = this.createRequestOptions(options);
    const computedUrl = this.createUrl(config.url);
    return this.tryClientRequest(() => this.client.post(computedUrl, data, requestOptions), options);
  }

  async cachablePost(config, data, options) {
    if (!this.cache) throw new Error("'cache' property must be defined.");
    const cached = this.getFromCache(config.cacheKey);
    if (cached != undefined) return cached;
    const response = await this.post(config, data, options);
    this.saveToCache(config.cacheKey, response);
    return response;
  }

  async get(url, options) {
    let requestOptions = this.createRequestOptions(options);
    const computedUrl = this.createUrl(url);
    return this.tryClientRequest(() => this.client.get(computedUrl, requestOptions), options);
  }

  async upload(url, formData) {
    const computedUrl = this.createUrl(url);
    return this.client.upload(computedUrl, formData);
  }

  getFromCache(key) {
    var _a;

    return (_a = this.cache) === null || _a === void 0 ? void 0 : _a.get(key);
  }

  saveToCache(key, value) {
    var _a;

    if (value != undefined) (_a = this.cache) === null || _a === void 0 ? void 0 : _a.set(key, value);
  }

  createUrl(url) {
    return this.baseUrl ? `${this.baseUrl}/${url}` : url;
  }

  async tryClientRequest(request, options) {
    try {
      const response = await request();
      this.clearAbortControllers(options);
      return response;
    } catch (e) {
      this.clearAbortControllers(options);
      throw e;
    }
  }

  createRequestOptions(options) {
    let requestOptions = {};
    requestOptions.abortController = this.handleAbortAndCreateAbortController(options);
    return requestOptions;
  }

  handleAbortAndCreateAbortController(options) {
    if (!(options === null || options === void 0 ? void 0 : options.raceId) || !this.client.createAbortController) return;
    let abortController = this.getAndAbortRacerRequests(options.raceId);
    abortController = this.client.createAbortController();
    this.abortControllers.set(options.raceId, abortController);
    return abortController;
  }

  getAndAbortRacerRequests(raceId) {
    let abortController = this.abortControllers.get(raceId);
    if (abortController) abortController.abort();
    return abortController;
  }

  clearAbortControllers(options) {
    if (!(options === null || options === void 0 ? void 0 : options.raceId)) return;
    this.abortControllers.delete(options === null || options === void 0 ? void 0 : options.raceId);
  }

}

exports.CoreProvider = CoreProvider;
},{}],"../node_modules/@sabasayer/module.core/dist/provider/types/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],"../node_modules/@sabasayer/module.core/dist/provider/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  CoreProvider: true
};
Object.defineProperty(exports, "CoreProvider", {
  enumerable: true,
  get: function () {
    return _coreProvider.CoreProvider;
  }
});

var _coreProvider = require("./core-provider");

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
},{"./core-provider":"../node_modules/@sabasayer/module.core/dist/provider/core-provider.js","./types":"../node_modules/@sabasayer/module.core/dist/provider/types/index.js"}],"../node_modules/@sabasayer/module.core/dist/cache/memory-cache.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MemoryCache = void 0;

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  set(key, value) {
    this.store.set(key, value);
  }

  get(key) {
    var _a;

    return (_a = this.store.get(key)) !== null && _a !== void 0 ? _a : null;
  }

  remove(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

}

exports.MemoryCache = MemoryCache;
},{}],"../../../node_modules/@sabasayer/utils/dist/src/data-group/data-group.util.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataGroupUtil = /** @class */ (function () {
    function DataGroupUtil() {
    }
    DataGroupUtil.toGroupModel = function (items, groupBy) {
        var groupModel = {};
        items.forEach(function (item) {
            var paramValue = groupBy(item);
            if (paramValue == undefined)
                return;
            var groupKey = (paramValue + "").trim();
            if (!groupModel.hasOwnProperty(groupKey)) {
                groupModel[groupKey] = [];
            }
            groupModel[groupKey].push(item);
        });
        return groupModel;
    };
    DataGroupUtil.toGroupItems = function (items, groupBy, itemChildProp, childGroupBy) {
        var list = [];
        items.forEach(function (item) {
            var paramValue = groupBy(item);
            if (paramValue == undefined)
                return;
            var groupKey = (paramValue + "").trim();
            var groupItem = list.find(function (e) { return e.key == groupKey; });
            if (!groupItem) {
                groupItem = {
                    key: groupKey,
                    values: [],
                    children: childGroupBy ? [] : undefined
                };
                list.push(groupItem);
            }
            groupItem.values.push(item);
        });
        if (childGroupBy && itemChildProp) {
            list.forEach(function (item) {
                var children = item.values.flatMap(function (v) { return itemChildProp(v) || []; });
                var childrenGroups = children.toGroupItems(childGroupBy);
                item.children = childrenGroups;
            });
        }
        return list;
    };
    return DataGroupUtil;
}());
exports.DataGroupUtil = DataGroupUtil;

},{}],"../../../node_modules/@sabasayer/utils/dist/src/extend/array/extend-array.js":[function(require,module,exports) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var data_group_util_1 = require("../../data-group/data-group.util");
var ExtendArray = /** @class */ (function () {
    function ExtendArray() {
        this.remove();
        this.last();
        this.findRemove();
        this.sum();
        this.pushIf();
        this.pushRange();
        this.forEachAsync();
        this.toGroupModel();
        this.toGroupModelValues();
        this.toGroupItems();
        this.distinct();
    }
    ExtendArray.prototype.last = function () {
        if (!!Array.prototype.last)
            return;
        Object.defineProperty(Array.prototype, "last", {
            value: function () {
                if (this.length > 0)
                    return this[this.length - 1];
            },
            enumerable: false,
            configurable: true
        });
    };
    ExtendArray.prototype.remove = function () {
        if (!!Array.prototype.remove)
            return;
        Object.defineProperty(Array.prototype, "remove", {
            value: function (elem) {
                var index = this.indexOf(elem);
                if (index > -1) {
                    this.splice(index, 1);
                }
                return index;
            },
            enumerable: false,
            configurable: true
        });
    };
    ExtendArray.prototype.findRemove = function () {
        if (!!Array.prototype.findRemove)
            return;
        Object.defineProperty(Array.prototype, "findRemove", {
            value: function (findFunction) {
                var _this = this;
                if (findFunction) {
                    var foundItems = this.filter(findFunction);
                    if (foundItems.length > 0) {
                        foundItems.forEach(function (item) {
                            _this.remove(item);
                        });
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
    };
    ExtendArray.prototype.pushIf = function () {
        if (!!Array.prototype.pushIf)
            return;
        Object.defineProperty(Array.prototype, "pushIf", {
            value: function (item, statement) {
                if (statement(this)) {
                    this.push(item);
                }
            },
            enumerable: false,
            configurable: true
        });
    };
    ExtendArray.prototype.pushRange = function () {
        if (!!Array.prototype.pushRange)
            return;
        Object.defineProperty(Array.prototype, "pushRange", {
            value: function (items, statement) {
                for (var i = 0, len = items.length; i < len; i++) {
                    if (!statement || statement(items[i]))
                        this.push(items[i]);
                }
            },
            enumerable: false,
            configurable: true
        });
    };
    ExtendArray.prototype.forEachAsync = function () {
        if (!!Array.prototype.forEachAsync)
            return;
        Object.defineProperty(Array.prototype, "forEachAsync", {
            value: function (callback) {
                return __awaiter(this, void 0, void 0, function () {
                    var index;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                index = 0;
                                _a.label = 1;
                            case 1:
                                if (!(index < this.length)) return [3 /*break*/, 4];
                                return [4 /*yield*/, callback(this[index], index, this)];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3:
                                index++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            },
            enumerable: false,
            configurable: true
        });
    };
    ExtendArray.prototype.toGroupModel = function () {
        if (!!Array.prototype.toGroupModel)
            return;
        Object.defineProperty(Array.prototype, "toGroupModel", {
            value: function (groupBy) {
                return data_group_util_1.DataGroupUtil.toGroupModel(this, groupBy);
            },
            enumerable: false,
            configurable: true
        });
    };
    ExtendArray.prototype.toGroupItems = function () {
        if (!!Array.prototype.toGroupItems)
            return;
        Object.defineProperty(Array.prototype, "toGroupItems", {
            value: function (groupBy, itemChildProp, childGroupBy) {
                return data_group_util_1.DataGroupUtil.toGroupItems(this, groupBy, itemChildProp, childGroupBy);
            },
            enumerable: false,
            configurable: true
        });
    };
    ExtendArray.prototype.toGroupModelValues = function () {
        if (!!Array.prototype.toGroupModelValues)
            return;
        Object.defineProperty(Array.prototype, "toGroupModelValues", {
            value: function (groupBy) {
                return Object.values(this.toGroupModel(groupBy));
            },
            enumerable: false,
            configurable: true
        });
    };
    ExtendArray.prototype.sum = function () {
        if (!!Array.prototype.sum)
            return;
        Object.defineProperty(Array.prototype, "sum", {
            value: function (statement) {
                var total = 0;
                for (var i = 0, _len = this.length; i < _len; i++) {
                    total += statement(this[i]);
                }
                return total;
            },
            enumerable: false,
            configurable: true
        });
    };
    ExtendArray.prototype.distinct = function () {
        if (!!Array.prototype.distinct)
            return;
        Object.defineProperty(Array.prototype, "distinct", {
            value: function () {
                return this.filter(function (e, index, arr) {
                    return arr.indexOf(e) === index;
                });
            },
            enumerable: false,
            configurable: true
        });
    };
    return ExtendArray;
}());
exports.ExtendArray = ExtendArray;

},{"../../data-group/data-group.util":"../../../node_modules/@sabasayer/utils/dist/src/data-group/data-group.util.js"}],"../../../node_modules/@sabasayer/utils/dist/src/extend/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var extend_array_1 = require("./array/extend-array");
exports.ExtendArray = extend_array_1.ExtendArray;

},{"./array/extend-array":"../../../node_modules/@sabasayer/utils/dist/src/extend/array/extend-array.js"}],"../../../node_modules/@sabasayer/utils/dist/src/position-calculate/position-calculate.util.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InvalidPositionState;
(function (InvalidPositionState) {
    InvalidPositionState[InvalidPositionState["biggerThenScreen"] = 1] = "biggerThenScreen";
    InvalidPositionState[InvalidPositionState["outOfScreen"] = 2] = "outOfScreen";
    InvalidPositionState[InvalidPositionState["collidesWithBannedAre"] = 3] = "collidesWithBannedAre";
})(InvalidPositionState = exports.InvalidPositionState || (exports.InvalidPositionState = {}));
var PositionCalculaterUtil = /** @class */ (function () {
    function PositionCalculaterUtil() {
    }
    PositionCalculaterUtil.offset = function (el) {
        var rect = el.getBoundingClientRect(), scrollLeft = window.pageXOffset || document.documentElement.scrollLeft, scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
    };
    PositionCalculaterUtil.createDimensions = function (el) {
        var offset = this.offset(el);
        return {
            left: offset.left,
            top: offset.top,
            height: el.offsetHeight,
            width: el.offsetWidth
        };
    };
    PositionCalculaterUtil.isDimensionOutOfScreen = function (dimension) {
        var outPositions = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        };
        var windowHeight = window.innerHeight + window.pageYOffset;
        var windowWidth = window.innerWidth + window.pageXOffset;
        if (dimension.left - this.outPositionTolerance < window.pageXOffset) {
            outPositions.left =
                window.pageXOffset -
                    (dimension.left - this.outPositionTolerance);
        }
        if (dimension.left + dimension.width + this.outPositionTolerance >
            windowWidth) {
            outPositions.right =
                dimension.left +
                    dimension.width +
                    this.outPositionTolerance -
                    windowWidth;
        }
        if (dimension.top - this.outPositionTolerance < window.pageYOffset) {
            outPositions.top =
                window.pageYOffset -
                    (dimension.top - this.outPositionTolerance);
        }
        if (dimension.top + dimension.height + this.outPositionTolerance >
            windowHeight) {
            outPositions.bottom =
                dimension.top +
                    dimension.height +
                    this.outPositionTolerance -
                    windowHeight;
        }
        return outPositions;
    };
    /**
     * calculates left value of align element relative to targer for centering
     * */
    PositionCalculaterUtil.horizontalCenter = function (target, align) {
        align.left = target.left - (align.width - target.width) / 2;
    };
    /**
     * calculates top value of align element relative to targer for centering
     * */
    PositionCalculaterUtil.verticalCenter = function (target, align) {
        align.top = target.top - (align.height - target.height) / 2;
    };
    PositionCalculaterUtil.shiftToFitScreen = function (dimensions, outPos) {
        if (outPos.top)
            dimensions.top += outPos.top + this.outPositionTolerance;
        if (outPos.bottom)
            dimensions.top -= outPos.bottom + this.outPositionTolerance;
        if (outPos.right)
            dimensions.left -= outPos.right + this.outPositionTolerance;
        if (outPos.left)
            dimensions.left += outPos.left + this.outPositionTolerance;
    };
    PositionCalculaterUtil.snapToBottom = function (snapTo, snap, enableMirror) {
        snap.top = snapTo.top + snapTo.height;
        this.horizontalCenter(snapTo, snap);
        var outPos = this.isDimensionOutOfScreen(snap);
        if (outPos.left)
            snap.left += outPos.left + this.outPositionTolerance;
        if (outPos.right)
            snap.left -= outPos.right + this.outPositionTolerance;
        if (outPos.bottom && enableMirror) {
            var snapResult = this.snapToTop(snapTo, snap, false);
            if (snapResult.top)
                this.shiftToFitScreen(snap, snapResult);
        }
        return outPos;
    };
    PositionCalculaterUtil.snapToTop = function (snapTo, snap, enableMirror) {
        snap.top = snapTo.top - snap.height;
        this.horizontalCenter(snapTo, snap);
        var outPos = this.isDimensionOutOfScreen(snap);
        if (outPos.left)
            snap.left += outPos.left + this.outPositionTolerance;
        if (outPos.right)
            snap.left -= outPos.right + this.outPositionTolerance;
        if (outPos.top && enableMirror) {
            var snapResult = this.snapToBottom(snapTo, snap, false);
            if (snapResult.bottom)
                this.shiftToFitScreen(snap, snapResult);
        }
        return outPos;
    };
    PositionCalculaterUtil.snapToLeft = function (snapTo, snap, enableMirror) {
        this.verticalCenter(snapTo, snap);
        snap.left = snapTo.left - snap.width;
        var outPos = this.isDimensionOutOfScreen(snap);
        if (outPos.top)
            snap.top += outPos.top + this.outPositionTolerance;
        if (outPos.bottom)
            snap.top -= outPos.bottom + this.outPositionTolerance;
        if (outPos.left && enableMirror) {
            var snapResult = this.snapToRight(snapTo, snap, false);
            if (snapResult.right)
                this.shiftToFitScreen(snap, snapResult);
        }
        return outPos;
    };
    PositionCalculaterUtil.snapToRight = function (snapTo, snap, enableMirror) {
        this.verticalCenter(snapTo, snap);
        snap.left = snapTo.left + snapTo.width;
        var outPos = this.isDimensionOutOfScreen(snap);
        if (outPos.top)
            snap.top += outPos.top + this.outPositionTolerance;
        if (outPos.bottom)
            snap.top -= outPos.bottom + this.outPositionTolerance;
        if (outPos.right && enableMirror) {
            var snapResult = this.snapToLeft(snapTo, snap, false);
            if (snapResult.left)
                this.shiftToFitScreen(snap, snapResult);
        }
        return outPos;
    };
    PositionCalculaterUtil.outPositionTolerance = 20;
    return PositionCalculaterUtil;
}());
exports.PositionCalculaterUtil = PositionCalculaterUtil;

},{}],"../../../node_modules/lodash.clonedeep/index.js":[function(require,module,exports) {
var global = arguments[3];

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @param {boolean} [isFull] Specify a clone including symbols.
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
  var result;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      if (isHostObject(value)) {
        return object ? value : {};
      }
      result = initCloneObject(isFunc ? {} : value);
      if (!isDeep) {
        return copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (!isArr) {
    var props = isFull ? getAllKeys(value) : keys(value);
  }
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
  });
  return result;
}

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(proto) {
  return isObject(proto) ? objectCreate(proto) : {};
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var result = new buffer.constructor(buffer.length);
  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor);
}

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor);
}

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Copies own symbol properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Creates an array of the own enumerable symbol properties of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, true, true);
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = cloneDeep;

},{}],"../../../node_modules/@sabasayer/utils/dist/src/uuid/uuid.util.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UuidUtil = /** @class */ (function () {
    function UuidUtil() {
    }
    UuidUtil.uuidv4 = function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (16 * Math.random()) | 0;
            return ("x" == c ? r : (r & 3) | 8).toString(16);
        });
    };
    return UuidUtil;
}());
exports.UuidUtil = UuidUtil;

},{}],"../../../node_modules/@sabasayer/utils/dist/src/data-tracker/data-tracker.util.js":[function(require,module,exports) {
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
var uuid_util_1 = require("../uuid/uuid.util");
var DataTrackerUtil = /** @class */ (function () {
    function DataTrackerUtil() {
    }
    DataTrackerUtil.registerData = function (data, id) {
        var uuid = (id !== null && id !== void 0 ? id : uuid_util_1.UuidUtil.uuidv4());
        this.dataStore[uuid] = lodash_clonedeep_1.default(data);
        return uuid;
    };
    DataTrackerUtil.isDataChanged = function (uid, data) {
        var oldData = this.dataStore[uid];
        if (!oldData)
            throw "this data is not registered";
        return JSON.stringify(oldData) != JSON.stringify(lodash_clonedeep_1.default(data));
    };
    DataTrackerUtil.dataStore = {};
    return DataTrackerUtil;
}());
exports.DataTrackerUtil = DataTrackerUtil;

},{"lodash.clonedeep":"../../../node_modules/lodash.clonedeep/index.js","../uuid/uuid.util":"../../../node_modules/@sabasayer/utils/dist/src/uuid/uuid.util.js"}],"../../../node_modules/@sabasayer/utils/dist/src/browser-language/browser-language.util.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BrowserLanguageUtil = /** @class */ (function () {
    function BrowserLanguageUtil() {
    }
    BrowserLanguageUtil.getBrowserLang = function () {
        if (!navigator)
            return "";
        var locale = "";
        if (navigator.languages != undefined) {
            locale = navigator.languages[0];
        }
        else {
            locale = navigator.language;
        }
        locale = locale.toLowerCase();
        return locale;
    };
    return BrowserLanguageUtil;
}());
exports.BrowserLanguageUtil = BrowserLanguageUtil;

},{}],"../../../node_modules/@sabasayer/utils/dist/src/browser-storage/browser-storage.util.js":[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BrowserStorageUtil = /** @class */ (function () {
    function BrowserStorageUtil() {
    }
    BrowserStorageUtil.isSupported = function () {
        try {
            var key = "__some_random_key_you_are_not_going_to_use__";
            this.storage.setItem(key, key);
            this.storage.removeItem(key);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    BrowserStorageUtil.clear = function () {
        if (this.isSupported()) {
            this.storage.clear();
        }
        else {
            this.inMemoryStorage = {};
        }
    };
    BrowserStorageUtil.getItem = function (name) {
        if (this.isSupported()) {
            return this.storage.getItem(name);
        }
        if (this.inMemoryStorage.hasOwnProperty(name)) {
            return this.inMemoryStorage[name];
        }
        return null;
    };
    BrowserStorageUtil.key = function (index) {
        if (this.isSupported()) {
            return this.storage.key(index);
        }
        else {
            return Object.keys(this.inMemoryStorage)[index] || null;
        }
    };
    BrowserStorageUtil.removeItem = function (name) {
        if (this.isSupported()) {
            this.storage.removeItem(name);
        }
        else {
            delete this.inMemoryStorage[name];
        }
    };
    BrowserStorageUtil.setItem = function (name, value) {
        if (this.isSupported()) {
            this.storage.setItem(name, value);
        }
        else {
            this.inMemoryStorage[name] = value;
        }
    };
    BrowserStorageUtil.storage = window.sessionStorage;
    BrowserStorageUtil.inMemoryStorage = {};
    return BrowserStorageUtil;
}());
exports.BrowserStorageUtil = BrowserStorageUtil;
var SessionStorageUtil = /** @class */ (function (_super) {
    __extends(SessionStorageUtil, _super);
    function SessionStorageUtil() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SessionStorageUtil.storage = window.sessionStorage;
    return SessionStorageUtil;
}(BrowserStorageUtil));
exports.SessionStorageUtil = SessionStorageUtil;
var LocalStorageUtil = /** @class */ (function (_super) {
    __extends(LocalStorageUtil, _super);
    function LocalStorageUtil() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocalStorageUtil.storage = window.localStorage;
    return LocalStorageUtil;
}(BrowserStorageUtil));
exports.LocalStorageUtil = LocalStorageUtil;

},{}],"../../../node_modules/@sabasayer/utils/dist/src/cache/cache-type.enum.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EnumCacheType;
(function (EnumCacheType) {
    EnumCacheType[EnumCacheType["Memory"] = 1] = "Memory";
    EnumCacheType[EnumCacheType["SessionStorage"] = 2] = "SessionStorage";
    EnumCacheType[EnumCacheType["LocalStorage"] = 3] = "LocalStorage";
    EnumCacheType[EnumCacheType["IndexedDB"] = 4] = "IndexedDB";
})(EnumCacheType = exports.EnumCacheType || (exports.EnumCacheType = {}));

},{}],"../../../node_modules/@sabasayer/utils/dist/src/cache/cache.util.js":[function(require,module,exports) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var browser_storage_util_1 = require("../browser-storage/browser-storage.util");
var cache_type_enum_1 = require("./cache-type.enum");
var CacheUtil = /** @class */ (function () {
    function CacheUtil() {
    }
    CacheUtil.addToCache = function (type, key, data) {
        if (data == undefined)
            return;
        switch (type) {
            case cache_type_enum_1.EnumCacheType.Memory:
                CacheUtil.addToMemory(key, data);
                break;
            case cache_type_enum_1.EnumCacheType.SessionStorage:
                CacheUtil.addToSessionStorage(key, data);
                break;
            case cache_type_enum_1.EnumCacheType.LocalStorage:
                CacheUtil.addToLocalStorage(key, data);
                break;
            case cache_type_enum_1.EnumCacheType.IndexedDB:
                //TODO: indexedDb set
                break;
        }
    };
    CacheUtil.getFromCache = function (type, key) {
        switch (type) {
            case cache_type_enum_1.EnumCacheType.Memory:
                return CacheUtil.getFromMemory(key);
            case cache_type_enum_1.EnumCacheType.SessionStorage:
                return CacheUtil.getFromSessionStorage(key);
            case cache_type_enum_1.EnumCacheType.LocalStorage:
                return CacheUtil.getFromLocalStorage(key);
            case cache_type_enum_1.EnumCacheType.IndexedDB:
                //TODO: indexedDb get
                break;
        }
    };
    CacheUtil.clearCache = function (type, key) {
        switch (type) {
            case cache_type_enum_1.EnumCacheType.Memory:
                return CacheUtil.clearMemory(key);
            case cache_type_enum_1.EnumCacheType.SessionStorage:
                return CacheUtil.clearSessionStorage(key);
            case cache_type_enum_1.EnumCacheType.LocalStorage:
                return CacheUtil.clearLocalStorage(key);
            case cache_type_enum_1.EnumCacheType.IndexedDB:
                //TODO: indexedDb get
                break;
        }
    };
    CacheUtil.cache = function (type) {
        return function (target, propertyKey, descriptor) {
            var originalMethod = descriptor.value;
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return __awaiter(this, void 0, void 0, function () {
                    var key, data, res;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                key = args.reduce(function (key, item) {
                                    key += "_" + JSON.stringify(item);
                                    return key;
                                }, "");
                                key = target.name + "_" + propertyKey.toString() + "_" + key;
                                data = CacheUtil.getFromCache(type, key);
                                if (data)
                                    return [2 /*return*/, data];
                                return [4 /*yield*/, originalMethod.apply(this, args)];
                            case 1:
                                res = _a.sent();
                                CacheUtil.addToCache(type, key, res);
                                return [2 /*return*/, res];
                        }
                    });
                });
            };
            return descriptor;
        };
    };
    CacheUtil.data = {};
    CacheUtil.addToMemory = function (key, data) {
        return (CacheUtil.data[key] = data);
    };
    CacheUtil.getFromMemory = function (key) { return CacheUtil.data[key]; };
    CacheUtil.clearMemory = function (key) { return delete CacheUtil.data[key]; };
    CacheUtil.addToLocalStorage = function (key, data) {
        return browser_storage_util_1.LocalStorageUtil.setItem(key, JSON.stringify(data));
    };
    CacheUtil.getFromLocalStorage = function (key) {
        var data = browser_storage_util_1.LocalStorageUtil.getItem(key);
        if (data)
            return JSON.parse(data);
        return null;
    };
    CacheUtil.clearLocalStorage = function (key) {
        browser_storage_util_1.LocalStorageUtil.removeItem(key);
    };
    CacheUtil.addToSessionStorage = function (key, data) {
        return browser_storage_util_1.SessionStorageUtil.setItem(key, JSON.stringify(data));
    };
    CacheUtil.getFromSessionStorage = function (key) {
        var data = browser_storage_util_1.SessionStorageUtil.getItem(key);
        if (data)
            return JSON.parse(data);
        return null;
    };
    CacheUtil.clearSessionStorage = function (key) {
        browser_storage_util_1.SessionStorageUtil.removeItem(key);
    };
    return CacheUtil;
}());
exports.CacheUtil = CacheUtil;

},{"../browser-storage/browser-storage.util":"../../../node_modules/@sabasayer/utils/dist/src/browser-storage/browser-storage.util.js","./cache-type.enum":"../../../node_modules/@sabasayer/utils/dist/src/cache/cache-type.enum.js"}],"../../../node_modules/@sabasayer/utils/dist/src/cache/cache.decorator.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cache_type_enum_1 = require("./cache-type.enum");
var cache_util_1 = require("./cache.util");
function cache(type) {
    return cache_util_1.CacheUtil.cache(type);
}
exports.cache = cache;
function cacheToMemory() {
    return cache_util_1.CacheUtil.cache(cache_type_enum_1.EnumCacheType.Memory);
}
exports.cacheToMemory = cacheToMemory;
function cacheToLocalStorage() {
    return cache_util_1.CacheUtil.cache(cache_type_enum_1.EnumCacheType.LocalStorage);
}
exports.cacheToLocalStorage = cacheToLocalStorage;
function cacheToSessionStorage() {
    return cache_util_1.CacheUtil.cache(cache_type_enum_1.EnumCacheType.SessionStorage);
}
exports.cacheToSessionStorage = cacheToSessionStorage;
function cacheToIndexedDB() {
    return cache_util_1.CacheUtil.cache(cache_type_enum_1.EnumCacheType.IndexedDB);
}
exports.cacheToIndexedDB = cacheToIndexedDB;

},{"./cache-type.enum":"../../../node_modules/@sabasayer/utils/dist/src/cache/cache-type.enum.js","./cache.util":"../../../node_modules/@sabasayer/utils/dist/src/cache/cache.util.js"}],"../../../node_modules/@sabasayer/utils/dist/src/date/date.util.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DateUtil = /** @class */ (function () {
    function DateUtil() {
    }
    DateUtil.removeSecondFromTimeSpan = function (timespan) {
        if (timespan.indexOf(":") > -1) {
            var arr = timespan.split(":");
            if (arr.length == 3) {
                return arr[0] + ":" + arr[1] + ":00";
            }
        }
        return "";
    };
    DateUtil.timeFormatFromApiDateString = function (dateString, hasSeconds) {
        if (dateString) {
            var date = new Date(dateString);
            if (date) {
                return this.timeFormat(date, hasSeconds);
            }
        }
        return "";
    };
    DateUtil.dateTimeFormatFromApiDateString = function (dateString) {
        if (dateString) {
            var date = new Date(dateString);
            if (date) {
                return this.dateTimeFormat(date);
            }
        }
        return "";
    };
    DateUtil.dateTimeFormat = function (date) {
        if (date) {
            var day = date.getDate();
            if (day <= 9)
                day = "0" + day;
            var month = date.getMonth() + 1;
            if (month <= 9)
                month = "0" + month;
            var hour = date.getHours();
            if (hour <= 9)
                hour = "0" + hour;
            var minute = date.getMinutes();
            if (minute <= 9)
                minute = "0" + minute;
            return day + "." + month + "." + date.getFullYear() + " " + hour + ":" + minute;
        }
        return "";
    };
    /**
     * converts backend date string to javascript date object
     * @param dateString string value of Date object
     */
    DateUtil.dateFormatFromApiDateString = function (dateString) {
        if (dateString) {
            var date = new Date(dateString);
            if (date) {
                return this.dateFormat(date);
            }
        }
        return "";
    };
    DateUtil.dateFormat = function (date) {
        if (date) {
            var day = date.getDate();
            if (day <= 9)
                day = "0" + day;
            var month = date.getMonth() + 1;
            if (month <= 9)
                month = "0" + month;
            return day + "." + month + "." + date.getFullYear();
        }
        return "";
    };
    DateUtil.timeFormat = function (date, hasSeconds) {
        if (date) {
            var hour = date.getHours();
            if (hour <= 9)
                hour = "0" + hour;
            var minute = date.getMinutes();
            if (minute <= 9)
                minute = "0" + minute;
            var second = date.getSeconds();
            if (second <= 9)
                second = "0" + second;
            var hourMinute = hour + ":" + minute;
            return "" + hourMinute + (hasSeconds ? ":" + second : "");
        }
        return "";
    };
    DateUtil.stringToDate = function (dateString) {
        var date;
        dateString = dateString.trim();
        if (dateString.indexOf(".") > -1) {
            var arr = dateString.split(".");
            if (arr.length == 3) {
                var hour = 0;
                var minute = 0;
                if (arr[2] && arr[2].indexOf(":") > -1) {
                    var yearAndTime = arr[2].split(" ");
                    if (yearAndTime.length == 2) {
                        var time = yearAndTime[1];
                        var hourMinute = time.split(":");
                        if (hourMinute.length > 1) {
                            hour = parseInt(hourMinute[0]);
                            minute = parseInt(hourMinute[1]);
                        }
                    }
                }
                var year = parseInt(arr[2]);
                var month = parseInt(arr[1]) - 1;
                var day = parseInt(arr[0]);
                if (month <= 12 && day <= 31 && hour <= 23 && minute <= 59)
                    date = new Date(year, month, day, hour, minute);
            }
        }
        return date;
    };
    DateUtil.dateFormatToApiDate = function (dateString) {
        if (this.checkDateStringFormatValidity(dateString)) {
            var date = this.stringToDate(dateString);
            if (date && this.checkDateValidity(date))
                return this.dateToApiDate(date);
        }
        return "";
    };
    DateUtil.checkDateValidity = function (date) {
        return date && date instanceof Date && !isNaN(date.getTime());
    };
    DateUtil.checkApiStringValidity = function (value) {
        var regex = new RegExp(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/g);
        return value && regex.test(value);
    };
    DateUtil.checkDateStringFormatValidity = function (value) {
        var date = this.stringToDate(value);
        return date && this.checkDateValidity(date);
    };
    DateUtil.checkTimeStringFormatValidity = function (value) {
        if (!value || value.indexOf(":") == -1)
            return false;
        return value.split(":").length > 1;
    };
    DateUtil.now = function () {
        return new Date();
    };
    DateUtil.nowApi = function (onlyDate) {
        return this.dateToApiDate(this.now(), onlyDate);
    };
    DateUtil.dateToApiDate = function (date, onlyDate, hideTimeZone) {
        var dateString = "";
        if (date) {
            var year = date.getFullYear();
            var month = date.getMonth();
            //month start from 0
            month += 1;
            var day = date.getDate();
            var hour = onlyDate ? 0 : date.getHours();
            var minute = onlyDate ? 0 : date.getMinutes();
            if (month <= 9)
                month = "0" + month;
            if (day <= 9)
                day = "0" + day;
            if (hour <= 9)
                hour = "0" + hour;
            if (minute <= 9)
                minute = "0" + minute;
            dateString = year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00";
        }
        return dateString;
    };
    DateUtil.apiDateToTimeSpan = function (date) {
        if (!date)
            return "";
        var dateObj = new Date(date);
        return this.dateToTimeSpan(dateObj);
    };
    DateUtil.dateToTimeSpan = function (date) {
        var timeSpan = "";
        if (date) {
            var hour = date.getHours();
            var minute = date.getMinutes();
            var second = date.getSeconds();
            if (hour <= 9)
                hour = "0" + hour;
            if (minute <= 9)
                minute = "0" + minute;
            if (second <= 9)
                second = "0" + second;
            timeSpan = hour + ":" + minute + ":" + second;
        }
        return timeSpan;
    };
    DateUtil.timeToHourAndMinute = function (time) {
        if (!time)
            return time;
        var arr = time.split(":");
        if (arr && arr.length == 3) {
            return arr[0] + ":" + arr[1];
        }
        return "";
    };
    DateUtil.setTimeOfApiDateString = function (date, time) {
        var hourMinute = time.split(":");
        if (hourMinute.length > 1) {
            var hour = parseInt(hourMinute[0]);
            var minute = parseInt(hourMinute[1]);
            var dateObj = new Date(date);
            dateObj.setHours(hour);
            dateObj.setMinutes(minute);
            return this.dateToApiDate(dateObj);
        }
    };
    DateUtil.addDaysToString = function (dateString, days) {
        var date = this.stringToDate(dateString);
        if (!date)
            return "";
        date.setDate(date.getDate() + days);
        return this.dateFormat(date);
    };
    DateUtil.addDaysToApiString = function (dateString, days) {
        dateString = dateString;
        var date = new Date(dateString);
        if (date && date instanceof Date && !isNaN(date)) {
            date.setDate(date.getDate() + days);
        }
        return this.dateToApiDate(date);
    };
    DateUtil.addMonthsToApiString = function (dateString, months) {
        dateString = dateString;
        var date = new Date(dateString);
        if (date && date instanceof Date && !isNaN(date)) {
            date.setMonth(date.getMonth() + months);
        }
        return this.dateToApiDate(date);
    };
    DateUtil.addYearsToApiString = function (dateString, years) {
        dateString = dateString;
        var date = new Date(dateString);
        if (date && date instanceof Date && !isNaN(date)) {
            date.setFullYear(date.getFullYear() + years);
        }
        return this.dateToApiDate(date);
    };
    DateUtil.timeBetweenTwoDate = function (date1, date2) {
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();
        var difference_ms = date2_ms - date1_ms;
        return difference_ms;
    };
    DateUtil.minutesBetweenTwoDate = function (date1, date2) {
        return this.timeBetweenTwoDate(date1, date2) / (1000 * 60);
    };
    DateUtil.hoursBetweenTwoDate = function (date1, date2) {
        return this.minutesBetweenTwoDate(date1, date2) / 60;
    };
    DateUtil.daysBetweenTwoDate = function (date1, date2) {
        var one_day = 1000 * 60 * 60 * 24;
        var difference_ms = this.timeBetweenTwoDate(date1, date2);
        return Math.round(difference_ms / one_day);
    };
    DateUtil.yearsBetweenTwoDate = function (date1, date2) {
        var one_year = 1000 * 60 * 60 * 24 * 365;
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();
        var difference_ms = date2_ms - date1_ms;
        return Math.round(difference_ms / one_year);
    };
    DateUtil.daysBetweenTwoApiDate = function (dateString1, dateString2) {
        var date1 = new Date(dateString1);
        var date2 = new Date(dateString2);
        if (!date1 || !date2)
            return 0;
        var one_day = 1000 * 60 * 60 * 24;
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();
        var difference_ms = date2_ms - date1_ms;
        return Math.round(difference_ms / one_day);
    };
    DateUtil.daysBetweenTwoStringDate = function (dateString1, dateString2) {
        var date1 = this.stringToDate(dateString1);
        var date2 = this.stringToDate(dateString2);
        if (!date1 || !date2)
            return 0;
        var one_day = 1000 * 60 * 60 * 24;
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();
        var difference_ms = date2_ms - date1_ms;
        return Math.round(difference_ms / one_day);
    };
    DateUtil.daysTillTodayString = function (dateString) {
        var date1 = this.stringToDate(dateString);
        if (!date1)
            return 0;
        var date2 = new Date();
        date2.setHours(0, 0, 0);
        var one_day = 1000 * 60 * 60 * 24;
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();
        var difference_ms = date2_ms - date1_ms;
        return Math.round(difference_ms / one_day);
    };
    DateUtil.howManyTimeAgoFromApiDate = function (dateString) {
        if (dateString) {
            var date = new Date(dateString);
            if (date) {
                return this.howManyTimeAgo(date);
            }
        }
        return "";
    };
    DateUtil.howManyTimeAgo = function (date, dayText, hourText, minuteText) {
        if (dayText === void 0) { dayText = "day"; }
        if (hourText === void 0) { hourText = "hour"; }
        if (minuteText === void 0) { minuteText = "minute"; }
        var now = new Date();
        var difference = (date.getTime() - now.getTime()) / (1000 * 60);
        if (difference < 0) {
            return "";
        }
        difference = parseInt(difference.toFixed(2));
        var differenceString = "";
        var differenceHour = Math.floor(difference / 60);
        var differenceMinute = difference % 60;
        if (differenceHour > 24) {
            var differenceDay = Math.floor(differenceHour / 24);
            differenceHour = differenceHour % 24;
            differenceString = differenceDay + " " + dayText;
        }
        if (differenceHour > 0) {
            differenceString += differenceHour + " " + hourText + " ";
        }
        if (differenceMinute > 0) {
            differenceString += differenceMinute + " " + minuteText;
        }
        return differenceString;
    };
    DateUtil.getMondayOfCurrentWeek = function (date) {
        var day = date.getDay();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (day == 0 ? -6 : 1) - day);
    };
    DateUtil.getSundayOfCurrentWeek = function (date) {
        var day = date.getDay();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (day == 0 ? 0 : 7) - day);
    };
    DateUtil.hoursBetweenTwoStringDate = function (dateString1, dateString2) {
        if (!dateString1 || !dateString2) {
            return "-";
        }
        var startDate = new Date(dateString1);
        var planDate = new Date(dateString2);
        var result = Math.floor(this.hoursBetweenTwoDate(startDate, planDate));
        if (result > 0) {
            return result.toString();
        }
        else {
            return "-";
        }
    };
    return DateUtil;
}());
exports.DateUtil = DateUtil;

},{}],"../../../node_modules/@sabasayer/utils/dist/src/decimal/decimal.util.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DecimalUtil = /** @class */ (function () {
    function DecimalUtil() {
    }
    DecimalUtil.toFixedNumber = function (value, precision) {
        if (value == undefined || isNaN(value))
            return 0;
        var str = value.toFixed((precision !== null && precision !== void 0 ? precision : 2));
        return parseFloat(str);
    };
    return DecimalUtil;
}());
exports.DecimalUtil = DecimalUtil;

},{}],"../../../node_modules/@sabasayer/utils/dist/src/dom/dom.util.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("../..");
var DomUtil = /** @class */ (function () {
    function DomUtil() {
    }
    DomUtil.findParentElement = function (el, classValue, id) {
        if (!classValue && !id)
            return null;
        var parentEl = el.parentElement;
        while (parentEl) {
            if ((id && parentEl.getAttribute("id") == id) ||
                (classValue &&
                    parentEl.classList &&
                    parentEl.classList.contains(classValue))) {
                break;
            }
            else {
                parentEl = parentEl.parentElement;
            }
        }
        return parentEl;
    };
    DomUtil.randomColor = function () {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
    };
    DomUtil.touchPositionInelement = function (event, parent) {
        var canvasOffset = __1.PositionCalculaterUtil.offset(parent);
        var firstTouch = event.touches[0];
        var x = firstTouch.clientX - canvasOffset.left;
        var y = firstTouch.clientY - canvasOffset.top;
        return { x: x, y: y };
    };
    DomUtil.checkIsAtTheBottom = function (options) {
        return (options.offsetHeight + options.scrollTop + options.margin >=
            options.scrollHeight);
    };
    DomUtil.handleInfineteScroll = function (element, callback, margin) {
        if (margin === void 0) { margin = 20; }
        var prevScrollTop = 0;
        element.addEventListener("scroll", function (e) {
            var scrollTop = element.scrollTop;
            var offsetHeight = element.offsetHeight;
            var scrollHeight = element.scrollHeight;
            var isNewScrollBigger = scrollTop > prevScrollTop;
            var isAtTheBottom = DomUtil.checkIsAtTheBottom({
                scrollHeight: scrollHeight,
                scrollTop: scrollTop,
                offsetHeight: offsetHeight,
                margin: margin,
            });
            if (isAtTheBottom && isNewScrollBigger) {
                callback(scrollTop);
            }
            prevScrollTop = scrollTop;
        });
    };
    return DomUtil;
}());
exports.DomUtil = DomUtil;

},{"../..":"../../../node_modules/@sabasayer/utils/dist/index.js"}],"../../../node_modules/@sabasayer/utils/dist/src/filter/filter.util.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_util_1 = require("../date/date.util");
var browser_language_util_1 = require("../browser-language/browser-language.util");
var FilterUtil = /** @class */ (function () {
    function FilterUtil() {
    }
    FilterUtil.compareFn = function (item, getProp, term) {
        var prop = getProp(item);
        if (!prop)
            false;
        term = term.trim().toLocaleLowerCase(browser_language_util_1.BrowserLanguageUtil.getBrowserLang());
        if (typeof prop === "string") {
            if (date_util_1.DateUtil.checkApiStringValidity(prop)) {
                var date = new Date(prop);
                date.setHours(0, 0, 0, 0);
                var dateString = date_util_1.DateUtil.dateToApiDate(date);
                term = term.toLowerCase();
                return dateString == term;
            }
            return (prop
                .toLocaleLowerCase(browser_language_util_1.BrowserLanguageUtil.getBrowserLang())
                .indexOf(term) > -1);
        }
        return prop == term;
    };
    FilterUtil.filter = function (items, getProp, term) {
        return items.filter(function (e) { return FilterUtil.compareFn(e, getProp, term); });
    };
    return FilterUtil;
}());
exports.FilterUtil = FilterUtil;

},{"../date/date.util":"../../../node_modules/@sabasayer/utils/dist/src/date/date.util.js","../browser-language/browser-language.util":"../../../node_modules/@sabasayer/utils/dist/src/browser-language/browser-language.util.js"}],"../../../node_modules/@sabasayer/utils/dist/src/map/map.decorator.js":[function(require,module,exports) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
function mapToArray(mapperFunction, after) {
    return map(mapperFunction, true, after);
}
exports.mapToArray = mapToArray;
function mapTo(mapperFunction, after) {
    return map(mapperFunction, false, after);
}
exports.mapTo = mapTo;
function map(mapperFunction, array, after) {
    return function (target, propertyKey, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var res, mapped;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, originalMethod.apply(this, args)];
                        case 1:
                            res = _a.sent();
                            if (!res) return [3 /*break*/, 6];
                            mapped = void 0;
                            if (!(array && res instanceof Array)) return [3 /*break*/, 3];
                            return [4 /*yield*/, Promise.all(res.map(mapperFunction))];
                        case 2:
                            mapped = _a.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, mapperFunction(res)];
                        case 4:
                            mapped = _a.sent();
                            _a.label = 5;
                        case 5:
                            if (after)
                                after(res, mapped);
                            return [2 /*return*/, mapped];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        return descriptor;
    };
}

},{}],"../../../node_modules/@sabasayer/utils/dist/src/sort/sort.util.js":[function(require,module,exports) {
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
var date_util_1 = require("../date/date.util");
var browser_language_util_1 = require("../browser-language/browser-language.util");
var SortUtil = /** @class */ (function () {
    function SortUtil() {
    }
    SortUtil.compareFn = function (prevValue, value, getProp, desc) {
        if (desc === void 0) { desc = false; }
        var _a, _b;
        var prevClone = lodash_clonedeep_1.default(prevValue);
        var valueClone = lodash_clonedeep_1.default(value);
        var x = (_a = getProp(prevClone), (_a !== null && _a !== void 0 ? _a : SortUtil.undefinedSortValue));
        var y = (_b = getProp(valueClone), (_b !== null && _b !== void 0 ? _b : SortUtil.undefinedSortValue));
        if (typeof x === "string" && typeof y === "string") {
            var xDateValue = new Date(x);
            var yDateValue = new Date(y);
            if (date_util_1.DateUtil.checkDateValidity(xDateValue) &&
                date_util_1.DateUtil.checkDateValidity(yDateValue)) {
                return this.sortNumberOrDate(xDateValue, yDateValue, desc);
            }
            x = x.toLocaleLowerCase(browser_language_util_1.BrowserLanguageUtil.getBrowserLang());
            y = y.toLocaleLowerCase(browser_language_util_1.BrowserLanguageUtil.getBrowserLang());
            var compareRes = x.localeCompare(y, browser_language_util_1.BrowserLanguageUtil.getBrowserLang());
            return desc ? compareRes * -1 : compareRes;
        }
        if (Number(x) && Number(y)) {
            return this.sortNumberOrDate(x, y, desc);
        }
        if (desc) {
            if (x < y) {
                return 1;
            }
            if (x > y) {
                return -1;
            }
        }
        else {
            if (x > y) {
                return 1;
            }
            if (x < y) {
                return -1;
            }
        }
        return 0;
    };
    SortUtil.sortNumberOrDate = function (x, y, desc) {
        if (desc) {
            if (x < y) {
                return 1;
            }
            if (x > y) {
                return -1;
            }
        }
        else {
            if (x > y) {
                return 1;
            }
            if (x < y) {
                return -1;
            }
        }
        return 0;
    };
    SortUtil.undefinedSortValue = "-999999999";
    return SortUtil;
}());
exports.SortUtil = SortUtil;

},{"lodash.clonedeep":"../../../node_modules/lodash.clonedeep/index.js","../date/date.util":"../../../node_modules/@sabasayer/utils/dist/src/date/date.util.js","../browser-language/browser-language.util":"../../../node_modules/@sabasayer/utils/dist/src/browser-language/browser-language.util.js"}],"../../../node_modules/@sabasayer/utils/dist/src/input/keyboard-key.enum.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EnumKeyboardKey;
(function (EnumKeyboardKey) {
    EnumKeyboardKey["ArrowUp"] = "ArrowUp";
    EnumKeyboardKey["ArrowDown"] = "ArrowDown";
    EnumKeyboardKey["ArrowRight"] = "ArrowRight";
    EnumKeyboardKey["ArrowLeft"] = "ArrowLeft";
    EnumKeyboardKey["Backspace"] = "Backspace";
    EnumKeyboardKey["Enter"] = "Enter";
    EnumKeyboardKey["Space"] = " ";
    EnumKeyboardKey["Dot"] = ".";
    EnumKeyboardKey["Minus"] = "-";
})(EnumKeyboardKey = exports.EnumKeyboardKey || (exports.EnumKeyboardKey = {}));

},{}],"../../../node_modules/@sabasayer/utils/dist/src/input/input.util.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var keyboard_key_enum_1 = require("./keyboard-key.enum");
var InputUtil = /** @class */ (function () {
    function InputUtil() {
    }
    InputUtil.isKeyAvailableOnNumberInput = function (evt, isOnlyInteger, enableNegative, decimalSeperatorChar) {
        if (decimalSeperatorChar === void 0) { decimalSeperatorChar = '.'; }
        if (evt.key == keyboard_key_enum_1.EnumKeyboardKey.Enter)
            return true;
        var value = evt.target.value;
        var keyIsNumber = !isNaN(evt.key);
        var cursorIndex = evt.target.selectionStart;
        if (enableNegative && evt.key == keyboard_key_enum_1.EnumKeyboardKey.Minus) {
            var intValue = parseFloat(value);
            if (intValue != 0 && value.indexOf("-") == -1 && cursorIndex == 0)
                return true;
            else
                evt.preventDefault();
        }
        else if (!isOnlyInteger && evt.key == decimalSeperatorChar) {
            if (value.indexOf(decimalSeperatorChar) == -1)
                return true;
            else
                evt.preventDefault();
        }
        else if (!keyIsNumber) {
            evt.preventDefault();
        }
        else {
            return true;
        }
    };
    return InputUtil;
}());
exports.InputUtil = InputUtil;

},{"./keyboard-key.enum":"../../../node_modules/@sabasayer/utils/dist/src/input/keyboard-key.enum.js"}],"../../../node_modules/@sabasayer/utils/dist/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var extend_1 = require("./src/extend");
exports.ExtendArray = extend_1.ExtendArray;
var position_calculate_util_1 = require("./src/position-calculate/position-calculate.util");
exports.PositionCalculaterUtil = position_calculate_util_1.PositionCalculaterUtil;
var data_tracker_util_1 = require("./src/data-tracker/data-tracker.util");
exports.DataTrackerUtil = data_tracker_util_1.DataTrackerUtil;
var browser_language_util_1 = require("./src/browser-language/browser-language.util");
exports.BrowserLanguageUtil = browser_language_util_1.BrowserLanguageUtil;
var browser_storage_util_1 = require("./src/browser-storage/browser-storage.util");
exports.SessionStorageUtil = browser_storage_util_1.SessionStorageUtil;
exports.LocalStorageUtil = browser_storage_util_1.LocalStorageUtil;
exports.BrowserStorageUtil = browser_storage_util_1.BrowserStorageUtil;
var cache_util_1 = require("./src/cache/cache.util");
exports.CacheUtil = cache_util_1.CacheUtil;
var cache_type_enum_1 = require("./src/cache/cache-type.enum");
exports.EnumCacheType = cache_type_enum_1.EnumCacheType;
var cache_decorator_1 = require("./src/cache/cache.decorator");
exports.cache = cache_decorator_1.cache;
exports.cacheToIndexedDB = cache_decorator_1.cacheToIndexedDB;
exports.cacheToLocalStorage = cache_decorator_1.cacheToLocalStorage;
exports.cacheToMemory = cache_decorator_1.cacheToMemory;
exports.cacheToSessionStorage = cache_decorator_1.cacheToSessionStorage;
var data_group_util_1 = require("./src/data-group/data-group.util");
exports.DataGroupUtil = data_group_util_1.DataGroupUtil;
var date_util_1 = require("./src/date/date.util");
exports.DateUtil = date_util_1.DateUtil;
var decimal_util_1 = require("./src/decimal/decimal.util");
exports.DecimalUtil = decimal_util_1.DecimalUtil;
var dom_util_1 = require("./src/dom/dom.util");
exports.DomUtil = dom_util_1.DomUtil;
var filter_util_1 = require("./src/filter/filter.util");
exports.FilterUtil = filter_util_1.FilterUtil;
var map_decorator_1 = require("./src/map/map.decorator");
exports.mapTo = map_decorator_1.mapTo;
exports.mapToArray = map_decorator_1.mapToArray;
var sort_util_1 = require("./src/sort/sort.util");
exports.SortUtil = sort_util_1.SortUtil;
var uuid_util_1 = require("./src/uuid/uuid.util");
exports.UuidUtil = uuid_util_1.UuidUtil;
var input_util_1 = require("./src/input/input.util");
exports.InputUtil = input_util_1.InputUtil;
var keyboard_key_enum_1 = require("./src/input/keyboard-key.enum");
exports.EnumKeyboardKey = keyboard_key_enum_1.EnumKeyboardKey;

},{"./src/extend":"../../../node_modules/@sabasayer/utils/dist/src/extend/index.js","./src/position-calculate/position-calculate.util":"../../../node_modules/@sabasayer/utils/dist/src/position-calculate/position-calculate.util.js","./src/data-tracker/data-tracker.util":"../../../node_modules/@sabasayer/utils/dist/src/data-tracker/data-tracker.util.js","./src/browser-language/browser-language.util":"../../../node_modules/@sabasayer/utils/dist/src/browser-language/browser-language.util.js","./src/browser-storage/browser-storage.util":"../../../node_modules/@sabasayer/utils/dist/src/browser-storage/browser-storage.util.js","./src/cache/cache.util":"../../../node_modules/@sabasayer/utils/dist/src/cache/cache.util.js","./src/cache/cache-type.enum":"../../../node_modules/@sabasayer/utils/dist/src/cache/cache-type.enum.js","./src/cache/cache.decorator":"../../../node_modules/@sabasayer/utils/dist/src/cache/cache.decorator.js","./src/data-group/data-group.util":"../../../node_modules/@sabasayer/utils/dist/src/data-group/data-group.util.js","./src/date/date.util":"../../../node_modules/@sabasayer/utils/dist/src/date/date.util.js","./src/decimal/decimal.util":"../../../node_modules/@sabasayer/utils/dist/src/decimal/decimal.util.js","./src/dom/dom.util":"../../../node_modules/@sabasayer/utils/dist/src/dom/dom.util.js","./src/filter/filter.util":"../../../node_modules/@sabasayer/utils/dist/src/filter/filter.util.js","./src/map/map.decorator":"../../../node_modules/@sabasayer/utils/dist/src/map/map.decorator.js","./src/sort/sort.util":"../../../node_modules/@sabasayer/utils/dist/src/sort/sort.util.js","./src/uuid/uuid.util":"../../../node_modules/@sabasayer/utils/dist/src/uuid/uuid.util.js","./src/input/input.util":"../../../node_modules/@sabasayer/utils/dist/src/input/input.util.js","./src/input/keyboard-key.enum":"../../../node_modules/@sabasayer/utils/dist/src/input/keyboard-key.enum.js"}],"../node_modules/@sabasayer/module.core/dist/cache/session-storage-cache.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SessionStorageCache = void 0;

var _utils = require("@sabasayer/utils");

class SessionStorageCache {
  set(key, value) {
    const stringValue = JSON.stringify(value);

    _utils.SessionStorageUtil.setItem(key, stringValue);
  }

  get(key) {
    const value = _utils.SessionStorageUtil.getItem(key);

    if (!value) return null;
    return JSON.parse(value);
  }

  remove(key) {
    _utils.SessionStorageUtil.removeItem(key);
  }

  clear() {
    _utils.SessionStorageUtil.clear();
  }

}

exports.SessionStorageCache = SessionStorageCache;
},{"@sabasayer/utils":"../../../node_modules/@sabasayer/utils/dist/index.js"}],"../node_modules/@sabasayer/module.core/dist/cache/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "MemoryCache", {
  enumerable: true,
  get: function () {
    return _memoryCache.MemoryCache;
  }
});
Object.defineProperty(exports, "SessionStorageCache", {
  enumerable: true,
  get: function () {
    return _sessionStorageCache.SessionStorageCache;
  }
});

var _memoryCache = require("./memory-cache");

var _sessionStorageCache = require("./session-storage-cache");
},{"./memory-cache":"../node_modules/@sabasayer/module.core/dist/cache/memory-cache.js","./session-storage-cache":"../node_modules/@sabasayer/module.core/dist/cache/session-storage-cache.js"}],"../node_modules/@sabasayer/module.core/dist/mapper/core-mapper.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreMapper = void 0;

class CoreMapper {
  constructor() {
    this.targetConfiguration = {
      fieldConfigurations: {}
    };
    this.sourceConfiguration = {
      fieldConfigurations: {}
    };
  }

  setTargetConfig(config) {
    this.targetConfiguration = { ...this.targetConfiguration,
      ...config
    };
  }

  setSourceConfig(config) {
    this.sourceConfiguration = { ...this.sourceConfiguration,
      ...config
    };
  }

  ignoreSourceFields(...sourceFields) {
    this.targetConfiguration.ignoredSourceFields = sourceFields;
  }

  ignoreTargetFields(...targetFields) {
    this.sourceConfiguration.ignoredSourceFields = targetFields;
  }

  forTarget(targetField, sourceValue) {
    this.targetConfiguration.fieldConfigurations[targetField] = sourceValue !== null && sourceValue !== void 0 ? sourceValue : targetField;
    return this;
  }

  forSource(sourceField, targetValue) {
    this.sourceConfiguration.fieldConfigurations[sourceField] = targetValue !== null && targetValue !== void 0 ? targetValue : sourceField;
    return this;
  }

  mapToTarget(source) {
    return this.map(source, this.targetConfiguration);
  }

  mapToSource(target) {
    return this.map(target, this.sourceConfiguration);
  }

  mapToTargetList(sources) {
    return sources === null || sources === void 0 ? void 0 : sources.map(e => this.mapToTarget(e));
  }

  mapToSourceList(targets) {
    return targets === null || targets === void 0 ? void 0 : targets.map(e => this.mapToSource(e));
  }

  map(source, configuration) {
    let target = {};
    const hasFieldConfig = Object.values(configuration.fieldConfigurations).length;
    this.mapByFieldConfig(source, target, configuration);

    if (!hasFieldConfig || configuration.canMapUndefinedFields) {
      this.mapAllFields(source, target, configuration);
    }

    return target;
  }

  mapByFieldConfig(source, target, configuration) {
    for (let targetKey in configuration.fieldConfigurations) {
      const config = configuration.fieldConfigurations[targetKey];
      target[targetKey] = typeof config === "function" ? config(source) : source[config];
    }
  }

  mapAllFields(source, target, configuration) {
    var _a, _b;

    for (let key in source) {
      const isIgnoredField = (_b = (_a = configuration.ignoredSourceFields) === null || _a === void 0 ? void 0 : _a.includes) === null || _b === void 0 ? void 0 : _b.call(_a, key);
      const hasFieldConfig = configuration.fieldConfigurations.hasOwnProperty(key);
      if (hasFieldConfig || isIgnoredField) continue;
      target[key] = source[key];
    }
  }

}

exports.CoreMapper = CoreMapper;
},{}],"../node_modules/@sabasayer/module.core/dist/mapper/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "CoreMapper", {
  enumerable: true,
  get: function () {
    return _coreMapper.CoreMapper;
  }
});

var _coreMapper = require("./core-mapper");
},{"./core-mapper":"../node_modules/@sabasayer/module.core/dist/mapper/core-mapper.js"}],"../node_modules/@sabasayer/module.core/dist/utils/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "urlUtils", {
  enumerable: true,
  get: function () {
    return _url.urlUtils;
  }
});

var _url = require("./url.utils");
},{"./url.utils":"../node_modules/@sabasayer/module.core/dist/utils/url.utils.js"}],"../node_modules/@sabasayer/module.core/dist/logger/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Logger", {
  enumerable: true,
  get: function () {
    return _logger.Logger;
  }
});

var _logger = require("./logger");
},{"./logger":"../node_modules/@sabasayer/module.core/dist/logger/logger.js"}],"../node_modules/@sabasayer/module.core/dist/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require("./http-client/index");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index[key];
    }
  });
});

var _index2 = require("./controller/index");

Object.keys(_index2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index2[key];
    }
  });
});

var _index3 = require("./module/index");

Object.keys(_index3).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index3[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index3[key];
    }
  });
});

var _index4 = require("./provider/index");

Object.keys(_index4).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index4[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index4[key];
    }
  });
});

var _index5 = require("./cache/index");

Object.keys(_index5).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index5[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index5[key];
    }
  });
});

var _index6 = require("./mapper/index");

Object.keys(_index6).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index6[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index6[key];
    }
  });
});

var _index7 = require("./utils/index");

Object.keys(_index7).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index7[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index7[key];
    }
  });
});

var _index8 = require("./logger/index");

Object.keys(_index8).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index8[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index8[key];
    }
  });
});
},{"./http-client/index":"../node_modules/@sabasayer/module.core/dist/http-client/index.js","./controller/index":"../node_modules/@sabasayer/module.core/dist/controller/index.js","./module/index":"../node_modules/@sabasayer/module.core/dist/module/index.js","./provider/index":"../node_modules/@sabasayer/module.core/dist/provider/index.js","./cache/index":"../node_modules/@sabasayer/module.core/dist/cache/index.js","./mapper/index":"../node_modules/@sabasayer/module.core/dist/mapper/index.js","./utils/index":"../node_modules/@sabasayer/module.core/dist/utils/index.js","./logger/index":"../node_modules/@sabasayer/module.core/dist/logger/index.js"}],"../../../node_modules/@sabasayer/module.core/dist/http-client/request-error.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestError = void 0;

class RequestError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }

}

exports.RequestError = RequestError;
},{}],"../../../node_modules/@sabasayer/module.core/dist/utils/url.utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.urlUtils = void 0;

class URLUtils {
  createBaseUrl(options) {
    var _a;

    const protocol = options.protocol ? `${options.protocol}:/` : "/";
    const currentHost = window.location.host;
    const hostName = options.hostName ? options.hostName : (_a = options.hostNames) === null || _a === void 0 ? void 0 : _a[currentHost];
    if (!hostName) throw "hostName or proper hostNames must be defined";
    const joined = [protocol, hostName, options.languagePrefix, options.prefix].filter(e => e).join("/");
    return this.ensureLastCharacterToBeSlash(joined);
  }

  ensureLastCharacterToBeSlash(baseUrl) {
    if (baseUrl[baseUrl.length - 1] != "/") return baseUrl + "/";
    return baseUrl;
  }

}

const urlUtils = new URLUtils();
exports.urlUtils = urlUtils;
},{}],"../../../node_modules/@sabasayer/module.core/dist/http-client/statics/request-error-type.enum.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnumRequestErrorType = void 0;
var EnumRequestErrorType;
exports.EnumRequestErrorType = EnumRequestErrorType;

(function (EnumRequestErrorType) {
  EnumRequestErrorType["aborted"] = "aborted";
  EnumRequestErrorType["serverError"] = "serverError";
})(EnumRequestErrorType || (exports.EnumRequestErrorType = EnumRequestErrorType = {}));
},{}],"../../../node_modules/@sabasayer/module.core/dist/http-client/fetch-http-client.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetchHTTPClient = void 0;

var _url = require("../utils/url.utils");

var _requestError = require("./request-error");

var _requestErrorType = require("./statics/request-error-type.enum");

class FetchHTTPClient {
  constructor(options) {
    this.pendingRequests = new Map();
    this.baseUrl = this.createBaseUrl(options);
    this.headers = options.headers;
    this.createErrorFn = options.createErrorFn;
    this.preventRequestDuplication = options.preventRequestDuplication;
  }

  createAbortController() {
    return new AbortController();
  }

  getPendingRequests() {
    return this.pendingRequests;
  }

  async get(url, options) {
    try {
      return await this.handleGet(url, options);
    } catch (e) {
      this.handleError(e, url);
    }
  }

  async post(url, data, options) {
    const key = this.createKey(url, data);

    try {
      return await this.handlePost({
        url,
        data,
        options,
        key
      });
    } catch (e) {
      this.handleError(e, key);
    }
  }

  async upload(url, formData) {
    try {
      return this.handleUpload(url, formData);
    } catch (e) {
      this.handleError(e, url);
    }
  }

  setHeader(key, value) {
    if (!this.headers) this.headers = {};
    this.headers[key] = value;
  }

  removeHeader(key) {
    var _a, _b;

    (_a = this.headers) === null || _a === void 0 ? true : delete _a[key];
    const isHeadersEmpty = !Object.keys((_b = this.headers) !== null && _b !== void 0 ? _b : {}).length;
    if (isHeadersEmpty) this.headers = undefined;
  }

  async handleUpload(url, formData) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "POST",
      headers: { ...this.headers,
        "Content-Type": "multipart/form-data"
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  createFetchInit(method, options, data) {
    const abortController = options === null || options === void 0 ? void 0 : options.abortController;
    const body = data ? JSON.stringify(data) : undefined;
    return {
      method,
      headers: this.headers,
      body: body,
      signal: abortController === null || abortController === void 0 ? void 0 : abortController.signal
    };
  }

  async handlePost(options) {
    const pendingRequest = this.pendingRequests.get(options.key);
    const init = this.createFetchInit("POST", options.options, options.data);
    let response = await this.createResponse({
      url: options.url,
      init,
      key: options.key,
      pendingRequest
    });
    this.pendingRequests.delete(options.key);
    return this.handleResponse(response);
  }

  createKey(url, data) {
    return `${url}_${data ? JSON.stringify(data) : ""}`;
  }

  async handleGet(url, options) {
    const pendingRequest = this.pendingRequests.get(url);
    const init = this.createFetchInit("GET", options);
    let response = await this.createResponse({
      url,
      init,
      key: url,
      pendingRequest
    });
    this.pendingRequests.delete(url);
    return this.handleResponse(response);
  }

  async createResponse(options) {
    if (options.pendingRequest) return await options.pendingRequest;
    const request = fetch(`${this.baseUrl}${options.url}`, options.init);
    if (this.preventRequestDuplication) this.pendingRequests.set(options.key, request);
    return await request;
  }

  async handleResponse(response) {
    if (response.ok) return response.json();
    await this.handleResponseError(response);
  }

  async handleResponseError(response) {
    if (this.createErrorFn) throw await this.createErrorFn(response);
    const body = response.body ? ` ${response.body}` : "";
    throw new Error(`${response.status}: ${response.statusText}.${body}`);
  }

  handleError(error, key) {
    this.pendingRequests.delete(key);
    if (error instanceof DOMException && error.name == "AbortError") throw new _requestError.RequestError(_requestErrorType.EnumRequestErrorType.aborted);
    throw new _requestError.RequestError(_requestErrorType.EnumRequestErrorType.serverError, error.message);
  }

  createBaseUrl(options) {
    if (options.baseUrl) return _url.urlUtils.ensureLastCharacterToBeSlash(options.baseUrl);
    return _url.urlUtils.createBaseUrl(options);
  }

}

exports.FetchHTTPClient = FetchHTTPClient;
},{"../utils/url.utils":"../../../node_modules/@sabasayer/module.core/dist/utils/url.utils.js","./request-error":"../../../node_modules/@sabasayer/module.core/dist/http-client/request-error.js","./statics/request-error-type.enum":"../../../node_modules/@sabasayer/module.core/dist/http-client/statics/request-error-type.enum.js"}],"../../../node_modules/@sabasayer/module.core/dist/http-client/types/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],"../../../node_modules/@sabasayer/module.core/dist/http-client/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  RequestError: true,
  FetchHTTPClient: true,
  EnumRequestErrorType: true
};
Object.defineProperty(exports, "RequestError", {
  enumerable: true,
  get: function () {
    return _requestError.RequestError;
  }
});
Object.defineProperty(exports, "FetchHTTPClient", {
  enumerable: true,
  get: function () {
    return _fetchHttpClient.FetchHTTPClient;
  }
});
Object.defineProperty(exports, "EnumRequestErrorType", {
  enumerable: true,
  get: function () {
    return _requestErrorType.EnumRequestErrorType;
  }
});

var _requestError = require("./request-error");

var _fetchHttpClient = require("./fetch-http-client");

var _requestErrorType = require("./statics/request-error-type.enum");

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
},{"./request-error":"../../../node_modules/@sabasayer/module.core/dist/http-client/request-error.js","./fetch-http-client":"../../../node_modules/@sabasayer/module.core/dist/http-client/fetch-http-client.js","./statics/request-error-type.enum":"../../../node_modules/@sabasayer/module.core/dist/http-client/statics/request-error-type.enum.js","./types":"../../../node_modules/@sabasayer/module.core/dist/http-client/types/index.js"}],"../../../node_modules/@sabasayer/module.core/dist/controller/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],"../../../node_modules/@sabasayer/module.core/dist/utils/env.utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isProduction = exports.isDevelopment = void 0;

const isDevelopment = () => "development" == "development";

exports.isDevelopment = isDevelopment;

const isProduction = () => !isDevelopment();

exports.isProduction = isProduction;
},{}],"../../../node_modules/@sabasayer/module.core/dist/logger/logger.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Logger = void 0;

class Logger {
  constructor(options) {
    var _a, _b;

    this.logStyle = "";
    this.disabled = false;
    this.logStyle = (_a = options === null || options === void 0 ? void 0 : options.logStyle) !== null && _a !== void 0 ? _a : "";
    this.disabled = (_b = options === null || options === void 0 ? void 0 : options.disabled) !== null && _b !== void 0 ? _b : false;
  }

  disable() {
    this.disabled = true;
  }

  enable() {
    this.disabled = false;
  }

  log(...args) {
    if (this.disabled) return;
    const nonObjects = args.filter(e => this.isPrimativeValue(e));
    const objects = args.filter(e => !this.isPrimativeValue(e));
    const joined = nonObjects.map(e => String(e)).join(" ");
    const primativeArgs = nonObjects.length ? [`%c${joined}`, this.logStyle] : [];
    console.log(...primativeArgs, ...objects);
  }

  logMethod() {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;
      const self = this;

      descriptor.value = function (...args) {
        var _a;

        let header = `${String(propertyKey)}()`;
        if ((_a = target.constructor) === null || _a === void 0 ? void 0 : _a.name) header = `${target.constructor.name} => ${header}`;
        self.log(header, ...args);
        return originalMethod === null || originalMethod === void 0 ? void 0 : originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }

  isPrimativeValue(value) {
    return typeof value !== "object" && typeof value !== "function";
  }

}

exports.Logger = Logger;
},{}],"../../../node_modules/@sabasayer/module.core/dist/logger/core.logger.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.coreLogger = void 0;

var _env = require("../utils/env.utils");

var _logger = require("./logger");

const coreLogger = new _logger.Logger({
  logStyle: "font-weight:500;border-left:3px solid black; color:#222; padding-left:3px;background-color: #ffffff;background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%);",
  disabled: (0, _env.isProduction)()
});
exports.coreLogger = coreLogger;
},{"../utils/env.utils":"../../../node_modules/@sabasayer/module.core/dist/utils/env.utils.js","./logger":"../../../node_modules/@sabasayer/module.core/dist/logger/logger.js"}],"../../../node_modules/@sabasayer/module.core/dist/module/core-module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModuleCore = void 0;

var _core = require("../logger/core.logger");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

class ModuleCore {
  constructor() {
    this.clients = new Map();
    this.providers = new Map();
    this.controllers = new Map();
    this.caches = new Map();
  }

  useDecorators(...decorators) {
    decorators.forEach(decorator => decorator.setModule(this));
    return this;
  }

  registerHttpClientImplementation(client, key) {
    const name = typeof key === "string" ? key : key.name;
    this.clients.set(name, client);
    return this;
  }

  registerHttpClient(client, options) {
    _core.coreLogger.log("registerHttpClient", client, options);

    const clientObj = new client(options);
    this.clients.set(client.name, clientObj);
    return this;
  }

  resolveHttpClient(client) {
    if (client) return this.resolveByConstructor(this.clients, client);else return this.clients.values().next().value;
  }

  registerProvider(provider, options) {
    var _a;

    const client = this.resolveHttpClient(options === null || options === void 0 ? void 0 : options.client);
    if (!client) throw new Error("Http-Client is not registered.");
    const name = (_a = options === null || options === void 0 ? void 0 : options.key) !== null && _a !== void 0 ? _a : provider.name;
    const providerObj = new provider(client);
    this.providers.set(name, providerObj);
    return this;
  }

  resolveProvider(key) {
    if (typeof key === "string") return this.providers.get(key);else return this.resolveByConstructor(this.providers, key);
  }

  registerController(controller, options) {
    var _a;

    const provider = this.resolveProvider(options.provider);
    if (!provider) return this;
    const name = (_a = options.key) !== null && _a !== void 0 ? _a : controller.name;
    const controllerObj = new controller(provider);
    this.controllers.set(name, controllerObj);
    return this;
  }

  resolveController(key) {
    if (typeof key === "string") return this.controllers.get(key);
    return this.resolveByConstructor(this.controllers, key);
  }

  registerCache(cache, key) {
    const name = key !== null && key !== void 0 ? key : cache.name;
    const cacheObj = new cache();
    this.caches.set(name, cacheObj);
    return this;
  }

  resolveCache(key) {
    if (typeof key === "string") return this.caches.get(key);
    return this.resolveByConstructor(this.caches, key);
  }

  clear() {
    this.clients.clear();
    this.providers.clear();
    this.controllers.clear();
    this.caches.clear();
  }

  resolveByConstructor(map, typeConstructor) {
    return map.get(typeConstructor.name);
  }

}

exports.ModuleCore = ModuleCore;

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "useDecorators", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerHttpClientImplementation", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerHttpClient", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerProvider", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerController", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerCache", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "clear", null);
},{"../logger/core.logger":"../../../node_modules/@sabasayer/module.core/dist/logger/core.logger.js"}],"../../../node_modules/@sabasayer/module.core/dist/module/create-module/create-module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createModule = void 0;

var _coreModule = require("../core-module");

const createModule = () => {
  return new _coreModule.ModuleCore();
};

exports.createModule = createModule;
},{"../core-module":"../../../node_modules/@sabasayer/module.core/dist/module/core-module.js"}],"../../../node_modules/@sabasayer/module.core/dist/module/decorators/injectable.decorators.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectable = exports.InjectableDecorators = void 0;

class InjectableDecorators {
  constructor() {
    this.module = null;
  }

  setModule(module) {
    this.module = module;
  }

  client(options) {
    return clientConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerHttpClient(clientConstructor, options);
    };
  }

  provider(options) {
    return providerConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerProvider(providerConstructor, options);
    };
  }

  controller(options) {
    return controllerConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerController(controllerConstructor, options);
    };
  }

  cache(key) {
    return cacheConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerCache(cacheConstructor, key);
    };
  }

}

exports.InjectableDecorators = InjectableDecorators;
const injectable = new InjectableDecorators();
exports.injectable = injectable;
},{}],"../../../node_modules/@sabasayer/module.core/dist/module/decorators/resolve.decorators.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolve = exports.ResolveDecorators = void 0;

class ResolveDecorators {
  constructor() {
    this.module = null;
  }

  setModule(module) {
    this.module = module;
  }

  client(client) {
    return (target, key) => {
      var _a;

      const clientObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveHttpClient(client);
      if (!clientObj) return;
      this.defineProperty(target, key, clientObj);
    };
  }

  provider(provider) {
    return (target, key) => {
      var _a;

      const providerObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveProvider(provider);
      if (!providerObj) return;
      this.defineProperty(target, key, providerObj);
    };
  }

  controller(controller) {
    return (target, key) => {
      var _a;

      const controllerObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveController(controller);
      if (!controllerObj) return;
      this.defineProperty(target, key, controllerObj);
    };
  }

  cache(cache) {
    return (target, key) => {
      var _a;

      const cacheObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveCache(cache);
      if (!cacheObj) return;
      this.defineProperty(target, key, cacheObj);
    };
  }

  defineProperty(target, key, newValue) {
    Object.defineProperty(target, key, {
      get: () => newValue,
      enumerable: false,
      configurable: true
    });
  }

}

exports.ResolveDecorators = ResolveDecorators;
const resolve = new ResolveDecorators();
exports.resolve = resolve;
},{}],"../../../node_modules/@sabasayer/module.core/dist/module/decorators/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "injectable", {
  enumerable: true,
  get: function () {
    return _injectable.injectable;
  }
});
Object.defineProperty(exports, "InjectableDecorators", {
  enumerable: true,
  get: function () {
    return _injectable.InjectableDecorators;
  }
});
Object.defineProperty(exports, "resolve", {
  enumerable: true,
  get: function () {
    return _resolve.resolve;
  }
});
Object.defineProperty(exports, "ResolveDecorators", {
  enumerable: true,
  get: function () {
    return _resolve.ResolveDecorators;
  }
});

var _injectable = require("./injectable.decorators");

var _resolve = require("./resolve.decorators");
},{"./injectable.decorators":"../../../node_modules/@sabasayer/module.core/dist/module/decorators/injectable.decorators.js","./resolve.decorators":"../../../node_modules/@sabasayer/module.core/dist/module/decorators/resolve.decorators.js"}],"../../../node_modules/@sabasayer/module.core/dist/module/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  ModuleCore: true,
  createModule: true
};
Object.defineProperty(exports, "ModuleCore", {
  enumerable: true,
  get: function () {
    return _coreModule.ModuleCore;
  }
});
Object.defineProperty(exports, "createModule", {
  enumerable: true,
  get: function () {
    return _createModule.createModule;
  }
});

var _coreModule = require("./core-module");

var _createModule = require("./create-module/create-module");

var _index = require("./decorators/index");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _index[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index[key];
    }
  });
});
},{"./core-module":"../../../node_modules/@sabasayer/module.core/dist/module/core-module.js","./create-module/create-module":"../../../node_modules/@sabasayer/module.core/dist/module/create-module/create-module.js","./decorators/index":"../../../node_modules/@sabasayer/module.core/dist/module/decorators/index.js"}],"../../../node_modules/@sabasayer/module.core/dist/provider/core-provider.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreProvider = void 0;

class CoreProvider {
  constructor(client) {
    this.abortControllers = new Map();
    this.baseUrl = null;
    this.client = client;
  }

  async post(config, data, options) {
    let requestOptions = this.createRequestOptions(options);
    const computedUrl = this.createUrl(config.url);
    return this.tryClientRequest(() => this.client.post(computedUrl, data, requestOptions), options);
  }

  async cachablePost(config, data, options) {
    if (!this.cache) throw new Error("'cache' property must be defined.");
    const cached = this.getFromCache(config.cacheKey);
    if (cached != undefined) return cached;
    const response = await this.post(config, data, options);
    this.saveToCache(config.cacheKey, response);
    return response;
  }

  async get(url, options) {
    let requestOptions = this.createRequestOptions(options);
    const computedUrl = this.createUrl(url);
    return this.tryClientRequest(() => this.client.get(computedUrl, requestOptions), options);
  }

  async upload(url, formData) {
    const computedUrl = this.createUrl(url);
    return this.client.upload(computedUrl, formData);
  }

  getFromCache(key) {
    var _a;

    return (_a = this.cache) === null || _a === void 0 ? void 0 : _a.get(key);
  }

  saveToCache(key, value) {
    var _a;

    if (value != undefined) (_a = this.cache) === null || _a === void 0 ? void 0 : _a.set(key, value);
  }

  createUrl(url) {
    return this.baseUrl ? `${this.baseUrl}/${url}` : url;
  }

  async tryClientRequest(request, options) {
    try {
      const response = await request();
      this.clearAbortControllers(options);
      return response;
    } catch (e) {
      this.clearAbortControllers(options);
      throw e;
    }
  }

  createRequestOptions(options) {
    let requestOptions = {};
    requestOptions.abortController = this.handleAbortAndCreateAbortController(options);
    return requestOptions;
  }

  handleAbortAndCreateAbortController(options) {
    if (!(options === null || options === void 0 ? void 0 : options.raceId) || !this.client.createAbortController) return;
    let abortController = this.getAndAbortRacerRequests(options.raceId);
    abortController = this.client.createAbortController();
    this.abortControllers.set(options.raceId, abortController);
    return abortController;
  }

  getAndAbortRacerRequests(raceId) {
    let abortController = this.abortControllers.get(raceId);
    if (abortController) abortController.abort();
    return abortController;
  }

  clearAbortControllers(options) {
    if (!(options === null || options === void 0 ? void 0 : options.raceId)) return;
    this.abortControllers.delete(options === null || options === void 0 ? void 0 : options.raceId);
  }

}

exports.CoreProvider = CoreProvider;
},{}],"../../../node_modules/@sabasayer/module.core/dist/provider/types/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],"../../../node_modules/@sabasayer/module.core/dist/provider/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  CoreProvider: true
};
Object.defineProperty(exports, "CoreProvider", {
  enumerable: true,
  get: function () {
    return _coreProvider.CoreProvider;
  }
});

var _coreProvider = require("./core-provider");

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
},{"./core-provider":"../../../node_modules/@sabasayer/module.core/dist/provider/core-provider.js","./types":"../../../node_modules/@sabasayer/module.core/dist/provider/types/index.js"}],"../../../node_modules/@sabasayer/module.core/dist/cache/memory-cache.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MemoryCache = void 0;

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  set(key, value) {
    this.store.set(key, value);
  }

  get(key) {
    var _a;

    return (_a = this.store.get(key)) !== null && _a !== void 0 ? _a : null;
  }

  remove(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

}

exports.MemoryCache = MemoryCache;
},{}],"../../../node_modules/@sabasayer/module.core/dist/cache/session-storage-cache.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SessionStorageCache = void 0;

var _utils = require("@sabasayer/utils");

class SessionStorageCache {
  set(key, value) {
    const stringValue = JSON.stringify(value);

    _utils.SessionStorageUtil.setItem(key, stringValue);
  }

  get(key) {
    const value = _utils.SessionStorageUtil.getItem(key);

    if (!value) return null;
    return JSON.parse(value);
  }

  remove(key) {
    _utils.SessionStorageUtil.removeItem(key);
  }

  clear() {
    _utils.SessionStorageUtil.clear();
  }

}

exports.SessionStorageCache = SessionStorageCache;
},{"@sabasayer/utils":"../../../node_modules/@sabasayer/utils/dist/index.js"}],"../../../node_modules/@sabasayer/module.core/dist/cache/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "MemoryCache", {
  enumerable: true,
  get: function () {
    return _memoryCache.MemoryCache;
  }
});
Object.defineProperty(exports, "SessionStorageCache", {
  enumerable: true,
  get: function () {
    return _sessionStorageCache.SessionStorageCache;
  }
});

var _memoryCache = require("./memory-cache");

var _sessionStorageCache = require("./session-storage-cache");
},{"./memory-cache":"../../../node_modules/@sabasayer/module.core/dist/cache/memory-cache.js","./session-storage-cache":"../../../node_modules/@sabasayer/module.core/dist/cache/session-storage-cache.js"}],"../../../node_modules/@sabasayer/module.core/dist/mapper/core-mapper.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreMapper = void 0;

class CoreMapper {
  constructor() {
    this.targetConfiguration = {
      fieldConfigurations: {}
    };
    this.sourceConfiguration = {
      fieldConfigurations: {}
    };
  }

  setTargetConfig(config) {
    this.targetConfiguration = { ...this.targetConfiguration,
      ...config
    };
  }

  setSourceConfig(config) {
    this.sourceConfiguration = { ...this.sourceConfiguration,
      ...config
    };
  }

  ignoreSourceFields(...sourceFields) {
    this.targetConfiguration.ignoredSourceFields = sourceFields;
  }

  ignoreTargetFields(...targetFields) {
    this.sourceConfiguration.ignoredSourceFields = targetFields;
  }

  forTarget(targetField, sourceValue) {
    this.targetConfiguration.fieldConfigurations[targetField] = sourceValue !== null && sourceValue !== void 0 ? sourceValue : targetField;
    return this;
  }

  forSource(sourceField, targetValue) {
    this.sourceConfiguration.fieldConfigurations[sourceField] = targetValue !== null && targetValue !== void 0 ? targetValue : sourceField;
    return this;
  }

  mapToTarget(source) {
    return this.map(source, this.targetConfiguration);
  }

  mapToSource(target) {
    return this.map(target, this.sourceConfiguration);
  }

  mapToTargetList(sources) {
    return sources === null || sources === void 0 ? void 0 : sources.map(e => this.mapToTarget(e));
  }

  mapToSourceList(targets) {
    return targets === null || targets === void 0 ? void 0 : targets.map(e => this.mapToSource(e));
  }

  map(source, configuration) {
    let target = {};
    const hasFieldConfig = Object.values(configuration.fieldConfigurations).length;
    this.mapByFieldConfig(source, target, configuration);

    if (!hasFieldConfig || configuration.canMapUndefinedFields) {
      this.mapAllFields(source, target, configuration);
    }

    return target;
  }

  mapByFieldConfig(source, target, configuration) {
    for (let targetKey in configuration.fieldConfigurations) {
      const config = configuration.fieldConfigurations[targetKey];
      target[targetKey] = typeof config === "function" ? config(source) : source[config];
    }
  }

  mapAllFields(source, target, configuration) {
    var _a, _b;

    for (let key in source) {
      const isIgnoredField = (_b = (_a = configuration.ignoredSourceFields) === null || _a === void 0 ? void 0 : _a.includes) === null || _b === void 0 ? void 0 : _b.call(_a, key);
      const hasFieldConfig = configuration.fieldConfigurations.hasOwnProperty(key);
      if (hasFieldConfig || isIgnoredField) continue;
      target[key] = source[key];
    }
  }

}

exports.CoreMapper = CoreMapper;
},{}],"../../../node_modules/@sabasayer/module.core/dist/mapper/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "CoreMapper", {
  enumerable: true,
  get: function () {
    return _coreMapper.CoreMapper;
  }
});

var _coreMapper = require("./core-mapper");
},{"./core-mapper":"../../../node_modules/@sabasayer/module.core/dist/mapper/core-mapper.js"}],"../../../node_modules/@sabasayer/module.core/dist/utils/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "urlUtils", {
  enumerable: true,
  get: function () {
    return _url.urlUtils;
  }
});

var _url = require("./url.utils");
},{"./url.utils":"../../../node_modules/@sabasayer/module.core/dist/utils/url.utils.js"}],"../../../node_modules/@sabasayer/module.core/dist/logger/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Logger", {
  enumerable: true,
  get: function () {
    return _logger.Logger;
  }
});

var _logger = require("./logger");
},{"./logger":"../../../node_modules/@sabasayer/module.core/dist/logger/logger.js"}],"../../../node_modules/@sabasayer/module.core/dist/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require("./http-client/index");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index[key];
    }
  });
});

var _index2 = require("./controller/index");

Object.keys(_index2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index2[key];
    }
  });
});

var _index3 = require("./module/index");

Object.keys(_index3).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index3[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index3[key];
    }
  });
});

var _index4 = require("./provider/index");

Object.keys(_index4).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index4[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index4[key];
    }
  });
});

var _index5 = require("./cache/index");

Object.keys(_index5).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index5[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index5[key];
    }
  });
});

var _index6 = require("./mapper/index");

Object.keys(_index6).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index6[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index6[key];
    }
  });
});

var _index7 = require("./utils/index");

Object.keys(_index7).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index7[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index7[key];
    }
  });
});

var _index8 = require("./logger/index");

Object.keys(_index8).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index8[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index8[key];
    }
  });
});
},{"./http-client/index":"../../../node_modules/@sabasayer/module.core/dist/http-client/index.js","./controller/index":"../../../node_modules/@sabasayer/module.core/dist/controller/index.js","./module/index":"../../../node_modules/@sabasayer/module.core/dist/module/index.js","./provider/index":"../../../node_modules/@sabasayer/module.core/dist/provider/index.js","./cache/index":"../../../node_modules/@sabasayer/module.core/dist/cache/index.js","./mapper/index":"../../../node_modules/@sabasayer/module.core/dist/mapper/index.js","./utils/index":"../../../node_modules/@sabasayer/module.core/dist/utils/index.js","./logger/index":"../../../node_modules/@sabasayer/module.core/dist/logger/index.js"}],"../../../node_modules/auth/src/configurations/decorators.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectable = exports.resolve = void 0;

var _module = require("@sabasayer/module.core");

const resolve = new _module.ResolveDecorators();
exports.resolve = resolve;
const injectable = new _module.InjectableDecorators();
exports.injectable = injectable;
},{"@sabasayer/module.core":"../../../node_modules/@sabasayer/module.core/dist/index.js"}],"../../../node_modules/auth/src/configurations/module.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authModule = void 0;

var _module = require("@sabasayer/module.core");

var _decorators = require("./decorators");

class AuthModule extends _module.ModuleCore {
  constructor() {
    super(...arguments);
    this.id = Math.random();
  }

}

const authModule = new AuthModule();
exports.authModule = authModule;
authModule.registerCache(_module.SessionStorageCache);
authModule.useDecorators(_decorators.injectable, _decorators.resolve);
},{"@sabasayer/module.core":"../../../node_modules/@sabasayer/module.core/dist/index.js","./decorators":"../../../node_modules/auth/src/configurations/decorators.ts"}],"../src/configurations/http-client.boot.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchClient = void 0;

var _module = require("@sabasayer/module.core");

const createErrorFn = async response => {
  const res = await response.json();
  const messages = res.data.messages;
  const errorMessage = messages?.map(e => `${e.key} : ${e.value}`).join(" , ");
  return new Error(errorMessage);
};

const fetchClient = new _module.FetchHTTPClient({
  hostName: "api.comed.com.tr",
  languagePrefix: "tr-tr",
  prefix: "api/json",
  headers: {
    "x-application-key": "/uq+fiM1AzYe7bHAJCixzg==",
    "content-type": "application/json"
  },
  createErrorFn
});
exports.fetchClient = fetchClient;
},{"@sabasayer/module.core":"../node_modules/@sabasayer/module.core/dist/index.js"}],"../src/configurations/decorators.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectable = exports.resolve = void 0;

var _module = require("@sabasayer/module.core");

const resolve = new _module.ResolveDecorators();
exports.resolve = resolve;
const injectable = new _module.InjectableDecorators();
exports.injectable = injectable;
},{"@sabasayer/module.core":"../node_modules/@sabasayer/module.core/dist/index.js"}],"../src/configurations/logger.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.coreLogger = void 0;

var _module = require("@sabasayer/module.core");

const coreLogger = new _module.Logger({
  logStyle: "font-weight:500;color:white; padding-left:3px;background-color: #537895; background-image: linear-gradient(315deg, #537895 0%, #09203f 74%);"
});
exports.coreLogger = coreLogger;
},{"@sabasayer/module.core":"../node_modules/@sabasayer/module.core/dist/index.js"}],"../src/configurations/module.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.coreModule = void 0;

var _module = require("@sabasayer/module.core");

var _module2 = require("auth/src/configurations/module");

var _httpClient = require("./http-client.boot");

var _decorators = require("./decorators");

var _logger = require("./logger");

class CoreModule extends _module.ModuleCore {
  constructor() {
    super(...arguments);
    this.id = Math.random();
  }

}

const coreModule = new CoreModule();
exports.coreModule = coreModule;
coreModule.useDecorators(_decorators.resolve, _decorators.injectable);
coreModule.registerHttpClientImplementation(_httpClient.fetchClient, _module.FetchHTTPClient);

_module2.authModule.registerHttpClientImplementation(_httpClient.fetchClient, _module.FetchHTTPClient);

_logger.coreLogger.log("Modules registered", coreModule, _module2.authModule);
},{"@sabasayer/module.core":"../node_modules/@sabasayer/module.core/dist/index.js","auth/src/configurations/module":"../../../node_modules/auth/src/configurations/module.ts","./http-client.boot":"../src/configurations/http-client.boot.ts","./decorators":"../src/configurations/decorators.ts","./logger":"../src/configurations/logger.ts"}],"../src/configurations/index.ts":[function(require,module,exports) {
"use strict";

require("./module");
},{"./module":"../src/configurations/module.ts"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/request-error.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestError = void 0;

class RequestError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }

}

exports.RequestError = RequestError;
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/utils/url.utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.urlUtils = void 0;

class URLUtils {
  createBaseUrl(options) {
    var _a;

    const protocol = options.protocol ? `${options.protocol}:/` : "/";
    const currentHost = window.location.host;
    const hostName = options.hostName ? options.hostName : (_a = options.hostNames) === null || _a === void 0 ? void 0 : _a[currentHost];
    if (!hostName) throw "hostName or proper hostNames must be defined";
    const joined = [protocol, hostName, options.languagePrefix, options.prefix].filter(e => e).join("/");
    return this.ensureLastCharacterToBeSlash(joined);
  }

  ensureLastCharacterToBeSlash(baseUrl) {
    if (baseUrl[baseUrl.length - 1] != "/") return baseUrl + "/";
    return baseUrl;
  }

}

const urlUtils = new URLUtils();
exports.urlUtils = urlUtils;
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/statics/request-error-type.enum.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnumRequestErrorType = void 0;
var EnumRequestErrorType;
exports.EnumRequestErrorType = EnumRequestErrorType;

(function (EnumRequestErrorType) {
  EnumRequestErrorType["aborted"] = "aborted";
  EnumRequestErrorType["serverError"] = "serverError";
})(EnumRequestErrorType || (exports.EnumRequestErrorType = EnumRequestErrorType = {}));
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/fetch-http-client.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetchHTTPClient = void 0;

var _url = require("../utils/url.utils");

var _requestError = require("./request-error");

var _requestErrorType = require("./statics/request-error-type.enum");

class FetchHTTPClient {
  constructor(options) {
    this.pendingRequests = new Map();
    this.baseUrl = this.createBaseUrl(options);
    this.headers = options.headers;
    this.createErrorFn = options.createErrorFn;
    this.preventRequestDuplication = options.preventRequestDuplication;
  }

  createAbortController() {
    return new AbortController();
  }

  getPendingRequests() {
    return this.pendingRequests;
  }

  async get(url, options) {
    try {
      return await this.handleGet(url, options);
    } catch (e) {
      this.handleError(e, url);
    }
  }

  async post(url, data, options) {
    const key = this.createKey(url, data);

    try {
      return await this.handlePost({
        url,
        data,
        options,
        key
      });
    } catch (e) {
      this.handleError(e, key);
    }
  }

  async upload(url, formData) {
    try {
      return this.handleUpload(url, formData);
    } catch (e) {
      this.handleError(e, url);
    }
  }

  setHeader(key, value) {
    if (!this.headers) this.headers = {};
    this.headers[key] = value;
  }

  removeHeader(key) {
    var _a, _b;

    (_a = this.headers) === null || _a === void 0 ? true : delete _a[key];
    const isHeadersEmpty = !Object.keys((_b = this.headers) !== null && _b !== void 0 ? _b : {}).length;
    if (isHeadersEmpty) this.headers = undefined;
  }

  async handleUpload(url, formData) {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: "POST",
      headers: { ...this.headers,
        "Content-Type": "multipart/form-data"
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  createFetchInit(method, options, data) {
    const abortController = options === null || options === void 0 ? void 0 : options.abortController;
    const body = data ? JSON.stringify(data) : undefined;
    return {
      method,
      headers: this.headers,
      body: body,
      signal: abortController === null || abortController === void 0 ? void 0 : abortController.signal
    };
  }

  async handlePost(options) {
    const pendingRequest = this.pendingRequests.get(options.key);
    const init = this.createFetchInit("POST", options.options, options.data);
    let response = await this.createResponse({
      url: options.url,
      init,
      key: options.key,
      pendingRequest
    });
    this.pendingRequests.delete(options.key);
    return this.handleResponse(response);
  }

  createKey(url, data) {
    return `${url}_${data ? JSON.stringify(data) : ""}`;
  }

  async handleGet(url, options) {
    const pendingRequest = this.pendingRequests.get(url);
    const init = this.createFetchInit("GET", options);
    let response = await this.createResponse({
      url,
      init,
      key: url,
      pendingRequest
    });
    this.pendingRequests.delete(url);
    return this.handleResponse(response);
  }

  async createResponse(options) {
    if (options.pendingRequest) return await options.pendingRequest;
    const request = fetch(`${this.baseUrl}${options.url}`, options.init);
    if (this.preventRequestDuplication) this.pendingRequests.set(options.key, request);
    return await request;
  }

  async handleResponse(response) {
    if (response.ok) return response.json();
    await this.handleResponseError(response);
  }

  async handleResponseError(response) {
    if (this.createErrorFn) throw await this.createErrorFn(response);
    const body = response.body ? ` ${response.body}` : "";
    throw new Error(`${response.status}: ${response.statusText}.${body}`);
  }

  handleError(error, key) {
    this.pendingRequests.delete(key);
    if (error instanceof DOMException && error.name == "AbortError") throw new _requestError.RequestError(_requestErrorType.EnumRequestErrorType.aborted);
    throw new _requestError.RequestError(_requestErrorType.EnumRequestErrorType.serverError, error.message);
  }

  createBaseUrl(options) {
    if (options.baseUrl) return _url.urlUtils.ensureLastCharacterToBeSlash(options.baseUrl);
    return _url.urlUtils.createBaseUrl(options);
  }

}

exports.FetchHTTPClient = FetchHTTPClient;
},{"../utils/url.utils":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/utils/url.utils.js","./request-error":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/request-error.js","./statics/request-error-type.enum":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/statics/request-error-type.enum.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/types/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  RequestError: true,
  FetchHTTPClient: true,
  EnumRequestErrorType: true
};
Object.defineProperty(exports, "RequestError", {
  enumerable: true,
  get: function () {
    return _requestError.RequestError;
  }
});
Object.defineProperty(exports, "FetchHTTPClient", {
  enumerable: true,
  get: function () {
    return _fetchHttpClient.FetchHTTPClient;
  }
});
Object.defineProperty(exports, "EnumRequestErrorType", {
  enumerable: true,
  get: function () {
    return _requestErrorType.EnumRequestErrorType;
  }
});

var _requestError = require("./request-error");

var _fetchHttpClient = require("./fetch-http-client");

var _requestErrorType = require("./statics/request-error-type.enum");

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
},{"./request-error":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/request-error.js","./fetch-http-client":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/fetch-http-client.js","./statics/request-error-type.enum":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/statics/request-error-type.enum.js","./types":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/types/index.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/controller/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/utils/env.utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isProduction = exports.isDevelopment = void 0;

const isDevelopment = () => "development" == "development";

exports.isDevelopment = isDevelopment;

const isProduction = () => !isDevelopment();

exports.isProduction = isProduction;
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/logger/logger.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Logger = void 0;

class Logger {
  constructor(options) {
    var _a, _b;

    this.logStyle = "";
    this.disabled = false;
    this.logStyle = (_a = options === null || options === void 0 ? void 0 : options.logStyle) !== null && _a !== void 0 ? _a : "";
    this.disabled = (_b = options === null || options === void 0 ? void 0 : options.disabled) !== null && _b !== void 0 ? _b : false;
  }

  disable() {
    this.disabled = true;
  }

  enable() {
    this.disabled = false;
  }

  log(...args) {
    if (this.disabled) return;
    const nonObjects = args.filter(e => this.isPrimativeValue(e));
    const objects = args.filter(e => !this.isPrimativeValue(e));
    const joined = nonObjects.map(e => String(e)).join(" ");
    const primativeArgs = nonObjects.length ? [`%c${joined}`, this.logStyle] : [];
    console.log(...primativeArgs, ...objects);
  }

  logMethod() {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;
      const self = this;

      descriptor.value = function (...args) {
        var _a;

        let header = `${String(propertyKey)}()`;
        if ((_a = target.constructor) === null || _a === void 0 ? void 0 : _a.name) header = `${target.constructor.name} => ${header}`;
        self.log(header, ...args);
        return originalMethod === null || originalMethod === void 0 ? void 0 : originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }

  isPrimativeValue(value) {
    return typeof value !== "object" && typeof value !== "function";
  }

}

exports.Logger = Logger;
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/logger/core.logger.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.coreLogger = void 0;

var _env = require("../utils/env.utils");

var _logger = require("./logger");

const coreLogger = new _logger.Logger({
  logStyle: "font-weight:500;border-left:3px solid black; color:#222; padding-left:3px;background-color: #ffffff;background-image: linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%);",
  disabled: (0, _env.isProduction)()
});
exports.coreLogger = coreLogger;
},{"../utils/env.utils":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/utils/env.utils.js","./logger":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/logger/logger.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/core-module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModuleCore = void 0;

var _core = require("../logger/core.logger");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

class ModuleCore {
  constructor() {
    this.clients = new Map();
    this.providers = new Map();
    this.controllers = new Map();
    this.caches = new Map();
  }

  useDecorators(...decorators) {
    decorators.forEach(decorator => decorator.setModule(this));
    return this;
  }

  registerHttpClientImplementation(client, key) {
    const name = typeof key === "string" ? key : key.name;
    this.clients.set(name, client);
    return this;
  }

  registerHttpClient(client, options) {
    _core.coreLogger.log("registerHttpClient", client, options);

    const clientObj = new client(options);
    this.clients.set(client.name, clientObj);
    return this;
  }

  resolveHttpClient(client) {
    if (client) return this.resolveByConstructor(this.clients, client);else return this.clients.values().next().value;
  }

  registerProvider(provider, options) {
    var _a;

    const client = this.resolveHttpClient(options === null || options === void 0 ? void 0 : options.client);
    if (!client) throw new Error("Http-Client is not registered.");
    const name = (_a = options === null || options === void 0 ? void 0 : options.key) !== null && _a !== void 0 ? _a : provider.name;
    const providerObj = new provider(client);
    this.providers.set(name, providerObj);
    return this;
  }

  resolveProvider(key) {
    if (typeof key === "string") return this.providers.get(key);else return this.resolveByConstructor(this.providers, key);
  }

  registerController(controller, options) {
    var _a;

    const provider = this.resolveProvider(options.provider);
    if (!provider) return this;
    const name = (_a = options.key) !== null && _a !== void 0 ? _a : controller.name;
    const controllerObj = new controller(provider);
    this.controllers.set(name, controllerObj);
    return this;
  }

  resolveController(key) {
    if (typeof key === "string") return this.controllers.get(key);
    return this.resolveByConstructor(this.controllers, key);
  }

  registerCache(cache, key) {
    const name = key !== null && key !== void 0 ? key : cache.name;
    const cacheObj = new cache();
    this.caches.set(name, cacheObj);
    return this;
  }

  resolveCache(key) {
    if (typeof key === "string") return this.caches.get(key);
    return this.resolveByConstructor(this.caches, key);
  }

  clear() {
    this.clients.clear();
    this.providers.clear();
    this.controllers.clear();
    this.caches.clear();
  }

  resolveByConstructor(map, typeConstructor) {
    return map.get(typeConstructor.name);
  }

}

exports.ModuleCore = ModuleCore;

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "useDecorators", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerHttpClientImplementation", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerHttpClient", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerProvider", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerController", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "registerCache", null);

__decorate([_core.coreLogger.logMethod()], ModuleCore.prototype, "clear", null);
},{"../logger/core.logger":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/logger/core.logger.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/create-module/create-module.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createModule = void 0;

var _coreModule = require("../core-module");

const createModule = () => {
  return new _coreModule.ModuleCore();
};

exports.createModule = createModule;
},{"../core-module":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/core-module.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/decorators/injectable.decorators.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InjectableDecorators = void 0;

class InjectableDecorators {
  constructor() {
    this.module = null;
  }

  setModule(module) {
    this.module = module;
  }

  client(options) {
    return clientConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerHttpClient(clientConstructor, options);
    };
  }

  provider(options) {
    return providerConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerProvider(providerConstructor, options);
    };
  }

  controller(options) {
    return controllerConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerController(controllerConstructor, options);
    };
  }

  cache(key) {
    return cacheConstructor => {
      var _a;

      (_a = this.module) === null || _a === void 0 ? void 0 : _a.registerCache(cacheConstructor, key);
    };
  }

}

exports.InjectableDecorators = InjectableDecorators;
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/decorators/resolve.decorators.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResolveDecorators = void 0;

class ResolveDecorators {
  constructor() {
    this.module = null;
  }

  setModule(module) {
    this.module = module;
  }

  client(client) {
    return (target, key) => {
      var _a;

      const clientObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveHttpClient(client);
      if (!clientObj) return;
      this.defineProperty(target, key, clientObj);
    };
  }

  provider(provider) {
    return (target, key) => {
      var _a;

      const providerObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveProvider(provider);
      if (!providerObj) return;
      this.defineProperty(target, key, providerObj);
    };
  }

  controller(controller) {
    return (target, key) => {
      var _a;

      const controllerObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveController(controller);
      if (!controllerObj) return;
      this.defineProperty(target, key, controllerObj);
    };
  }

  cache(cache) {
    return (target, key) => {
      var _a;

      const cacheObj = (_a = this.module) === null || _a === void 0 ? void 0 : _a.resolveCache(cache);
      if (!cacheObj) return;
      this.defineProperty(target, key, cacheObj);
    };
  }

  defineProperty(target, key, newValue) {
    Object.defineProperty(target, key, {
      get: () => newValue,
      enumerable: false,
      configurable: true
    });
  }

}

exports.ResolveDecorators = ResolveDecorators;
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/decorators/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "InjectableDecorators", {
  enumerable: true,
  get: function () {
    return _injectable.InjectableDecorators;
  }
});
Object.defineProperty(exports, "ResolveDecorators", {
  enumerable: true,
  get: function () {
    return _resolve.ResolveDecorators;
  }
});

var _injectable = require("./injectable.decorators");

var _resolve = require("./resolve.decorators");
},{"./injectable.decorators":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/decorators/injectable.decorators.js","./resolve.decorators":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/decorators/resolve.decorators.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  ModuleCore: true,
  createModule: true
};
Object.defineProperty(exports, "ModuleCore", {
  enumerable: true,
  get: function () {
    return _coreModule.ModuleCore;
  }
});
Object.defineProperty(exports, "createModule", {
  enumerable: true,
  get: function () {
    return _createModule.createModule;
  }
});

var _coreModule = require("./core-module");

var _createModule = require("./create-module/create-module");

var _index = require("./decorators/index");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _index[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index[key];
    }
  });
});
},{"./core-module":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/core-module.js","./create-module/create-module":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/create-module/create-module.js","./decorators/index":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/decorators/index.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/provider/core-provider.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreProvider = void 0;

class CoreProvider {
  constructor(client) {
    this.abortControllers = new Map();
    this.baseUrl = null;
    this.client = client;
  }

  async post(config, data, options) {
    let requestOptions = this.createRequestOptions(options);
    const computedUrl = this.createUrl(config.url);
    return this.tryClientRequest(() => this.client.post(computedUrl, data, requestOptions), options);
  }

  async cachablePost(config, data, options) {
    if (!this.cache) throw new Error("'cache' property must be defined.");
    const cached = this.getFromCache(config.cacheKey);
    if (cached != undefined) return cached;
    const response = await this.post(config, data, options);
    this.saveToCache(config.cacheKey, response);
    return response;
  }

  async get(url, options) {
    let requestOptions = this.createRequestOptions(options);
    const computedUrl = this.createUrl(url);
    return this.tryClientRequest(() => this.client.get(computedUrl, requestOptions), options);
  }

  async upload(url, formData) {
    const computedUrl = this.createUrl(url);
    return this.client.upload(computedUrl, formData);
  }

  getFromCache(key) {
    var _a;

    return (_a = this.cache) === null || _a === void 0 ? void 0 : _a.get(key);
  }

  saveToCache(key, value) {
    var _a;

    if (value != undefined) (_a = this.cache) === null || _a === void 0 ? void 0 : _a.set(key, value);
  }

  createUrl(url) {
    return this.baseUrl ? `${this.baseUrl}/${url}` : url;
  }

  async tryClientRequest(request, options) {
    try {
      const response = await request();
      this.clearAbortControllers(options);
      return response;
    } catch (e) {
      this.clearAbortControllers(options);
      throw e;
    }
  }

  createRequestOptions(options) {
    let requestOptions = {};
    requestOptions.abortController = this.handleAbortAndCreateAbortController(options);
    return requestOptions;
  }

  handleAbortAndCreateAbortController(options) {
    if (!(options === null || options === void 0 ? void 0 : options.raceId) || !this.client.createAbortController) return;
    let abortController = this.getAndAbortRacerRequests(options.raceId);
    abortController = this.client.createAbortController();
    this.abortControllers.set(options.raceId, abortController);
    return abortController;
  }

  getAndAbortRacerRequests(raceId) {
    let abortController = this.abortControllers.get(raceId);
    if (abortController) abortController.abort();
    return abortController;
  }

  clearAbortControllers(options) {
    if (!(options === null || options === void 0 ? void 0 : options.raceId)) return;
    this.abortControllers.delete(options === null || options === void 0 ? void 0 : options.raceId);
  }

}

exports.CoreProvider = CoreProvider;
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/provider/types/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/provider/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  CoreProvider: true
};
Object.defineProperty(exports, "CoreProvider", {
  enumerable: true,
  get: function () {
    return _coreProvider.CoreProvider;
  }
});

var _coreProvider = require("./core-provider");

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
},{"./core-provider":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/provider/core-provider.js","./types":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/provider/types/index.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/cache/memory-cache.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MemoryCache = void 0;

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  set(key, value) {
    this.store.set(key, value);
  }

  get(key) {
    var _a;

    return (_a = this.store.get(key)) !== null && _a !== void 0 ? _a : null;
  }

  remove(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

}

exports.MemoryCache = MemoryCache;
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/cache/session-storage-cache.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SessionStorageCache = void 0;

var _utils = require("@sabasayer/utils");

class SessionStorageCache {
  set(key, value) {
    const stringValue = JSON.stringify(value);

    _utils.SessionStorageUtil.setItem(key, stringValue);
  }

  get(key) {
    const value = _utils.SessionStorageUtil.getItem(key);

    if (!value) return null;
    return JSON.parse(value);
  }

  remove(key) {
    _utils.SessionStorageUtil.removeItem(key);
  }

  clear() {
    _utils.SessionStorageUtil.clear();
  }

}

exports.SessionStorageCache = SessionStorageCache;
},{"@sabasayer/utils":"../../../node_modules/@sabasayer/utils/dist/index.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/cache/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "MemoryCache", {
  enumerable: true,
  get: function () {
    return _memoryCache.MemoryCache;
  }
});
Object.defineProperty(exports, "SessionStorageCache", {
  enumerable: true,
  get: function () {
    return _sessionStorageCache.SessionStorageCache;
  }
});

var _memoryCache = require("./memory-cache");

var _sessionStorageCache = require("./session-storage-cache");
},{"./memory-cache":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/cache/memory-cache.js","./session-storage-cache":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/cache/session-storage-cache.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/mapper/core-mapper.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreMapper = void 0;

class CoreMapper {
  constructor() {
    this.targetConfiguration = {
      fieldConfigurations: {}
    };
    this.sourceConfiguration = {
      fieldConfigurations: {}
    };
  }

  setTargetConfig(config) {
    this.targetConfiguration = { ...this.targetConfiguration,
      ...config
    };
  }

  setSourceConfig(config) {
    this.sourceConfiguration = { ...this.sourceConfiguration,
      ...config
    };
  }

  ignoreSourceFields(...sourceFields) {
    this.targetConfiguration.ignoredSourceFields = sourceFields;
  }

  ignoreTargetFields(...targetFields) {
    this.sourceConfiguration.ignoredSourceFields = targetFields;
  }

  forTarget(targetField, sourceValue) {
    this.targetConfiguration.fieldConfigurations[targetField] = sourceValue !== null && sourceValue !== void 0 ? sourceValue : targetField;
    return this;
  }

  forSource(sourceField, targetValue) {
    this.sourceConfiguration.fieldConfigurations[sourceField] = targetValue !== null && targetValue !== void 0 ? targetValue : sourceField;
    return this;
  }

  mapToTarget(source) {
    return this.map(source, this.targetConfiguration);
  }

  mapToSource(target) {
    return this.map(target, this.sourceConfiguration);
  }

  mapToTargetList(sources) {
    return sources === null || sources === void 0 ? void 0 : sources.map(e => this.mapToTarget(e));
  }

  mapToSourceList(targets) {
    return targets === null || targets === void 0 ? void 0 : targets.map(e => this.mapToSource(e));
  }

  map(source, configuration) {
    let target = {};
    const hasFieldConfig = Object.values(configuration.fieldConfigurations).length;
    this.mapByFieldConfig(source, target, configuration);

    if (!hasFieldConfig || configuration.canMapUndefinedFields) {
      this.mapAllFields(source, target, configuration);
    }

    return target;
  }

  mapByFieldConfig(source, target, configuration) {
    for (let targetKey in configuration.fieldConfigurations) {
      const config = configuration.fieldConfigurations[targetKey];
      target[targetKey] = typeof config === "function" ? config(source) : source[config];
    }
  }

  mapAllFields(source, target, configuration) {
    var _a, _b;

    for (let key in source) {
      const isIgnoredField = (_b = (_a = configuration.ignoredSourceFields) === null || _a === void 0 ? void 0 : _a.includes) === null || _b === void 0 ? void 0 : _b.call(_a, key);
      const hasFieldConfig = configuration.fieldConfigurations.hasOwnProperty(key);
      if (hasFieldConfig || isIgnoredField) continue;
      target[key] = source[key];
    }
  }

}

exports.CoreMapper = CoreMapper;
},{}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/mapper/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "CoreMapper", {
  enumerable: true,
  get: function () {
    return _coreMapper.CoreMapper;
  }
});

var _coreMapper = require("./core-mapper");
},{"./core-mapper":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/mapper/core-mapper.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/utils/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "urlUtils", {
  enumerable: true,
  get: function () {
    return _url.urlUtils;
  }
});

var _url = require("./url.utils");
},{"./url.utils":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/utils/url.utils.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/logger/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Logger", {
  enumerable: true,
  get: function () {
    return _logger.Logger;
  }
});

var _logger = require("./logger");
},{"./logger":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/logger/logger.js"}],"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require("./http-client/index");

Object.keys(_index).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index[key];
    }
  });
});

var _index2 = require("./controller/index");

Object.keys(_index2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index2[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index2[key];
    }
  });
});

var _index3 = require("./module/index");

Object.keys(_index3).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index3[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index3[key];
    }
  });
});

var _index4 = require("./provider/index");

Object.keys(_index4).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index4[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index4[key];
    }
  });
});

var _index5 = require("./cache/index");

Object.keys(_index5).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index5[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index5[key];
    }
  });
});

var _index6 = require("./mapper/index");

Object.keys(_index6).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index6[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index6[key];
    }
  });
});

var _index7 = require("./utils/index");

Object.keys(_index7).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index7[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index7[key];
    }
  });
});

var _index8 = require("./logger/index");

Object.keys(_index8).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _index8[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index8[key];
    }
  });
});
},{"./http-client/index":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/http-client/index.js","./controller/index":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/controller/index.js","./module/index":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/module/index.js","./provider/index":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/provider/index.js","./cache/index":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/cache/index.js","./mapper/index":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/mapper/index.js","./utils/index":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/utils/index.js","./logger/index":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/logger/index.js"}],"../../../node_modules/core/src/response/base.provider.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseProvider = void 0;

var _module = require("@sabasayer/module.core");

class BaseProvider extends _module.CoreProvider {
  async post(config, request, options) {
    const response = await super.post(config, request, options);
    return response.data;
  }

}

exports.BaseProvider = BaseProvider;
},{"@sabasayer/module.core":"../../../node_modules/core/node_modules/@sabasayer/module.core/dist/index.js"}],"../../../node_modules/auth/src/auth/auth.config.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signOutRequestConfig = exports.signInRequestConfig = void 0;
const signInRequestConfig = {
  url: "signIn"
};
exports.signInRequestConfig = signInRequestConfig;
const signOutRequestConfig = {
  url: "signOut"
};
exports.signOutRequestConfig = signOutRequestConfig;
},{}],"../../../node_modules/auth/src/auth/auth.provider.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthProvider = void 0;

var _decorators = require("../configurations/decorators");

var _base = require("core/src/response/base.provider");

var _auth = require("./auth.config");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let AuthProvider = class AuthProvider extends _base.BaseProvider {
  constructor() {
    super(...arguments);
    this.baseUrl = "core/auth";
  }

  signIn(request) {
    return this.post(_auth.signInRequestConfig, request);
  }

  signOut(request) {
    return this.post(_auth.signOutRequestConfig, request);
  }

};
exports.AuthProvider = AuthProvider;
exports.AuthProvider = AuthProvider = __decorate([_decorators.injectable.provider()], AuthProvider);
},{"../configurations/decorators":"../../../node_modules/auth/src/configurations/decorators.ts","core/src/response/base.provider":"../../../node_modules/core/src/response/base.provider.ts","./auth.config":"../../../node_modules/auth/src/auth/auth.config.ts"}],"../../../node_modules/auth/src/auth/auth.controller.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthController = void 0;

var _module = require("@sabasayer/module.core");

var _decorators = require("../configurations/decorators");

var _auth = require("./auth.provider");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let AuthController = class AuthController {
  constructor(provider) {
    this.provider = provider;
    this.cacheKey = "signInResponse";
    this.authHeaderKey = "x-authentication-token";
    this.initTokenFromCache();
  }

  get response() {
    return this.cache.get(this.cacheKey);
  }

  get currentUser() {
    return this.response.credential;
  }

  async signIn(request) {
    const response = await this.provider.signIn(request);
    this.useResponse(response);
    return response;
  }

  async signOut() {
    const token = this.response?.token;
    if (!token) return;
    const response = await this.provider.signOut({
      token
    });
    if (!response) throw new Error("Sign out failed");
    this.removeCache();
    this.removeAuthToken();
  }

  useResponse(response) {
    this.cacheResponse(response);
    this.setAuthToken(response.token);
  }

  cacheResponse(response) {
    this.cache.set(this.cacheKey, response);
  }

  initTokenFromCache() {
    const response = this.response;
    if (!response) return;
    this.setAuthToken(response.token);
  }

  setAuthToken(token) {
    this.httpClient.setHeader("x-authentication-token", token);
  }

  removeCache() {
    this.cache.remove(this.cacheKey);
  }

  removeAuthToken() {
    this.httpClient.setHeader(this.authHeaderKey, "");
  }

};
exports.AuthController = AuthController;

__decorate([_decorators.resolve.cache(_module.SessionStorageCache)], AuthController.prototype, "cache", void 0);

__decorate([_decorators.resolve.client()], AuthController.prototype, "httpClient", void 0);

exports.AuthController = AuthController = __decorate([_decorators.injectable.controller({
  provider: _auth.AuthProvider
})], AuthController);
},{"@sabasayer/module.core":"../../../node_modules/@sabasayer/module.core/dist/index.js","../configurations/decorators":"../../../node_modules/auth/src/configurations/decorators.ts","./auth.provider":"../../../node_modules/auth/src/auth/auth.provider.ts"}],"../../../node_modules/auth/src/tenant/tenants.config.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTenantsRequestConfig = void 0;
const getTenantsRequestConfig = {
  url: "getTenants",
  cacheKey: "tenant-model"
};
exports.getTenantsRequestConfig = getTenantsRequestConfig;
},{}],"../../../node_modules/auth/src/tenant/tenant.provider.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TenantProvider = void 0;

var _module = require("@sabasayer/module.core");

var _base = require("../../../core/src/response/base.provider");

var _decorators = require("../configurations/decorators");

var _tenants = require("./tenants.config");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let TenantProvider = class TenantProvider extends _base.BaseProvider {
  constructor() {
    super(...arguments);
    this.baseUrl = "core";
  }

  async getTenants() {
    return this.cachablePost(_tenants.getTenantsRequestConfig, {});
  }

};
exports.TenantProvider = TenantProvider;

__decorate([_decorators.resolve.cache(_module.SessionStorageCache)], TenantProvider.prototype, "cache", void 0);

exports.TenantProvider = TenantProvider = __decorate([_decorators.injectable.provider()], TenantProvider);
},{"@sabasayer/module.core":"../../../node_modules/@sabasayer/module.core/dist/index.js","../../../core/src/response/base.provider":"../../../node_modules/core/src/response/base.provider.ts","../configurations/decorators":"../../../node_modules/auth/src/configurations/decorators.ts","./tenants.config":"../../../node_modules/auth/src/tenant/tenants.config.ts"}],"../../../node_modules/auth/src/tenant/tenant.controller.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TenantController = void 0;

var _decorators = require("../configurations/decorators");

var _tenant = require("./tenant.provider");

var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

let TenantController = class TenantController {
  constructor(provider) {
    this.provider = provider;
  }

  async get() {
    return this.provider.getTenants();
  }

};
exports.TenantController = TenantController;
exports.TenantController = TenantController = __decorate([_decorators.injectable.controller({
  provider: _tenant.TenantProvider
})], TenantController);
},{"../configurations/decorators":"../../../node_modules/auth/src/configurations/decorators.ts","./tenant.provider":"../../../node_modules/auth/src/tenant/tenant.provider.ts"}],"../src/index.ts":[function(require,module,exports) {
"use strict";

require("./configurations");

var _auth = require("auth/src/auth/auth.controller");

var _module = require("auth/src/configurations/module");

var _tenant = require("auth/src/tenant/tenant.controller");

document.body.innerHTML = "Hello";

const main = async () => {
  const controller = _module.authModule.resolveController(_auth.AuthController);

  const tenantController = _module.authModule.resolveController(_tenant.TenantController);

  const res = await controller.signIn({
    username: "ahmetar",
    password: "123456",
    tenantId: 1
  });
  document.body.innerHTML = res?.token;
  await controller.signOut();
  const tenantRes = await tenantController.get();
};

main();
},{"./configurations":"../src/configurations/index.ts","auth/src/auth/auth.controller":"../../../node_modules/auth/src/auth/auth.controller.ts","auth/src/configurations/module":"../../../node_modules/auth/src/configurations/module.ts","auth/src/tenant/tenant.controller":"../../../node_modules/auth/src/tenant/tenant.controller.ts"}],"../../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "51634" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","../src/index.ts"], null)
//# sourceMappingURL=/src.9caef6c7.js.map