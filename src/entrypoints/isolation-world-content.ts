function createIframeUi() {
  const wrapper = document.createElement('div')
  wrapper.style.height = '0'
  wrapper.style.width = '0'
  const ifr = document.createElement('iframe')
  wrapper.appendChild(ifr)
  ifr.src = browser.runtime.getURL('/iframe-content.html')
  ifr.style.width = '0'
  ifr.style.height = '0'
  ifr.style.zIndex = '-9999'
  ifr.style.border = 'none'
  ifr.id = 'zenfs-viewer-iframe'
  document.body.appendChild(wrapper)
  return ifr
}

export default defineUnlistedScript(async () => {
  if (document.getElementById('zenfs-viewer-iframe')) {
    console.log('already mounted')
    return
  }
  console.log('mounting')
  await injectScript('/main-world-content.js')
  createIframeUi()
})
