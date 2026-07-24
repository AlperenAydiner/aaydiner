# alperenaydiner.com — site kaynak kodu

## Klasör yapısı
```
index.html      → Anasayfa
projects.html   → Projeler (şu an boş)
blog.html       → Blog (şu an boş)
about.html      → Hakkımda
css/style.css   → Tüm tasarım
js/script.js    → Menü + tema geçişi
CNAME           → Özel alan adı (GitHub Pages için)
```

## GitHub Pages ile yayınlama
Site şu repoda tutuluyor: [github.com/AlperenAydiner/aaydiner](https://github.com/AlperenAydiner/aaydiner).

1. Repo → **Settings → Pages** sekmesine git.
2. **Source**: "Deploy from a branch" · **Branch**: `main` · **Folder**: `/ (root)` seç, kaydet.
3. Birkaç dakika içinde site **https://alperenaydiner.github.io/aaydiner/** adresinde yayında olur (repo adı `alperenaydiner.github.io` olmadığı için kök domainde değil, `/aaydiner/` alt yolunda).

## Özel alan adı: alperenaydiner.com
Domain Namecheap'ten satın alındı ve DNS ayarları yapıldı:

| Type | Host | Value |
|---|---|---|
| A Record | @ | 185.199.108.153 |
| A Record | @ | 185.199.109.153 |
| A Record | @ | 185.199.110.153 |
| A Record | @ | 185.199.111.153 |
| CNAME Record | www | alperenaydiner.github.io |

Repo kökündeki `CNAME` dosyası (içeriği tek satır `www.alperenaydiner.com`) GitHub Pages'e hangi custom domain'in birincil olduğunu söylüyor. DNS doğrulaması geçtikten sonra repo → **Settings → Pages** ekranında **"Enforce HTTPS"** kutusu işaretlenebilir hale gelir (GitHub'ın Let's Encrypt sertifikası otomatik oluşur, birkaç saat sürebilir).

Sonuç: **https://www.alperenaydiner.com** birincil adres, **alperenaydiner.com** ona yönleniyor.

## Yeni proje/yazı eklemek
Bu klasör artık git deposu ve GitHub'daki `aaydiner` reposuna bağlı. Bana "şu projeyi ekle" dediğinde ilgili dosyayı düzenlerim, ardından değişikliği `git commit` + `git push` ile GitHub'a gönderirim (her push öncesi senden onay alarak) — birkaç dakika içinde site otomatik güncellenir.
