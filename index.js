const STREAM_API_URL = 'https://api.twitch.tv/kraken/search/streams?q='

const API_RESULT_LIMIT = 10
//The default limit provided by the API

const headers = new Headers()

headers.append('Content-Type', 'application/json')
headers.append('Client-ID','d64s5zfwmqqaq7zbdcdk7xhet2nrsk')

const apiOptions = { 
    headers: headers,
    method: 'GET',
    mode: 'cors',
    cache: 'default' 
}

var nextLink = null
var prevLink = null

var uInput = null

function search (url) {
    return fetch(url, apiOptions).then(resp=>resp.json())
 }

 // TODO: Show spinner
function onSubmitSearch (url = STREAM_API_URL + uInput) {

    if(uInput === undefined) return;

    search(url).then(({_total, _links, streams}) => {
        if(_total === 0) {
            clearOldResults()
            showEmptyResult(true)
            setStreamItemListVisibility(false)
        } else {
            showEmptyResult(false)
            clearOldResults()
            setResultsCount(_total)
            setLinks(_links)
            setCurrentPage(_total, _links)
            renderTemplates(streams)
            setStreamItemListVisibility(true)
        }
    }).catch(e => console.error(e))
}

function page (dir) {

    const dirLink = dir === 'next' ? nextLink : prevLink

    if(dirLink !== null && dirLink !== undefined) {
        onSubmitSearch(dirLink)
    }
}

function renderTemplates (streams) {
    var streamList = document.querySelector('#stream-list')
    streams.forEach(stream => {
        streamList.appendChild(
            getStreamItem(stream, document.importNode(getTemplate("#stream-item-template"), true))
        )
    })
}

function getStreamItem (stream, template) {

    var instance = template
   
    instance.getElementById('stream-title-text').innerText = stream.channel.display_name

    instance.getElementById('game-name').innerText = stream.game

    instance.getElementById('viewer-count').innerText = stream.viewers.toLocaleString()

    instance.getElementById('description-text').innerText = stream.channel.status

    instance.getElementById('stream-thumbnail-sm').src = stream.preview.small

    instance.getElementById('stream-thumbnail-md').src = stream.preview.medium

    instance.getElementById('stream-thumbnail-lg').src = stream.preview.large

    instance.querySelector('.channel-link').href = stream.channel.url

    instance.querySelector('.user-link').href = stream.channel.url + '/videos/all'

    return instance
}

function clearOldResults () {
    const list = document.getElementById('stream-list')
    const cNode = list.cloneNode(false)
    list.parentNode.replaceChild(cNode ,list)
}

function setResultsCount (amount) {
    var streamNode = document.getElementById("results-count")
    streamNode.innerText = amount.toLocaleString()
}

//TODO: split into two smaller functions, one for page indicator, one for cursor visibility
function setCurrentPage (totalResultsCount, { self }) {
   
    const API_OFFSET_REGEX = /offset=([0-9]*)/

    const result = self.match(API_OFFSET_REGEX)

    const currentPage = result === null ? 0 : result[1] / API_RESULT_LIMIT

    const totalPages = Math.ceil(totalResultsCount / API_RESULT_LIMIT)

    const indicator = document.getElementById('results-page-indicator')
    indicator.textContent = `${currentPage + 1} / ${totalPages.toLocaleString()}`

    var rightCursor = document.getElementById('right-cursor');
    var leftCursor = document.getElementById('left-cursor');

    if (currentPage + 1 === totalPages) {
        rightCursor.style.display = "none"
    } else {
        rightCursor.style.display = "inline"
    }

    if (currentPage === 0) {
        leftCursor.style.display = "none"
    } else {
        leftCursor.style.display = "inline"
    }
}

function setLinks ({ prev, next }) {
    prevLink = prev
    nextLink = next
}

function showEmptyResult (doShow) {
    setElementVisibility(doShow, ".no-results")
}

function setStreamItemListVisibility (doShow) {
    setElementVisibility(doShow, "#stream")
}

function onUserTextUpdate ({target} ) {
    //TODO: Validate and sanity-check this
    uInput = target.value
}

// Helper methods

function setElementVisibility (doShow, elementSelector) {
    var element = document.querySelector(elementSelector)
    element.style.display = doShow ? 'block' : 'none'
}

function getTemplate(templateSelector){
   return document.querySelector(templateSelector).content
}