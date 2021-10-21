/** @format */

console.log("started");

// let main_root = document.querySelector("#seymurs-main-root");
const Choice_planetName = document.getElementById("planet-name"),
  Choice_fromSun = document.getElementById("from-sun"),
  Choice_year = document.getElementById("solar-year"),
  Choice_day = document.getElementById("sidereel-day"),
  Choice_velocity = document.getElementById("orbital-velocity"),
  Choice_img480 = document.getElementById("img480"),
  Choice_img1024 = document.getElementById("img1024"),
  Choice_imgDefault = document.getElementById("img-default"),
  Choice_mainNav = document.querySelector(".main-nav"),
  Choice_symbols = document.querySelectorAll(".main-nav ul li img"),
  Choice_nav_links = document.querySelectorAll(".main-nav a"),
  Choice_planetCol = document.querySelector(".planet-col"),
  Choice_infoCol = document.querySelector(".info-col"),
  Choice_planetImg = document.querySelector(".planet-image");

const Choice_symbol_array = Array.prototype.slice.call(Choice_symbols); // Turning node list of SVG imgs into array
const Choice_link_array = Array.prototype.slice.call(Choice_nav_links); // Turning nav link node list into array
// const Choice_Planet_image_array = Array.prototype.slice.call();

const planets = [
  {
    planetName: "Genesis",
    fromSun: "57.9m <abbr>Km</abbr>",
    year: "88 Earth Days",
    day: "59 Earth Days",
    velocity: "106,000 <abbr>mph</abbr>",
    img480: "./images/neptune.png",
    img1024: "./images/neptune.png",
    id: "genesis",
  },
  {
    planetName: "Apokalypse",
    fromSun: "108m <abbr>Km</abbr>",
    year: "225 Earth Days",
    day: "116 Earth Days",
    velocity: "126 <abbr>Kmh</abbr>",
    img480: "./images/apokalipse (2).png",
    img1024: "./images/apokalipse (2).png",
    id: "apokalypse",
  },
  {
    planetName: "Prometheus",
    fromSun: "150m <abbr>Km</abbr>",
    year: "365 Days",
    day: "48 Hours",
    velocity: "66,600 <abbr>Mph</abbr>",
    img480: "./images/purpleplanet.png",
    img1024: "./images/purpleplanet.png",
    id: "prometheus",
  },
  {
    planetName: "Daedalus",
    fromSun: "228m <abbr>Km</abbr>",
    year: "687 Earth Days",
    day: "24.6 Earth Days",
    velocity: "86, 400 <abbr>Kmh</abbr>",
    img480: "./images/greenplanet.png",
    img1024: "./images/greenplanet.png",
    id: "daedalus",
  },
];

function displayPlanetInfo(action) {
  // Main function, swaps out all content

  setTimeout(function () {
    // This delaying swapping out content to allow for animated transition before reappearing
    Choice_planetName.innerText = planets[action].planetName;
    Choice_fromSun.innerHTML = planets[action].fromSun;
    Choice_year.innerText = planets[action].year;
    Choice_day.innerText = planets[action].day;
    Choice_velocity.innerHTML = planets[action].velocity;
    Choice_img480.setAttribute("srcset", planets[action].img480);
    Choice_img1024.setAttribute("srcset", planets[action].img1024);
    Choice_imgDefault.setAttribute("src", planets[action].img480);
    Choice_planetCol.classList.remove("hide-left");
    Choice_infoCol.classList.remove("hide-right");
  }, 1100);
}

Choice_mainNav.addEventListener("click", function (e) {
  e.preventDefault();

  if (event.target.tagName != "IMG" && event.target.tagName != "A") {
    return;
  } else if (event.target.tagName == "IMG") {
    console.log("clicked on symbol");
    for (i = 0; i < Choice_symbol_array.length; i++) {
      Choice_symbol_array[i].classList.remove("active"); // removing any .active class on symbol img svgs
      console.log("removing active class");

      if (Choice_symbol_array[i] === event.target) {
        console.log("displaying planet info");
        displayPlanetInfo(i); // calling function that matches iteration of symbol, passing in iteration
        hideCols();
        Choice_symbol_array[i].classList.toggle("active");
      }
    }
  } else if (event.target.tagName == "A") {
    console.log("removing active class from a anchor");
    for (i = 0; i < Choice_nav_links.length; i++) {
      Choice_symbol_array[i].classList.remove("active"); // removing any .active class on symbol img svgs

      if (Choice_symbol_array[i].parentElement === event.target) {
        console.log("displaying planet info from anchor");
        displayPlanetInfo(i); // calling function that matches iteration of symbol, passing in iteration
        hideCols();
        Choice_symbol_array[i].classList.toggle("active");
      }
    }
  } else return;
});

function hideCols() {
  Choice_planetCol.classList.add("hide-left");
  Choice_infoCol.classList.add("hide-right");
}

function planetUrl() {
  if (
    Choice_planetImg.srcset ===
    "https://image.flaticon.com/icons/svg/1751/1751884.svg"
  ) {
    window.location.href = "https://github.com/smammadov1994/Live-Chat";
  } else if (
    Choice_planetImg.srcset ===
    "https://image.flaticon.com/icons/svg/1086/1086088.svg"
  ) {
    window.location.href = "https://github.com/smammadov1994/Spaceforager";
  } else if (
    Choice_planetImg.srcset ===
    "https://image.flaticon.com/icons/svg/788/788174.svg"
  ) {
    window.location.href = "https://github.com/smammadov1994/Grocery-Store";
  } else if (
    Choice_planetImg.srcset ===
    "https://image.flaticon.com/icons/svg/788/788180.svg"
  ) {
    window.location.href = "https://github.com/smammadov1994/RepEnhance";
  } else return;
}
