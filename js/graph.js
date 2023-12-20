function upd_graph(temp_list, min, max) {
    const all_canvas = document.querySelectorAll('canvas')

    // loop thru all canvases
    all_canvas.forEach((canvas, i) => {
        const ctx = canvas.getContext('2d')
        
        // fix for blurry image
        const pixel_ratio = window.devicePixelRatio || 1
        canvas.width = canvas.clientWidth * pixel_ratio
        canvas.height = canvas.clientHeight * pixel_ratio
        // ctx.scale(pixel_ratio, pixel_ratio)
        const graph_margin = 2

        // clear screen
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const min_temp = min
        const max_temp = max


        let arr = temp_list


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
        // grab accentcolor. if null, set accent color
        const accent = localStorage.getItem('accent_color')
        if (!accent) {
            localStorage.setItem('accent_color', 'white')
            upd_graph(temp_list, min, max)
        }
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
            if (arr.length < 14) {
                ctx.fillText(i * 3 + ':00', x, canvas.height - 5)
            }
        }

        // grab range between min and max temp.both values can be negative
        const range = Math.abs(max_temp - min_temp)


        // add additional temperature labels on the side
        const interval = (max_temp - min_temp) / range // adjust this interval as needed
        for (let i = 0; i <= (range); i++) {
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
    })
}

// update the dates
// on document load we need to modify the .dates ul to dislay the corrects days
function upd_dates() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dates_element = document.querySelectorAll('.dates')

    // loop thru dates_element
    dates_element.forEach(d => {
        // clear d
        d.innerHTML = ''

        // loop through all the days in the array and create a li for each day
        for (let i = 0; i < days.length-2; i++) {
            const li_element = document.createElement('li')
            const day_index = new Date().getDay() + i-1
            const corrected_day_index = day_index % 7; // ensure the index wraps around if it goes beyond 6 (sunday)
            li_element.innerText = days[corrected_day_index]
            d.appendChild(li_element)
        }

        // create a li for 'all'
        const li_element = document.createElement('li')
        li_element.innerText = 'all';  
        d.appendChild(li_element)
    })

    // load graph once on page load
    

    dates_element.forEach(d => {
        d.addEventListener('click', e => {
            // get the iteration of child that user clicks
            const index = Array.from(e.target.parentElement.children).indexOf(e.target)

            let data = JSON.parse(localStorage.getItem('weather_data'))

            const all_temp = data.list.map(d => d.main.temp)
            const min = Math.min(...all_temp) - 1
            const max = Math.max(...all_temp) + 1

            // if index == 5 --> if 'all' text is clicked, we dont have a specific date
            if (index == 5) {
                upd_graph(all_temp, min, max)
                return
            }

            // make a new date object, add index to that and get a new date
            const date = new Date()
            date.setDate(date.getDate() + index)

            // map out all the temperatures for that day
            data = data.list.map(d => {
                const d_date = new Date(d.dt_txt)
                if (d_date.getDate() == date.getDate()) {
                    return d.main.temp
                }
            })

            // remove undefined values
            data = data.filter(d => d != undefined)

            // call upd_graph()
            upd_graph(data, min, max)
        })
    })
}

upd_dates()

// listen for custom event 'weather_data_loaded', load up graph
document.addEventListener('weather_data_loaded', () => {
    const data = JSON.parse(localStorage.getItem('weather_data'))
    const all_temp = data.list.map(d => d.main.temp)
    const min = Math.min(...all_temp) - 1
    const max = Math.max(...all_temp) + 1
    upd_graph(all_temp, min, max)
})