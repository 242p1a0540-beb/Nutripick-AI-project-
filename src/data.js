export const products = [
  {id:"apple", name:"Apple", category:"Food · Fruit", emoji:"🍎", calories:52, protein:0.3, sugar:10.4, fat:0.2, saturated:0, sodium:1, fiber:2.4, processing:0, price:80, unit:"2 medium", ingredients:"Apple", note:"Naturally occurring sugar and fiber.", source:"Demo"},
  {id:"banana", name:"Banana", category:"Food · Fruit", emoji:"🍌", calories:89, protein:1.1, sugar:12.2, fat:0.3, saturated:.1, sodium:1, fiber:2.6, processing:0, price:50, unit:"2 medium", ingredients:"Banana", note:"Good source of carbohydrate and fiber.", source:"Demo"},
  {id:"maggi", name:"Instant Noodles", category:"Food · Packaged", emoji:"🍜", calories:310, protein:7, sugar:3, fat:12, saturated:5, sodium:780, fiber:2, processing:3, price:50, unit:"1 pack", ingredients:"Refined wheat flour, palm oil, seasoning", note:"Packaged food; sodium is relatively high in demo data.", source:"Demo"},
  {id:"protein-noodles", name:"High Protein Noodles", category:"Food · Packaged", emoji:"🍜", calories:280, protein:15, sugar:2, fat:7, saturated:3, sodium:600, fiber:6, processing:3, price:85, unit:"1 pack", ingredients:"Wheat-based ingredients, protein blend, seasoning", note:"Highest protein and fiber among the demo noodle options.", source:"Demo"},
  {id:"milk", name:"Plain Milk", category:"Food · Dairy", emoji:"🥛", calories:61, protein:3.2, sugar:5, fat:3.3, saturated:1.9, sodium:43, fiber:0, processing:1, price:35, unit:"250 ml", ingredients:"Milk", note:"Provides protein and calcium; no added sugar in demo data.", source:"Demo"},
  {id:"oats", name:"Oats", category:"Food · Grain", emoji:"🥣", calories:389, protein:16.9, sugar:.9, fat:6.9, saturated:1.2, sodium:2, fiber:10.6, processing:1, price:120, unit:"100 g", ingredients:"Whole oats", note:"High fiber and protein for a grain.", source:"Demo"}
];

export const goals = [
  {id:"overall", icon:"✨", title:"Best Overall", desc:"Balanced value and quality"},
  {id:"price", icon:"💰", title:"Best Value", desc:"Lower price when possible"},
  {id:"quality", icon:"⭐", title:"Best Rated", desc:"Prioritize customer rating"},
  {id:"healthy", icon:"🥗", title:"Healthier", desc:"Use nutrition when available"}
];

export function scoreProduct(p, goal="overall") {
  const rating = Math.min((Number(p.rating)||0)/5,1);
  const lowPrice = 1-Math.min((Number(p.price)||1000)/2000,1);
  const stock = p.stock===0 ? 0 : 1;
  const nutrition = p.calories != null ? (
    .30*Math.min((Number(p.protein)||0)/20,1)+
    .25*Math.min((Number(p.fiber)||0)/10,1)+
    .20*(1-Math.min((Number(p.sugar)||0)/30,1))+
    .15*(1-Math.min((Number(p.sodium)||0)/1000,1))+
    .10*(1-Math.min((Number(p.saturated)||0)/15,1))
  ) : .5;
  let s;
  if(goal==="price") s=.50*lowPrice+.25*rating+.15*stock+.10*nutrition;
  else if(goal==="quality") s=.60*rating+.20*stock+.10*lowPrice+.10*nutrition;
  else if(goal==="healthy") s=.75*nutrition+.10*rating+.10*lowPrice+.05*stock;
  else s=.35*rating+.25*nutrition+.20*lowPrice+.20*stock;
  return Math.round(Math.max(0,Math.min(100,s*100)));
}

function normalizeDummy(p){
  const title=p.title||p.name||"Unknown product";
  return {id:`online-${p.id}`, name:title, category:p.category||"Online product", emoji:"🛍️", price:Number(p.price)||0, rating:Number(p.rating)||0, stock:Number(p.stock)||0, brand:p.brand||"Not listed", description:p.description||"No description available.", thumbnail:p.thumbnail||p.images?.[0]||"", images:p.images||[], discount:p.discountPercentage||0, shipping:p.shippingInformation||"Not listed", warranty:p.warrantyInformation||"Not listed", returnPolicy:p.returnPolicy||"Not listed", dimensions:p.dimensions, source:"Online catalog", calories:null, protein:null, sugar:null, fat:null, saturated:null, sodium:null, fiber:null};
}

function normalizeFood(p){
  const n=p.nutriments||{};
  return {id:`off-${p.code||p.id||Math.random()}`, name:p.product_name||"Unknown food product", category:`Food · ${p.categories_tags?.[0]?.replace("en:","")||"Packaged"}`, emoji:"🍽️", price:0, rating:0, stock:1, brand:p.brands||"Not listed", description:p.generic_name||p.product_name||"Food product", thumbnail:p.image_front_small_url||p.image_url||"", images:[p.image_front_url,p.image_url].filter(Boolean), source:"Open Food Facts", calories:Number(n["energy-kcal_100g"])||null, protein:Number(n.proteins_100g)||null, sugar:Number(n.sugars_100g)||null, fat:Number(n.fat_100g)||null, saturated:Number(n["saturated-fat_100g"])||null, sodium:Number(n.sodium_100g)||null, fiber:Number(n.fiber_100g)||null, ingredients:p.ingredients_text||"Ingredients not listed."};
}

export async function searchOnlineProducts(query){
  const q=query.trim();
  if(!q) return [];
  const requests=[
    fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(q)}&limit=20`).then(r=>r.ok?r.json():null).catch(()=>null),
    fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10`).then(r=>r.ok?r.json():null).catch(()=>null)
  ];
  const [general,food]=await Promise.all(requests);
  const a=(general?.products||[]).map(normalizeDummy);
  const b=(food?.products||[]).filter(x=>x.product_name).map(normalizeFood);
  const seen=new Set();
  return [...a,...b].filter(p=>{const k=p.name.toLowerCase(); if(seen.has(k))return false;seen.add(k);return true;}).slice(0,24);
}
