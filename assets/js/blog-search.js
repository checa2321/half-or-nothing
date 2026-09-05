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
  // Each of these hides itself once none of its own [data-title] children
  // are visible -- otherwise a filtered-out category is left showing a
  // bare header (title + count) over empty space, or the whole spotlight
  // row collapses to just the search box with nothing under it.
  var groups = document.querySelectorAll(".blog-category-col, .blog-spotlight");
  var emptyState = document.getElementById("blog-search-empty");

  // Small Levenshtein distance, capped -- returns cap+1 (meaning "not close
  // enough") the moment the running distance would exceed the cap, so it
  // stays cheap even unmemoized (27 posts, short titles, one keystroke at a
  // time).
  function distance(a, b, cap) {
    if (Math.abs(a.length - b.length) > cap) return cap + 1;
    var prev = [];
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      var cur = [i];
      var rowMin = i;
      for (var k = 1; k <= b.length; k++) {
        var cost = a[i - 1] === b[k - 1] ? 0 : 1;
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
        if (cur[k] < rowMin) rowMin = cur[k];
      }
      if (rowMin > cap) return cap + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  // A query word matches a title if it's a straight substring (handles a
  // partial word, e.g. "gucc" -> "gucci"), or if it's close enough by edit
  // distance to one of the title's own words (handles a typo like "guci" or
  // a wrong plural like "sunglass" vs "sunglasses") -- added 2026-09-05
  // after the design audit flagged the old plain indexOf() as having zero
  // typo tolerance. The cap tightens for short words so "ad" doesn't
  // fuzzy-match half the title's words by accident.
  function wordMatches(word, titleWords, titleText) {
    if (titleText.indexOf(word) !== -1) return true;
    if (word.length < 3) return false;
    var cap = word.length <= 4 ? 1 : 2;
    for (var i = 0; i < titleWords.length; i++) {
      if (distance(word, titleWords[i], cap) <= cap) return true;
    }
    return false;
  }

  function matches(titleText, queryWords) {
    if (!queryWords.length) return true;
    var titleWords = titleText.split(/\s+/);
    for (var i = 0; i < queryWords.length; i++) {
      if (!wordMatches(queryWords[i], titleWords, titleText)) return false;
    }
    return true;
  }

  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    var queryWords = q ? q.split(/\s+/) : [];
    var visible = 0;
    candidates.forEach(function (el) {
      var match = matches(el.getAttribute("data-title"), queryWords);
      el.style.display = match ? "" : "none";
      if (match) visible++;
    });
    groups.forEach(function (group) {
      var count = 0;
      group.querySelectorAll("[data-title]").forEach(function (el) {
        if (el.style.display !== "none") count++;
      });
      group.style.display = count > 0 ? "" : "none";
    });
    if (emptyState) {
      if (q && visible === 0) {
        emptyState.textContent = 'No posts match "' + input.value.trim() + '". Try a category below instead.';
        emptyState.style.display = "block";
      } else {
        emptyState.style.display = "none";
      }
    }
  });
})();
