// MEB Türkiye Yüzyılı Maarif Modeli (1. Sınıftan 12. Sınıfa Tüm Ders, Ünite ve Konular)
export type CurriculumUnit = {
  name: string;
  topics: string[];
};

export type CurriculumSubject = {
  name: string;
  units: CurriculumUnit[];
};

export const MAARIF_CURRICULUM: Record<number, CurriculumSubject[]> = {
  "1": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "Sayılar ve Nicelikler",
          "topics": [
            "Rakamlar ve 20’ye Kadar Sayılar",
            "100’e Kadar Doğal Sayılar",
            "Ritmik Saymalar",
            "Toplama İşlemi",
            "Çıkarma İşlemi"
          ]
        },
        {
          "name": "Geometrik Şekiller ve Ölçme",
          "topics": [
            "Geometrik Şekiller ve Cisimler",
            "Uzamsal İlişkiler ve Örüntüler",
            "Uzunluk ve Sıvı Ölçme",
            "Zaman Ölçme ve Paralarımız"
          ]
        }
      ]
    },
    {
      "name": "Türkçe",
      "units": [
        {
          "name": "İlk Okuma ve Yazma",
          "topics": [
            "Sesleri ve Harfleri Tanıma",
            "Hece ve Kelime Oluşturma",
            "Cümle ve Kısa Metin Okuma"
          ]
        },
        {
          "name": "Okuma ve Anlama",
          "topics": [
            "Okuduğunu Anlama",
            "Görsel Yorumlama",
            "Temel Noktalama İşaretleri"
          ]
        }
      ]
    },
    {
      "name": "Hayat Bilgisi",
      "units": [
        {
          "name": "Okulumuzda ve Evimizde Hayat",
          "topics": [
            "Okul Kuralları ve Arkadaşlık",
            "Ailemiz ve Evimiz",
            "Sağlıklı Hayat ve Beslenme",
            "Güvenli Hayat",
            "Ülkemiz ve Doğada Hayat"
          ]
        }
      ]
    }
  ],
  "2": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "Sayılar ve İşlemler",
          "topics": [
            "Doğal Sayılar ve Basamak Değeri",
            "Eldeli ve Eldesiz Toplama İşlemi",
            "Onluk Bozarak Çıkarma İşlemi",
            "Çarpma İşlemine Giriş",
            "Bölme İşlemine Giriş",
            "Kesirler (Bütün, Yarım, Çeyrek)"
          ]
        },
        {
          "name": "Geometri ve Ölçme",
          "topics": [
            "Geometrik Cisimler ve Şekiller",
            "Simetri ve Örüntüler",
            "Zaman, Uzunluk ve Tartma",
            "Veri Toplama ve Tablo"
          ]
        }
      ]
    },
    {
      "name": "Türkçe",
      "units": [
        {
          "name": "Okuma ve Anlama",
          "topics": [
            "Sözcükte Anlam (Eş ve Zıt Anlam)",
            "Cümlede Anlam",
            "Metin Anlama ve Hikâye Unsurları"
          ]
        },
        {
          "name": "Yazım ve Noktalama",
          "topics": [
            "Büyük Harflerin Kullanımı",
            "Noktalama İşaretleri"
          ]
        }
      ]
    },
    {
      "name": "Hayat Bilgisi",
      "units": [
        {
          "name": "Yaşamımız",
          "topics": [
            "Okulumuzda Hayat",
            "Evimizde Hayat",
            "Sağlıklı Hayat",
            "Güvenli Hayat",
            "Ülkemizde Hayat",
            "Doğada Hayat"
          ]
        }
      ]
    },
    {
      "name": "İngilizce",
      "units": [
        {
          "name": "Words & Greetings",
          "topics": [
            "Words",
            "Friends & Greetings",
            "In the Classroom",
            "Numbers & Colors",
            "At the Playground",
            "Body Parts & Pets",
            "Fruits & Animals"
          ]
        }
      ]
    }
  ],
  "3": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "Sayılar ve İşlemler",
          "topics": [
            "Üç Basamaklı Doğal Sayılar",
            "Toplama ve Çıkarma İşlemleri",
            "Çarpma İşlemi ve Problemler",
            "Bölme İşlemi ve Problemler",
            "Kesirler (Birim Kesir)"
          ]
        },
        {
          "name": "Geometri, Ölçme ve Veri",
          "topics": [
            "Geometrik Cisimler, Şekiller ve Açılar",
            "Simetri",
            "Uzunluk, Çevre ve Alan Ölçme",
            "Zaman, Tartma ve Sıvı Ölçme",
            "Veri Toplama ve Grafikler"
          ]
        }
      ]
    },
    {
      "name": "Türkçe",
      "units": [
        {
          "name": "Okuma ve Anlama",
          "topics": [
            "Sözcükte Anlam (Eş, Zıt, Eş Sesli)",
            "Deyimler ve Atasözleri",
            "Cümlede Anlam",
            "Paragrafta Konu ve Ana Fikir",
            "Hikâye Unsurları ve Metin Türleri"
          ]
        },
        {
          "name": "Dil ve Yazım",
          "topics": [
            "İsimler, Sıfatlar ve Fiiller",
            "Yazım Kuralları ve Noktalama İşaretleri"
          ]
        }
      ]
    },
    {
      "name": "Fen Bilimleri",
      "units": [
        {
          "name": "Gezegenimiz ve Madde",
          "topics": [
            "Gezegenimizi Tanıyalım",
            "Beş Duyumuz",
            "Kuvveti Tanıyalım",
            "Maddeyi Tanıyalım",
            "Çevremizdeki Işık ve Sesler",
            "Canlılar Dünyasına Yolculuk",
            "Elektrikli Araçlar"
          ]
        }
      ]
    },
    {
      "name": "Hayat Bilgisi",
      "units": [
        {
          "name": "Yaşamımız",
          "topics": [
            "Okulumuzda Hayat",
            "Evimizde Hayat",
            "Sağlıklı Hayat",
            "Güvenli Hayat",
            "Ülkemizde Hayat",
            "Doğada Hayat"
          ]
        }
      ]
    },
    {
      "name": "İngilizce",
      "units": [
        {
          "name": "Everyday English",
          "topics": [
            "Greeting",
            "My Family",
            "People I Love",
            "Feelings",
            "Toys and Games",
            "My House",
            "In My City",
            "Transportation",
            "Weather",
            "Nature"
          ]
        }
      ]
    }
  ],
  "4": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "Sayılar ve İşlemler",
          "topics": [
            "4, 5 ve 6 Basamaklı Doğal Sayılar",
            "Doğal Sayılarla Toplama ve Çıkarma",
            "Doğal Sayılarla Çarpma İşlemi",
            "Doğal Sayılarla Bölme İşlemi",
            "Kesirler ve Kesirlerle İşlemler"
          ]
        },
        {
          "name": "Geometri, Ölçme ve Veri",
          "topics": [
            "Geometrik Kavramlar, Açılar ve Üçgen-Dörtgen",
            "Simetri",
            "Uzunluk, Çevre ve Alan Ölçme",
            "Zaman, Tartma ve Sıvı Ölçme",
            "Veri Toplama ve Sütun Grafiği"
          ]
        }
      ]
    },
    {
      "name": "Türkçe",
      "units": [
        {
          "name": "Okuma ve Anlama",
          "topics": [
            "Sözcükte Anlam (Gerçek, Mecaz, Terim)",
            "Deyimler ve Atasözleri",
            "Cümlede Anlam (Neden-Sonuç, Amaç-Sonuç, Karşılaştırma)",
            "Paragrafta Anlam ve Ana Düşünce",
            "Görsel ve Grafik Yorumlama"
          ]
        },
        {
          "name": "Dil Yapıları ve Yazım",
          "topics": [
            "Sözcükte Yapı ve Sözcük Türleri",
            "Yazım Kuralları",
            "Noktalama İşaretleri"
          ]
        }
      ]
    },
    {
      "name": "Fen Bilimleri",
      "units": [
        {
          "name": "Dünya, Madde ve Canlılar",
          "topics": [
            "Yer Kabuğu ve Dünya’mızın Hareketleri",
            "Besinlerimiz",
            "Kuvvetin Etkileri",
            "Maddenin Özellikleri",
            "Aydınlatma ve Ses Teknolojileri",
            "İnsan ve Çevre",
            "Basit Elektrik Devreleri"
          ]
        }
      ]
    },
    {
      "name": "Sosyal Bilgiler",
      "units": [
        {
          "name": "Toplum ve Kültür",
          "topics": [
            "Birey ve Toplum",
            "Kültür ve Miras",
            "İnsanlar, Yerler ve Çevreler",
            "Bilim, Teknoloji ve Toplum",
            "Üretim, Dağıtım ve Tüketim",
            "Etkin Vatandaşlık",
            "Küresel Bağlantılar"
          ]
        }
      ]
    },
    {
      "name": "İngilizce",
      "units": [
        {
          "name": "Communication",
          "topics": [
            "Classroom Rules",
            "Nationality",
            "Cartoon Characters",
            "Free Time",
            "My Day",
            "Fun with Science",
            "Jobs",
            "My Clothes",
            "My Friends",
            "Food and Drinks"
          ]
        }
      ]
    },
    {
      "name": "Din Kültürü ve Ahlak Bilgisi",
      "units": [
        {
          "name": "Temel Bilgiler",
          "topics": [
            "Günlük Hayattaki Dinî İfadeler",
            "İslam’ı Tanıyalım",
            "Güzel Ahlak",
            "Hz. Muhammed’i Tanıyalım",
            "Din ve Temizlik"
          ]
        }
      ]
    }
  ],
  "5": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "Sayılar ve Nicelikler (1)",
          "topics": [
            "Doğal Sayılar ve İşlemler",
            "Çok Basamaklı Sayıları Okuma ve Yazma",
            "Basamak Değerlerini Çözümleme",
            "Doğal Sayılarla Dört İşlem İçeren Problem Çözme"
          ]
        },
        {
          "name": "Sayılar ve Nicelikler (2)",
          "topics": [
            "Kesirler",
            "Kesirlerin Farklı Gösterimleri",
            "Kesirlerin Karşılaştırılması"
          ]
        },
        {
          "name": "İşlemlerle Cebirsel Düşünme",
          "topics": [
            "Cebirsel Düşünme",
            "Eşitliğin Korunumu",
            "Değişme-Birleşme ve Dağılma Özellikleri",
            "İşlem Önceliği",
            "Örüntüler",
            "Temel Aritmetik İşlemler ve Algoritma"
          ]
        },
        {
          "name": "Geometrik Şekiller",
          "topics": [
            "Temel Geometrik Çizimler ve İnşalar",
            "Açı Ölçme",
            "Çokgenler ve Çember"
          ]
        },
        {
          "name": "Geometrik Nicelikler",
          "topics": [
            "Dikdörtgenin Çevre Uzunluğu ve Alanı"
          ]
        },
        {
          "name": "İstatistiksel Araştırma Süreci",
          "topics": [
            "Kategorik Veri Dağılımları"
          ]
        },
        {
          "name": "Veriden Olasılığa",
          "topics": [
            "Öznel Olasılık"
          ]
        }
      ]
    },
    {
      "name": "Türkçe",
      "units": [
        {
          "name": "Okuma ve Anlama",
          "topics": [
            "Sözcükte Anlam (Söz Varlığı)",
            "Eş, Yakın ve Zıt Anlamlı Kelimeler",
            "Gerçek ve Mecaz Anlam",
            "Deyimler, Atasözleri ve Kalıp Sözler",
            "Cümlede Anlam",
            "Paragrafta Anlam: Konu, Ana Fikir ve Yardımcı Fikirler",
            "Çıkarım Yapma (Metnin Derin Anlamı)",
            "Başlık ve Anahtar Kelimeler",
            "Görsel Okuma ve Yorumlama",
            "Hikâye Unsurları",
            "Metnin Bölümleri ve Metin Yapıları",
            "Düşünceyi Geliştirme Yolları",
            "Şiir Bilgisi (Biçim Özellikleri)",
            "Söz Sanatları",
            "Metin Karşılaştırma",
            "Özetleme"
          ]
        },
        {
          "name": "Dil Yapıları",
          "topics": [
            "İsim ve Fiil Ayrımı",
            "İsimler ve Tür Özellikleri",
            "Sıfatlar (İsimleri Niteleyen ve Belirten Sözcükler)",
            "Zamirler (İsmin Yerine Kullanılan Sözcükler)",
            "Betimleme İşlevli Fiilimsiler",
            "Karşılaştırma, Benzerlik ve Farklılık İfadeleri",
            "Amaç İfadeleri",
            "Tahmin İfadeleri",
            "Özet İfadeleri"
          ]
        },
        {
          "name": "Yazım ve Noktalama",
          "topics": [
            "Noktalama İşaretleri (Nokta, Virgül, Soru İşareti, Ünlem, Kısa Çizgi, Uzun Çizgi, Kesme İşareti, Üç Nokta, Tırnak İşareti)",
            "Büyük Harflerin Kullanımı",
            "Sayıların Yazımı",
            "Hece Yapısı ve Satır Sonunda Kelimelerin Bölünmesi"
          ]
        },
        {
          "name": "Temalar",
          "topics": [
            "Oyun Dünyası",
            "Atatürk’ü Tanımak",
            "Duygularımı Tanıyorum",
            "Geleneklerimiz",
            "İletişim ve Sosyal İlişkiler",
            "Sağlıklı Yaşıyorum"
          ]
        }
      ]
    },
    {
      "name": "Fen Bilimleri",
      "units": [
        {
          "name": "Gökyüzündeki Komşularımız ve Biz",
          "topics": [
            "Gökyüzündeki Komşumuz: Güneş",
            "Gökyüzündeki Komşumuz: Ay",
            "Dünya’mız ve Gökyüzündeki Komşularımız"
          ]
        },
        {
          "name": "Kuvveti Tanıyalım",
          "topics": [
            "Kuvvet ve Kuvvetin Ölçülmesi",
            "Kütle ve Ağırlık İlişkisi",
            "Sürtünme Kuvveti"
          ]
        },
        {
          "name": "Canlıların Yapısına Yolculuk",
          "topics": [
            "Hücre ve Organelleri",
            "Destek ve Hareket Sistemi"
          ]
        },
        {
          "name": "Işığın Dünyası",
          "topics": [
            "Işığın Yayılması",
            "Maddenin Işık Geçirgenliği",
            "Tam Gölgenin Oluşumu"
          ]
        },
        {
          "name": "Maddenin Doğası",
          "topics": [
            "Maddenin Tanecikli Yapısı",
            "Isı ve Sıcaklık",
            "Maddenin Hâl Değişimi",
            "Madde ve Isı"
          ]
        },
        {
          "name": "Yaşamımızdaki Elektrik",
          "topics": [
            "Devre Elemanlarının Sembolleri ve Devre Şeması",
            "Basit Bir Elektrik Devresinde Ampul Parlaklığını Etkileyen Değişkenler"
          ]
        },
        {
          "name": "Sürdürülebilir Yaşam ve Geri Dönüşüm",
          "topics": [
            "Evsel Atıklar ve Geri Dönüşüm"
          ]
        }
      ]
    },
    {
      "name": "Sosyal Bilgiler",
      "units": [
        {
          "name": "Birlikte Yaşamak",
          "topics": [
            "Gruplar ve Roller",
            "Kültürel Özelliklere Saygı ve Birlikte Yaşama Kültürü",
            "Yardımlaşma ve Dayanışma Faaliyetlerinin Toplumsal Birliğe Etkisi"
          ]
        },
        {
          "name": "Evimiz Dünya",
          "topics": [
            "Yaşadığı İlin Göreceli Konumu",
            "Yaşadığı İlde Doğal ve Beşerî Çevredeki Değişim",
            "Yaşadığı İlde Meydana Gelebilecek Afetlerin Etkileri",
            "Ülkemize Komşu Devletler"
          ]
        },
        {
          "name": "Ortak Mirasımız",
          "topics": [
            "Ortak Miras Ögeleri",
            "Somut ve Somut Olmayan Kültürel Miras Ögeleri",
            "Anadolu’nun İlk Yerleşim Yerlerinde Sosyal Hayat",
            "Mezopotamya ve Anadolu Medeniyetlerinin Ortak Mirasa Katkıları"
          ]
        },
        {
          "name": "Yaşayan Demokrasimiz",
          "topics": [
            "Demokrasi ve Cumhuriyet Kavramının Temel Nitelikleri",
            "Etkin Vatandaşın Özellikleri ve Önemi",
            "Temel Haklar, Sorumluluklar ve Önemi",
            "İhtiyaç Durumunda veya Sorunların Çözümünde Başvurulabilecek Kurumlar"
          ]
        },
        {
          "name": "Hayatımızdaki Ekonomi",
          "topics": [
            "Kaynakların Verimli Kullanımı",
            "Bütçe Oluşturma",
            "Yaşadığım İldeki Ekonomik Faaliyetler"
          ]
        },
        {
          "name": "Teknoloji ve Sosyal Bilimler",
          "topics": [
            "Teknolojik Gelişmelerin Toplum Hayatına Etkileri",
            "Teknolojik Ürünlerin Bilinçli Kullanımı"
          ]
        }
      ]
    },
    {
      "name": "İngilizce",
      "units": [
        {
          "name": "School Life",
          "topics": [
            "People, places and rules at school",
            "School clubs",
            "Countries",
            "National days and celebrations",
            "The Simple Present Tense (do you like + ing)",
            "Modals Mustn’t & Can’t (prohibition)",
            "To be Present",
            "Wh- questions (who, what)",
            "A, an, the",
            "Imperatives",
            "Personal pronouns"
          ]
        },
        {
          "name": "Classroom Life",
          "topics": [
            "Classroom rules and language",
            "School subjects",
            "Timetables",
            "Classroom objects",
            "Days of the week",
            "Time",
            "The Simple Present Tense",
            "There is/are",
            "Object Pronouns",
            "To Be for Time (What time is it?)",
            "Wh questions (What time..?)"
          ]
        },
        {
          "name": "Personal Life",
          "topics": [
            "Basic body parts and physical features",
            "Clothes",
            "Daily routines and activities",
            "The Simple Present Tense",
            "Question Tags for the Simple Present Tense",
            "Adverbs of Frequency (How often)",
            "Possessive adjectives"
          ]
        },
        {
          "name": "Family Life",
          "topics": [
            "Family members’ routines",
            "Family members’ hobbies and activities",
            "Present Progressive Tense",
            "Present Progressive Tense vs Present Simple Tense",
            "Question tags for the Present Progressive Tense"
          ]
        },
        {
          "name": "Life in the Neighbourhood & City",
          "topics": [
            "Places for recreation and attractions in the neighbourhood and city",
            "Different types of houses",
            "Comparatives of adjectives (regular-irregular)",
            "Possessive ’s",
            "Present Simple Tense",
            "There is/are"
          ]
        },
        {
          "name": "Life in the World",
          "topics": [
            "Basic food types",
            "Ordering in a restaurant",
            "Food events in the city",
            "Can for Permission",
            "Have got/Has got",
            "Countable and Uncountable Nouns"
          ]
        },
        {
          "name": "Life in Nature",
          "topics": [
            "Types of animals in nature",
            "Wild animals in nature",
            "Their habitats",
            "Can for Capability and Ability",
            "Must for External Obligation",
            "Wh- questions (where)",
            "Comparative and Superlative Adjectives"
          ]
        },
        {
          "name": "Life in the Universe & Future",
          "topics": [
            "Planet Earth",
            "Holidays",
            "School holidays, places, activities, and plans for holidays",
            "Be Going to Future Tense for plans"
          ]
        }
      ]
    },
    {
      "name": "Din Kültürü ve Ahlak Bilgisi",
      "units": [
        {
          "name": "Allah İnancı",
          "topics": [
            "Evrendeki Mükemmel Düzen",
            "Allah’ın Varlığı ve Birliği",
            "Allah’ın Güzel İsimleri",
            "Bir Sure Öğreniyorum: İhlas Suresi"
          ]
        },
        {
          "name": "Namaz",
          "topics": [
            "Allah’ın Huzurunda Olmak: Namaz",
            "Namazın Kılınışı",
            "Namazın İnsana Kazandırdıkları",
            "Bir Dua Öğreniyorum: Tahiyyat Duası"
          ]
        },
        {
          "name": "Kur’an-ı Kerim",
          "topics": [
            "Kur’an-ı Kerim’in İç Düzeni",
            "Kur’an-ı Kerim’in Temel Özellikleri",
            "Kur’an-ı Kerim’in Ana Konuları",
            "Bir Sure Öğreniyorum: Kevser Suresi"
          ]
        },
        {
          "name": "Peygamber Kıssaları",
          "topics": [
            "Allah’ın Elçileri: Peygamberler",
            "Kur’an-ı Kerim’den Öğütler: Peygamber Kıssaları",
            "Bir Sure Öğreniyorum: Kureyş Suresi"
          ]
        },
        {
          "name": "Mimarimizde Dinî Motifler",
          "topics": [
            "Dinin Mimarimize Etkisi",
            "Camileri Tanıyalım",
            "Kültürümüzden Cami Örnekleri"
          ]
        }
      ]
    }
  ],
  "6": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "Sayılar ve Nicelikler (1)",
          "topics": [
            "Doğal Sayıların Çarpanları ve Katları",
            "Bir Doğal Sayının Çarpanları ve Katları",
            "Bölünebilme Kriterleri",
            "Asal Sayılar ve Asal Çarpanlar"
          ]
        },
        {
          "name": "Sayılar ve Nicelikler (2)",
          "topics": [
            "Kesirlerle İşlemler",
            "Ondalık Gösterimleri Çözümleme",
            "Kesir-Bölme İlişkisi",
            "Kesirlerle Dört İşlem İçeren Problem Çözme",
            "Uzunluk Ölçme"
          ]
        },
        {
          "name": "İşlemlerle Cebirsel Düşünme ve Değişimler",
          "topics": [
            "Cebirsel İfadeler",
            "Bilinmeyen Nicelikler",
            "Örüntü",
            "Cebirsel İfadeler ve Algoritma"
          ]
        },
        {
          "name": "Geometrik Şekiller",
          "topics": [
            "İki Paralel Doğrunun Bir Kesen ile Oluşturduğu Açılar",
            "Üçgenin Açıları",
            "Yamuk, Paralelkenar, Eşkenar Dörtgen, Dikdörtgen ve Karenin Kenar, Açı ve Köşegen Özellikleri"
          ]
        },
        {
          "name": "Geometrik Nicelikler",
          "topics": [
            "Uzunluk ve Alan Ölçme Birimleri Arasındaki İlişki",
            "Paralelkenar ve Üçgenin Alanı",
            "Çemberin ve Çapın Uzunlukları Arasındaki İlişki",
            "Çemberde Merkez Açı ve Gördüğü Yay Uzunluğu"
          ]
        },
        {
          "name": "İstatistiksel Araştırma Süreci",
          "topics": [
            "Kategorik ve Nicel (Kesikli) Veri Dağılımları"
          ]
        },
        {
          "name": "Veriden Olasılığa",
          "topics": [
            "Deneysel Olasılık"
          ]
        }
      ]
    },
    {
      "name": "Türkçe",
      "units": [
        {
          "name": "Okuma ve Anlama",
          "topics": [
            "Sözcükte Anlam (Söz Varlığı)",
            "Eş, Yakın ve Zıt Anlamlı Kelimeler",
            "Gerçek ve Mecaz Anlam",
            "Deyimler, Atasözleri ve Kalıp Sözler",
            "Cümlede Anlam",
            "Paragrafta Anlam: Konu, Ana Fikir ve Yardımcı Fikirler",
            "Çıkarım Yapma (Metnin Derin Anlamı)",
            "Başlık ve Anahtar Kelimeler",
            "Görsel Okuma ve Yorumlama",
            "Hikâye Unsurları",
            "Metnin Bölümleri ve Metin Yapıları",
            "Düşünceyi Geliştirme Yolları",
            "Şiir Bilgisi (Biçim Özellikleri)",
            "Söz Sanatları",
            "Metin Karşılaştırma",
            "Özetleme",
            "Metni Değerlendirme ve Eleştirme"
          ]
        },
        {
          "name": "Dil Yapıları",
          "topics": [
            "Kök ve Ek",
            "Yapım Ekleri ve Çekim Ekleri",
            "İsim Çekim Ekleri (Çoğul, Hâl, İlgi, İyelik ve Soru Eki)",
            "Seslerin Özellikleri ve Büyük Ünlü Uyumu",
            "Ses Olayları",
            "Zıtlık ve Olumsuzluk İfadeleri",
            "Sınıflandırma İfadeleri",
            "Eleştiri ve Değerlendirme İfadeleri"
          ]
        },
        {
          "name": "Yazım ve Noktalama",
          "topics": [
            "Noktalama İşaretleri (Virgül, Noktalı Virgül, İki Nokta, Kısa Çizgi, Eğik Çizgi, Yay Ayraç, Kesme İşareti)",
            "Büyük Harflerin Kullanımı",
            "Bitişik ve Ayrı Yazılan Yapılar (da/de, ki, mi)",
            "Kısaltmalar ve Kısaltmalara Getirilen Eklerin Yazımı"
          ]
        },
        {
          "name": "Temalar",
          "topics": [
            "Dilimizin Zenginliği",
            "Bağımsızlık Yolu",
            "Farklı Dünyalar",
            "İletişim ve Sosyal İlişkiler",
            "Bilim ve Teknoloji",
            "Lider Ruhlar"
          ]
        }
      ]
    },
    {
      "name": "Fen Bilimleri",
      "units": [
        {
          "name": "Güneş Sistemi ve Tutulmalar",
          "topics": [
            "Güneş Sistemi",
            "Güneş ve Ay Tutulmaları"
          ]
        },
        {
          "name": "Kuvvetin Etkisinde Hareket",
          "topics": [
            "Bileşke Kuvvet",
            "Sabit Süratli ve Sabit Hızlı Hareket"
          ]
        },
        {
          "name": "Canlılarda Sistemler",
          "topics": [
            "Bitki ve Hayvanlarda Üreme, Büyüme ve Gelişme",
            "Denetleyici ve Düzenleyici Sistemler"
          ]
        },
        {
          "name": "Işığın Yansıması ve Renkler",
          "topics": [
            "Işığın Yansıması",
            "Aynalar",
            "Işığın Soğurulması"
          ]
        },
        {
          "name": "Maddenin Ayırt Edici Özellikleri",
          "topics": [
            "Genleşme ve Büzülme",
            "Maddenin Hâl Değişim Noktaları",
            "Yoğunluk"
          ]
        },
        {
          "name": "Elektriğin İletimi ve Direnç",
          "topics": [
            "Elektriğin İletimi",
            "Elektriksel Direnç ve Bağlı Olduğu Faktörler"
          ]
        },
        {
          "name": "Sürdürülebilir Yaşam ve Etkileşim",
          "topics": [
            "Biyoçeşitlilik",
            "İnsan ve Çevre Etkileşimi"
          ]
        }
      ]
    },
    {
      "name": "Sosyal Bilgiler",
      "units": [
        {
          "name": "Birlikte Yaşamak",
          "topics": [
            "Zaman İçinde Değişen Gruplar ve Roller",
            "Kültürel Bağlarımızın ve Millî Değerlerimizin Toplumsal Birlikteliğe Etkisi",
            "Toplumsal Sorunlar ve Çözüm Önerileri"
          ]
        },
        {
          "name": "Evimiz Dünya",
          "topics": [
            "Ülkemizin, Kıtaların ve Okyanusların Konum Özellikleri",
            "Doğal ve Beşerî Çevre Özellikleri Arasındaki İlişki",
            "Ülkemizin Türk Dünyasıyla Kültürel İş Birlikleri"
          ]
        },
        {
          "name": "Ortak Mirasımız",
          "topics": [
            "Türkistan’da Kurulan İlk Türk Devletlerinin Medeniyetimize Katkıları",
            "VII-XIII. Yüzyıllar Arasında İslam Medeniyetinin İnsanlığın Ortak Mirasına Katkıları",
            "İslamiyet’in Kabulüyle Türklerin Sosyal ve Kültürel Hayatlarında Meydana Gelen Değişimler",
            "XI-XIII. Yüzyıllar Arasında Meydana Gelen Askerî Mücadelelerin Anadolu’nun Türkleşmesi ve İslamlaşmasına Katkıları"
          ]
        },
        {
          "name": "Yaşayan Demokrasimiz",
          "topics": [
            "Yönetimin Karar Alma Sürecini Etkileyen Unsurlar",
            "Temel Hak ve Sorumlulukların Toplumsal Düzenin Sürdürülmesindeki Önemi",
            "Dijitalleşme ve Teknolojik Gelişmelerin Vatandaşlık Hak ve Sorumluluklarına Etkileri"
          ]
        },
        {
          "name": "Hayatımızdaki Ekonomi",
          "topics": [
            "Ülkemizin Kaynakları ve Ekonomik Faaliyetler",
            "Ekonomik Faaliyetler ve Meslekler",
            "Tasarlanan Bir Ürünün Yatırım ve Pazarlama Süreci"
          ]
        },
        {
          "name": "Teknoloji ve Sosyal Bilimler",
          "topics": [
            "Ulaşım ve İletişim Teknolojilerinin Kültürel Etkileşimdeki Rolü",
            "Telif ve Patent Süreci"
          ]
        }
      ]
    },
    {
      "name": "İngilizce",
      "units": [
        {
          "name": "School Life",
          "topics": [
            "Roles, and responsibilities at school",
            "School routines",
            "National days and celebrations",
            "Articles (a/an/the)",
            "Imperatives",
            "Personal pronouns",
            "There is/There are",
            "Wh- questions (who-when-what-where)",
            "The Present Simple Tense",
            "Adverbs of frequency",
            "Object pronouns"
          ]
        },
        {
          "name": "Classroom Life",
          "topics": [
            "Daily and study routines",
            "Learning activities in the classroom",
            "Cardinal numbers 100-500",
            "Ordinal numbers 1-50",
            "The Present Progressive Tense",
            "The Present Progressive Tense vs the Simple Present Tense",
            "Question tags for The Present Progressive Tense and the Simple Present Tense",
            "Possessive adjectives",
            "Word order with adverbs",
            "Question: How often"
          ]
        },
        {
          "name": "Personal Life",
          "topics": [
            "Body parts, physical appearance and clothes",
            "Personality and character",
            "Have/Has got",
            "Wh questions (whose)",
            "Comparative and superlative adjectives (regular and irregular)"
          ]
        },
        {
          "name": "Family Life",
          "topics": [
            "Family members’ jobs, working places, and job routines",
            "Different types of family homes and houses",
            "The Present Progressive Tense for the future",
            "The Simple Present Tense for the future",
            "Conjunctions (when, while)",
            "Wh- questions (Which)",
            "Reflexive pronouns"
          ]
        },
        {
          "name": "Life in the Neighbourhood & City",
          "topics": [
            "Festivals and events (sports, music, arts) in the neighbourhood and city",
            "Transportation in the neighbourhood and the city",
            "The Simple Past Tense (was-were)",
            "Wh- questions (why, when)",
            "Gerunds and infinitives",
            "Question tags for the Simple Past Tense (to be)",
            "Prepositions"
          ]
        },
        {
          "name": "Life in the World & Culture",
          "topics": [
            "Countries, nationalities, and languages in the world",
            "Food types and events from different parts of the world",
            "The Simple Past Tense",
            "Question tags for The Simple Past Tense (regular verbs)"
          ]
        },
        {
          "name": "Life in Nature & Global Problems",
          "topics": [
            "Activities in nature",
            "Environmental problems in the world and solutions",
            "The Simple Past Tense",
            "Question tags for The Simple Past Tense (irregular verbs)",
            "Must and have to for obligation"
          ]
        },
        {
          "name": "Life in the Universe & Future",
          "topics": [
            "Planets and the Earth as a planet",
            "Life on Earth in the future",
            "Be going to Future Tense",
            "The Simple Future Tense (prediction)",
            "Question tags for future tenses"
          ]
        }
      ]
    },
    {
      "name": "Din Kültürü ve Ahlak Bilgisi",
      "units": [
        {
          "name": "Peygamber ve İlahi Kitap İnancı",
          "topics": [
            "İnsanlara Rehber: Peygamber",
            "Peygamberlerin İlettiği Mesaj: Vahiy",
            "İlahi Kitaplar",
            "Bir Sure Öğreniyorum: Felak Suresi"
          ]
        },
        {
          "name": "Ramazan ve Oruç",
          "topics": [
            "Oruç ve Kur’an Ayı Ramazan",
            "Oruç İbadeti",
            "Oruç İbadetinin İnsana Kazandırdıkları",
            "Bir Dua Öğreniyorum: İftar Duası"
          ]
        },
        {
          "name": "Ahlaki Davranışlar",
          "topics": [
            "Doğru Sözlü Olmak",
            "Merhametli Olmak",
            "Adap ve Nezaket Kurallarına Uymak",
            "Vatanımızı Sevmek",
            "Bir Dua Öğreniyorum: Kunut Duaları"
          ]
        },
        {
          "name": "Peygamberliğinden Önce Hz. Muhammed",
          "topics": [
            "Hz. Muhammed’in (sav) Doğduğu Çevre",
            "Hz. Muhammed’in (sav) Ailesi ve Çocukluğu",
            "Hz. Muhammed’in (sav) Gençlik Yılları",
            "Bir Sure Öğreniyorum: Fil Suresi"
          ]
        },
        {
          "name": "Kültürümüzdeki Dinî Motifler",
          "topics": [
            "Geleneğimizde Dinin İzleri",
            "Edebiyatımızda Dinin İzleri",
            "Musikimizde Dinin İzleri"
          ]
        }
      ]
    }
  ],
  "7": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "Sayılar ve Nicelikler (1)",
          "topics": [
            "Rasyonel Sayılar ve Rasyonel Sayılarla İşlemler",
            "Tam Sayılar",
            "Rasyonel Sayılar ve Farklı Temsilleri",
            "Rasyonel Sayılarda Karşılaştırma ve Sıralama",
            "Rasyonel Sayılarla İşlemler ve Problem Çözme"
          ]
        },
        {
          "name": "Sayılar ve Nicelikler (2)",
          "topics": [
            "Oran ve Orantı",
            "Oran",
            "Orantılı Durumlar",
            "Doğru Orantılı Durumlara İlişkin Problem Çözme"
          ]
        },
        {
          "name": "İşlemlerle Cebirsel Düşünme ve Değişimler",
          "topics": [
            "Cebirsel İfadelerle İşlemler",
            "Denklem ve Eşitsizlikler",
            "İspat",
            "Cebirsel İfadelerle İşlemler ve Algoritma"
          ]
        },
        {
          "name": "Dönüşüm",
          "topics": [
            "Yansıma Dönüşümü",
            "Orta Dikme ve Açıortay İnşası"
          ]
        },
        {
          "name": "Geometrik Nicelikler (1)",
          "topics": [
            "Cisimlerin Farklı Yönlerden Görünümleri",
            "Dikdörtgenler Prizmasının Hacmi ve Yüzey Alanı",
            "Hacim Ölçme Birimleri"
          ]
        },
        {
          "name": "Geometrik Nicelikler (2)",
          "topics": [
            "Eşkenar Dörtgen ve Yamuk",
            "Daire ve Daire Diliminin Alanı"
          ]
        },
        {
          "name": "Geometrik Şekiller",
          "topics": [
            "Üçgenlerde Kenarortay ve İnşası, Açıortay, Yükseklik"
          ]
        },
        {
          "name": "İstatistiksel Araştırma Süreci",
          "topics": [
            "Kategorik ve Nicel (Sürekli) Veri Dağılımları"
          ]
        },
        {
          "name": "Veriden Olasılığa",
          "topics": [
            "Teorik Olasılık"
          ]
        }
      ]
    },
    {
      "name": "Türkçe",
      "units": [
        {
          "name": "Okuma ve Anlama",
          "topics": [
            "Sözcükte Anlam (Söz Varlığı)",
            "Eş, Yakın ve Zıt Anlamlı Kelimeler",
            "Gerçek ve Mecaz Anlam",
            "Deyimler, Atasözleri ve Kalıp Sözler",
            "Cümlede Anlam",
            "Paragrafta Anlam: Konu, Ana Fikir ve Yardımcı Fikirler",
            "Çıkarım Yapma (Metnin Derin Anlamı)",
            "Başlık ve Anahtar Kelimeler",
            "Görsel Okuma ve Yorumlama",
            "Hikâye Unsurları",
            "Metnin Bölümleri ve Metin Yapıları",
            "Düşünceyi Geliştirme Yolları",
            "Şiir Bilgisi (Biçim Özellikleri)",
            "Söz Sanatları",
            "Metin Karşılaştırma",
            "Özetleme",
            "Metni Değerlendirme ve Eleştirme",
            "İkna Teknikleri"
          ]
        },
        {
          "name": "Dil Yapıları",
          "topics": [
            "Fiil Çekim Ekleri (Kip, Kişi ve Soru Eki)",
            "Fiilde Zaman (Haber Kipleri)",
            "Dilek Kipleri (Gereklilik, Şart, İstek, Emir)",
            "Zaman İşlevli Fiilimsiler",
            "Durum İşlevli Fiilimsiler",
            "Zarflar (Durum, Zaman, Yer-Yön, Soru ve Miktar)",
            "Özne-Yüklem Uyumu",
            "Fiilde Çatı",
            "Zaman Yönüyle Başlangıç-Bitiş İfadeleri",
            "Sınırlama, İstek ve Sebep-Sonuç İfadeleri"
          ]
        },
        {
          "name": "Yazım ve Noktalama",
          "topics": [
            "Noktalama İşaretleri (Noktalı Virgül, Soru İşareti, Ünlem, Üç Nokta, Tırnak İşareti, Denden İşareti, Yay Ayraç)",
            "Pekiştirmeli Kelimelerin ve İkilemelerin Yazımı",
            "Düzeltme İşareti",
            "Birleşik Kelimelerin Yazımı"
          ]
        },
        {
          "name": "Temalar",
          "topics": [
            "Hayat Boyu Gelişim",
            "Bir Hilal Uğruna",
            "İletişim ve Sosyal İlişkiler",
            "Türk Sanatı",
            "Okuma Kültürü",
            "Hak ve Sorumluluklar"
          ]
        }
      ]
    },
    {
      "name": "Fen Bilimleri",
      "units": [
        {
          "name": "Uzay Çağı",
          "topics": [
            "Türkiye ve Uzay Araştırmaları",
            "Uzayda Neler Var?"
          ]
        },
        {
          "name": "Kuvvet ve Enerjiyi Keşfedelim",
          "topics": [
            "Kuvvet, İş ve Enerji İlişkisi",
            "Enerji Dönüşümleri"
          ]
        },
        {
          "name": "Vücudumuzdaki Sistemler",
          "topics": [
            "Sindirim Sistemi",
            "Dolaşım Sistemi",
            "Solunum Sistemi",
            "Boşaltım Sistemi"
          ]
        },
        {
          "name": "Işığın Kırılması ve Mercekler",
          "topics": [
            "Işığın Kırılması",
            "Mercekler"
          ]
        },
        {
          "name": "Maddenin Doğasına Yolculuk",
          "topics": [
            "Maddenin Tanecikli Yapısı",
            "Saf Maddeler",
            "Karışımlar",
            "Karışımların Ayrılması"
          ]
        },
        {
          "name": "Elektriklenme",
          "topics": [
            "Elektrik Yükleri ve Elektriklenme"
          ]
        },
        {
          "name": "Sürdürülebilir Yaşam ve Enerji",
          "topics": [
            "Besin Zinciri ve Enerji Akışı",
            "Sürdürülebilir Yaşam"
          ]
        }
      ]
    },
    {
      "name": "Sosyal Bilgiler",
      "units": [
        {
          "name": "Birlikte Yaşamak",
          "topics": [
            "Gruplarda ve Sosyal Hayatta İletişimin Önemi",
            "Özel Gereksinimli Bireyler İçin Fırsat Eşitliği",
            "Millî Meseleler Karşısında Türk Toplumunun Tutum ve Davranışları"
          ]
        },
        {
          "name": "Evimiz Dünya",
          "topics": [
            "Küreselleşmenin İnsan ve Toplum Hayatına Etkisi",
            "Bölgesel ve Küresel Sorunların Çözümünde Ülkemizin Rolü"
          ]
        },
        {
          "name": "Ortak Mirasımız",
          "topics": [
            "Osmanlı Devleti’nin Cihan Devleti Hâline Gelmesini Sağlayan Politikalar",
            "Osmanlı Devleti’nin Uygulamaya Koyduğu Yenilikler",
            "Osmanlı Kültür ve Medeniyeti"
          ]
        },
        {
          "name": "Yaşayan Demokrasimiz",
          "topics": [
            "Türkiye Cumhuriyeti’nin Nitelikleri",
            "Türkiye Cumhuriyeti’nin Yönetim Yapısı",
            "Ülkemizde Demokrasinin Gelişimi",
            "Demokrasinin Uygulanma Sürecinde Karşılaşılan Sorunlar"
          ]
        },
        {
          "name": "Hayatımızdaki Ekonomi",
          "topics": [
            "Millî Kalkınma Hamleleri",
            "Ekonomik Gelişmişlik ile Üretim, Dağıtım ve Tüketim Arasındaki Döngü"
          ]
        },
        {
          "name": "Teknoloji ve Sosyal Bilimler",
          "topics": [
            "Bilimsel ve Teknolojik Gelişmelerin Gelecekteki Hayata Etkisi",
            "Sosyal Bilimlerin Çalışma Alanları",
            "Toplumsal Hayatta Karşılaşılabilecek Problemlere Çözüm Üretme"
          ]
        }
      ]
    },
    {
      "name": "İngilizce",
      "units": [
        {
          "name": "School Life & Education",
          "topics": [
            "Extra-curricular activities at school",
            "Competitions and celebrations at school",
            "National days and celebrations",
            "The Simple Present Tense",
            "The Present Progressive Tense (now, at present, today)",
            "Adverbs of frequency",
            "Modals must and can’t (prohibition)"
          ]
        },
        {
          "name": "Classroom Life & Learning",
          "topics": [
            "Technological tools for learning",
            "Learning activities in the classroom",
            "Cardinal numbers (500-1000)",
            "Ordinal numbers (50-100)",
            "The Simple Present Tense vs Present Progressive Tense",
            "Question tags for the Simple Present Tense and Present Progressive Tense",
            "Will for help"
          ]
        },
        {
          "name": "Personal Life & Well-Being",
          "topics": [
            "Body parts, illnesses, and keeping good health",
            "The place of technology in people’s lives",
            "The Simple Past Tense (was/were)",
            "The Simple Past Tense (Regular verbs)",
            "The question tags for to be- was-were and the Simple Past Tense"
          ]
        },
        {
          "name": "Family Life & Home",
          "topics": [
            "Family members’ hobbies (sports, books, films, music, cooking)",
            "Generation gap in the family",
            "Problems and solutions",
            "The Simple Past Tense (Irregular verbs)",
            "Question tags for the Simple Past Tense",
            "Shall for suggestions"
          ]
        },
        {
          "name": "Life in the Neighbourhood & City and Social Life",
          "topics": [
            "Public services in the neighbourhood and city",
            "Life in different kinds of cities",
            "The Past Progressive Tense",
            "Question tags for the Past Progressive Tense"
          ]
        },
        {
          "name": "Life in the World & Culture",
          "topics": [
            "Capitals, landmarks, famous places, and activities in capitals",
            "Sports events in different parts of the world",
            "The Present Perfect Tense with for",
            "Question tags for The Present Perfect Tense"
          ]
        },
        {
          "name": "Life in Nature",
          "topics": [
            "Animals and natural resources in nature",
            "Protecting animals and nature",
            "Zero Conditional",
            "Comparatives of regular and irregular adjectives",
            "Superlatives of regular and irregular adjectives"
          ]
        },
        {
          "name": "Life in the Universe & Future",
          "topics": [
            "Space technology",
            "Life in the future with robots",
            "Be Going to Future Tense",
            "The Simple Future Tense",
            "Question tags for the future with be going to and will"
          ]
        }
      ]
    },
    {
      "name": "Din Kültürü ve Ahlak Bilgisi",
      "units": [
        {
          "name": "Melek ve Ahiret İnancı",
          "topics": [
            "Varlıklar Âlemi",
            "Dünya ve Ahiret Hayatı",
            "Melek ve Ahiret İnancının İnsan Davranışına Etkileri",
            "Bir Sure Öğreniyorum: Nâs Suresi"
          ]
        },
        {
          "name": "Hac, Umre ve Kurban",
          "topics": [
            "Hac ve Umre İbadeti",
            "Kurban İbadeti",
            "Hac ve Kurban İbadetinin Kültürümüze Yansımaları",
            "Bir Sure Öğreniyorum: Kâfirun Suresi"
          ]
        },
        {
          "name": "İslam Düşüncesinde Yorumlar",
          "topics": [
            "Din Anlayışındaki Yorum Farklılıkları",
            "İslam Düşüncesinde Yorum Biçimleri",
            "Kültürümüzdeki Tasavvufi Yorumlar",
            "Alevilik Bektaşilik ile İlgili Temel Kavramlar ve Cem Erkânları"
          ]
        },
        {
          "name": "Peygamber Olarak Hz. Muhammed",
          "topics": [
            "Hz. Muhammed’in Daveti: Mekke Dönemi",
            "Hicret",
            "Hz. Muhammed’in Daveti: Medine Dönemi",
            "Bir Sure Öğreniyorum: Nasr Suresi"
          ]
        },
        {
          "name": "Yaşayan Dünya Dinleri",
          "topics": [
            "Yahudilik",
            "Hristiyanlık",
            "Hinduizm",
            "Budizm"
          ]
        }
      ]
    }
  ],
  "8": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "Sayılar ve Nicelikler",
          "topics": [
            "Gerçek Sayılar",
            "Üslü İfadeler, Özellikleri ve İşlemler",
            "Kareköklü İfadeler",
            "İrrasyonel Sayılar",
            "Gerçek Sayılar ve Sayı Aralıkları"
          ]
        },
        {
          "name": "Cebirsel Düşünme ve Değişimler",
          "topics": [
            "Doğrusal Fonksiyonlar",
            "Dik Koordinat Sistemi",
            "Doğrusal İlişkiden Doğrusal Fonksiyonlara",
            "Doğrusal Fonksiyonların Grafikleri",
            "Doğrusal Fonksiyonlar ve Algoritma"
          ]
        },
        {
          "name": "Geometrik Şekiller",
          "topics": [
            "Üçgende Açı-Kenar İlişkisi",
            "Üçgen Eşitsizliği",
            "Üçgenlerde Eşlik ve Benzerlik",
            "Pisagor Bağıntısı"
          ]
        },
        {
          "name": "Geometrik Nicelikler",
          "topics": [
            "Dik Prizmalar, Dikdörtgen Dik Piramit, Dik Dairesel Silindir ve Dik Dairesel Koninin Yüzey Açınımları",
            "Dik Dairesel Silindirin Yüzey Alanı ve Hacmi"
          ]
        },
        {
          "name": "Dönüşüm",
          "topics": [
            "Dik Koordinat Sisteminde Öteleme ve Yansıma Dönüşümü"
          ]
        },
        {
          "name": "İstatistiksel Araştırma Süreci",
          "topics": [
            "Kategorik ve Nicel (Kesikli-Sürekli) Veri Dağılımları"
          ]
        },
        {
          "name": "Veriden Olasılığa",
          "topics": [
            "Öznel, Deneysel ve Teorik Olasılık İlişkisi"
          ]
        }
      ]
    },
    {
      "name": "Türkçe",
      "units": [
        {
          "name": "Okuma ve Anlama",
          "topics": [
            "Sözcükte Anlam (Söz Varlığı)",
            "Eş, Yakın ve Zıt Anlamlı Kelimeler",
            "Gerçek ve Mecaz Anlam",
            "Deyimler, Atasözleri ve Kalıp Sözler",
            "Cümlede Anlam",
            "Paragrafta Anlam: Konu, Ana Fikir ve Yardımcı Fikirler",
            "Çıkarım Yapma (Metnin Derin Anlamı)",
            "Başlık ve Anahtar Kelimeler",
            "Görsel Okuma ve Yorumlama",
            "Hikâye Unsurları",
            "Metnin Bölümleri ve Metin Yapıları",
            "Düşünceyi Geliştirme Yolları",
            "Şiir Bilgisi (Biçim Özellikleri)",
            "Söz Sanatları",
            "Metin Karşılaştırma",
            "Özetleme",
            "Metni Değerlendirme ve Eleştirme",
            "İkna Teknikleri"
          ]
        },
        {
          "name": "Dil Yapıları",
          "topics": [
            "Gönderim (İsmin Yerine Kullanılan Yapıların Art ve Ön Gönderimi)",
            "Bağlama İşlevli Fiilimsiler",
            "Başkasının Sözünü Aktarma İfadeleri",
            "Yorum İfadeleri",
            "Tartışma İfadeleri"
          ]
        },
        {
          "name": "Yazım ve Noktalama",
          "topics": [
            "Noktalama İşaretleri (Nokta, Virgül, Kısa Çizgi, Tek Tırnak, Köşeli Ayraç)",
            "Birleşik Kelimelerin Yazımı"
          ]
        },
        {
          "name": "Temalar",
          "topics": [
            "İletişim ve Sosyal İlişkiler",
            "Vatan Sevgisi",
            "Doğa ve İnsan",
            "Türk Hikâye Geleneği ve Destanları",
            "Sanat ve Estetik",
            "Akademik Düşünme Dünyası"
          ]
        }
      ]
    },
    {
      "name": "Fen Bilimleri",
      "units": [
        {
          "name": "Mevsimler ve İklim",
          "topics": [
            "Mevsimlerin Oluşumu",
            "İklim ve Hava Olayları"
          ]
        },
        {
          "name": "Yaşamı Kolaylaştıran Kuvvet",
          "topics": [
            "Basit Makineler"
          ]
        },
        {
          "name": "Yaşamın Gizemi",
          "topics": [
            "DNA ve Genetik Kod",
            "Mitoz ve Mayoz",
            "Kalıtım",
            "Mutasyon ve Adaptasyon"
          ]
        },
        {
          "name": "Sesin Dünyası",
          "topics": [
            "Sesin Oluşumu ve Yayılması",
            "Sesin Madde ile Etkileşimi"
          ]
        },
        {
          "name": "Periyodik Tablo ve Maddenin Etkileşimi",
          "topics": [
            "Periyodik Tablo",
            "Fiziksel ve Kimyasal Değişimler",
            "Kimyasal Tepkimeler",
            "Asitler ve Bazlar"
          ]
        },
        {
          "name": "Elektriğin Yolculuğu",
          "topics": [
            "Ampullerin Bağlanma Şekli",
            "Elektrik Enerjisinin Dönüşmesi"
          ]
        },
        {
          "name": "Sürdürülebilir Yaşam ve Madde Döngüleri",
          "topics": [
            "Enerji Dönüşümleri",
            "Madde Döngüleri ve Çevre Sorunları"
          ]
        }
      ]
    },
    {
      "name": "T.C. İnkılap Tarihi ve Atatürkçülük",
      "units": [
        {
          "name": "Mustafa Kemal’in Hayatı",
          "topics": [
            "XIX. Yüzyıl Sonu ve XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya",
            "Mustafa Kemal’in Hayatı",
            "Mustafa Kemal’in Kişilik Özellikleri"
          ]
        },
        {
          "name": "Birinci Dünya Savaşı",
          "topics": [
            "Birinci Dünya Savaşı’nın Nedenleri",
            "Osmanlı Devleti’nin Savaşa Katılması",
            "Osmanlı Devleti’nin Savaştığı Cepheler",
            "Birinci Dünya Savaşı’nın Sonuçları",
            "Birinci Dünya Savaşı’nın Türk Toplumuna Etkileri"
          ]
        },
        {
          "name": "Millî Mücadele",
          "topics": [
            "Mondros Mütarekesi’ne Karşı Tepkiler",
            "Millî Mücadele Hazırlık Süreci",
            "Millî Mücadele Döneminde Siyasi ve Askerî Gelişmeler",
            "Türk Milletinin Millî Mücadele Sürecindeki Rolü"
          ]
        },
        {
          "name": "Türkiye Cumhuriyeti’nin Kuruluşu ve İnkılaplar",
          "topics": [
            "Cumhuriyet’in İlanına Kadar Yaşanan Siyasi ve Diplomatik Gelişmeler",
            "Türk Modernleşmesi ve Atatürk İnkılapları",
            "Atatürk İlke ve İnkılapları Arasındaki İlişki"
          ]
        }
      ]
    },
    {
      "name": "İngilizce",
      "units": [
        {
          "name": "School Life & Education",
          "topics": [
            "School events and celebrations (sports, music, drama)",
            "Developing the environment",
            "National days and celebrations",
            "The Simple Present Tense versus Present Progressive Tense",
            "Obligation with must",
            "Prohibition with mustn’t",
            "Must vs have to",
            "Can to ask for permission",
            "Can for possibility",
            "Question tags for modals"
          ]
        },
        {
          "name": "Classroom Life & Learning",
          "topics": [
            "Preferences for different learning activities",
            "Preferences for different learning technologies",
            "The Simple Present Tense for the Future",
            "The Present Progressive Tense for the Future",
            "Can for ability",
            "Can’t for ability",
            "Have to for obligations in Present",
            "Had to for obligations in the Past",
            "Necessity with Need",
            "Needn’t for permission",
            "Question Tags for Modals"
          ]
        },
        {
          "name": "Personal Life & Well-Being",
          "topics": [
            "Mobile phones and their impact on health and social life",
            "Personal preferences for films and visual arts",
            "The Past Simple Tense",
            "Question tags for the Simple Past Tense",
            "Used to",
            "Past simple of can or can’t for ability",
            "Polite request with could and couldn’t",
            "Shall for suggestions",
            "Should for giving advice"
          ]
        },
        {
          "name": "Family Life & Home",
          "topics": [
            "Relationships, problems and solutions in the family",
            "Different houses and living styles",
            "The Past Progressive Tense",
            "Question Tags",
            "Used to",
            "Adverbial Phrases of Time, Place and Frequency"
          ]
        },
        {
          "name": "Life in the Neighbourhood & City & Social Life",
          "topics": [
            "Sports events in the city and rural areas",
            "Pros and cons of living in rural areas and in the city",
            "The Present Perfect Tense",
            "Question tags",
            "Forming nouns from verbs using -ing"
          ]
        },
        {
          "name": "Life in the World and Culture",
          "topics": [
            "Different cooking styles and preferences in the world",
            "Different food cultures in the world",
            "The Present Perfect Tense",
            "The Simple Past Tense",
            "The Simple Past Tense vs. The Past Progressive Tense",
            "Question tags",
            "Phrasal verbs"
          ]
        },
        {
          "name": "Life in Nature & Global Problems",
          "topics": [
            "Natural disasters and their damage on animals and nature",
            "Natural disasters and their damage on people’s lives",
            "Conditional 1",
            "Wish clauses"
          ]
        },
        {
          "name": "Life in the Universe & Future",
          "topics": [
            "Transport in the future",
            "Self-driving cars",
            "Flying vehicles in the future",
            "Be going to Future Tense",
            "The Simple Future Tense (will)",
            "Question Tags for the future"
          ]
        }
      ]
    },
    {
      "name": "Din Kültürü ve Ahlak Bilgisi",
      "units": [
        {
          "name": "Kader İnancı",
          "topics": [
            "Allah’ın Ölçüsü: Kader ve Kaza",
            "Kaderle İlgili Kavramlar",
            "Kader İnancının İnsan Davranışına Etkisi",
            "Bir Sure Öğreniyorum: Tebbet Suresi"
          ]
        },
        {
          "name": "Zekât ve Sadaka",
          "topics": [
            "Paylaşma ve Yardımlaşma İbadeti: Zekât",
            "Allah’ın Sevgisini ve Hoşnutluğunu Kazanmanın Yolu: Sadaka",
            "Zekât ve Sadaka İbadetinin Kültürümüze Yansımaları",
            "Bir Sure Öğreniyorum: Maun Suresi"
          ]
        },
        {
          "name": "Din ve Sosyal Hayat",
          "topics": [
            "Dinin Temel Gayesi",
            "Dinin Sosyal Hayattaki İşlevi",
            "Bir Sure Öğreniyorum: Asr Suresi"
          ]
        },
        {
          "name": "Kur’an ve İnsan",
          "topics": [
            "Kur’an-ı Kerim’de İnsanın Özellikleri",
            "Kur’an-ı Kerim’in Rehberliği",
            "Kur’an’ın Örnek Gösterdiği İnsan: Hz. Muhammed (sav)",
            "Hz. Lokman’dan Öğütler",
            "Bir Ayet Öğreniyorum: Ayetelkürsi"
          ]
        },
        {
          "name": "Müslümanların Bilim ve Kültüre Katkısı",
          "topics": [
            "İslam Kültür ve Medeniyetinin Esasları",
            "İslam’da Bilimin Önemi",
            "Müslüman Bilim İnsanları"
          ]
        }
      ]
    }
  ],
  "9": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "Sayılar",
          "topics": [
            "Gerçek Sayıların Üslü ve Köklü Gösterimleri ile Yapılan İşlemler",
            "Gerçek Sayı Aralıklarının Gösterimi ve Aralıklarla İlgili İşlemlerde Küme Sembollerinin Kullanımı",
            "Sayı Kümeleri ve İşlem Özellikleri",
            "Gerçek Sayıların İşlem Özelliklerini Cebirsel Olarak İfade Etme"
          ]
        },
        {
          "name": "Nicelikler ve Değişimler",
          "topics": [
            "Doğrusal Fonksiyonlar ve Nitel Özellikleri",
            "Mutlak Değer Fonksiyonu ve Nitel Özellikleri",
            "Doğrusal Fonksiyonlarla İfade Edilebilen Denklem ve Eşitsizlikler İçeren Problemler"
          ]
        },
        {
          "name": "Geometrik Şekiller",
          "topics": [
            "Üçgende Açı ve Kenarla İlgili Özellikler ve Bu Özellikler Arasındaki İlişkiler"
          ]
        },
        {
          "name": "Eşlik ve Benzerlik",
          "topics": [
            "Geometrik Dönüşümler",
            "Eşlik ve Benzerlik Koşulları",
            "Benzer Üçgenler Oluşturma",
            "Tales, Öklid ve Pisagor Teoremleri",
            "Eşlik ve Benzerlik Problemleri"
          ]
        },
        {
          "name": "Algoritma ve Bilişim",
          "topics": [
            "Algoritma Temelli Problemler",
            "Mantık Bağlaçları ve Niceleyiciler",
            "Mantık Bağlaçları ve Niceleyicilerin Algoritmik Problemlerde Kullanımı"
          ]
        },
        {
          "name": "İstatistiksel Araştırma Süreci",
          "topics": [
            "Tek Nicel Değişkenli Veri Dağılımları",
            "Başkaları Tarafından Oluşturulan Tek Nicel Değişkenli Veri Dağılımlarını İnceleme"
          ]
        },
        {
          "name": "Veriden Olasılığa",
          "topics": [
            "Deneysel Olasılık",
            "Teorik Olasılık"
          ]
        }
      ]
    },
    {
      "name": "Türk Dili ve Edebiyatı",
      "units": [
        {
          "name": "Sözün İnceliği",
          "topics": [
            "Şiir",
            "Deneme",
            "Mülakat",
            "Betimleme Paragrafı"
          ]
        },
        {
          "name": "Anlam Arayışı",
          "topics": [
            "Hikâye",
            "Anı (Hatıra)",
            "İstiklal Marşı",
            "Cumhuriyet Dönemi Şiiri"
          ]
        },
        {
          "name": "Anlamın Yapı Taşları",
          "topics": [
            "Hikâye",
            "Gezi Yazısı",
            "Şiir",
            "Belgesel",
            "Bilgi Görseli"
          ]
        },
        {
          "name": "Dilin Zenginliği",
          "topics": [
            "Roman",
            "Tiyatro",
            "Eleştiri",
            "Otobiyografi"
          ]
        },
        {
          "name": "Dil Bilgisi",
          "topics": [
            "Ses Bilgisi",
            "Şekil Bilgisi (Kök ve Ekler)",
            "Yazım Kuralları",
            "Noktalama İşaretleri"
          ]
        }
      ]
    },
    {
      "name": "Fizik",
      "units": [
        {
          "name": "Fizik Bilimi ve Kariyer Keşfi",
          "topics": [
            "Fizik Bilimi",
            "Fizik Biliminin Alt Dalları",
            "Fizik Bilimine Yön Verenler",
            "Fizik Bilimi ile İlgili Kariyer Keşfi"
          ]
        },
        {
          "name": "Kuvvet ve Hareket",
          "topics": [
            "Temel ve Türetilmiş Nicelikler",
            "Skaler ve Vektörel Nicelikler",
            "Vektörler",
            "Doğadaki Temel Kuvvetler",
            "Hareket ve Hareket Türleri"
          ]
        },
        {
          "name": "Akışkanlar",
          "topics": [
            "Basınç",
            "Sıvılarda Basınç",
            "Açık Hava Basıncı",
            "Kaldırma Kuvveti",
            "Bernoulli İlkesi"
          ]
        },
        {
          "name": "Enerji",
          "topics": [
            "İç Enerji, Isı ve Sıcaklık Arasındaki İlişki",
            "Isı, Öz Isı, Isı Sığası ve Sıcaklık Farkı Arasındaki İlişki",
            "Hâl Değişimi",
            "Isıl Denge",
            "Isı Aktarım Yolları",
            "Isı İletim Hızı"
          ]
        }
      ]
    },
    {
      "name": "Kimya",
      "units": [
        {
          "name": "Kimya Hayattır",
          "topics": [
            "Günlük Hayatta Kimya",
            "Kimyasal Maddelerin Kullanımı ve Güvenlik",
            "Kimyanın Alt Disiplinleri",
            "Kimya Alanında Kariyer Olanakları"
          ]
        },
        {
          "name": "Atomdan Periyodik Tabloya",
          "topics": [
            "Atom Teorileri (Bohr Atom Teorisi, Modern Atom Teorisi) ve Atomun Yapısı",
            "Atom Orbitalleri ve Elektron Dizilimi",
            "Periyodik Tabloda Yer Bulma",
            "Periyodik Özellikler (Atom Yarıçapı, İyonlaşma Enerjisi ve Elektronegatiflik)"
          ]
        },
        {
          "name": "Etkileşimler",
          "topics": [
            "Metalik Bağ",
            "İyonik Bağ",
            "Kovalent Bağ",
            "Lewis Nokta Yapısı",
            "Molekül Polarlığı ve Apolarlığı",
            "Bileşiklerin Adlandırılması"
          ]
        },
        {
          "name": "Etkileşimden Maddeye",
          "topics": [
            "Moleküller Arası Etkileşimler",
            "Katılar ve Özellikleri (Amorf ve Kristal Katılar)",
            "Sıvılar ve Özellikleri (Kaynama Sıcaklığı ve Buhar Basıncı, Viskozite, Adezyon ve Kohezyon Kuvvetleri, Yüzey Gerilimi)"
          ]
        },
        {
          "name": "Nanoparçacıklar ve Ekolojik Sürdürülebilirlik",
          "topics": [
            "Metal Nanoparçacıklar",
            "Metal, Alaşım ve Metal Nanoparçacıkların Çevresel Etkileri",
            "Yeşil Kimyanın Atık Önleme İlkesi"
          ]
        }
      ]
    },
    {
      "name": "Biyoloji",
      "units": [
        {
          "name": "Yaşam Bilimi: Biyoloji",
          "topics": [
            "Biyolojinin Önemi",
            "Biyoloji Biliminin Gelişimindeki Dönüm Noktaları",
            "Bilimin Doğası",
            "Bilimsel Araştırma Süreçleri",
            "Bilim Etiği",
            "Canlıların Ortak Özellikleri"
          ]
        },
        {
          "name": "Temel Bileşenler",
          "topics": [
            "İnorganik Moleküller (Su, Mineraller)",
            "Karbohidratlar",
            "Lipitler",
            "Proteinler",
            "Enzimler",
            "Nükleik Asitler (DNA ve RNA’nın Yapısı)",
            "Vitaminler"
          ]
        },
        {
          "name": "Hücrenin Organizasyonu",
          "topics": [
            "Prokaryot ve Ökaryot Hücre",
            "Hücre Zarı",
            "Sitoplazma ve Sitoplazmik Yapılar",
            "Organeller ve Çekirdek",
            "Hücre Zarından Madde Geçişleri (Pasif Taşıma, Aktif Taşıma, Endositoz, Ekzositoz)"
          ]
        },
        {
          "name": "Sınıflandırma ve Biyoçeşitlilik",
          "topics": [
            "Sınıflandırmada Temel Yaklaşımlar ve Modern Sınıflandırma",
            "Üç Üst Âlem (Domain) Sisteminde Yer Alan Canlılar ve Genel Özellikleri",
            "Biyoçeşitlilik"
          ]
        }
      ]
    },
    {
      "name": "Tarih",
      "units": [
        {
          "name": "Geçmişin İnşa Sürecinde Tarih",
          "topics": [
            "Tarih Öğrenmenin Faydaları",
            "Tarihin Doğası",
            "Tarihsel Bilginin Üretim Süreci",
            "Tarih Araştırma ve Yazımında Dijitalleşme"
          ]
        },
        {
          "name": "Eski Çağ Medeniyetleri",
          "topics": [
            "Tarım Devrimi’nin Eski Çağ Medeniyetlerindeki Yerleşmeye ve Ekonomiye Etkisi",
            "Eski Çağ Medeniyetlerinde Yönetim ve Ordu",
            "Eski Çağ Medeniyetlerinde Hukuk",
            "Eski Çağ’da İnançlar ile Bilim ve Sanat Anlayışları",
            "Türklerde Konargöçer Yaşam"
          ]
        },
        {
          "name": "Orta Çağ Medeniyetleri",
          "topics": [
            "Orta Çağ’da Yaşanan Kitlesel Göçler",
            "Orta Çağ’daki Başlıca Devletlerin Yönetim ve Ordu Yapıları",
            "Orta Çağ’daki Ticaret Yolları",
            "Orta Çağ’daki Başlıca Medeniyet Havzalarında Bilim, Kültür ve Sanat"
          ]
        }
      ]
    },
    {
      "name": "Coğrafya",
      "units": [
        {
          "name": "Coğrafyanın Doğası",
          "topics": [
            "Coğrafya Biliminin Konusu ve Bölümleri",
            "Niçin Coğrafya Öğrenmeliyiz?",
            "Coğrafya Biliminin Gelişimi"
          ]
        },
        {
          "name": "Mekânsal Bilgi Teknolojileri",
          "topics": [
            "Mekânın Aynası Haritalar",
            "Türkiye’nin Coğrafi Konumu",
            "Mekânsal Bilgi Teknolojilerinin Bileşenleri"
          ]
        },
        {
          "name": "Doğal Sistemler ve Süreçler",
          "topics": [
            "Hava Olayları ve Günlük Hayata Etkileri",
            "İklim Sisteminin Bileşen ve Değişkenleri",
            "İklim Türleri",
            "İklim Sisteminde Yaşanan Değişiklikler"
          ]
        },
        {
          "name": "Beşerî Sistemler ve Süreçler",
          "topics": [
            "Nüfusun Tarihsel Değişimi ve Geleceği",
            "Nüfusun Dağılışı ve Hareketleri",
            "Demografik Dönüşüm ve Nüfus Piramitleri",
            "Nüfusla İlgili Fırsat, Sorun ve Politikalar"
          ]
        },
        {
          "name": "Ekonomik Faaliyetler ve Etkileri",
          "topics": [
            "Ekonomik Faaliyetleri Etkileyen Coğrafi Faktörler"
          ]
        },
        {
          "name": "Afetler ve Sürdürülebilir Çevre",
          "topics": [
            "Tehlike, Risk ve Afet",
            "Afet Türleri",
            "Bütüncül Afet Yönetimi"
          ]
        },
        {
          "name": "Bölgeler, Ülkeler ve Küresel Bağlantılar",
          "topics": [
            "Bölge ve Bölge Sınırı"
          ]
        }
      ]
    },
    {
      "name": "İngilizce",
      "units": [
        {
          "name": "School Life",
          "topics": [
            "Students of different countries, nationalities, and languages",
            "Capitals of their countries, and tourist attractions",
            "Activities in their capitals and countries",
            "National days and celebrations",
            "To be in the Simple Present Tense (am, is, are)",
            "Modal Can"
          ]
        },
        {
          "name": "Classroom Life",
          "topics": [
            "Classmates, friendships, daily and study routines, habits, and activities",
            "The Simple Present Tense"
          ]
        },
        {
          "name": "Personal Life: Physical Appearance & Personality",
          "topics": [
            "Physical appearance in terms of physical features and personality in terms of personal traits and characters",
            "The Present Simple Tense",
            "Too & enough"
          ]
        },
        {
          "name": "Family Life",
          "topics": [
            "Family members’ jobs, work routines, work activities and workplaces",
            "The Simple Present Tense",
            "Prepositions of place"
          ]
        },
        {
          "name": "Life in the House & Neighbourhood",
          "topics": [
            "Types of houses, rooms, furniture and activities in the house",
            "The Simple Present Tense",
            "Time expressions for the present time",
            "The Present Progressive Tense",
            "Possessive adjectives"
          ]
        },
        {
          "name": "Life in the City & Country",
          "topics": [
            "Local and international food culture and food festivals in the city",
            "The Simple Present Tense with or",
            "The Simple Present Tense with Wh- question words",
            "The Present Progressive Tense",
            "The Simple Present Tense vs the Present Progressive Tense"
          ]
        },
        {
          "name": "Life in the World & Nature",
          "topics": [
            "Nature, endangered animals, their natural living conditions and habitats, and protection of them",
            "The Simple Present Tense",
            "The Simple Past Tense with Verb To be",
            "Should as a modal verb"
          ]
        },
        {
          "name": "Life in the Universe & Future",
          "topics": [
            "Films, film genres, futuristic films with futuristic ideas, and technology",
            "The Simple Present Tense",
            "The Simple Future Tense (Positive, negative, Interrogative)"
          ]
        }
      ]
    },
    {
      "name": "Din Kültürü ve Ahlak Bilgisi",
      "units": [
        {
          "name": "Allah-İnsan İlişkisi",
          "topics": [
            "İnsan ve İnsanın Yaratılışı",
            "Doğruyu Arayan Bir Varlık Olarak İnsan",
            "İbadet ve Dua Eden Bir Varlık Olarak İnsan",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "İslam’da İnanç Esasları",
          "topics": [
            "İman ve İmanın Mahiyeti",
            "İslam’da İman Esasları",
            "İmanın Bireye ve Topluma Kazandırdıkları",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "İslam’da İbadetler",
          "topics": [
            "İslam’da İbadetin Kapsamı",
            "İslam’da Temel İbadetler",
            "İnsan ve İbadet",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "İslam’da Ahlak İlkeleri",
          "topics": [
            "İslam’da Ahlakın Mahiyeti",
            "Ahlakın Temel Unsurları",
            "Ahlaki Tutum ve Davranışlar",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "Kur’an’a Göre Hz. Muhammed",
          "topics": [
            "Hz. Muhammed’in Beşerî ve Peygamberlik Yönü",
            "Hz. Muhammed’in Örnekliği",
            "Kültürümüzde Hz. Muhammed ve Ehlibeyt Sevgisi",
            "Kur’an’dan Mesajlar"
          ]
        }
      ]
    }
  ],
  "10": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "Geometrik Şekiller",
          "topics": [
            "Dik Üçgende Trigonometrik Oranlar ve Trigonometrik Özdeşlikler",
            "Üçgende Yardımcı Elemanlar",
            "Üçgenin Alanı",
            "Sinüs ve Kosinüs Teoremleri"
          ]
        },
        {
          "name": "İstatistiksel Araştırma Süreci",
          "topics": [
            "İki Kategorik Değişkenli Veriler",
            "Başkaları Tarafından Oluşturulan İki Kategorik Değişkenli Verileri İnceleme"
          ]
        },
        {
          "name": "Sayılar",
          "topics": [
            "Bir Doğal Sayının Asal Çarpanları, Bölenleri",
            "En Büyük Ortak Bölen, En Küçük Ortak Kat",
            "Bölünebilme"
          ]
        },
        {
          "name": "Nicelikler ve Değişimler",
          "topics": [
            "Gerçek Sayılarda Fonksiyon Olma Şartları",
            "Karesel Fonksiyon ve Nitel Özellikleri",
            "Karekök Fonksiyonu ve Nitel Özellikleri",
            "Rasyonel Fonksiyon ve Nitel Özellikleri",
            "Doğrusal, Karesel, Karekök ve Rasyonel Fonksiyonların Ters Fonksiyonları",
            "Gerçek Sayılarda Tanımlı Fonksiyonlarla İfade Edilebilen Denklem ve Eşitsizlikler İçeren Problemler"
          ]
        },
        {
          "name": "Sayma, Algoritma ve Bilişim",
          "topics": [
            "Sayma Stratejileri",
            "Cebirsel ve Fonksiyonel İşlemlerin Algoritmik Yapısı"
          ]
        },
        {
          "name": "Analitik İnceleme",
          "topics": [
            "Dik Koordinat Sisteminde Noktanın Analitik İncelenmesi",
            "Dik Koordinat Sisteminde Doğrunun Analitik İncelenmesi"
          ]
        },
        {
          "name": "Veriden Olasılığa",
          "topics": [
            "Koşullu Olasılık",
            "Bayes Teoremi"
          ]
        }
      ]
    },
    {
      "name": "Türk Dili ve Edebiyatı",
      "units": [
        {
          "name": "Sözün Ezgisi",
          "topics": [
            "Koşuk",
            "Türkü",
            "Koşma",
            "Ninni",
            "Masal",
            "Şiir Dinletisi"
          ]
        },
        {
          "name": "Kelimelerin Ritmi",
          "topics": [
            "Gazel",
            "Saf Şiir",
            "Söyleşi",
            "Podcast"
          ]
        },
        {
          "name": "Dünden Bugüne",
          "topics": [
            "Destan",
            "Mesnevi",
            "Fabl"
          ]
        },
        {
          "name": "Nesillerin Mirası",
          "topics": [
            "Dede Korkut Hikâyeleri",
            "Tanzimat Dönemi Şiiri",
            "Servetifünun Dönemi Romanı",
            "Fecriati Dönemi Şiiri",
            "Millî Edebiyat Dönemi Hikâyesi"
          ]
        },
        {
          "name": "Dil Bilgisi",
          "topics": [
            "İsimler ve Sıfatlar",
            "İsim ve Sıfat Tamlamaları",
            "Zamir, Edat, Bağlaç ve Ünlem",
            "Fiiller",
            "Fiilimsiler"
          ]
        }
      ]
    },
    {
      "name": "Fizik",
      "units": [
        {
          "name": "Kuvvet ve Hareket",
          "topics": [
            "Sabit Hızlı Hareket",
            "Bir Boyutta Sabit İvmeli Hareket"
          ]
        },
        {
          "name": "Enerji",
          "topics": [
            "İş, Enerji ve Güç",
            "Enerji Biçimleri",
            "Mekanik Enerji",
            "Enerji Kaynakları"
          ]
        },
        {
          "name": "Elektrik",
          "topics": [
            "Basit Elektrik Devreleri",
            "Elektrik Akımı",
            "Ohm Yasası",
            "Dirençlerin Bağlanması",
            "Üreteçlerin Bağlanması",
            "Elektrik Akımının Oluşturabileceği Tehlikelere Karşı Alınması Gereken Önlemler",
            "Topraklamanın Önemi"
          ]
        },
        {
          "name": "Dalgalar",
          "topics": [
            "Periyodik Hareketler",
            "Dalgaların Temel Kavramları",
            "Dalgaların Sınıflandırılması",
            "Dalgaların Yayılma Süratini Etkileyen Etmenler",
            "Su Dalgalarında Yansıma ve Kırılma",
            "Rezonans ve Deprem"
          ]
        }
      ]
    },
    {
      "name": "Kimya",
      "units": [
        {
          "name": "Kimyasal Tepkimeler",
          "topics": [
            "Kimyasal Değişimin Göstergeleri",
            "Kimyasal Tepkimelerin Oluşumu",
            "Kimyasal Tepkime Türleri",
            "Mol Kavramı",
            "Kimyasal Tepkime Denklemlerinin Denkleştirilmesi",
            "Kimyasal (Stokiyometrik) Hesaplamalar"
          ]
        },
        {
          "name": "Gazlar",
          "topics": [
            "Gazların Özellikleri ve Kinetik Moleküler Teori",
            "Gaz Yasaları",
            "İdeal Gaz Yasası",
            "Graham Difüzyon ve Efüzyon Yasası"
          ]
        },
        {
          "name": "Çözeltiler",
          "topics": [
            "Çözünme Süreci",
            "Maddelerin Birbiri İçindeki Çözünebilirliği",
            "Çözünme Olayının Sınıflandırılması",
            "Çözünürlük",
            "Çözünürlüğe Etki Eden Faktörler (Sıcaklık, Basınç ve Madde Cinsi)",
            "Çözeltilerin Sınıflandırılması",
            "Derişim Birimleri (Molarite ve ppm)",
            "Koligatif Özellikler (Kaynama Noktası Yükselmesi ve Donma Noktası Düşmesi)"
          ]
        },
        {
          "name": "Yeşil Kimya, Çevresel ve Ekolojik Sürdürülebilirlik",
          "topics": [
            "Makro ve Mikro Ölçekli Deneyler",
            "Atmosferdeki Tepkimeler ve Küresel Sorunlar"
          ]
        }
      ]
    },
    {
      "name": "Biyoloji",
      "units": [
        {
          "name": "Güneşten Besinlere",
          "topics": [
            "Canlılık İçin Enerjinin Önemi (ATP)",
            "Fotosentez",
            "Fotosentez Hızına Etki Eden Çevresel Faktörler",
            "Kemosentez"
          ]
        },
        {
          "name": "Besinlerden Enerjiye",
          "topics": [
            "Sindirim (Hücre İçi Sindirim ve Hücre Dışı Sindirim)",
            "Canlılarda Sindirim Yapıları",
            "İnsanda Sindirim, Emilim ve Taşınma",
            "Hücresel Solunum (Glikoliz, Sitrik Asit Döngüsü, Elektron Taşıma Sistemi)",
            "Besinlerin Solunuma Katılma Yolları",
            "Fermantasyon",
            "Enerji-Metabolizma İlişkisi"
          ]
        },
        {
          "name": "Ekosistemler",
          "topics": [
            "Ekosistemin Bileşenleri",
            "Tür İçi ve Türler Arası Etkileşimler",
            "Süksesyon",
            "Popülasyon Dinamikleri",
            "Ekosistemde Madde ve Enerji Akışı",
            "Madde Döngüleri (Su, Karbon, Azot Döngüsü)"
          ]
        },
        {
          "name": "Ekolojik Sürdürülebilirlik",
          "topics": [
            "Ekolojik Sürdürülebilirliğin Önemi",
            "Ekolojik Sürdürülebilirliği Kısıtlayan/Engelleyen Durumlar",
            "Ekolojik Sürdürülebilirliğin Sağlanması"
          ]
        }
      ]
    },
    {
      "name": "Tarih",
      "units": [
        {
          "name": "Türkistan’dan Türkiye’ye (1040-1299)",
          "topics": [
            "Türkistan’dan Türkiye’ye Uzanan Süreçte Meydana Gelen Önemli Askerî Mücadeleler",
            "Türkistan’dan Türkiye’ye Uzanan Süreçte Türk Devlet ve Ordu Teşkilatında Meydana Gelen Değişim",
            "Türkistan’dan Türkiye’ye Uzanan Süreçte Türklerin Sosyal Yaşamları ve Ekonomik Faaliyetleri",
            "Türk-İslam Medeniyetinin Bilim, Kültür, Eğitim ve Sanat Alanlarında Ortaya Çıkardığı Etkiler"
          ]
        },
        {
          "name": "Beylikten Devlete Osmanlı (1299-1453)",
          "topics": [
            "Osmanlı Devleti’nin Kuruluşuna Dair Farklı Görüşler",
            "Osmanlı Devleti’nin Anadolu ve Rumeli’deki Siyasi ve Askerî Mücadeleleri",
            "Osmanlı Devleti’nin Devletleşme Süreci ile Ordu, Hukuk ve Toprak Sistemleri Arasındaki İlişkiler",
            "Osmanlı Devleti’nin Fethettiği Topraklarda Kalıcı Olabilmek İçin İzlediği Politikalar",
            "Osmanlı Devleti’nin İlim ve İrfan Geleneğinin Oluşmasında Mekânların ve Kişilerin Etkisi"
          ]
        },
        {
          "name": "Cihan Devleti Osmanlı (1453-1683)",
          "topics": [
            "1453-1683 Yılları Arasındaki Siyasi ve Askerî Mücadeleler",
            "Osmanlı Devleti’nin Yönetim ve Ordu Yapısında Meydana Gelen Değişim",
            "Avrupa’nın Sömürgeci Politikalarının Etkileri",
            "Osmanlı Devleti’ndeki Önemli İsyanların Neden ve Sonuçları",
            "1453-1683 Yılları Arasında Osmanlı Devleti’nde Bilim, Kültür, Eğitim ve Sanat Alanında Yaşanan Gelişmeler"
          ]
        }
      ]
    },
    {
      "name": "Coğrafya",
      "units": [
        {
          "name": "Coğrafyanın Doğası",
          "topics": [
            "Coğrafi Bakış"
          ]
        },
        {
          "name": "Mekânsal Bilgi Teknolojileri",
          "topics": [
            "CBS ve Uzaktan Algılamanın Uygulama Alanları",
            "Mekânsal Verilerin Haritalara Aktarılması"
          ]
        },
        {
          "name": "Doğal Sistemler ve Süreçler",
          "topics": [
            "Tektonik Süreçler",
            "İklim ve Kayaç Yapısının Aşınma ve Çözünme Süreçlerine Etkisi",
            "Aşınım ve Birikim Süreçlerinin Yeryüzü Şekillerinin Oluşumuna Etkisi",
            "Yeryüzü Şekilleri ile İlgili Gözlem ve Saha Çalışması",
            "Yeryüzü Şekilleri ile Beşerî Faaliyetler Arasındaki Etkileşim"
          ]
        },
        {
          "name": "Beşerî Sistemler ve Süreçler",
          "topics": [
            "Yerleşmelerin Kuruluşu ve Gelişimi",
            "Yerleşmelerin Fonksiyonları"
          ]
        },
        {
          "name": "Ekonomik Faaliyetler ve Etkileri",
          "topics": [
            "Ekonomik Faaliyetlerin Özellikleri",
            "Ekonomik Sektörler ve Gelişmişlik",
            "Türkiye Ekonomisinin Sektörel Dağılımı"
          ]
        },
        {
          "name": "Afetler ve Sürdürülebilir Çevre",
          "topics": [
            "Afetlerle Mücadelede İyi Uygulama Örnekleri",
            "Afetlere Karşı Dirençli Yaşam Alanları",
            "Afetlerden Korunma",
            "Afet Bilinci"
          ]
        },
        {
          "name": "Bölgeler, Ülkeler ve Küresel Bağlantılar",
          "topics": [
            "Türk Kültürünün Mekânsal Özellikleri"
          ]
        }
      ]
    },
    {
      "name": "Felsefe",
      "units": [
        {
          "name": "Felsefenin Doğası",
          "topics": [
            "Felsefenin Anlamı",
            "Felsefi Düşüncenin Özellikleri",
            "Felsefi Düşüncenin Gelişimi",
            "Felsefi Sorunun Temel Özellikleri",
            "Felsefenin Diğer Alanlarla İlişkisi",
            "Felsefenin Bireysel ve Toplumsal İşlevi"
          ]
        },
        {
          "name": "Felsefe, Mantık ve Argümantasyon",
          "topics": [
            "Düşünme ve Dil İlişkisi",
            "Mantık ve Argümantasyonun Temel Kavramları",
            "Argümantasyonun Yapısı"
          ]
        },
        {
          "name": "Varlık Felsefesi",
          "topics": [
            "Varlık Felsefesinin Konusu ve Temel Kavramları",
            "Varlık Felsefesinin Temel Problemleri (Varlığın Var Olup Olmadığı, Varlığın Ne Olduğu)"
          ]
        },
        {
          "name": "Bilgi Felsefesi",
          "topics": [
            "Bilgi Felsefesinin Konusu ve Temel Kavramları",
            "Bilgi Felsefesinin Temel Problemleri (Bilginin İmkânı, Kaynağı ve Doğruluk Ölçütleri)"
          ]
        },
        {
          "name": "Ahlak Felsefesi",
          "topics": [
            "Ahlak Felsefesinin Konusu ve Temel Kavramları",
            "Ahlak Felsefesinin Temel Problemleri (Evrensel Ahlak Yasasının İmkânı, Özgürlük-Sorumluluk İlişkisi)"
          ]
        },
        {
          "name": "Estetik ve Sanat Felsefesi",
          "topics": [
            "Estetik ve Sanat Felsefesinin Konusu ve Temel Kavramları",
            "Estetik ve Sanat Felsefesinin Temel Problemleri (Sanatın Ne Olduğu, Güzellik ve Ortak Estetik Yargıların İmkânı)"
          ]
        },
        {
          "name": "Siyaset Felsefesi",
          "topics": [
            "Siyaset Felsefesinin Konusu ve Temel Kavramları",
            "Siyaset Felsefesinin Temel Problemleri (Devletin Kökeni, İktidarın Kaynağı ve Meşruiyeti, İdeal Düzen ve Ütopyalar)"
          ]
        },
        {
          "name": "Din Felsefesi",
          "topics": [
            "Din Felsefesinin Konusu ve Temel Kavramları",
            "Din Felsefesinin Temel Problemleri (Tanrı’nın Varlığına İlişkin Görüşler, Tanrı’nın Varlığına Yönelik Argüman, Evrenin Sonluluğu ve Sonsuzluğu, Ruhun Ölümsüzlüğü)"
          ]
        },
        {
          "name": "Bilim Felsefesi",
          "topics": [
            "Bilim Felsefesinin Konusu ve Temel Kavramları",
            "Bilim Felsefesinin Temel Problemleri (Bilimin Ne Olduğu, Bilimi Oluşturan Unsurlar)"
          ]
        }
      ]
    },
    {
      "name": "İngilizce",
      "units": [
        {
          "name": "School Life & Education",
          "topics": [
            "Different types of schools in the world",
            "Regular and extracurricular activities in different types of schools",
            "School anxiety and stress",
            "National days and celebrations",
            "The Simple Present Tense vs The Present Progressive Tense",
            "Nothing, something, anything",
            "Question tags for The Simple Present Tense & The Present Progressive Tense",
            "Adverbs of frequency",
            "Questions: who, where, when, how, why, what kind of, what…like",
            "Must/can’t for deduction",
            "Object pronouns"
          ]
        },
        {
          "name": "Classroom Life & Learning",
          "topics": [
            "Learning activities in the classroom",
            "Personal learning styles",
            "Learning with technology in the classroom",
            "The Simple Future Tense",
            "Be Going to Future Tense",
            "Question tags",
            "Should & ought to for obligation",
            "Must-have to for prohibition and obligation",
            "Reflexive Pronouns",
            "Can for polite requests, permission, probability, and possibility",
            "Might for polite requests and probability",
            "Possessive pronouns",
            "Possessive (‘s)"
          ]
        },
        {
          "name": "Personal Life & Well-Being",
          "topics": [
            "Body parts, human illnesses and diseases",
            "Human nature and human well-being today and in the future",
            "Fashion and personal fashion preferences",
            "All future tenses mixed",
            "Can for ability (revisional)",
            "Comparative Adjectives (Regular, Irregular) (revisional)",
            "The Simple Present vs Present Progressive for Future",
            "Should for Advice",
            "Could for ability",
            "Adjectives (regular, -ing ending, -ed ending)",
            "As…as, same…as, like, alike"
          ]
        },
        {
          "name": "Family Life & Home",
          "topics": [
            "Family members and their daily routines today and in the past",
            "Hobbies and interests of family members (sports & films)",
            "Different types of houses and families from the world",
            "The Simple Past Tense",
            "Question tags",
            "Could for ability",
            "Used to"
          ]
        },
        {
          "name": "Life in the Neighbourhood, City & Social Life",
          "topics": [
            "Activities to do in attractions (cafes, cinemas; gyms, sports clubs)",
            "Getting help from services (pharmacies, hospitals, etc.)",
            "Pros and cons of different types of transportation in the neighbourhood and city",
            "The Past Progressive Tense",
            "The Simple Past Tense vs Past Progressive Tense",
            "Question tags"
          ]
        },
        {
          "name": "Life in the World & Culture",
          "topics": [
            "Continents, countries, and nationalities",
            "Shopping for food and personal food preferences",
            "Food and food culture from different parts of the world",
            "The Present Perfect Tense",
            "Question Tags",
            "Be able to",
            "Countable and Uncountable Nouns (Some, any, much, many)",
            "Need, needn’t for obligation"
          ]
        },
        {
          "name": "Life in Nature & Global Problems",
          "topics": [
            "Natural resources",
            "Global problems related to natural resources",
            "Protecting natural resources",
            "Defining Relative Clauses (that, which, who)",
            "Connecting Words (so…)"
          ]
        },
        {
          "name": "Life in the Universe & the Future",
          "topics": [
            "Planets and space",
            "Life in the universe",
            "Space explorations",
            "Zero Conditional",
            "Conditional 1"
          ]
        }
      ]
    },
    {
      "name": "Din Kültürü ve Ahlak Bilgisi",
      "units": [
        {
          "name": "İslam’da Varlık ve Bilgi",
          "topics": [
            "İslam’da Bilgi ve Bilginin Kaynakları",
            "Allah-Âlem İlişkisi",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "Allah’ı Tanımak",
          "topics": [
            "Allah’ın Varlığının Delilleri",
            "Allah’ı İsim ve Sıfatlarıyla Tanımak",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "İslam’ın Evrensel Mesajları",
          "topics": [
            "İslam’ın Tevhit İlkesi",
            "İslam’da Adalet ve Eşitlik",
            "İslam ve Barış",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "Din, Çevre ve Teknoloji",
          "topics": [
            "İnsan, Çevre ve Ahlak",
            "Teknoloji ve Ahlak",
            "Çevre ve Teknoloji",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "İslam Düşüncesinde İtikadi-Siyasi ve Fıkhi Yorumlar",
          "topics": [
            "Dinî Yorum Farklılıklarının Sebepleri",
            "İslam Düşüncesinde İtikadi-Siyasi ve Fıkhi Yorumlar",
            "Kur’an’dan Mesajlar"
          ]
        }
      ]
    }
  ],
  "11": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "İstatistiksel Araştırma Süreci",
          "topics": [
            "İki Nicel Değişkenli Veriler",
            "Başkaları Tarafından Oluşturulan İki Nicel Değişkenli Verileri İnceleme"
          ]
        },
        {
          "name": "Geometrik Şekiller",
          "topics": [
            "Dörtgenlerin Özellikleri",
            "Özel Dörtgenler Arasındaki İlişkiler",
            "Çokgenlerin Sınıflandırılması",
            "Dışbükey Çokgenlerin Özellikleri",
            "Çokgenlerle İlgili Problemler"
          ]
        },
        {
          "name": "Nicelikler ve Değişimler (1)",
          "topics": [
            "Trigonometrik Fonksiyonlar ve Nitel Özellikleri",
            "Trigonometrik Fonksiyonlarla İfade Edilebilen Denklemler İçeren Problemler"
          ]
        },
        {
          "name": "Nicelikler ve Değişimler (2)",
          "topics": [
            "Üstel Fonksiyonlar ve Nitel Özellikleri",
            "Üstel Fonksiyonların Ters Fonksiyonları",
            "Logaritmik Fonksiyonlar ve Nitel Özellikleri",
            "Üstel ve Logaritmik Fonksiyonlarla İfade Edilebilen Denklem ve Eşitsizlikler İçeren Problemler"
          ]
        },
        {
          "name": "Nicelikler ve Değişimler (3)",
          "topics": [
            "Fonksiyonların Bileşkesi",
            "Fonksiyonlarda Dört İşlem"
          ]
        }
      ]
    },
    {
      "name": "Türk Dili ve Edebiyatı",
      "units": [
        {
          "name": "Bir Diyeceğim Var!",
          "topics": [
            "Karagöz (Geleneksel Türk Tiyatrosu)",
            "Mektup",
            "Dilekçe",
            "E-posta",
            "Sözlü İletişim Engelleri"
          ]
        },
        {
          "name": "Kültür Yolculuğu",
          "topics": [
            "Türk Dünyasından Hikâye",
            "Orhun Abideleri",
            "Anı (Hatıra)",
            "Dîvânu Lugâti’t-Türk",
            "Âşık Tarzı Halk Şiiri (Âşık Atışması)"
          ]
        },
        {
          "name": "Yaşamın İzinde",
          "topics": [
            "Roman",
            "Biyografi",
            "Tezkire",
            "Mülakat",
            "Radyo Tiyatrosu"
          ]
        },
        {
          "name": "Hayatın Aynası",
          "topics": [
            "Tiyatro",
            "Küçürek Hikâye",
            "Belgesel",
            "Afiş"
          ]
        },
        {
          "name": "Dil Bilgisi",
          "topics": [
            "Fiilde Kip ve Çatı",
            "Cümlenin Ögeleri",
            "Cümle Türleri"
          ]
        }
      ]
    },
    {
      "name": "Fizik",
      "units": [
        {
          "name": "Kuvvet ve Hareket",
          "topics": [
            "Serbest Düşme",
            "İki Boyutta Sabit İvmeli Hareket",
            "Newton Hareket Yasaları",
            "Sürtünme Kuvveti",
            "Limit Hız",
            "Çembersel Hareket"
          ]
        },
        {
          "name": "Elektrik ve Manyetizma",
          "topics": [
            "Elektriksel Kuvvet ve Elektriksel Alan",
            "Manyetik Alan ve Manyetik Kuvvet",
            "İndüksiyon Akımı",
            "Transformatörler"
          ]
        },
        {
          "name": "Optik",
          "topics": [
            "Işık Şiddeti, Işık Akısı ve Aydınlanma",
            "Düzlem Aynalar",
            "Küresel Aynalar",
            "Kırılma",
            "Görünür Derinlik",
            "Fiber Optik",
            "Prizmalar",
            "Mercekler"
          ]
        }
      ]
    },
    {
      "name": "Kimya",
      "units": [
        {
          "name": "Enerji",
          "topics": [
            "Tepkimelerde Meydana Gelen Enerji Değişimi",
            "Maddelerin Enerji Kaynağı Olma Potansiyeli",
            "Bağ Enerjileriyle Tepkime Entalpisinin Hesaplanması",
            "Standart Oluşum Entalpileriyle Tepkime Entalpisinin Hesaplanması"
          ]
        },
        {
          "name": "Kimyasal Tepkimelerde Hız",
          "topics": [
            "Kimyasal Tepkimelerin Gerçekleşmesi İçin Gerekli Şartlar",
            "Tepken ve Ürün Derişimleriyle Ortalama Tepkime Hızlarının Hesaplanması",
            "Tepkime Hızına Etki Eden Faktörler (Tepken Cinsi, Maddelerin Fiziksel Hâlleri, Derişim, Sıcaklık, Katı Tepkenin Temas Yüzeyi ve Katalizör)",
            "Tek Basamaklı Kimyasal Tepkimelerin Hız Denkleminin Deneysel Veriler Yardımıyla Belirlenmesi"
          ]
        },
        {
          "name": "Denge",
          "topics": [
            "Tersinir Tepkimelerin Özellikleri",
            "Fiziksel ve Kimyasal Değişimlerde Denge",
            "Denge Sabiti İfadesinin Yazılması",
            "Tepkime Oranı",
            "Dengeyi Etkileyen Faktörler (Derişim, Hacim, Basınç, Sıcaklık ve Katalizör)"
          ]
        },
        {
          "name": "Asit ve Baz Çözeltilerinde Denge",
          "topics": [
            "Suyun Otoiyonizasyonu",
            "Asit Baz Teorilerinin Karşılaştırılması",
            "Asitlerin ve Bazların Kuvveti",
            "Kuvvetli Asit-Zayıf Asit ve Kuvvetli Baz-Zayıf Baz Sulu Çözeltilerindeki pH Hesaplamaları",
            "Kuvvetli Asit ve Kuvvetli Bazların Nötralleşme Tepkimeleri",
            "Kuvvetli Asit-Kuvvetli Baz Titrasyonları",
            "Asidik ve Bazik Ürünlerin Seçiminde Dikkat Edilmesi Gerekenler"
          ]
        },
        {
          "name": "Çözünürlük Dengesi",
          "topics": [
            "Suda Az Çözünen Tuzların Molar Çözünürlükleri",
            "Çözünürlük Çarpımı (Kçç)",
            "Tuzların Çözünürlüğüne Etki Eden Faktörler (Sıcaklık ve Ortak İyon)"
          ]
        },
        {
          "name": "Nanoteknoloji ve Sürdürülebilirlik",
          "topics": [
            "Fermantasyon Yöntemi ile Yeşil Hidrojen Enerjisi ve Hidrojen Gazı Miktarına Etki Eden Faktörler",
            "Nanoteknolojik Ürünlerin Potansiyel Faydaları ve Olası Zararları",
            "Mikroplastik ve Nanoplastiklerin Etkileri"
          ]
        }
      ]
    },
    {
      "name": "Biyoloji",
      "units": [
        {
          "name": "Canlılık ve Tepki",
          "topics": [
            "Farklı Canlıların Uyaranlara Karşı Oluşturduğu Tepkiler"
          ]
        },
        {
          "name": "Bitkilerde Tepki",
          "topics": [
            "Bitkilerde Hormonlar",
            "Bitkilerde Tepki Mekanizmaları (Tropizma, Nasti)"
          ]
        },
        {
          "name": "Hayvanlarda Tepki",
          "topics": [
            "Uyartıların Alınması (Reseptörler, Uyaran Çeşitleri)",
            "Nöronların Yapısı",
            "Nöronlarda Sinyal İletimi ve Sinaps",
            "Duyu Organları",
            "Uyarıların Yorumlanması",
            "Hayvanlarda Sinir Sistemi Farklılıkları",
            "İnsan Sinir Sisteminin Yapısı",
            "Refleksler"
          ]
        },
        {
          "name": "Uyartıya Mekanik Tepki",
          "topics": [
            "Kemik, Eklem ve Kasların Hareketteki Rolü",
            "Kemik ve Kasların Birlikte Çalışma İlişkisi",
            "Kaslarda Kasılmanın Kontrolü",
            "Kasların Kasılma Mekanizması"
          ]
        },
        {
          "name": "Bağışıklık",
          "topics": [
            "Doğal Bağışıklık",
            "Kazanılmış Bağışıklık (Aktif ve Pasif Bağışıklık)",
            "Alerji"
          ]
        },
        {
          "name": "Homeostazi ve Canlılar İçin Önemi",
          "topics": [
            "Farklı Canlı Türlerindeki Homeostatik Yapı ve Sistemler",
            "Homeostatik Süreçler",
            "Pozitif ve Negatif Geri Bildirim",
            "Sinir Sistemi ve Homeostazi",
            "Endokrin Sistem ve Homeostazi",
            "Dolaşım Sistemi ve Homeostazi",
            "Solunum Sistemi ve Homeostazi",
            "Boşaltım Sistemi ve Homeostazi",
            "Sistemlerin Eş Güdümlü Çalışması"
          ]
        },
        {
          "name": "Homeostazinin Sağlanamadığı Durumlarda Oluşabilecek Sağlık Problemleri",
          "topics": [
            "Diabetes Mellitus",
            "Diabetes İnsipidus",
            "Kan Basıncı Anormallikleri",
            "Obezite"
          ]
        }
      ]
    },
    {
      "name": "Tarih",
      "units": [
        {
          "name": "Değişen Dünyada Osmanlı Devleti (1683-1789)",
          "topics": [
            "Osmanlı Devleti’nin 1683-1789 Yılları Arasındaki Siyasi ve Askerî Mücadeleleri",
            "Lale Devri’nin Devlet ve Toplum Hayatına Etkileri",
            "1755 Lizbon ve 1766 İstanbul Depremlerinin Etkileri",
            "Sanayi Devrimi’nin Meydana Getirdiği Siyasi, Sosyal ve Ekonomik Değişim"
          ]
        },
        {
          "name": "Dönüşüm Sürecinde Osmanlı (1789-1908)",
          "topics": [
            "Fransız İhtilali’nin Devlet ve Toplum Hayatında Meydana Getirdiği Değişim",
            "1789-1908 Yılları Arasında Osmanlı Devleti’nde Meydana Gelen Siyasi, Askerî ve İdari Gelişmeler",
            "1789-1908 Yılları Arasında Osmanlı Devleti’nde Bilim, Sanat ve Teknoloji Alanlarında Meydana Gelen Gelişmeler",
            "Osmanlı Devleti’nde Sanayileşme Çabaları"
          ]
        },
        {
          "name": "Savaşlar Sarmalında Osmanlı (1908-1918)",
          "topics": [
            "1908-1918 Yılları Arasında Osmanlı Devleti’nde Meydana Gelen Siyasi ve Askerî Gelişmeler",
            "1908-1918 Yılları Arasında Gerçekleşen Kitlesel Göç ve Salgınlar",
            "Osmanlı Devleti’nin İnsanlık Tarihine Katkıları"
          ]
        }
      ]
    },
    {
      "name": "Coğrafya",
      "units": [
        {
          "name": "Coğrafyanın Doğası",
          "topics": [
            "Mekânsal Sorunlar Karşısında Coğrafya Bilimi"
          ]
        },
        {
          "name": "Mekânsal Bilgi Teknolojileri",
          "topics": [
            "Web Tabanlı CBS Uygulamaları"
          ]
        },
        {
          "name": "Doğal Sistemler ve Süreçler",
          "topics": [
            "Su Kaynakları",
            "Türkiye’deki Su Kaynaklarının Etkileri"
          ]
        },
        {
          "name": "Beşerî Sistemler ve Süreçler",
          "topics": [
            "Yerleşmelerin Mekânsal Organizasyonları",
            "Yerleşmelerin Etki Alanları"
          ]
        },
        {
          "name": "Ekonomik Faaliyetler ve Etkileri",
          "topics": [
            "Tarımsal Faaliyetler ve Gıda Güvencesi",
            "Tarım Uygulamalarında Sürdürülebilirlik",
            "Stratejik ve Kritik Madenler",
            "Enerji Kaynakları",
            "Sanayileşmenin Mekânsal Etkileri"
          ]
        },
        {
          "name": "Afetler ve Sürdürülebilir Çevre",
          "topics": [
            "Gezegen Sınırı",
            "Küresel İklim Değişikliği",
            "Türkiye’de Suyun Sürdürülebilir Kullanımı"
          ]
        },
        {
          "name": "Bölgeler, Ülkeler ve Küresel Bağlantılar",
          "topics": [
            "Türkiye’nin Kültürel Hinterlandı",
            "Tarımsal Üretim: Örnek Ülke",
            "Sanayileşme Süreci: Örnek Ülkeler",
            "Madencilik Faaliyetleri: Örnek Ülke",
            "Enerji Kaynakları: Örnek Ülkeler"
          ]
        }
      ]
    },
    {
      "name": "Felsefe",
      "units": [
        {
          "name": "Çevre Sorunları ve Felsefe",
          "topics": [
            "Çevre ve İnsan İlişkisi",
            "Çevre Etiği (İnsan Merkezci Etik, Canlı Merkezci Etik, Çevre Merkezci Etik)"
          ]
        },
        {
          "name": "Teknoloji ve Hayat",
          "topics": [
            "Teknoloji ve İnsan Hayatı",
            "Teknoloji Bağlamında Ontolojik Problemler (Ontolojik Anlam Kaybı, Yabancılaşma)",
            "Teknoloji Bağlamında Aksiyolojik Problemler (Güvenlik Sorunları, Değerlerin Tahribatı, Ahlaki Eylemin İmkânı)"
          ]
        },
        {
          "name": "Akıl ve İnanç",
          "topics": [
            "Akıl-İnanç İlişkisine Yönelik Felsefi Sorular ve Problemler",
            "Akıl-İnanç İlişkisine Yönelik Felsefi Görüş ve Argümanlar"
          ]
        },
        {
          "name": "Edebiyat ve Felsefe",
          "topics": [
            "Edebiyat Felsefe İlişkisi",
            "Edebiyat Felsefe İlişkisi Problemleri (Edebî Unsurlara Felsefi Bakış, Edebî Unsurlarla Felsefe Yapma)"
          ]
        },
        {
          "name": "Hayatın Anlamı",
          "topics": [
            "Hayatın Anlamına Yönelik Felsefi Sorular ve Problemler (Mutluluk ve Hayat İlişkisi, Varoluş ve Kendi Olma)",
            "Hayatın Anlamına Yönelik Felsefi Görüş ve Argümanlar"
          ]
        },
        {
          "name": "Hukuk ve Felsefe",
          "topics": [
            "Hukuk ve İnsan",
            "Hukukun Doğasına Yönelik Felsefi Problemler [Hukukun Gereği ve Önemi, Hukukun Kaynağı (Doğal Hukuk, Pozitif Hukuk), Ahlak-Hukuk İlişkisi]"
          ]
        }
      ]
    },
    {
      "name": "İngilizce",
      "units": [
        {
          "name": "School Life & Education",
          "topics": [
            "Comparing different types of schools",
            "Comparing different education systems",
            "National days and celebrations",
            "Mixed Present Tenses",
            "Adverbial phrases for time, place, and frequency",
            "Passive Voice of Present Tenses"
          ]
        },
        {
          "name": "Classroom Life & Learning",
          "topics": [
            "Comparing different learning activities and styles",
            "Comparing traditional education and modern education with technology",
            "Will for sudden and spontaneous decisions",
            "Future Simple vs. Be going to Future",
            "Simple Present Tense for Future",
            "Present Progressive for Future",
            "Passive Voice of Future Tenses",
            "Will for asking for help",
            "Could for polite requests"
          ]
        },
        {
          "name": "Personal Life & Well-Being",
          "topics": [
            "Providing well-being with physical health (body and illnesses)",
            "Providing well-being with mental and emotional health",
            "Passive Voice of the Simple Past Tense and The Past Progressive Tense",
            "Superlative adjectives (regular, irregular)",
            "The Simple Past vs The Past Progressive Tense",
            "Basic component sentences (…when…) (…while…)"
          ]
        },
        {
          "name": "Family Life & Home",
          "topics": [
            "Family traditions, values, and customs, family problems related to sharing a house and solutions",
            "Passive Voice of the Past Perfect Tense",
            "The Past Perfect Tense",
            "Question tags"
          ]
        },
        {
          "name": "Life in the Neighbourhood, City & Social Life",
          "topics": [
            "Types of cities, social life in the rural areas and cities",
            "The Present Perfect Progressive Tense",
            "The Present Perfect Tense vs The Present Perfect Progressive Tense",
            "Question tags",
            "Quantifiers (all, both, a lot)",
            "Prepositional phrases (catch up, with…)",
            "Passive voice of the Present Perfect Tense and the Present Perfect Progressive Tense"
          ]
        },
        {
          "name": "Life in the World & Culture",
          "topics": [
            "Cultural (music and art) celebrations in the world",
            "Sports and sports cultures and competitions",
            "Defining and Non-defining Relative Clauses",
            "Connecting words (therefore, thus)"
          ]
        },
        {
          "name": "Life in Nature & Global Problems",
          "topics": [
            "Globalisation, problems and solutions",
            "Environmental issues and solutions",
            "The Future Progressive Tense",
            "Passive Voice of the Future-Progressive Tense"
          ]
        },
        {
          "name": "Life in the Universe & Future",
          "topics": [
            "Future lifestyles, future technologies and inventions",
            "Conditional 2",
            "Wish Clauses"
          ]
        }
      ]
    },
    {
      "name": "Din Kültürü ve Ahlak Bilgisi",
      "units": [
        {
          "name": "Kader, İrade ve Sorumluluk",
          "topics": [
            "İnsan ve Kader",
            "Akıl, İrade ve Sorumluluk Sahibi Bir Varlık Olarak İnsan",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "Din, Felsefe, Bilim ve Sanat",
          "topics": [
            "Din",
            "Din, Felsefe ve Bilim",
            "Din ve Sanat",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "İslam Medeniyeti ve Gönül Coğrafyamız",
          "topics": [
            "Medeniyetin Oluşumu",
            "İslam Medeniyetinin İzleri",
            "İslam Medeniyetinin Bugünü ve Geleceği",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "İnançla İlgili Meseleler",
          "topics": [
            "İnançla İlgili Felsefi Yaklaşımlar",
            "Kötülük Problemi",
            "Yeni Dinî Hareketler ve Din İstismarı",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "Yahudilik ve Hristiyanlık",
          "topics": [
            "Yahudilik",
            "Hristiyanlık"
          ]
        }
      ]
    },
    {
      "name": "Psikoloji (Seçmeli)",
      "units": [
        {
          "name": "Psikoloji ile Tanışma",
          "topics": [
            "Psikolojinin Tanımı, Konusu ve Amaçları",
            "Psikolojinin Alt Dalları",
            "Psikolojinin Yöntem ve Teknikleri"
          ]
        },
        {
          "name": "Gelişimi Anlamak",
          "topics": [
            "Gelişime Genel Bir Bakış",
            "Gelişim Dönemleri",
            "Gelişim Görevleri",
            "İnsan Zekâsı ve Yapay Zekâ",
            "Kişilik ve Benlik-Dijital Benlik"
          ]
        },
        {
          "name": "Nasıl Öğreniriz?",
          "topics": [
            "Öğrenmeye Genel Bir Bakış",
            "Öğrenmeyi Etkileyen Temel Etmenler",
            "Öğrenme Türleri",
            "İnsan Öğrenmesi ve Makine Öğrenmesi"
          ]
        },
        {
          "name": "Bireysel ve Sosyal Uyum",
          "topics": [
            "Uyum Sorunları",
            "Uyum Sağlama",
            "Uyum Sağlamaya Yönelik Yaklaşımlar",
            "Tutum ve Olumlu-Olumsuz Sosyal Davranışlar"
          ]
        }
      ]
    },
    {
      "name": "Sosyoloji (Seçmeli)",
      "units": [
        {
          "name": "Sosyolojinin Doğuşu",
          "topics": [
            "Sosyolojinin Doğuşu",
            "Sosyolojik Düşünme Biçimi",
            "Sosyolojide Kullanılan Farklı Yöntemler"
          ]
        },
        {
          "name": "Türkiye’de Modernleşme ve Sosyoloji",
          "topics": [
            "Osmanlı’dan Cumhuriyet’e Modernleşme Süreci",
            "Tarihsel Bağlamda Türkiye’de Sosyolojinin Doğuşu ve Gelişimi",
            "Türkiye’de Sosyoloji-Edebiyat İlişkisi"
          ]
        },
        {
          "name": "Kültür ve Toplumsal Yapı",
          "topics": [
            "Kültür",
            "Toplumsal Yapı",
            "Toplumsal Tabakalaşma ve Toplumsal Hareketlilik"
          ]
        },
        {
          "name": "Toplumsal Kurumlar",
          "topics": [
            "Aile",
            "Eğitim",
            "Din",
            "Ekonomi",
            "Siyaset",
            "Toplumsal Kurumların Aralarındaki İlişkiler"
          ]
        },
        {
          "name": "Güncel Sosyolojik Meseleler",
          "topics": [
            "İslam Karşıtlığı",
            "Küreselleşmenin Toplumsal Etkileri",
            "Yapay Zekâ Kaynaklı Toplumsal Sorunlar"
          ]
        },
        {
          "name": "Bilim Sosyolojisi",
          "topics": [
            "Bilim ve Toplum İlişkisi",
            "Bilim ve Toplum İlişkisine Eleştirel Yaklaşım"
          ]
        },
        {
          "name": "Örnek Sosyolojik Uygulamalar",
          "topics": [
            "Güncel Toplumsal Meseleler",
            "Aile, Sosyalizasyon ve Suç İlişkisi",
            "Okul Kültürü",
            "Akran Nezaketine Aykırı Davranışlar",
            "Dezavantajlı Gruplar",
            "Afetler ve Toplum",
            "Dikkat Ekonomisi"
          ]
        }
      ]
    },
    {
      "name": "Mantık (Seçmeli)",
      "units": [
        {
          "name": "Mantığın Doğası",
          "topics": [
            "Bilim Olarak Mantığın Neliği",
            "Mantığın Tarihsel Gelişiminin Temel Evreleri",
            "Mantığın Temel Kavramsal Çerçevesi"
          ]
        },
        {
          "name": "Aristotelesçi Mantık",
          "topics": [
            "Aristotelesçi Mantıkta Kavram ve Terim",
            "Aristotelesçi Mantıkta Önerme",
            "Aristotelesçi Mantıkta Çıkarım"
          ]
        },
        {
          "name": "Sembolik Mantık",
          "topics": [
            "Sembolik Mantığın Ayırt Edici Özellikleri ve Önemi",
            "Eklemler Mantığı",
            "Niceleme/Yüklemler Mantığı"
          ]
        },
        {
          "name": "Mantık Çeşitleri ve Uygulamaları",
          "topics": [
            "Mantığın Uygulamalı Alanları",
            "Mantık Çeşitleri",
            "Mantığın Günlük Hayattaki Yeri"
          ]
        }
      ]
    },
    {
      "name": "Çağdaş Türk ve Dünya Tarihi (Seçmeli)",
      "units": [
        {
          "name": "Yeni Dünya Düzenine Doğru (1919-1945)",
          "topics": [
            "1919-1945 Yılları Arasındaki Siyasi Gelişmeler ve Askerî Mücadeleler",
            "1919-1945 Yılları Arasındaki Sosyal ve Ekonomik Gelişmeler",
            "1919-1945 Yılları Arasındaki Bilimsel, Teknolojik ve Kültürel Gelişmeler"
          ]
        },
        {
          "name": "Soğuk Savaş Dönemi (1945-1991)",
          "topics": [
            "1945-1991 Yılları Arasındaki Siyasi Gelişmeler ve Askerî Mücadeleler",
            "1945-1991 Yılları Arasındaki Sosyal ve Ekonomik Gelişmeler",
            "1945-1991 Yılları Arasındaki Bilimsel, Teknolojik ve Kültürel Gelişmeler"
          ]
        },
        {
          "name": "Küreselleşen Dünya (1991 ve Sonrası)",
          "topics": [
            "1991 ve Sonrasında Yaşanan Siyasi Gelişmeler ve Askerî Mücadeleler",
            "1991 ve Sonrasında Yaşanan Sosyal ve Ekonomik Gelişmeler",
            "1991 ve Sonrasında Yaşanan Bilimsel, Kültürel ve Teknolojik Gelişmeler"
          ]
        }
      ]
    }
  ],
  "12": [
    {
      "name": "Matematik",
      "units": [
        {
          "name": "Nicelikler ve Değişimler (1)",
          "topics": [
            "Aritmetik ve Geometrik Diziler",
            "Gerçek Sayı Dizileri"
          ]
        },
        {
          "name": "Nicelikler ve Değişimler (2)",
          "topics": [
            "Doğrusal ve Karesel Fonksiyonlar ile Polinom Fonksiyonlar Arasındaki İlişki",
            "Polinom Fonksiyonlar ve Nitel Özellikleri",
            "Polinom ve Rasyonel Fonksiyonlarla İfade Edilebilen Denklem ve Eşitsizlikler İçeren Problemler"
          ]
        },
        {
          "name": "Geometrik Şekiller",
          "topics": [
            "Çemberin Elemanları",
            "Çemberin Açı, Kiriş ve Teğet Özellikleri",
            "Çember ve Daire ile İlgili Problemler"
          ]
        },
        {
          "name": "Geometrik Cisimler",
          "topics": [
            "Dik Prizma ve Dik Dairesel Silindir",
            "Dik Piramit, Dik Dairesel Koni ve Küre",
            "Geometrik Cisimlerle İlgili Problemler"
          ]
        },
        {
          "name": "Değişimin Matematiği (1)",
          "topics": [
            "Grafik Temsili Verilen Fonksiyonların Limiti",
            "Cebirsel Temsili Verilen Fonksiyonların Limiti",
            "Fonksiyonların Limitinde Belirsizlik Durumları",
            "Fonksiyonların Sürekliliği"
          ]
        },
        {
          "name": "Değişimin Matematiği (2)",
          "topics": [
            "Fonksiyonların Türevi",
            "Fonksiyonun Türevinin Olmadığı Noktalar",
            "Fonksiyonel İşlemlerin Türevi"
          ]
        },
        {
          "name": "Değişimin Matematiği (3)",
          "topics": [
            "Türevin Geometrik Yorumu",
            "Türev Uygulamaları"
          ]
        },
        {
          "name": "Hazır Veriler Üzerinde Çalışma",
          "topics": [
            "Toplumsal ve Bilimsel Durumlara İlişkin Hazır Veriler"
          ]
        }
      ]
    },
    {
      "name": "Türk Dili ve Edebiyatı",
      "units": [
        {
          "name": "Benim Yolculuğum",
          "topics": [
            "Günlük",
            "Blog Yazısı",
            "Şiir",
            "Hikâye",
            "Forum Metni",
            "Söyleşi",
            "Hazırlıklı Konuşma"
          ]
        },
        {
          "name": "Toplumun Ahengi",
          "topics": [
            "Roman",
            "Makale",
            "Eleştiri",
            "Haber Metni"
          ]
        },
        {
          "name": "Hayatın Dengesi",
          "topics": [
            "Gezi Yazısı",
            "Broşür",
            "Hikâye",
            "Anket",
            "Haber Metni"
          ]
        },
        {
          "name": "Hayalimdeki Yarın",
          "topics": [
            "Makale",
            "Hikâye",
            "Röportaj",
            "Mülakat",
            "Tanıtım Metni"
          ]
        },
        {
          "name": "Dil Bilgisi",
          "topics": [
            "Bağdaşıklık Ögeleri",
            "Anlatım Bozuklukları",
            "Yazım ve Noktalama"
          ]
        }
      ]
    },
    {
      "name": "Fizik",
      "units": [
        {
          "name": "Kuvvet ve Hareket",
          "topics": [
            "Tork",
            "Denge",
            "İtme (İmpuls) ve Momentum",
            "Momentumun Korunumu",
            "Eylemsizlik Momenti",
            "Açısal Momentum"
          ]
        },
        {
          "name": "Enerji",
          "topics": [
            "Yay Sabiti",
            "Yayın Esneklik Potansiyel Enerjisi",
            "Sürtünme Kuvvetinin Yaptığı İş",
            "Enerjinin Korunumu",
            "Verim"
          ]
        },
        {
          "name": "Dalgalar",
          "topics": [
            "Su Dalgalarında Kırınım",
            "Işıkta Kırınım",
            "Su Dalgalarında Girişim",
            "Işıkta Girişim",
            "Elektromanyetik Dalgalar",
            "Işık Renkleri",
            "Mekanik veya Elektromanyetik Dalgaların Kullanıldığı Cihazlar"
          ]
        },
        {
          "name": "Madde ve Doğası",
          "topics": [
            "Siyah Cisim Işıması",
            "Fotoelektrik Etki",
            "Yarı İletkenlik",
            "Süper İletkenlik",
            "Standart Model",
            "Modern Atom Teorisi",
            "Nükleer Enerji"
          ]
        }
      ]
    },
    {
      "name": "Kimya",
      "units": [
        {
          "name": "İndirgenme-Yükseltgenme Tepkimeleri",
          "topics": [
            "Redoks Tepkimeleri ve Yarı Tepkimeler",
            "Metalik Aktiflik"
          ]
        },
        {
          "name": "Elektrokimyasal Hücreler",
          "topics": [
            "Galvanik Hücreler",
            "Standart Hidrojen Elektrot",
            "Standart İndirgenme Potansiyeli",
            "Standart Hücre Potansiyeline Etki Eden Faktörler (Elektrotların Aktifliği, Elektrolit Derişimi ve Sıcaklık)",
            "Elektrolitik Hücreler",
            "Madde-Elektrik İlişkisi",
            "Elektrolizle Kaplama",
            "Korozyon ve Korozyonu Önleme Yöntemleri"
          ]
        },
        {
          "name": "Organik Kimyaya Giriş",
          "topics": [
            "Sigma ve Pi Bağları",
            "Hibritleşme",
            "Molekül Geometrisi ve VSEPR Kuramı"
          ]
        },
        {
          "name": "Organik Bileşikler",
          "topics": [
            "Organik Bileşiklerin Yapı Formülleri",
            "Alifatik ve Aromatik Hidrokarbonlar",
            "Alifatik Hidrokarbonların Sınıflandırılması",
            "Alifatik Hidrokarbonların Sistematik Adlandırılması",
            "Alifatik Hidrokarbonların İzomerlikleri",
            "Alifatik Hidrokarbonların Fiziksel ve Kimyasal Özellikleri",
            "Organik Bileşikleri Fonksiyonel Gruplarına Göre Sınıflandırma",
            "Fonksiyonel Gruba Sahip Organik Bileşiklerin Sistematik Adlandırılması",
            "Fonksiyonel Grup İzomerliği",
            "Karbon Temelli Enerji Kaynakları"
          ]
        },
        {
          "name": "Nanobilim, Yeşil Kimya ve Sürdürülebilirlik",
          "topics": [
            "Boyaya Duyarlı Güneş Pili",
            "Biyobozunur Polimer",
            "Yapay Zekâ ve Sürdürülebilirlik"
          ]
        }
      ]
    },
    {
      "name": "Biyoloji",
      "units": [
        {
          "name": "Hücre Bölünmeleri ve Üreme",
          "topics": [
            "Hücre Bölünmesinin Canlılar İçin Önemi",
            "Kromozom Yapısı ve Özellikleri",
            "Hücre Döngüsü (İnterfaz, Mitoz ve Sitokinez, Mayoz)",
            "Kromozomlarda Ayrılmama"
          ]
        },
        {
          "name": "Üreme Çeşitleri",
          "topics": [
            "Eşeysiz Üreme",
            "Eşeyli Üreme (Gametogenez, Döllenme)",
            "Eşeysiz ve Eşeyli Üreme Arasındaki Farklar"
          ]
        },
        {
          "name": "Üreme ve Gelişme",
          "topics": [
            "İnsanda Üreme ve Gelişme",
            "Bitkilerde Eşeyli Üreme ve Gelişme"
          ]
        },
        {
          "name": "Nükleik Asitler ve Gen İfadesi",
          "topics": [
            "Nükleik Asitlerin Canlılıktaki Rolü",
            "DNA ve RNA’nın Moleküler Yapısı",
            "DNA Replikasyonu",
            "Gen İfadesi (Gen, Genetik Kod, Transkripsiyon, Translasyon)",
            "Genetik Yapıdaki Değişiklikler"
          ]
        },
        {
          "name": "Kalıtım",
          "topics": [
            "Kalıtımın Temel İlkeleri (Monohibrit, Dihibrit ve Kontrol Çaprazlaması)",
            "Mendel Kalıtımından Farklılıklar (Eş Baskınlık, Çok Alellilik)",
            "Eşeye Bağlı Kalıtım",
            "Soyağacı Analizi",
            "Genetik Testler ve Genetik Danışmanlık"
          ]
        },
        {
          "name": "Biyoteknoloji",
          "topics": [
            "Biyoteknolojinin Tıp Alanındaki Uygulamaları",
            "Biyoteknolojinin Tarım Alanındaki Uygulamaları",
            "Bitki Doku Kültürü",
            "Ökaryotik Hücrelere Gen Aktarımı",
            "Biyoteknolojinin Endüstri, Çevre ve Adli Tıp Alanlarındaki Uygulamaları",
            "Biyoteknoloji ve Etik"
          ]
        }
      ]
    },
    {
      "name": "T.C. İnkılap Tarihi ve Atatürkçülük",
      "units": [
        {
          "name": "Modern Türk Devletinin Doğuşu",
          "topics": [
            "Mustafa Kemal Paşa’nın Kişilik Özelliklerinin Oluşumunda Etkili Olan Unsurlar",
            "Millî Mücadele’nin Hazırlık Sürecinde Yaşanan Olaylar",
            "Millî Mücadele Muharebeleri ve Diplomatik Zaferler",
            "Atatürk Dönemi’ndeki İç Siyasi Gelişmeler",
            "Atatürk Dönemi’ndeki Dış Siyasi Gelişmeler"
          ]
        },
        {
          "name": "Türk İnkılabı ve Atatürkçülük",
          "topics": [
            "Türk Modernleşmesi Çerçevesinde Atatürk Dönemi’nde Siyasi Alanda Yapılan İnkılaplar",
            "Türk Modernleşmesi Çerçevesinde Atatürk Dönemi’nde Toplumsal Alan ile Hukuk ve Sağlıkta Yapılan İnkılaplar",
            "Türk Modernleşmesi Çerçevesinde Atatürk Dönemi’nde Ekonomi Alanında Yapılan İnkılaplar",
            "Türk Modernleşmesi Çerçevesinde Atatürk Dönemi’nde Eğitim, Bilim ve Kültür Alanlarında Yapılan İnkılaplar",
            "Türk Modernleşmesinin Atatürk İlkelerinin Oluşumuna Etkisi"
          ]
        },
        {
          "name": "II. Dünya Savaşı’ndan Küreselleşme Sürecine Türkiye",
          "topics": [
            "II. Dünya Savaşı’nın Neden ve Sonuçları",
            "II. Dünya Savaşı Sürecinde Türkiye’nin İç ve Dış Siyasetinde Yaşanan Gelişmeler",
            "Soğuk Savaş Dönemi’nin Başlangıcından İtibaren Türkiye’nin Dış Politikası",
            "Soğuk Savaş Dönemi’nin Başlangıcından İtibaren Türkiye’de Yaşanan Siyasi Gelişmelerin Demokratikleşme Sürecine Etkileri",
            "Soğuk Savaş Dönemi’nin Başlangıcından İtibaren Türkiye’deki Sosyal ve Ekonomik Gelişmeler",
            "Soğuk Savaş Dönemi’nin Başlangıcından İtibaren Türkiye’de Bilim, Teknoloji, Kültür, Eğitim ve Spor Alanlarında Yaşanan Gelişmeler"
          ]
        }
      ]
    },
    {
      "name": "Coğrafya",
      "units": [
        {
          "name": "Coğrafyanın Doğası",
          "topics": [
            "Geleceğin Dünyasında Coğrafya Bilimi"
          ]
        },
        {
          "name": "Mekânsal Bilgi Teknolojileri",
          "topics": [
            "Web Tabanlı CBS Uygulamaları ve Tematik Haritalar"
          ]
        },
        {
          "name": "Doğal Sistemler ve Süreçler",
          "topics": [
            "Toprak Oluşumu",
            "Türkiye’de Toprakların Kullanımı",
            "Coğrafi Faktörlerin Bitki Türlerinin Çeşitliliği ve Dağılışına Etkisi"
          ]
        },
        {
          "name": "Beşerî Sistemler ve Süreçler",
          "topics": [
            "Kültür-Mekân Etkileşimi",
            "Kültürel Peyzaj ve Sürdürülebilirlik"
          ]
        },
        {
          "name": "Ekonomik Faaliyetler ve Etkileri",
          "topics": [
            "Ulaşım Sistemleri",
            "Küresel Ticaret",
            "Turizm Faaliyetleri"
          ]
        },
        {
          "name": "Afetler ve Sürdürülebilir Çevre",
          "topics": [
            "Türkiye’de Toprağın Sürdürülebilir Kullanımı",
            "Türkiye’de Bitki Türlerinin Değişim ve Sürekliliği",
            "Çevre Sorunlarının Önlenmesine Yönelik Politika ve Uygulamalar",
            "Çevresel Organizasyonlar ve Anlaşmalar",
            "Çevre Sorunlarına Çözümler",
            "Ortak Doğal ve Kültürel Miras"
          ]
        },
        {
          "name": "Bölgeler, Ülkeler ve Küresel Bağlantılar",
          "topics": [
            "Uluslararası Birliktelik ve Anlaşmazlıklar",
            "Ulaşım Sistemleri: Örnek Ülkeler",
            "Ticari Faaliyetler: Örnek Ülke",
            "Turizm Faaliyetleri: Örnek Ülkeler"
          ]
        }
      ]
    },
    {
      "name": "İngilizce",
      "units": [
        {
          "name": "School Life, Classroom Life & Education",
          "topics": [
            "Challenges and coping with challenges for success",
            "Graduation and future plans after school",
            "National days and celebrations",
            "The Simple Present Tense",
            "The Present Progressive Tense",
            "Be Going to Future Tense",
            "The Simple Future Tense",
            "Reported Speech of the Present and Future Tenses"
          ]
        },
        {
          "name": "Personal Life & Well-Being",
          "topics": [
            "Providing personal well-being through social health",
            "Providing personal well-being with economic stability (fashion addicts, shopaholics)",
            "The Simple Past Tense",
            "The Past Progressive Tense",
            "The Past Perfect Tense",
            "The Past Perfect Progressive Tense"
          ]
        },
        {
          "name": "Family Life & Home",
          "topics": [
            "The impact of technology on family life",
            "The relationships between the family and community",
            "Reported Speech of the Past Tenses"
          ]
        },
        {
          "name": "City & Social Life",
          "topics": [
            "Different communities and lifestyles in the rural areas and cities",
            "Problems related to infrastructure and planning in the city and solutions",
            "The Future Perfect Tense"
          ]
        },
        {
          "name": "Life in the Cultural and Natural World",
          "topics": [
            "Stereotypes and cultural diversity in the world",
            "Gaining awareness on climate change",
            "Modals in the past (can/would/could/should have v3)"
          ]
        },
        {
          "name": "Life in the Universe & Future",
          "topics": [
            "Space organisations",
            "Plans and aspirations for the future",
            "Conditional 3",
            "Mixed conditionals"
          ]
        }
      ]
    },
    {
      "name": "Din Kültürü ve Ahlak Bilgisi",
      "units": [
        {
          "name": "Kur’an-ı Kerim",
          "topics": [
            "Kur’an-ı Kerim’in Tarihi",
            "Kur’an-ı Kerim’in Ana Konuları ve Temel Özellikleri",
            "Kur’an-ı Kerim’in Anlaşılmasında Temel İlkeler",
            "Kur’an-ı Kerim ve Kültürümüz",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "Din ve Aile",
          "topics": [
            "İslam’da Aile",
            "Aile İçi İletişim",
            "Aile ve Ahlaki Değerler",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "Güncel Dinî Meseleler",
          "topics": [
            "Dinî Meselelerin Çözümünde Temel İlke ve Yöntemler",
            "Gıda Maddeleriyle İlgili Meseleler",
            "Bağımlılıkla İlgili Meseleler",
            "Günlük Hayatla İlgili Meseleler",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "İslam Düşüncesinde Tasavvufi Yorumlar",
          "topics": [
            "Tasavvufi Düşüncenin Oluşumu",
            "Tasavvufi Düşüncenin Ahlaki Boyutu",
            "Kültürümüzde Etkin Olan Tasavvufi Yorumlar",
            "Alevilik Bektaşilikte Temel Kavramlar ve Cem Erkânı",
            "Kur’an’dan Mesajlar"
          ]
        },
        {
          "name": "Hint ve Çin Dinleri",
          "topics": [
            "Hinduizm",
            "Budizm",
            "Sihizm",
            "Konfüçyanizm",
            "Taoizm"
          ]
        }
      ]
    },
    {
      "name": "Psikoloji (Seçmeli)",
      "units": [
        {
          "name": "Psikoloji ile Tanışma",
          "topics": [
            "Psikolojinin Tanımı, Konusu ve Amaçları",
            "Psikolojinin Alt Dalları",
            "Psikolojinin Yöntem ve Teknikleri"
          ]
        },
        {
          "name": "Gelişimi Anlamak",
          "topics": [
            "Gelişime Genel Bir Bakış",
            "Gelişim Dönemleri",
            "Gelişim Görevleri",
            "İnsan Zekâsı ve Yapay Zekâ",
            "Kişilik ve Benlik-Dijital Benlik"
          ]
        },
        {
          "name": "Nasıl Öğreniriz?",
          "topics": [
            "Öğrenmeye Genel Bir Bakış",
            "Öğrenmeyi Etkileyen Temel Etmenler",
            "Öğrenme Türleri",
            "İnsan Öğrenmesi ve Makine Öğrenmesi"
          ]
        },
        {
          "name": "Bireysel ve Sosyal Uyum",
          "topics": [
            "Uyum Sorunları",
            "Uyum Sağlama",
            "Uyum Sağlamaya Yönelik Yaklaşımlar",
            "Tutum ve Olumlu-Olumsuz Sosyal Davranışlar"
          ]
        }
      ]
    },
    {
      "name": "Sosyoloji (Seçmeli)",
      "units": [
        {
          "name": "Sosyolojinin Doğuşu",
          "topics": [
            "Sosyolojinin Doğuşu",
            "Sosyolojik Düşünme Biçimi",
            "Sosyolojide Kullanılan Farklı Yöntemler"
          ]
        },
        {
          "name": "Türkiye’de Modernleşme ve Sosyoloji",
          "topics": [
            "Osmanlı’dan Cumhuriyet’e Modernleşme Süreci",
            "Tarihsel Bağlamda Türkiye’de Sosyolojinin Doğuşu ve Gelişimi",
            "Türkiye’de Sosyoloji-Edebiyat İlişkisi"
          ]
        },
        {
          "name": "Kültür ve Toplumsal Yapı",
          "topics": [
            "Kültür",
            "Toplumsal Yapı",
            "Toplumsal Tabakalaşma ve Toplumsal Hareketlilik"
          ]
        },
        {
          "name": "Toplumsal Kurumlar",
          "topics": [
            "Aile",
            "Eğitim",
            "Din",
            "Ekonomi",
            "Siyaset",
            "Toplumsal Kurumların Aralarındaki İlişkiler"
          ]
        },
        {
          "name": "Güncel Sosyolojik Meseleler",
          "topics": [
            "İslam Karşıtlığı",
            "Küreselleşmenin Toplumsal Etkileri",
            "Yapay Zekâ Kaynaklı Toplumsal Sorunlar"
          ]
        },
        {
          "name": "Bilim Sosyolojisi",
          "topics": [
            "Bilim ve Toplum İlişkisi",
            "Bilim ve Toplum İlişkisine Eleştirel Yaklaşım"
          ]
        },
        {
          "name": "Örnek Sosyolojik Uygulamalar",
          "topics": [
            "Güncel Toplumsal Meseleler",
            "Aile, Sosyalizasyon ve Suç İlişkisi",
            "Okul Kültürü",
            "Akran Nezaketine Aykırı Davranışlar",
            "Dezavantajlı Gruplar",
            "Afetler ve Toplum",
            "Dikkat Ekonomisi"
          ]
        }
      ]
    },
    {
      "name": "Mantık (Seçmeli)",
      "units": [
        {
          "name": "Mantığın Doğası",
          "topics": [
            "Bilim Olarak Mantığın Neliği",
            "Mantığın Tarihsel Gelişiminin Temel Evreleri",
            "Mantığın Temel Kavramsal Çerçevesi"
          ]
        },
        {
          "name": "Aristotelesçi Mantık",
          "topics": [
            "Aristotelesçi Mantıkta Kavram ve Terim",
            "Aristotelesçi Mantıkta Önerme",
            "Aristotelesçi Mantıkta Çıkarım"
          ]
        },
        {
          "name": "Sembolik Mantık",
          "topics": [
            "Sembolik Mantığın Ayırt Edici Özellikleri ve Önemi",
            "Eklemler Mantığı",
            "Niceleme/Yüklemler Mantığı"
          ]
        },
        {
          "name": "Mantık Çeşitleri ve Uygulamaları",
          "topics": [
            "Mantığın Uygulamalı Alanları",
            "Mantık Çeşitleri",
            "Mantığın Günlük Hayattaki Yeri"
          ]
        }
      ]
    },
    {
      "name": "Çağdaş Türk ve Dünya Tarihi (Seçmeli)",
      "units": [
        {
          "name": "Yeni Dünya Düzenine Doğru (1919-1945)",
          "topics": [
            "1919-1945 Yılları Arasındaki Siyasi Gelişmeler ve Askerî Mücadeleler",
            "1919-1945 Yılları Arasındaki Sosyal ve Ekonomik Gelişmeler",
            "1919-1945 Yılları Arasındaki Bilimsel, Teknolojik ve Kültürel Gelişmeler"
          ]
        },
        {
          "name": "Soğuk Savaş Dönemi (1945-1991)",
          "topics": [
            "1945-1991 Yılları Arasındaki Siyasi Gelişmeler ve Askerî Mücadeleler",
            "1945-1991 Yılları Arasındaki Sosyal ve Ekonomik Gelişmeler",
            "1945-1991 Yılları Arasındaki Bilimsel, Teknolojik ve Kültürel Gelişmeler"
          ]
        },
        {
          "name": "Küreselleşen Dünya (1991 ve Sonrası)",
          "topics": [
            "1991 ve Sonrasında Yaşanan Siyasi Gelişmeler ve Askerî Mücadeleler",
            "1991 ve Sonrasında Yaşanan Sosyal ve Ekonomik Gelişmeler",
            "1991 ve Sonrasında Yaşanan Bilimsel, Kültürel ve Teknolojik Gelişmeler"
          ]
        }
      ]
    }
  ]
};
