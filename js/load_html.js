const html_loaded = new Event('html_loaded')

let col_content = ['temp', 'news']  
let page_content = []

function get_widgets() {
    page_content = localStorage.getItem('widget_names').split(',')
    load_html()
}


function load_html() {
    const html_element = {
        temp: `
        <div class="child loc">
            <div class="city"></div>
            <div class="date"></div>
        </div>
        <div class="child temp-display">
            <div class="temp">
                <div class="num"></div>
                <div class="deg"></div>
            </div>
            <div class="desc">
                <div class="weather unfocus"></div>
            </div>
        </div>`,
        news: `<div class="child blur" id="news_container"></div>`,
        graph: `
        <div class="blur graph">
            <canvas></canvas>
            <ul class="row" id="dates"></ul>
        </div>`,
        col: ``
    }

    html_element.col = `
        <div class="col">
            ${html_element[col_content[0]]}
        </div>
        <div class="col">
            ${html_element[col_content[1]]}
        </div>`

    page_content.forEach(html => {
        const div = document.createElement('div')
        div.className = 'c'
        div.innerHTML = html_element[html]
        document.body.appendChild(div)
    })

    // particle here
    // create canvas
    const canvas = document.createElement('canvas')
    // give canvas id of bg
    canvas.id = 'bg'
    // push canvas
    document.body.appendChild(canvas)

    window.dispatchEvent(html_loaded)
}

document.addEventListener('DOMContentLoaded', () => get_widgets())
