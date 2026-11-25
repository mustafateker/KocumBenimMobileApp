package expo.modules.playupdate

import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.UpdateAvailability
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Google Play'in "bu kullanici icin yeni surum var mi" bilgisini dondurur
 * (In-App Updates API). Uygulama Play'den kurulmadiysa (debug, APK) Play bu
 * bilgiyi vermez; bu durumda guncelleme yok sayilir.
 */
class PlayUpdateModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PlayUpdate")

    AsyncFunction("isUpdateAvailable") { promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.resolve(false)
        return@AsyncFunction
      }

      AppUpdateManagerFactory.create(context)
        .appUpdateInfo
        .addOnSuccessListener { info ->
          promise.resolve(info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE)
        }
        .addOnFailureListener {
          promise.resolve(false)
        }
    }

    AsyncFunction("getSigningCertSha1") { promise: Promise ->
      try {
        val context = appContext.reactContext
        if (context == null) {
          promise.resolve(null)
          return@AsyncFunction
        }
        val pm = context.packageManager
        val pkg = context.packageName
        val certBytes = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
          val info = pm.getPackageInfo(pkg, android.content.pm.PackageManager.GET_SIGNING_CERTIFICATES)
          val signInfo = info.signingInfo
          val sigs = if (signInfo?.hasMultipleSigners() == true) signInfo.apkContentsSigners else signInfo?.signingCertificateHistory
          sigs?.firstOrNull()?.toByteArray()
        } else {
          @Suppress("DEPRECATION")
          val info = pm.getPackageInfo(pkg, android.content.pm.PackageManager.GET_SIGNATURES)
          @Suppress("DEPRECATION")
          info.signatures?.firstOrNull()?.toByteArray()
        }
        if (certBytes == null) {
          promise.resolve(null)
          return@AsyncFunction
        }
        val md = java.security.MessageDigest.getInstance("SHA-1")
        val digest = md.digest(certBytes)
        val sha1 = digest.joinToString(":") { "%02X".format(it) }
        promise.resolve(sha1)
      } catch (_: Throwable) {
        promise.resolve(null)
      }
    }
  }
}
