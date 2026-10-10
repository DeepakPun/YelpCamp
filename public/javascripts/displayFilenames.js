document.getElementById("images").addEventListener("change", function (e) {
  const files = Array.from(e.target.files)
  const names = files.map((f) => f.name).join(", ")
  document.getElementById("file-names").textContent = files.length
    ? `${files.length} files selected: ${names}`
    : ""
})
