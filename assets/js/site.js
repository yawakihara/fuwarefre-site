/*
 * FuwaRefre 共通スクリプト(全ページで読み込む)
 *
 * - グローバルメニュー・フッター・下部の購入導線・スマホの固定購入バーを、このファイル1か所で定義して表示する。
 * - 購入先・問い合わせ先のURLをここで一元管理する。URLが未確定のものは「準備中」と表示し、リンクにしない。
 * - 月額利用の価格枠の表示を切り替える(開始までは非表示)。
 *
 * メニュー項目やURLを変更するときは、このファイルの LINKS・FEATURES・NAV・FOOTER を編集する。
 */
(function () {
  "use strict";

  /**
   * 購入先・問い合わせ先のURL。
   * 空文字のものは各ページで「準備中」と表示される(誤ったリンクを公開しないため)。
   * 確定したらURLを入れるだけで、全ページのボタンがリンクに切り替わる。
   */
  const LINKS = {
    ec: "https://fuwarefre.com/", // 公式EC
    amazon: "", // Amazon 商品ページ(未定)
    rakuten: "", // 楽天市場 商品ページ(未定)
    line: "", // LINE公式アカウント(未定)
    form: "", // お問い合わせフォーム(未定)
  };

  /** 機能の公開設定。月額利用を始めたら monthlyPlan を true にする。 */
  const FEATURES = {
    monthlyPlan: false,
  };

  /** グローバルメニュー(仕様書 2.1 の指定順)。href はサイトのルートからの相対パス。 */
  const NAV = [
    { label: "技術", href: "technology/" },
    {
      label: "製品",
      href: "products/",
      index: "製品一覧",
      children: [
        { label: "MOKO", href: "products/moko/" },
        { label: "りふれサーバー", href: "products/server/" },
        { label: "りふれシャワー", href: "products/shower/" },
      ],
    },
    {
      label: "個人様向け",
      href: "personal/",
      index: "個人様向け一覧",
      wide: true,
      children: [
        { label: "飲み水に", href: "personal/drinking/" },
        { label: "料理", href: "personal/cooking/" },
        { label: "自宅介護", href: "personal/home-care/" },
        { label: "皮膚ケア", href: "personal/skin-care/" },
        { label: "ペットケア・ペット洗浄", href: "personal/pet/" },
        { label: "肌の記録・使用事例", href: "personal/skin-records/" },
        { label: "洗浄", href: "personal/cleaning/" },
        { label: "植物", href: "personal/plants/" },
        { label: "美容", href: "personal/beauty/" },
        { label: "お風呂", href: "personal/bath/" },
      ],
      extraLabel: "特集",
      extra: [
        { label: "防災・災害時", href: "personal/disaster/" },
        { label: "赤ちゃん・ベビーケア", href: "personal/baby/" },
        { label: "車・カーケア", href: "personal/car/" },
      ],
    },
    {
      label: "企業様向け",
      href: "business/",
      index: "企業様向け一覧",
      wide: true,
      children: [
        { label: "ホテル・旅館・宿泊施設", href: "business/hotel/" },
        { label: "介護・福祉・看護", href: "business/care/" },
        { label: "飲食・食品加工", href: "business/food/" },
        { label: "工場・製造ライン", href: "business/factory/" },
        { label: "プラント・水処理施設", href: "business/water-treatment/" },
        { label: "農業・養殖・畜産", href: "business/agriculture/" },
        { label: "ペットサロン", href: "business/pet-salon/" },
        { label: "美容サロン", href: "business/beauty-salon/" },
        { label: "エステサロン", href: "business/esthetic/" },
        { label: "整体", href: "business/seitai/" },
      ],
    },
    { label: "クラファン", href: "crowdfunding/" },
    { label: "会社概要", href: "company/" },
  ];

  /** メニュー末尾のボタン */
  const NAV_CTA = { label: "購入・お問い合わせ", href: "contact/" };

  /** フッターのリンク */
  const FOOTER = [
    {
      title: "製品",
      links: [
        { label: "製品一覧", href: "products/" },
        { label: "MOKO", href: "products/moko/" },
        { label: "りふれサーバー", href: "products/server/" },
        { label: "りふれシャワー", href: "products/shower/" },
        { label: "技術", href: "technology/" },
      ],
    },
    {
      title: "個人様向け",
      links: [{ label: "個人様向け一覧", href: "personal/" }].concat(NAV[2].children, NAV[2].extra),
    },
    {
      title: "企業様向け",
      links: [{ label: "企業様向け一覧", href: "business/" }].concat(NAV[3].children),
    },
    {
      title: "会社・お問い合わせ",
      links: [
        { label: "会社概要", href: "company/" },
        { label: "購入・お問い合わせ", href: "contact/" },
        { label: "代理店の皆さまへ(移行のご案内)", href: "partners/" },
        { label: "クラファン", href: "crowdfunding/" },
      ],
    },
  ];

  const SCRIPT = document.currentScript;
  /** サイトのルートURL(このファイルは assets/js/site.js に置く) */
  const ROOT = new URL("../../", SCRIPT ? SCRIPT.src : location.href).href;
  const IS_FILE = location.protocol === "file:";

  /**
   * ルートからの相対パスを、表示中の環境で開けるURLにする。
   * パソコン上でHTMLファイルを直接開いたとき(file:)は、フォルダーの index.html を付ける。
   * @param {string} path ルートからの相対パス
   * @returns {string} URL
   */
  function url(path) {
    let u = new URL(path, ROOT).href;
    if (IS_FILE && u.endsWith("/")) u += "index.html";
    return u;
  }

  /**
   * 比較用にURLを正規化する(index.html・クエリ・ハッシュを除く)。
   * @param {string} href URL
   * @returns {string} 正規化したURL
   */
  function normalize(href) {
    const u = new URL(href, location.href);
    return (u.origin + u.pathname).replace(/index\.html$/, "");
  }

  const HERE = normalize(location.href);
  const ROOT_N = normalize(ROOT);

  /**
   * 表示中のページかどうかを判定する。
   * @param {string} path ルートからの相対パス
   * @returns {boolean} 表示中なら true
   */
  function isCurrent(path) {
    return normalize(url(path)) === HERE;
  }

  /**
   * 表示中のページが、指定したメニューの配下にあるかを判定する。
   * @param {string} path ルートからの相対パス
   * @returns {boolean} 配下なら true
   */
  function isWithin(path) {
    const base = normalize(url(path));
    return base !== ROOT_N && HERE.indexOf(base) === 0;
  }

  /**
   * 表示中のページなら aria-current 属性を返す。
   * @param {string} path ルートからの相対パス
   * @returns {string} 属性の文字列
   */
  function current(path) {
    return isCurrent(path) ? ' aria-current="page"' : "";
  }

  const CHEVRON =
    '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const LOGO =
    '<svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fr-logo-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#43c7e8"/><stop offset="1" stop-color="#0a6aa1"/></linearGradient></defs>' +
    '<path d="M32 3C32 3 11 28 11 41.5a21 21 0 0 0 42 0C53 28 32 3 32 3Z" fill="url(#fr-logo-g)"/>' +
    '<circle cx="24.5" cy="43" r="6" fill="#fff" fill-opacity=".92"/><circle cx="37.5" cy="33" r="3.6" fill="#fff" fill-opacity=".85"/><circle cx="39" cy="48.5" r="2.4" fill="#fff" fill-opacity=".8"/></svg>';

  /**
   * サブメニューのリンク一覧を作る。
   * @param {{label: string, href: string}[]} items 項目
   * @returns {string} HTML
   */
  function subLinks(items) {
    return items
      .map(function (c) {
        return '<li><a class="subnav-link" href="' + url(c.href) + '"' + current(c.href) + ">" + c.label + "</a></li>";
      })
      .join("");
  }

  /**
   * ヘッダー(ロゴ・グローバルメニュー)のHTMLを作る。
   * @returns {string} HTML
   */
  function headerHtml() {
    const items = NAV.map(function (item, i) {
      if (!item.children) {
        return '<li class="gnav-item"><a class="gnav-link" href="' + url(item.href) + '"' + current(item.href) + ">" + item.label + "</a></li>";
      }
      const id = "subnav-" + i;
      let sub = '<ul class="subnav-list"><li><a class="subnav-link subnav-index" href="' + url(item.href) + '"' + current(item.href) + ">" + item.index + "</a></li>" + subLinks(item.children) + "</ul>";
      if (item.extra) {
        sub += '<span class="subnav-label">' + item.extraLabel + '</span><ul class="subnav-list">' + subLinks(item.extra) + "</ul>";
      }
      const within = isWithin(item.href) ? " is-current-parent" : "";
      return (
        '<li class="gnav-item has-sub' + within + '">' +
        '<a class="gnav-link" href="' + url(item.href) + '"' + current(item.href) + ">" + item.label + "</a>" +
        '<button class="sub-toggle" type="button" aria-expanded="false" aria-controls="' + id + '" aria-label="' + item.label + 'のメニューを開く">' + CHEVRON + "</button>" +
        '<div class="subnav' + (item.wide ? " subnav-wide" : "") + '" id="' + id + '">' + sub + "</div></li>"
      );
    }).join("");

    return (
      '<div class="container header-inner">' +
      '<a class="brand" href="' + url("") + '" aria-label="FuwaRefre トップページ">' + LOGO +
      '<span class="brand-name"><strong>FuwaRefre</strong><span>水から、よりよい未来を。</span></span></a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="gnav"><span class="nav-toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span><span>メニュー</span></button>' +
      '<nav class="gnav" id="gnav" aria-label="グローバルメニュー"><ul class="gnav-list">' + items + "</ul>" +
      '<a class="btn btn-primary btn-sm gnav-cta" href="' + url(NAV_CTA.href) + '"' + current(NAV_CTA.href) + ">" + NAV_CTA.label + "</a>" +
      '<div class="nav-buy-mobile"><a class="btn btn-primary btn-lg btn-block" href="' + url("contact/") + '">購入する</a></div>' +
      "</nav></div>"
    );
  }

  /**
   * ページ下部の購入導線(帯)のHTMLを作る。
   * @returns {string} HTML
   */
  function ctaHtml() {
    return (
      '<section class="cta-band" aria-labelledby="cta-band-title"><div class="container cta-band-inner">' +
      '<div><h2 id="cta-band-title">FuwaRefreの製品を、暮らしの中へ。</h2>' +
      "<p>公式ECをはじめ、ご購入いただける窓口をご案内しています。</p></div>" +
      '<div class="btn-row"><a class="btn btn-light btn-lg" href="' + url("contact/") + '">購入する</a>' +
      '<a class="btn btn-ghost-light" href="' + url("products/") + '">製品を見る</a></div>' +
      "</div></section>"
    );
  }

  /**
   * フッターのHTMLを作る。
   * @returns {string} HTML
   */
  function footerHtml() {
    const cols = FOOTER.map(function (col) {
      const links = col.links
        .map(function (l) {
          return '<li><a href="' + url(l.href) + '"' + current(l.href) + ">" + l.label + "</a></li>";
        })
        .join("");
      return '<div class="footer-col"><h2>' + col.title + "</h2><ul>" + links + "</ul></div>";
    }).join("");
    const year = new Date().getFullYear();
    return (
      '<div class="container">' +
      '<div class="footer-top"><div class="footer-brand"><a class="brand" href="' + url("") + '">' + LOGO +
      '<span class="brand-name"><strong>FuwaRefre</strong><span>水から、よりよい未来を。</span></span></a>' +
      "<p>株式会社FuwaRefre</p></div>" + cols + "</div>" +
      '<p class="footer-partner">代理店の皆さまへ:新たな代理店募集は行っていません。具体的な移行やお取扱いは個別にご案内します。' +
      ' <a href="' + url("partners/") + '">移行のご案内</a></p>' +
      '<ul class="footer-notes">' +
      "<li>掲載している使用事例・お客様の声は、個人の感想や記録です。効果・効能を保証するものではありません。</li>" +
      "<li>掲載している数値は、当社測定条件による実測例です。使用条件や測定条件によって異なります。</li>" +
      "<li>当社製品は医薬品・医療機器ではありません。体調や皮膚に気になる症状がある場合は、医師・獣医師にご相談ください。</li>" +
      "</ul>" +
      '<p class="copyright">© ' + year + " 株式会社FuwaRefre</p>" +
      "</div>"
    );
  }

  /**
   * スマホ画面下の固定購入バーのHTMLを作る。
   * @returns {string} HTML
   */
  function buybarHtml() {
    return (
      '<div class="buybar-text"><strong>FuwaRefre 公式</strong>製品のご購入・お問い合わせ</div>' +
      '<a class="btn btn-primary" href="' + url("contact/") + '">購入する</a>'
    );
  }

  /** ヘッダー・フッター・購入導線を差し込む。 */
  function renderChrome() {
    const header = document.getElementById("site-header");
    if (header) header.innerHTML = headerHtml();

    const footer = document.getElementById("site-footer");
    if (footer) {
      if (!document.body.hasAttribute("data-no-cta")) footer.insertAdjacentHTML("beforebegin", ctaHtml());
      footer.innerHTML = footerHtml();
    }

    const bar = document.createElement("div");
    bar.className = "buybar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "購入のご案内");
    bar.innerHTML = buybarHtml();
    document.body.appendChild(bar);
  }

  /** メニューの開閉(ハンバーガー・サブメニュー)を設定する。 */
  function setupMenu() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("gnav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll(".sub-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const item = btn.closest(".has-sub");
        const open = btn.getAttribute("aria-expanded") !== "true";
        nav.querySelectorAll(".has-sub.is-open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("is-open");
            other.querySelector(".sub-toggle").setAttribute("aria-expanded", "false");
          }
        });
        item.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      });
    });

    // スマホでは、表示中のページを含むサブメニューを開いておく
    const parent = nav.querySelector(".has-sub.is-current-parent");
    if (parent && window.matchMedia("(max-width: 1079.98px)").matches) {
      parent.classList.add("is-open");
      parent.querySelector(".sub-toggle").setAttribute("aria-expanded", "true");
    }

    function closeSubs() {
      nav.querySelectorAll(".has-sub.is-open").forEach(function (item) {
        item.classList.remove("is-open");
        item.querySelector(".sub-toggle").setAttribute("aria-expanded", "false");
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (nav.classList.contains("is-open")) {
          setOpen(false);
          toggle.focus();
        }
        closeSubs();
      }
    });

    document.addEventListener("click", function (e) {
      if (window.matchMedia("(min-width: 1080px)").matches && !nav.contains(e.target)) closeSubs();
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    window.matchMedia("(min-width: 1080px)").addEventListener("change", function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /**
   * data-link の付いた購入・問い合わせボタンを、LINKS の設定に合わせて切り替える。
   * URLが空なら「準備中」(リンクなし)、URLがあれば別タブで開くリンクにする。
   */
  function applyLinks() {
    document.querySelectorAll("[data-link]").forEach(function (el) {
      const key = el.getAttribute("data-link");
      const href = LINKS[key] || "";
      const label = el.getAttribute("data-label") || el.textContent.replace("準備中", "").trim();
      const extra = (el.getAttribute("data-class") || "btn-primary").split(" ");
      let node;
      if (href) {
        node = document.createElement("a");
        node.href = href;
        node.target = "_blank";
        node.rel = "noopener";
        node.className = el.className.replace("btn-pending", "").trim();
        extra.forEach(function (c) {
          node.classList.add(c);
        });
        node.textContent = label;
      } else {
        node = document.createElement("span");
        node.className = "btn btn-pending" + (el.classList.contains("btn-block") ? " btn-block" : "") + (el.classList.contains("btn-lg") ? " btn-lg" : "");
        node.setAttribute("aria-disabled", "true");
        node.textContent = label;
        const badge = document.createElement("small");
        badge.textContent = "準備中";
        node.appendChild(badge);
      }
      node.setAttribute("data-link", key);
      node.setAttribute("data-label", label);
      node.setAttribute("data-class", extra.join(" "));
      el.replaceWith(node);
    });
  }

  /** 月額利用の価格枠を、設定に合わせて表示・非表示にする。 */
  function applyFeatures() {
    document.querySelectorAll(".plan-monthly").forEach(function (el) {
      el.hidden = !FEATURES.monthlyPlan;
    });
  }

  /** パソコン上で直接開いたとき(file:)も、フォルダーへのリンクが開けるようにする。 */
  function fixFileLinks() {
    if (!IS_FILE) return;
    document.querySelectorAll("a[href]").forEach(function (a) {
      const raw = a.getAttribute("href");
      if (/^(https?:|mailto:|tel:|#)/.test(raw)) return;
      if (raw.endsWith("/") || raw === "." || raw === "..") {
        a.setAttribute("href", (raw.endsWith("/") ? raw : raw + "/") + "index.html");
      }
    });
  }

  renderChrome();
  setupMenu();
  applyLinks();
  applyFeatures();
  fixFileLinks();
})();
