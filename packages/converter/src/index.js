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

function getColorChannels(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  let match = trimmed.match(/^#([0-9a-f]{6})$/i);
  if (match) {
    const hex = match[1];
    return {
      red: parseInt(hex.slice(0, 2), 16),
      green: parseInt(hex.slice(2, 4), 16),
      blue: parseInt(hex.slice(4, 6), 16),
      alpha: 1
    };
  }

  match = trimmed.match(/^rgba?\(([^)]+)\)$/i);
  if (!match) {
    return null;
  }

  const parts = match[1].split(",").map((part) => part.trim());
  if (parts.length < 3) {
    return null;
  }

  return {
    red: Number(parts[0]),
    green: Number(parts[1]),
    blue: Number(parts[2]),
    alpha: parts[3] == null ? 1 : Number(parts[3])
  };
}

function shiftColor(value, amount = -0.12) {
  const channels = getColorChannels(normalizeColor(value));
  if (!channels) {
    return normalizeColor(value);
  }

  const shift = (channel) => Math.max(0, Math.min(255, Math.round(channel * (1 + amount))));
  const red = shift(channels.red);
  const green = shift(channels.green);
  const blue = shift(channels.blue);

  if (channels.alpha < 0.999) {
    return `rgba(${red}, ${green}, ${blue}, ${Number(channels.alpha.toFixed(3))})`;
  }

  return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
}

function getNodeBounds(node) {
  const box = node?.absoluteBoundingBox || {};

  return {
    x: Number(box.x || 0),
    y: Number(box.y || 0),
    width: Number(box.width || 0),
    height: Number(box.height || 0),
    right: Number(box.x || 0) + Number(box.width || 0),
    bottom: Number(box.y || 0) + Number(box.height || 0)
  };
}

function rowKeyForNode(node) {
  const bounds = getNodeBounds(node);
  return bounds.y + bounds.height / 2;
}

function groupChildrenByRows(children) {
  const sorted = [...children].sort((left, right) => {
    const topDelta = getNodeBounds(left).y - getNodeBounds(right).y;
    if (Math.abs(topDelta) > 4) {
      return topDelta;
    }

    return getNodeBounds(left).x - getNodeBounds(right).x;
  });
  const rows = [];

  for (const child of sorted) {
    const bounds = getNodeBounds(child);
    const centerY = rowKeyForNode(child);
    const threshold = Math.max(18, Math.min(64, bounds.height * 0.45 || 24));
    let row = rows.find((entry) => Math.abs(entry.centerY - centerY) <= threshold);

    if (!row) {
      row = {
        centerY,
        top: bounds.y,
        bottom: bounds.bottom,
        children: []
      };
      rows.push(row);
    }

    row.children.push(child);
    row.top = Math.min(row.top, bounds.y);
    row.bottom = Math.max(row.bottom, bounds.bottom);
    row.centerY = (row.top + row.bottom) / 2;
  }

  return rows
    .sort((left, right) => left.top - right.top)
    .map((row) => ({
      ...row,
      children: row.children.sort((left, right) => getNodeBounds(left).x - getNodeBounds(right).x)
    }));
}

function isShapeNode(node) {
  return ["RECTANGLE", "ELLIPSE", "VECTOR", "LINE"].includes(node?.type);
}

function getArea(node) {
  const bounds = getNodeBounds(node);
  return bounds.width * bounds.height;
}

function isContainedWithin(inner, outer, tolerance = 8) {
  const innerBounds = getNodeBounds(inner);
  const outerBounds = getNodeBounds(outer);

  return (
    innerBounds.x >= outerBounds.x - tolerance &&
    innerBounds.y >= outerBounds.y - tolerance &&
    innerBounds.right <= outerBounds.right + tolerance &&
    innerBounds.bottom <= outerBounds.bottom + tolerance
  );
}

