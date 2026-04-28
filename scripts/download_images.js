const axios = require('axios');
const fs = require('fs');
const path = require('path');

const IMAGE_POOL = {
  "Óleos e Tinturas": [
    "https://cbdfx.com/cdn/shop/files/cbdfx-us-tinctures-calming-1000mg.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-d9-thc-sweet-dreams-drops-1500.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-us-tinctures-wellness-1000mg.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-d9-thc-ultimate-chill-blend-1500.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-sleep-tincture-1000mg.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-tincture-focus-mushroom-2000-nov-1-2021.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-tincture-unwind-mushroom-2000-nov-1-2021.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2021/05/pure-green-cbd-oil-10ml-sativa.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2019/09/green-edition-cbd-oil-10ml-sativa.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2021/05/pure-blue-cbd-oil-10ml-sativa.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2019/09/blue-edition-cbd-oil-10ml-sativa.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2021/05/pure-purple-cbd-oil-10ml-hybrid.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2019/09/purple-edition-cbd-oil-10ml-hybrid.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/11/Gold-Edition-Oil.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/11/Pure-Black-Edition-Oil.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2019/09/white-edition-cbd-oil.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2019/09/Red-Edition-Oil-500x501-1.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2019/09/cbd-brothers-silver-edition-oil.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2021/05/pure-green-cbd-oil-capsules-sativa.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2021/03/Pet-Hemp-Oil-30ml-2000px-500x501-1.png"
  ],
  "Flores de Cânhamo": [
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/08/divine-jelly2.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2021/12/blueberry-muffin-cbd-flower.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/01/bubblegum-runtz-cbd-flower.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2020/06/popcorn-nuggies-cbd-flowers.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2020/10/shake-cbd-hemp-flower6-1.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/10/Wizard_Of-OZ-1.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/11/cakeberry-brulee-cbd-flower.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2025/06/amnesia-cbd-flower-bud.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2019/05/chocolope-cbd-flower.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/10/Lemon-Fritter-1.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/11/flow-gardens-blue-meringue-1.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/11/Interstellar-cbd-flower-bud.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/11/Mango-Tree.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/11/flow-gardens-skunk-butter.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/10/ParadiseOG-1-1.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/11/flow-gardens-blueberry-cough-drops-cbd-flower.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/10/flow-gardens-fabled.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2025/01/flow-gardens-bubba-gas-x-t1-cbd-flower.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2025/03/Godfather_OG__63940-1.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/12/flow-gardens-grapefruit-cbd-flower-bud.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2025/02/flow-gardens-lemon-cheese-cbd-flower.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/11/Mystery-OZ-1-1.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2025/05/flow-gardens-orange-glaze-award-winner-badge.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/11/flow-gardens-sour-tsunami-cbd-flower.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/11/flow-gardens-wipe-out-cbd-flower-1.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/10/flow-gardens-yak-butter-cbd-flower.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2021/06/crumble-1.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/05/caramelo-cbn-extract-1.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2020/10/cbd-tea-pollen.jpg"
  ],
  "Gomas e Edibles": [
    "https://cbdfx.com/cdn/shop/files/gummies-original-mixed-berries-1500mg.jpg",
    "https://cbdfx.com/cdn/shop/files/magic-melon-thc-gummies-ratio-1.jpg",
    "https://cbdfx.com/cdn/shop/files/lemon-dream-thc-gummies-ratio-1.jpg",
    "https://cbdfx.com/cdn/shop/files/cbd-gummies-sleep-melatonin-6000mg-cbdfx.jpg",
    "https://cbdfx.com/cdn/shop/files/berry-buzz-5mgthc-gummies-ratio-1-1.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-gummies-full-spectrum-mixed-berries-1500mg-60ct-apr-03-2024.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-gummies-turmeric-spirulina-bottle-3000mg-apr-14-2023.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-us-gummies-mushrooms.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2022/05/cbd-fruity-cubes-10mg.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/04/cbd-gummy-bears-50mg.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2021/10/cbd-cherry-gummies-50mg.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/01/cbd-belgian-milk-chocolate-bar-sativa.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/01/cbd-belgian-white-chocolate-bar-indica.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/01/cbd-belgian-white-chocolate-bar-sativa.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/11/Hot-Chocolate-Stirrer-1.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/01/cbd-belgian-dark-chocolate-bar-indica.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/01/cbd-belgian-dark-chocolate-bar-sativa.jpg",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2024/10/cbd-belgian-milk-chocolate-bar-indica.jpg"
  ],
  "Tópicos e Cosméticos": [
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2019/09/original-cbd-balm-30ml.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/06/Bath-Bomb-Lavender-1.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/06/Bath-Bomb-Muscle-1.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/06/cbd-day-face-serum.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/12/CBD-Evening-Serum-Replenish-30ml-Bottle-Mockup-2000px-500x500-1.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/06/Beard-Balm.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/06/cbd-matt-clay-50ml.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/06/CBD-Pomade.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/06/CBD-Beard-Oil-Growth-1.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/12/cbd-topical-patches-lavender-15mg.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/06/CBD-Beard-Oil-Hydrate-1.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2022/07/cbd-brothers-topical-patches-15mg.png",
    "https://www.thecbdflowershop.co.uk/wp-content/uploads/2023/12/cbd-brothers-topical-patches-30mg.png"
  ],
  "Acessórios e Vapes": [
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-product-vape-disposable-fp-purple-punch-jan-30-2024_e42008d7-5c3d-4786-9c92-58df6e74eb4f.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-product-vape-disposable-fp-purple-strawberry-lemonade-jan-30-2024_eff96f15-d448-4c41-b02b-ea7d09508194.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-product-vape-disposable-fp-purple-blue-raspberry-jan-30-2024_6bd290b4-f1e6-44f2-bee7-e4f4cdd8dd82.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-product-vape-disposable-fp-purple-maui-wowie-jan-30-2024_f372ddea-f3fe-4071-9cb5-27b4bdd64197.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-product-vape-disposable-fp-purple-pineapple-express-jan-30-2024_1b204a22-623d-4362-aac9-60fec27d1e5b.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-product-vape-disposable-fp-purple-cool-mint-jan-30-2024-1-1_4021ba15-1590-421d-9f1a-290e2c7ba3c5.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-product-vape-disposable-fp-purple-watermelon-skit-jan-30-2024_1fa60b47-dc5a-4889-a3ef-f8e6423ef179.jpg",
    "https://cbdfx.com/cdn/shop/files/cbdfx-photo-render-product-vape-disposable-fp-purple-mango-ice-jan-30-2024_9f3d0f50-a944-4b47-b7d7-8aab64a1a11f.jpg"
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
      },
      timeout: 10000
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
    // console.error(`Error downloading ${url}:`, err.message);
    return false;
  }
}

async function run() {
  console.log("Starting MASSIVE image download (140+ unique assets)...");
  
  // Ensure directories exist
  for (const folder of Object.values(FOLDER_MAP)) {
    const dir = path.join(__dirname, '..', 'public', 'products', folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const results = {};

  for (const [category, urls] of Object.entries(IMAGE_POOL)) {
    const folder = FOLDER_MAP[category];
    console.log(`\nDownloading for category: ${category}`);
    results[category] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      // Extract extension or default to .jpg
      const extMatch = url.match(/\.(jpg|jpeg|png|webp)/i);
      const ext = extMatch ? extMatch[0].split('?')[0] : '.jpg';
      const filename = `real_asset_${i + 1}${ext}`;
      
      const success = await downloadImage(url, folder, filename);
      if (success) {
        process.stdout.write(".");
        results[category].push(`/products/${folder}/${filename}`);
      }
    }
    console.log(`\n  Done: ${results[category].length} images saved.`);
  }
  
  console.log("\nDownload complete. Generating inventory report...");
  fs.writeFileSync(path.join(__dirname, 'image_inventory.json'), JSON.stringify(results, null, 2));
  console.log("Inventory saved to scripts/image_inventory.json");
}

run();
