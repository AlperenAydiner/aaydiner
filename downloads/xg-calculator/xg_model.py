"""
xG (Expected Goals) modeli — mesafe, açı ve vuruş tipiyle lojistik regresyon.

MODEL
-----
    logit(xG) = b0 + b1 * mesafe + b2 * açı + b3 * kafa_vuruşu
    xG        = 1 / (1 + exp(-logit))

Lojistik regresyon kullanılıyor çünkü:
  1. Sonuç ikili: bir şut ya gol olur (1) ya olmaz (0).
  2. Çıktının 0-1 arasında kalması gerekiyor. Doğrusal regresyon 1.4 ya da
     -0.2 gibi anlamsız değerler üretebilir; sigmoid bunu engelliyor.
  3. Katsayılar yorumlanabilir: her değişkenin log-odds üzerindeki etkisi
     doğrudan okunabiliyor.

KATSAYILAR NEREDEN GELİYOR
--------------------------
İdeal yol: on binlerce şut kaydıyla modeli eğitmek (bkz. fit_from_raw_shots).
Burada bunun yerine katsayılar, xG literatüründe yaygın olarak atıfta
bulunulan referans noktalarına kalibre edildi — örneğin ~5 m'den ortadan
bir şutun yaklaşık 0.60, ~30 m'den bir şutun yaklaşık 0.02 xG'ye karşılık
gelmesi. Model yapısı standart, katsayılar bu çıpalara oturtuldu.

Gereken: numpy
"""

import json
import numpy as np

# ---------------------------------------------------------------
# SABİTLER (metre)
# ---------------------------------------------------------------
GOAL_WIDTH = 7.32       # kale genişliği (FIFA standardı)
PENALTY_XG = 0.79       # penaltının uzun vadeli gerçekleşmiş gol oranı


# ---------------------------------------------------------------
# ÖZNİTELİK MÜHENDİSLİĞİ
# ---------------------------------------------------------------
def distance(x_off, depth):
    """
    Kale ortasına Öklid uzaklığı.

    x_off : kale ortasından yana kayma (negatif = sol, pozitif = sağ)
    depth : kale çizgisinden dikey uzaklık
    """
    return np.hypot(x_off, depth)


def shot_angle(x_off, depth, goal_width=GOAL_WIDTH):
    """
    Kale ağzının şutörden göründüğü açı (radyan), kosinüs teoremi ile.

    Şut noktası ile iki direk bir üçgen oluşturur:
        a = sol direğe mesafe
        b = sağ direğe mesafe
        c = kale genişliği (üçgenin karşı kenarı)

        θ = arccos[(a² + b² - c²) / (2ab)]

    Bu açı, mesafeden bağımsız bir "ne kadar kale görüyorum" ölçüsü.
    Kaleye yakın ama direğin dibindeki bir şutörün açısı dardır;
    penaltı noktasındakinin geniştir.
    """
    half = goal_width / 2
    a = np.hypot(x_off + half, depth)
    b = np.hypot(x_off - half, depth)
    cos_theta = (a**2 + b**2 - goal_width**2) / (2 * a * b)
    return np.arccos(np.clip(cos_theta, -1.0, 1.0))   # clip: float güvenliği


# ---------------------------------------------------------------
# KALİBRASYON ÇIPALARI
# ---------------------------------------------------------------
# (x_off, depth, hedef_xG) — açık oyun, ayak vuruşu
ANCHORS = [
    (0.0,   5.0, 0.600),   # çok yakın, ortadan
    (0.0,   6.0, 0.620),
    (0.0,  11.0, 0.280),   # penaltı noktası mesafesi, açık oyun
    (0.0,  14.0, 0.220),   # ceza sahası kenarı
    (0.0,  18.0, 0.100),
    (0.0,  25.0, 0.035),
    (0.0,  30.0, 0.020),   # uzak mesafe
    (10.0, 15.0, 0.060),   # uzak + geniş
    (13.0,  3.0, 0.180),   # yakın ama çok dar açı
]

# Kafa vuruşu düzeltmesi: aynı noktadan yapılan kafa vuruşları, ayak
# vuruşlarının yaklaşık dörtte biri oranında gole dönüşüyor. Log-odds
# ölçeğinde sabit bir ceza olarak uygulanıyor.
B_HEAD = -1.30


