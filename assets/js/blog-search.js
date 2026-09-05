// Filters the blog index's cards/rows by title as the user types into
// #blog-search-input. Client-side only (27 posts today, no need for a
// backend) -- every candidate element already carries its title in
// data-title, set by blog.py's render functions. No-ops on any page
// without that input (every non-blog page loads this same shared script,
// same defensive pattern as interaction.js's own `if (!table) return`).
(function () {
  var input = document.getElementById("blog-search-input");
  if (!input) return;

  var candidates = document.querySelectorAll("[data-title]");
  var emptyState = document.getElementById("blog-search-empty");

  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    var visible = 0;
    candidates.forEach(function (el) {
      var match = !q || el.getAttribute("data-title").indexOf(q) !== -1;
      el.style.display = match ? "" : "none";
      if (match) visible++;
    });
    if (emptyState) {
      emptyState.style.display = q && visible === 0 ? "block" : "none";
    }
  });
})();
