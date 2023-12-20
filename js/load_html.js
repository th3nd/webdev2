// main file for all the small js code blobs
// this file loads the html for the page from localstorage, updates the clock; and refreshes the site every 20 mins.

// load html from localstorage
function load_html() {
    // try to grab page and row content. if it fails, use default values
    
    let page_content = localStorage.getItem('widget_names')
    if (!page_content) {
        localStorage.setItem('widget_names', ['row', 'graph'])
        load_html()
    }

    let row_content = localStorage.getItem('row_content')
    if (!row_content) {
        localStorage.setItem('row_content', ['temp', 'news'])
        load_html()
    }

    page_content = page_content.split(',')
    row_content = row_content.split(',')

    // define html elements
    const html_element = {
        temp: `
        <div class="child loc">
            <div><span class="city"></span><span class="country unfocused"</span></div>
            <div><span class="clock"></span><span class="date unfocused"></span></div>
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
        news: `<div class="child blur news_container"></div>`,
        graph: `
        <div class="blur graph">
            <canvas></canvas>
            <ul class="row dates"></ul>
        </div>`,
        row: ``
    }

    html_element.row = `
        <div class="col">
            ${html_element[row_content[0]]}
        </div>
        <div class="col">
            ${html_element[row_content[1]]}
        </div>`

    page_content.forEach(html => {
        const div = document.createElement('div')
        div.className = 'c'
        div.innerHTML = html_element[html]
        document.body.appendChild(div)
    })

    // this will be faster than fetch data, but if it isnt we should use custom events.

    // after we load all the html, its time to grab settings from localStorage and apply them.
    apply_settings()
}

function apply_settings() {
    // settings avaliable:
    // bg option:
        // color
        // image
        // dynamic
        // particle

    const option = localStorage.getItem('bgtype')

    switch (option) {
        case 'color':
            let bg_colors = localStorage.getItem('bgcolors')
            if (!bg_colors) {
                localStorage.setItem('bgcolors', ['#343d80', '#1e2d6e'])
                apply_settings()
            }

            bg_colors = bg_colors.split(',')

            // set bg color
            document.documentElement.style.background = bg_colors[0]
            // set gradient
            if (bg_colors.length == 1) break
            let gradient = 'linear-gradient(to bottom, '
            for (let i = 0; i < bg_colors.length; i++) {
                gradient += bg_colors[i]
                if (i != (bg_colors.length - 1)) {
                    gradient += ', '
                }
            }
            gradient += ')'
            document.body.style.background = gradient

            break
        case 'image':
            // get image url.
            const url = localStorage.getItem('bgimage')
            document.body.style.backgroundImage = `url('${url}')`
            // set the image to cover
            document.body.style.backgroundSize = 'cover'
            break
        case 'dynamic':
            break
        case 'particle':
            // TODO
            break
        default:
            // if we dont have an option selected
            localStorage.setItem('bgtype', 'color')
            apply_settings()
            break
    }

    // check if we have darkmode on
    const darkmode = localStorage.getItem('darkmode')
    console.log(darkmode)
    if (darkmode === null) {
        localStorage.setItem('darkmode', '-1')
        apply_settings()
    }

    // if darkmode is off, set the colors to lightmode
    if (darkmode.toString() == '0') {
        document.documentElement.style.setProperty('--text-color', '#1b1b1b')

        // remove .gearicon 's filter
        document.querySelector('.gearicon').style.filter = 'none'
    }
}

// update clock
function update_clock() {
    const time = new Date()
    const hours = time.getHours()
    const minutes = time.getMinutes()
    const seconds = time.getSeconds()
    const day = time.getDate()
    const month = time.getMonth()
    const year = time.getFullYear()
    const formatted_date = `${day}/${month}/${year}`
    const formatted_time = `${hours}:${minutes}:${seconds}`

    
    // grab all clock div elements
    const clocks = document.querySelectorAll(".clock")
    // loop thru all clocks
    clocks.forEach(clock => {
        // update clock
        clock.innerHTML = formatted_time
    })

    // same thing for date
    const dates = document.querySelectorAll(".date")
    dates.forEach(date => {
        date.innerHTML = formatted_date
    })

    // refresh clock every second
    window.setTimeout(() => {
        update_clock()
    }, 1000)
}

// refresh site every 20 mins
let refreshed = false
function refresh_site() {
    // dont refresh instantly when the function is ran
    if (!refreshed) {
        refreshed = true
        return
    }
    window.setTimeout(() => {
        window.location.reload()
    }, 1200000)
}

// load html, update clock, refresh site
load_html()
update_clock()
refresh_site()