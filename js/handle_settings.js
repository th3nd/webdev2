import { get_colors, rgb_to_hex } from "./colorpicker.js"

const globals = {
    widget_names: [],
    row_content: [],
    accent_color: '',
    bgtype: '',
    bgcolors: [],
    bgimage: '',
    darkmode: -1
}

var page_count = 0
function add_widget(default_name='none') {
    page_count++
    const widget = document.createElement('div')
    widget.classList.add('widget')
    widget.classList.add('dropdown_parent')
    widget.innerHTML = `
    <p>page ${page_count}</p>
    <div class="dropdown">
        <p class="name">${default_name}</p>
        <div class="options">
            <ul>
                <li>none</li>
                <li>graph</li>
                <li>temp</li>
                <li>news</li>
                <li>row</li>
        </div>
    </div>
    `
    // append child to the widget container
    document.querySelector('.w').appendChild(widget)

    // add the click event listener for this widget's 'name' element
    handle_dropdown(widget.querySelector('.name'))
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

// function only used for 1 dropdown
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
        // write the option to globals
        globals.bgtype = option
    }
}

function load_widgets() {
    // Load the widgets from the local storage
    const widgets = globals.widget_names.split(',')
    // TODO: now we just assume that the user has loaded the main page before the settings page.
    if (widgets == null) return
    for (const widget of widgets) {
        add_widget(widget)
    }
}

// event listener for 'add' button
document.querySelector('#add').addEventListener('click', () => {
    add_widget()
})

function get_variables() {
    // loop thru globals obj, get values from localstorage
    for (const key in globals) {
        globals[key] = localStorage.getItem(key)
    }

    // checkbox eventlistener (dynamic)
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        // load vals from localstorage
        checkbox.checked = (parseInt(globals[checkbox.id]) == 1) ? true : false
        checkbox.addEventListener('change', e => {
            const checked = e.target.checked
            const id = e.target.id
            globals[id] = (checked == true) ? 1 : 0
        })
    })

    // same for textfields
    document.querySelectorAll('input[type="text"]').forEach(textfield => {
        textfield.value = globals[textfield.id]
        textfield.addEventListener('input', e => {
            const value = e.target.value
            const id = e.target.id
            globals[id] = value
        })
    })

    const num = document.querySelector('#numcolor').innerText = globals.bgcolors.split(',').length

    for (let i = 0; i < num; i++) {
        add_picker(i+1)
    }

    // load colors from localstorage
    const bgcolors = globals.bgcolors.split(',')

    // bgcolors
    for (let i = 0; i < bgcolors.length; i++) {
        const color = bgcolors[i]
        const el = document.querySelector(`#color${i+1}`)
        el.style.backgroundColor = color
    }

    document.querySelector('#accent').style.backgroundColor = globals.accent_color

    const dropdowns = document.querySelectorAll('.dropdown')
    for (const dropdown of dropdowns) {
        handle_dropdown(dropdown.querySelector('.name'))
    }

    // change bgtype dropdown
    const bgtype = globals.bgtype
    const bgoptions = ['image', 'color', 'dynamic', 'particles']
    // this is only for our background type widget, and badly hardcoded
    // if bgoptions contain option
    if (bgoptions.includes(bgtype)) {
        // change dropdown name to bgtype
        document.querySelector('.bgtype .name').innerText = bgtype
        // hide all options
        bgoptions.forEach(option => {
            document.querySelector(`#${option}`).style.display = 'none'
        })
        document.querySelector(`#${bgtype}`).style.display = 'block'
        // write the option to globals
        globals.bgtype = bgtype
    }


    load_widgets()
}

// eventlistener for #more
document.querySelector('#more').addEventListener('click', () => {
    const numcolor = document.querySelector('#numcolor')
    const num = parseInt(numcolor.innerText) + 1
    add_picker(num)
})

// eventlistener for #less
document.querySelector('#less').addEventListener('click', () => {
    const numcolor = document.querySelector('#numcolor')
    const num = parseInt(numcolor.innerText) - 1
    remove_picker(num)

})


function add_picker(num) {
    if (num <= 5) {
        numcolor.innerText = num
        // make the child with index num visible
        document.querySelector(`#color${num}`).parentElement.style.display = 'flex'
    }
}

function remove_picker(num) {
    if (num >= 1) {
        numcolor.innerText = num
        document.querySelector(`#color${num+1}`).parentElement.style.display = 'none'
    }
}

function save_variables() {
    const colors = get_colors()
    
    let bgcolors = []
    // filter out everything that doesnt start with color
    // grab bg color from all .pick elements that has an id that contains 'color'
    document.querySelectorAll('.pick').forEach(el => {
        if (el.id.includes('color')) {
            if (el.style.backgroundColor) {
                const rgb = el.style.backgroundColor.slice(4, -1).split(',').map(x => parseInt(x))
                bgcolors.push(rgb_to_hex(rgb[0], rgb[1], rgb[2]))
            }
        }
    })
    
    // grab accent color from colors
    globals.accent_color = colors.accent
    
    // clamp bgcolors to numcolor
    const numcolor = parseInt(document.querySelector('#numcolor').innerText)
    bgcolors = bgcolors.slice(0, numcolor)
    globals.bgcolors = bgcolors

    // save all the widgets to localstorage
    let widget_names = []
    let row_content = []
    
    document.querySelectorAll('.name').forEach(name => {
        // if (name.parentElement.parentElement.className == 'widget')
        //     globals.widget_names.push(name.innerText)

        switch (name.parentElement.parentElement.classList[0]) {
            case 'widget':
                widget_names.push(name.innerText)
                break
            case 'dropdown_parent':
                row_content.push(name.innerText)
                break
            case 'bgtype':
                globals.bgtype = name.innerText
                break

        }
    })

    globals.widget_names = widget_names
    globals.row_content = row_content

    // textfields
    document.querySelectorAll('input[type="text"]').forEach(textfield => {
        globals[textfield.id] = textfield.value
    })

    
    // loop thru globals obj, save values to localstorage
    for (const key in globals) {
        // if any values are undefined, ignore
        if (globals[key] != null)
            localStorage.setItem(key, globals[key])
    }
}


// eventlistener for #save
document.querySelector('#save').addEventListener('click', () => {
    save_variables()
})


// get_variables function grabs vars from localstorage, sets the to globals.
// then we add eventlisteners to all the dropdowns and colorpickers (TODO)
// then we load the widgets from the globals obj
get_variables()