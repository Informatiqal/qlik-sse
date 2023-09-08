// const grpc = require("@grpc/grpc-js");
const q = require("./lib/index.js");
// const { server, sse, pb } = require("./lib/index.js");

// create an instance of the server
const s = q.server({
  identifier: "infoVault",
  version: "0.1.0",
});

function greenOrRed(request) {
  request.on("data", (bundle) => {
    const rows = [];
    // let a = bundle.getRowsList();
    let a;
    try {
      a = q.pb.BundledRows.deserializeBinary(
        Array.from(bundle.getRowsList())
      ).toObject();
    } catch (e) {
      let a = 1;
    }
    // bundle.rows.forEach((row) => {
    rows.push({
      // for each row in the input bundle
      duals: [
        {
          // we add one row to the output, containing only one dual
          // that dual must contain 'strData' because the return type of this function is STRING
          // strData: row.duals[0].numData > 20 ? "green" : "red", // numData is expected to be valid since the dataType of the first param is NUMERIC
          strData: "green",
        },
      ],
    });

    const d = new q.pb.Dual();
    d.setStrdata("green");

    const r = new q.pb.Row();
    r.addDuals(d);

    // const r1 = new q.pb.BundledRows().serializeBinary({ rows });
    const r1 = new q.pb.BundledRows();
    r1.addRows(r);

    request.write(r1);
    // request.write({ rows }); // send data back to Qlik engine
  });
}

// register functions
s.addFunction(greenOrRed, {
  functionType: q.pb.FunctionType.TENSOR,
  returnType: q.pb.DataType.STRING,
  name: "color", // optional, if not specified the name will be the function itself ('greenOrRed')
  params: [
    {
      name: "first",
      dataType: q.pb.DataType.NUMERIC,
    },
    {
      name: "second",
      dataType: q.pb.DataType.NUMERIC,
    },
  ],
});

// start the server
s.start({
  port: 50053,
  allowScript: true,
});
