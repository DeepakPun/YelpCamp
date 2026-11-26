document.addEventListener("DOMContentLoaded", () => {
  const reviewForm = document.getElementById("reviewForm")
  if (!reviewForm) return

  const ratingFeedback = document.getElementById("ratingFeedback")

  reviewForm.addEventListener("submit", (e) => {
    const checked = reviewForm.querySelector(
      'input[name="review[rating]"]:checked',
    )
    const rating = checked ? Number(checked.value) : 0

    if (!rating) {
      e.preventDefault()
      e.stopPropagation()
      // Show our custom message
      ratingFeedback.style.display = "block"
      ratingFeedback.style.setProperty("display", "block", "important")
    } else {
      ratingFeedback.style.display = "none"
    }

    reviewForm.classList.add("was-validated")
  })

  // Hide the error as soon as they pick a star
  reviewForm
    .querySelectorAll('input[name="review[rating]"]')
    .forEach((input) => {
      input.addEventListener("change", () => {
        if (Number(input.value) > 0) {
          ratingFeedback.style.display = "none"
        }
      })
    })
})
