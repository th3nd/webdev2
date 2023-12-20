let pos = []
function on_load() {
    // add loading circle on page
    // TODO

    // bad approach: we dont do this. we always want new weather data.
        // check if we have data in localstorage
        // if we do, load it and remove circle


    // get position from browser (we dont need to save it)
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async p => {
            try {
                pos = [p.coords.latitude, p.coords.longitude]
                await get_weather()
            } catch (e) {
                // if we cant, display msg on screen
                const popup =
                    `<div class="popup">
                        <div>
                            <h1>please enable locations.</h1>
                            <h3>its only used locally for gathering weather and news related to you.</h3>
                        </div>
                    </div>`

                // convert string to html element
                const div = document.createElement('div')
                div.innerHTML = popup
                // append to body
                document.body.appendChild(div)
                console.error(e)
            }
        })
    } else {
        console.log("geolocation not available")
    }

    // with position, fetch weather data from server

    // check if we have anywhwere to display the data. we use querySelectorAll to get the element and loop thru all matches
    // (support for multiple widgets)
}

async function get_weather() {
    // define api key for openweathermap
    const API_KEY = '4d8fb5b93d4af21d66a2948710284366'
    // define url with our saved pos and API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${pos[0]}&lon=${pos[1]}&appid=${API_KEY}&units=metric`
    try {
        // fetch url, get response
        const resp = await fetch(url)
        if (resp.ok) {
            const data = await resp.json()
            update_weather(data)
            await get_news(data.city.country)
        } else {
            console.error('Response failed', resp)
        }
    } catch (e) {
        console.error(e)
    }
}

function update_weather(data) {

    // save weather data to locastorage so other files can acces it (graph)
    localStorage.setItem('weather_data', JSON.stringify(data))
    // call custom event
    document.dispatchEvent(new CustomEvent('weather_data_loaded'))

    const region_names = new Intl.DisplayNames(['en'], {type: 'region'})

    // TODO
    // remove loading circle

    const city = document.querySelectorAll('.city')
    const country = document.querySelectorAll('.country')
    const temp = document.querySelectorAll('.temp')
    const weather = document.querySelectorAll('.weather')

    // loop thru all elements and update them
    city.forEach(c => c.innerHTML = data.city.name)
    country.forEach(c => c.innerHTML = region_names.of(data.city.country))
    temp.forEach(t => t.innerHTML = data.list[0].main.temp)
    weather.forEach(w => w.innerHTML = data.list[0].weather[0].description)

}

// get news
async function get_news(country) {
    const API_KEY = '838ac4f64c024d20af17254c464dcc9d'
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${API_KEY}`

    try {
        const response = await fetch(url)

        // if response is valid, do the rest
        if (response.ok) {
            const data = await response.json()
            // get the news_container
            const c = document.querySelectorAll('.news_container')

            // loop thru all containers and add news
            c.forEach(c => {
                // create a div for every atrictle in the json file
                for (let i = 0; i < data.articles.length; i++) {
                    // create outer div 
                    let div = document.createElement('div')
                    div.className = 'art'


                    // create h3, set the h3 text and save the author in a variable
                    let title = document.createElement('h3')
                    let author = document.createElement('h3')
                    author.className = 'author'

                    let title_text = data.articles[i].title.split(' - ')
                    title.innerText = title_text[0]
                    author.innerText = title_text[1]

                    div.appendChild(title)
                    div.appendChild(author)

                    div.onclick = () => window.open(data.articles[i].url, '_blank')
                    c.appendChild(div)
                }
            })

        } else {
            console.error(response.status)
        }
    } catch (e) {
        console.error(e)
    }
}

on_load()