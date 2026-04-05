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

function firstBackgroundFill(node) {
  if (!node) {
    return null;
  }

  return (node.fills || []).find(
    (fill) => fill && (fill.type === "SOLID" && fill.color || Array.isArray(fill.gradientStops) && fill.gradientStops.length >= 2)
  );
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

function findBlurEffect(node) {
  if (!node) {
    return null;
  }

  return (node.effects || []).find(
    (effect) => effect && ["LAYER_BLUR", "BACKGROUND_BLUR"].includes(effect.type) && typeof effect.radius === "number"
  );
}

function hasChildren(node) {
  return Array.isArray(node.children) && node.children.length > 0;
}

function getSemantics(node) {
  return node && node.semantics && typeof node.semantics === "object" ? node.semantics : {};
}

function getElementorHint(node) {
  const semantics = getSemantics(node);
  return semantics && semantics.elementorHint && typeof semantics.elementorHint === "object" ? semantics.elementorHint : null;
}

function getWidgetHint(node) {
  const semantics = getSemantics(node);
  return typeof semantics.widgetHint === "string" && semantics.widgetHint ? semantics.widgetHint : null;
}

function getFieldType(node) {
  const hint = getElementorHint(node);
  return hint && typeof hint.fieldType === "string" && hint.fieldType ? hint.fieldType : null;
}

function getElementorLabel(node, fallback = "") {
  const hint = getElementorHint(node);
  if (hint && typeof hint.label === "string" && hint.label.trim()) {
    return hint.label.trim();
  }

  return fallback || node?.name || "";
}

function getIconName(node) {
  const hint = getElementorHint(node);
  if (hint && typeof hint.iconName === "string" && hint.iconName.trim()) {
    return hint.iconName.trim().toLowerCase();
  }

  return null;
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

function getBreakpointHints(node) {
  const semantics = getSemantics(node);
  const breakpoints = semantics && typeof semantics.breakpoints === "object" ? semantics.breakpoints : {};

  return {
    hiddenOn: Array.isArray(breakpoints.hiddenOn) ? breakpoints.hiddenOn : [],
    stackOn: Array.isArray(breakpoints.stackOn) ? breakpoints.stackOn : []
  };
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

function getVariantStateDiffs(node) {
  const variants = node && node.component && node.component.interactiveVariants;
  return variants && Array.isArray(variants.stateDiffs) ? variants.stateDiffs : [];
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

function findStateDiff(node, desiredStates) {
  const diffs = getVariantStateDiffs(node);
  return diffs.find((item) => item && desiredStates.includes(normalizeStateToken(item.state))) || null;
}

function getDeltaFillColor(diff) {
  const fills = diff && diff.delta && Array.isArray(diff.delta.fills) ? diff.delta.fills : [];
  const solidFill = fills.find((fill) => fill && fill.type === "SOLID" && fill.color);
  return solidFill ? normalizeColor(solidFill.color) : undefined;
}

function getDeltaTextColor(diff) {
  const fills =
    diff && diff.delta && diff.delta.text && Array.isArray(diff.delta.text.fills)
      ? diff.delta.text.fills
      : [];
  const solidFill = fills.find((fill) => fill && fill.type === "SOLID" && fill.color);
  return solidFill ? normalizeColor(solidFill.color) : undefined;
}

function getDeltaBorderColor(diff) {
  const strokes = diff && diff.delta && Array.isArray(diff.delta.strokes) ? diff.delta.strokes : [];
  const solidStroke = strokes.find((stroke) => stroke && stroke.type === "SOLID" && stroke.color);
  return solidStroke ? normalizeColor(stroke.color) : undefined;
}

function getDeltaShadow(diff) {
  const effects = diff && diff.delta && Array.isArray(diff.delta.effects) ? diff.delta.effects : [];
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

function getReactionDetail(node, triggerTypes, actionTypes = []) {
  if (!node || !Array.isArray(node.reactions)) {
    return null;
  }

  return (
    node.reactions.find((reaction) => {
      const trigger = reaction && typeof reaction.trigger === "string" ? reaction.trigger : null;
      const action = reaction && typeof reaction.action === "string" ? reaction.action : null;
      if (!triggerTypes.includes(trigger)) {
        return false;
      }

      if (!actionTypes.length) {
        return true;
      }

      return actionTypes.includes(action);
    }) || null
  );
}

function getInteractionTiming(node) {
  const timeoutReaction = getReactionDetail(node, ["AFTER_TIMEOUT"]);
  const duration = timeoutReaction?.triggerDetail?.timeout || timeoutReaction?.triggerDetail?.delay || null;
  const transitionDuration = timeoutReaction?.transition?.duration || null;

  return {
    autoplayDelay: typeof duration === "number" && duration > 0 ? duration : null,
    transitionDuration: typeof transitionDuration === "number" && transitionDuration > 0 ? transitionDuration : null
  };
}

function applyInteractiveHover(settings, node, kind) {
  const hoverDiff = findStateDiff(node, ["hover", "active", "focus", "selected"]);
  const variants = getInteractiveVariants(node);
  if (!variants.length && !hoverDiff) {
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
    if (!hoverDiff) {
      return;
    }
  }

  if (kind === "button") {
    const hoverFill = getDeltaFillColor(hoverDiff) || getVariantFillColor(hoverVariant);
    const hoverText = getDeltaTextColor(hoverDiff) || getVariantTextColor(hoverVariant);

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

  const hoverFill = getDeltaFillColor(hoverDiff) || getVariantFillColor(hoverVariant);
  const hoverBorder = getDeltaBorderColor(hoverDiff) || getVariantBorderColor(hoverVariant);
  const hoverShadow = getDeltaShadow(hoverDiff) || getVariantShadow(hoverVariant);

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

function getRootConversionHints(helpers) {
  return helpers && helpers.root && helpers.root.conversionHints && typeof helpers.root.conversionHints === "object"
    ? helpers.root.conversionHints
    : null;
}

function getExportMode(helpers) {
  const hints = getRootConversionHints(helpers);
  return hints && typeof hints.exportMode === "string" && hints.exportMode ? hints.exportMode : "auto";
}

function isCoreSafeMode(helpers) {
  return getExportMode(helpers) === "core-safe";
}

function shouldForceNativeImageCarousel(node, helpers) {
  const hints = getRootConversionHints(helpers);
  const ids = hints && Array.isArray(hints.forceNativeImageCarouselIds) ? hints.forceNativeImageCarouselIds : [];
  return !!node && typeof node.id === "string" && ids.includes(node.id);
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

function gradientAngleFromHandles(fill) {
  const handles = Array.isArray(fill?.gradientHandlePositions) ? fill.gradientHandlePositions : [];
  if (handles.length < 2) {
    return 180;
  }

  const dx = Number(handles[1].x || 0) - Number(handles[0].x || 0);
  const dy = Number(handles[1].y || 0) - Number(handles[0].y || 0);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return Math.round((angle + 90 + 360) % 360);
}

function paintToCss(fill) {
  if (!fill) {
    return undefined;
  }

  if (fill.type === "SOLID" && fill.color) {
    return normalizeColor(fill.color);
  }

  if (Array.isArray(fill.gradientStops) && fill.gradientStops.length >= 2) {
    const stops = fill.gradientStops
      .filter((stop) => stop && stop.color)
      .map((stop) => `${normalizeColor(stop.color)} ${Math.round((stop.position || 0) * 100)}%`)
      .join(", ");

    if (!stops) {
      return undefined;
    }

    if (String(fill.type || "").includes("RADIAL")) {
      return `radial-gradient(circle, ${stops})`;
    }

    return `linear-gradient(${gradientAngleFromHandles(fill)}deg, ${stops})`;
  }

  return undefined;
}

function hexOrColorToRgba(value, alphaOverride = null) {
  const channels = getColorChannels(normalizeColor(value));
  if (!channels) {
    return normalizeColor(value);
  }

  const alpha = alphaOverride == null ? channels.alpha : alphaOverride;
  return `rgba(${Math.round(channels.red)}, ${Math.round(channels.green)}, ${Math.round(channels.blue)}, ${Number(alpha.toFixed(3))})`;
}

function getCornerRadiusValues(node) {
  const values = [node?.topLeftRadius, node?.topRightRadius, node?.bottomRightRadius, node?.bottomLeftRadius];
  if (values.every((value) => typeof value === "number")) {
    return values;
  }

  if (typeof node?.cornerRadius === "number" && node.cornerRadius > 0) {
    return [node.cornerRadius, node.cornerRadius, node.cornerRadius, node.cornerRadius];
  }

  return null;
}

function getResponsiveDisplay(node) {
  const hints = getBreakpointHints(node);
  const display = {
    desktop: true,
    tablet: true,
    mobile: true
  };

  hints.hiddenOn.forEach((breakpoint) => {
    if (breakpoint === "desktop") display.desktop = false;
    if (breakpoint === "tablet") display.tablet = false;
    if (breakpoint === "mobile") display.mobile = false;
  });

  return display;
}

function normalizeFontWeightValue(value) {
  if (typeof value === "number") {
    return value;
  }

  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (/\bthin\b/.test(normalized)) return 100;
  if (/\bextra light\b|\bultra light\b/.test(normalized)) return 200;
  if (/\blight\b/.test(normalized)) return 300;
  if (/\bregular\b|\bbook\b|\bnormal\b/.test(normalized)) return 400;
  if (/\bmedium\b/.test(normalized)) return 500;
  if (/\bsemi bold\b|\bsemibold\b|\bdemi bold\b/.test(normalized)) return 600;
  if (/\bextra bold\b|\bultra bold\b/.test(normalized)) return 800;
  if (/\bblack\b|\bheavy\b/.test(normalized)) return 900;
  if (/\bbold\b/.test(normalized)) return 700;
  return undefined;
}

function mapTextTransform(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "UPPER" || normalized === "UPPERCASE") return "uppercase";
  if (normalized === "LOWER" || normalized === "LOWERCASE") return "lowercase";
  if (normalized === "TITLE" || normalized === "TITLECASE") return "capitalize";
  return undefined;
}

function mapTextDecoration(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "UNDERLINE") return "underline";
  if (normalized === "STRIKETHROUGH") return "line-through";
  return undefined;
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
  const descendants = collectDescendants(node, true);
  const explicitMediaNode = descendants.find((child) => hasRole(child, "media") && child.imageUrl) || null;
  const imageNode = (explicitMediaNode ? [explicitMediaNode] : descendants)
    .filter((child) => isImageLikeNode(child))
    .sort((left, right) => getArea(right) - getArea(left))[0];

  if (!imageNode) {
    return null;
  }

  const panelNode = pickPanelBackgroundNode(node, imageNode);
  const contentRoot = descendants.find((child) => child !== node && hasRole(child, "content")) || node;
  const contentDescendants = collectDescendants(contentRoot, contentRoot === node);
  const textNodes = contentDescendants
    .filter((child) => isTextNode(child) && child.characters && child.characters.trim())
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
  const fallbackTitle = stripHtmlPrefix((node.name || "").trim());
  const titleText = titleNode?.characters?.trim() || "";
  const bodyText = bodyNode?.characters?.trim() || "";
  const resolvedTitle = titleText || fallbackTitle || "Slide";
  const isNumericFallbackTitle = /^\d+$/.test(resolvedTitle);
  const slideStroke = firstStroke(node) || firstStroke(panelNode);
  const slideFill = firstSolidFill(node) || panelFill;

  if (!bodyText && !button && (!titleText || isNumericFallbackTitle)) {
    return {
      type: "logo",
      title: !isNumericFallbackTitle ? resolvedTitle : "Logo",
      imageUrl: imageNode.imageUrl,
      cardColor: normalizeColor(slideFill?.color) || "#ffffff",
      borderColor: normalizeColor(slideStroke?.color) || "rgba(148,163,184,.24)",
      cardRadius: node.cornerRadius || panelNode?.cornerRadius || 12,
      imageRadius: imageNode.cornerRadius || node.cornerRadius || 12,
      minHeight: Math.max(imageBounds.height || 0, getNodeBounds(node).height || 0, 92),
      width: Math.max(getNodeBounds(node).width || imageBounds.width || 160, 120)
    };
  }

  return {
    type: "content",
    title: resolvedTitle,
    body: bodyText,
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

function isLogoLikeSlide(slide) {
  if (!slide || !slide.imageUrl) {
    return false;
  }

  const title = String(slide.title || "").trim();
  const body = String(slide.body || "").trim();

  return !slide.button && !body && (!title || /^logo$/i.test(title) || /^\d+$/.test(title));
}

function normalizeSlideDataForCarousel(slides) {
  return slides.map((slide) => {
    if (!slide || slide.type === "logo" || !isLogoLikeSlide(slide)) {
      return slide;
    }

    return {
      type: "logo",
      title: "Logo",
      imageUrl: slide.imageUrl,
      cardColor: normalizeColor(slide.panelColor) || "#ffffff",
      borderColor: "rgba(148,163,184,.24)",
      cardRadius: slide.panelRadius || 12,
      imageRadius: slide.imageRadius || slide.panelRadius || 12,
      minHeight: Math.max(Number(slide.minHeight) || 0, 92),
      width: 160
    };
  });
}

function isLogoLikeTrackCard(node) {
  if (!node) {
    return false;
  }

  const descendants = collectDescendants(node, true);
  const imageNodes = descendants.filter((child) => isImageLikeNode(child));

  if (!imageNodes.length) {
    return false;
  }

  const textValues = descendants
    .filter((child) => isTextNode(child) && child.characters && child.characters.trim())
    .map((child) => child.characters.trim());

  if (!textValues.length) {
    return true;
  }

  return textValues.every((value) => /^\d+$/.test(value) || /^logo$/i.test(value));
}

function extractRawLogoSlideFromCard(node) {
  if (!node) {
    return null;
  }

  const descendants = collectDescendants(node, true);
  const imageNode = descendants
    .filter((child) => isImageLikeNode(child))
    .sort((left, right) => getArea(right) - getArea(left))[0];

  if (!imageNode || !imageNode.imageUrl) {
    return null;
  }

  const cardBounds = getNodeBounds(node);
  const imageBounds = getNodeBounds(imageNode);
  const slideStroke = firstStroke(node);
  const slideFill = firstSolidFill(node);

  return {
    type: "logo",
    title: "Logo",
    imageUrl: imageNode.imageUrl,
    cardColor: normalizeColor(slideFill?.color) || "#ffffff",
    borderColor: normalizeColor(slideStroke?.color) || "rgba(148,163,184,.24)",
    cardRadius: node.cornerRadius || 12,
    imageRadius: imageNode.cornerRadius || node.cornerRadius || 12,
    minHeight: Math.max(cardBounds.height || imageBounds.height || 0, 92),
    width: Math.max(cardBounds.width || imageBounds.width || 0, 120)
  };
}

function isExplicitLogoCarousel(node, sliderPattern) {
  const names = [node?.name || "", sliderPattern?.trackNode?.name || ""]
    .join(" ")
    .toLowerCase();

  return (
    names.includes("logo") ||
    names.includes("logos") ||
    names.includes("brand") ||
    names.includes("brands")
  );
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

function getExplicitFieldNodes(node) {
  return (node.children || []).filter((child) => child.visible !== false && (getWidgetHint(child) === "form-field" || getFieldType(child) === "submit"));
}

function extractFieldTextNodes(node) {
  return collectDescendants(node, true)
    .filter((child) => isTextNode(child))
    .sort((left, right) => {
      const topDelta = getNodeBounds(left).y - getNodeBounds(right).y;
      if (Math.abs(topDelta) > 4) {
        return topDelta;
      }

      return getNodeBounds(left).x - getNodeBounds(right).x;
    });
}

function cleanFieldLabel(value, fallback = "Field") {
  const text = String(value || fallback).trim();
  return text || fallback;
}

function slugFromLabel(value, fallback = "field") {
  const slug = slugify(value || fallback);
  return slug || fallback;
}

function extractFieldOptions(node, placeholder) {
  const texts = extractFieldTextNodes(node)
    .map((child) => child.characters.trim())
    .filter(Boolean);
  const unique = [];

  for (let index = 0; index < texts.length; index += 1) {
    const value = texts[index];

    if (placeholder && value === placeholder) {
      continue;
    }

    if (!unique.includes(value)) {
      unique.push(value);
    }
  }

  return unique.length ? unique : ["Option 1", "Option 2", "Option 3"];
}

function extractFormFieldData(node) {
  const fieldType = getFieldType(node);
  if (!fieldType) {
    return null;
  }

  const bounds = getNodeBounds(node);
  const fill = firstSolidFill(node);
  const stroke = firstStroke(node);
  const textNodes = extractFieldTextNodes(node);
  const labelText = getElementorHint(node)?.label || node.name || "Field";
  const cleanedLabel = cleanFieldLabel(labelText.replace(/^el-[a-z0-9-]+:/i, ""), "Field");
  const placeholderNode = textNodes[textNodes.length - 1] || null;
  const placeholder = placeholderNode ? placeholderNode.characters.trim() : cleanedLabel;
  const textFill = placeholderNode ? firstSolidFill(placeholderNode) : null;
  const required = /\*/.test(cleanedLabel) || /\brequired\b/i.test(node.name || "");
  const role = fieldType === "submit" ? "submit" : "field";
  const base = {
    id: slugFromLabel(cleanedLabel, fieldType),
    role,
    type: fieldType,
    label: cleanedLabel.replace(/\s*\*+\s*$/, ""),
    placeholder,
    required,
    width: Math.round(bounds.width || 0),
    height: Math.round(bounds.height || 0),
    backgroundColor: normalizeColor(fill?.color) || "rgba(255,255,255,0.04)",
    borderColor: normalizeColor(stroke?.color) || "rgba(255,255,255,0.12)",
    textColor: normalizeColor(textFill?.color) || "#e2e8f0",
    radius: node.cornerRadius || 10
  };

  if (fieldType === "textarea") {
    base.rows = Math.max(4, Math.round((bounds.height || 120) / 32));
  }

  if (fieldType === "select") {
    base.options = extractFieldOptions(node, placeholder);
  }

  if (fieldType === "submit") {
    base.text = placeholder || cleanedLabel || "Submit";
    base.hoverBackgroundColor = shiftColor(fill?.color || "#be9f3f", -0.12);
    base.textColor = normalizeColor(textFill?.color) || "#ffffff";
    applyInteractiveHover(base, node, "button");
  }

  return base;
}

function buildFormRows(fields) {
  const sorted = [...fields].sort((left, right) => left.top - right.top || left.left - right.left);
  const rows = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const field = sorted[index];
    let row = rows.find((entry) => Math.abs(entry.centerY - field.centerY) <= Math.max(18, field.height * 0.35 || 18));

    if (!row) {
      row = {
        centerY: field.centerY,
        fields: []
      };
      rows.push(row);
    }

    row.fields.push(field);
  }

  return rows
    .sort((left, right) => left.centerY - right.centerY)
    .map((row) => row.fields.sort((left, right) => left.left - right.left));
}

function renderFormField(field) {
  const required = field.required ? " required" : "";
  const fieldLabel = field.label ? `<label for="${escapeAttribute(field.id)}">${escapeHtml(field.label)}</label>` : "";
  const commonStyle = `style="--f2e-field-bg:${escapeAttribute(field.backgroundColor)};--f2e-field-border:${escapeAttribute(field.borderColor)};--f2e-field-color:${escapeAttribute(field.textColor)};--f2e-field-radius:${Number(field.radius || 10)}px;"`;

  if (field.role === "submit") {
    return `
      <div class="f2e-form__submit">
        <button type="submit" class="f2e-form__button" style="--f2e-btn-bg:${escapeAttribute(field.backgroundColor)};--f2e-btn-bg-hover:${escapeAttribute(field.hoverBackgroundColor || shiftColor(field.backgroundColor, -0.12))};--f2e-btn-color:${escapeAttribute(field.textColor)};--f2e-btn-radius:${Number(field.radius || 10)}px;">${escapeHtml(field.text || field.label || "Submit")}</button>
      </div>`;
  }

  if (field.type === "textarea") {
    return `
      <div class="f2e-form__field" ${commonStyle}>
        ${fieldLabel}
        <textarea id="${escapeAttribute(field.id)}" name="${escapeAttribute(field.id)}" rows="${Math.max(4, Number(field.rows || 4))}" placeholder="${escapeAttribute(field.placeholder || "")}"${required}></textarea>
      </div>`;
  }

  if (field.type === "select") {
    const options = (field.options || []).map((option, index) => {
      const selected = index === 0 ? " selected" : "";
      return `<option value="${escapeAttribute(slugFromLabel(option, `option-${index + 1}`))}"${selected}>${escapeHtml(option)}</option>`;
    });

    return `
      <div class="f2e-form__field" ${commonStyle}>
        ${fieldLabel}
        <select id="${escapeAttribute(field.id)}" name="${escapeAttribute(field.id)}"${required}>
          ${options.join("")}
        </select>
      </div>`;
  }

  return `
    <div class="f2e-form__field" ${commonStyle}>
      ${fieldLabel}
      <input id="${escapeAttribute(field.id)}" name="${escapeAttribute(field.id)}" type="${escapeAttribute(field.type || "text")}" placeholder="${escapeAttribute(field.placeholder || "")}"${required} />
    </div>`;
}

function buildFormHtml(node, fields, helpers) {
  const formId = `f2e-form-${helpers.nextId(node.name || "form")}`;
  const rows = buildFormRows(fields);
  const nodeFill = firstSolidFill(node);
  const nodeStroke = firstStroke(node);
  const nodeShadow = firstShadow(node);
  const panelColor = normalizeColor(nodeFill?.color) || "transparent";
  const borderColor = normalizeColor(nodeStroke?.color) || "rgba(255,255,255,0.12)";
  const shadowColor = normalizeColor(nodeShadow?.color) || "rgba(15,23,42,0.12)";
  const rowMarkup = rows
    .map((row) => {
      const totalWidth = row.reduce((sum, field) => sum + Math.max(field.width, 1), 0);
      const columns = row
        .map((field) => {
          const width = totalWidth > 0 ? `${((field.width / totalWidth) * 100).toFixed(3)}%` : "1fr";
          return `<div class="f2e-form__cell" style="flex-basis:${width}">${renderFormField(field)}</div>`;
        })
        .join("");

      return `<div class="f2e-form__row">${columns}</div>`;
    })
    .join("");

  return `
<form id="${formId}" class="f2e-form" action="#" method="post">
  ${rowMarkup}
</form>
<style>
  #${formId}{display:flex;flex-direction:column;gap:18px;width:100%;padding:${Math.round(node.paddingTop || 0)}px ${Math.round(node.paddingRight || 0)}px ${Math.round(node.paddingBottom || 0)}px ${Math.round(node.paddingLeft || 0)}px;border:1px solid ${escapeAttribute(borderColor)};border-radius:${Number(node.cornerRadius || 0)}px;background:${escapeAttribute(panelColor)};box-shadow:0 18px 40px ${escapeAttribute(shadowColor)}}
  #${formId} .f2e-form__row{display:flex;gap:18px;flex-wrap:wrap}
  #${formId} .f2e-form__cell{flex:1 1 220px;min-width:0}
  #${formId} .f2e-form__field{display:flex;flex-direction:column;gap:8px}
  #${formId} label{font-size:13px;font-weight:600;line-height:1.4;color:#cbd5e1}
  #${formId} input,#${formId} textarea,#${formId} select{width:100%;appearance:none;border:1px solid var(--f2e-field-border);background:var(--f2e-field-bg);color:var(--f2e-field-color);border-radius:var(--f2e-field-radius);padding:14px 16px;font-size:15px;line-height:1.4;outline:none;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}
  #${formId} textarea{resize:vertical;min-height:132px}
  #${formId} input::placeholder,#${formId} textarea::placeholder{color:color-mix(in srgb, var(--f2e-field-color) 58%, transparent)}
  #${formId} input:focus,#${formId} textarea:focus,#${formId} select:focus{border-color:#f24e1e;box-shadow:0 0 0 4px rgba(242,78,30,.12)}
  #${formId} .f2e-form__submit{display:flex;align-items:flex-start}
  #${formId} .f2e-form__button{border:0;border-radius:var(--f2e-btn-radius);background:var(--f2e-btn-bg);color:var(--f2e-btn-color);padding:13px 24px;font-size:15px;font-weight:700;line-height:1.1;cursor:pointer;transition:background-color .2s ease,transform .2s ease,box-shadow .2s ease;box-shadow:0 12px 24px rgba(15,23,42,.12)}
  #${formId} .f2e-form__button:hover{background:var(--f2e-btn-bg-hover);transform:translateY(-2px)}
  @media (max-width: 767px){
    #${formId} .f2e-form__row{flex-direction:column}
    #${formId} .f2e-form__cell{flex-basis:auto}
  }
</style>`;
}

function mapFormNode(node, helpers) {
  const fieldNodes = getExplicitFieldNodes(node);
  if (!fieldNodes.length) {
    return null;
  }

  const fields = fieldNodes
    .map((child) => {
      const data = extractFormFieldData(child);
      if (!data) {
        return null;
      }

      const bounds = getNodeBounds(child);
      return {
        ...data,
        top: bounds.y,
        left: bounds.x,
        centerY: bounds.y + bounds.height / 2
      };
    })
    .filter(Boolean);

  if (!fields.length) {
    return null;
  }

  return createHtmlWidgetNode(`${node.name || "Form"} Form`, buildFormHtml(node, fields, helpers), helpers);
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

function mapIconNameToLibrary(iconName) {
  const normalized = String(iconName || "").trim().toLowerCase();
  if (!normalized) {
    return {
      value: "fas fa-star",
      library: "fa-solid"
    };
  }

  const aliases = {
    arrow: "arrow-right",
    checkmark: "check",
    mail: "envelope",
    location: "location-dot",
    pin: "location-dot",
    phone: "phone",
    time: "clock",
    user: "user",
    star: "star",
    plus: "plus",
    minus: "minus",
    chevron: "chevron-right",
    close: "xmark",
    menu: "bars"
  };
  const icon = aliases[normalized] || normalized;
  const style = ["brands", "facebook", "instagram", "linkedin", "x-twitter", "github", "youtube"].includes(icon)
    ? { prefix: "fab", library: "fa-brands" }
    : { prefix: "fas", library: "fa-solid" };

  return {
    value: `${style.prefix} fa-${icon}`,
    library: style.library
  };
}

function mapIconNode(node, helpers) {
  const iconFill = firstSolidFill(node);
  const bounds = getNodeBounds(node);
  const icon = mapIconNameToLibrary(getIconName(node) || getElementorLabel(node, "star"));

  return {
    id: helpers.nextId(node.name),
    elType: "widget",
    widgetType: "icon",
    isInner: false,
    settings: {
      _title: node.name || "Icon",
      selected_icon: icon,
      view: "default",
      align: "left",
      primary_color: normalizeColor(iconFill?.color) || "#303351",
      size: {
        unit: "px",
        size: Math.max(16, Math.round(Math.min(bounds.width || 24, bounds.height || 24))),
        sizes: []
      }
    },
    elements: []
  };
}

function extractContentText(node) {
  return collectDescendants(node, true)
    .filter((child) => isTextNode(child))
    .map((child) => child.characters.trim())
    .filter(Boolean)
    .join("\n\n");
}

function buildTextContentHtml(texts, fallbackTitle) {
  const chunks = Array.isArray(texts) ? texts.filter(Boolean) : [];
  const html = chunks.length
    ? chunks
        .join("\n\n")
        .split(/\n{2,}/)
        .map((chunk) => `<p>${escapeHtml(chunk).replace(/\n/g, "<br />")}</p>`)
        .join("")
    : "";

  return html || `<p>${escapeHtml(fallbackTitle)} content</p>`;
}

function stripHtmlPrefix(value) {
  return String(value || "").replace(/^el-[a-z0-9-]+:/i, "").trim();
}

function extractLinkTarget(node, fallbackLabel = "") {
  const reaction = Array.isArray(node?.reactions) ? node.reactions.find((entry) => entry && (entry.destinationId || entry.navigation)) : null;
  if (reaction?.navigation && /^https?:\/\//i.test(reaction.navigation)) {
    return reaction.navigation;
  }

  const hintLabel = stripHtmlPrefix(getElementorLabel(node, ""));
  if (/^(\/|#|https?:\/\/)/i.test(hintLabel)) {
    return hintLabel;
  }

  const slug = slugify(fallbackLabel || hintLabel || node?.name || "link");
  return slug ? `#${slug}` : "#";
}

function buildVideoEmbedHtml(url) {
  const value = String(url || "").trim();
  if (!value) {
    return "<p>Missing video URL.</p>";
  }

  const youtubeWatch = value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/i);
  if (youtubeWatch) {
    const videoId = youtubeWatch[1];
    return `<div class="f2e-embed f2e-embed--video"><iframe src="https://www.youtube.com/embed/${escapeAttribute(videoId)}" title="Embedded video" loading="lazy" allowfullscreen></iframe></div>`;
  }

  const vimeoMatch = value.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch) {
    return `<div class="f2e-embed f2e-embed--video"><iframe src="https://player.vimeo.com/video/${escapeAttribute(vimeoMatch[1])}" title="Embedded video" loading="lazy" allowfullscreen></iframe></div>`;
  }

  return `<div class="f2e-embed f2e-embed--video"><video controls preload="metadata" src="${escapeAttribute(value)}"></video></div>`;
}

function mapVideoNode(node, helpers) {
  const label = getElementorLabel(node, node.name || "Video");
  const videoUrl = stripHtmlPrefix(label);
  const html = `
<div class="f2e-embed-shell">
  ${buildVideoEmbedHtml(videoUrl)}
</div>
<style>
  .f2e-embed-shell{width:100%}
  .f2e-embed--video{position:relative;width:100%;aspect-ratio:16/9;border-radius:${Number(node.cornerRadius || 18)}px;overflow:hidden;box-shadow:0 18px 42px rgba(15,23,42,.16)}
  .f2e-embed--video iframe,.f2e-embed--video video{display:block;width:100%;height:100%;border:0;background:#000}
</style>`;

  return createHtmlWidgetNode(node.name || "Video", html, helpers);
}

function mapGoogleMapsNode(node, helpers) {
  const label = getElementorLabel(node, node.name || "Map");
  const address = stripHtmlPrefix(label);
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const html = `
<div class="f2e-embed-shell">
  <div class="f2e-embed f2e-embed--map">
    <iframe src="${escapeAttribute(embedUrl)}" title="${escapeAttribute(address || "Map")}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
  </div>
</div>
<style>
  .f2e-embed-shell{width:100%}
  .f2e-embed--map{width:100%;min-height:${Math.max(280, Math.round(getNodeBounds(node).height || 360))}px;border-radius:${Number(node.cornerRadius || 18)}px;overflow:hidden;border:1px solid rgba(148,163,184,.16);box-shadow:0 18px 42px rgba(15,23,42,.12)}
  .f2e-embed--map iframe{display:block;width:100%;height:100%;min-height:inherit;border:0}
</style>`;

  return createHtmlWidgetNode(node.name || "Map", html, helpers);
}

function getMenuItemNodes(node) {
  return (node.children || []).filter(
    (child) =>
      child.visible !== false &&
      (getWidgetHint(child) === "menu-item" || (hasRole(child, "item") && !getFieldType(child)) || child.type === "TEXT")
  );
}

function mapNavNode(node, helpers) {
  const visibleChildren = (node.children || []).filter((child) => child.visible !== false);
  const logoNode =
    visibleChildren.find((child) => hasRole(child, "logo")) ||
    visibleChildren.find((child) => isImageLikeNode(child)) ||
    visibleChildren.find((child) => isTextNode(child) && inferTextWidget(child) === "heading") ||
    null;

  const explicitMenu = visibleChildren.find((child) => getWidgetHint(child) === "menu" || hasRole(child, "menu")) || null;
  const menuNodes = explicitMenu ? getMenuItemNodes(explicitMenu) : getMenuItemNodes(node).filter((child) => child !== logoNode);
  const buttonNode = visibleChildren.find((child) => child !== explicitMenu && hasRole(child, "button")) || null;
  const ctaButton = buttonNode ? extractButtonData(buttonNode) : extractButtonData(node);

  const menuItems = menuNodes
    .map((child) => {
      const label =
        child.type === "TEXT"
          ? child.characters.trim()
          : stripHtmlPrefix(
              getElementorLabel(
                child,
                extractFieldTextNodes(child)
                  .map((textNode) => textNode.characters.trim())
                  .filter(Boolean)[0] || child.name || "Link"
              )
            );
      if (!label) {
        return null;
      }

      const active = getNodeState(child) === "active" || getNodeState(child) === "selected";
      return {
        label,
        href: extractLinkTarget(child, label),
        active
      };
    })
    .filter(Boolean);

  const logoText =
    logoNode && isTextNode(logoNode)
      ? logoNode.characters.trim()
      : logoNode
        ? stripHtmlPrefix(getElementorLabel(logoNode, logoNode.name || "Logo"))
        : stripHtmlPrefix(getElementorLabel(node, "Brand"));
  const logoImage = logoNode?.imageUrl || "";
  const navId = `f2e-nav-${helpers.nextId(node.name || "nav")}`;

  const html = `
<header id="${navId}" class="f2e-nav-shell">
  <div class="f2e-nav">
    <a class="f2e-nav__brand" href="/">
      ${logoImage ? `<img src="${escapeAttribute(logoImage)}" alt="${escapeAttribute(logoText)}" />` : `<span>${escapeHtml(logoText)}</span>`}
    </a>
    <button class="f2e-nav__toggle" type="button" aria-expanded="false" aria-controls="${navId}-menu">
      <span></span><span></span><span></span>
    </button>
    <nav class="f2e-nav__menu" id="${navId}-menu" aria-label="${escapeAttribute(node.name || "Main navigation")}">
      ${menuItems
        .map(
          (item) =>
            `<a class="f2e-nav__link${item.active ? " is-active" : ""}" href="${escapeAttribute(item.href)}">${escapeHtml(item.label)}</a>`
        )
        .join("")}
      ${
        ctaButton
          ? `<a class="f2e-nav__cta" href="${escapeAttribute(extractLinkTarget(buttonNode || node, ctaButton.text))}" style="--f2e-btn-bg:${escapeAttribute(ctaButton.backgroundColor)};--f2e-btn-bg-hover:${escapeAttribute(ctaButton.hoverBackgroundColor)};--f2e-btn-color:${escapeAttribute(ctaButton.textColor)};--f2e-btn-radius:${Number(ctaButton.radius || 10)}px;">${escapeHtml(ctaButton.text)}</a>`
          : ""
      }
    </nav>
  </div>
</header>
<style>
  #${navId}.f2e-nav-shell{width:100%}
  #${navId} .f2e-nav{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 0}
  #${navId} .f2e-nav__brand{display:inline-flex;align-items:center;gap:12px;color:#f8fafc;text-decoration:none;font-size:22px;font-weight:800;line-height:1.1}
  #${navId} .f2e-nav__brand img{display:block;max-height:42px;max-width:180px;object-fit:contain}
  #${navId} .f2e-nav__menu{display:flex;align-items:center;justify-content:flex-end;flex:1 1 auto;gap:22px}
  #${navId} .f2e-nav__link{position:relative;color:#cbd5e1;text-decoration:none;font-size:15px;font-weight:600;line-height:1.2;transition:color .2s ease}
  #${navId} .f2e-nav__link::after{content:'';position:absolute;left:0;right:0;bottom:-8px;height:2px;background:#f24e1e;transform:scaleX(0);transform-origin:left;transition:transform .2s ease}
  #${navId} .f2e-nav__link:hover,#${navId} .f2e-nav__link.is-active{color:#fff}
  #${navId} .f2e-nav__link:hover::after,#${navId} .f2e-nav__link.is-active::after{transform:scaleX(1)}
  #${navId} .f2e-nav__cta{display:inline-flex;align-items:center;justify-content:center;border-radius:var(--f2e-btn-radius);background:var(--f2e-btn-bg);color:var(--f2e-btn-color);padding:12px 18px;text-decoration:none;font-size:15px;font-weight:700;line-height:1.1;transition:background-color .2s ease,transform .2s ease}
  #${navId} .f2e-nav__cta:hover{background:var(--f2e-btn-bg-hover);transform:translateY(-2px)}
  #${navId} .f2e-nav__toggle{display:none;flex-direction:column;gap:4px;width:44px;height:44px;align-items:center;justify-content:center;border:1px solid rgba(148,163,184,.18);border-radius:14px;background:rgba(15,23,42,.28);color:#fff}
  #${navId} .f2e-nav__toggle span{display:block;width:18px;height:2px;background:currentColor;border-radius:999px}
  @media (max-width: 920px){
    #${navId} .f2e-nav{flex-wrap:wrap}
    #${navId} .f2e-nav__toggle{display:flex}
    #${navId} .f2e-nav__menu{display:none;flex-direction:column;align-items:flex-start;width:100%;padding-top:8px}
    #${navId}.is-open .f2e-nav__menu{display:flex}
  }
</style>
<script>
  (() => {
    const root = document.getElementById(${JSON.stringify(navId)});
    if (!root) return;
    const toggle = root.querySelector('.f2e-nav__toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const next = !root.classList.contains('is-open');
      root.classList.toggle('is-open', next);
      toggle.setAttribute('aria-expanded', next ? 'true' : 'false');
    });
  })();
</script>`;

  return createHtmlWidgetNode(node.name || "Navigation", html, helpers);
}

function getDirectItemChildren(node) {
  return (node.children || []).filter((child) => child.visible !== false && (hasRole(child, "item") || getWidgetHint(child) === "accordion-item"));
}

function getVisibleSceneChildren(node) {
  return (node.children || []).filter((child) => child.visible !== false && ["FRAME", "GROUP", "COMPONENT", "INSTANCE", "RECTANGLE", "ELLIPSE"].includes(child.type));
}

function findCardSurfaceNode(node) {
  const fillNode = [node, ...collectDescendants(node)]
    .filter((child) => child.visible !== false)
    .filter((child) => ["FRAME", "RECTANGLE", "GROUP", "COMPONENT", "INSTANCE"].includes(child.type))
    .filter((child) => !child.imageUrl && firstSolidFill(child)?.color)
    .sort((left, right) => getArea(right) - getArea(left))[0];

  return fillNode || node;
}

function extractCardTextParts(node) {
  const texts = extractFieldTextNodes(node).map((textNode) => textNode.characters.trim()).filter(Boolean);
  const title = texts[0] || stripHtmlPrefix(node.name || "Card");
  const body = texts[1] || "";
  const meta = texts.slice(2).join(" · ");
  return {
    texts,
    title,
    body,
    meta
  };
}

function mapFeatureGridNode(node, helpers) {
  const cardNodes = getVisibleSceneChildren(node).filter((child) => hasRole(child, "card", "slide") || hasChildren(child));
  const cards = cardNodes
    .map((child) => {
      const descendants = collectDescendants(child);
      const imageNode = descendants.filter((descendant) => isImageLikeNode(descendant)).sort((left, right) => getArea(right) - getArea(left))[0] || null;
      const iconNode = descendants.find((descendant) => getWidgetHint(descendant) === "icon" || hasRole(descendant, "icon")) || null;
      const button = extractButtonData(child);
      const textParts = extractCardTextParts(child);
      const surfaceNode = findCardSurfaceNode(child);
      const fill = firstSolidFill(surfaceNode);
      return {
        title: stripHtmlPrefix(textParts.title),
        body: textParts.body,
        imageUrl: imageNode?.imageUrl || "",
        icon: iconNode ? mapIconNameToLibrary(getIconName(iconNode) || getElementorLabel(iconNode, "star")).value : "",
        backgroundColor: normalizeColor(fill?.color) || "#132033",
        radius: Number(surfaceNode.cornerRadius || child.cornerRadius || 24),
        button
      };
    })
    .filter((card) => card.title);

  if (!cards.length) {
    return null;
  }

  const heading = extractFieldTextNodes(node).map((textNode) => textNode.characters.trim()).filter(Boolean)[0] || "";
  const html = `
<section class="f2e-feature-grid">
  ${heading ? `<div class="f2e-feature-grid__heading">${escapeHtml(stripHtmlPrefix(heading))}</div>` : ""}
  <div class="f2e-feature-grid__list">
    ${cards
      .map(
        (card) => `
          <article class="f2e-feature-card" style="--f2e-card-bg:${escapeAttribute(card.backgroundColor)};--f2e-card-radius:${card.radius}px;">
            ${
              card.imageUrl
                ? `<img class="f2e-feature-card__media" src="${escapeAttribute(card.imageUrl)}" alt="${escapeAttribute(card.title)}" />`
                : card.icon
                  ? `<div class="f2e-feature-card__icon"><i class="${escapeAttribute(card.icon)}" aria-hidden="true"></i></div>`
                  : ""
            }
            <div class="f2e-feature-card__body">
              <h3>${escapeHtml(card.title)}</h3>
              ${card.body ? `<p>${escapeHtml(card.body)}</p>` : ""}
              ${
                card.button
                  ? `<button class="f2e-feature-card__button" type="button" style="--f2e-btn-bg:${escapeAttribute(card.button.backgroundColor)};--f2e-btn-bg-hover:${escapeAttribute(card.button.hoverBackgroundColor)};--f2e-btn-color:${escapeAttribute(card.button.textColor)};--f2e-btn-radius:${Number(card.button.radius || 10)}px;">${escapeHtml(card.button.text)}</button>`
                  : ""
              }
            </div>
          </article>`
      )
      .join("")}
  </div>
</section>
<style>
  .f2e-feature-grid{display:flex;flex-direction:column;gap:22px;width:100%}
  .f2e-feature-grid__heading{font-size:clamp(28px,2vw,40px);font-weight:800;line-height:1.1;color:#f8fafc}
  .f2e-feature-grid__list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px}
  .f2e-feature-card{display:flex;flex-direction:column;min-height:100%;overflow:hidden;border-radius:var(--f2e-card-radius);background:var(--f2e-card-bg);border:1px solid rgba(148,163,184,.14);box-shadow:0 18px 44px rgba(15,23,42,.14);transition:transform .24s ease,box-shadow .24s ease}
  .f2e-feature-card:hover{transform:translateY(-6px);box-shadow:0 24px 56px rgba(15,23,42,.18)}
  .f2e-feature-card__media{display:block;width:100%;aspect-ratio:16/10;object-fit:cover}
  .f2e-feature-card__icon{display:flex;align-items:center;justify-content:center;width:64px;height:64px;margin:24px 24px 0;border-radius:18px;background:rgba(242,78,30,.14);color:#f24e1e;font-size:24px}
  .f2e-feature-card__body{display:flex;flex:1 1 auto;flex-direction:column;gap:12px;padding:24px}
  .f2e-feature-card__body h3{margin:0;font-size:22px;font-weight:700;line-height:1.2;color:#fff}
  .f2e-feature-card__body p{margin:0;color:#cbd5e1;font-size:15px;line-height:1.7}
  .f2e-feature-card__button{margin-top:auto;align-self:flex-start;border:0;border-radius:var(--f2e-btn-radius);background:var(--f2e-btn-bg);color:var(--f2e-btn-color);padding:13px 18px;font-size:15px;font-weight:700;line-height:1.1;cursor:pointer;transition:background-color .2s ease,transform .2s ease}
  .f2e-feature-card__button:hover{background:var(--f2e-btn-bg-hover);transform:translateY(-2px)}
</style>`;

  return createHtmlWidgetNode(node.name || "Feature Grid", html, helpers);
}

function mapStatsNode(node, helpers) {
  const itemNodes = getVisibleSceneChildren(node).filter((child) => hasRole(child, "stat") || getWidgetHint(child) === "stat-item" || hasChildren(child));
  const items = itemNodes
    .map((child) => {
      const texts = extractFieldTextNodes(child).map((textNode) => textNode.characters.trim()).filter(Boolean);
      const value = texts.find((text) => /\d/.test(text)) || texts[0] || "";
      const label = texts.find((text) => text !== value) || "";
      const detail = texts.find((text, index) => index > 1 && text !== label && text !== value) || "";
      const surfaceNode = findCardSurfaceNode(child);
      const fill = firstSolidFill(surfaceNode);
      return {
        value,
        label,
        detail,
        backgroundColor: normalizeColor(fill?.color) || "#111827",
        radius: Number(surfaceNode.cornerRadius || child.cornerRadius || 22)
      };
    })
    .filter((item) => item.value || item.label);

  if (!items.length) {
    return null;
  }

  const html = `
<section class="f2e-stats-grid">
  ${items
    .map(
      (item) => `
        <article class="f2e-stat-card" style="--f2e-stat-bg:${escapeAttribute(item.backgroundColor)};--f2e-stat-radius:${item.radius}px;">
          ${item.value ? `<div class="f2e-stat-card__value">${escapeHtml(item.value)}</div>` : ""}
          ${item.label ? `<div class="f2e-stat-card__label">${escapeHtml(item.label)}</div>` : ""}
          ${item.detail ? `<div class="f2e-stat-card__detail">${escapeHtml(item.detail)}</div>` : ""}
        </article>`
    )
    .join("")}
</section>
<style>
  .f2e-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px;width:100%}
  .f2e-stat-card{display:flex;flex-direction:column;gap:8px;padding:24px;border-radius:var(--f2e-stat-radius);background:var(--f2e-stat-bg);border:1px solid rgba(148,163,184,.14);box-shadow:0 14px 36px rgba(15,23,42,.12)}
  .f2e-stat-card__value{font-size:clamp(34px,3vw,48px);font-weight:800;line-height:1;color:#fff}
  .f2e-stat-card__label{font-size:15px;font-weight:700;line-height:1.4;color:#e2e8f0}
  .f2e-stat-card__detail{font-size:14px;line-height:1.6;color:#94a3b8}
</style>`;

  return createHtmlWidgetNode(node.name || "Stats", html, helpers);
}

function mapLogoGridNode(node, helpers) {
  const imageNodes = getVisibleSceneChildren(node)
    .flatMap((child) => (isImageLikeNode(child) ? [child] : collectDescendants(child).filter((descendant) => isImageLikeNode(descendant))))
    .filter((child, index, array) => child?.imageUrl && array.findIndex((candidate) => candidate.imageUrl === child.imageUrl) === index);

  if (!imageNodes.length) {
    return null;
  }

  const html = `
<section class="f2e-logo-grid">
  ${imageNodes
    .map(
      (imageNode, index) => `
        <div class="f2e-logo-grid__item">
          <img src="${escapeAttribute(imageNode.imageUrl)}" alt="${escapeAttribute(stripHtmlPrefix(imageNode.name || `Logo ${index + 1}`))}" />
        </div>`
    )
    .join("")}
</section>
<style>
  .f2e-logo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:18px;align-items:stretch;width:100%}
  .f2e-logo-grid__item{display:flex;align-items:center;justify-content:center;min-height:92px;padding:18px;border-radius:20px;background:rgba(15,23,42,.22);border:1px solid rgba(148,163,184,.14)}
  .f2e-logo-grid__item img{display:block;max-width:100%;max-height:42px;object-fit:contain;filter:grayscale(100%);opacity:.92}
</style>`;

  return createHtmlWidgetNode(node.name || "Logo Grid", html, helpers);
}

function mapIconListNode(node, helpers) {
  const itemNodes = getDirectItemChildren(node);
  const items = itemNodes
    .map((child) => {
      const iconChild = collectDescendants(child).find((descendant) => hasRole(descendant, "icon")) || null;
      const textNodes = extractFieldTextNodes(child).map((textNode) => textNode.characters.trim()).filter(Boolean);
      const label = getElementorLabel(child, textNodes[0] || child.name || "Item");
      const icon = mapIconNameToLibrary(getIconName(iconChild) || getIconName(child) || "check");
      return {
        label,
        iconClass: icon.value
      };
    })
    .filter((item) => item.label);

  if (!items.length) {
    return null;
  }

  const html = `
<ul class="f2e-icon-list">
  ${items
    .map(
      (item) =>
        `<li class="f2e-icon-list__item"><i class="${escapeAttribute(item.iconClass)}" aria-hidden="true"></i><span>${escapeHtml(stripHtmlPrefix(item.label))}</span></li>`
    )
    .join("")}
</ul>
<style>
  .f2e-icon-list{display:flex;flex-direction:column;gap:14px;margin:0;padding:0;list-style:none}
  .f2e-icon-list__item{display:flex;align-items:flex-start;gap:12px;color:#e2e8f0;font-size:16px;line-height:1.5}
  .f2e-icon-list__item i{margin-top:2px;color:#f24e1e}
</style>`;

  return createHtmlWidgetNode(node.name || "Icon List", html, helpers);
}

function mapTestimonialNode(node, helpers) {
  const descendants = collectDescendants(node);
  const imageNode = descendants.filter((child) => isImageLikeNode(child)).sort((left, right) => getArea(right) - getArea(left))[0] || null;
  const texts = extractFieldTextNodes(node).map((textNode) => textNode.characters.trim()).filter(Boolean);
  const title = stripHtmlPrefix(getElementorLabel(node, texts[0] || "Customer"));
  const quote = texts.length > 1 ? texts[0] : `${title} testimonial quote`;
  const meta = texts.length > 1 ? texts.slice(1).join(" · ") : title;
  const html = `
<article class="f2e-testimonial">
  ${imageNode?.imageUrl ? `<img class="f2e-testimonial__avatar" src="${escapeAttribute(imageNode.imageUrl)}" alt="${escapeAttribute(title)}" />` : ""}
  <div class="f2e-testimonial__body">
    <blockquote>${escapeHtml(quote)}</blockquote>
    <div class="f2e-testimonial__meta">${escapeHtml(meta)}</div>
  </div>
</article>
<style>
  .f2e-testimonial{display:flex;align-items:flex-start;gap:18px;padding:24px;border:1px solid rgba(148,163,184,.16);border-radius:${Number(node.cornerRadius || 24)}px;background:rgba(15,23,42,.28);box-shadow:0 18px 40px rgba(15,23,42,.12)}
  .f2e-testimonial__avatar{width:72px;height:72px;object-fit:cover;border-radius:999px;flex:0 0 auto}
  .f2e-testimonial__body{display:flex;flex-direction:column;gap:12px}
  .f2e-testimonial__body blockquote{margin:0;color:#fff;font-size:18px;line-height:1.6}
  .f2e-testimonial__meta{color:#94a3b8;font-size:14px;line-height:1.4}
</style>`;

  return createHtmlWidgetNode(node.name || "Testimonial", html, helpers);
}

function mapPricingTableNode(node, helpers) {
  const texts = extractFieldTextNodes(node).map((textNode) => textNode.characters.trim()).filter(Boolean);
  const button = extractButtonData(node);
  const title = stripHtmlPrefix(getElementorLabel(node, texts[0] || node.name || "Plan"));
  const price = texts.find((text) => /\$\s*\d|free|custom/i.test(text)) || "$0";
  const subtitle = texts.find((text, index) => index > 0 && text !== price) || "";
  const features = texts.filter((text) => text !== title && text !== price && text !== subtitle).slice(0, 6);
  const html = `
<article class="f2e-pricing">
  <div class="f2e-pricing__title">${escapeHtml(title)}</div>
  <div class="f2e-pricing__price">${escapeHtml(price)}</div>
  ${subtitle ? `<div class="f2e-pricing__subtitle">${escapeHtml(subtitle)}</div>` : ""}
  <ul class="f2e-pricing__features">
    ${features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
  </ul>
  ${
    button
      ? `<button class="f2e-pricing__button" type="button" style="--f2e-btn-bg:${escapeAttribute(button.backgroundColor)};--f2e-btn-bg-hover:${escapeAttribute(button.hoverBackgroundColor)};--f2e-btn-color:${escapeAttribute(button.textColor)};--f2e-btn-radius:${Number(button.radius || 10)}px;">${escapeHtml(button.text)}</button>`
      : ""
  }
</article>
<style>
  .f2e-pricing{display:flex;flex-direction:column;gap:16px;padding:28px;border:1px solid rgba(148,163,184,.16);border-radius:${Number(node.cornerRadius || 28)}px;background:rgba(15,23,42,.32);box-shadow:0 18px 40px rgba(15,23,42,.12)}
  .f2e-pricing__title{font-size:20px;font-weight:700;line-height:1.2;color:#fff}
  .f2e-pricing__price{font-size:40px;font-weight:800;line-height:1;color:#f8fafc}
  .f2e-pricing__subtitle{color:#94a3b8;font-size:14px;line-height:1.5}
  .f2e-pricing__features{display:flex;flex-direction:column;gap:10px;margin:0;padding:0;list-style:none;color:#cbd5e1;font-size:15px;line-height:1.5}
  .f2e-pricing__features li::before{content:'•';margin-right:10px;color:#f24e1e}
  .f2e-pricing__button{margin-top:6px;border:0;border-radius:var(--f2e-btn-radius);background:var(--f2e-btn-bg);color:var(--f2e-btn-color);padding:13px 18px;font-size:15px;font-weight:700;line-height:1.1;cursor:pointer;transition:background-color .2s ease,transform .2s ease}
  .f2e-pricing__button:hover{background:var(--f2e-btn-bg-hover);transform:translateY(-2px)}
</style>`;

  return createHtmlWidgetNode(node.name || "Pricing Table", html, helpers);
}

function mapExplicitFrameWidget(node, helpers) {
  const explicitWidget = getWidgetHint(node);
  const registry = {
    nav: mapNavNode,
    video: mapVideoNode,
    "google-maps": mapGoogleMapsNode,
    "icon-list": mapIconListNode,
    "feature-grid": mapFeatureGridNode,
    stats: mapStatsNode,
    "logo-grid": mapLogoGridNode,
    testimonial: mapTestimonialNode,
    "pricing-table": mapPricingTableNode,
    form: mapFormNode,
    tabs: mapTabsNode,
    accordion: mapAccordionNode
  };

  const mapper = explicitWidget ? registry[explicitWidget] : null;
  if (!mapper) {
    return null;
  }

  return mapper(node, helpers);
}

function buildTabsHtml(node, items, helpers) {
  const tabsId = `f2e-tabs-${helpers.nextId(node.name || "tabs")}`;
  const tabsMarkup = items
    .map(
      (item, index) =>
        `<button class="f2e-tabs__tab${index === 0 ? " is-active" : ""}" type="button" data-tab-index="${index}">${escapeHtml(item.title)}</button>`
    )
    .join("");
  const panelsMarkup = items
    .map(
      (item, index) =>
        `<div class="f2e-tabs__panel${index === 0 ? " is-active" : ""}" data-panel-index="${index}">${item.contentHtml}</div>`
    )
    .join("");

  return `
<div id="${tabsId}" class="f2e-tabs">
  <div class="f2e-tabs__nav" role="tablist">${tabsMarkup}</div>
  <div class="f2e-tabs__panels">${panelsMarkup}</div>
</div>
<style>
  #${tabsId}{width:100%}
  #${tabsId} .f2e-tabs__nav{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px}
  #${tabsId} .f2e-tabs__tab{border:1px solid rgba(148,163,184,.22);background:rgba(255,255,255,.04);color:#e2e8f0;border-radius:999px;padding:12px 18px;font-size:14px;font-weight:600;line-height:1.1;cursor:pointer;transition:background-color .2s ease,border-color .2s ease,color .2s ease}
  #${tabsId} .f2e-tabs__tab.is-active{background:#f24e1e;border-color:#f24e1e;color:#fff}
  #${tabsId} .f2e-tabs__panel{display:none;border:1px solid rgba(148,163,184,.16);border-radius:24px;background:rgba(15,23,42,.32);padding:24px}
  #${tabsId} .f2e-tabs__panel.is-active{display:block}
  #${tabsId} .f2e-tabs__panel h3:first-child,#${tabsId} .f2e-tabs__panel p:first-child{margin-top:0}
</style>
<script>
  (function() {
    var root = document.getElementById(${JSON.stringify(tabsId)});
    if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.f2e-tabs__tab'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.f2e-tabs__panel'));
    function setActive(index) {
      tabs.forEach(function(tab, tabIndex) { tab.classList.toggle('is-active', tabIndex === index); });
      panels.forEach(function(panel, panelIndex) { panel.classList.toggle('is-active', panelIndex === index); });
    }
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        setActive(Number(tab.getAttribute('data-tab-index') || 0));
      });
    });
    setActive(0);
  })();
</script>`;
}

function mapTabsNode(node, helpers) {
  const items = (node.children || [])
    .filter((child) => child.visible !== false && (getWidgetHint(child) === "tab-item" || hasRole(child, "tab")))
    .map((child) => {
      const title = getElementorLabel(child, child.name || "Tab");
      const textNodes = extractFieldTextNodes(child).map((textNode) => textNode.characters.trim()).filter(Boolean);
      const bodyTexts = textNodes.filter((text, index) => !(index === 0 && text === title));
      const contentHtml = buildTextContentHtml(bodyTexts, title);

      return {
        title,
        contentHtml
      };
    })
    .filter((item) => item.title);

  if (items.length < 2) {
    return null;
  }

  return createHtmlWidgetNode(`${node.name || "Tabs"} Tabs`, buildTabsHtml(node, items, helpers), helpers);
}

function buildAccordionHtml(node, items, helpers) {
  const accordionId = `f2e-accordion-${helpers.nextId(node.name || "accordion")}`;
  const itemsMarkup = items
    .map(
      (item, index) => `
      <div class="f2e-accordion__item${index === 0 ? " is-open" : ""}">
        <button class="f2e-accordion__trigger" type="button" data-item-index="${index}">
          <span>${escapeHtml(item.title)}</span>
          <span class="f2e-accordion__symbol">+</span>
        </button>
        <div class="f2e-accordion__panel"${index === 0 ? ' style="display:block"' : ""}>${item.contentHtml}</div>
      </div>`
    )
    .join("");

  return `
<div id="${accordionId}" class="f2e-accordion">${itemsMarkup}</div>
<style>
  #${accordionId}{display:flex;flex-direction:column;gap:12px;width:100%}
  #${accordionId} .f2e-accordion__item{border:1px solid rgba(148,163,184,.16);border-radius:22px;background:rgba(15,23,42,.28);overflow:hidden}
  #${accordionId} .f2e-accordion__trigger{display:flex;align-items:center;justify-content:space-between;width:100%;border:0;background:transparent;color:#fff;padding:18px 22px;font-size:16px;font-weight:700;line-height:1.2;cursor:pointer;text-align:left}
  #${accordionId} .f2e-accordion__symbol{font-size:20px;line-height:1;transition:transform .2s ease}
  #${accordionId} .f2e-accordion__item.is-open .f2e-accordion__symbol{transform:rotate(45deg)}
  #${accordionId} .f2e-accordion__panel{display:none;padding:0 22px 20px;color:#cbd5e1}
  #${accordionId} .f2e-accordion__panel p:first-child{margin-top:0}
</style>
<script>
  (function() {
    var root = document.getElementById(${JSON.stringify(accordionId)});
    if (!root) return;
    var items = Array.prototype.slice.call(root.querySelectorAll('.f2e-accordion__item'));
    items.forEach(function(item) {
      var trigger = item.querySelector('.f2e-accordion__trigger');
      var panel = item.querySelector('.f2e-accordion__panel');
      if (!trigger || !panel) return;
      trigger.addEventListener('click', function() {
        var isOpen = item.classList.contains('is-open');
        items.forEach(function(other) {
          other.classList.remove('is-open');
          var otherPanel = other.querySelector('.f2e-accordion__panel');
          if (otherPanel) otherPanel.style.display = 'none';
        });
        if (!isOpen) {
          item.classList.add('is-open');
          panel.style.display = 'block';
        }
      });
    });
  })();
</script>`;
}

function mapAccordionNode(node, helpers) {
  const items = (node.children || [])
    .filter((child) => child.visible !== false && (getWidgetHint(child) === "accordion-item" || hasRole(child, "item")))
    .map((child) => {
      const title = getElementorLabel(child, child.name || "Item");
      const textNodes = extractFieldTextNodes(child).map((textNode) => textNode.characters.trim()).filter(Boolean);
      const bodyTexts = textNodes.filter((text, index) => !(index === 0 && text === title));
      const contentHtml = buildTextContentHtml(bodyTexts, title);

      return {
        title,
        contentHtml
      };
    })
    .filter((item) => item.title);

  if (!items.length) {
    return null;
  }

  return createHtmlWidgetNode(`${node.name || "Accordion"} Accordion`, buildAccordionHtml(node, items, helpers), helpers);
}

function buildSliderHtml(node, slides, options, helpers) {
  if (slides.every((slide) => slide.type === "logo")) {
    return buildLogoCarouselHtml(node, slides, options, helpers);
  }

  const sliderId = `f2e-slider-${helpers.nextId(node.name || "slider")}`;
  const visibleSlides = Math.max(1, Number(options.visibleSlides || 1));
  const gap = Math.max(16, Math.round(options.gap || 24));
  const autoplay = Boolean(options.autoplay);
  const autoplayDelay = typeof options.autoplayDelay === "number" && options.autoplayDelay > 0 ? Math.round(options.autoplayDelay) : 4200;
  const transitionDuration = typeof options.transitionDuration === "number" && options.transitionDuration > 0 ? Math.round(options.transitionDuration) : 450;
  const dotCount = Math.max(1, slides.length - visibleSlides + 1);
  const dots = Array.from({ length: dotCount }, (_, index) => index);
  const slideMarkup = slides
    .map((slide, index) => {
      if (slide.type === "logo") {
        return `
        <article class="f2e-slider__slide f2e-slider__slide--logo" data-slide-index="${index}">
          <div class="f2e-slider__logo-card" style="--f2e-logo-bg:${escapeAttribute(slide.cardColor)};--f2e-logo-border:${escapeAttribute(slide.borderColor)};--f2e-logo-radius:${Number(slide.cardRadius || 12)}px;--f2e-logo-height:${Math.round(slide.minHeight)}px;">
            <img src="${escapeAttribute(slide.imageUrl)}" alt="${escapeAttribute(slide.title || `Logo ${index + 1}`)}" />
          </div>
        </article>`;
      }

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
  #${sliderId} .f2e-slider__track{display:flex;gap:var(--f2e-gap);transition:transform ${transitionDuration}ms ease}
  #${sliderId} .f2e-slider__slide{flex:0 0 calc((100% - (var(--f2e-gap) * (var(--f2e-visible) - 1))) / var(--f2e-visible))}
  #${sliderId} .f2e-slider__logo-card{display:flex;align-items:center;justify-content:center;min-height:var(--f2e-logo-height);padding:18px;border-radius:var(--f2e-logo-radius);background:var(--f2e-logo-bg);border:1px solid var(--f2e-logo-border);box-shadow:0 10px 24px rgba(15,23,42,.04)}
  #${sliderId} .f2e-slider__logo-card img{display:block;width:100%;height:auto;max-height:72px;object-fit:contain}
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
      }, ${autoplayDelay});
    }
    window.addEventListener('resize', function() {
      setActive(Number((root.querySelector('.f2e-slider__dot.is-active') || dots[0] || { getAttribute: function() { return 0; } }).getAttribute('data-dot-index') || 0));
    });
    setActive(0);
  })();
</script>`;
}

function buildLogoCarouselHtml(node, slides, options, helpers) {
  const carouselId = `f2e-logo-carousel-${helpers.nextId(node.name || "logo-carousel")}`;
  const gap = Math.max(16, Math.round(options.gap || 24));
  const autoplay = Boolean(options.autoplay);
  const repeatedSlides = autoplay ? slides.concat(slides) : slides;
  const slideMarkup = repeatedSlides
    .map(
      (slide, index) => `
        <div class="f2e-logo-carousel__item" data-logo-index="${index}" style="--f2e-logo-bg:${escapeAttribute(slide.cardColor)};--f2e-logo-border:${escapeAttribute(slide.borderColor)};--f2e-logo-radius:${Number(slide.cardRadius || 12)}px;--f2e-logo-height:${Math.round(slide.minHeight)}px;--f2e-logo-width:${Math.round(slide.width || 160)}px;">
          <img src="${escapeAttribute(slide.imageUrl)}" alt="${escapeAttribute(slide.title || `Logo ${index + 1}`)}" />
        </div>`
    )
    .join("");

  return `
<div id="${carouselId}" class="f2e-logo-carousel${autoplay ? " is-autoplay" : ""}">
  <div class="f2e-logo-carousel__viewport">
    <div class="f2e-logo-carousel__track">
      ${slideMarkup}
    </div>
  </div>
</div>
<style>
  #${carouselId}{--f2e-gap:${gap}px;width:100%}
  #${carouselId} .f2e-logo-carousel__viewport{overflow:hidden;width:100%}
  #${carouselId} .f2e-logo-carousel__track{display:flex;align-items:center;gap:var(--f2e-gap);width:max-content}
  #${carouselId} .f2e-logo-carousel__item{display:flex;align-items:center;justify-content:center;flex:0 0 var(--f2e-logo-width);min-width:var(--f2e-logo-width);min-height:var(--f2e-logo-height);padding:18px;border-radius:var(--f2e-logo-radius);background:var(--f2e-logo-bg);border:1px solid var(--f2e-logo-border);box-shadow:0 10px 24px rgba(15,23,42,.04)}
  #${carouselId} .f2e-logo-carousel__item img{display:block;width:100%;height:auto;max-height:72px;object-fit:contain}
  #${carouselId}.is-autoplay .f2e-logo-carousel__track{animation:f2e-logo-scroll-${carouselId} 24s linear infinite}
  #${carouselId}.is-autoplay:hover .f2e-logo-carousel__track{animation-play-state:paused}
  @keyframes f2e-logo-scroll-${carouselId}{
    from{transform:translateX(0)}
    to{transform:translateX(calc(-50% - (var(--f2e-gap) / 2)))}
  }
  @media (max-width: 1024px){
    #${carouselId} .f2e-logo-carousel__item{flex-basis:min(42vw,var(--f2e-logo-width));min-width:min(42vw,var(--f2e-logo-width))}
  }
</style>`;
}

function buildNativeImageCarouselNode(node, slides, options, helpers) {
  return {
    id: helpers.nextId(`${node.name || "slider"}-image-carousel`),
    elType: "widget",
    widgetType: "image-carousel",
    isInner: false,
    settings: {
      _title: `${node.name || "Slider"} Carousel`,
      carousel_name: stripHtmlPrefix(node.name || "Image Carousel"),
      carousel: slides.map((slide) => ({
        id: "",
        url: slide.imageUrl
      })),
      thumbnail_size: "full",
      slides_to_show: String(Math.max(1, Math.min(10, slides.length, Math.round(options.visibleSlides || 1)))),
      slides_to_scroll: "1",
      image_stretch: "no",
      navigation: "none",
      link_to: "none",
      caption_type: "",
      lazyload: "yes",
      autoplay: options.autoplay ? "yes" : "",
      pause_on_hover: options.autoplay ? "yes" : "",
      pause_on_interaction: options.autoplay ? "yes" : "",
      autoplay_speed:
        typeof options.autoplayDelay === "number" && options.autoplayDelay > 0 ? Math.round(options.autoplayDelay) : 4200,
      infinite: "yes",
      effect: "slide",
      speed: typeof options.transitionDuration === "number" && options.transitionDuration > 0 ? Math.round(options.transitionDuration) : 450,
      direction: "ltr"
    },
    elements: []
  };
}

function buildNativeSlidesNode(node, slides, options, helpers) {
  return {
    id: helpers.nextId(`${node.name || "slider"}-slides`),
    elType: "widget",
    widgetType: "slides",
    isInner: false,
    settings: {
      _title: `${node.name || "Slider"} Slides`,
      slides_name: "Slides",
      slides: slides.map((slide, index) => ({
        _id: helpers.nextId(`${node.name || "slide"}-${index}`),
        heading: slide.title || `Slide ${index + 1}`,
        description: slide.body || "",
        button_text: slide.button?.text || "",
        background_image: {
          url: slide.imageUrl || ""
        }
      })),
      navigation: slides.length > 1 ? "dots" : "none",
      autoplay: options.autoplay ? "yes" : "",
      autoplay_speed:
        typeof options.autoplayDelay === "number" && options.autoplayDelay > 0 ? Math.round(options.autoplayDelay) : 4200,
      content_animation: "fadeInRight"
    },
    elements: []
  };
}

function hasExplicitSliderDescendant(node) {
  if (!node || !Array.isArray(node.children)) {
    return false;
  }

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];
    if (child && (hasRole(child, "slider", "carousel") || getWidgetHint(child) === "slider")) {
      return true;
    }
  }

  return false;
}

function mapSliderSection(node, helpers, depth, sliderPattern) {
  const coreSafeMode = isCoreSafeMode(helpers);
  const slideData = normalizeSlideDataForCarousel(
    sliderPattern.cards.map((card) => extractSlideCardData(card)).filter(Boolean)
  );
  const interactionTiming = getInteractionTiming(node);
  const isLogoOnlyTrack = sliderPattern.cards.every((card) => isLogoLikeTrackCard(card));
  const rawLogoSlides = sliderPattern.cards.map((card) => extractRawLogoSlideFromCard(card)).filter(Boolean);
  const useNativeImageCarousel =
    !coreSafeMode &&
    rawLogoSlides.length === sliderPattern.cards.length &&
    (isLogoOnlyTrack || isExplicitLogoCarousel(node, sliderPattern) || shouldForceNativeImageCarousel(node, helpers));
  const useNativeSlidesWidget =
    !coreSafeMode &&
    !useNativeImageCarousel &&
    slideData.length === sliderPattern.cards.length &&
    slideData.every((slide) => slide.type === "content") &&
    sliderPattern.cards.every((card) => hasRole(card, "slide"));

  if (slideData.length < 2) {
    return null;
  }

  const elements = [];
  const supportingChildren = getVisibleSceneChildren(node).filter((child) => child !== sliderPattern.trackNode && child !== sliderPattern.dotsNode);
  for (const child of supportingChildren) {
    const mapped = mapNode(child, helpers, depth + 1);
    if (mapped) {
      elements.push(mapped);
    }
  }

  const averageSlideWidth =
    sliderPattern.cards.reduce((sum, card) => sum + Math.max(getNodeBounds(card).width, 1), 0) / Math.max(sliderPattern.cards.length, 1);
  const nativeVisibleSlides = Math.max(1, Math.min(10, Math.round(getNodeBounds(node).width / Math.max(averageSlideWidth, 1))));
  const sliderOptions = {
    visibleSlides: sliderPattern.visibleSlides,
    gap: sliderPattern.gap,
    autoplay: hasAutoPlayMotion(node),
    autoplayDelay: interactionTiming.autoplayDelay,
    transitionDuration: interactionTiming.transitionDuration
  };

  elements.push(
    useNativeImageCarousel || slideData.every((slide) => slide.type === "logo")
      ? buildNativeImageCarouselNode(
          node,
          useNativeImageCarousel ? rawLogoSlides : slideData,
          {
            ...sliderOptions,
            visibleSlides: nativeVisibleSlides
          },
          helpers
        )
      : useNativeSlidesWidget
        ? buildNativeSlidesNode(
            node,
            slideData,
            sliderOptions,
            helpers
          )
      : createHtmlWidgetNode(
          `${node.name || "Slider"} Carousel`,
          buildSliderHtml(
            node,
            slideData,
            sliderOptions,
            helpers
          ),
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

function findOverlayLayers(node) {
  if (!hasChildren(node) || node.layoutMode !== "NONE") {
    return null;
  }

  const candidates = node.children
    .filter((child) => child.visible !== false && isShapeNode(child) && (!child.children || !child.children.length))
    .sort((left, right) => getArea(right) - getArea(left));

  if (candidates.length < 2) {
    return null;
  }

  const base = candidates[0];
  const overlay = candidates.find((child, index) => index > 0 && getArea(child) >= getArea(base) * 0.7 && isContainedWithin(child, base, 16));

  if (!base || !overlay) {
    return null;
  }

  const foregroundChildren = node.children.filter((child) => child !== base && child !== overlay);
  if (!foregroundChildren.length || foregroundChildren.some((child) => !isContainedWithin(child, base))) {
    return null;
  }

  return {
    base,
    overlay,
    foregroundChildren
  };
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
    const fontWeight = normalizeFontWeightValue(node.style.fontWeight);
    if (fontWeight) {
      settings.typography_font_weight = fontWeight;
    }
    if (String(node.style.fontWeight).toLowerCase().includes("italic")) {
      settings.typography_font_style = "italic";
    }
  }

  if (typeof node.style.letterSpacingPx === "number") {
    settings.typography_letter_spacing = px(node.style.letterSpacingPx);
  }

  const textTransform = mapTextTransform(node.style.textCase);
  if (textTransform) {
    settings.typography_text_transform = textTransform;
  }

  const textDecoration = mapTextDecoration(node.style.textDecoration);
  if (textDecoration) {
    settings.typography_text_decoration = textDecoration;
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
  const radii = getCornerRadiusValues(node);
  if (radii) {
    settings.border_radius = box(radii[0], radii[1], radii[2], radii[3]);
  }
}

function applyBlur(settings, node) {
  const blur = findBlurEffect(node);
  if (!blur) {
    return;
  }

  settings.f2e_filter_blur = Math.round(blur.radius || 0);
  if (blur.type === "BACKGROUND_BLUR") {
    settings.f2e_backdrop_blur = Math.round(blur.radius || 0);
  }
}

function applyResponsiveHints(settings, node) {
  const display = getResponsiveDisplay(node);
  settings.hide_desktop = !display.desktop ? "yes" : "";
  settings.hide_tablet = !display.tablet ? "yes" : "";
  settings.hide_mobile = !display.mobile ? "yes" : "";

  const breakpoints = getBreakpointHints(node);
  if (breakpoints.stackOn.includes("tablet")) {
    settings.flex_direction_tablet = "column";
  }
  if (breakpoints.stackOn.includes("mobile")) {
    settings.flex_direction_mobile = "column";
  }
}

function applyContainerSurface(settings, node) {
  const fill = firstBackgroundFill(node);

  if (fill) {
    if (fill.type === "SOLID" && fill.color) {
      settings.background_background = "classic";
      settings.background_color = normalizeColor(fill.color);
      settings.background_hover_background = "classic";
      settings.background_hover_color = shiftColor(fill.color, -0.08);
    } else if (Array.isArray(fill.gradientStops) && fill.gradientStops.length >= 2) {
      const firstStop = fill.gradientStops[0];
      const lastStop = fill.gradientStops[fill.gradientStops.length - 1];
      settings.background_background = "gradient";
      settings.background_color = normalizeColor(firstStop?.color);
      settings.background_color_b = normalizeColor(lastStop?.color);
      settings.background_gradient_type = String(fill.type || "").includes("RADIAL") ? "radial" : "linear";
      settings.background_gradient_angle = gradientAngleFromHandles(fill);
      settings.background_hover_background = "gradient";
      settings.background_hover_color = shiftColor(firstStop?.color || "#111827", -0.05);
      settings.background_hover_color_b = shiftColor(lastStop?.color || "#1f2937", -0.05);
    }
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
  applyBlur(settings, node);
  applyResponsiveHints(settings, node);
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

function mapOverlayLayerGroup(node, helpers, depth, layers) {
  const { base, overlay, foregroundChildren } = layers;
  const bounds = getNodeBounds(base);
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
    _title: node.name || "Overlay Container",
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

  applyContainerSurface(settings, base);

  const overlayFill = firstBackgroundFill(overlay);
  if (overlayFill?.type === "SOLID" && overlayFill.color) {
    settings.background_overlay_background = "classic";
    settings.background_overlay_color = normalizeColor(overlayFill.color);
    settings.background_overlay_opacity = {
      unit: "%",
      size: Math.round(((getColorChannels(normalizeColor(overlayFill.color))?.alpha ?? 1) * 100)),
      sizes: []
    };
  } else if (overlayFill && Array.isArray(overlayFill.gradientStops) && overlayFill.gradientStops.length >= 2) {
    const firstStop = overlayFill.gradientStops[0];
    const lastStop = overlayFill.gradientStops[overlayFill.gradientStops.length - 1];
    settings.background_overlay_background = "gradient";
    settings.background_overlay_color = normalizeColor(firstStop?.color);
    settings.background_overlay_color_b = normalizeColor(lastStop?.color);
    settings.background_overlay_gradient_type = String(overlayFill.type || "").includes("RADIAL") ? "radial" : "linear";
    settings.background_overlay_gradient_angle = gradientAngleFromHandles(overlayFill);
  }

  const overlayBlur = findBlurEffect(overlay);
  if (overlayBlur && overlayBlur.type === "BACKGROUND_BLUR") {
    settings.f2e_background_overlay_backdrop_blur = Math.round(overlayBlur.radius || 0);
  }

  applyResponsiveHints(settings, node);

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
  applyResponsiveHints(settings, node);

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

  applyBorder(settings, node);
  applyBorderRadius(settings, node);
  applyShadow(settings, node);
  applyResponsiveHints(settings, node);

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
  const fill = firstBackgroundFill(node);
  const textFill = textChild ? firstSolidFill(textChild) : null;
  const solidColor = fill?.type === "SOLID" ? fill.color : fill?.gradientStops?.[0]?.color;
  const hoverColor =
    fill?.type === "SOLID"
      ? shiftColor(fill.color || "#00695c", -0.12)
      : shiftColor(fill?.gradientStops?.[fill.gradientStops.length - 1]?.color || solidColor || "#00695c", -0.12);
  const settings = {
    _title: node.name || "Button",
    text: textChild?.characters || node.name || "Click here",
    background_color: normalizeColor(solidColor) || "#00695c",
    button_text_color: normalizeColor(textFill?.color) || "#ffffff",
    background_hover_color: hoverColor,
    button_hover_color: normalizeColor(textFill?.color) || "#ffffff",
    hover_animation: "grow",
    padding: box(node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft)
  };

  applyBorder(settings, node);
  applyBorderRadius(settings, node);
  applyShadow(settings, node);
  applyResponsiveHints(settings, node);
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

  const explicitWidgetNode = mapExplicitFrameWidget(node, helpers);
  if (explicitWidgetNode) {
    return explicitWidgetNode;
  }

  if (hasRole(node, "feature-grid")) {
    const featureGrid = mapFeatureGridNode(node, helpers);
    if (featureGrid) {
      return featureGrid;
    }
  }

  if (hasRole(node, "stats")) {
    const stats = mapStatsNode(node, helpers);
    if (stats) {
      return stats;
    }
  }

  if (hasRole(node, "logo-grid")) {
    const logoGrid = mapLogoGridNode(node, helpers);
    if (logoGrid) {
      return logoGrid;
    }
  }

  if (hasRole(node, "nav")) {
    const nav = mapNavNode(node, helpers);
    if (nav) {
      return nav;
    }
  }

  if (hasRole(node, "testimonial")) {
    return mapTestimonialNode(node, helpers);
  }

  if (hasRole(node, "pricing-table")) {
    return mapPricingTableNode(node, helpers);
  }

  if (hasRole(node, "form")) {
    const form = mapFormNode(node, helpers);
    if (form) {
      return form;
    }
  }

  if (hasRole(node, "tabs")) {
    const tabs = mapTabsNode(node, helpers);
    if (tabs) {
      return tabs;
    }
  }

  if (hasRole(node, "accordion")) {
    const accordion = mapAccordionNode(node, helpers);
    if (accordion) {
      return accordion;
    }
  }

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

  const overlayLayers = findOverlayLayers(node);
  if (overlayLayers) {
    return mapOverlayLayerGroup(node, helpers, depth, overlayLayers);
  }

  const shouldSkipHeuristicSlider = !explicitWidget && !hasRole(node, "slider", "carousel") && hasExplicitSliderDescendant(node);
  const sliderPattern = shouldSkipHeuristicSlider ? null : findSliderPattern(node);
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

  if (explicitWidget === "icon" || hasRole(node, "icon")) {
    return mapIconNode(node, helpers);
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

function collectWidgetTypes(nodes, bucket = new Set()) {
  for (const node of nodes || []) {
    if (!node) {
      continue;
    }

    if (node.elType === "widget" && node.widgetType) {
      bucket.add(node.widgetType);
    }

    if (Array.isArray(node.elements) && node.elements.length) {
      collectWidgetTypes(node.elements, bucket);
    }
  }

  return bucket;
}

function getElementorProWidgetTypes(widgetTypes) {
  const proOnly = new Set(["slides", "media-carousel"]);
  return [...widgetTypes].filter((type) => proOnly.has(type)).sort();
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
    report,
    root: normalized
  };

  const content = (normalized.children || []).map((node) => mapNode(node, helpers, 0)).filter(Boolean);
  const widgetTypes = collectWidgetTypes(content);
  const proWidgetTypes = getElementorProWidgetTypes(widgetTypes);
  const requiresElementorPro = proWidgetTypes.length > 0;
  const exportMode = getExportMode(helpers);

  if (requiresElementorPro) {
    helpers.report.warnings.push(
      `This export uses Elementor Pro widgets: ${proWidgetTypes.join(", ")}. Keep Elementor Pro active to import and edit it.`
    );
  } else if (exportMode === "core-safe") {
    helpers.report.warnings.push("Core-safe export mode is enabled. Pro-only widgets were avoided where possible.");
  }

  return {
    ok: true,
    source: normalized,
    report: {
      ...report,
      widgetTypes: [...widgetTypes].sort(),
      exportMode,
      requiresElementorPro,
      proWidgetTypes
    },
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
