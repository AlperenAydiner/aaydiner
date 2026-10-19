// alperenaydiner — news.js
// data/news.json dosyasını okuyup haber listesini oluşturur.
// Metinler textContent ile basılır: veri dosyasındaki içerik sayfanın yapısını bozamaz.

(function () {
  const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

  function formatDate(value) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value ?? '');
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  function slugify(text) {
    const map = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };
    return String(text).toLowerCase()
      .replace(/[çğıöşü]/g, (c) => map[c])
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  // Sadece http(s) adreslerini link olarak kabul et
  function safeUrl(url) {
    try {
      const u = new URL(url, location.href);
      return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : null;
    } catch {
      return null;
    }
  }

  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  // body alanını tek bir blok dizisine indirger (düz metin / paragraf dizisi / blok dizisi)
  function normalizeBody(body) {
    if (typeof body === 'string') {
      return body.split(/\n\s*\n/).map((t) => ({ type: 'p', text: t.trim() })).filter((b) => b.text);
    }
    if (!Array.isArray(body)) return [];
    return body.map((block) => {
      if (typeof block === 'string') return { type: 'p', text: block };
      if (block && typeof block === 'object') return block;
      return null;
    }).filter(Boolean);
  }

  function renderBlock(block) {
    const type = String(block.type || 'p').toLowerCase();

    if (type === 'ul' || type === 'ol') {
      const items = Array.isArray(block.items) ? block.items : [];
      if (!items.length) return null;
      const list = el(type);
      items.forEach((item) => list.appendChild(el('li', String(item))));
      return list;
    }

    const text = block.text ?? block.content ?? '';
    if (!String(text).trim()) return null;
    return el(type === 'h3' ? 'h3' : 'p', String(text));
  }

  function renderItem(item) {
    const li = el('li', null, 'post');
    const anchor = item.id || `${item.date || ''}-${slugify(item.title)}`;
    if (anchor) li.id = slugify(anchor);

    const meta = el('div', null, 'post-meta');
    meta.appendChild(el('span', formatDate(item.date), 'post-date'));
    if (item.category) meta.appendChild(el('span', item.category, 'post-cat'));
    li.appendChild(meta);

    li.appendChild(el('h2', String(item.title)));

    const body = el('div', null, 'post-body');
    if (item.summary) body.appendChild(el('p', String(item.summary), 'post-lede'));
    normalizeBody(item.body).forEach((block) => {
      const node = renderBlock(block);
      if (node) body.appendChild(node);
    });

    const url = item.source && safeUrl(item.source.url);
    if (url) {
      const link = el('a', `${item.source.name || 'Kaynak'} ↗`, 'post-source');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      body.appendChild(link);
    }

    li.appendChild(body);
    return li;
  }

  function showNotice(list, heading, message) {
    const box = el('div', null, 'log-empty');
    box.appendChild(el('span', 'haberler', 'idx'));
    box.appendChild(el('h2', heading));
    box.appendChild(el('p', message));
    list.replaceWith(box);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const list = document.querySelector('#news-list');
    if (!list) return;

    fetch('data/news.json', { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const items = (Array.isArray(data) ? data : data.items || [])
          .filter((item) => item && item.title && item.body)
          .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

        if (!items.length) {
          showNotice(list, 'Henüz haber yok', 'Bu sayfa her gün otomatik olarak güncelleniyor. İlk kayıtlar eklendiğinde burada görünecek.');
          return;
        }

        const frag = document.createDocumentFragment();
        items.forEach((item) => frag.appendChild(renderItem(item)));
        list.appendChild(frag);
      })
      .catch(() => {
        showNotice(list, 'Haberler yüklenemedi', 'Veri dosyası şu anda okunamıyor. Sayfayı birazdan tekrar deneyebilirsin.');
      });
  });
})();
