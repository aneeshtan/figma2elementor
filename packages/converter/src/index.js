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
  if (!node) {
    return null;
  }

  return (node.fills || []).find((fill) => fill && fill.type === "SOLID" && fill.color);
}

function firstStroke(node) {
  if (!node) {
    return null;
  }

  return (node.strokes || []).find((stroke) => stroke && stroke.type === "SOLID" && stroke.color);
}

function firstShadow(node) {
  if (!node) {
    return null;
  }

  return (node.effects || []).find(
    (effect) => effect && ["DROP_SHADOW", "INNER_SHADOW"].includes(effect.type) && effect.color
  );
}

function hasChildren(node) {
  return Array.isArray(node.children) && node.children.length > 0;
}

function getSemantics(node) {
  return node && node.semantics && typeof node.semantics === "object" ? node.semantics : {};
}

function getWidgetHint(node) {
  const semantics = getSemantics(node);
  return typeof semantics.widgetHint === "string" && semantics.widgetHint ? semantics.widgetHint : null;
}

function getNodeRole(node) {
  const semantics = getSemantics(node);
  return typeof semantics.role === "string" && semantics.role ? semantics.role : null;
}

function hasRole(node, ...roles) {
  const role = getNodeRole(node);
  return !!role && roles.includes(role);
}

function normalizeStateToken(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized.includes("hover")) return "hover";
  if (normalized.includes("default") || normalized.includes("rest") || normalized.includes("idle")) return "default";
  if (normalized.includes("active") || normalized.includes("pressed")) return "active";
  if (normalized.includes("focus")) return "focus";
  if (normalized.includes("selected")) return "selected";
  return normalized;
}

