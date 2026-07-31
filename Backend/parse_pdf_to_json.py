import pypdf
import json
import re

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

for page_idx, page in enumerate(reader.pages):
    text = page.extract_text(extraction_mode="layout")
    for line in text.splitlines():
        line_str = line.strip()
        if should_ignore(line_str):
            continue
        
        # Check for numeric value at the end of the line
        # The values can look like: 280.00, 1,797.00, 37,000.00, etc.
        # Let's split by multiple spaces or find the rightmost part
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
        
        # Categorize
        name_upper = name.uppercase() if hasattr(name, 'uppercase') else name.upper()
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
            "name": name,
            "category": cat,
            "price": price,
            "unit": "pcs" # default unit
        })

print(f"Extracted {len(items)} items.")
print("First 20 items:")
for it in items[:20]:
    print(it)

# Write to JSON for inspection
with open("extracted_items.json", "w") as f:
    json.dump(items, f, indent=4)
