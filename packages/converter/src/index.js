function createIdFactory() {
  let counter = 0;

  return (seed = "node") => {
    let hash = 0;
    const text = `${seed}-${counter++}`;

    for (let index = 0; index < text.length; index += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(index);
      hash |= 0;
    }

    return Math.abs(hash).toString(16).slice(0, 8).padEnd(8, "0");
  };
}

function px(size) {
  return {
    unit: "px",
    size: Number(size || 0),
    sizes: []
  };
}

function box(top = 0, right = 0, bottom = 0, left = 0) {
  return {
    unit: "px",
    top: String(Math.round(top || 0)),
    right: String(Math.round(right || 0)),
    bottom: String(Math.round(bottom || 0)),
    left: String(Math.round(left || 0)),
    isLinked: top === right && right === bottom && bottom === left
  };
}

function firstSolidFill(node) {
  return (node.fills || []).find((fill) => fill && fill.type === "SOLID" && fill.color);
}

function hasChildren(node) {
  return Array.isArray(node.children) && node.children.length > 0;
}

function inferHeadingLevel(fontSize = 16) {
  if (fontSize >= 48) return "h1";
  if (fontSize >= 36) return "h2";
  if (fontSize >= 28) return "h3";
  if (fontSize >= 22) return "h4";
  return "h5";
}

function inferTextWidget(node) {
  const fontSize = node.style?.fontSize || 16;
  const name = (node.name || "").toLowerCase();

  if (fontSize >= 28 || name.includes("heading") || name.includes("title")) {
    return "heading";
  }

  return "text-editor";
}

function normalizeRoot(source) {
  if (!source) {
    throw new Error("A Figma payload is required.");
  }

  if (Array.isArray(source)) {
    return {
      name: "Imported selection",
      type: "SELECTION",
      children: source
    };
  }

  if (source.type === "SELECTION" || Array.isArray(source.children)) {
    return source;
  }

  return {
    name: source.name || "Imported frame",
    type: "SELECTION",
    children: [source]
  };
}

function mapAlignment(value, direction) {
  if (direction === "column") {
    if (value === "CENTER") return "center";
    if (value === "MAX") return "flex-end";
    if (value === "SPACE_BETWEEN") return "space-between";
    return "flex-start";
  }

  if (value === "CENTER") return "center";
  if (value === "MAX") return "flex-end";
  if (value === "SPACE_BETWEEN") return "space-between";
  return "flex-start";
}

function isButtonLikeFrame(node) {
  if (!hasChildren(node)) {
    return false;
  }

  const textChildren = node.children.filter((child) => child.type === "TEXT");
  const name = (node.name || "").toLowerCase();
  return textChildren.length === 1 && (name.includes("button") || name.includes("cta"));
}

function mapTextNode(node, helpers) {
  const widgetType = inferTextWidget(node);
  const settings = {
    _title: node.name || "Text"
  };
  const fontSize = node.style?.fontSize || 16;
  const fill = firstSolidFill(node);

  if (widgetType === "heading") {
    settings.title = node.characters || "";
    settings.header_size = inferHeadingLevel(fontSize);
    settings.align = (node.style?.textAlignHorizontal || "LEFT").toLowerCase();
    settings.title_color = fill?.color || "#10211f";
  } else {
    settings.editor = `<p>${(node.characters || "").replace(/\n/g, "<br />")}</p>`;
    settings.align = (node.style?.textAlignHorizontal || "LEFT").toLowerCase();
    settings.text_color = fill?.color || "#10211f";
  }

  if (fontSize) {
    settings.typography_font_size = px(fontSize);
  }

  const lineHeightPx = node.style?.lineHeightPx;
  if (lineHeightPx) {
    settings.typography_line_height = px(lineHeightPx);
  }

  return {
    id: helpers.nextId(node.name),
    elType: "widget",
    widgetType,
    isInner: false,
    settings,
    elements: []
  };
}

function mapImageNode(node, helpers) {
  return {
    id: helpers.nextId(node.name),
    elType: "widget",
    widgetType: "image",
    isInner: false,
    settings: {
      _title: node.name || "Image",
      image: {
        url: node.imageUrl || "https://placehold.co/1200x800?text=Figma+Asset"
      },
      image_size: "full"
    },
    elements: []
  };
}

