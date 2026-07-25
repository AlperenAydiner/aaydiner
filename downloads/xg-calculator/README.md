# xG Calculator

Sahadaki herhangi bir noktadan atılan bir şutun gol olma olasılığını hesaplayan interaktif bir araç. Model Python'da kuruldu, arayüz tek bir HTML dosyası olarak sunuluyor.

---

## Model

xG tahmini bir **ikili sınıflandırma** problemi: her şut ya gol olur (1) ya olmaz (0), ve amaç bu ikisi arasındaki olasılığı tahmin etmek.

```
logit(xG) = b0 + b1·mesafe + b2·açı + b3·kafa_vuruşu
xG        = 1 / (1 + e^(-logit))
```

| Katsayı | Değer | Yorumu |
|---|---|---|
| `b0` (sabit) | 0.1727 | — |
| `b1` (mesafe, m) | -0.1491 | Her ek metre log-odds'u düşürüyor |
| `b2` (açı, radyan) | 0.8920 | Geniş açı lehte |
| `b3` (kafa vuruşu) | -1.30 | Kafa vuruşu için sabit ceza |

Penaltı bu formülün dışında: sabit **0.79**. Penaltı konumdan bağımsız, standart bir olay olduğu için profesyonel xG modelleri de onu ayrı ve sabit bir değerle işler.

### Neden lojistik regresyon

- **Sonuç ikili.** Doğrusal regresyon bu tür bir çıktı için tasarlanmadı.
- **Çıktı 0-1 arasında kalmalı.** Düz doğrusal regresyon 1.4 ya da -0.2 gibi anlamsız değerler üretebilir; sigmoid fonksiyonu bunu matematiksel olarak imkânsız kılıyor.
- **Katsayılar yorumlanabilir.** Her değişkenin log-odds üzerindeki etkisi doğrudan okunabiliyor — gradient boosting gibi güçlü ama opak yöntemlerde bu kaybolur.

---

## Öznitelik mühendisliği

Ham `(x, y)` koordinatı tek başına işe yaramaz. Ondan iki öznitelik türetiliyor:

**Mesafe** — kale ortasına Öklid uzaklığı:

```python
distance = np.hypot(x_off, depth)
```

**Açı** — kale ağzının şutörden göründüğü açı. Şut noktası ve iki direk bir üçgen oluşturuyor; kosinüs teoremi uygulanıyor:

```
θ = arccos[(a² + b² - 7.32²) / (2ab)]
```

`a` ve `b` şut noktasının direklere olan mesafeleri, 7.32 m kale genişliği.

Bu iki öznitelik farklı şeyler ölçüyor ve bu yüzden ikisi birlikte gerekiyor. Direğin dibindeki bir şutör kaleye çok yakındır ama kale ağzını neredeyse hiç görmez — mesafesi küçük, açısı dardır. Penaltı noktasındaki bir şutör daha uzaktadır ama tüm kaleyi görür. Sadece mesafe kullanan bir model bu ikisini ayırt edemez.

---

## Katsayılar nasıl bulundu

İdeal yol on binlerce şut kaydıyla modeli eğitmektir. Bu projede katsayılar bunun yerine, xG literatüründe yaygın olarak atıfta bulunulan **referans noktalarına kalibre edildi** — örneğin ~5 m'den ortadan bir şutun yaklaşık 0.60, ~30 m'den bir şutun yaklaşık 0.02 xG'ye karşılık gelmesi gibi.

Yöntem: hedef olasılıklar logit'e çevrilip doğrusal bir sistem kuruluyor ve en küçük karelerle çözülüyor. Logit ölçeğinde model doğrusal olduğu için bu mümkün.

```python
y = np.log(p / (1 - p))                    # logit dönüşümü
X = [[1, mesafe, açı], ...]
coefs, *_ = np.linalg.lstsq(X, y, rcond=None)
```

Sonuç: 9 çıpa noktasında **RMSE 0.029**, logit ölçeğinde **R² 0.974**.

Bu, gerçek veriyle eğitilmiş bir modelin yerine geçmez. Model yapısı standart ve doğru; katsayılar ise bilinen şut kalitesi ölçütlerine oturtulmuş durumda.

### Gerçek veriyle doğru yol

`fit_from_raw_shots()` fonksiyonu bu yolu gösteriyor. Ham şut verisiyle (StatsBomb açık verisi gibi) logit dönüşümüne gerek kalmıyor — lojistik regresyon zaten 0/1 etiketle çalışır ve katsayılarını **maksimum olabilirlik** ile bulur:

```python
model = LogisticRegression(max_iter=1000).fit(X_train, y_train)
```

Değerlendirmede **accuracy kullanılmamalı**: şutların büyük çoğunluğu gol değil, dolayısıyla her şeye "gol değil" diyen boş bir model bile %90 accuracy alır. Doğru metrikler:

- **AUC-ROC** — modelin rastgele bir golü rastgele bir gol-olmayandan ayırt etme gücü (0.5 = tesadüf)
- **Brier score** — tahmin edilen olasılıkla gerçek sonuç arasındaki ortalama kare fark; kalibrasyonu ölçer
- **Kalibrasyon eğrisi** — 0.30 xG verilen şutların gerçekten yaklaşık %30'u gol oluyor mu

---

## Arayüz

Tek HTML dosyası, harici kütüphane yok.

| Ne | Neden |
|---|---|
| SVG | Saha ve açı konisi vektörel; her ekran boyutunda net |
| Vanilla JS | Modeli değerlendirmek dört aritmetik işlem; kütüphane gereksiz |
| Pointer Events API | Dokunmatik ve fare aynı kodla |

Python katsayıları üretiyor, JS onları değerlendiriyor. `xg_model.py` çalıştırıldığında katsayıları JSON olarak basıyor; arayüzdeki sabitler bu çıktıyla birebir aynı.

Görselleştirme katmanında (SVG saha çizimi, koni geometrisinin ekrana aktarılması, etkileşim ve animasyon) yapay zeka desteğinden yararlanıldı. Model tarafı — öznitelik seçimi, kosinüs teoremi ile açı hesabı, kalibrasyon çıpaları ve regresyon — kendi çalışmam.

**Python'da kalmayı tercih edersen:** Streamlit ile hiç HTML yazmadan aynı aracı kurabilirsin. `mplsoccer` kütüphanesi futbol sahası çizimi için hazır fonksiyonlar sunuyor.

---

## Sınırlar

- **Yalnızca konum ve vuruş tipi kullanılıyor.** Savunmacıların yerleşimi, kalecinin konumu, şuttan önceki pas, pozisyonun kontra mı yerleşik hücum mu olduğu — hiçbiri modelde yok. Gerçek xG modelleri bunları içerir.
- **Katsayılar veriden öğrenilmedi**, referans değerlere kalibre edildi.
- **Belirsizlik ölçüsü yok.** Model tek bir sayı veriyor, güven aralığı vermiyor.

## Sıradaki adım

StatsBomb açık verisini `statsbombpy` ile çekip şutları filtrelemek, aynı öznitelikleri türetmek, modeli gerçek veriyle eğitmek ve AUC-ROC / Brier score ile değerlendirmek. Öğrenilen katsayılar mevcut sabitlerin yerine konduğunda arayüzde başka hiçbir şey değişmiyor.

---

## Dosyalar

```
xg_model.py           Model, kalibrasyon, değerlendirme
xg-calculator.html    Arayüz (tek dosya, bağımsız çalışır)
```

Çalıştırmak için:

```bash
python xg_model.py       # katsayıları üretir ve doğrular
```

Gereken: `numpy`. Ham veri yolu için ek olarak `pandas`, `scikit-learn`.
