import JSZip from "jszip";

export interface SlideElement {
  id: string;
  type: "text" | "image" | "shape";
  content?: string;
  url?: string; // Image URL for p:pic or blipFill
  crop?: { l: number; t: number; r: number; b: number }; // Image crop percentages (0 to 1)
  color?: string; // For solid fill shapes
  stroke?: { color: string; width: number }; // For shape outlines
  svgPaths?: { d: string; w: number; h: number }[]; // For freeform vector graphics
  x: number; // in EMUs
  y: number; // in EMUs
  w: number; // in EMUs
  h: number; // in EMUs
  fontSize?: number; // in pts
  align?: string;
}

export interface SlideData {
  id: number;
  elements: SlideElement[];
  backgroundUrl?: string;
}

export interface PresentationData {
  size: { w: number; h: number }; // in EMUs
  slides: SlideData[];
}

export async function parsePPTX(arrayBuffer: ArrayBuffer): Promise<PresentationData> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const domParser = new DOMParser();

  // 1. Extract Presentation Size
  let slideWidth = 9144000;
  let slideHeight = 5143500;
  
  const presentationXml = await zip.file("ppt/presentation.xml")?.async("string");
  if (presentationXml) {
    const doc = domParser.parseFromString(presentationXml, "application/xml");
    const sldSz = doc.getElementsByTagName("p:sldSz")[0];
    if (sldSz) {
      slideWidth = parseInt(sldSz.getAttribute("cx") || String(slideWidth), 10);
      slideHeight = parseInt(sldSz.getAttribute("cy") || String(slideHeight), 10);
    }
  }

  const slideFiles = Object.keys(zip.files).filter(
    (name) => name.startsWith("ppt/slides/slide") && name.endsWith(".xml")
  );

  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
    const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
    return numA - numB;
  });

  const slides: SlideData[] = [];

  for (const file of slideFiles) {
    const slideNumMatch = file.match(/slide(\d+)\.xml/);
    if (!slideNumMatch) continue;
    const slideNum = parseInt(slideNumMatch[1], 10);

    const slideData = await parseFile(zip, domParser, file, false);
    if (!slideData) continue;

    let finalBgUrl = slideData.backgroundUrl;
    let masterElements: SlideElement[] = [];
    let layoutElements: SlideElement[] = [];

    // Parse Layout
    if (slideData.layoutTarget) {
      const layoutData = await parseFile(zip, domParser, slideData.layoutTarget, true);
      if (layoutData) {
        if (!finalBgUrl) finalBgUrl = layoutData.backgroundUrl;
        layoutElements = layoutData.elements;

        // Parse Master
        if (layoutData.masterTarget) {
          const masterData = await parseFile(zip, domParser, layoutData.masterTarget, true);
          if (masterData) {
            if (!finalBgUrl) finalBgUrl = masterData.backgroundUrl;
            masterElements = masterData.elements;
          }
        }
      }
    }

    // Combine elements: Master -> Layout -> Slide (so Slide is on top)
    // We add a prefix to IDs to avoid collisions
    const combinedElements = [
      ...masterElements.map(e => ({ ...e, id: `master-${e.id}` })),
      ...layoutElements.map(e => ({ ...e, id: `layout-${e.id}` })),
      ...slideData.elements
    ];

    slides.push({
      id: slideNum,
      elements: combinedElements,
      backgroundUrl: finalBgUrl,
    });
  }

  return {
    size: { w: slideWidth, h: slideHeight },
    slides,
  };
}

