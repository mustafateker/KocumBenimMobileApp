fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios check_caps

```sh
[bundle exec] fastlane ios check_caps
```

Bundle ID yetkilerini kontrol eder ve gerekirse Push yetkisi ekler

### ios get_profile

```sh
[bundle exec] fastlane ios get_profile
```

App Store Provisioning Profilini indirir veya yeniler

### ios upload_testflight

```sh
[bundle exec] fastlane ios upload_testflight
```

Native IPA'yı App Store Connect TestFlight kanalına yükler

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
