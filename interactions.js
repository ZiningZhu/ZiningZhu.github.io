// Publications: newest year first. Same-year ties retain their curated source order.
const filters = [...document.querySelectorAll("[data-filter]")];
const paperList = document.querySelector("#papers");
const papers = [...document.querySelectorAll(".paper")];

function publicationYear(paper) {
  return (
    Number(paper.dataset.year) ||
    Number(
      paper.querySelector(".paper-meta")?.textContent.match(/\d{4}/)?.[0],
    ) ||
    0
  );
}

function publicationTopics(paper) {
  return (paper.dataset.topics || paper.dataset.topic || "")
    .split(",")
    .map((topic) => topic.trim());
}

papers.sort((left, right) => publicationYear(right) - publicationYear(left));
papers.forEach((paper) => paperList.append(paper));

function filterPapers(topic) {
  filters.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.filter === topic),
    );
  });

  const limit = Number(paperList.dataset.limit) || Infinity;
  const matches = papers.filter((paper) => {
    if (topic === "Highlight") return paper.dataset.highlight === "true";
    return topic === "All" || publicationTopics(paper).includes(topic);
  });
  const visible = topic === "Highlight" ? matches : matches.slice(0, limit);
  papers.forEach((paper) => {
    paper.hidden = !visible.includes(paper);
  });

  const count = visible.length;
  const total = matches.length > count ? ` of ${matches.length}` : "";
  document.querySelector(".result-count").textContent =
    `${count}${total} selected publication${count === 1 ? "" : "s"}`;
}

filters.forEach((button) => {
  button.addEventListener("click", () => filterPapers(button.dataset.filter));
});
document.querySelectorAll("[data-research]").forEach((link) => {
  link.addEventListener("click", () => filterPapers(link.dataset.research));
});
filterPapers(
  filters.find((button) => button.getAttribute("aria-pressed") === "true")
    ?.dataset.filter || "All",
);

// News: keep the initial entries visible and toggle the older archive.
const newsToggle = document.querySelector("#news-toggle");
const olderNews = document.querySelector("#older-news");
newsToggle.addEventListener("click", () => {
  olderNews.hidden = !olderNews.hidden;
  newsToggle.setAttribute("aria-expanded", String(!olderNews.hidden));
  newsToggle.textContent = olderNews.hidden ? "More news +" : "Less news −";
});

// Biography: native modal supplies focus containment and Escape dismissal.
const bioDialog = document.querySelector("#pi-bio-dialog");
const bioTrigger = document.querySelector(".bio-trigger");
if (bioDialog && bioTrigger) {
  bioTrigger.addEventListener("click", () => bioDialog.showModal());
  bioDialog
    .querySelector(".bio-dismiss")
    .addEventListener("click", () => bioDialog.close());
  bioDialog.addEventListener("click", (event) => {
    const rect = bioDialog.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (event.target === bioDialog && outside) bioDialog.close();
  });
  bioDialog.addEventListener("close", () => bioTrigger.focus());
}
