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
        openURL(url)
    }

    @objc private func openURL(_ url: URL) {
        var responder: UIResponder? = self
        while responder != nil {
            if let application = responder as? UIApplication {
                // completeRequest는 반드시 open 완료(=cold-launch가 시스템에 인계된 뒤) 콜백에서 호출.
                // 동기 호출 시 killed 상태에서 extension이 먼저 종료되어 cold-launch가 취소된다.
                application.open(url, options: [:]) { [weak self] _ in
                    self?.completeRequest()
                }
                return
            }
            responder = responder?.next
        }
        completeRequest()
    }

    private func completeRequest() {
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
}
