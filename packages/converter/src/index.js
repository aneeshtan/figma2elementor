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

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function firstStroke(node) {
  return (node.strokes || []).find((stroke) => stroke && stroke.type === "SOLID" && stroke.color);
}

function firstShadow(node) {
  return (node.effects || []).find(
    (effect) => effect && ["DROP_SHADOW", "INNER_SHADOW"].includes(effect.type) && effect.color
  );
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

function normalizeColor(value) {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^#([0-9a-f]{8})$/i);

  if (match) {
    const hex = match[1];
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);
    const alpha = parseInt(hex.slice(6, 8), 16) / 255;

    if (alpha >= 0.999) {
      return `#${hex.slice(0, 6)}`;
    }

    return `rgba(${red}, ${green}, ${blue}, ${Number(alpha.toFixed(3))})`;
  }

  return trimmed;
}

function applyTypography(settings, node) {
  if (!node.style) {
    return;
  }

  if (node.style.fontFamily) {
    settings.typography_typography = "custom";
    settings.typography_font_family = node.style.fontFamily;
  }

  if (node.style.fontWeight) {
    settings.typography_font_weight = node.style.fontWeight;
  }
}

function applyBorder(settings, node) {
  const stroke = firstStroke(node);
  if (!stroke) {
    return;
  }

  settings.border_border = "solid";
  settings.border_color = normalizeColor(stroke.color);
  settings.border_width = box(stroke.weight, stroke.weight, stroke.weight, stroke.weight);
}

function applyShadow(settings, node) {
  const shadow = firstShadow(node);
  if (!shadow) {
    return;
  }

  settings.box_shadow_box_shadow_type = "yes";
  settings.box_shadow_box_shadow = {
    horizontal: Math.round(shadow.offset?.x || 0),
    vertical: Math.round(shadow.offset?.y || 0),
    blur: Math.round(shadow.radius || 0),
    spread: Math.round(shadow.spread || 0),
    color: normalizeColor(shadow.color),
    position: shadow.type === "INNER_SHADOW" ? "inset" : "outline"
  };
}

function applyBorderRadius(settings, node) {
  if (node.cornerRadius) {
    settings.border_radius = box(node.cornerRadius, node.cornerRadius, node.cornerRadius, node.cornerRadius);
  }
}

function applyContainerSurface(settings, node) {
  const fill = firstSolidFill(node);

  if (fill?.color) {
    settings.background_background = "classic";
    settings.background_color = normalizeColor(fill.color);
  }

  if (node.imageUrl) {
    settings.background_background = "classic";
    settings.background_image = {
      url: node.imageUrl
    };
    settings.background_position = "center center";
    settings.background_repeat = "no-repeat";
    settings.background_size = "cover";
  }

  applyBorder(settings, node);
  applyBorderRadius(settings, node);
  applyShadow(settings, node);
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
    settings.title_color = normalizeColor(fill?.color) || "#10211f";
  } else {
    settings.editor = `<p>${(node.characters || "").replace(/\n/g, "<br />")}</p>`;
    settings.align = (node.style?.textAlignHorizontal || "LEFT").toLowerCase();
    settings.text_color = normalizeColor(fill?.color) || "#10211f";
  }

  if (fontSize) {
    settings.typography_font_size = px(fontSize);
  }

  const lineHeightPx = node.style?.lineHeightPx;
  if (lineHeightPx) {
    settings.typography_line_height = px(lineHeightPx);
  }

  applyTypography(settings, node);
  applyShadow(settings, node);

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
  const settings = {
    _title: node.name || "Button",
    text: textChild?.characters || node.name || "Click here",
    background_color: normalizeColor(fill?.color) || "#00695c",
    button_text_color: normalizeColor(textFill?.color) || "#ffffff",
    padding: box(node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft)
  };

  applyBorder(settings, node);
  applyBorderRadius(settings, node);
  applyShadow(settings, node);

  return {
    id: helpers.nextId(node.name),
    elType: "widget",
    widgetType: "button",
    isInner: false,
    settings,
    elements: []
  };
}

function mapDecorativeShape(node, helpers) {
  return {
    id: helpers.nextId(node.name),
    elType: "container",
    isInner: true,
    settings: {
      _title: node.name || "Shape",
      content_width: "full",
      min_height: px(node.absoluteBoundingBox?.height || 24)
    },
    elements: []
  };
}

function mapFrameNode(node, helpers, depth) {
  if (isButtonLikeFrame(node)) {
    return mapButtonNode(node, helpers);
  }

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

  if (node.absoluteBoundingBox?.height) {
    settings.min_height = px(node.absoluteBoundingBox.height);
  }

  if (node.absoluteBoundingBox?.width) {
    settings.width = {
      unit: "px",
      size: Math.round(node.absoluteBoundingBox.width),
      sizes: []
    };
  }

  applyContainerSurface(settings, node);

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
    const widget = mapImageNode(node, helpers);
    applyBorder(widget.settings, node);
    applyBorderRadius(widget.settings, node);
    applyShadow(widget.settings, node);
    return widget;
  }

  if (node.type === "RECTANGLE" && node.imageUrl) {
    const widget = mapImageNode(node, helpers);
    applyBorder(widget.settings, node);
    applyBorderRadius(widget.settings, node);
    applyShadow(widget.settings, node);
    return widget;
  }

  if (["RECTANGLE", "ELLIPSE", "VECTOR", "LINE"].includes(node.type)) {
    const shape = mapDecorativeShape(node, helpers);
    applyContainerSurface(shape.settings, node);
    return shape;
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
      slug: slugify(normalized.name || "elementor-template"),
      type: "page",
      version: "0.4",
      page_settings: [],
      content
    }
  };
}
