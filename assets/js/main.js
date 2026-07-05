/* Interações do site — reconstruídas a partir do comportamento do original */
(function () {
  "use strict";

  /* ---------- 1. Reveal on scroll ----------
     Os elementos vêm do DOM original com opacity:0 + translateY(24px)
     inline; aqui só os revelamos quando entram na viewport. */
  var hidden = Array.prototype.filter.call(
    document.querySelectorAll("[style]"),
    function (el) {
      // overlays decorativos de hover (aria-hidden) ficam a cargo do CSS/hover
      return el.style.opacity === "0" && el.getAttribute("aria-hidden") !== "true";
    }
  );
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            if (entry.target.style.transform.indexOf("translateY") !== -1) {
              entry.target.style.transform = "translateY(0)";
            }
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    hidden.forEach(function (el) { io.observe(el); });
  } else {
    hidden.forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  /* ---------- 2. FAQ (accordion) ---------- */
  var faq = document.getElementById("duvidas");
  if (faq) {
    var items = Array.prototype.slice.call(
      faq.querySelectorAll("button[aria-expanded]")
    ).map(function (btn) {
      var wrapper = btn.parentElement;             // div arredondada
      var panel = btn.nextElementSibling ||         // div grid 1fr/0fr
        (wrapper.nextElementSibling && wrapper.nextElementSibling.matches("div.grid")
          ? wrapper.nextElementSibling : null);
      // no DOM salvo o painel é irmão do botão dentro do wrapper
      if (!panel) panel = wrapper.querySelector("div.grid");
      return { btn: btn, wrapper: wrapper, panel: panel };
    });

    var ICON_MINUS = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M5 12h14"></path></svg>';
    var ICON_PLUS = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>';

    function setState(item, open) {
      var w = item.wrapper, b = item.btn, p = item.panel;
      b.setAttribute("aria-expanded", open ? "true" : "false");
      if (p) p.style.gridTemplateRows = open ? "1fr" : "0fr";
      w.classList.toggle("bg-ink", open);
      w.classList.toggle("text-bone", open);
      w.classList.toggle("border-ink", open);
      w.classList.toggle("bg-bone-warm", !open);
      w.classList.toggle("border-ink/10", !open);
      w.classList.toggle("hover:border-ink/30", !open);
      var circle = b.querySelector("span.shrink-0");
      if (circle) {
        circle.className = open
          ? "shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition bg-ember text-ink"
          : "shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition border border-ink/20 text-ink";
        circle.innerHTML = open ? ICON_MINUS : ICON_PLUS;
      }
      var answer = p && p.querySelector("p");
      if (answer) {
        answer.classList.toggle("text-bone/85", open);
        answer.classList.toggle("text-ink-soft", !open);
      }
    }

    items.forEach(function (item) {
      item.btn.addEventListener("click", function () {
        var isOpen = item.btn.getAttribute("aria-expanded") === "true";
        items.forEach(function (other) { setState(other, false); });
        if (!isOpen) setState(item, true);
      });
    });
  }

  /* ---------- 3. Lista do manifesto (frase em destaque) ---------- */
  var manifesto = document.getElementById("manifesto");
  if (manifesto) {
    var lis = Array.prototype.slice.call(manifesto.querySelectorAll("ul li"));
    function highlight(index) {
      lis.forEach(function (li, i) {
        var active = i === index;
        var box = li.firstElementChild;
        var bar = box && box.querySelector("span[aria-hidden]");
        var text = box && box.querySelector("p");
        li.style.transform = active ? "translateX(6px)" : "translateX(0px)";
        if (box) {
          box.style.background = active
            ? "color-mix(in oklab, var(--ember) 14%, var(--bone))"
            : "color-mix(in oklab, var(--ink) 4%, var(--bone))";
          box.style.border = active
            ? "1px solid color-mix(in oklab, var(--ember-deep) 35%, transparent)"
            : "1px solid color-mix(in oklab, var(--ink) 8%, transparent)";
        }
        if (bar) bar.style.background = active ? "var(--ember-deep)" : "transparent";
        if (text) {
          text.style.color = active
            ? "var(--ink-deep)"
            : "color-mix(in oklab, var(--ink) 65%, transparent)";
          text.style.fontWeight = active ? "500" : "400";
        }
      });
    }
    var current = 3;
    highlight(current);
    var cycle = setInterval(function () {
      current = (current + 1) % lis.length;
      highlight(current);
    }, 2600);
    lis.forEach(function (li, i) {
      li.addEventListener("mouseenter", function () {
        clearInterval(cycle);
        highlight(i);
      });
    });
  }

  /* ---------- 3b. Glow de hover nos cards de benefícios ---------- */
  Array.prototype.forEach.call(
    document.querySelectorAll("article.group"),
    function (card) {
      var overlay = card.querySelector('div[aria-hidden="true"][style*="radial-gradient"]');
      if (!overlay) return;
      card.addEventListener("mouseenter", function () { overlay.style.opacity = "1"; });
      card.addEventListener("mouseleave", function () { overlay.style.opacity = "0"; });
    }
  );

  /* ---------- 4. Preenchimento da linha do tempo ---------- */
  var railFill = document.querySelector(".timeline-rail-fill");
  if (railFill) {
    var railBox = railFill.closest(".relative");
    var onScroll = function () {
      var rect = railBox.getBoundingClientRect();
      var vh = window.innerHeight;
      var progress = (vh * 0.75 - rect.top) / rect.height;
      progress = Math.max(0, Math.min(1, progress));
      railFill.style.setProperty("--rail", (progress * 100).toFixed(1) + "%");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 5. Cursor custom + CTAs magnéticos ---------- */
  var dot = document.querySelector("div.pointer-events-none.fixed.z-\\[100\\]");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (dot) {
    dot.classList.add("cursor-dot");
    if (finePointer) {
      document.addEventListener("mousemove", function (e) {
        dot.style.transform =
          "translate3d(" + e.clientX + "px," + e.clientY + "px,0) translate(-50%,-50%)";
      });
      document.addEventListener("mouseover", function (e) {
        var interactive = e.target.closest("a, button");
        dot.style.width = interactive ? "34px" : "12px";
        dot.style.height = interactive ? "34px" : "12px";
        dot.style.opacity = interactive ? "0.35" : "0.7";
      });
    } else {
      dot.style.display = "none";
    }
  }
  if (finePointer) {
    Array.prototype.forEach.call(
      document.querySelectorAll(".magnetic-cta"),
      function (cta) {
        cta.addEventListener("mousemove", function (e) {
          var r = cta.getBoundingClientRect();
          var x = (e.clientX - r.left - r.width / 2) / r.width;
          var y = (e.clientY - r.top - r.height / 2) / r.height;
          cta.style.transform = "translate(" + x * 6 + "px," + y * 5 + "px)";
        });
        cta.addEventListener("mouseleave", function () {
          cta.style.transform = "";
        });
      }
    );
  }
})();
