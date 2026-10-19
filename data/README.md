# `news.json` — haber veri dosyası

`haberler.html` sayfası bu dosyayı okuyup haber listesini oluşturur. **Sayfanın HTML'ine dokunmaya gerek yok** — yeni haber eklemek için yalnızca bu dosyaya bir kayıt eklenir.

## Kural

- Dosya, tek bir **JSON dizisi** (`[ ... ]`) içerir.
- Her haber, dizinin bir elemanı olan bir nesnedir.
- Yeni haber dizinin **başına veya sonuna** eklenebilir; sayfa kayıtları `date` alanına göre kendisi sıralar (en yeni en üstte).
- Dosya her zaman geçerli JSON olmalıdır. Bozuk JSON yazılırsa sayfa haberleri gösteremez, bunun yerine bir hata mesajı gösterir.

## Alanlar

| Alan | Zorunlu | Açıklama |
|---|---|---|
| `date` | ✅ | `YYYY-MM-DD` biçiminde tarih. Sıralama bu alana göre yapılır. |
| `title` | ✅ | Haber başlığı. Düz metin. |
| `body` | ✅ | Haber metni. Aşağıdaki üç biçimden biri. |
| `category` | — | Kısa etiket (örn. `"Yapay Zeka"`, `"Veri Bilimi"`, `"Araştırma"`). |
| `summary` | — | 1-2 cümlelik giriş. Başlığın hemen altında vurgulu gösterilir. |
| `source` | — | `{ "name": "...", "url": "https://..." }`. Yazının sonunda kaynak linki olarak çıkar. |

### `body` için üç biçim

**1) Düz metin** — boş satırla ayrılan her parça bir paragraf olur:

```json
"body": "Birinci paragraf.\n\nİkinci paragraf."
```

**2) Paragraf dizisi** — her eleman bir paragraf:

```json
"body": ["Birinci paragraf.", "İkinci paragraf."]
```

**3) Blok dizisi** — ara başlık ve liste gerektiğinde:

```json
"body": [
  { "type": "p",  "text": "Giriş paragrafı." },
  { "type": "h3", "text": "Ara başlık" },
  { "type": "p",  "text": "Başlık altındaki paragraf." },
  { "type": "ul", "items": ["Madde bir", "Madde iki"] },
  { "type": "ol", "items": ["Birinci adım", "İkinci adım"] }
]
```

Desteklenen `type` değerleri: `p`, `h3`, `ul`, `ol`. Tanınmayan bir tip paragraf olarak işlenir.

## Tam örnek

```json
[
  {
    "date": "2026-10-19",
    "title": "Örnek haber başlığı",
    "category": "Yapay Zeka",
    "summary": "Haberin özünü bir iki cümlede veren giriş.",
    "body": [
      { "type": "p", "text": "Haberin ilk paragrafı." },
      { "type": "h3", "text": "Detaylar" },
      { "type": "p", "text": "Ayrıntıları anlatan paragraf." },
      { "type": "ul", "items": ["Önemli nokta", "Diğer nokta"] }
    ],
    "source": { "name": "Kaynak Adı", "url": "https://ornek.com/haber" }
  }
]
```

## Notlar

- Metinler **düz metin** olarak işlenir; HTML etiketi yazmak işe yaramaz, etiketler olduğu gibi görünür. Bu kasıtlıdır (sayfanın bozulmasını ve HTML enjeksiyonunu önler).
- `source.url` yalnızca `http://` veya `https://` ile başlıyorsa link olarak gösterilir.
- Eksik veya hatalı alanı olan kayıtlar atlanır, diğer haberler normal görünmeye devam eder.
