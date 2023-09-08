// const aa = require("../assets/SSE_pb.js")

const funcs = ({ sse, grpc, log }) => {
  const functions = [];
  const functionMap = {};
  const functionTableDescriptionMap = {};
  let expando = 1000;

  const f = {
    list() {
      return functions;
    },
    add(fn, fnConfig) {
      const name = fnConfig.name || fn.name;
      functions.push({
        name,
        functionType: fnConfig.functionType,
        returnType: fnConfig.returnType,
        params: fnConfig.params,
        functionId: ++expando,
      });

      if (fnConfig.tableDescription) {
        functionTableDescriptionMap[expando] = fnConfig.tableDescription;
      }
      functionMap[expando] = fn;

      let a = 1;
    },
    execute(request) {
      // let a = request.metadata.get("qlik-functionrequestheader-bin")[0];

      // const functionHeader = sse.FunctionRequestHeader.deserializeBinary(
      //   request.metadata.get("qlik-functionrequestheader-bin")[0]
      // );
      // const fn = functionMap[functionHeader.getFunctionid()];
      const fn = functionMap[1001];
      if (fn) {
        // const tableDescription =
        //   functionTableDescriptionMap[functionHeader.getFunctionid()];

        const tableDescription = functionTableDescriptionMap[1001];
        if (tableDescription) {
          const tableMeta = new grpc.Metadata();
          // tableMeta.set('qlik-tabledescription-bin', new sse.TableDescription(tableDescription).encodeNB());
          tableMeta.set(
            "qlik-tabledescription-bin",
            Buffer.from(tableDescription)
          );
          request.sendMetadata(tableMeta);
        }
        try {
          fn(request);
        } catch (e) {
          log.error(e);
          request.call.cancelWithStatus(grpc.status.UNKNOWN, e.message);
        }
      } else {
        request.call.sendError("Dasdasdasd");
        // request.call.cancelWithStatus(
        //   grpc.status.UNIMPLEMENTED,
        //   "The method is not implemented."
        // );
        return;
      }

      if (fn.constructor.name !== "AsyncFunction") {
        request.on("end", () => request.end());
      }
    },
  };

  return f;
};

module.exports = funcs;
