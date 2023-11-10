
function draw_graph(d, tdate = 0) {
    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    // fix for blurry image
    const pixel_ratio = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * pixel_ratio
    canvas.height = canvas.clientHeight * pixel_ratio
    ctx.scale(pixel_ratio, pixel_ratio)

    // clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // get min temp and max temp in d
    const min_temp = Math.floor(Math.min(...d.list.map(item => item.main.temp)))
    const max_temp = Math.ceil(Math.max(...d.list.map(item => item.main.temp)))
    console.log(min_temp, max_temp)

    let arr = []

    if (tdate !== 0) {
        arr = d.list.filter(item => {
            // extract the date from the "dt_txt" property
            const date = item.dt_txt.split(' ')[0]
            // check if the date matches the target date
            return date === tdate
        })
        // map arr into a single array
        arr = arr.map(item => item.main.temp)
    } else {
        // map d into a single array
        arr = d.list.map(item => item.main.temp)
    }

    // if the array isnt full, fill it with -999
    if (arr.length < 8) {
        for (let i = 0; i < (8 - arr.length); i++) {
            // push a zero to the beginning of the array
            arr.unshift(-999)
        }
    }

    // set standard variables, begin path
    ctx.beginPath()
    ctx.lineWidth = 2
    // grab accentcolor
    let accent = JSON.parse(localStorage.getItem('colors')).accent_color
    if (!accent)
        accent= 'white'
    ctx.strokeStyle = accent

    // calculate the x and y coordinates for the graph points
    for (let i = 0; i < arr.length; i++) {
        const x = (i / (arr.length - 1)) * canvas.width
        const y = canvas.height - (arr[i] - min_temp) * (canvas.height / (max_temp - min_temp))

        if (i === 0) {
            ctx.moveTo(x, y)
        } else {
            ctx.lineTo(x, y)
        }
    }

    // draw the line
    ctx.stroke()

    // close path
    ctx.closePath()

    // draw a grid and temperature labels
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.font = '12px sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5'

    // draw the vertical lines and text
    for (let i = 1; i < arr.length; i++) {
        const x = (i / (arr.length - 1)) * canvas.width
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.fillText(i * 3 + ':00', x, canvas.height - 5)
    }


    // add additional temperature labels on the side
    const interval = (max_temp - min_temp) / 10 // adjust this interval as needed
    for (let i = 0; i <= 10; i++) {
        const temp_val = Math.round((min_temp + i * interval))
        const y = canvas.height - (temp_val - min_temp) * (canvas.height / (max_temp - min_temp))
        // draw line
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        // draw text
        ctx.fillText(temp_val + '°', 10, y + 5)
    }

    // draw the grid
    ctx.stroke()

    // close path
    ctx.closePath()
}


let should_update_graph = true
window.addEventListener('data_changed', function () {
    if (should_update_graph) {
        should_update_graph = false
        draw_graph(JSON.parse(localStorage.getItem('weather_data')))
    }
})

// eventlistener for list with id dates
window.addEventListener('html_loaded', () => 
    document.querySelector('#dates').addEventListener('click', (e) => {
        // get the iteration of child that user clicks
        const index = Array.from(e.target.parentElement.children).indexOf(e.target)

        // if index == 5 --> if 'all' text is clicked, we dont have a specific date
        if (index == 5) {
            draw_graph(JSON.parse(localStorage.getItem('weather_data')))
            return
        }

        // make a new date object, add index to that and get a new date
        const date = new Date()
        date.setDate(date.getDate() + index)
        // convert date to a readable string that has the same formatting as the json file
        const str_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        draw_graph(JSON.parse(localStorage.getItem('weather_data')), str_date)
    })
)

// on document load we need to modify the #dates ul to dislay the corrects days
window.addEventListener('html_loaded', () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dates_element = document.querySelector('#dates')

    // loop through all the days in the array and create a li for each day
    for (let i = 0; i < days.length-2; i++) {
        const li_element = document.createElement('li')
        const day_index = new Date().getDay() + i-1
        const corrected_day_index = day_index % 7; // ensure the index wraps around if it goes beyond 6 (sunday)
        li_element.innerText = days[corrected_day_index]
        dates_element.appendChild(li_element)
    }

    // create a li for 'all'
    const li_element = document.createElement('li')
    li_element.innerText = 'all';  
    dates_element.appendChild(li_element)
})
