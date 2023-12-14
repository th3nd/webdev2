
function display_info(d) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const region_names = new Intl.DisplayNames(['en'], {type: 'region'})

    const display_elements = {
        city: document.querySelector('.city'),
        date: document.querySelector('.date'),
        temp: document.querySelector('.num'),
        unit: document.querySelector('.deg'),
        weather: document.querySelector('.weather')
    }
      
    const date = new Date()
    const str_date = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ' ' + days[date.getDay() - 1]
    
    // helper function
    function create_append(parent, tag, html, remove_last) {
        const element = document.createElement(tag)
        if (html) element.innerHTML = html
        if (remove_last == 0){}
        else {parent.innerHTML = ''}

        parent.appendChild(element)
    }
    
    create_append(display_elements.city, 'h2', `${d.city.name}<span class="unfocus">| ${region_names.of(d.city.country)}</span>`)
    create_append(display_elements.date, 'h2', `${str_date}<span class="unfocus">| ${date.toLocaleDateString()}</span>`)
    create_append(display_elements.temp, 'h1', `${Math.round(d.list[0].main.temp)}`)
    create_append(display_elements.unit, 'h1', '°C')
    create_append(display_elements.weather, 'p', `${d.list[0].weather[0].description}`)
    create_append(display_elements.weather, 'p', `HI: ${d.list[0].main.temp_max}°C`, remove_last=0)
    create_append(display_elements.weather, 'p', `LO: ${d.list[0].main.temp_min}°C`, remove_last=0)
    create_append(display_elements.weather, 'p', `Humidity: ${d.list[0].main.humidity}%`, remove_last=0)


    // call function every 3 secs
    setTimeout(() => display_info(d), 3000)
}


// this gets called onload after data is gotten and every 30mins when we upd data
window.addEventListener('html_loaded', () => display_info(JSON.parse(localStorage.getItem('weather_data'))))

// handle settings
window.addEventListener('html_loaded', () => {
    // check bg option
    let option = ''
    try {
        option = localStorage.getItem('bgtype')
    } catch (e) {}

    if (option == null) {
        option = 'color'
    }

    switch (option) {
        case 'color':
            // get colors
            // TODO: if no colors, do default ones.
            let colors = JSON.parse(localStorage.getItem('colors'))
            // map out all items that doesnt begin with color, and get the values into an array
            let bg_colors = []
            try {
                bg_colors = Object.values(Object.fromEntries(
                    Object.entries(colors).filter(([key, value]) => key.startsWith('color'))
                ))
            } catch (e) {
                bg_colors = ['#343d80', '#1e2d6e']
                console.log('bg_color is null.', e)
            }

            // set bg color
            document.documentElement.style.background = bg_colors[0]
            // set gradient
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
            const url = localStorage.getItem('bg_url')
            document.body.style.backgroundImage = `url('${url}')`
            // set the image to cover
            document.body.style.backgroundSize = 'cover'
            break
        case 'dynamic':
            console.log('load dynamic bg here')
            break
        case 'particles':
            const particle_color = JSON.parse(localStorage.getItem('colors')).particle_color
            console.log(particle_color)

            console.log('be sure to grab the particle code from home pc.')
            break
        default:
            console.error('sum ting wong with bg loading.')
    }


    // fix darkmode
    const darkmode = localStorage.getItem('darkmode')
    if (darkmode == 'true') {
        document.documentElement.style.setProperty('--text-color', '#cccccc')
        document.documentElement.style.setProperty('--background-overlay', '#00000046')
        document.documentElement.style.setProperty('--background-blur', '#ffffff14')
        document.documentElement.style.setProperty('--background-hover', '#ffffff3e')
    } else {
        document.documentElement.style.setProperty('--text-color', '#1b1b1b');
        // document.documentElement.style.setProperty('--background-overlay', '#e6e6e646'); // Light gray overlay
        // document.documentElement.style.setProperty('--background-blur', '#e6e6e614');    // Light gray blur
        // document.documentElement.style.setProperty('--background-hover', '#e6e6e63e');  // Light gray hover
    
        // remove .gearicon 's filter
        document.querySelector('.gearicon').style.filter = 'none'
    }
})