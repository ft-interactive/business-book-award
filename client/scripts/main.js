// 'use strict';
// require('fastclick')(document.body);

function on(selector, event, callback) {
  document.querySelector(selector).addEventListener(event, callback);
}

document
  .querySelector(".js-filter-bar-toggle-placeholder")
  .insertAdjacentHTML(
    "beforeend",
    '<a href="#filterbar" class="js-filter-bar-toggle top-bar__action" role="button"><span class="visuallyhidden">Menu</span></a>'
  );

on(".js-filter-bar-toggle", "click", function (event) {
  event.preventDefault();
  var filterBar = document.querySelector(".js-filter-bar");
  if (!filterBar) return;
  filterBar.classList.toggle("filter-bar--hidden");
});

// Prevent search form submission
on(".js-search-form", "submit", function (event) {
  event.preventDefault();
});

// Submit the filter form on change
on(".js-filter-form-select", "change", function (event) {
  if (window.oTracking) {
    const context =
      event.target.value == "_" || !event.target.value
        ? "all"
        : event.target.value;

    const eventConfig = {
      category: "category",
      action: "select",
      context: context,
    };
    window.oTracking.event({ detail: eventConfig });
  }

  document.querySelector(".js-filter-form").submit();
});

var books_request;
var Keys = {
  UP_ARROW: 38,
  DOWN_AROW: 40,
  ENTER: 13,
};

on(".js-tipue-drop", "keydown", function (event) {
  var key_code = event.keyCode;
  var value = event.target.value;
  var open = event.target.is_open;

  if (!value) {
    return;
  }

  if (key_code === Keys.ENTER) {
    event.preventDefault();
    go_to_selected();
    return;
  } else if (key_code === Keys.UP_ARROW) {
    event.preventDefault();
    select_previous();
    return;
  } else if (key_code === Keys.DOWN_AROW) {
    event.preventDefault();
    if (!open) {
      show_results();
    }
    select_next();
    return;
  }
});

on(".js-tipue-drop", "keyup", function (event) {
  var value = event.target.value.trim();
  var key_code = event.keyCode;
  var last_value = event.target.last_value;

  event.target.last_value = value;

  if (key_code === Keys.UP_ARROW || key_code === Keys.DOWN_AROW) {
    return;
  }

  if (last_value && last_value === value) {
    return;
  }

  if (!value) {
    hide_results();
    return;
  }

  if (!books_request) {
    books_request = fetch(window.searchOptions.contentLocation).then(function (
      response
    ) {
      return response.json();
    });
  }

  books_request.then(function (books) {
    var search_results = search(value, books);
    view_search_results(search_results);
  });
});

function filter_book_fuzzy(value) {
  var pat = new RegExp(value, "i");
  return function (book) {
    return (
      book.title.search(pat) !== -1 ||
      book.author.search(pat) !== -1 ||
      book.year.toString().search(pat) !== -1
    );
  };
}

function filter_book_exact_title(value) {
  value = value.toLowerCase();
  return function (book) {
    var s = book.title
      .toLowerCase()
      .replace(/^(a|the) /, "")
      .indexOf(value);
    return s === 0;
  };
}

function search(query, books) {
  if (!query) {
    return [];
  } else if (query.length < 4) {
    return books.filter(filter_book_exact_title(query)).slice(0, 6);
  }

  return books.filter(filter_book_fuzzy(query)).slice(0, 3);
}

function go_to_selected() {
  var selected = document.querySelector(".tipue_drop_item.selected");
  if (!selected) return;
  selected.click();
  hide_results();
}

function select_previous() {
  var selected = document.querySelector(".tipue_drop_item.selected");
  if (
    selected &&
    selected.previousElementSibling &&
    selected.previousElementSibling.classList.contains("tipue_drop_item")
  ) {
    selected.classList.remove("selected");
    selected.previousElementSibling.classList.add("selected");
    if (
      typeof selected.previousElementSibling.scrollIntoViewIfNeeded ===
      "function"
    ) {
      selected.previousElementSibling.scrollIntoViewIfNeeded(false);
    }
  } else {
    var input = document.querySelector(".js-tipue-drop");
    if (input && typeof input.scrollIntoViewIfNeeded === "function") {
      input.scrollIntoViewIfNeeded(false);
    }
  }
}

