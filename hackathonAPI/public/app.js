const AddPoint = document.querySelector('.AddPoint')
AddPoint.addEventListener('submit', (e) => {
  e.preventDefault()
  const lat = AddPoint.querySelector('.lat').value
  const lng = AddPoint.querySelector('.lng').value
  const isIllegalPoint = false
  post('/addPoint', { lat, lng, isIllegalPoint })
})
function post (path, data) {
  return window.fetch(path, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}