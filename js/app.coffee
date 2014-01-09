tv = {}

tv.currentVisualization = 0
tv.visualizations = [
    'pareidolia',
    'fluid',
    'reactive',
    'generator'
]

tv.init = ->
    tv.setupDOM()
    tv.setupVisualizationLoadEvents()
    tv.setupControls()

tv.setupDOM = ->
    tv.$display = $ 'iframe'
    tv.$cover = $ '.cover'
    tv.$party = $ '.party'

tv.setupVisualizationLoadEvents = ->
    tv.$display.load ->
        tv.$cover.removeClass('covered choked')

tv.setupControls = ->
    tv.$cover.focus()
    tv.$cover.blur -> tv.$cover.focus()
    tv.$cover.dblclick (e) -> tv.advance()

    $(window).keydown (e) ->
        switch e.keyCode
            when 13 # Enter
                tv.renderCurrentVisualization()
            when 39 # Right
                tv.advance()
            when 37 # Left
                tv.advance -1
            when 38 # Up
                tv.advance -1 # TODO change
            when 40 # Down
                tv.advance() # TODO change
            when 80 # P
                if tv.$party.hasClass('hidden') then tv.$party.removeClass('hidden') else tv.$party.addClass('hidden')
            when 222 # Single quote (to the right of Enter)
                tv.advance Math.floor(tv.visualizations.length * Math.random())
            when 70 # F
                if tv.$cover.hasClass('covered') then tv.$cover.removeClass('covered choked') else tv.$cover.addClass('covered')
            when 66 # B
                if tv.$cover.hasClass('choked') then tv.$cover.removeClass('covered choked') else tv.$cover.addClass('choked')
            when 72 # H
                if tv.$display.attr('data-filter-hue-rotate')
                    tv.$display.removeAttr('data-filter-hue-rotate')
                else
                    tv.$display.attr('data-filter-hue-rotate', true)
            when 73 # I
                if tv.$display.attr('data-filter-invert')
                    tv.$display.removeAttr('data-filter-invert')
                else
                    tv.$display.attr('data-filter-invert', true)
            else
                console.log e.keyCode

tv.advance = (amount = 1) ->
    tv.$cover.addClass('covered')
    tv.currentVisualization = (tv.currentVisualization + tv.visualizations.length + amount) % tv.visualizations.length
    setTimeout ->
        tv.renderCurrentVisualization()
    , 750

tv.renderCurrentVisualization = ->
    tv.$display.attr('src', '/tv/visualizations/' + tv.visualizations[tv.currentVisualization])

# TODO
# tv.audioAnalyser

tv.init()

window.tv = tv