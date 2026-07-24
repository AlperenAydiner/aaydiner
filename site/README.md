# alperenaydiner.com — site kaynak kodu

## Klasör yapısı
```
index.html      → Anasayfa
projects.html   → Projeler (şu an boş)
blog.html       → Blog (şu an boş)
about.html      → Hakkımda
css/style.css   → Tüm tasarım
js/script.js    → Menü + tema geçişi
```

## GitHub Pages ile yayınlama
1. GitHub'da yeni bir repo aç, örneğin `alperenaydiner.github.io` (kullanıcı adınla birebir aynı olursa otomatik ana adresin olur).
2. Bu klasördeki tüm dosyaları o repoya yükle (GitHub üzerinden "Add file → Upload files" ile sürükle-bırak yapabilirsin, komut satırı gerekmez).
3. Repo → **Settings → Pages** sekmesine git, "Branch" olarak `main` seç, kaydet.
4. Birkaç dakika içinde site `https://kullaniciadin.github.io` adresinde yayında olur.

## Kendi alan adını bağlamak
1. Bir alan adı satın al (Namecheap, GoDaddy, natro vb.).
2. Alan adı sağlayıcında DNS ayarlarına git, GitHub Pages'in IP adreslerini A kaydı olarak ekle (GitHub'ın "Settings → Pages → Custom domain" bölümü sana tam adımları gösterir).
3. Aynı ekranda custom domain kutusuna alan adını yaz, kaydet.

## Yeni proje/yazı eklemek
Bu adımı birlikte yaparız — bana "şu projeyi ekle" dediğinde ilgili HTML dosyasını düzenlerim, sen değişikliği GitHub'a yüklersin, site otomatik güncellenir.