function select_next() {
  var selected = document.querySelector(".tipue_drop_item.selected");
  var next;

  if (
    selected &&
    selected.nextElementSibling &&
    selected.nextElementSibling.classList.contains("tipue_drop_item")
  ) {
    next = selected.nextElementSibling;
  } else {
    next = document.querySelector(".tipue_drop_item");
  }

  if (selected && next) {
    selected.classList.remove("selected");
  }

  if (next) {
    next.classList.add("selected");
    if (typeof next.scrollIntoViewIfNeeded === "function") {
      next.scrollIntoViewIfNeeded(false);
    }
  }
}

function hide_results() {
  var dropdown = document.getElementById("tipue_drop_content");
  // hide popup - fade out with speed variable
  dropdown.classList.remove("tipue_drop_show");

  var selected = document.querySelector(".tipue_drop_item.selected");

  if (selected) {
    selected.classList.remove("selected");
  }

  document.removeEventListener("click", hide_results);
}

function show_results(html) {
  var dropdown = document.getElementById("tipue_drop_content");

  if (typeof html === "string") {
    dropdown.innerHTML = html;
  }

  dropdown.classList.add("tipue_drop_show");
  document.addEventListener("click", hide_results);
}

function view_search_results(search_results) {
  if (!search_results.length) {
    hide_results();
    return;
  }

  var route = window.searchOptions.route;
  var html = "";

  html +=
    '<div id="tipue_drop_wrapper"><div class="tipue_drop_head"><div id="tipue_drop_head_text">Suggested results</div></div>';
  html += search_results
    .map(function (book) {
      var out = "";
      out +=
        '<a class="tipue_drop_item" data-trackable="search-results" href="' +
        route(book) +
        '"';
      out += '><div ><div class="tipue_drop_left">';
      out +=
        '<img src="https://image.webservices.ft.com/v1/images/raw/' +
        book.cover;
      out +=
        '?source=ft_ig_business_book_award_search&amp;width=120" class="tipue_drop_image" alt=""></div>';
      out +=
        '<div class="tipue_drop_right"><div class="tipue_drop_right_title">' +
        book.title +
        "</div>";
      out +=
        '<div class="tipue_drop_right_text">' +
        book.author +
        "<br />" +
        book.year +
        "</div></div></div></a>";
      return out;
    })
    .join("");
  html += "</div>";

  show_results(html);
}

function make_cancelable(promise) {
  let hasCanceled = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    /* eslint-disable prefer-promise-reject-errors */
    promise.then(
      (val) => (hasCanceled ? reject({ isCanceled: true }) : resolve(val)),
      (error) => (hasCanceled ? reject({ isCanceled: true }) : reject(error))
    );
    /* eslint-enable */
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true;
    },
  };
}

async function get_onward_journey_section(list) {
  const relatedContent = [{ rows: 2, list: list }];
  const urlBase = "https://ig.ft.com/onwardjourney/v3/";
  const sectionsAttempt = make_cancelable(
    Promise.all(
      relatedContent.map(({ list, rows = 1 }) => {
        const limit = rows * 4;
        const url = `${urlBase}${list}/html/?limit=${limit}`;
        return fetch(url).then((res) => res.text());
      })
    )
  );

  try {
    const sections = await sectionsAttempt.promise;
    return sections;
  } catch (e) {
    if (e.isCanceled) return;
    console.error(e); // eslint-disable-line no-console
    return null;
  }
}

async function show_onward_journey() {
  const onwardJourneySection = document.getElementById("onward-journey");
  if (onwardJourneySection) {
    const list = onwardJourneySection.getAttribute("data-related-content");
    if (list) {
      const section = await get_onward_journey_section(list);
      if (section && section[0] !== "Not Found") {
        onwardJourneySection.innerHTML = section[0];
      }
    }
  }
}

show_onward_journey();
