var modules = [
  require("./cool.js")
  require("./purge.js"),
]

modules.forEach(function (mod) {
  Object.keys(mod).forEach(function (func) {
    exports[func] = mod[func];
  });
});
