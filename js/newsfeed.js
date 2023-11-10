const API_KEY = '838ac4f64c024d20af17254c464dcc9d'
const country = 'se'
const url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${API_KEY}`

async function get_news() {
    try {
        const response = await fetch(url)

        // if response is valid, do the rest
        if (response.ok) {
            const data = await response.json()
            // get the news_container
            const c = document.querySelector('#news_container')

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

        } else {
            console.error(response.status)
        }
    } catch (e) {
        console.error(e)
    }
}


// eventlistener for onload
// document.addEventListener('DOMContentLoaded', () => get_news())
window.addEventListener('html_loaded', () => get_news())