function mapButtonNode(node, helpers) {
  const textChild = node.children.find((child) => child.type === "TEXT");
  const fill = firstSolidFill(node);
  const textFill = textChild ? firstSolidFill(textChild) : null;

  return {
    id: helpers.nextId(node.name),
    elType: "widget",
    widgetType: "button",
    isInner: false,
    settings: {
      _title: node.name || "Button",
      text: textChild?.characters || node.name || "Click here",
      background_color: fill?.color || "#00695c",
      button_text_color: textFill?.color || "#ffffff",
      border_radius: box(node.cornerRadius, node.cornerRadius, node.cornerRadius, node.cornerRadius),
      padding: box(node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft)
    },
    elements: []
  };
}

function mapDecorativeShape(node, helpers) {
  const fill = firstSolidFill(node);

  return {
    id: helpers.nextId(node.name),
    elType: "container",
    isInner: true,
    settings: {
      _title: node.name || "Shape",
      content_width: "full",
      background_background: fill ? "classic" : undefined,
      background_color: fill?.color,
      min_height: px(node.absoluteBoundingBox?.height || 24),
      border_radius: box(node.cornerRadius, node.cornerRadius, node.cornerRadius, node.cornerRadius)
    },
    elements: []
  };
}

function mapFrameNode(node, helpers, depth) {
  if (isButtonLikeFrame(node)) {
    return mapButtonNode(node, helpers);
  }

  const fill = firstSolidFill(node);
  const direction = node.layoutMode === "HORIZONTAL" ? "row" : "column";
  const elements = (node.children || [])
    .map((child) => mapNode(child, helpers, depth + 1))
    .filter(Boolean);

  const settings = {
    _title: node.name || "Container",
    content_width: "full",
    flex_direction: direction,
    flex_gap: px(node.itemSpacing || 0),
    flex_align_items: mapAlignment(node.counterAxisAlignItems, direction),
    justify_content: mapAlignment(node.primaryAxisAlignItems, direction),
    padding: box(node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft),
    html_tag: depth === 0 ? "section" : "div"
  };

  if (fill?.color) {
    settings.background_background = "classic";
    settings.background_color = fill.color;
  }

  if (node.cornerRadius) {
    settings.border_radius = box(node.cornerRadius, node.cornerRadius, node.cornerRadius, node.cornerRadius);
  }

  if (node.absoluteBoundingBox?.height) {
    settings.min_height = px(node.absoluteBoundingBox.height);
  }

  return {
    id: helpers.nextId(node.name),
    elType: "container",
    isInner: depth > 0,
    settings,
    elements
  };
}

function mapNode(node, helpers, depth = 0) {
  if (!node || node.visible === false) {
    return null;
  }

  helpers.report.convertedNodes += 1;

  if (["FRAME", "GROUP", "COMPONENT", "INSTANCE", "SELECTION"].includes(node.type)) {
    return mapFrameNode(node, helpers, depth);
  }

  if (node.type === "TEXT") {
    return mapTextNode(node, helpers);
  }

  if (node.type === "IMAGE") {
    return mapImageNode(node, helpers);
  }

  if (node.type === "RECTANGLE" && node.imageUrl) {
    return mapImageNode(node, helpers);
  }

  if (["RECTANGLE", "ELLIPSE", "VECTOR", "LINE"].includes(node.type)) {
    return mapDecorativeShape(node, helpers);
  }

  helpers.report.warnings.push(`Unsupported node type "${node.type}" was skipped.`);
  return null;
}

export function convertFigmaSelectionToElementor(source) {
  const normalized = normalizeRoot(source);
  const nextId = createIdFactory();
  const report = {
    convertedNodes: 0,
    warnings: []
  };
  const helpers = {
    nextId,
    report
  };

  const content = (normalized.children || []).map((node) => mapNode(node, helpers, 0)).filter(Boolean);

  return {
    ok: true,
    source: normalized,
    report,
    template: {
      title: normalized.name || "Imported Template",
      type: "page",
      version: "0.4",
      page_settings: [],
      content
    }
  };
}

