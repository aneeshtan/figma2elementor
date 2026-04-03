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

async function serializeNode(node) {
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
    absoluteBoundingBox: extractBounds(node),
    fills: extractPaints(node),
    strokes: extractStrokes(node),
    effects: extractEffects(node),
    opacity: "opacity" in node && typeof node.opacity === "number" ? node.opacity : 1,
    characters: node.type === "TEXT" ? node.characters : null,
    style: serializeTextStyle(node),
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
