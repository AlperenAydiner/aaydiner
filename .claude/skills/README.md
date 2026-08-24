# Kurulan analiz becerileri (skills)

Bu klasördeki skill'ler üç kaynak repodan kuruldu:

## 1. [nimrodfisher/data-analytics-skills](https://github.com/nimrodfisher/data-analytics-skills)
31 adet veri analitiği skill'i (EDA, kalite kontrolü, kohort/funnel/segmentasyon analizi,
A/B test, dashboard/rapor üretimi, paydaş iletişimi vb.). Orijinal repoda `NN-kategori/skill-adı/`
şeklinde gruplanmıştı; burada Claude Code'un `.claude/skills/<skill-adı>/` beklediği düz yapıya
göre kopyalandı. İki skill (`metric-reconciliation`, `schema-mapper`) iki kategoride birebir
neredeyse aynı içerikle tekrar ediyordu — tekilleştirilip tek kopya bırakıldı (data-quality-validation
sürümü).

## 2. [Giro03k/claude-statistical-analysis-skill](https://github.com/Giro03k/claude-statistical-analysis-skill)
`statistical-analysis` skill'i: veri profili çıkarma, varsayım testleri, otomatik yöntem seçimi
(t-test/ANOVA/regresyon/SEM vb.) ve APA formatında rapor üretimi. Dağıtım için paketlenmiş
`.zip` dosyası (kaynakların birebir kopyası) alınmadı; skill zaten açık kaynak dosyalarıyla kuruldu.

## 3. [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop)
`stop-slop` skill'i: yazılan/düzenlenen metinden tipik AI yazım kalıplarını (dolgu ifadeler,
formülsel yapılar, pasif çatı, em-dash aşırı kullanımı, jenerik "quotable" cümleler vb.) temizler.

## 4. [YYH211/claude-meta-skill](https://github.com/YYH211/claude-meta-skill) — `create-skill-file`
Bu repo aslında birbiriyle alakasız 11 farklı skill barındırıyor (haber özetleyici, FastGPT
workflow üretici, telif başvurusu yazarı vb.). Bunlardan sadece gerçek anlamda "meta-skill"
olan `create-skill-file` (İngilizce sürüm) kuruldu: kaliteli `SKILL.md` dosyaları yazmayı
öğreten rehber, şablonlar ve iyi/kötü örnekler. Diğer 10 skill kasıtlı olarak dahil edilmedi.

## 5. [fockus/claude-skill-find-skill](https://github.com/fockus/claude-skill-find-skill) — `find-skill`
14 kaynaktan (4800+ skill) arama/kurulum yapan `/find-skill` ve `/install-skill` komutları.
Bu araç tasarım gereği **kullanıcı-global** (`$HOME/.claude/skills/find-skill/...`) yollar
kullanıyor, proje-scope'lu değil — bu yüzden repoya sadece statik dosyalar (SKILL.md, güncelleme
ve kurulum script'leri, `/install-skill` komutu) kaydedildi; `cache/catalogue.json` (üretilen,
commit edilmeyen bir dosya) ve opsiyonel SkillsMP API anahtarı ilk gerçek `/find-skill`
çağrısında kendiliğinden oluşturulacak. Resmi `install.sh` betiğini bu oturumda otomatik
çalıştırmadım (üçüncü parti shell script çalıştırma izin sınıflandırıcısı tarafından
engellendi) — istersen manuel onayla çalıştırabilirim.

## 6. [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design)
`diagram-design` skill'i: 39 editoryal diyagram tipini (mimari, akış şeması, sequence, ER,
swimlane, timeline, Gantt, Sankey, UML class, DB schema vb.) bağımsız HTML/SVG dosyaları olarak
üretir; .drawio/Mermaid kaynaklarını yeniden çizer, siteden marka tokenlerini alabilir. Skill'in
gerçek içeriği repo kökünde değil `skills/diagram-design/` altındaydı, oradan `.claude/skills/diagram-design/`
olarak kopyalandı. Eşlik eden `/doctor`, `/export-diagram`, `/import-drawio`, `/import-mermaid`,
`/profile` komutları `.claude/commands/` altına eklendi (görece yolları bu proje yapısıyla
birebir uyumlu).

## 7. [embeddedlayers/mcp-analytics](https://github.com/embeddedlayers/mcp-analytics)
Bu bir skill değil, hosted bir MCP sunucusu (ücretli/kredi bazlı SaaS — mcpanalytics.ai).
Bağlantı ayarı repo köküne `.mcp.json` olarak eklendi:

```json
{
  "mcpServers": {
    "mcp-analytics": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://api.mcpanalytics.ai/auth0"]
    }
  }
}
```

İlk kullanımda tarayıcı üzerinden OAuth ile [mcpanalytics.ai](https://mcpanalytics.ai) hesabı
(ücretsiz kayıt, 500 hoş geldin kredisi) ile giriş istenecek — bu adım kayıt gerektirdiği için
otomatik yapılmadı, kullanıcı tarafından tamamlanmalı.
