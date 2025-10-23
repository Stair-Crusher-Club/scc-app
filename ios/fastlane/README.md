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

### ios rbuild

```sh
[bundle exec] fastlane ios rbuild
```



Make a archive file. You can make IPA files using the archive file.

### ios export_appstore

```sh
[bundle exec] fastlane ios export_appstore
```

Make IPA file for AppStore. It can be distributed in AppStore.

### ios export_firebase

```sh
[bundle exec] fastlane ios export_firebase
```

Make IPA file for Firebase Distribution.

### ios firebase

```sh
[bundle exec] fastlane ios firebase
```

Upload IPA file to Firebase App Distribution.

### ios itc

```sh
[bundle exec] fastlane ios itc
```

Upload a IPA file to AppStoreConnect.

### ios prepare_release

```sh
[bundle exec] fastlane ios prepare_release
```

Ask for version, update files, commit and tag

### ios export

```sh
[bundle exec] fastlane ios export
```

Make IPA files for AppStore and Firebase Distribution. After this, you can upload the ipa files to Firebase Distribution and AppStore Connect using `fastlane ios firebase` or `fastlane ios itc`

### ios release_candidate

```sh
[bundle exec] fastlane ios release_candidate
```



----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
