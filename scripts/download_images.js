const axios = require('axios');
const fs = require('fs');
const path = require('path');

const IMAGE_POOL = {
  "Óleos e Tinturas": [
    "https://cbdfx.com/cdn/shop/files/cbdfx-us-tinctures-calming-1000mg.jpg?v=1760761902",
    "https://www.cibdol.com/5503-atmn_normal_rectangle/cbd-oil-10.jpg",
    "https://justcbdstore.com/cdn/shop/files/JustCBDFS_Tincture_1500mg_Bottle_WEB_650px_Render.png?v=1755806129&width=650",
    "https://justcbdstore.com/cdn/shop/files/JustCBDCO_Tincture_5000mg_Bottle_WEB_650px_Render.png?v=1755806117&width=650",
    "https://www.cibdol.com/4789-atmn_normal_rectangle/cbd-oil-for-dogs-4.jpg",
    "https://www.charlottesweb.com/cdn/shop/files/Daily_Care_CBD_Oil_60mg_100ml_Mint_Chocolate.png",
    "https://www.charlottesweb.com/cdn/shop/files/Original_Formula_CBD_Oil_50mg_100ml_Mint_Chocolate.png"
  ],
  "Flores de Cânhamo": [
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2021/12/blueberry-muffin-cbd-flower-326x391.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/01/bubblegum-runtz-cbd-flower-326x391.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2020/06/popcorn-nuggies-cbd-flowers-326x391.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2025/02/dog-cbd-wellness-bundle-326x391.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2026/04/Untitled-design-2026-04-17T135045.019-326x391.png",
    "https://imagedelivery.net/oqXi1BQMsmt839D0VWJs0g/542af2cb-b949-4475-94f4-d25b23f9fe00/w=768,h=768,fit=crop",
    "https://imagedelivery.net/oqXi1BQMsmt839D0VWJs0g/8a414b1a-66a0-4d3e-fa9a-a868b48d7d00/w=768,h=768,fit=crop",
    "https://imagedelivery.net/oqXi1BQMsmt839D0VWJs0g/f51ea864-ac91-4ab2-c427-08b2eb6b3000/w=768,h=768,fit=crop"
  ],
  "Gomas e Edibles": [
    "https://cbdfx.com/cdn/shop/files/gummies-original-mixed-berries-1500mg.jpg?v=1760764160",
    "https://justcbdstore.com/cdn/shop/files/Sour-Bear-1000.jpg?v=1752060737&width=650",
    "https://justcbdstore.com/cdn/shop/files/Peach-Rings-1000_9091a31f-1656-49ef-aac9-d1d0e9791c26.jpg?v=1752141531&width=650",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/01/cbd-belgian-milk-chocolate-bar-sativa-326x391.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/11/Hot-Chocolate-Stirrer-1-326x391.png",
    "https://www.charlottesweb.com/cdn/shop/files/SleepCBDGummies60ct.png",
    "https://www.charlottesweb.com/cdn/shop/files/Calm_CBD_Gummies_60ct.png"
  ],
  "Tópicos e Cosméticos": [
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-muscle-joint-cream-1000mg-may-09-2022.jpg?v=1760762093",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2019/09/original-cbd-balm-30ml-326x391.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/06/cbd-day-face-serum-326x391.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/06/Bath-Bomb-Lavender-1-326x391.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/06/CBD-Beard-Oil-Growth-1-326x391.png",
    "https://www.charlottesweb.com/cdn/shop/files/CBD_Cream_2.5oz.png",
    "https://www.charlottesweb.com/cdn/shop/files/CBD_Balm_Stick.png"
  ],
  "Acessórios e Vapes": [
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-product-vape-disposable-fp-purple-blue-razz-jan-30-2024.jpg?v=1760763435",
    "https://justcbdstore.com/cdn/shop/files/2mL-_-Northern-Lights-_-Vape-Device-_-JustCBD-_972x972pxl_1.jpg?v=1752141122&width=650",
    "https://justcbdstore.com/cdn/shop/files/JustBattery_Gold_2.jpg?v=1752141399&width=1440",
    "https://justcbdstore.com/cdn/shop/files/LIVE-RESIN-_-2mL-_-OG-Kush-_-Vape-Device-_-JustCBD-_650x650pxl.jpg?v=1752142068&width=650",
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-product-vape-disposable-fp-purple-punch-jan-30-2024_e42008d7-5c3d-4786-9c92-58df6e74eb4f.jpg"
  ]
};

const FOLDER_MAP = {
  "Óleos e Tinturas": "oleos",
  "Flores de Cânhamo": "flores",
  "Gomas e Edibles": "edibles",
  "Tópicos e Cosméticos": "cosmeticos",
  "Acessórios e Vapes": "vapes"
};

async function downloadImage(url, folder, filename) {
  const dest = path.join(__dirname, '..', 'public', 'products', folder, filename);
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(dest);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(true));
      writer.on('error', (err) => {
        console.error(`Error writing ${filename}:`, err.message);
        resolve(false);
      });
    });
  } catch (err) {
    console.error(`Error downloading ${url}:`, err.message);
    return false;
  }
}

async function run() {
  console.log("Starting massive image download...");
  for (const [category, urls] of Object.entries(IMAGE_POOL)) {
    const folder = FOLDER_MAP[category];
    console.log(`Downloading for category: ${category} -> ${folder}`);
    for (let i = 0; i < urls.length; i++) {
      const ext = urls[i].includes('.png') ? '.png' : '.jpg';
      const filename = `${folder}_real_${i + 1}${ext}`;
      const success = await downloadImage(urls[i], folder, filename);
      if (success) console.log(`  Saved: ${filename}`);
    }
  }
  console.log("Download complete.");
}

run();
