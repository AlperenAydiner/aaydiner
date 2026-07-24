// alperenaydiner — script.js
// Sol menü aç/kapa + koyu/açık tema geçişi (tercih localStorage'da saklanır)

(function () {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored) root.setAttribute('data-theme', stored);

  document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.menu-btn');
    const closeBtn = document.querySelector('.nav-close');
    const overlay = document.querySelector('.nav-overlay');
    const sideNav = document.querySelector('.side-nav');
    const themeBtn = document.querySelector('.theme-btn');

    function openNav() {
      sideNav.classList.add('open');
      overlay.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
      sideNav.querySelector('a, button')?.focus();
    }
    function closeNav() {
      sideNav.classList.remove('open');
      overlay.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }

    menuBtn?.addEventListener('click', openNav);
    closeBtn?.addEventListener('click', closeNav);
    overlay?.addEventListener('click', closeNav);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    themeBtn?.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', 'light');
      }
      localStorage.setItem('theme', next);
    });

    initIdeaShare();
  });

  // ---- Blog: "fikrini paylaş" — ziyaretçi yazıları, beğeni, yorum ----
  // Not: sunucu tarafı olmadığından yazılar sadece bu tarayıcıda (localStorage) saklanır.
  function initIdeaShare() {
    const form = document.getElementById('idea-form');
    if (!form) return;

    const STORAGE_KEY = 'blogIdeaPosts';
    const MAX_TITLE = 80;
    const MAX_BODY = 2000;
    const MAX_COMMENT = 300;
    const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
    const PHOTO_MAX_DIMENSION = 1000;

    const titleInput = document.getElementById('idea-title');
    const bodyInput = document.getElementById('idea-body');
    const photoInput = document.getElementById('idea-photo');
    const photoPreviewWrap = document.getElementById('idea-photo-preview');
    const photoPreviewImg = document.getElementById('idea-photo-preview-img');
    const photoRemoveBtn = document.getElementById('idea-photo-remove');
    const msgEl = document.getElementById('idea-form-msg');
    const submitBtn = form.querySelector('.idea-submit');
    const postList = document.getElementById('post-list');
    const emptyState = document.getElementById('post-list-empty');

    let pendingPhoto = null;

    function loadPosts() {
      try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    function savePosts(posts) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        return true;
      } catch {
        return false;
      }
    }

    function makeId() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    }

    function formatDate(iso) {
      try {
        return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch {
        return '';
      }
    }

    function setMsg(text, isError) {
      msgEl.textContent = text;
      msgEl.classList.toggle('is-error', !!isError);
    }

    function clearPhoto() {
      pendingPhoto = null;
      photoInput.value = '';
      photoPreviewWrap.hidden = true;
      photoPreviewImg.src = '';
    }

    photoInput?.addEventListener('change', () => {
      const file = photoInput.files && photoInput.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setMsg('Lütfen bir görsel dosyası seç.', true);
        photoInput.value = '';
        return;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setMsg('Fotoğraf çok büyük (maksimum 8MB).', true);
        photoInput.value = '';
        return;
      }
      setMsg('', false);
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, PHOTO_MAX_DIMENSION / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        pendingPhoto = canvas.toDataURL('image/jpeg', 0.82);
        photoPreviewImg.src = pendingPhoto;
        photoPreviewWrap.hidden = false;
        URL.revokeObjectURL(objectUrl);
      };
      img.onerror = () => {
        setMsg('Fotoğraf okunamadı, tekrar dene.', true);
        URL.revokeObjectURL(objectUrl);
        photoInput.value = '';
      };
      img.src = objectUrl;
    });

    photoRemoveBtn?.addEventListener('click', clearPhoto);

    function buildCommentList(post) {
      const ul = document.createElement('ul');
      ul.className = 'comment-list';
      post.comments.forEach((c) => {
        const li = document.createElement('li');
        li.className = 'comment-item';
        const p = document.createElement('p');
        p.textContent = c.text;
        const span = document.createElement('span');
        span.className = 'comment-date';
        span.textContent = formatDate(c.date);
        li.appendChild(p);
        li.appendChild(span);
        ul.appendChild(li);
      });
      return ul;
    }

    function buildPostCard(post) {
      const li = document.createElement('li');
      li.className = 'post-card';
      li.dataset.id = post.id;

      const head = document.createElement('div');
      head.className = 'post-card-head';
      const idxSpan = document.createElement('span');
      idxSpan.className = 'idx';
      idxSpan.textContent = 'Ziyaretçi kaydı';
      const dateSpan = document.createElement('span');
      dateSpan.className = 'post-date';
      dateSpan.textContent = formatDate(post.date);
      head.appendChild(idxSpan);
      head.appendChild(dateSpan);
      li.appendChild(head);

      const h2 = document.createElement('h2');
      h2.textContent = post.title;
      li.appendChild(h2);

      if (post.photo) {
        const img = document.createElement('img');
        img.className = 'post-photo';
        img.src = post.photo;
        img.alt = '';
        img.loading = 'lazy';
        li.appendChild(img);
      }

      const bodyP = document.createElement('p');
      bodyP.className = 'post-body';
      bodyP.textContent = post.body;
      li.appendChild(bodyP);

      const actions = document.createElement('div');
      actions.className = 'post-actions';

      const likeBtn = document.createElement('button');
      likeBtn.type = 'button';
      likeBtn.className = 'like-btn' + (post.likedByMe ? ' liked' : '');
      likeBtn.setAttribute('aria-pressed', String(!!post.likedByMe));
      likeBtn.setAttribute('aria-label', 'Beğen');
      likeBtn.innerHTML = '<span class="like-icon" aria-hidden="true">♥</span>';
      const likeCount = document.createElement('span');
      likeCount.className = 'like-count';
      likeCount.textContent = String(post.likes);
      likeBtn.appendChild(likeCount);

      const commentsId = 'comments-' + post.id;
      const commentToggle = document.createElement('button');
      commentToggle.type = 'button';
      commentToggle.className = 'comment-toggle';
      commentToggle.setAttribute('aria-expanded', 'false');
      commentToggle.setAttribute('aria-controls', commentsId);
      commentToggle.innerHTML = '<span class="comment-icon" aria-hidden="true">💬</span>';
      const commentCount = document.createElement('span');
      commentCount.className = 'comment-count';
      commentCount.textContent = post.comments.length + ' yorum';
      commentToggle.appendChild(commentCount);

      actions.appendChild(likeBtn);
      actions.appendChild(commentToggle);
      li.appendChild(actions);

      const commentsWrap = document.createElement('div');
      commentsWrap.id = commentsId;
      commentsWrap.className = 'post-comments';
      commentsWrap.hidden = true;
      commentsWrap.appendChild(buildCommentList(post));

      const commentForm = document.createElement('form');
      commentForm.className = 'comment-form';
      const commentInput = document.createElement('input');
      commentInput.type = 'text';
      commentInput.placeholder = 'Yorumunu yaz...';
      commentInput.maxLength = MAX_COMMENT;
      commentInput.required = true;
      commentInput.setAttribute('aria-label', 'Yorumunu yaz');
      const commentSubmit = document.createElement('button');
      commentSubmit.type = 'submit';
      commentSubmit.textContent = 'Gönder';
      commentForm.appendChild(commentInput);
      commentForm.appendChild(commentSubmit);
      commentsWrap.appendChild(commentForm);

      li.appendChild(commentsWrap);
      return li;
    }

    function renderPosts() {
      const posts = loadPosts();
      postList.querySelectorAll('.post-card').forEach((el) => el.remove());
      if (emptyState) emptyState.hidden = posts.length > 0;
      posts.forEach((post) => postList.appendChild(buildPostCard(post)));
    }

    postList?.addEventListener('click', (e) => {
      const likeBtn = e.target.closest('.like-btn');
      if (likeBtn) {
        const card = likeBtn.closest('.post-card');
        const posts = loadPosts();
        const post = posts.find((p) => p.id === card.dataset.id);
        if (!post) return;
        post.likedByMe = !post.likedByMe;
        post.likes += post.likedByMe ? 1 : -1;
        if (!savePosts(posts)) return;
        likeBtn.classList.toggle('liked', post.likedByMe);
        likeBtn.setAttribute('aria-pressed', String(post.likedByMe));
        likeBtn.querySelector('.like-count').textContent = String(post.likes);
        return;
      }

      const commentToggle = e.target.closest('.comment-toggle');
      if (commentToggle) {
        const wrap = commentToggle.closest('.post-card').querySelector('.post-comments');
        wrap.hidden = !wrap.hidden;
        commentToggle.setAttribute('aria-expanded', String(!wrap.hidden));
        if (!wrap.hidden) wrap.querySelector('input')?.focus();
      }
    });

    postList?.addEventListener('submit', (e) => {
      const commentForm = e.target.closest('.comment-form');
      if (!commentForm) return;
      e.preventDefault();

      const card = commentForm.closest('.post-card');
      const input = commentForm.querySelector('input');
      const text = input.value.trim().slice(0, MAX_COMMENT);
      if (!text) return;

      const posts = loadPosts();
      const post = posts.find((p) => p.id === card.dataset.id);
      if (!post) return;
      post.comments.push({ text, date: new Date().toISOString() });
      if (!savePosts(posts)) return;

      const wrap = card.querySelector('.post-comments');
      wrap.querySelector('.comment-list').replaceWith(buildCommentList(post));
      card.querySelector('.comment-count').textContent = post.comments.length + ' yorum';
      input.value = '';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = titleInput.value.trim().slice(0, MAX_TITLE);
      const body = bodyInput.value.trim().slice(0, MAX_BODY);

      if (!title) {
        setMsg('Bir başlık yaz.', true);
        titleInput.focus();
        return;
      }
      if (!body) {
        setMsg('Birkaç cümle de yazman gerekiyor.', true);
        bodyInput.focus();
        return;
      }

      submitBtn.disabled = true;
      const posts = loadPosts();
      posts.unshift({
        id: makeId(),
        title,
        body,
        photo: pendingPhoto,
        date: new Date().toISOString(),
        likes: 0,
        likedByMe: false,
        comments: [],
      });

      const ok = savePosts(posts);
      submitBtn.disabled = false;

      if (!ok) {
        setMsg('Kaydedilemedi — tarayıcı depolama alanı dolu olabilir (özellikle büyük fotoğraflarda).', true);
        return;
      }

      form.reset();
      clearPhoto();
      setMsg('Yazın yayınlandı.', false);
      renderPosts();
    });

    renderPosts();
  }
})();
