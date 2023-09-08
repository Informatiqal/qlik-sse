const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const protoBuf = require("protobufjs");
const path = require("path");

const funcs = require("./functions");
const { getEvaluateScript } = require("./script");

const root = protoLoader.loadSync(
  path.resolve(__dirname, "..", "assets", "SSE.proto")
);

const sseTemp = protoBuf.loadSync(
  path.resolve(__dirname, "..", "assets", "SSE.proto")
).root;

const grpcTypes = {
  DataType: sseTemp.lookupTypeOrEnum("qlik.sse.DataType"),
  FunctionType: sseTemp.lookupTypeOrEnum("qlik.sse.FunctionType"),
  Empty: sseTemp.lookupTypeOrEnum("qlik.sse.Empty"),
  Parameter: sseTemp.lookupTypeOrEnum("qlik.sse.Parameter"),
  FieldDescription: sseTemp.lookupTypeOrEnum("qlik.sse.FieldDescription"),
  FunctionDefinition: sseTemp.lookupTypeOrEnum("qlik.sse.FunctionDefinition"),
  Capabilities: sseTemp.lookupTypeOrEnum("qlik.sse.Capabilities"),
  Dual: sseTemp.lookupTypeOrEnum("qlik.sse.Dual"),
  Row: sseTemp.lookupTypeOrEnum("qlik.sse.Row"),
  BundledRows: sseTemp.lookupTypeOrEnum("qlik.sse.BundledRows"),
  ScriptRequestHeader: sseTemp.lookupTypeOrEnum("qlik.sse.ScriptRequestHeader"),
  FunctionRequestHeader: sseTemp.lookupTypeOrEnum(
    "qlik.sse.FunctionRequestHeader"
  ),
  CommonRequestHeader: sseTemp.lookupTypeOrEnum("qlik.sse.CommonRequestHeader"),
  TableDescription: sseTemp.lookupTypeOrEnum("qlik.sse.TableDescription"),
};

const { sse: sseInternal } = grpc.loadPackageDefinition(root).qlik;

const logFn = (level) => ({
  error: level >= 1 ? console.error : () => {},
  info: level >= 2 ? console.log : () => {},
});

/**
 * @param {object} config
 * @param {object|boolean} config.allowScript
 * @param {string} config.identifier
 * @param {number} [config.logLevel = 2] The log output level
 * @returns {server}
 */
const server = (config) => {
  const log = logFn(typeof config.logLevel === "number" ? config.logLevel : 2);
  const functions = funcs({ grpc, log, sse: grpcTypes });

  const evaluateScript = getEvaluateScript({
    config,
    sse: grpcTypes,
    grpc,
    log,
  });

  function getCapabilities(request, cb) {
    log.info(`Capabilities of plugin '${config.identifier}'`);
    log.info(`  AllowScript: ${!!config.allowScript}`);
    log.info("  Functions:");
    const type = {
      [sseInternal.DataType.NUMERIC]: "numeric",
      [sseInternal.DataType.STRING]: "string",
    };
    functions.list().forEach((f) => {
      log.info(
        `    ${f.name}(${f.params.map((p) => type[p.dataType])}) : ${
          type[f.returnType]
        }`
      );
    });

    cb(null, {
      allowScript: !!config.allowScript,
      functions: functions.list(),
      pluginIdentifier: config.identifier,
      pluginVersion: config.version,
    });
  }

  let grpcServer;

  function start(startConfig = {}) {
    const port = startConfig.port || 50051;
    grpcServer = new grpc.Server();
    grpcServer.addService(sseInternal.Connector.service, {
      getCapabilities,
      executeFunction: functions.execute,
      evaluateScript,
    });

    grpcServer.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      () => {
        grpcServer.start();
        log.info(`Server listening on port ${port}`);
      }
    );
  }

  return {
    start,
    close() {
      return new Promise((resolve, reject) => {
        if (!grpcServer) {
          reject();
        }
        grpcServer.tryShutdown(resolve);
      });
    },
    addFunction: functions.add,
  };
};

module.exports = {
  server,
  sse: grpcTypes,
};
