const fs = require('fs-extra')
const path = require('path')
const { parseComponent } = require('vue-sfc-parser')
const vtc = require('vue-template-compiler')
const projectPath = process.cwd() + "\\src"
// const path = projectPath + '\\demo\\materialCreate.vue'

function addBlock() {
    return '\r\n'
}

function main(options) {
    console.log(options)
    const { insertAttr } = options


    function addAttrs(node) {
        const addtionAttrs = insertAttr(node)
        const { attrsMap } = node
        const finalAttrs = {...attrsMap, ...addtionAttrs}
        return Object.entries(finalAttrs).map(([k, v]) => {
            return `${k}="${v}"`
        }).join(" ")
    }

    function addChildren(node) {
        const { children } = node
        if(!children || !children.length) {
            return []
        }
        return children.map(child => {
            return traverl(child)
        })
    }
    function traverl(node) {
        let str = ''
        if(node.type === 2){
            return node.text
        } else if(node.type === 3 && node.isComment) {
            if(node.text.trim()) {
                return `<!-- ${node.text} -->`
            }
            return ''
        }
        function makeOpenTag(tag) {
            return `<${tag} `
        }
        const start = makeOpenTag(node.tag)
        const attrs = addAttrs(node)
        function closeStartTag(){
            str += (' >')
        }
        const children = addChildren(node)
        str += (start + attrs)
        closeStartTag()
        str += children.join(addBlock())
        makeCloseTag(node.tag)
        function makeCloseTag(tag) {
            str+= `</${tag}>`
        }
        return str
    }

    return traverl
}

const astTraver = main({insertAttr: (node) => {
    const { tag  } = node
    function getName() {
        const { model: { expression }, parent } = node
        // console.log(parent, ' --- ', node)
        if(parent.tag == 'el-form-item' && parent.attrsMap.prop) {
            return parent.attrsMap.prop
        }
        return expression
    }
    if(tag === 'el-input') {
        return {
            name: getName()
        }
    }
}})

const args = process.argv.slice(2);

function go(filePath) {
    const fileContent =  fs.readFileSync(filePath).toString()
    const { template, script, styles } = parseComponent(fileContent)
    const astObj = vtc.compile(template.content , {comments: true})
    const repalcedTemplate = astTraver(astObj.ast)
    fs.removeSync(filePath)
    const stylesString = styles.map(singleStyleElement => {
     const attrs =  singleStyleElement.attrs ?  Object.keys(singleStyleElement.attrs).map(key => {
        return `${key}="${singleStyleElement[key]}"`
    }).join(' ') : ''
     return `<style ${attrs}>${singleStyleElement.content}</style>`
    })
    fs.writeFileSync(filePath, [`<template>${repalcedTemplate}</template>`, `<script>${script.content}</script>`].concat(stylesString).join(addBlock()))
}

function run(options) {
    console.log(options)
    if(!options.length) {
        return
    }
    const projectCwd = process.cwd()
    let dir = options[0]
    if(dir === '--dir') {
       dir = options[1]  
       dir = path.join(projectCwd, dir)
       const files = fs.readdirSync(dir).filter( file => file.endsWith('.vue'))
       files.forEach(file => {
            const filePath = dir + '\\'+ file
            go(filePath)
       })
    } else {
        // file
        go(path.join(projectCwd, dir))
    }
}

run(args)