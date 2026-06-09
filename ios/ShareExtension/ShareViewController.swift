import UIKit
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        handleSharedContent()
    }

    private func handleSharedContent() {
        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            completeRequest()
            return
        }

        for item in extensionItems {
            guard let attachments = item.attachments else { continue }
            for attachment in attachments {
                if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] data, _ in
                        let text: String
                        if let url = data as? URL {
                            text = url.absoluteString
                        } else if let str = data as? String {
                            text = str
                        } else {
                            self?.completeRequest()
                            return
                        }
                        self?.saveAndOpen(text: text)
                    }
                    return
                } else if attachment.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] data, _ in
                        guard let text = data as? String else {
                            self?.completeRequest()
                            return
                        }
                        self?.saveAndOpen(text: text)
                    }
                    return
                }
            }
        }
        completeRequest()
    }

    private func saveAndOpen(text: String) {
        // ShareExtension bundle ID: "club.staircrusher.ShareExtension" or "club.staircrusher.sandbox.ShareExtension"
        // Strip the .ShareExtension suffix to get main app bundle ID
        let extensionBundleId = Bundle.main.bundleIdentifier ?? ""
        let mainBundleId = extensionBundleId
            .replacingOccurrences(of: ".ShareExtension", with: "")
        let groupId = "group.\(mainBundleId)"

        guard let userDefaults = UserDefaults(suiteName: groupId) else {
            completeRequest()
            return
        }

        // Key format used by ReceiveSharingIntent library:
        // url.host = "ShareMedia-text=<key>", url.host.components(separatedBy:"=").last = <key>
        // So we store with key = timestamp string, and URL host = "ShareMedia-text=<key>"
        let key = "ShareMedia-\(Int(Date().timeIntervalSince1970 * 1000))"
        userDefaults.set([text], forKey: key)
        userDefaults.synchronize()

        // URL format: stair-crusher://ShareMedia-text=<key>#text
        // ReceiveSharingIntent reads: url.host?.components(separatedBy:"=").last → key
        guard let url = URL(string: "stair-crusher://ShareMedia-text=\(key)#text") else {
            completeRequest()
            return
        }

        openURL(url)
        completeRequest()
    }

    @objc private func openURL(_ url: URL) {
        var responder: UIResponder? = self
        while responder != nil {
            if let application = responder as? UIApplication {
                application.open(url, options: [:], completionHandler: nil)
                return
            }
            responder = responder?.next
        }
    }

    private func completeRequest() {
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
}
