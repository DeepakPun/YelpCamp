;(function () {
  const input = document.getElementById("images")
  if (!input) return

  input.addEventListener("change", function () {
    const names = Array.from(this.files)
      .map((f) => f.name)
      .join(", ")
    const display = document.getElementById("filename")
    if (display) display.textContent = names
  })
})()
