import pypdf

reader = pypdf.PdfReader("Stock.pdf")
first_page_text = reader.pages[0].extract_text(extraction_mode="layout")
for line in first_page_text.splitlines():
    if line.strip():
        print(repr(line))