# ---------------------------------------------------------------
# MODELİ KUR
# ---------------------------------------------------------------
def logit(p):
    return np.log(p / (1 - p))


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def fit_model(anchors=ANCHORS):
    """
    Çıpa noktalarına en küçük kareler ile katsayı uydur.

    Hedef olasılıkları logit'e çevirip doğrusal sistem kuruyoruz:
        logit(p) = b0 + b1*mesafe + b2*açı
    Bu, logit ölçeğinde doğrusal olduğu için normal en küçük karelerle
    çözülebiliyor.
    """
    X, y = [], []
    for x_off, depth, target in anchors:
        X.append([1.0, distance(x_off, depth), shot_angle(x_off, depth)])
        y.append(logit(target))

    X, y = np.array(X), np.array(y)
    coefs, *_ = np.linalg.lstsq(X, y, rcond=None)

    resid = y - X @ coefs
    r2 = 1 - (resid**2).sum() / ((y - y.mean())**2).sum()

    return {
        "const": coefs[0],
        "distance": coefs[1],
        "angle": coefs[2],
        "is_head": B_HEAD,
    }, r2


def predict_xg(coefs, x_off, depth, shot_type="foot"):
    """
    Bir şutun xG değeri.

    shot_type: "foot" | "head" | "penalty"
    """
    if shot_type == "penalty":
        return PENALTY_XG          # konumdan bağımsız sabit

    z = (coefs["const"]
         + coefs["distance"] * distance(x_off, depth)
         + coefs["angle"] * shot_angle(x_off, depth))

    if shot_type == "head":
        z += coefs["is_head"]

    return sigmoid(z)


# ---------------------------------------------------------------
# GERÇEK VERİYLE DOĞRU YOL (StatsBomb, Understat vb.)
# ---------------------------------------------------------------
def fit_from_raw_shots(shots):
    """
    Elinde ham şut kaydı varsa kalibrasyona gerek yok — model doğrudan
    veriden öğrenilir.

    shots: DataFrame, sütunlar:
        x_off, depth, goal (0/1), is_head (0/1, opsiyonel)

    Burada logit dönüşümü YOK: lojistik regresyon zaten 0/1 etiketle
    çalışır ve katsayılarını maksimum olabilirlik ile bulur.
    """
    import pandas as pd
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import roc_auc_score, brier_score_loss

    X = pd.DataFrame({
        "distance": distance(shots["x_off"], shots["depth"]),
        "angle": shot_angle(shots["x_off"].values, shots["depth"].values),
    })
    if "is_head" in shots:
        X["is_head"] = shots["is_head"]

    y = shots["goal"].astype(int)
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    model = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
    p_te = model.predict_proba(X_te)[:, 1]

    # Accuracy KULLANMA: şutların çoğu gol değil, her şeye "gol değil"
    # diyen bir model bile %90 accuracy alır. Doğru metrikler:
    print(f"  AUC-ROC:     {roc_auc_score(y_te, p_te):.3f}")     # ayırt etme gücü
    print(f"  Brier score: {brier_score_loss(y_te, p_te):.4f}")  # kalibrasyon

    coefs = dict(zip(X.columns, model.coef_[0]))
    coefs["const"] = model.intercept_[0]
    return model, coefs


# ---------------------------------------------------------------
if __name__ == "__main__":
    coefs, r2 = fit_model()

    print("=== KATSAYILAR ===")
    for name, value in coefs.items():
        print(f"  {name:10s} {value: .4f}")
    print(f"\n  R² (logit ölçeğinde): {r2:.3f}")

    print("\n=== ÇIPALARA UYUM ===")
    errs = []
    for x_off, depth, target in ANCHORS:
        pred = predict_xg(coefs, x_off, depth)
        errs.append(pred - target)
        print(f"  ({x_off:5.1f}, {depth:4.1f})  hedef={target:.3f}  model={pred:.3f}")
    print(f"\n  RMSE: {np.sqrt(np.mean(np.square(errs))):.4f}")

    print("\n=== ÖRNEK POZİSYONLAR ===")
    cases = [
        ("Ceza sahası kenarı, ortadan", 0.0, 14.0, "foot"),
        ("Altıpas, ortadan",            0.0,  5.0, "foot"),
        ("Dar açı, direk dibi",        14.0,  2.0, "foot"),
        ("Sağdan içeri kat etme",       7.0,  9.0, "foot"),
        ("Uzaktan, geniş",              7.0, 22.0, "foot"),
        ("Kafa, altıpas",               0.0,  5.0, "head"),
        ("Penaltı",                     0.0, 11.0, "penalty"),
    ]
    for label, x_off, depth, st in cases:
        xg = predict_xg(coefs, x_off, depth, st)
        d = distance(x_off, depth)
        ang = np.degrees(shot_angle(x_off, depth))
        print(f"  {label:30s} {d:5.1f} m  {ang:5.1f}°  xG={xg:.3f}")

    print("\n=== ARAYÜZE AKTARILACAK KATSAYILAR ===")
    print(json.dumps({k: round(float(v), 4) for k, v in coefs.items()}, indent=2))
