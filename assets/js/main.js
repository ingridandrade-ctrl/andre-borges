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
      // variedade direcional por seção/tipo
      if (el.classList.contains("editorial-card") && el.closest("#abordagem")) {
        el.classList.add("sda-reveal--left");   // cards da timeline entram pela esquerda
      } else if (el.classList.contains("situacao-card")) {
        el.classList.add("sda-reveal--pop");     // placas do buquê "estouram" de baixo
      }
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
      /* o cartão fica sempre em verde escuro; ao abrir só realça a borda.
         a resposta (folha clara) aparece pelo grid que expande. */
      w.classList.toggle("is-open", open);
      var circle = b.querySelector("span.shrink-0");
      if (circle) {
        circle.className = open
          ? "shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition bg-ember text-ink"
          : "shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition border border-bone/25 text-bone/70";
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
      }, 1300);
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

  /* ---------- 4. Tilt 3D + Spotlight unificados nos cards ----------
     Combina inclinação sutil seguindo o cursor com um brilho radial.
     Alvos: buquê de situações, bento de benefícios, cards de atendimento
     e cards da timeline. Benefícios usam o overlay div já existente;
     os demais usam o ::before controlado por --mx/--my/--sp. */
  function setupTiltCards(cards, opts) {
    opts = opts || {};
    var maxDeg = opts.maxDeg || 5;
    var lift = opts.lift != null ? opts.lift : 6;
    Array.prototype.forEach.call(cards, function (card) {
      card.classList.add("tilt-target");
      // spotlight: usa overlay pré-existente (benefícios) ou o ::before (tilt-spot)
      var overlay = card.querySelector('div[aria-hidden="true"][style*="radial-gradient"]');
      if (overlay) {
        overlay.style.background =
          "radial-gradient(360px circle at var(--mx,80%) var(--my,0%), " +
          "color-mix(in oklab, var(--ember) 30%, transparent) 0%, transparent 65%)";
        overlay.style.transition = "opacity 0.45s ease";
      } else {
        card.classList.add("tilt-spot");
      }

      var raf = 0, mx = 0, my = 0, tx = 0, ty = 0, leaving = false;
      function render() {
        raf = 0;
        card.style.transform =
          "perspective(950px) rotateX(" + tx.toFixed(2) + "deg) rotateY(" +
          ty.toFixed(2) + "deg) translateY(-" + lift + "px)";
        if (overlay) {
          overlay.style.setProperty("--mx", mx + "px");
          overlay.style.setProperty("--my", my + "px");
        } else {
          card.style.setProperty("--mx", mx + "px");
          card.style.setProperty("--my", my + "px");
        }
      }
      card.addEventListener("mouseenter", function () {
        leaving = false;
        card.classList.add("is-tilting");
        card.style.willChange = "transform";
        if (overlay) overlay.style.opacity = "1";
        else card.style.setProperty("--sp", "1");
      });
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        mx = e.clientX - r.left;
        my = e.clientY - r.top;
        var px = mx / r.width - 0.5;   // -0.5 .. 0.5
        var py = my / r.height - 0.5;
        ty = px * maxDeg * 2;          // rotação Y segue o X do cursor
        tx = -py * maxDeg * 2;         // rotação X segue o Y do cursor
        if (!raf) raf = requestAnimationFrame(render);
      });
      card.addEventListener("mouseleave", function () {
        leaving = true;
        card.classList.remove("is-tilting");
        // retorno com mola
        card.style.transition = "transform 0.6s var(--ease-out-quint)";
        card.style.transform = "";
        if (overlay) overlay.style.opacity = "0";
        else card.style.setProperty("--sp", "0");
        setTimeout(function () {
          if (leaving) {
            card.style.transition = "";
            card.style.removeProperty("will-change");
          }
        }, 620);
      });
    });
  }

  if (finePointer && !reduced) {
    setupTiltCards(document.querySelectorAll("#o-que-escuto .situacao-card"), { maxDeg: 4.5, lift: 6 });
    setupTiltCards(document.querySelectorAll("#beneficios article.group"), { maxDeg: 4, lift: 5 });
    setupTiltCards(document.querySelectorAll("#atendimento article.editorial-card"), { maxDeg: 3.5, lift: 5 });
    setupTiltCards(document.querySelectorAll("#abordagem article.editorial-card"), { maxDeg: 3.5, lift: 4 });
  }

  /* ---------- 4b. Toque: pop + spotlight nas placas de situação ---------- */
  if (!finePointer && !reduced) {
    Array.prototype.forEach.call(
      document.querySelectorAll("#o-que-escuto .situacao-card"),
      function (card) {
        card.classList.add("tilt-spot");
        card.addEventListener("touchstart", function (e) {
          var t = e.touches && e.touches[0];
          if (t) {
            var r = card.getBoundingClientRect();
            card.style.setProperty("--mx", (t.clientX - r.left) + "px");
            card.style.setProperty("--my", (t.clientY - r.top) + "px");
          }
          card.classList.add("is-tapped");
          setTimeout(function () { card.classList.remove("is-tapped"); }, 650);
        }, { passive: true });
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

  /* ---------- 5b. Linha do tempo: bolinhas que acendem ---------- */
  var tl = document.getElementById("abordagem");
  if (tl) {
    var tlCards = Array.prototype.slice.call(tl.querySelectorAll(".editorial-card"));
    var tlDots = tlCards.map(function (c) { return c.querySelector(".timeline-dot"); });
    var activate = function (idx) {
      tlDots.forEach(function (d, i) { if (d) d.classList.toggle("is-active", i === idx); });
    };
    // ao rolar: acende a bolinha do card mais próximo da "linha de leitura"
    var onTl = function () {
      var line = window.innerHeight * 0.45;
      var best = -1, bestDist = Infinity;
      tlCards.forEach(function (c, i) {
        var r = c.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var d = Math.abs(r.top + r.height / 2 - line);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      if (best >= 0) activate(best);
    };
    window.addEventListener("scroll", onTl, { passive: true });
    onTl();
    // ao passar o dedo/mouse: acende a bolinha do card tocado
    tlCards.forEach(function (c, i) {
      c.addEventListener("mouseenter", function () { activate(i); });
      c.addEventListener("touchstart", function () { activate(i); }, { passive: true });
    });
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

  /* ---------- 7. Parallax de scroll (molduras + imagens de fundo) ----------
     Ligado ao scroll (não ao ponteiro) — funciona também no mobile.
     'frame' = elemento flutuante ([data-parallax], ex.: retrato).
     'media' = imagem de fundo dentro de container recortado: recebe um
     leve zoom (scale) para que o deslocamento nunca revele bordas. */
  if (!reduced) {
    var pItems = [];
    Array.prototype.forEach.call(document.querySelectorAll("[data-parallax]"), function (el) {
      el.style.willChange = "transform";
      pItems.push({ el: el, box: el, type: "frame", speed: parseFloat(el.getAttribute("data-parallax")) || 0.1 });
    });
    var mediaSel = [
      "hero-desktop", "hero-mobile", "manifesto-leighton",
      "secaofinal-desktop", "closing-mobile", "diptych-couple", "diptych-desktop"
    ];
    mediaSel.forEach(function (key) {
      var img = document.querySelector('img[src*="' + key + '"]');
      if (!img || !img.parentElement) return;
      img.classList.add("parallax-media");
      pItems.push({ el: img, box: img.parentElement, type: "media", speed: 0.05 });
    });

    if (pItems.length) {
      var ticking = false;
      var update = function () {
        ticking = false;
        var vh = window.innerHeight;
        pItems.forEach(function (it) {
          var r = it.box.getBoundingClientRect();
          if (!r.height || r.bottom < -120 || r.top > vh + 120) return;
          var y = (r.top + r.height / 2 - vh / 2) * -it.speed;
          if (it.type === "media") {
            if (y > 26) y = 26; else if (y < -26) y = -26;
            it.el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0) scale(1.12)";
          } else {
            it.el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
          }
        });
      };
      window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      window.addEventListener("resize", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      update();
    }
  }

  /* ---------- 8. Barra de progresso de leitura ---------- */
  if (!reduced) {
    var bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var barTick = false;
    var updateBar = function () {
      barTick = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? doc.scrollTop / max : 0;
      if (p < 0) p = 0; else if (p > 1) p = 1;
      bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    };
    window.addEventListener("scroll", function () {
      if (!barTick) { barTick = true; requestAnimationFrame(updateBar); }
    }, { passive: true });
    window.addEventListener("resize", updateBar, { passive: true });
    updateBar();
  }

  /* ---------- #beneficios: hover editorial quente (lavagem + numeral + seta) ---------- */
  var bene = document.getElementById("beneficios");
  if (bene) {
    Array.prototype.forEach.call(bene.querySelectorAll("article.group"), function (card) {
      // lavagem quente ao fundo
      var wash = document.createElement("div");
      wash.className = "bene-wash";
      wash.setAttribute("aria-hidden", "true");
      card.insertBefore(wash, card.firstChild);
      // botão circular com seta no topo direito
      var topRow = card.querySelector(".flex.items-start.justify-between");
      if (topRow) {
        var arrow = document.createElement("span");
        arrow.className = "bene-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>';
        topRow.appendChild(arrow);
      }
    });
  }
})();
