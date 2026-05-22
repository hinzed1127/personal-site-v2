const CACHE_KEY = "listening-data";

export function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // storage quota exceeded or private browsing — silently ignore
  }
}

export function isWithinLastWeek(uts) {
  const ONE_WEEK_SECS = 7 * 24 * 60 * 60;
  return Date.now() / 1000 - parseInt(uts, 10) < ONE_WEEK_SECS;
}

export function isWithinLastTenMinutes(uts) {
  const TEN_MINUTES_SECS = 10 * 60;
  return Date.now() / 1000 - parseInt(uts, 10) < TEN_MINUTES_SECS;
}

// Guard allows this file to be imported as an ES module in Node/Vitest
if (typeof document !== "undefined") {
  (async function () {
    const nowPlayingWrapper = document.getElementById("listening-now-playing");
    const banner = document.getElementById("listening-banner");
    const bannerLabel = document.getElementById("listening-banner-label");
    const bannerTrack = document.getElementById("listening-banner-track");
    const bannerArtist = document.getElementById("listening-banner-artist");
    const bannerAlbum = document.getElementById("listening-banner-album");
    const bannerImage = document.getElementById("listening-banner-image");
    const sidebarContent = document.getElementById("listening-sidebar-content");
    const sidebarError = document.getElementById("listening-sidebar-error");
    const sidebarLoading = document.getElementById("listening-sidebar-loading");
    const artistsList = document.getElementById("listening-top-artists");
    const albumsList = document.getElementById("listening-top-albums");
    const weekBtn = document.getElementById("listening-week-btn");
    const monthBtn = document.getElementById("listening-month-btn");

    let currentPeriod = "week";
    let currentData = null;

    weekBtn.addEventListener("click", () => {
      currentPeriod = "week";
      weekBtn.classList.add("active");
      monthBtn.classList.remove("active");
      if (currentData) renderSidebar(currentData, "week");
    });
    monthBtn.addEventListener("click", () => {
      currentPeriod = "month";
      monthBtn.classList.add("active");
      weekBtn.classList.remove("active");
      if (currentData) renderSidebar(currentData, "month");
    });

    function renderBanner(d) {
      const isNowPlaying = d.nowPlaying || (d.recentTrack && isWithinLastTenMinutes(d.recentTrack.date));
      const track = d.nowPlaying ?? (d.recentTrack && isWithinLastWeek(d.recentTrack.date) ? d.recentTrack : null);
      if (!track) return;

      document.getElementById("listening-banner-label-text").textContent = isNowPlaying ? "Now Playing" : "Recently Played";
      bannerTrack.textContent = track.track;
      bannerArtist.textContent = track.artist;
      bannerAlbum.textContent = track.album;
      bannerImage.src = track.image ?? "";
      bannerImage.alt = track.image ? `${track.album} album art` : "";
      bannerImage.hidden = !track.image;
      banner.hidden = false;
      nowPlayingWrapper.hidden = false;
    }

    function renderSidebar(data, period) {
      const artists = data.topArtists[period] ?? [];
      const albums = data.topAlbums[period] ?? [];

      artistsList.innerHTML = artists
        .slice(0, 5)
        .map((a, i) => `<li><span class="rank">${i + 1}</span> ${a.url ? `<a href="${a.url}" target="_blank" rel="noopener">${a.name}</a>` : a.name}</li>`)
        .join("");

      albumsList.innerHTML = albums
        .slice(0, 5)
        .map((a, i) => `<li><span class="rank">${i + 1}</span> ${a.url ? `<a href="${a.url}" target="_blank" rel="noopener">${a.name}</a>` : a.name}</li>`)
        .join("");
    }

    function renderAll(data) {
      currentData = data;
      renderBanner(data);
      sidebarContent.hidden = false;
      renderSidebar(data, currentPeriod);
    }

    // Build-time data embedded in the page takes priority over localStorage —
    // it's fresher (as of the last deploy) and saves a cache read on first visit.
    const buildDataEl = document.getElementById("listening-build-data");
    const buildData = buildDataEl ? JSON.parse(buildDataEl.textContent) : null;

    if (buildData) {
      // Seed localStorage so subsequent visits get instant data even between deploys
      saveCache(buildData);
      sidebarLoading?.remove();
    } else {
      // No build data — render from localStorage immediately if available
      const cached = loadCache();
      if (cached) {
        renderAll(cached);
      }
    }

    try {
      const res = await fetch("/api/listening");
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      saveCache(data);
      renderAll(data);
    } catch (_err) {
      if (!buildData && !loadCache()) {
        sidebarError.hidden = false;
      }
    } finally {
      sidebarLoading?.remove();
      document.getElementById("listening-banner-spinner")?.remove();
      document.getElementById("listening-sidebar-spinner")?.remove();
    }
  })();
}
