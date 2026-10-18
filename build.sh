#!/bin/sh
# Builds a single self-contained index.html from src/ (fonts inlined as base64)
set -e
cd "$(dirname "$0")"
node -e '
const fs=require("fs"),vm=require("vm");
const js=["data","audio","art","game","ui","main"].map(f=>fs.readFileSync("src/"+f+".js","utf8")).join("\n");
new vm.Script(js);
const b64=f=>fs.readFileSync("src/"+f).toString("base64");
const fonts="@font-face{font-family:Brush;src:url(data:font/woff;base64,"+b64("brush.woff")+") format(\"woff\");font-display:block}@font-face{font-family:Hand;src:url(data:font/woff;base64,"+b64("hand.woff")+") format(\"woff\");font-display:block}";
const html=fs.readFileSync("src/head.html","utf8").replace("/*FONTS*/",()=>fonts).split("/*ICON*/").join("data:image/png;base64,"+b64("icon.png"))+js+fs.readFileSync("src/tail.html","utf8");
fs.writeFileSync("index.html",html);console.log("built index.html",html.length,"bytes");'