async function parseFile(zip: JSZip, domParser: DOMParser, filePath: string, isMasterOrLayout: boolean) {
  const xmlContent = await zip.file(filePath)?.async("string");
  if (!xmlContent) return null;
  const xmlDoc = domParser.parseFromString(xmlContent, "application/xml");

  const lastSlash = filePath.lastIndexOf("/");
  const dir = filePath.substring(0, lastSlash);
  const fileName = filePath.substring(lastSlash + 1);
  const relsFilePath = `${dir}/_rels/${fileName}.rels`;
  
  const relsContent = await zip.file(relsFilePath)?.async("string");
  const relsMap: Record<string, string> = {};
  let layoutTarget = "";
  let masterTarget = "";

  if (relsContent) {
    const relsDoc = domParser.parseFromString(relsContent, "application/xml");
    const rels = relsDoc.getElementsByTagName("Relationship");
    for (let i = 0; i < rels.length; i++) {
      const id = rels[i].getAttribute("Id");
      const target = rels[i].getAttribute("Target");
      const type = rels[i].getAttribute("Type");
      if (id && target) {
        let resolvedTarget = target;
        if (target.startsWith("../")) {
          const parentDir = dir.substring(0, dir.lastIndexOf("/"));
          resolvedTarget = parentDir + "/" + target.substring(3);
        } else if (!target.startsWith("ppt/")) {
          resolvedTarget = dir + "/" + target;
        }
        relsMap[id] = resolvedTarget;
        
        if (type?.endsWith("slideLayout")) layoutTarget = resolvedTarget;
        if (type?.endsWith("slideMaster")) masterTarget = resolvedTarget;
      }
    }
  }

  let backgroundUrl: string | undefined;
  const bgBlip = xmlDoc.getElementsByTagName("p:bg")[0]?.getElementsByTagName("a:blip")[0];
  if (bgBlip) {
    const embedId = bgBlip.getAttribute("r:embed");
    if (embedId && relsMap[embedId]) {
      const mediaFile = zip.file(relsMap[embedId]);
      if (mediaFile) {
        const blob = await mediaFile.async("blob");
        backgroundUrl = URL.createObjectURL(blob);
      }
    }
  }

  const elements: SlideElement[] = [];

  // Parse Shapes (<p:sp>)
  const shapes = xmlDoc.getElementsByTagName("p:sp");
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    
    const isPlaceholder = shape.getElementsByTagName("p:nvPr")[0]?.getElementsByTagName("p:ph").length > 0;
    if (isMasterOrLayout && isPlaceholder) continue; // Skip layout placeholders

    let w = 0, h = 0, x = 0, y = 0;
    const ext = shape.getElementsByTagName("a:ext")[0];
    const off = shape.getElementsByTagName("a:off")[0];
    if (ext) {
      w = parseInt(ext.getAttribute("cx") || "0", 10);
      h = parseInt(ext.getAttribute("cy") || "0", 10);
    }
    if (off) {
      x = parseInt(off.getAttribute("x") || "0", 10);
      y = parseInt(off.getAttribute("y") || "0", 10);
    }

    // Extract color for solid shapes
    let shapeColor = "transparent";
    const solidFill = shape.getElementsByTagName("a:solidFill")[0];
    if (solidFill) {
      const srgbClr = solidFill.getElementsByTagName("a:srgbClr")[0];
      if (srgbClr) {
        shapeColor = `#${srgbClr.getAttribute("val")}`;
      } else {
        // Fallback for schemeClr (theme colors) if we can't parse themes
        shapeColor = "rgba(100, 100, 100, 0.2)"; 
      }
    }

    // Extract Stroke (a:ln)
    let stroke: { color: string; width: number } | undefined;
    const ln = shape.getElementsByTagName("a:ln")[0];
    if (ln) {
      const lnW = parseInt(ln.getAttribute("w") || "0", 10);
      let lnColor = "transparent";
      const lnSolidFill = ln.getElementsByTagName("a:solidFill")[0];
      if (lnSolidFill) {
        const lnSrgbClr = lnSolidFill.getElementsByTagName("a:srgbClr")[0];
        if (lnSrgbClr) {
          lnColor = `#${lnSrgbClr.getAttribute("val")}`;
        } else {
          lnColor = "rgba(0, 0, 0, 1)"; // fallback stroke color
        }
      }
      stroke = { color: lnColor, width: lnW };
    }

    // Extract Vector Paths (FREEFORM / custGeom)
    const svgPaths: { d: string; w: number; h: number }[] = [];
    const custGeom = shape.getElementsByTagName("a:custGeom")[0];
    if (custGeom) {
      const pathLst = custGeom.getElementsByTagName("a:pathLst")[0];
      if (pathLst) {
        const pathNodes = pathLst.getElementsByTagName("a:path");
        for (let ptIdx = 0; ptIdx < pathNodes.length; ptIdx++) {
          const pathNode = pathNodes[ptIdx];
          const pathW = parseInt(pathNode.getAttribute("w") || "100000", 10);
          const pathH = parseInt(pathNode.getAttribute("h") || "100000", 10);
          let d = "";

          const children = pathNode.childNodes;
          for (let c = 0; c < children.length; c++) {
            const cmdNode = children[c] as Element;
            if (!cmdNode.tagName) continue;

            if (cmdNode.tagName === "a:moveTo") {
              const pt = cmdNode.getElementsByTagName("a:pt")[0];
              if (pt) d += `M ${pt.getAttribute("x")} ${pt.getAttribute("y")} `;
            } else if (cmdNode.tagName === "a:lnTo") {
              const pt = cmdNode.getElementsByTagName("a:pt")[0];
              if (pt) d += `L ${pt.getAttribute("x")} ${pt.getAttribute("y")} `;
            } else if (cmdNode.tagName === "a:cubicBezTo") {
              const pts = cmdNode.getElementsByTagName("a:pt");
              if (pts.length >= 3) {
                d += `C ${pts[0].getAttribute("x")} ${pts[0].getAttribute("y")}, `;
                d += `${pts[1].getAttribute("x")} ${pts[1].getAttribute("y")}, `;
                d += `${pts[2].getAttribute("x")} ${pts[2].getAttribute("y")} `;
              }
            } else if (cmdNode.tagName === "a:close") {
              d += "Z ";
            }
          }
          if (d.trim()) {
            svgPaths.push({ d: d.trim(), w: pathW, h: pathH });
          }
        }
      }
    }

    // Extract Shape Fill Image (a:blipFill inside p:sp)
    let shapeImageUrl: string | undefined;
    let shapeImageCrop: { l: number; t: number; r: number; b: number } | undefined;
    
    const blipFill = shape.getElementsByTagName("a:blipFill")[0];
    if (blipFill) {
      const blip = blipFill.getElementsByTagName("a:blip")[0];
      if (blip) {
        const embedId = blip.getAttribute("r:embed");
        if (embedId && relsMap[embedId]) {
          const mediaFile = zip.file(relsMap[embedId]);
          if (mediaFile) {
            const blob = await mediaFile.async("blob");
            shapeImageUrl = URL.createObjectURL(blob);
          }
        }
      }
      
      const srcRect = blipFill.getElementsByTagName("a:srcRect")[0];
      if (srcRect) {
        shapeImageCrop = {
          l: parseInt(srcRect.getAttribute("l") || "0", 10) / 100000,
          t: parseInt(srcRect.getAttribute("t") || "0", 10) / 100000,
          r: parseInt(srcRect.getAttribute("r") || "0", 10) / 100000,
          b: parseInt(srcRect.getAttribute("b") || "0", 10) / 100000,
        };
      }
    }

    const paragraphs = shape.getElementsByTagName("a:p");
    let content = "";
    let fontSize = 18;
    let align = "left";

    for (let p = 0; p < paragraphs.length; p++) {
      const paragraph = paragraphs[p];
      
      const pPr = paragraph.getElementsByTagName("a:pPr")[0];
      if (pPr) {
        const algn = pPr.getAttribute("algn");
        if (algn === "ctr") align = "center";
        if (algn === "r") align = "right";
        if (algn === "just") align = "justify";
      }

      const runs = paragraph.querySelectorAll("r, m\\:r, a\\:r");
      let paraText = "";
      
      for (let r = 0; r < runs.length; r++) {
        const run = runs[r];
        const textNode = run.getElementsByTagName("a:t")[0] || run.getElementsByTagName("m:t")[0];
        
        if (textNode && textNode.textContent) {
          paraText += textNode.textContent;
        }
        
        if (p === 0 && r === 0) {
          const rPr = run.getElementsByTagName("a:rPr")[0] || run.getElementsByTagName("m:rPr")[0];
          if (rPr && rPr.getAttribute("sz")) {
            fontSize = parseInt(rPr.getAttribute("sz") || "1800", 10) / 100;
          }
        }
      }
      
      const mathTexts = paragraph.getElementsByTagName("m:t");
      if (runs.length === 0 && mathTexts.length > 0) {
        for (let mt = 0; mt < mathTexts.length; mt++) {
          paraText += mathTexts[mt].textContent;
        }
      }
      
      content += paraText + (p < paragraphs.length - 1 ? "\n" : "");
    }

    if (content.trim() || svgPaths.length > 0 || shapeImageUrl) {
      elements.push({
        id: `shape-${i}`,
        type: (svgPaths.length > 0 || shapeImageUrl) && !content.trim() ? "shape" : "text",
        content,
        fontSize,
        align,
        color: shapeColor,
        url: shapeImageUrl,
        crop: shapeImageCrop,
        stroke,
        svgPaths,
        x, y, w, h,
      });
    } else if (shapeColor !== "transparent" && w > 0 && h > 0) {
      elements.push({
        id: `bg-shape-${i}`,
        type: "shape",
        color: shapeColor,
        stroke,
        x, y, w, h,
      });
    }
  }

  // Parse Images (<p:pic>)
  const pics = xmlDoc.getElementsByTagName("p:pic");
  for (let i = 0; i < pics.length; i++) {
    const pic = pics[i];
    
    const isPlaceholder = pic.getElementsByTagName("p:nvPr")[0]?.getElementsByTagName("p:ph").length > 0;
    if (isMasterOrLayout && isPlaceholder) continue;

    const blip = pic.getElementsByTagName("a:blip")[0];
    if (!blip) continue;
    const embedId = blip.getAttribute("r:embed");
    if (!embedId || !relsMap[embedId]) continue;

    const mediaFile = zip.file(relsMap[embedId]);
    if (!mediaFile) continue;

    const blob = await mediaFile.async("blob");
    const url = URL.createObjectURL(blob);

    let w = 0, h = 0, x = 0, y = 0;
    const ext = pic.getElementsByTagName("a:ext")[0];
    const off = pic.getElementsByTagName("a:off")[0];
    if (ext) {
      w = parseInt(ext.getAttribute("cx") || "0", 10);
      h = parseInt(ext.getAttribute("cy") || "0", 10);
    }
    if (off) {
      x = parseInt(off.getAttribute("x") || "0", 10);
      y = parseInt(off.getAttribute("y") || "0", 10);
    }
    
    // Extract Image Crop (srcRect)
    let crop: { l: number; t: number; r: number; b: number } | undefined;
    const blipFill = pic.getElementsByTagName("p:blipFill")[0]; // Wait, in p:pic it's p:blipFill
    if (blipFill) {
      const srcRect = blipFill.getElementsByTagName("a:srcRect")[0];
      if (srcRect) {
        crop = {
          l: parseInt(srcRect.getAttribute("l") || "0", 10) / 100000,
          t: parseInt(srcRect.getAttribute("t") || "0", 10) / 100000,
          r: parseInt(srcRect.getAttribute("r") || "0", 10) / 100000,
          b: parseInt(srcRect.getAttribute("b") || "0", 10) / 100000,
        };
      }
    }
    
    // Extract Stroke and CustGeom for image masking (FREEFORM on bitmaps)
    let stroke: { color: string; width: number } | undefined;
    const ln = pic.getElementsByTagName("a:ln")[0];
    if (ln) {
      const lnW = parseInt(ln.getAttribute("w") || "0", 10);
      let lnColor = "transparent";
      const lnSolidFill = ln.getElementsByTagName("a:solidFill")[0];
      if (lnSolidFill) {
        const lnSrgbClr = lnSolidFill.getElementsByTagName("a:srgbClr")[0];
        if (lnSrgbClr) {
          lnColor = `#${lnSrgbClr.getAttribute("val")}`;
        } else {
          lnColor = "rgba(0, 0, 0, 1)";
        }
      }
      stroke = { color: lnColor, width: lnW };
    }

    const svgPaths: { d: string; w: number; h: number }[] = [];
    const custGeom = pic.getElementsByTagName("a:custGeom")[0];
    if (custGeom) {
      const pathLst = custGeom.getElementsByTagName("a:pathLst")[0];
      if (pathLst) {
        const pathNodes = pathLst.getElementsByTagName("a:path");
        for (let ptIdx = 0; ptIdx < pathNodes.length; ptIdx++) {
          const pathNode = pathNodes[ptIdx];
          const pathW = parseInt(pathNode.getAttribute("w") || "100000", 10);
          const pathH = parseInt(pathNode.getAttribute("h") || "100000", 10);
          let d = "";

          const children = pathNode.childNodes;
          for (let c = 0; c < children.length; c++) {
            const cmdNode = children[c] as Element;
            if (!cmdNode.tagName) continue;

            if (cmdNode.tagName === "a:moveTo") {
              const pt = cmdNode.getElementsByTagName("a:pt")[0];
              if (pt) d += `M ${pt.getAttribute("x")} ${pt.getAttribute("y")} `;
            } else if (cmdNode.tagName === "a:lnTo") {
              const pt = cmdNode.getElementsByTagName("a:pt")[0];
              if (pt) d += `L ${pt.getAttribute("x")} ${pt.getAttribute("y")} `;
            } else if (cmdNode.tagName === "a:cubicBezTo") {
              const pts = cmdNode.getElementsByTagName("a:pt");
              if (pts.length >= 3) {
                d += `C ${pts[0].getAttribute("x")} ${pts[0].getAttribute("y")}, `;
                d += `${pts[1].getAttribute("x")} ${pts[1].getAttribute("y")}, `;
                d += `${pts[2].getAttribute("x")} ${pts[2].getAttribute("y")} `;
              }
            } else if (cmdNode.tagName === "a:close") {
              d += "Z ";
            }
          }
          if (d.trim()) {
            svgPaths.push({ d: d.trim(), w: pathW, h: pathH });
          }
        }
      }
    }

    elements.push({
      id: `pic-${i}`,
      type: "image",
      url,
      crop,
      stroke,
      svgPaths: svgPaths.length > 0 ? svgPaths : undefined,
      x, y, w, h,
    });
  }

  return { backgroundUrl, elements, layoutTarget, masterTarget };
}
