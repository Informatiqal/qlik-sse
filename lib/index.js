import { EventEmitter } from "events";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import protoBuf from "protobufjs";
import path from "path";
import funcs from "./functions.js";
import { getEvaluateScript } from "./script.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.resolve(__dirname, "..", "assets", "SSE.proto");

const root = protoLoader.loadSync(protoPath);
const sseTemp = protoBuf.loadSync(protoPath).root;

const fullDefinition = grpc.loadPackageDefinition(root).qlik;

// @ts-ignore
const sseServices = fullDefinition.sse;

/**
 * Protobuf classes
 */
export const sse = {
  ...sseServices,
  DataType: sseTemp.lookupEnum("qlik.sse.DataType").values,
  FunctionType: sseTemp.lookupEnum("qlik.sse.FunctionType").values,
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

/**
 * All messages are sended through here. `info` and `error` events are available
 */
export const emitter = new EventEmitter();

function emitEvent(level, message) {
  const levels = {
    info: (message) => {
      emitter.emit("info", message);
    },
    error: (message) => {
      emitter.emit("error", message);
    },
  };

  levels[level](message);
}

/**
 * @param {object} config
 * @param {object|boolean} [config.allowScript]
 * @param {string} config.identifier
 * @param {string} config.version Version of the SSE
 * @param {object} [config.ssl]
 * @param {Buffer} config.ssl.root
 * @param {Buffer} config.ssl.cert
 * @param {Buffer} config.ssl.key
 */
export const server = (config) => {
  if (!config.hasOwnProperty("allowScript")) config.allowScript = false;

  const functions = funcs({ grpc, emitEvent, sse });

  const evaluateScript = getEvaluateScript({
    config,
    sse,
    grpc,
    emitEvent,
  });

  function getCapabilities(request, cb) {
    emitEvent("into", `Capabilities requested from: ${request.getPeer()}`);

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
    grpcServer.addService(sseServices.Connector.service, {
      getCapabilities,
      executeFunction: functions.execute,
      evaluateScript,
    });

    // create insecure server if certificates are not provided
    if (!config.ssl)
      grpcServer.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        () => {
          grpcServer.start();
          emitEvent("info", `Server listening on port ${port}`);
        }
      );

    // create SECURE server if certificates are provided
    if (config.ssl) {
      // if ssl config is provided but certificate is not Buffer or missing
      if (!config.ssl.cert || !(config.ssl.cert instanceof Buffer))
        throw new Error(`Cert is missing or its not Buffer`);

      // if ssl config is provided but certificate key is not Buffer or missing
      if (!config.ssl.key || !(config.ssl.key instanceof Buffer))
        throw new Error(`Key is missing or its not Buffer`);

      // if ssl config is provided but root certificate is not Buffer or missing
      if (!config.ssl.root || !(config.ssl.root instanceof Buffer))
        throw new Error(`Root is missing or its not Buffer`);

      grpcServer.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createSsl(
          config.ssl.root,
          [
            {
              private_key: config.ssl.key,
              cert_chain: config.ssl.cert,
            },
          ],
          false
        ),
        () => {
          grpcServer.start();
          emitEvent("info", `SECURE Server listening on port ${port}`);
        }
      );
    }

    emitEvent("info", `Capabilities of plugin '${config.identifier}'`);
    emitEvent("info", `AllowScript: ${!!config.allowScript}`);
    emitEvent("info", `Functions:`);

    const type = sseServices.DataType.type.value.reduce(
      (ac, { ["number"]: x, name }) => ((ac[x] = name.toLowerCase()), ac),
      {}
    );

    functions.list().forEach((f) => {
      emitEvent(
        "info",
        `    ${f.name}(${f.params.map((p) => type[p.dataType])}) : ${
          type[f.returnType]
        }`
      );
    });
  }

  return {
    /**
     * Start the server
     */
    start,
    /**
     * Shut down the server
     */
    close() {
      return new Promise((resolve, reject) => {
        if (!grpcServer) reject();

        grpcServer.tryShutdown(resolve);
      });
    },
    /**
     * Register new SSE function that will process data from Qlik
     *
     * @param fn -
     * @param fnConfig -
     */
    addFunction: functions.add,
  };
};
