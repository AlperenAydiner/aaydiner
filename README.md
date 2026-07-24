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
Site şu repoda tutuluyor: [github.com/AlperenAydiner/aaydiner](https://github.com/AlperenAydiner/aaydiner).

1. Repo → **Settings → Pages** sekmesine git.
2. **Source**: "Deploy from a branch" · **Branch**: `main` · **Folder**: `/ (root)` seç, kaydet.
3. Birkaç dakika içinde site **https://alperenaydiner.github.io/aaydiner/** adresinde yayında olur.

Repo adı `alperenaydiner.github.io` olmadığı için site kök domainde değil, `/aaydiner/` alt yolunda yayınlanır.

## Kendi alan adını bağlamak
1. Bir alan adı satın al (Namecheap, GoDaddy, natro vb.).
2. Alan adı sağlayıcında DNS ayarlarına git, GitHub Pages'in IP adreslerini A kaydı olarak ekle (GitHub'ın "Settings → Pages → Custom domain" bölümü sana tam adımları gösterir).
3. Aynı ekranda custom domain kutusuna alan adını yaz, kaydet.

## Yeni proje/yazı eklemek
Bu klasör artık git deposu ve GitHub'daki `aaydiner` reposuna bağlı. Bana "şu projeyi ekle" dediğinde ilgili dosyayı düzenlerim, ardından değişikliği `git commit` + `git push` ile GitHub'a gönderirim (her push öncesi senden onay alarak) — birkaç dakika içinde site otomatik güncellenir.
