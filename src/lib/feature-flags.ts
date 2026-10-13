/**
 * Ogrenci hesaplarini artik kocu panelden aciyor ve giris bilgilerini ogrenciyle paylasiyor.
 * Test sureci bittiginde kayit ekranini kaldirmak icin bu bayragi `false` yap:
 * giris ekranindaki "Kayit ol" baglantisi gizlenir, /signup girise yonlenir.
 * Backend'de de `STUDENT_SELF_SIGNUP_ENABLED=false` ile ayni anda kapatilmali;
 * ekran dosyalari (app/signup.tsx, session.signUp, api.studentSignup) bayrak kapaliyken
 * guvenle silinebilir.
 */
export const STUDENT_SELF_SIGNUP_ENABLED = true;
