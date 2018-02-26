tv = {}

tv.currentVisualization = 0
tv.visualizations = [
    'pareidolia',
    'fluid',
    'reactive',
    'generator',
    'tumbler'
]

tv.setupDOM = ->
    tv.$permissionsBar = $ '.permissions-bar'
    tv.$permissionsMessage = $ '.permissions-message'
    tv.$display = $ 'iframe'
    tv.$cover = $ '.cover'
    tv.$party = $ '.party'
    tv.$controls = $ '.controls'

tv.handleWelcome = ->
    return unless location.search?.match(/\?welcome/)?.length
    tv.showControls()

tv.toggleControls = ->
    if tv.$controls.hasClass('show')
        tv.hideControls()
    else
        tv.showControls()

tv.showControls = ->
    tv.$controls.addClass('show')

tv.hideControls = ->
    tv.$controls.removeClass('show')

tv.setupVisualizationLoadEvents = ->
    tv.$display.load ->
        tv.$cover.removeClass('covered choked')

tv.setupControls = ->
    tv.$cover.focus()
    tv.$cover.blur -> tv.$cover.focus()
    tv.$cover.dblclick (e) -> tv.advance()

    $(window).keydown (e) ->
        switch e.keyCode
            when 67 # C (clear)
                tv.$party.removeClass('smooth').addClass('hidden')
                $('html').removeClass('party-zoom party-zoom-fast')
                tv.$cover.removeClass('covered')
                tv.$display.attr('data-filter-hue-rotate', true)
                tv.$display.removeAttr('data-filter-invert')
                tv.hideControls()
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
                if e.shiftKey
                    if tv.$party.hasClass('smooth') then tv.$party.removeClass('smooth') else tv.$party.addClass('smooth')
                else
                    if tv.$party.hasClass('hidden') then tv.$party.removeClass('hidden') else tv.$party.addClass('hidden')
            when 90 # z
                if e.shiftKey
                    if $('html').hasClass('party-zoom-fast') then $('html').removeClass('party-zoom-fast') else $('html').addClass('party-zoom-fast')
                else
                    if $('html').hasClass('party-zoom') then $('html').removeClass('party-zoom') else $('html').addClass('party-zoom')
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
            when 191 # /
                if e.shiftKey # ?
                    tv.toggleControls()

tv.advance = (amount = 1) ->
    tv.$cover.addClass('covered')
    tv.currentVisualization = (tv.currentVisualization + tv.visualizations.length + amount) % tv.visualizations.length
    setTimeout ->
        tv.renderCurrentVisualization()
    , 750

tv.renderCurrentVisualization = ->
    tv.$display.attr('src', 'https://party.github.io/tv/visualizations/' + tv.visualizations[tv.currentVisualization])

setTimeout -> $('body').addClass('loaded')

# Called within effects.js

tv.attemptingGetUserMedia = ->
    tv.setupDOM()
    tv.$permissionsBar.addClass('show')
    tv.$permissionsMessage.addClass('show')

tv.getUserMediaSucceeded = ->
    tv.$permissionsBar.removeClass('show')
    tv.$permissionsMessage.removeClass('show')
    setTimeout ->
        tv.$permissionsBar.remove()
        tv.$permissionsMessage.remove()
    , 800

    tv.setupVisualizationLoadEvents()
    tv.setupControls()

    setTimeout ->
        tv.handleWelcome()
        tv.renderCurrentVisualization()
    , 300

tv.getUserMediaFailed = ->
    tv.$permissionsBar.removeClass('show')
    tv.$permissionsMessage.html('Could not get access to your mic. <br/> Please refresh and try again.')

# TODO

# tv.audioAnalyser

window.tv = tv