
// eventlistener for when div with class .pick is pressed
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = 235
canvas.height = 200

const m = {
    down: false,
    x: 0,
    y: 0
}


let max_color = [255, 255, 255]

let colors = {}

export function get_colors() {
    // turn rgb to hex
    for (const key in colors) {
        if (colors.hasOwnProperty(key)) {
            const color = colors[key];
            if (color.startsWith('rgb')) {
                const rgb = color.slice(4, -1).split(',').map(x => parseInt(x))
                colors[key] = rgb_to_hex(rgb[0], rgb[1], rgb[2])
            }
        }
    }

    return colors
}

// cred: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export function rgb_to_hex(r, g, b) {
    function component_to_hex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + component_to_hex(r) + component_to_hex(g) + component_to_hex(b);
}


let id

// querySelectorAll .pick
document.querySelectorAll('.pick').forEach(el => {
    el.addEventListener('click', () => {
        open_colorpicker(el)
    })
})

function open_colorpicker(el=0) {
    if (el == 0) return
    id = el.id
    el.style.backgroundColor = colors[id]

    colors[id] = el.style.backgroundColor
    canvas.style.display = 'block'
    canvas.style.left = Math.min(m.x, screen.width - canvas.width) + 'px'
    canvas.style.top = Math.min(m.y, screen.height - canvas.height) + 'px'
}


function update_canvas() {
    // optimize by drawing gradient instead
    for (let i = 0; i < 200; i++) {
        const hue = i / 200
        const color = `hsl(${hue * 360}, 100%, 50%)`
        ctx.fillStyle = color
        ctx.fillRect(210, i, 25, 1)
    }
    
    for (let i = 0; i < 200; i++) {
        for (let j = 0; j < 200; j++) {
            let rgb = [0, 0, 0]
            for (let k = 0; k < 3; k++) {
                rgb[k] = Math.round(255 * (1 - (i/200)) + max_color[k] * (i/200)) - j/200*255
            }
            ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
            ctx.fillRect(i, j, 1, 1)
        }
    }
    // run function all the time
    requestAnimationFrame(update_canvas)
}

document.addEventListener('mousedown', () => m.down = true)
document.addEventListener('mouseup', () => m.down = false)
document.addEventListener('mousemove', e => {m.x = e.clientX;m.y = e.clientY})
canvas.addEventListener('mousemove', e => {
    if (!m.down)
        return
    
    const top = canvas.offsetTop
    const left = canvas.offsetLeft

    // if were in the sidebar
    if (m.x > left+210 && m.x < left + canvas.width && m.y > top && m.y < top + canvas.height) {
        // get color from hue
        const color = ctx.getImageData(210, (m.y - top), 1, 1, {colorSpace: 'srgb'}).data
        max_color = color
    }

    // if were in the main thing (this could be made better by grabbing mouse pos inside if statement and then applying color outside.)
    if (m.x > left && m.x < left + 200 && m.y > top && m.y < top + 200) {
        // get color from gradient
        const img_d = ctx.getImageData((m.x - left), (m.y - top), 1, 1, {colorSpace: 'srgb'}).data
        // format Uint8ClampedArray to rgb string
        colors[id] = `rgb(${img_d[0]},${img_d[1]},${img_d[2]})`
        document.getElementById(id).style.backgroundColor = colors[id]
    }
})

// if we click outside of colorpicker when colorpicker is open, close it
document.addEventListener('click', e => {
    if (e.target.id != 'colorpicker' && e.target.className != 'pick') {
        canvas.style.display = 'none'
    }
})


update_canvas()


// cred: https://www.30secondsofcode.org/js/s/hsb-to-rgb/
function hsb_to_rgb(h) {
    const k = (n) => (n + h / 60) % 6
    const f = (n) => (1 - Math.max(0, Math.min(k(n), 4 - k(n), 1)))
    return [Math.round(255 * f(5)), Math.round(255 * f(3)), Math.round(255 * f(1))]
}