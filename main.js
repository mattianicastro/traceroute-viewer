import "./style.css";
import { isV4Format, isV6Format, isPrivate } from "ip";
import autoAnimate from "@formkit/auto-animate";

const ipInputElement = document.getElementById("ipInput")
const ipInputBtn = document.getElementById("ipInputBtn")
const ipListElement = document.getElementById("ipList")
const renderMapBtn = document.getElementById("renderMapBtn")
const appElement = document.getElementById("app")
const mapElement = document.getElementById("map")

autoAnimate(ipListElement)
const ipList = []
const startIcon = L.icon({
  iconUrl: 'flag-end.svg', iconSize: [25, 41],
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


const showError = (message) => {
  alert(message)
}

const addIp = (ip) => {
  ipList.push(ip)
  const liElement = document.createElement("li")
  liElement.innerText = ip
  ipListElement.appendChild(liElement)
}

ipInputBtn.addEventListener("click", (e) => {
  const ipValue = ipInputElement.value
  if (!ipValue) {
    showError("Please enter an IP address")
    return
  }
  if (!isV4Format(ipValue) && !isV6Format(ipValue)) {
    showError("Invalid IP address")
    return
  }
  if (isPrivate(ipValue)) {
    showError("Private IP address")
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

renderMapBtn.addEventListener("click", (e) => {
  appElement.style.display = "none"
  mapElement.style.display = "unset"
  const coords = []
  var map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  var polyline = L.polyline(coords, { color: 'red' }).addTo(map);
  ipList.forEach((ip, i) => {
    const icon = i === 0 ? startIcon : i === ipList.length - 1 ? endIcon : new L.Icon.Default()
    fetchIpLocation(ip).then((data) => {
      var marker = L.marker([data.latitude, data.longitude], { icon: icon }).addTo(map)
      marker.bindPopup(`<b>${data.ip}</b><br>${data.city}, ${data.region} (${data.country})<br>${data.asn} | ${data.org}`)
      coords.push([data.latitude, data.longitude])
      polyline.setLatLngs(coords)
      polyline.redraw()
    })
  })
  console.log(coords)

})