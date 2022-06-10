const container = document.querySelector('.container article')

const ipsumText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Elit sed vulputate mi sit amet mauris. Pellentesque diam volutpat commodo sed. Nullam ac tortor vitae purus faucibus ornare suspendisse sed. Nisi quis eleifend quam adipiscing vitae proin sagittis nisl rhoncus. Vel quam elementum pulvinar etiam. Est velit egestas dui id ornare. Sed nisi lacus sed viverra tellus. Volutpat ac tincidunt vitae semper quis. Aliquam ultrices sagittis orci a scelerisque purus semper eget. Nunc id cursus metus aliquam eleifend mi in. Nam aliquam sem et tortor consequat id porta nibh venenatis. Ut enim blandit volutpat maecenas volutpat blandit. Magna etiam tempor orci eu lobortis elementum nibh. Viverra tellus in hac habitasse platea dictumst. Urna et pharetra pharetra massa massa ultricies mi quis.'
const ipsumParagraph = `<p>${ipsumText}</p>`
var ipsumRepeats = 5
ipsumRepeats = 1

const ipsumButton = document.querySelector('button')
ipsumButton.onclick = () => {
  for (let i = 0; i < ipsumRepeats; i++) {
    const ipsum = document.querySelector('p')
    ipsum.remove()
  }
  ipsumRepeats = ipsumRepeats == 5 ? 1 : 5
  container.insertAdjacentHTML('beforeend', ipsumParagraph.repeat(ipsumRepeats))
}

container.insertAdjacentHTML('beforeend', ipsumParagraph.repeat(ipsumRepeats))
