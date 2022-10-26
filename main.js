import "./style.css";
import { isV4Format, isV6Format, isPrivate } from "ip";


const ipInputElement = document.getElementById("ipInput")
const ipInputBtn = document.getElementById("ipInputBtn")
const ipListElement = document.getElementById("ipList")
const renderMapBtn = document.getElementById("renderMapBtn")
const appElement = document.getElementById("app")
const ipList = []


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
   console.log(isV6Format(ipValue))
   console.log(isV4Format(ipValue))
    if(!ipValue){
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
    console.log("Valid IP address")
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
  appElement.style.display="none"
  const coords = []
  var map = L.map('map').setView([0,0], 2);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 5,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  for(const ip of ipList){
    fetchIpLocation(ip).then((data) => {
      var marker = L.marker([data.latitude, data.longitude]).addTo(map)
      marker.bindPopup(`<b>${data.ip}</b><br>${data.city}, ${data.region} (${data.country})<br>${data.asn} | ${data.org}`).openPopup()
    })
  }
})