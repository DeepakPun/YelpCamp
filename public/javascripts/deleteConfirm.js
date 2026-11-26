document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("deleteConfirmModal")
  if (!modalEl) return

  const messageEl = document.getElementById("deleteConfirmMessage")
  const titleEl = document.getElementById("deleteConfirmModalLabel")
  const confirmBtn = document.getElementById("deleteConfirmBtn")
  const modal = new bootstrap.Modal(modalEl)

  let pendingForm = null

  // Intercept any form with .delete-form
  document.addEventListener("submit", (e) => {
    const form = e.target.closest(".delete-form")
    if (!form) return

    e.preventDefault()
    pendingForm = form

    messageEl.textContent = form.dataset.confirm || "Are you sure?"
    titleEl.textContent = form.dataset.title || "Confirm Delete"
    confirmBtn.disabled = false
    modal.show()
  })

  confirmBtn.addEventListener("click", () => {
    if (!pendingForm) return
    confirmBtn.disabled = true
    const formToSubmit = pendingForm
    pendingForm = null
    modal.hide()
    // .submit() bypasses the submit listener, so no loop
    formToSubmit.submit()
  })

  modalEl.addEventListener("hidden.bs.modal", () => {
    pendingForm = null
    confirmBtn.disabled = false
  })
})
