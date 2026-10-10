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
  }
}
