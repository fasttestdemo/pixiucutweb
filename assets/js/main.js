/* ================= PixiuCut 官网交互 =================
   多页静态结构：内容按语言静态渲染在各自 HTML 中，
   语言切换由页面顶部的链接完成（跳转到对应语言页面），
   本脚本只负责通用交互，不再做运行时 i18n 文案替换。
   ==================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var isZh = (document.documentElement.lang || "zh").toLowerCase().indexOf("zh") === 0;

    /* ---------- 移动端菜单 ---------- */
    var burger = document.getElementById("navBurger");
    var nav = document.getElementById("mainNav");
    if (burger && nav) {
      burger.addEventListener("click", function () { nav.classList.toggle("open"); });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { nav.classList.remove("open"); });
      });
    }

    /* ---------- 顶栏滚动阴影 ---------- */
    var header = document.getElementById("siteHeader");
    if (header) {
      var onScroll = function () {
        if (window.scrollY > 8) header.classList.add("scrolled");
        else header.classList.remove("scrolled");
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ---------- 下载：弹出网盘地址（当前仅支持网盘下载） ---------- */
    var downloadLinks = [
      { name: "链接1", label: "百度网盘", url: "https://pan.baidu.com/s/1AdJC-N6r5wriSUsiA9xBdw?pwd=6p1d", code: "6p1d" },
      { name: "链接2", label: "夸克网盘", url: "https://pan.quark.cn/s/596c941298f8" }
    ];

    function openDownloadModal() {
      if (document.getElementById("dlModal")) return;

      var title = isZh ? "PixiuCut 软件下载地址" : "PixiuCut Download";
      var tip = isZh ? "当前仅支持网盘下载，请选择以下任一链接：" : "Downloads are currently available via cloud drives. Choose a link below:";
      var codeLabel = isZh ? "提取码" : "Code";
      var copyLabel = isZh ? "复制" : "Copy";
      var copiedLabel = isZh ? "已复制" : "Copied";

      var rows = downloadLinks.map(function (l, i) {
        var codeHtml = l.code
          ? '<span class="dl-code">' + codeLabel + '：<b>' + l.code + '</b></span>'
          : "";
        return '' +
          '<div class="dl-row">' +
            '<div class="dl-row-head"><span class="dl-row-name">' + l.name + '</span><span class="dl-row-label">' + l.label + '</span></div>' +
            '<div class="dl-row-body">' +
              '<a class="dl-url" href="' + l.url + '" target="_blank" rel="noopener">' + l.url + '</a>' +
              codeHtml +
              '<button type="button" class="btn btn-ghost btn-sm dl-copy" data-copy="' + l.url + '">' + copyLabel + '</button>' +
            '</div>' +
          '</div>';
      }).join("");

      var modal = document.createElement("div");
      modal.id = "dlModal";
      modal.className = "dl-modal";
      modal.innerHTML =
        '<div class="dl-modal-mask" data-close></div>' +
        '<div class="dl-modal-box" role="dialog" aria-modal="true" aria-label="' + title + '">' +
          '<button type="button" class="dl-modal-close" data-close aria-label="close">×</button>' +
          '<h3 class="dl-modal-title">' + title + '</h3>' +
          '<p class="dl-modal-tip">' + tip + '</p>' +
          rows +
        '</div>';
      document.body.appendChild(modal);

      function close() { modal.remove(); document.removeEventListener("keydown", onKey); }
      function onKey(e) { if (e.key === "Escape") close(); }
      modal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) close(); });
      document.addEventListener("keydown", onKey);

      modal.querySelectorAll(".dl-copy").forEach(function (b) {
        b.addEventListener("click", function () {
          var text = b.getAttribute("data-copy");
          var done = function () { var old = b.textContent; b.textContent = copiedLabel; setTimeout(function () { b.textContent = old; }, 1500); };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(function () {});
          } else {
            var ta = document.createElement("textarea");
            ta.value = text; document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); done(); } catch (err) {}
            ta.remove();
          }
        });
      });
    }

    document.querySelectorAll("[data-download]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openDownloadModal();
      });
    });

    /* ---------- 购买占位提示 ---------- */
    document.querySelectorAll("[data-buy]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var href = btn.getAttribute("href");
        if (!href || href === "#") {
          e.preventDefault();
          alert(isZh ? "购买通道即将开放，请通过页面下方的联系方式咨询购买。"
                     : "Purchasing will open soon. Please use the contact below to buy a license.");
        }
      });
    });

    /* ---------- 滚动进入动画 ---------- */
    var revealEls = document.querySelectorAll(
      ".card, .show-item, .dl-card, .faq-item, .plugins-box, .hero-copy, .hero-mock, " +
      ".video-card, .price-card, .license-item, .buy-box"
    );
    revealEls.forEach(function (el) { el.setAttribute("data-reveal", ""); });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---------- 文档页目录高亮（scrollspy） ---------- */
    var tocLinks = document.querySelectorAll(".docs-toc a");
    if (tocLinks.length && "IntersectionObserver" in window) {
      var headings = [];
      tocLinks.forEach(function (a) {
        var id = a.getAttribute("href");
        if (id && id.charAt(0) === "#") {
          var el = document.getElementById(id.slice(1));
          if (el) headings.push(el);
        }
      });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            tocLinks.forEach(function (a) {
              a.classList.toggle("active", a.getAttribute("href") === "#" + id);
            });
          }
        });
      }, { rootMargin: "-80px 0px -70% 0px", threshold: 0 });
      headings.forEach(function (h) { spy.observe(h); });
    }

    /* ---------- 版权信息 ---------- */
    document.getElementById("footer-bottom").innerHTML = `© ${new Date().getFullYear()} PixiuCut. 保留所有权利。 `;
  });
})();
