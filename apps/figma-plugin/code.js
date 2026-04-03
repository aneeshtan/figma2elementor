figma.showUI(__html__, {
  width: 420,
  height: 680,
  themeColors: true
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function channelToHex(value) {
  return clamp(Math.round(value * 255), 0, 255).toString(16).padStart(2, "0");
}

function rgbaToHex(paint) {
  if (!paint || !paint.color) {
    return null;
  }

  const alpha = typeof paint.opacity === "number" ? channelToHex(paint.opacity) : "";
  return `#${channelToHex(paint.color.r)}${channelToHex(paint.color.g)}${channelToHex(paint.color.b)}${alpha}`;
}

function rgbaObjectToHex(color) {
  if (!color) {
    return null;
  }

  const alpha = typeof color.a === "number" ? channelToHex(color.a) : "";
  return `#${channelToHex(color.r)}${channelToHex(color.g)}${channelToHex(color.b)}${alpha}`;
}

function extractPaints(node) {
  if (!("fills" in node) || !Array.isArray(node.fills)) {
    return [];
  }

  return node.fills
    .filter((paint) => paint.visible !== false)
    .map((paint) => ({
      type: paint.type,
      color: paint.type === "SOLID" ? rgbaToHex(paint) : null
    }))
    .filter(Boolean);
}

function extractStrokes(node) {
  if (!("strokes" in node) || !Array.isArray(node.strokes)) {
    return [];
  }

  return node.strokes
    .filter((stroke) => stroke.visible !== false)
    .map((stroke) => ({
      type: stroke.type,
      color: stroke.type === "SOLID" ? rgbaToHex(stroke) : null,
      weight: "strokeWeight" in node && typeof node.strokeWeight === "number" ? node.strokeWeight : 1
    }))
    .filter(Boolean);
}

function extractEffects(node) {
  if (!("effects" in node) || !Array.isArray(node.effects)) {
    return [];
  }

  return node.effects
    .filter((effect) => effect.visible !== false)
    .map((effect) => ({
      type: effect.type,
      color: rgbaObjectToHex(effect.color),
      offset: effect.offset ? { x: effect.offset.x, y: effect.offset.y } : { x: 0, y: 0 },
      radius: typeof effect.radius === "number" ? effect.radius : 0,
      spread: typeof effect.spread === "number" ? effect.spread : 0
    }));
}

function extractBounds(node) {
  return {
    x: "x" in node ? node.x : 0,
    y: "y" in node ? node.y : 0,
    width: "width" in node ? node.width : 0,
    height: "height" in node ? node.height : 0
  };
}

function isSceneNodeWithChildren(node) {
  return "children" in node && Array.isArray(node.children);
}

function hasImageFill(node) {
  if (!("fills" in node) || !Array.isArray(node.fills)) {
    return false;
  }

  return node.fills.some((paint) => paint && paint.visible !== false && paint.type === "IMAGE");
}

function shouldExportNodeImage(node) {
  if (node.type === "IMAGE") {
    return true;
  }

  return hasImageFill(node) && (!isSceneNodeWithChildren(node) || !node.children.length);
}

async function extractImageUrl(node) {
  if (!shouldExportNodeImage(node)) {
    return null;
  }

  try {
    const bytes = await node.exportAsync({
      format: "PNG"
    });

    return `data:image/png;base64,${figma.base64Encode(bytes)}`;
  } catch (error) {
    return null;
  }
}

function serializeTextStyle(node) {
  if (node.type !== "TEXT") {
    return null;
  }

  const lineHeight = node.lineHeight;
  const lineHeightPx = lineHeight && lineHeight.unit === "PIXELS" ? lineHeight.value : null;

  return {
    fontFamily: node.fontName && node.fontName !== figma.mixed ? node.fontName.family : null,
    fontWeight: node.fontName && node.fontName !== figma.mixed ? node.fontName.style : null,
    fontSize: typeof node.fontSize === "number" ? node.fontSize : null,
    lineHeightPx,
    textAlignHorizontal: node.textAlignHorizontal || "LEFT"
  };
}

function extractVariantProperties(node) {
  if (!("variantProperties" in node) || !node.variantProperties || node.variantProperties === figma.mixed) {
    return null;
  }

  const result = {};
  const entries = Object.entries(node.variantProperties);

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const key = entry[0];
    const value = entry[1];

    if (typeof value === "string" && value.trim()) {
      result[key] = value.trim();
    }
  }

  return Object.keys(result).length ? result : null;
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

function firstDefinedVariantState(variantProperties) {
  if (!variantProperties) {
    return null;
  }

  const priorityKeys = ["state", "status", "interaction", "mode"];

  for (let index = 0; index < priorityKeys.length; index += 1) {
    const key = priorityKeys[index];

    if (typeof variantProperties[key] === "string") {
      const normalized = normalizeStateToken(variantProperties[key]);
      if (normalized) {
        return normalized;
      }
    }
  }

  const entries = Object.entries(variantProperties);
  for (let index = 0; index < entries.length; index += 1) {
    const normalized = normalizeStateToken(entries[index][1]);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function extractMotionTokens(name) {
  const normalizedName = String(name || "").toLowerCase();
  const motions = [];
  const tokens = [
    ["motion:fade-up", "fade-up"],
    ["motion:fade-in", "fade-in"],
    ["motion:slide-up", "slide-up"],
    ["motion:slide-left", "slide-left"],
    ["motion:slide-right", "slide-right"],
    ["motion:grow", "grow"],
    ["motion:lift", "lift"],
    ["motion:zoom-in", "zoom-in"],
    ["motion:autoplay", "autoplay"]
  ];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (normalizedName.includes(token[0])) {
      motions.push(token[1]);
    }
  }

  if (!motions.length) {
    if (normalizedName.includes("fade up")) motions.push("fade-up");
    if (normalizedName.includes("fade in")) motions.push("fade-in");
    if (normalizedName.includes("slide up")) motions.push("slide-up");
    if (normalizedName.includes("slide left")) motions.push("slide-left");
    if (normalizedName.includes("slide right")) motions.push("slide-right");
    if (normalizedName.includes("grow")) motions.push("grow");
    if (normalizedName.includes("lift")) motions.push("lift");
    if (normalizedName.includes("autoplay")) motions.push("autoplay");
  }

  return motions;
}

function inferSemanticRole(name) {
  const normalizedName = String(name || "").toLowerCase();
  const explicitMatches = normalizedName.match(/\[(slider|carousel|slide|track|dots|dot|button|card|hover-target|prev|next|media|content)\]/g);

  if (explicitMatches && explicitMatches.length) {
    return explicitMatches[0].replace(/[\[\]]/g, "");
  }

  if (normalizedName.includes("slider") || normalizedName.includes("carousel")) return "slider";
  if (normalizedName.includes(" slide") || normalizedName.startsWith("slide ") || normalizedName.includes("[slide]")) return "slide";
  if (normalizedName.includes("track") || normalizedName.includes("viewport")) return "track";
  if (normalizedName.includes("dots") || normalizedName.includes("pagination") || normalizedName.includes("indicators")) return "dots";
  if (normalizedName === "dot" || normalizedName.includes(" dot ")) return "dot";
  if (normalizedName.includes("button") || normalizedName.includes("cta")) return "button";
  if (normalizedName.includes("card")) return "card";
  if (normalizedName.includes("hover-target")) return "hover-target";
  if (normalizedName.includes("previous") || normalizedName.includes("prev")) return "prev";
  if (normalizedName.includes("next")) return "next";
  if (normalizedName.includes("media") || normalizedName.includes("image")) return "media";
  if (normalizedName.includes("content") || normalizedName.includes("body")) return "content";
  return null;
}

function extractSemantics(name, variantProperties) {
  const normalizedName = String(name || "").toLowerCase();
  let state = firstDefinedVariantState(variantProperties);

  if (!state) {
    if (normalizedName.includes("[hover]") || normalizedName.includes(" hover")) state = "hover";
    if (normalizedName.includes("[default]") || normalizedName.includes(" default")) state = "default";
    if (normalizedName.includes("[active]") || normalizedName.includes(" active")) state = "active";
    if (normalizedName.includes("[focus]") || normalizedName.includes(" focus")) state = "focus";
  }

  return {
    role: inferSemanticRole(name),
    state,
    motionTokens: extractMotionTokens(name)
  };
}

function findFirstTextDescendant(node) {
  if (!node) {
    return null;
  }

  if (node.type === "TEXT" && node.characters && node.characters.trim()) {
    return node;
  }

  if (!isSceneNodeWithChildren(node)) {
    return null;
  }

  for (let index = 0; index < node.children.length; index += 1) {
    const match = findFirstTextDescendant(node.children[index]);
    if (match) {
      return match;
    }
  }

  return null;
}

function summarizeVariantNode(node) {
  const textNode = findFirstTextDescendant(node);

  return {
    fills: extractPaints(node),
    strokes: extractStrokes(node),
    effects: extractEffects(node),
    opacity: "opacity" in node && typeof node.opacity === "number" ? node.opacity : 1,
    cornerRadius: "cornerRadius" in node && typeof node.cornerRadius === "number" ? node.cornerRadius : 0,
    paddingTop: "paddingTop" in node ? node.paddingTop : 0,
    paddingRight: "paddingRight" in node ? node.paddingRight : 0,
    paddingBottom: "paddingBottom" in node ? node.paddingBottom : 0,
    paddingLeft: "paddingLeft" in node ? node.paddingLeft : 0,
    text: textNode
      ? {
          characters: textNode.characters || "",
          fills: extractPaints(textNode),
          style: serializeTextStyle(textNode)
        }
      : null
  };
}

function extractTransition(transition) {
  if (!transition) {
    return null;
  }

  return {
    type: typeof transition.type === "string" ? transition.type : null,
    easing: typeof transition.easing === "string" ? transition.easing : null,
    duration: typeof transition.duration === "number" ? transition.duration : null,
    direction: typeof transition.direction === "string" ? transition.direction : null
  };
}

function extractReactions(node) {
  if (!("reactions" in node) || !Array.isArray(node.reactions)) {
    return [];
  }

  return node.reactions.map((reaction) => ({
    trigger: reaction && reaction.trigger && typeof reaction.trigger.type === "string" ? reaction.trigger.type : null,
    action: reaction && reaction.action && typeof reaction.action.type === "string" ? reaction.action.type : null,
    destinationId: reaction && reaction.action && typeof reaction.action.destinationId === "string" ? reaction.action.destinationId : null,
    navigation: reaction && reaction.action && typeof reaction.action.navigation === "string" ? reaction.action.navigation : null,
    transition: reaction && reaction.action ? extractTransition(reaction.action.transition) : null
  }));
}

function extractInteractiveVariants(node) {
  let componentSet = null;
  let currentComponent = null;

  if (node.type === "COMPONENT_SET") {
    componentSet = node;
  } else if (node.type === "COMPONENT" && node.parent && node.parent.type === "COMPONENT_SET") {
    componentSet = node.parent;
    currentComponent = node;
  } else if ("mainComponent" in node && node.mainComponent && node.mainComponent.parent && node.mainComponent.parent.type === "COMPONENT_SET") {
    componentSet = node.mainComponent.parent;
    currentComponent = node.mainComponent;
  }

  if (!componentSet || !Array.isArray(componentSet.children)) {
    return null;
  }

  const variants = componentSet.children
    .filter((child) => child && child.type === "COMPONENT")
    .slice(0, 8)
    .map((component) => {
      const variantProperties = extractVariantProperties(component);
      const semantics = extractSemantics(component.name, variantProperties);

      return {
        id: component.id,
        name: component.name,
        state: semantics.state,
        role: semantics.role,
        variantProperties,
        summary: summarizeVariantNode(component)
      };
    });

  if (!variants.length) {
    return null;
  }

  return {
    componentSetName: componentSet.name,
    currentComponentId: currentComponent ? currentComponent.id : null,
    currentComponentName: currentComponent ? currentComponent.name : null,
    variants
  };
}

function extractComponentMetadata(node, variantProperties) {
  const semantics = extractSemantics(node.name, variantProperties);
  const metadata = {
    kind: node.type,
    semantics
  };

  if ("mainComponent" in node && node.mainComponent) {
    metadata.mainComponentName = node.mainComponent.name;
    metadata.mainComponentKey = node.mainComponent.key || null;
  }

  if (node.type === "COMPONENT" && node.key) {
    metadata.componentKey = node.key;
  }

  if ((node.type === "COMPONENT" || node.type === "COMPONENT_SET") && node.description) {
    metadata.description = node.description;
  }

  const interactiveVariants = extractInteractiveVariants(node);
  if (interactiveVariants) {
    metadata.interactiveVariants = interactiveVariants;
  }

  return metadata;
}

async function serializeNode(node) {
  const variantProperties = extractVariantProperties(node);
  const semantics = extractSemantics(node.name, variantProperties);
  const payload = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible !== false,
    layoutMode: "layoutMode" in node ? node.layoutMode : "NONE",
    itemSpacing: "itemSpacing" in node ? node.itemSpacing : 0,
    primaryAxisAlignItems: "primaryAxisAlignItems" in node ? node.primaryAxisAlignItems : null,
    counterAxisAlignItems: "counterAxisAlignItems" in node ? node.counterAxisAlignItems : null,
    paddingTop: "paddingTop" in node ? node.paddingTop : 0,
    paddingRight: "paddingRight" in node ? node.paddingRight : 0,
    paddingBottom: "paddingBottom" in node ? node.paddingBottom : 0,
    paddingLeft: "paddingLeft" in node ? node.paddingLeft : 0,
    cornerRadius: "cornerRadius" in node && typeof node.cornerRadius === "number" ? node.cornerRadius : 0,
    clipsContent: "clipsContent" in node ? Boolean(node.clipsContent) : false,
    absoluteBoundingBox: extractBounds(node),
    fills: extractPaints(node),
    strokes: extractStrokes(node),
    effects: extractEffects(node),
    opacity: "opacity" in node && typeof node.opacity === "number" ? node.opacity : 1,
    characters: node.type === "TEXT" ? node.characters : null,
    style: serializeTextStyle(node),
    variantProperties,
    semantics,
    reactions: extractReactions(node),
    component: extractComponentMetadata(node, variantProperties),
    imageUrl: await extractImageUrl(node),
    children: []
  };

  if (isSceneNodeWithChildren(node)) {
    payload.children = await Promise.all(
      node.children
        .filter((child) => child.visible !== false)
        .map((child) => serializeNode(child))
    );
  }

  return payload;
}

async function getSelectionPayload() {
  const selection = figma.currentPage.selection;

  if (!selection.length) {
    return {
      name: "Empty selection",
      type: "SELECTION",
      children: []
    };
  }

  return {
    name: selection.length === 1 ? selection[0].name : "Figma selection",
    type: "SELECTION",
    children: await Promise.all(selection.map((node) => serializeNode(node)))
  };
}

async function sendSelection() {
  try {
    figma.ui.postMessage({
      type: "selection-data",
      payload: await getSelectionPayload()
    });
  } catch (error) {
    figma.ui.postMessage({
      type: "plugin-error",
      payload: {
        error: error instanceof Error ? error.message : "Could not read the current Figma selection."
      }
    });
  }
}

async function initializePlugin() {
  try {
    figma.on("selectionchange", () => {
      void sendSelection();
    });
    figma.ui.postMessage({
      type: "controller-ready",
      payload: {
        pageName: figma.currentPage ? figma.currentPage.name : "Unknown page"
      }
    });
  } catch (error) {
    figma.ui.postMessage({
      type: "plugin-error",
      payload: {
        error: error instanceof Error ? error.message : "Could not initialize plugin access to the Figma document."
      }
    });
  }
}

figma.ui.onmessage = async (message) => {
  if (message.type === "ui-ready") {
    await sendSelection();
    return;
  }

  if (message.type === "refresh-selection") {
    await sendSelection();
    return;
  }

  if (message.type === "convert-selection") {
    try {
      if (!message.endpoint || typeof message.endpoint !== "string") {
        throw new Error("Missing API endpoint. Paste a valid /api/convert URL before converting.");
      }

      if (!message.apiKey || typeof message.apiKey !== "string") {
        throw new Error("Missing API key. Copy a key from the dashboard and paste it into the plugin.");
      }

      const selectionPayload = await getSelectionPayload();
      if (!selectionPayload.children.length) {
        throw new Error("No frame or layer is selected. Select a Figma frame, then click Convert again.");
      }

      const response = await fetch(message.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": message.apiKey,
          "x-client-name": "figma-plugin",
          "x-origin-app": "figma"
        },
        body: JSON.stringify({
          source: selectionPayload
        })
      });

      const rawBody = await response.text();
      let result = null;

      try {
        result = rawBody ? JSON.parse(rawBody) : null;
      } catch (error) {
        result = {
          ok: false,
          error: rawBody || "The API returned a non-JSON response."
        };
      }

      if (!response.ok) {
        throw new Error((result && result.error) || `API request failed with status ${response.status}.`);
      }

      figma.ui.postMessage({
        type: "conversion-result",
        payload: result
      });
    } catch (error) {
      figma.ui.postMessage({
        type: "conversion-result",
        payload: {
          ok: false,
          error: error instanceof Error ? error.message : "Could not reach the API."
        }
      });
    }
  }
};

initializePlugin();