function findOverlayBackgroundChild(node) {
  if (!hasChildren(node) || node.layoutMode !== "NONE") {
    return null;
  }

  const candidates = node.children
    .filter((child) => isShapeNode(child) && (!child.children || !child.children.length))
    .sort((left, right) => getArea(right) - getArea(left));
  const background = candidates[0];

  if (!background) {
    return null;
  }

  const nodeArea = getArea(node);
  if (!nodeArea || getArea(background) < nodeArea * 0.7) {
    return null;
  }

  const foregroundChildren = node.children.filter((child) => child !== background);
  if (!foregroundChildren.length || foregroundChildren.some((child) => !isContainedWithin(child, background))) {
    return null;
  }

  return background;
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
  settings.border_hover_color = shiftColor(stroke.color, -0.18);
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
    settings.background_hover_background = "classic";
    settings.background_hover_color = shiftColor(fill.color, -0.08);
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

function createMeasuredWrapper(child, element, helpers, depth) {
  const bounds = getNodeBounds(child);
  const settings = {
    _title: `${child.name || "Item"} Wrapper`,
    content_width: "full",
    flex_direction: "column",
    flex_gap: px(0),
    flex_align_items: "stretch",
    justify_content: "flex-start",
    padding: box(0, 0, 0, 0),
    html_tag: depth === 0 ? "section" : "div"
  };

  if (bounds.width) {
    settings.width = px(bounds.width);
  }

  if (bounds.height) {
    settings.min_height = px(bounds.height);
  }

  return {
    id: helpers.nextId(`${child.name}-wrapper`),
    elType: "container",
    isInner: depth > 0,
    settings,
    elements: [element]
  };
}

function mapOverlayGroup(node, helpers, depth, backgroundChild) {
  const foregroundChildren = node.children.filter((child) => child !== backgroundChild);
  const bounds = getNodeBounds(backgroundChild);
  const foregroundBounds = foregroundChildren.map((child) => getNodeBounds(child));
  const paddingTop = foregroundBounds.length ? Math.max(0, Math.min(...foregroundBounds.map((box) => box.y)) - bounds.y) : 0;
  const paddingRight = foregroundBounds.length ? Math.max(0, bounds.right - Math.max(...foregroundBounds.map((box) => box.right))) : 0;
  const paddingBottom = foregroundBounds.length ? Math.max(0, bounds.bottom - Math.max(...foregroundBounds.map((box) => box.bottom))) : 0;
  const paddingLeft = foregroundBounds.length ? Math.max(0, Math.min(...foregroundBounds.map((box) => box.x)) - bounds.x) : 0;
  const elements = foregroundChildren
    .sort((left, right) => {
      const topDelta = getNodeBounds(left).y - getNodeBounds(right).y;
      if (Math.abs(topDelta) > 4) {
        return topDelta;
      }

      return getNodeBounds(left).x - getNodeBounds(right).x;
    })
    .map((child) => mapNode(child, helpers, depth + 1))
    .filter(Boolean);

  const settings = {
    _title: node.name || "Container",
    content_width: "full",
    flex_direction: "column",
    flex_gap: px(8),
    flex_align_items: "flex-start",
    justify_content: "center",
    padding: box(paddingTop, paddingRight, paddingBottom, paddingLeft),
    html_tag: depth === 0 ? "section" : "div"
  };

  if (node.absoluteBoundingBox?.height) {
    settings.min_height = px(node.absoluteBoundingBox.height);
  }

  if (node.absoluteBoundingBox?.width) {
    settings.width = px(node.absoluteBoundingBox.width);
  }

  applyContainerSurface(settings, backgroundChild);

  return {
    id: helpers.nextId(node.name),
    elType: "container",
    isInner: depth > 0,
    settings,
    elements
  };
}

function mapSpatialChildren(node, helpers, depth) {
  const rows = groupChildrenByRows(node.children || []);

  if (!rows.length) {
    return {
      direction: "column",
      gap: 0,
      elements: []
    };
  }

  if (rows.length === 1 && rows[0].children.length > 1) {
    const onlyRow = rows[0].children;
    const elements = onlyRow
      .map((child) => {
        const mapped = mapNode(child, helpers, depth + 1);
        if (!mapped) {
          return null;
        }

        return mapped.elType === "widget" ? createMeasuredWrapper(child, mapped, helpers, depth + 1) : mapped;
      })
      .filter(Boolean);

    const gap = onlyRow.slice(1).reduce((accumulator, child, index) => {
      const previous = getNodeBounds(onlyRow[index]);
      const current = getNodeBounds(child);
      return accumulator + Math.max(0, current.x - previous.right);
    }, 0) / Math.max(onlyRow.length - 1, 1);

    return {
      direction: "row",
      gap,
      elements
    };
  }

  const rowGap = rows.slice(1).reduce((accumulator, row, index) => {
    const previous = rows[index];
    return accumulator + Math.max(0, row.top - previous.bottom);
  }, 0) / Math.max(rows.length - 1, 1);

  const elements = rows
    .map((row, rowIndex) => {
      if (row.children.length === 1) {
        return mapNode(row.children[0], helpers, depth + 1);
      }

      const rowGapValue = row.children.slice(1).reduce((accumulator, child, index) => {
        const previous = getNodeBounds(row.children[index]);
        const current = getNodeBounds(child);
        return accumulator + Math.max(0, current.x - previous.right);
      }, 0) / Math.max(row.children.length - 1, 1);

      const rowElements = row.children
        .map((child) => {
          const mapped = mapNode(child, helpers, depth + 2);
          if (!mapped) {
            return null;
          }

          return mapped.elType === "widget" ? createMeasuredWrapper(child, mapped, helpers, depth + 2) : mapped;
        })
        .filter(Boolean);

      return {
        id: helpers.nextId(`${node.name}-row-${rowIndex + 1}`),
        elType: "container",
        isInner: true,
        settings: {
          _title: `${node.name || "Container"} Row ${rowIndex + 1}`,
          content_width: "full",
          flex_direction: "row",
          flex_gap: px(rowGapValue),
          flex_align_items: "stretch",
          justify_content: "flex-start",
          padding: box(0, 0, 0, 0),
          html_tag: "div"
        },
        elements: rowElements
      };
    })
    .filter(Boolean);

  return {
    direction: "column",
    gap: rowGap,
    elements
  };
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
  const settings = {
    _title: node.name || "Image",
    image: {
      url: node.imageUrl || "https://placehold.co/1200x800?text=Figma+Asset"
    },
    image_size: "full"
  };

  if (node.absoluteBoundingBox?.width) {
    settings.image_width = px(node.absoluteBoundingBox.width);
  }

  return {
    id: helpers.nextId(node.name),
    elType: "widget",
    widgetType: "image",
    isInner: false,
    settings,
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
    background_hover_color: shiftColor(fill?.color || "#00695c", -0.12),
    button_hover_color: normalizeColor(textFill?.color) || "#ffffff",
    hover_animation: "grow",
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

  const overlayBackgroundChild = findOverlayBackgroundChild(node);
  if (overlayBackgroundChild) {
    return mapOverlayGroup(node, helpers, depth, overlayBackgroundChild);
  }

  let direction = node.layoutMode === "HORIZONTAL" ? "row" : "column";
  let gap = node.itemSpacing || 0;
  let elements = (node.children || [])
    .map((child) => mapNode(child, helpers, depth + 1))
    .filter(Boolean);

  if (node.layoutMode === "NONE" && hasChildren(node)) {
    const spatial = mapSpatialChildren(node, helpers, depth);
    direction = spatial.direction;
    gap = spatial.gap;
    elements = spatial.elements;
  }

  const settings = {
    _title: node.name || "Container",
    content_width: "full",
    flex_direction: direction,
    flex_gap: px(gap),
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
