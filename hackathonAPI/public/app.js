const AddPoint = document.querySelector('.AddPoint')
AddPoint.addEventListener('submit', (e) => {
  e.preventDefault()
  const lat = AddPoint.querySelector('.lat').value
  const lng = AddPoint.querySelector('.lng').value
  const isIllegalPoint = false
  get('/getAllPoints', {})
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
function get (path, data) {
  return window.fetch(path, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
}