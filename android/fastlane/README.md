fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android configure_firebase

```sh
[bundle exec] fastlane android configure_firebase
```

Set firebase configuration json.

### android distribute

```sh
[bundle exec] fastlane android distribute
```

Upload a APK/AAB file to Firebase App Distribution

### android bundle

```sh
[bundle exec] fastlane android bundle
```



### android prepare_release

```sh
[bundle exec] fastlane android prepare_release
```

Ask for version, update files, commit and tag

### android release_candidate

```sh
[bundle exec] fastlane android release_candidate
```



----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