function getNodeState(node) {
  const semantics = getSemantics(node);
  if (typeof semantics.state === "string" && semantics.state) {
    return normalizeStateToken(semantics.state);
  }

  if (node && node.variantProperties && typeof node.variantProperties === "object") {
    const values = Object.values(node.variantProperties);

    for (let index = 0; index < values.length; index += 1) {
      const normalized = normalizeStateToken(values[index]);
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

function getMotionTokens(node) {
  const semantics = getSemantics(node);
  return Array.isArray(semantics.motionTokens) ? semantics.motionTokens : [];
}

function hasHoverReaction(node) {
  if (!node || !Array.isArray(node.reactions)) {
    return false;
  }

  return node.reactions.some((reaction) => reaction && reaction.trigger === "ON_HOVER");
}

function getInteractiveVariants(node) {
  const variants = node && node.component && node.component.interactiveVariants;
  return variants && Array.isArray(variants.variants) ? variants.variants : [];
}

function getVariantState(variant) {
  if (!variant || typeof variant !== "object") {
    return null;
  }

  if (typeof variant.state === "string" && variant.state) {
    return normalizeStateToken(variant.state);
  }

  if (variant.variantProperties && typeof variant.variantProperties === "object") {
    const values = Object.values(variant.variantProperties);
    for (let index = 0; index < values.length; index += 1) {
      const normalized = normalizeStateToken(values[index]);
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

function findVariantByStates(variants, desiredStates) {
  return variants.find((variant) => desiredStates.includes(getVariantState(variant))) || null;
}

function getVariantFillColor(variant) {
  const fills = variant && variant.summary && Array.isArray(variant.summary.fills) ? variant.summary.fills : [];
  const solidFill = fills.find((fill) => fill && fill.type === "SOLID" && fill.color);
  return solidFill ? normalizeColor(solidFill.color) : undefined;
}

function getVariantTextColor(variant) {
  const fills =
    variant && variant.summary && variant.summary.text && Array.isArray(variant.summary.text.fills)
      ? variant.summary.text.fills
      : [];
  const solidFill = fills.find((fill) => fill && fill.type === "SOLID" && fill.color);
  return solidFill ? normalizeColor(solidFill.color) : undefined;
}

function getVariantBorderColor(variant) {
  const strokes = variant && variant.summary && Array.isArray(variant.summary.strokes) ? variant.summary.strokes : [];
  const solidStroke = strokes.find((stroke) => stroke && stroke.type === "SOLID" && stroke.color);
  return solidStroke ? normalizeColor(solidStroke.color) : undefined;
}

function getVariantShadow(variant) {
  const effects = variant && variant.summary && Array.isArray(variant.summary.effects) ? variant.summary.effects : [];
  return effects.find((effect) => effect && ["DROP_SHADOW", "INNER_SHADOW"].includes(effect.type) && effect.color) || null;
}

function getMotionPreset(node, fallback = null) {
  const motionTokens = getMotionTokens(node);

  if (motionTokens.includes("lift")) return "float";
  if (motionTokens.includes("grow")) return "grow";
  if (motionTokens.includes("zoom-in")) return "grow";
  if (motionTokens.includes("fade-up") || motionTokens.includes("slide-up")) return "float";
  if (hasHoverReaction(node)) return fallback || "grow";
  return fallback;
}

function hasAutoPlayMotion(node) {
  const motionTokens = getMotionTokens(node);
  if (motionTokens.includes("autoplay")) {
    return true;
  }

  if (!node || !Array.isArray(node.reactions)) {
    return false;
  }

  return node.reactions.some((reaction) => reaction && reaction.trigger === "AFTER_TIMEOUT");
}

function applyInteractiveHover(settings, node, kind) {
  const variants = getInteractiveVariants(node);
  if (!variants.length) {
    if (kind === "button") {
      const motion = getMotionPreset(node, settings.hover_animation || "grow");
      if (motion) {
        settings.hover_animation = motion;
      }
    }
    return;
  }

  const hoverVariant = findVariantByStates(variants, ["hover", "active", "focus", "selected"]);
  if (!hoverVariant) {
    return;
  }

  if (kind === "button") {
    const hoverFill = getVariantFillColor(hoverVariant);
    const hoverText = getVariantTextColor(hoverVariant);

    if (hoverFill) {
      settings.background_hover_color = hoverFill;
    }

    if (hoverText) {
      settings.button_hover_color = hoverText;
    }

    const motion = getMotionPreset(node, settings.hover_animation || "grow");
    if (motion) {
      settings.hover_animation = motion;
    }

    return;
  }

  const hoverFill = getVariantFillColor(hoverVariant);
  const hoverBorder = getVariantBorderColor(hoverVariant);
  const hoverShadow = getVariantShadow(hoverVariant);

  if (hoverFill) {
    settings.background_hover_background = "classic";
    settings.background_hover_color = hoverFill;
  }

  if (hoverBorder) {
    settings.border_hover_color = hoverBorder;
  }

  if (hoverShadow) {
    settings.box_shadow_box_shadow_type = "yes";
    settings.box_shadow_box_shadow = {
      horizontal: Math.round(hoverShadow.offset?.x || 0),
      vertical: Math.round(hoverShadow.offset?.y || 0),
      blur: Math.round(hoverShadow.radius || 0),
      spread: Math.round(hoverShadow.spread || 0),
      color: normalizeColor(hoverShadow.color),
      position: hoverShadow.type === "INNER_SHADOW" ? "inset" : "outline"
    };
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function inferHeadingLevel(fontSize = 16) {
  if (fontSize >= 48) return "h1";
  if (fontSize >= 36) return "h2";
  if (fontSize >= 28) return "h3";
  if (fontSize >= 22) return "h4";
  return "h5";
}

function inferTextWidget(node) {
  const explicitWidget = getWidgetHint(node);
  if (explicitWidget === "heading" || explicitWidget === "text-editor") {
    return explicitWidget;
  }

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

function collectDescendants(node, includeSelf = false) {
  if (!node) {
    return [];
  }

  const items = includeSelf ? [node] : [];

  for (const child of node.children || []) {
    items.push(child, ...collectDescendants(child));
  }

  return items;
}

function isImageLikeNode(node) {
  return Boolean(node) && (node.type === "IMAGE" || ((node.type === "RECTANGLE" || node.type === "FRAME") && node.imageUrl));
}

function isTextNode(node) {
  return node?.type === "TEXT" && node.characters && node.characters.trim();
}

function isDotNode(node) {
  if (!node || !["ELLIPSE", "RECTANGLE"].includes(node.type)) {
    return false;
  }

  const bounds = getNodeBounds(node);
  return bounds.width > 0 && bounds.width <= 18 && bounds.height > 0 && bounds.height <= 18;
}

function isLikelyDotsGroup(node) {
  if (hasRole(node, "dots")) {
    return true;
  }

  if (!hasChildren(node)) {
    return false;
  }

  const visibleChildren = (node.children || []).filter((child) => child.visible !== false);
  return (
    visibleChildren.length >= 2 &&
    visibleChildren.length <= 8 &&
    visibleChildren.every((child) => hasRole(child, "dot") || isDotNode(child))
  );
}

function getAverageDimension(nodes, key) {
  if (!nodes.length) {
    return 0;
  }

  return nodes.reduce((sum, node) => sum + getNodeBounds(node)[key], 0) / nodes.length;
}

function areSimilarlySized(nodes) {
  if (nodes.length < 2) {
    return false;
  }

  const averageWidth = getAverageDimension(nodes, "width");
  const averageHeight = getAverageDimension(nodes, "height");

  return nodes.every((node) => {
    const bounds = getNodeBounds(node);
    return (
      bounds.width >= averageWidth * 0.7 &&
      bounds.width <= averageWidth * 1.3 &&
      bounds.height >= averageHeight * 0.7 &&
      bounds.height <= averageHeight * 1.3
    );
  });
}

function isLikelySlideCard(node) {
  if (hasRole(node, "slide", "card")) {
    return true;
  }

  if (!hasChildren(node)) {
    return false;
  }

  const descendants = collectDescendants(node);
  const images = descendants.filter((child) => isImageLikeNode(child));
  const textNodes = descendants.filter((child) => isTextNode(child));

  return images.length >= 1 && textNodes.length >= 2;
}

function getAverageHorizontalGap(nodes) {
  if (nodes.length < 2) {
    return 0;
  }

  const sorted = [...nodes].sort((left, right) => getNodeBounds(left).x - getNodeBounds(right).x);
  const total = sorted.slice(1).reduce((sum, node, index) => {
    const previous = getNodeBounds(sorted[index]);
    const current = getNodeBounds(node);
    return sum + Math.max(0, current.x - previous.right);
  }, 0);

  return total / Math.max(sorted.length - 1, 1);
}

function getViewportWidth(node, fallbackNode) {
  const primaryWidth = getNodeBounds(node).width;
  if (primaryWidth) {
    return primaryWidth;
  }

  return getNodeBounds(fallbackNode).width;
}

function findRepeatedCardTrack(node, viewportNode = node) {
  if (!hasChildren(node)) {
    return null;
  }

  const cardChildren = (node.children || []).filter((child) => child.visible !== false && isLikelySlideCard(child));
  if (cardChildren.length < 2 || !areSimilarlySized(cardChildren)) {
    return null;
  }

  const sortedCards = [...cardChildren].sort((left, right) => getNodeBounds(left).x - getNodeBounds(right).x);
  const first = getNodeBounds(sortedCards[0]);
  const last = getNodeBounds(sortedCards[sortedCards.length - 1]);
  const trackSpan = last.right - first.x;
  const gap = getAverageHorizontalGap(sortedCards);
  const viewportWidth = getViewportWidth(node, viewportNode);

  if (!node.clipsContent && trackSpan <= viewportWidth * 1.04 && gap <= viewportWidth * 0.04) {
    return null;
  }

  return {
    trackNode: node,
    cards: sortedCards,
    gap,
    viewportWidth
  };
}

function findExplicitSliderPattern(node) {
  if (!hasRole(node, "slider", "carousel")) {
    return null;
  }

  const descendants = collectDescendants(node);
  const visibleChildren = (node.children || []).filter((child) => child.visible !== false);
  const headingNode = visibleChildren.find((child) => isTextNode(child) && inferTextWidget(child) === "heading") || null;
  const dotsNode = descendants.find((child) => child !== node && (hasRole(child, "dots") || isLikelyDotsGroup(child))) || null;
  const trackNode = descendants.find((child) => child !== node && hasRole(child, "track")) || node;
  const cards = (trackNode.children || []).filter((child) => child.visible !== false && isLikelySlideCard(child));

  if (cards.length < 2) {
    return null;
  }

  const gap = getAverageHorizontalGap(cards);
  const viewportWidth = getViewportWidth(trackNode, node);
  const averageCardWidth = getAverageDimension(cards, "width");
  const visibleSlides = Math.max(1, Math.min(3, Math.round(viewportWidth / Math.max(averageCardWidth, 1))));

  return {
    headingNode,
    dotsNode,
    trackNode,
    cards,
    gap,
    visibleSlides
  };
}

function findSliderPattern(node) {
  if (!hasChildren(node)) {
    return null;
  }

  const explicitPattern = findExplicitSliderPattern(node);
  if (explicitPattern) {
    return explicitPattern;
  }

  const visibleChildren = (node.children || []).filter((child) => child.visible !== false);
  const headingNode = visibleChildren.find((child) => isTextNode(child) && inferTextWidget(child) === "heading");
  const dotsNode = visibleChildren.find((child) => isLikelyDotsGroup(child));
  const trackCandidates = visibleChildren.filter((child) => child !== headingNode && child !== dotsNode);
  const candidates = [];

  for (const candidate of trackCandidates) {
    const directMatch = findRepeatedCardTrack(candidate, candidate);
    if (directMatch) {
      candidates.push(directMatch);
    }

    for (const nestedChild of candidate.children || []) {
      const nestedMatch = findRepeatedCardTrack(nestedChild, candidate);
      if (nestedMatch) {
        candidates.push(nestedMatch);
      }
    }
  }

  const selfMatch = findRepeatedCardTrack(node, node);
  if (selfMatch) {
    candidates.push(selfMatch);
  }

  const bestMatch = candidates.sort((left, right) => right.cards.length - left.cards.length)[0];
  if (!bestMatch) {
    return null;
  }

  const averageCardWidth = getAverageDimension(bestMatch.cards, "width");
  const visibleSlides = Math.max(1, Math.min(3, Math.round(bestMatch.viewportWidth / Math.max(averageCardWidth, 1))));

  if (!dotsNode && bestMatch.cards.length <= visibleSlides) {
    return null;
  }

  return {
    headingNode,
    dotsNode,
    trackNode: bestMatch.trackNode,
    cards: bestMatch.cards,
    gap: bestMatch.gap,
    visibleSlides
  };
}

function getButtonLikeNodes(node) {
  return collectDescendants(node).filter(
    (child) =>
      ["FRAME", "GROUP", "COMPONENT", "INSTANCE"].includes(child.type) &&
      (isButtonLikeFrame(child) ||
        ((child.name || "").toLowerCase().includes("button") && collectDescendants(child).some((descendant) => descendant.type === "TEXT")))
  );
}

function pickPanelBackgroundNode(node, imageNode) {
  const imageBounds = getNodeBounds(imageNode);
  const solidShapes = collectDescendants(node)
    .filter((child) => isShapeNode(child) && !child.imageUrl && firstSolidFill(child)?.color)
    .sort((left, right) => getArea(right) - getArea(left));

  return solidShapes.find((shape) => {
    const bounds = getNodeBounds(shape);
    return bounds.x >= imageBounds.right - 24 && bounds.height >= imageBounds.height * 0.7;
  }) || solidShapes[0] || null;
}

function extractButtonData(node) {
  const explicitButtonNode = collectDescendants(node).find((child) => hasRole(child, "button")) || null;
  const buttonNode = explicitButtonNode || getButtonLikeNodes(node)[0];
  if (!buttonNode) {
    return null;
  }

  const textChild = collectDescendants(buttonNode, true).find((child) => child.type === "TEXT" && child.characters?.trim());
  const fill = firstSolidFill(buttonNode);
  const textFill = textChild ? firstSolidFill(textChild) : null;

  const settings = {
    text: textChild?.characters?.trim() || "Read more",
    backgroundColor: normalizeColor(fill?.color) || "#be9f3f",
    textColor: normalizeColor(textFill?.color) || "#ffffff",
    hoverBackgroundColor: shiftColor(fill?.color || "#be9f3f", -0.12),
    radius: buttonNode.cornerRadius || 6
  };

  applyInteractiveHover(settings, buttonNode, "button");

  return settings;
}

function extractSlideCardData(node) {
  const descendants = collectDescendants(node);
  const explicitMediaNode = descendants.find((child) => hasRole(child, "media") && child.imageUrl) || null;
  const imageNode = (explicitMediaNode ? [explicitMediaNode] : descendants)
    .filter((child) => isImageLikeNode(child))
    .sort((left, right) => getArea(right) - getArea(left))[0];

  if (!imageNode) {
    return null;
  }

  const panelNode = pickPanelBackgroundNode(node, imageNode);
  const contentRoot = descendants.find((child) => hasRole(child, "content")) || node;
  const contentDescendants = collectDescendants(contentRoot, contentRoot === node);
  const textNodes = contentDescendants
    .filter((child) => isTextNode(child))
    .sort((left, right) => {
      const sizeDelta = (right.style?.fontSize || 0) - (left.style?.fontSize || 0);
      if (Math.abs(sizeDelta) > 0.5) {
        return sizeDelta;
      }

      return getNodeBounds(left).y - getNodeBounds(right).y;
    });
  const button = extractButtonData(node);
  const titleNode = textNodes[0] || null;
  const bodyNode = textNodes.find(
    (child) => child !== titleNode && (!button || child.characters.trim() !== button.text.trim())
  ) || textNodes[1] || null;
  const panelFill = firstSolidFill(panelNode);
  const titleFill = titleNode ? firstSolidFill(titleNode) : null;
  const bodyFill = bodyNode ? firstSolidFill(bodyNode) : null;
  const imageBounds = getNodeBounds(imageNode);
  const panelBounds = panelNode ? getNodeBounds(panelNode) : null;

  return {
    title: titleNode?.characters?.trim() || node.name || "Slide",
    body: bodyNode?.characters?.trim() || "",
    imageUrl: imageNode.imageUrl,
    panelColor: normalizeColor(panelFill?.color) || "#c2e3ed",
    titleColor: normalizeColor(titleFill?.color) || "#303351",
    bodyColor: normalizeColor(bodyFill?.color) || "#012633",
    panelRadius: panelNode?.cornerRadius || node.cornerRadius || 12,
    imageRadius: imageNode.cornerRadius || node.cornerRadius || 12,
    button,
    minHeight: Math.max(imageBounds.height || 0, panelBounds?.height || 0, 240)
  };
}

function createHtmlWidgetNode(name, html, helpers) {
  return {
    id: helpers.nextId(`${name}-html`),
    elType: "widget",
    widgetType: "html",
    isInner: false,
    settings: {
      _title: name || "HTML",
      html
    },
    elements: []
  };
}

function mapSpacerNode(node, helpers) {
  const bounds = getNodeBounds(node);

  return {
    id: helpers.nextId(node.name),
    elType: "widget",
    widgetType: "spacer",
    isInner: false,
    settings: {
      _title: node.name || "Spacer",
      space: Math.max(8, Math.round(bounds.height || bounds.width || 24))
    },
    elements: []
  };
}

function mapDividerNode(node, helpers) {
  const bounds = getNodeBounds(node);
  const stroke = firstStroke(node);
  const fill = firstSolidFill(node);
  const color = normalizeColor(stroke?.color || fill?.color) || "#d4d4d8";

  return {
    id: helpers.nextId(node.name),
    elType: "widget",
    widgetType: "divider",
    isInner: false,
    settings: {
      _title: node.name || "Divider",
      color,
      weight: Math.max(1, Math.round(stroke?.weight || bounds.height || 1)),
      width: {
        unit: "%",
        size: 100,
        sizes: []
      }
    },
    elements: []
  };
}

function buildSliderHtml(node, slides, options, helpers) {
  const sliderId = `f2e-slider-${helpers.nextId(node.name || "slider")}`;
  const visibleSlides = Math.max(1, Number(options.visibleSlides || 1));
  const gap = Math.max(16, Math.round(options.gap || 24));
  const autoplay = Boolean(options.autoplay);
  const dotCount = Math.max(1, slides.length - visibleSlides + 1);
  const dots = Array.from({ length: dotCount }, (_, index) => index);
  const slideMarkup = slides
    .map((slide, index) => {
      const buttonMarkup = slide.button
        ? `<button class="f2e-slider__button" type="button" style="--f2e-btn-bg:${escapeAttribute(slide.button.backgroundColor)};--f2e-btn-bg-hover:${escapeAttribute(slide.button.hoverBackgroundColor)};--f2e-btn-color:${escapeAttribute(slide.button.textColor)};--f2e-btn-radius:${Number(slide.button.radius || 6)}px;">${escapeHtml(slide.button.text)}</button>`
        : "";

      return `
        <article class="f2e-slider__slide" data-slide-index="${index}">
          <div class="f2e-slider__card" style="--f2e-panel:${escapeAttribute(slide.panelColor)};--f2e-panel-radius:${Number(slide.panelRadius || 12)}px;--f2e-image-radius:${Number(slide.imageRadius || 12)}px;--f2e-title:${escapeAttribute(slide.titleColor)};--f2e-body:${escapeAttribute(slide.bodyColor)};--f2e-card-height:${Math.round(slide.minHeight)}px;">
            <div class="f2e-slider__media">
              <img src="${escapeAttribute(slide.imageUrl)}" alt="${escapeAttribute(slide.title)}" />
            </div>
            <div class="f2e-slider__content">
              <h3>${escapeHtml(slide.title)}</h3>
              <p>${escapeHtml(slide.body)}</p>
              ${buttonMarkup}
            </div>
          </div>
        </article>`;
    })
    .join("");
  const dotsMarkup = dots
    .map(
      (index) =>
        `<button class="f2e-slider__dot${index === 0 ? " is-active" : ""}" type="button" aria-label="Go to slide ${index + 1}" data-dot-index="${index}"></button>`
    )
    .join("");

  return `
<div id="${sliderId}" class="f2e-slider" data-visible-slides="${visibleSlides}" data-gap="${gap}" data-autoplay="${autoplay ? "true" : "false"}">
  <div class="f2e-slider__viewport">
    <div class="f2e-slider__track">
      ${slideMarkup}
    </div>
  </div>
  <div class="f2e-slider__dots" role="tablist" aria-label="${escapeAttribute(node.name || "Slider navigation")}">
    ${dotsMarkup}
  </div>
</div>
<style>
  #${sliderId}{--f2e-gap:${gap}px;--f2e-visible:${visibleSlides};width:100%}
  #${sliderId} .f2e-slider__viewport{overflow:hidden;width:100%}
  #${sliderId} .f2e-slider__track{display:flex;gap:var(--f2e-gap);transition:transform .45s ease}
  #${sliderId} .f2e-slider__slide{flex:0 0 calc((100% - (var(--f2e-gap) * (var(--f2e-visible) - 1))) / var(--f2e-visible))}
  #${sliderId} .f2e-slider__card{display:grid;grid-template-columns:minmax(220px,46%) 1fr;min-height:var(--f2e-card-height);border-radius:var(--f2e-panel-radius);overflow:hidden;box-shadow:0 16px 40px rgba(14,30,37,.08);transform:translateY(0);transition:transform .28s ease,box-shadow .28s ease;background:var(--f2e-panel)}
  #${sliderId} .f2e-slider__card:hover{transform:translateY(-6px);box-shadow:0 22px 48px rgba(14,30,37,.15)}
  #${sliderId} .f2e-slider__media{min-height:100%}
  #${sliderId} .f2e-slider__media img{display:block;width:100%;height:100%;min-height:var(--f2e-card-height);object-fit:cover;border-radius:var(--f2e-image-radius) 0 0 var(--f2e-image-radius)}
  #${sliderId} .f2e-slider__content{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:34px 28px;background:var(--f2e-panel)}
  #${sliderId} .f2e-slider__content h3{margin:0 0 16px;color:var(--f2e-title);font-size:clamp(24px,2vw,36px);line-height:1.12}
  #${sliderId} .f2e-slider__content p{margin:0;color:var(--f2e-body);font-size:18px;line-height:1.5}
  #${sliderId} .f2e-slider__button{margin-top:28px;border:0;border-radius:var(--f2e-btn-radius);background:var(--f2e-btn-bg);color:var(--f2e-btn-color);padding:12px 22px;font-size:16px;font-weight:700;line-height:1.1;cursor:pointer;transition:background-color .2s ease,transform .2s ease}
  #${sliderId} .f2e-slider__button:hover{background:var(--f2e-btn-bg-hover);transform:translateY(-1px)}
  #${sliderId} .f2e-slider__dots{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:20px}
  #${sliderId} .f2e-slider__dot{width:12px;height:12px;border-radius:999px;border:0;background:rgba(48,51,81,.2);cursor:pointer;transition:transform .2s ease,background-color .2s ease}
  #${sliderId} .f2e-slider__dot.is-active{background:#303351;transform:scale(1.08)}
  @media (max-width: 1024px){
    #${sliderId}{--f2e-visible:1}
    #${sliderId} .f2e-slider__card{grid-template-columns:1fr}
    #${sliderId} .f2e-slider__media img{border-radius:var(--f2e-image-radius) var(--f2e-image-radius) 0 0;min-height:260px}
  }
</style>
<script>
  (function() {
    var root = document.getElementById(${JSON.stringify(sliderId)});
    if (!root) return;
    var viewport = root.querySelector('.f2e-slider__viewport');
    var track = root.querySelector('.f2e-slider__track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.f2e-slider__slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.f2e-slider__dot'));
    if (!viewport || !track || !slides.length) return;
    function getPerView() {
      return window.innerWidth <= 1024 ? 1 : Number(root.getAttribute('data-visible-slides') || 1);
    }
    function getMaxIndex() {
      return Math.max(0, slides.length - getPerView());
    }
    function setActive(index) {
      var maxIndex = getMaxIndex();
      var target = Math.max(0, Math.min(index, maxIndex));
      var gap = parseFloat(getComputedStyle(track).gap || root.getAttribute('data-gap') || 0);
      var width = slides[0].getBoundingClientRect().width + gap;
      track.style.transform = 'translateX(' + (target * width * -1) + 'px)';
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === target);
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        setActive(Number(dot.getAttribute('data-dot-index') || 0));
      });
    });
    if (root.getAttribute('data-autoplay') === 'true' && dots.length > 1) {
      window.setInterval(function() {
        var current = Number((root.querySelector('.f2e-slider__dot.is-active') || dots[0]).getAttribute('data-dot-index') || 0);
        var next = current >= dots.length - 1 ? 0 : current + 1;
        setActive(next);
      }, 4200);
    }
    window.addEventListener('resize', function() {
      setActive(Number((root.querySelector('.f2e-slider__dot.is-active') || dots[0] || { getAttribute: function() { return 0; } }).getAttribute('data-dot-index') || 0));
    });
    setActive(0);
  })();
</script>`;
}

function mapSliderSection(node, helpers, depth, sliderPattern) {
  const slideData = sliderPattern.cards.map((card) => extractSlideCardData(card)).filter(Boolean);

  if (slideData.length < 2) {
    return null;
  }

  const elements = [];
  if (sliderPattern.headingNode) {
    elements.push(mapTextNode(sliderPattern.headingNode, helpers));
  }

  elements.push(
    createHtmlWidgetNode(
      `${node.name || "Slider"} Carousel`,
      buildSliderHtml(node, slideData, { visibleSlides: sliderPattern.visibleSlides, gap: sliderPattern.gap, autoplay: hasAutoPlayMotion(node) }, helpers),
      helpers
    )
  );

  return {
    id: helpers.nextId(node.name),
    elType: "container",
    isInner: depth > 0,
    settings: {
      _title: node.name || "Slider Section",
      content_width: "full",
      flex_direction: "column",
      flex_gap: px(24),
      flex_align_items: "stretch",
      justify_content: "flex-start",
      padding: box(node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft),
      html_tag: depth === 0 ? "section" : "div"
    },
    elements
  };
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
  applyInteractiveHover(settings, node, "container");
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
  if (hasRole(node, "button")) {
    return true;
  }

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
  applyInteractiveHover(settings, node, "button");

  const motionPreset = getMotionPreset(node, settings.hover_animation);
  if (motionPreset) {
    settings.hover_animation = motionPreset;
  }

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
  const explicitWidget = getWidgetHint(node);

  if (explicitWidget === "button") {
    return mapButtonNode(node, helpers);
  }

  if (explicitWidget === "spacer") {
    return mapSpacerNode(node, helpers);
  }

  if (explicitWidget === "divider") {
    return mapDividerNode(node, helpers);
  }

  if (isButtonLikeFrame(node)) {
    return mapButtonNode(node, helpers);
  }

  const sliderPattern = explicitWidget === "slider" || hasRole(node, "slider", "carousel") ? findSliderPattern(node) : findSliderPattern(node);
  if (sliderPattern) {
    const sliderSection = mapSliderSection(node, helpers, depth, sliderPattern);
    if (sliderSection) {
      return sliderSection;
    }
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

  const explicitWidget = getWidgetHint(node);
  if (explicitWidget || getNodeRole(node)) {
    helpers.report.hintsApplied += 1;
  }

  if (["FRAME", "GROUP", "COMPONENT", "INSTANCE", "SELECTION"].includes(node.type)) {
    return mapFrameNode(node, helpers, depth);
  }

  if (node.type === "TEXT") {
    return mapTextNode(node, helpers);
  }

  if (explicitWidget === "image" && node.imageUrl) {
    const widget = mapImageNode(node, helpers);
    applyBorder(widget.settings, node);
    applyBorderRadius(widget.settings, node);
    applyShadow(widget.settings, node);
    return widget;
  }

  if (explicitWidget === "spacer") {
    return mapSpacerNode(node, helpers);
  }

  if (explicitWidget === "divider") {
    return mapDividerNode(node, helpers);
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
    hintsApplied: 0,
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
