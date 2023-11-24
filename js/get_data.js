const data_changed = new Event('data_changed')

function get_pos() {
    // try to access current pos 
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                // save position using localstorage
                localStorage.setItem('pos', [pos.coords.latitude, pos.coords.longitude])
                // remove .popup
                document.querySelector('.popup').remove()
            } catch (e) {
                console.error(e)
            }
        })
    } else {
        console.log("geolocation not available")
    }
}

async function get_data() {
    // define api key for openweathermap
    const API_KEY = '4d8fb5b93d4af21d66a2948710284366'
    // call get pos, wait for response
    await get_pos()
    // read pos from localstorage
    const pos = localStorage.getItem('pos').split(',')
    // define url with our saved pos and API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${pos[0]}&lon=${pos[1]}&appid=${API_KEY}&units=metric`
    try {
        // fetch url, get response
        const resp = await fetch(url)
        if (resp.ok) {
            const data = await resp.json()
            // save the response to localstorage
            localStorage.setItem('weather_data', JSON.stringify(data))
            // call our custom event to let other functions know its ok to run
            window.dispatchEvent(data_changed)
        } else {
            console.error('Response failed', resp)
        }
    } catch (e) {
        console.error(e)
    }

    // call function every 30 minutes
    setTimeout(get_data, 30000*60)
}

// eventlistener for onload
document.addEventListener('DOMContentLoaded', () => get_data())

// window.addEventListener('html_loaded', () => get_data())