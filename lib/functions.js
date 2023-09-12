const funcs = ({ sse, grpc, emitEvent }) => {
  const functions = [];
  const functionMap = {};
  const functionTableDescriptionMap = {};
  let expando = 1000;

  const f = {
    /**
     * Get list of all registered functions
     *
     * @returns {array}
     */
    list() {
      return functions;
    },
    /**
     * Add function
     *
     * @param {object} fn
     * @param {object} fnConfig
     * @param {string} [fnConfig.name] Name of the function
     * @param {number} fnConfig.functionType Type of the function - Scalar, Aggregation or Tensor (0, 1, 2)
     * @param {number} fnConfig.returnType What data type the function returns - String, Numeric or Dual (0, 1, 2)
     * @param {Object[]} fnConfig.params List of parameters that will be send FROM Qlik
     * @param {string} [fnConfig.params[].name] Name of the parameter
     * @param {number} [fnConfig.params[].dataType] What is the type of the parameter - String, Numeric or Dual (0, 1, 2)
     * @param {array} [fnConfig.tableDescription] Description of the returned table when function is called from load script using the extension clause
     */
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
    },
    execute(request) {
      let functionHeader;

      try {
        functionHeader = sse.FunctionRequestHeader.decode(
          request.metadata.get("qlik-functionrequestheader-bin")[0]
        );
      } catch (e) {
        request.call.sendError({
          code: grpc.status.CANCELLED,
          details:
            "Unable to parse qlik-functionrequestheader-bin header. Aborting",
        });
        request.end();
        return;
      }

      const fn = functionMap[functionHeader.functionId];
      if (fn) {
        const tableDescription =
          functionTableDescriptionMap[functionHeader.functionId];
        if (tableDescription) {
          const tableMeta = new grpc.Metadata();
          tableMeta.set(
            "qlik-tabledescription-bin",
            Buffer.from(
              JSON.stringify(
                sse.TableDescription.create(tableDescription).toJSON()
              )
            )
          );

          request.sendMetadata(tableMeta);
        }
        try {
          fn(request);
        } catch (e) {
          emitEvent("error", e)
          request.call.sendError({
            code: grpc.status.UNKNOWN,
            details: e.message,
          });
          request.end();
          return;
        }
      } else {
        request.call.sendError({
          code: grpc.status.UNIMPLEMENTED,
          details: "The method is not implemented.",
        });
        request.end();
        return;
      }

      if (fn.constructor.name !== "AsyncFunction") {
        request.on("end", () => request.end());
      }
    },
  };

  return f;
};

export default funcs;
