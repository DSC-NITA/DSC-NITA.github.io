const btn = document.getElementById("contBtn");

(function () {
  const second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24;

  let birthday = "Aug 15, 2021 04:00:00",
    countDown = new Date(birthday).getTime(),
    x = setInterval(function () {
      let now = new Date().getTime(),
        distance = countDown - now;

      (document.getElementById("days").innerText = Math.floor(distance / day)),
        (document.getElementById("hours").innerText = Math.floor(
          (distance % day) / hour
        )),
        (document.getElementById("minutes").innerText = Math.floor(
          (distance % hour) / minute
        )),
        (document.getElementById("seconds").innerText = Math.floor(
          (distance % minute) / second
        ));

      //do something later when date is reached
      if (distance < 0) {
        (countdown = document.getElementById("countdown")),
        countdown.style.display = "none";
        btn.style.display = "block";

        clearInterval(x);
      }
      //seconds
    }, 0);
})();

const audio = document.querySelector("audio");

audio.oncanplay = (e) => {
  console.log("Trying to play audio");
  document.body.addEventListener("mousemove", async function (e) {
    await audio.play();
    console.log("Started audio playback");
  });
};
