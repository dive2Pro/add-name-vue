const fs = require("fs-extra");
const path = require("path");
const slash = require("slash");
const { parseComponent } = require("vue-sfc-parser");
const vtc = require("vue-template-compiler");
const splitVueTemplate = require("./split-vue");
function addBlock() {
  return "\r\n";
}
const inlineElements =
  "<a><abbr><acronym><b><bdo><big><br><button><cite><code><dfn><em><i><img><input><kbd><label><map><object><q><samp><script><select><small><span><strong><sub><sup><textarea><time><tt><var>";
function main(options) {
  const { insertAttr } = options;

  function addAttrs(node) {
    const addtionAttrs = insertAttr(node);
    const { attrsMap } = node;
    const finalAttrs = { ...attrsMap, ...addtionAttrs };
    return Object.entries(finalAttrs)
      .map(([k, v]) => {
        return `${k}="${v}"`;
      })
      .join(" ");
  }
  function addSlots(node) {
    const { scopedSlots } = node;
    return Object.keys(scopedSlots).map(key => {
      return traverl(scopedSlots[key]);
    });
  }
  function addChildren(node) {
    const { children } = node;
    if (!children || !children.length) {
      return [];
    }
    return children.map(child => {
      return traverl(child);
    });
  }

  function traverl(node) {
    let str = "";
    if (node.tag === "template") {
      //   console.log(node);
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
    const { scopedSlots } = node;
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
    const { ifConditions } = node;
    if (ifConditions) {
      const [ifSelf, ...ifElse] = ifConditions;
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
    const { tag, attrsMap } = node;

    function getName() {
      const {
        model: { expression },
        parent
      } = node;
      if (parent.tag == "el-form-item" && parent.attrsMap.prop) {
        return chuncakeExpression(parent.attrsMap.prop);
      }
      return chuncakeExpression(expression);
    }

    function nodeToString(node) {
      const { tag, attrsMap } = node;
      let str = "";
      Object.entries(attrsMap).forEach(([k, v]) => {
        str += ` ${k}="${v}" `;
      });
      return `<${tag} ${str} > ...`;
    }

    const formElements = [
      "el-input",
      "el-select",
      "el-input-number",
      "el-radio-group",
      "el-switch",
      "el-checkbox-group",
      "el-date-picker",
      "el-time-picker"
    ];

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
      const { children } = node;
      let dirty = false;
      [
        ["保存", "btn-save"],
        ["取消", "btn-cancel"],
        ["删除", "btn-delete"],
        ["清空", "btn-clear"],
        ["新增", "btn-create"],
        ["关闭", "btn-close"],
        ["确定", "btn-confirm"],
        ["导出", "btn-export"],
        ["搜索", "btn-search"],
        ["上传", "btn-upload"],
        ["新建", "btn-create"],
        ["审核", "btn-check"],
        ["作废", "btn-abandon"],
        ["修改", "btn-change"],
        ["详情", "btn-detail"],
        ["提交", "btn-submit"],
        ["编辑", "btn-edit"],
        ["停止", "btn-stop"],
        ["选择", "btn-select"],
        ["打印", "btn-print"],
        ["返回", "btn-back"],
        ["查询", "btn-search"],
        ["重置", "btn-reset"]
      ].forEach(([k, name]) => {
        if (
          children.find(child => {
            if (!child.text) {
              return;
            }
            const trimed = child.text
              .split("")
              .filter(s => !!s.trim())
              .join("");
            return trimed.indexOf(k) > -1;
          })
        ) {
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
      const { attrsList } = node;
      return attrsList.some(attr => attr.value.indexOf("$router") > -1);
    }

    if (tag === "span" && isRouteSpan(node) && !!attrsMap.name === false) {
      console.warn("需要添加 name", nodeToString(node));
    }

    // console.log(node)
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
  const { template, script, styles } = parseComponent(fileContent);
  const astObj = vtc.compile(`<template>${template.content}</template>`, {
    comments: true
  });
  const repalcedTemplate = astTraver(astObj.ast);
  fs.removeSync(filePath);
  const stylesString = styles.map(singleStyleElement => {
    const attrs = singleStyleElement.attrs
      ? Object.keys(singleStyleElement.attrs)
          .map(key => {
            return `${key}="${singleStyleElement[key]}"`;
          })
          .join(" ")
      : "";
    return `<style ${attrs}>${singleStyleElement.content}</style>`;
  });
  fs.writeFileSync(
    filePath,
    [`${repalcedTemplate}`, `<script>${script.content}</script>`]
      .concat(stylesString)
      .join(addBlock())
  );
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

// run(args);

run(["./src/demo/dialog-check.vue"]);
