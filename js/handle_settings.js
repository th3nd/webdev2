const wparent = document.querySelector('#widgets')

var page_count = 0
function add_widget(dname='none') {
    page_count++
    const widget = document.createElement('div')
    widget.classList.add('widget')
    widget.innerHTML = `
    <p>page ${page_count}</p>
    <div class="dropdown">
        <p class="name">${dname}</p>
        <div class="options">
            <ul>
                <li>none</li>
                <li>graph</li>
                <li>temp</li>
                <li>news</li>
                <li>col</li>
        </div>
    </div>
    `
    wparent.appendChild(widget)

    // Add the click event listener for this widget's 'name' element
    handle_dropdown(widget.querySelector('.name'))
}

function save_widgets() {
    names= []
    const widgets = document.querySelectorAll('.widget')
    for (let i = 0; i < widgets.length; i++) {
        const name = widgets[i].querySelector('.name').innerText
        if (name != 'none')
            names.push(name)
    }
    
    localStorage.setItem('widget_names', names)
    load_widgets()
}


function load_widgets() {
    page_count = 0
    let names
    try {
        names = localStorage.getItem('widget_names').split(',')
    } catch (e) {
        // default values for when we havent loaded settings before
        names = ['col', 'graph']
    }
    wparent.innerHTML = ''
    for (let i = 0; i < names.length; i++) {
        add_widget(names[i])
    }
}

// handle dropdowns in settings, helperfunc
function handle_dropdown(el) {
    el.parentElement.addEventListener('click', e => { 
        // check if clicked is inside options div, and what option was clicked
        const options = e.target.parentElement.parentElement
        if (options.classList.contains('options')) {
            const option = e.target.innerText
            el.innerText = option

            display_option(option)
        }
    })
}

function display_option(option) {
    const bgoptions = ['image', 'color', 'dynamic', 'particles']
    // this is only for our background type widget, and badly hardcoded
    // if bgoptions contain option
    if (bgoptions.includes(option)) {
        // hide all options
        bgoptions.forEach(option => {
            document.querySelector(`#${option}`).style.display = 'none'
        })
        document.querySelector(`#${option}`).style.display = 'block'
        // write the option to localStorage
        localStorage.setItem('bgtype', option)
    }
}

document.querySelector('#add').addEventListener('click', () => add_widget())
document.querySelector('#save').addEventListener('click', () => save_widgets())
document.addEventListener('DOMContentLoaded', () => {
    // get info on darkmode checkbox
    const darkmode = localStorage.getItem('darkmode')
    if (darkmode)
        document.querySelector('#darkmode').checked = darkmode
    else
        document.querySelector('#darkmode').checked = true
        

    // correctly set the name for dropdown.
    // grab bgtype from localstorage
    let first_name = localStorage.getItem('bgtype')
    if (!first_name)
        first_name = 'default'
        
    const drop = document.querySelector("#coloroptions")
    drop.innerText = first_name
    display_option(first_name)

    // add eventlistener for all dropdowns
    handle_dropdown(drop)
    // grab colors from localstorage
    load_widgets()
    // grab how many colors we have saved here, use that as param.
    let clr_num
    try {
        clr_num = localStorage.getItem('colors').split(':').length-1
    } catch (e) {
        // default value if we dont have any previous colors is 3.
        clr_num = 3
    }
    draw_picker(clr_num)
})


// eventlistener for all spans in options div
const options_changed = new Event("options_changed")
const options = document.querySelectorAll('span')
options.forEach(option => {
    option.addEventListener('click', e => {
        window.dispatchEvent(options_changed)

        // fix something here so that num_el starts with the correct num instead of always being 3.
        let num_el = document.querySelector('#numcolor')
        let num = parseInt(num_el.innerText)

        if (e.target.id == 'less' && num > 1) {
            num--
            // remove last color
            const colors = JSON.parse(localStorage.getItem('colors'))

            // TODO: filter out all colors that doesnt end with color
            const keys = Object.keys(colors)
            const lastKey = keys.filter(key => key.startsWith('color'))[keys.length - 1]
            // const keys = Object.keys(colors)
            // const lastKey = keys[keys.length - 1]
            if (lastKey) 
                delete colors[lastKey]
            localStorage.setItem('colors', JSON.stringify(colors))
        }
        else if (e.target.id == 'more') {
            num++
        }
        num_el.innerText = num
        
        draw_picker(num)
    })
})

function draw_picker(n) {
    // append child to options div
    const ul = document.querySelector('.color_list')
    ul.innerHTML = ''
    for (let i = 0; i < n; i++){
        let colorpicker = document.createElement('li')
        let name = document.createElement('p')
        let picker = document.createElement('div')
        name.innerText = `color ${i+1}`
        picker.className = 'pick'
        picker.id = `color${i+1}`
        picker.onclick = () => open_colorpicker(picker)
        picker.onload = set_color(picker)
        // set picker bg color to color in localstorage
        colorpicker.appendChild(name)
        colorpicker.appendChild(picker)
        ul.appendChild(colorpicker)
    } 
}

// eventlistener for when button with id save_img is clicked.
document.querySelector('#img_save').addEventListener('click', () => {    
    // grab value from input with id image_input
    const url = document.querySelector('#image_input').value
    // save url to localstorage
    localStorage.setItem('bg_url', url)
})

// eventlistener for all input with type checkbox
document.querySelectorAll('input[type=checkbox]').forEach(check => {
    check.addEventListener('click', e => {
        // save value to localstorage
        if (e.target.id == 'darkmode') {
            localStorage.setItem(`${e.target.id}`, e.target.checked)
        }
    })
})

// eventlitener for all input with type range
document.querySelectorAll('input[type=range]').forEach(range => {
    range.addEventListener('input', e => {
        // save value to localstorage
        localStorage.setItem(`${e.target.id}`, e.target.value)
        // set ::after content to target value
        document.querySelector(`#${e.target.id}_val`).innerText = e.target.value
    })
})


// display slider val.
// get all input[type=range] using forEach.
document.querySelectorAll('input[type=range]').forEach(range => {
    // get value from localstorage
    const val = localStorage.getItem(range.id)
    // set value to range
    document.querySelector(`#${range.id}_val`).innerHTML = val
    range.value = val
})

// do the same for colorpickers. load the color
// the reason for this not working with all colorpickers are that some are loaded later with other funcitons.
document.querySelectorAll('.pick').forEach(e => {
    let clr
    try {
        clr = JSON.parse(localStorage.getItem('colors'))[e.id]
    } catch (e) {
        // set default color on colorpicker if color isnt set beforehand
        clr = '#ffffff'
    }
    e.style.background = clr
})