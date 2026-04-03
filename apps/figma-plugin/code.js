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

function serializeNode(node) {
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
    characters: node.type === "TEXT" ? node.characters : null,
    style: serializeTextStyle(node),
    children: []
  };

  if (isSceneNodeWithChildren(node)) {
    payload.children = node.children
      .filter((child) => child.visible !== false)
      .map((child) => serializeNode(child));
  }

  return payload;
}

function getSelectionPayload() {
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
    children: selection.map((node) => serializeNode(node))
  };
}

function sendSelection() {
  try {
    figma.ui.postMessage({
      type: "selection-data",
      payload: getSelectionPayload()
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
    figma.on("selectionchange", sendSelection);
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
    sendSelection();
    return;
  }

  if (message.type === "refresh-selection") {
    sendSelection();
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

      const selectionPayload = getSelectionPayload();
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
