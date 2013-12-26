window.log = -> console.log.apply console, Array::slice.call(arguments) if @console and @console.log

String::replaceAt = (index, character) -> @substr(0, index) + character + @substr(index + character.length)

stream = []

lineOn = hillsOn = randomOn = scanLinesOn = ballOn = drawLog = drawPre = false

OFF = '─'
ON = '█'
WIDTH = 100
HEIGHT = 100

lineOn = true
hillsOn = true
randomOn = true
scanLinesOn = true

ballOn = true

drawLog = true
drawPre = true

nextLine = -> stream.shift()

hills = ->
    return unless hillsOn
    width = Math.floor(WIDTH * 1.25)
    for split in [1..width]
        output = (new Array(split).join ON) + (new Array(width - split).join OFF)
        output = line output
        stream.push output

random = ->
    return unless randomOn

    output = ''
    for i in [1..WIDTH]
        output += if (Math.random() < .5) then ON else OFF

    output = line output
    stream.push output

drawScanLinePositionX = 0

drawScanLines = (output) ->
    return unless scanLinesOn

    lines = output.split('\n')

    for line, i in lines
        lines[i] = lines[i].replaceAt drawScanLinePositionX, OFF

    if Math.random() > .5
        if drawScanLinePositionX < '<div>'.length
            lines[i] += (new Array(Math.floor(Math.random() * HEIGHT))).join(ON)
        drawScanLinePositionX  += if Math.random() > .5 then 1 else -1

    drawScanLinePositionX = Math.min(WIDTH, Math.max(0, drawScanLinePositionX))

    output = lines.join('\n')

    return output

lineDirection = 1
linePosition = undefined
lineReplace = ON
line = (output) ->
    return output unless lineOn
    outputArray = output.split('')
    lineReplace = (if outputArray[linePosition] is ON then OFF else ON) if Math.random() < .05
    halfLineWidth = Math.floor(WIDTH / 20)
    for position in [(linePosition - halfLineWidth)..(linePosition + halfLineWidth)]
        outputArray[position] = lineReplace
    output = outputArray.join('')
    lineDirection *= if Math.random() > .1 then 1 else -1
    linePosition = linePosition + lineDirection
    linePosition = Math.min(Math.max(halfLineWidth + 1, linePosition), WIDTH - halfLineWidth - 1)
    return output

ballDirectionX = 1
ballDirectionY = 1
ballPositionX = undefined
ballPositionY = undefined
ballReplace = ON
drawBall = (output) ->
    return output unless ballOn

    lines = output.split('\n')

    ballHeight = 6
    ballWidth = 16
    halfBallHeight = 3
    halfBallWidth = 8

    for line, i in lines
        if ballPositionY - halfBallHeight < i < ballPositionY + halfBallHeight
            for position in [(ballPositionX - halfBallWidth)..(ballPositionX + halfBallWidth)]
                lines[i] = lines[i].replaceAt position, (if lines[i][position] is OFF then ON else '─')

    output = lines.join('\n')

    ballDirectionX *= if Math.random() > .1 then 1 else -1
    ballPositionX = ballPositionX + ballDirectionX
    ballPositionX = Math.min(Math.max(halfBallWidth + 2, ballPositionX), WIDTH - halfBallWidth - 2)
    ballDirectionY *= if Math.random() > .1 then 1 else -1
    ballPositionY = ballPositionY + ballDirectionY
    ballPositionY = Math.floor(Math.min(Math.max(halfBallHeight + 2, ballPositionY), (HEIGHT / WIDTH) - halfBallHeight - 2))

    return output

setInterval hills,  70 * HEIGHT
setInterval random, 70

adjustWidth = ->
    WIDTH = Math.floor(window.outerWidth / 7)
    HEIGHT = Math.floor(WIDTH * (window.outerHeight / 22))
    linePosition = Math.floor(WIDTH / 2)
    ballPositionX = Math.floor(WIDTH / 2)
    ballPositionY = Math.floor(HEIGHT / 2)

emptyPre = ->
    pre.innerHTML = ''
    stream = []

setTimeout emptyPre, 0
setTimeout adjustWidth, 0

window.addEventListener 'resize', adjustWidth
window.addEventListener 'resize', emptyPre
window.addEventListener 'fullscreeneventchange', emptyPre
window.addEventListener 'fullscreeneventchange', -> log 'fullscreeneventchange'
setTimeout (-> document.body.addEventListener('fullscreeneventchange', -> log 'fullscreeneventchange')), 0

lastHTML = ''

colorOpacity = 0.01

frames = 0
inverted = 'inverted'

draw = ->
    frames += 1
    next = nextLine()
    return unless next
    if Math.random() < .005
        pre.setAttribute 'data-bg', Math.floor(Math.random() * 3)
    nextHTML = "<div>#{ next }</div>\n" + lastHTML if drawPre
    nextHTML = nextHTML.substr 0, HEIGHT * 2
    lastHTML = nextHTML
    nextHTML = drawBall lastHTML
    nextHTML = drawScanLines nextHTML
    pre.innerHTML = nextHTML
    #if Math.random() < .97
    if Math.random() > .97
        colorOpacity += if colorOpacity = .001 then .01 else .001
    pre.innerHTML += '<div id="color" style="opacity: ' + colorOpacity + '"></div>'
    if Math.random() > .3
        pre.innerHTML = pre.innerHTML.replace(new RegExp('opacity: \d?\.\d?', 'g'), '')
    if frames * (1400 / 34) > 1000 * 60 * 3.3
        try
            document.head.removeChild document.getElementById('deathRed')
    # if frames * (1400 / 34) > 1000 * 60 * 0
    #     if frames % Math.floor(Math.random() * 30) is 0
    #         document.body.className = inverted
    #         inverted = if inverted is '' then 'inverted' else ''

window.drawInterval = setInterval draw, 34

drainTimes = 0
drain = ->
    stream = []
    return drainTimes = 0 if drainTimes > 80
    drainTimes += 1
    setTimeout ->
        emptyPre()
        adjustWidth()
        drain()
    , 20

document.addEventListener 'dblclick', ->
    if document.webkitIsFullScreen
        document.webkitCancelFullScreen()
    else
        document.body.webkitRequestFullScreen()
    drain()