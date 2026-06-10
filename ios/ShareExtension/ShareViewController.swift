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
                        self?.openMainApp(sharedText: text)
                    }
                    return
                } else if attachment.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] data, _ in
                        guard let text = data as? String else {
                            self?.completeRequest()
                            return
                        }
                        self?.openMainApp(sharedText: text)
                    }
                    return
                }
            }
        }
        completeRequest()
    }

    private func openMainApp(sharedText: String) {
        guard let encoded = sharedText.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "stair-crusher://shared?text=\(encoded)") else {
            completeRequest()
            return
        }
        // extensionContext.open은 앱이 killed 상태여도 올바르게 launch한다.
        // UIApplication 방식은 extension process에서 UIApplication 접근이 불가능해 killed 상태에서 동작 안 함.
        extensionContext?.open(url) { [weak self] _ in
            self?.completeRequest()
        }
    }

    private func completeRequest() {
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
}
