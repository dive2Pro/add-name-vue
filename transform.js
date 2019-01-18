const adapt = require("vue-jscodeshift-adapter")
const descriptorToString = require('vue-sfc-descriptor-to-string');

// const target = require('./src/demo/materialCreate.vue')

function addNameToInputElement(fileInfo, api, options) {
    console.log('Hallo');
    console.log(fileInfo.source)
    const j = api.jscodeshift;
    const {statement} = j.template;
    return {
        
    }
}



const main = adapt(addNameToInputElement)

module.exports = main
