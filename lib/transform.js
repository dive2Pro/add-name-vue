"use strict";

const adapt = require("vue-jscodeshift-adapter");

const descriptorToString = require('vue-sfc-descriptor-to-string');

const target = require('./demo/materialCreate.vue');

function addNameToInputElement(fileInfo, api, options) {
  console.log(fileInfo);
  console.log(api);
  console.log(options);
}

const main = adapt(addNameToInputElement);
module.exports = main;