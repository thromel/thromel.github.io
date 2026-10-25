// Home-page mini shell. Without JS the hero is plain readable text.
(function () {
  var out = document.getElementById("term-out");
  if (!out) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sections = { about: "about", news: "news", pubs: "pubs", projects: "projects", research: "research", education: "education", links: "links", blog: "posts" };
  var helpText = "commands: help about news pubs projects research education cv links blog clear";

  var row = document.createElement("div");
  row.className = "ln term-input-row";
  row.innerHTML = '<span class="ps">$</span> ';
  var input = document.createElement("input");
  input.type = "text";
  input.id = "term-input";
  input.setAttribute("aria-label", "terminal command");
  input.autocomplete = "off";
  input.spellcheck = false;
  input.autocapitalize = "off";
  row.appendChild(input);
  out.parentNode.appendChild(row);

  function print(text, href) {
    var p = document.createElement("p");
    p.className = "ln";
    if (href) {
      var a = document.createElement("a");
      a.href = href;
      a.textContent = text;
      p.appendChild(a);
    } else p.textContent = text;
    out.appendChild(p);
  }

  function go(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function run(raw) {
    var cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    print("$ " + raw.trim());
    if (cmd === "clear") { out.textContent = ""; return; }
    if (cmd === "help") return print(helpText);
    if (cmd === "cv") return print("opening /cv/ ...", document.querySelector('a.pill[href$="/cv/"]').href);
    if (sections[cmd]) {
      print("-> " + (cmd === "blog" ? "posts" : cmd));
      return go(sections[cmd]);
    }
    print("command not found: " + raw.trim());
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { run(input.value); input.value = ""; }
  });
  document.getElementById("hero").addEventListener("click", function (e) {
    if (e.target.tagName !== "A" && window.getSelection().toString() === "") input.focus({ preventScroll: true });
  });
})();
