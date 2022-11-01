import "./style.css";
import { isV4Format, isV6Format, isPrivate } from "ip";
import autoAnimate from "@formkit/auto-animate";

const ipInputElement = document.getElementById("ipInput")
const ipInputBtn = document.getElementById("ipInputBtn")
const ipListElement = document.getElementById("ipList")
const renderMapBtn = document.getElementById("renderMapBtn")
const appElement = document.getElementById("app")
const mapElement = document.getElementById("map")
const toastElement = document.getElementById("toast")
const selectElement = document.getElementById("selectMode")
const formElement = document.getElementById("form")
const loadFormElement = document.getElementById("loadForm")
const textAreaElement = document.getElementById("textArea")

selectElement.selectedIndex = 1
textAreaElement.value = ""
autoAnimate(ipListElement)
var ipList = []
const startIcon = L.icon({
    iconUrl: 'flag-start.svg', iconSize: [25, 41],
    iconAnchor: [0, 35],
    popupAnchor: [10, -34],
    tooltipAnchor: [16, -28]
});

const endIcon = L.icon({
    iconUrl: 'flag-end.svg', iconSize: [25, 41],
    iconAnchor: [0, 35],
    popupAnchor: [10, -34],
    tooltipAnchor: [16, -28]
});


const showToast = (message, kind) => {
    const error = document.createElement("div")
    error.className = `alert alert-${kind}`
    error.innerText = message
    toastElement.appendChild(error)
    setTimeout(() => {
        error.remove()
    }, 3000)
}

const clearIps = () => {
    ipList = []
    ipListElement.innerHTML = ""
}

const addIp = (ip) => {
    ipList.push(ip)
    const liElement = document.createElement("li")
    liElement.className="input-group"
    const btnElement = document.createElement("button")
    btnElement.className="btn"
    btnElement.innerText="🗑️"
    btnElement.addEventListener("click", () => {
        liElement.remove()
        ipList.splice(ipList.indexOf(ip), 1)
    })
    const spanElement = document.createElement("span")
    spanElement.innerText=ip
    liElement.appendChild(btnElement)
    liElement.appendChild(spanElement)
    ipListElement.appendChild(liElement)
}

ipInputBtn.addEventListener("click", (e) => {
    const ipValue = ipInputElement.value
    if (!ipValue) {
        showToast("Please enter an IP address", "warning")
        return
    }
    if (!isV4Format(ipValue) && !isV6Format(ipValue)) {
        showToast("Invalid IP address", "warning")
        return
    }
    if (isPrivate(ipValue)) {
        showToast("Private IP address", "warning")
        return
    }
    ipInputElement.value = ""
    addIp(ipValue)
})

document.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        ipInputBtn.click()
    }
})

const fetchIpLocation = async (ip) => {
    const res = await fetch(`https://ipapi.co/${ip}/json/`)
    const data = await res.json()
    return data
}

const fetchAllIpLocations = async (ipList) => {
    const locations = await Promise.allSettled(ipList.map(fetchIpLocation))
    return locations.filter((location) => location.status === "fulfilled").map((location) => location.value)
}

selectElement.addEventListener("change", (e) => {
    e.preventDefault()
    clearIps()
    loadFormElement.classList.toggle("hidden")
    formElement.classList.toggle("hidden")
})

const validatePaste = (paste) => {
    console.log(paste)
    if(!paste.hops){
        return false
    }
    if(!paste.hops.every((hop) => hop.hop && hop.probes && hop.probes.every((probe) => probe.ip && probe.rtt))){
        return false
    }
    return true
}

textAreaElement.addEventListener("input", (e) => {
    try{
        const parsedTrace = JSON.parse(e.target.value)
        if(!validatePaste(parsedTrace)){
            showToast("Pasted output was invalid", "error")
            return
        }
        const ipList = parsedTrace.hops.map((hop)=>{
            if(hop.probes.length!==0){
                return hop.probes[0].ip
            }
        }).filter((ip)=>ip && !isPrivate(ip))
        clearIps()
        ipList.forEach((ip)=>{
            addIp(ip)
        })
    } catch (e) {
        console.log(e)
        showToast("Invalid JSON", "error")
        return
    }

})

renderMapBtn.addEventListener("click", (e) => {
    if (ipList.length === 0) {
        showToast("Please enter at least one IP address", "warning")
        return
    }
    showToast("Fetching IP locations...", "info")
    fetchAllIpLocations(ipList).then(locations => {
        console.log(locations)
        appElement.style.display = "none"
        mapElement.style.display = "unset"
        const coords = []
        var map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        var polyline = L.polyline(coords, { color: 'red' }).addTo(map);
        locations.forEach((data, i)=>{
            if(data.error){
                console.log("skipped")
                return
            }
            const icon = i === 0 ? startIcon : i === ipList.length - 1 ? endIcon : new L.Icon.Default()
            var marker = L.marker([data.latitude, data.longitude], { icon: icon }).addTo(map)
            marker.bindPopup(`<b>${data.ip}</b><br>${data.city}, ${data.region} (${data.country})<br>${data.asn} | ${data.org}`)
            coords.push([data.latitude, data.longitude])
            polyline.setLatLngs(coords)
            polyline.redraw() 
        })


    })
})