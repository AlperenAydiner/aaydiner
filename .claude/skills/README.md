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

## 4. [embeddedlayers/mcp-analytics](https://github.com/embeddedlayers/mcp-analytics)
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
