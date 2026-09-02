const file=document.getElementById("file");
const paletteSize=document.getElementById("paletteSize");
const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d",{willReadFrequently:true});
const palette=document.getElementById("palette");

let currentImageLoaded=false;

file.onchange=()=>{
  const f=file.files?.[0];
  if(!f)return;

  const img=new Image();

  img.onload=()=>{
    const max=500;
    const scale=Math.min(1,max/Math.max(img.width,img.height));

    canvas.width=Math.max(1,Math.round(img.width*scale));
    canvas.height=Math.max(1,Math.round(img.height*scale));
    ctx.drawImage(img,0,0,canvas.width,canvas.height);

    currentImageLoaded=true;
    extract();
    URL.revokeObjectURL(img.src);
  };

  img.src=URL.createObjectURL(f);
};

paletteSize.onchange=()=>{
  if(currentImageLoaded)extract();
};

function extract(){
  const requestedColors=Number(paletteSize.value);
  const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  const bins=new Map();
  const step=4*10;

  for(let i=0;i<data.length;i+=step){
    const a=data[i+3];
    if(a<180)continue;

    const r=data[i];
    const g=data[i+1];
    const b=data[i+2];

    if(r>245&&g>245&&b>245)continue;

    const q=v=>Math.min(255,Math.round(v/32)*32);
    const key=[q(r),q(g),q(b)].join(",");
    bins.set(key,(bins.get(key)||0)+1);
  }

  const colors=[...bins.entries()]
    .sort((a,b)=>b[1]-a[1])
    .slice(0,40)
    .map(([k,c])=>({rgb:k.split(",").map(Number),c}));

  const chosen=[];

  for(const col of colors){
    if(chosen.every(x=>dist(x.rgb,col.rgb)>80)){
      chosen.push(col);
      if(chosen.length===requestedColors)break;
    }
  }

  for(const col of colors){
    if(chosen.length>=requestedColors)break;
    if(!chosen.includes(col))chosen.push(col);
  }

  palette.style.gridTemplateColumns=`repeat(${requestedColors}, 1fr)`;

  palette.innerHTML=chosen.slice(0,requestedColors).map(({rgb})=>{
    const hex="#"+rgb.map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase();
    const lum=(.299*rgb[0]+.587*rgb[1]+.114*rgb[2]);

    return `<div class="swatch" style="background:${hex};color:${lum>150?"#111":"#fff"}">
      <button data-color="${hex}">Copy</button>
      <span>${hex}<br>rgb(${rgb.join(", ")})</span>
    </div>`;
  }).join("");

  palette.querySelectorAll("button").forEach(button=>{
    button.onclick=async()=>{
      try{
        await navigator.clipboard.writeText(button.dataset.color);
        const original=button.textContent;
        button.textContent="Copied";
        setTimeout(()=>button.textContent=original,1000);
      }catch{
        window.prompt("Copy color:",button.dataset.color);
      }
    };
  });
}

function dist(a,b){
  return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
}
