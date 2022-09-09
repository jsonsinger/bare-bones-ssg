const fs = require('fs')
const path = require('path')
const glob = require('glob')
const matter = require('gray-matter')
const markdownCompiler = require('marked')
const mkdirp = require('mkdirp')

const ssg = () => {

    const encoding = 'utf-8'
    const layouts = path.resolve('layouts/template.html')
    const template = fs.readFileSync(layouts, encoding)
    const pages = 'pages/**/*.md'

    const dist = path.resolve('dist')
    mkdirp.sync(dist)

    glob.sync(pages).forEach( (pagePath) => 
    {
        const page = fs.readFileSync(pagePath, encoding)
        const {data, content} = matter(page)
        const html = markdownCompiler.marked(content) 
        
        const contents = {
            ...data, // front-matter
            content: html
        }

        // replace `{{ tag }}` in the template
        // with the value in `contents[tag]`
        const render = template.replace(/{{(.*?)}}/g, (match) => {
            const tag = match.split(/{{\s*|\s*}}/).filter(Boolean)[0].trim()
            return contents[tag]
        })

        const pageName = path.parse(pagePath).name + ".html"
        const newFile = path.join(dist, pageName)
    
        fs.writeFileSync(newFile, render)
    })
}

ssg()