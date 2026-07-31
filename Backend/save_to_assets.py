import pypdf
import json
import re
import os

reader = pypdf.PdfReader("Stock.pdf")
items = []

ignore_patterns = [
    r"VMNR Polymers",
    r"UDYAM :",
    r"E-Mail :",
    r"Stock Summary",
    r"1-Apr-25 to",
    r"Page \d+",
    r"Particulars\s+Closing Balance",
    r"Value",
    r"Carried Over",
    r"Brought Forward",
    r"continued \.\.\."
]

def should_ignore(line):
    for pattern in ignore_patterns:
        if re.search(pattern, line, re.IGNORECASE):
            return True
    if not line.strip():
        return True
    return False

item_id = 1
for page_idx, page in enumerate(reader.pages):
    text = page.extract_text(extraction_mode="layout")
    for line in text.splitlines():
        line_str = line.strip()
        if should_ignore(line_str):
            continue
        
        # Check for numeric value at the end of the line
        match = re.search(r"\s+([\d,]+\.\d{2})$", line)
        if match:
            price_str = match.group(1)
            name = line[:match.start()].strip()
            price = float(price_str.replace(",", ""))
        else:
            name = line_str
            price = 0.0
            
        # Clean name from extra spaces
        name = re.sub(r"\s+", " ", name)
        if not name:
            continue
        
        # Categorize
        name_upper = name.upper()
        if "SS304" in name_upper or "SS 304" in name_upper:
            if "PTFE" in name_upper:
                cat = "SS304 PTFE LINED"
            else:
                cat = "SS304"
        elif "SS316" in name_upper or "SS 316" in name_upper:
            cat = "SS316"
        elif "PTFE" in name_upper:
            if "MS" in name_upper or "LINED" in name_upper:
                cat = "MS PTFE LINED"
            else:
                cat = "PTFE"
        elif "BELLOW" in name_upper:
            cat = "BELLOWS"
        elif any(x in name_upper for x in ["BOLT", "NUT", "WASHER", "ALLENKEY", "ALLANKEY", "STUD"]):
            cat = "BOLTS AND NUTS"
        elif "PFA" in name_upper:
            cat = "MS PFA LINED"
        elif "VIEW GLASS" in name_upper or "GLASS" in name_upper:
            cat = "VIEW GLASS"
        else:
            cat = "OTHERS"
            
        items.append({
            "id": str(item_id),
            "name": name,
            "category": cat,
            "price_per_kg": price,
            "unit": "pcs"
        })
        item_id += 1

dest_dir = r"..\Frontend\app\src\main\assets"
os.makedirs(dest_dir, exist_ok=True)
dest_file = os.path.join(dest_dir, "products.json")

with open(dest_file, "w") as f:
    json.dump(items, f, indent=4)

print(f"Successfully saved {len(items)} items to {dest_file}")
