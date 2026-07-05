/* Interações do site — reveals, FAQ, manifesto, parallax, cursor */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* rede de segurança do título do hero: após a animação de entrada,
     fixa o estado final (cobre loads com a página já rolada) */
  var heroH1 = document.querySelector("h1.reveal");
  if (heroH1) {
    setTimeout(function () { heroH1.classList.add("hero-settled"); }, reduced ? 0 : 1600);
  }

  /* ---------- 1. Reveal on scroll ----------
     Os elementos vêm do DOM original com opacity:0 + translateY(24px) inline.
     Com suporte a scroll-driven animations, trocamos por CSS puro (.sda-reveal);
     senão, IntersectionObserver revela uma vez. */
  var hidden = Array.prototype.filter.call(
    document.querySelectorAll("[style]"),
    function (el) {
      // overlays decorativos de hover (aria-hidden) ficam a cargo do hover
      return el.style.opacity === "0" && el.getAttribute("aria-hidden") !== "true";
    }
  );

  var sda = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
  if (reduced) {
    hidden.forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.removeProperty("will-change");
    });
  } else if (sda) {
    hidden.forEach(function (el) {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("transition");
      el.style.removeProperty("will-change");
      el.classList.add("sda-reveal");
    });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            if (entry.target.style.transform.indexOf("translateY") !== -1) {
              entry.target.style.transform = "translateY(0)";
            }
            entry.target.style.removeProperty("will-change");
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

  /* ---------- 2. FAQ (accordion acessível) ---------- */
  var faq = document.getElementById("duvidas");
  if (faq) {
    var items = Array.prototype.map.call(
      faq.querySelectorAll("button[aria-expanded]"),
      function (btn, i) {
        var wrapper = btn.parentElement;
        var panel = btn.nextElementSibling;
        btn.id = "faq-btn-" + (i + 1);
        if (panel) {
          panel.id = "faq-panel-" + (i + 1);
          panel.setAttribute("role", "region");
          panel.setAttribute("aria-labelledby", btn.id);
          btn.setAttribute("aria-controls", panel.id);
          if (btn.getAttribute("aria-expanded") !== "true") {
            panel.style.visibility = "hidden";
          }
        }
        return { btn: btn, wrapper: wrapper, panel: panel };
      }
    );

    function setState(item, open) {
      var w = item.wrapper, b = item.btn, p = item.panel;
      b.setAttribute("aria-expanded", open ? "true" : "false");
      if (p) {
        p.style.gridTemplateRows = open ? "1fr" : "0fr";
        p.style.visibility = open ? "visible" : "hidden";
        p.style.transition =
          "grid-template-rows 0.5s cubic-bezier(0.22,1,0.36,1), visibility 0.5s";
      }
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
      }
      var answer = p && p.querySelector("p");
      if (answer) {
        answer.classList.toggle("text-bone/85", open);
        answer.classList.toggle("text-ink-soft", !open);
      }
    }

    /* o primeiro item vem aberto do DOM com ícone "minus"; padroniza para
       "plus" rotacionável via CSS */
    items.forEach(function (item) {
      var svg = item.btn.querySelector("span.shrink-0 svg");
      if (svg && svg.querySelectorAll("path").length < 2) {
        var v = document.createElementNS("http://www.w3.org/2000/svg", "path");
        v.setAttribute("d", "M12 5v14");
        svg.appendChild(v);
      }
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
    // estados agora vivem no CSS (.is-active); limpa os inline do DOM salvo
    lis.forEach(function (li) {
      li.style.removeProperty("transform");
      var box = li.firstElementChild;
      if (box) {
        box.style.removeProperty("background");
        box.style.removeProperty("border");
      }
      var bar = box && box.querySelector("span[aria-hidden]");
      if (bar) bar.style.removeProperty("background");
      var text = box && box.querySelector("p");
      if (text) {
        text.style.removeProperty("color");
        text.style.removeProperty("font-weight");
      }
    });
    var current = 3, cycle = null;
    function highlight(index) {
      lis.forEach(function (li, i) { li.classList.toggle("is-active", i === index); });
    }
    function start() {
      if (reduced || cycle) return;
      cycle = setInterval(function () {
        current = (current + 1) % lis.length;
        highlight(current);
      }, 2600);
    }
    function stop() { clearInterval(cycle); cycle = null; }
    highlight(current);
    start();
    var ul = manifesto.querySelector("ul");
    if (ul) ul.addEventListener("mouseleave", start);
    lis.forEach(function (li, i) {
      li.addEventListener("mouseenter", function () {
        stop();
        current = i;
        highlight(i);
      });
    });
  }

  /* ---------- 4. Spotlight que segue o mouse (cards com overlay) ---------- */
  if (finePointer && !reduced) {
    Array.prototype.forEach.call(
      document.querySelectorAll("article.group"),
      function (card) {
        var overlay = card.querySelector('div[aria-hidden="true"][style*="radial-gradient"]');
        if (!overlay) return;
        overlay.style.background =
          "radial-gradient(360px circle at var(--mx,80%) var(--my,0%), " +
          "color-mix(in oklab, var(--ember) 30%, transparent) 0%, transparent 65%)";
        overlay.style.transition = "opacity 0.45s ease";
        card.addEventListener("mousemove", function (e) {
          var r = card.getBoundingClientRect();
          overlay.style.setProperty("--mx", (e.clientX - r.left) + "px");
          overlay.style.setProperty("--my", (e.clientY - r.top) + "px");
          overlay.style.opacity = "1";
        });
        card.addEventListener("mouseleave", function () {
          overlay.style.opacity = "0";
        });
      }
    );
  }

  /* ---------- 5. Preenchimento da linha do tempo ---------- */
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

  /* ---------- 6. Cursor custom + CTAs magnéticos ---------- */
  var dot = document.querySelector("div.pointer-events-none.fixed.z-\\[100\\]");
  if (dot) {
    dot.classList.add("cursor-dot");
    if (finePointer && !reduced) {
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
  if (finePointer && !reduced) {
    Array.prototype.forEach.call(
      document.querySelectorAll(".magnetic-cta"),
      function (cta) {
        cta.addEventListener("mousemove", function (e) {
          var r = cta.getBoundingClientRect();
          var x = (e.clientX - r.left - r.width / 2) / r.width;
          var y = (e.clientY - r.top - r.height / 2) / r.height;
          cta.style.transition = "none"; // segue o mouse sem lag
          cta.style.transform = "translate(" + x * 8 + "px," + y * 6 + "px)";
        });
        cta.addEventListener("mouseleave", function () {
          // volta com "mola": overshoot leve e assentamento
          cta.style.transition = "transform 0.6s cubic-bezier(0.22, 1.6, 0.36, 1)";
          cta.style.transform = "translate(0,0)";
        });
      }
    );
  }

  /* ---------- 7. Parallax leve (elementos com data-parallax) ---------- */
  if (finePointer && !reduced) {
    var pEls = document.querySelectorAll("[data-parallax]");
    if (pEls.length) {
      var pItems = Array.prototype.map.call(pEls, function (el) {
        el.style.willChange = "transform";
        return { el: el, speed: parseFloat(el.getAttribute("data-parallax")) || 0.1 };
      });
      var ticking = false;
      var update = function () {
        ticking = false;
        var vh = window.innerHeight;
        pItems.forEach(function (it) {
          var r = it.el.getBoundingClientRect();
          if (r.bottom < -80 || r.top > vh + 80) return;
          var y = (r.top + r.height / 2 - vh / 2) * -it.speed;
          it.el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
        });
      };
      window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      update();
    }
  }
})();
