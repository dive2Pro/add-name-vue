"use strict";

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const fs = require("fs-extra");

const path = require("path");

const slash = require("slash");

const _require = require("vue-sfc-parser"),
      parseComponent = _require.parseComponent;

const vtc = require("vue-template-compiler");

const splitVueTemplate = require("./split-vue");

function addBlock() {
  return "\r\n";
}

const inlineElements = "<a><abbr><acronym><b><bdo><big><br><button><cite><code><dfn><em><i><img><input><kbd><label><map><object><q><samp><script><select><small><span><strong><sub><sup><textarea><time><tt><var>";

function main(options) {
  const insertAttr = options.insertAttr;

  function addAttrs(node) {
    const addtionAttrs = insertAttr(node);
    const attrsMap = node.attrsMap;

    const finalAttrs = _objectSpread({}, attrsMap, addtionAttrs);

    return Object.entries(finalAttrs).map(([k, v]) => {
      return `${k}="${v}"`;
    }).join(" ");
  }

  function addSlots(node) {
    const scopedSlots = node.scopedSlots;
    return Object.keys(scopedSlots).map(key => {
      return traverl(scopedSlots[key]);
    });
  }

  function addChildren(node) {
    const children = node.children;

    if (!children || !children.length) {
      return [];
    }

    return children.map(child => {
      return traverl(child);
    });
  }

  function traverl(node) {
    let str = "";

    if (node.tag === "template") {//   console.log(node);
    }

    if (node.type === 2) {
      return node.text.trim();
    } else if (node.type === 3) {
      if (node.text.trim()) {
        if (node.isComment) {
          return `<!-- ${node.text} -->`;
        } else {
          return node.text.trim();
        }
      }

      return "";
    }

    function makeOpenTag(tag) {
      return addBlock() + `<${tag} `;
    }

    const start = makeOpenTag(node.tag);
    const attrs = addAttrs(node);

    function closeStartTag() {
      str += " >";
    }

    str += start + attrs;
    closeStartTag();
    const scopedSlots = node.scopedSlots;
    let children;

    if (scopedSlots) {
      const slots = addSlots(node);
      str += slots.join("");
    }

    children = addChildren(node);
    str += children.join("");

    if (["br", "img"].find(s => s === node.tag)) {
      return str;
    }

    makeCloseTag(node.tag);

    function makeCloseTag(tag) {
      str += `</${tag}>`;
    }

    const ifConditions = node.ifConditions;

    if (ifConditions) {
      const _ifConditions = _toArray(ifConditions),
            ifSelf = _ifConditions[0],
            ifElse = _ifConditions.slice(1);

      if (ifElse && ifElse.length) {
        ifElse.forEach(item => {
          str += traverl(item.block);
        });
      }
    }

    return str;
  }

  return traverl;
}

function chuncakeExpression(expression) {
  const reg = /^\"(.+)\"/gi;
  let tExpression = reg.exec(expression);

  if (tExpression) {
    tExpression = tExpression[1].split(".");

    if (tExpression.length > 1) {
      return tExpression.pop();
    } else {
      return tExpression.shift();
    }
  }

  return expression;
}

const astTraver = main({
  insertAttr: node => {
    const tag = node.tag,
          attrsMap = node.attrsMap;

    function getName() {
      const expression = node.model.expression,
            parent = node.parent;

      if (parent.tag == "el-form-item" && parent.attrsMap.prop) {
        return chuncakeExpression(parent.attrsMap.prop);
      }

      return chuncakeExpression(expression);
    }

    function nodeToString(node) {
      const tag = node.tag,
            attrsMap = node.attrsMap;
      let str = "";
      Object.entries(attrsMap).forEach(([k, v]) => {
        str += ` ${k}="${v}" `;
      });
      return `<${tag} ${str} > ...`;
    }

    const formElements = ["el-input", "el-select", "el-input-number", "el-radio-group", "el-switch", "el-checkbox-group", "el-date-picker", "el-time-picker"];

    if (formElements.find(elName => elName === tag)) {
      try {
        return {
          name: getName()
        };
      } catch (e) {
        console.error("getName 出现错误, ", nodeToString(node));
      }
    }

    if (tag === "el-button" && !!attrsMap.name === false) {
      const children = node.children;
      let dirty = false;
      [["保存", "btn-save"], ["取消", "btn-cancel"], ["删除", "btn-delete"], ["清空", "btn-clear"], ["新增", "btn-create"], ["关闭", "btn-close"], ["确定", "btn-confirm"], ["导出", "btn-export"], ["搜索", "btn-search"], ["上传", "btn-upload"], ["新建", "btn-create"], ["审核", "btn-check"], ["作废", "btn-abandon"], ["修改", "btn-change"], ["详情", "btn-detail"]].forEach(([k, name]) => {
        if (children.find(child => {
          if (!child.text) {
            return;
          }

          const trimed = child.text.split("").filter(s => !!s.trim()).join("");
          return trimed.indexOf(k) > -1;
        })) {
          dirty = {
            name: name
          };
        }
      });

      if (dirty) {
        return dirty;
      }

      console.error("需要添加 name", nodeToString(node));
    }

    function isRouteSpan(node) {
      const attrsList = node.attrsList;
      return attrsList.some(attr => attr.value.indexOf("$router") > -1);
    }

    if (tag === "span" && isRouteSpan(node) && !!attrsMap.name === false) {
      console.warn("需要添加 name", nodeToString(node));
    } // console.log(node)


    return {};
  }
});
const args = process.argv.slice(2);

function go(filePath) {
  filePath = slash(filePath);
  const isDirectory = fs.lstatSync(filePath).isDirectory();

  if (isDirectory) {
    fs.readdirSync(filePath).forEach(file => {
      const childFilePath = filePath + "/" + file;
      go(childFilePath);
    });
    return;
  } else if (!fs.lstatSync(filePath).isFile() || !filePath.endsWith(".vue")) {
    return;
  }

  console.log(`Working: ${filePath}`);
  const fileContent = fs.readFileSync(filePath).toString();

  const _parseComponent = parseComponent(fileContent),
        template = _parseComponent.template,
        script = _parseComponent.script,
        styles = _parseComponent.styles;

  const astObj = vtc.compile(`<template>${template.content}</template>`, {
    comments: true
  });
  const repalcedTemplate = astTraver(astObj.ast);
  fs.removeSync(filePath);
  const stylesString = styles.map(singleStyleElement => {
    const attrs = singleStyleElement.attrs ? Object.keys(singleStyleElement.attrs).map(key => {
      return `${key}="${singleStyleElement[key]}"`;
    }).join(" ") : "";
    return `<style ${attrs}>${singleStyleElement.content}</style>`;
  });
  fs.writeFileSync(filePath, [`${repalcedTemplate}`, `<script>${script.content}</script>`].concat(stylesString).join(addBlock()));
}

function run(options) {
  console.log(options);

  if (!options.length) {
    return;
  }

  const projectCwd = process.cwd();
  let dir = options[0];

  if (dir === "--dir") {
    dir = options[1];
    dir = path.join(projectCwd, dir);
    go(dir);
  } else {
    // file
    go(path.join(projectCwd, dir));
  }
}

run(args); // run(["./src/demo/dialog-check.vue"]);