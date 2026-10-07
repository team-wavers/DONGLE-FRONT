import { parseFragment, type DefaultTreeAdapterMap } from "parse5";

const excludedTags = new Set(["script", "style", "template", "noscript"]);
const separatedTags = new Set([
    "p", "div", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "pre", "ul", "ol", "li", "table", "tr", "td", "th",
    "section", "article", "dl", "dt", "dd",
]);

function collectText(node: DefaultTreeAdapterMap["node"]): string {
    if ("value" in node) {
        return node.value;
    }

    if ("tagName" in node && excludedTags.has(node.tagName)) {
        return "";
    }

    const text = "childNodes" in node ? node.childNodes.map(collectText).join("") : "";
    return "tagName" in node && separatedTags.has(node.tagName) ? ` ${text} ` : text;
}

/** 메타데이터용 텍스트 추출이며 HTML 렌더링용 sanitizer로 사용하지 않는다. */
export function getRichTextDescription(value: string) {
    return collectText(parseFragment(value)).replace(/\s+/g, " ").trim();
}
