import xml.etree.ElementTree as ET

def generate_svg_label(top_text, number, bottom_text, filename):
    try:
        import barcode
        from barcode.writer import SVGWriter
    except ImportError:
        print("Error: python-barcode is not installed. Run 'pip install python-barcode'")
        return

    # Generate barcode SVG
    Code128 = barcode.get_barcode_class('code128')
    writer = SVGWriter()
    code = Code128(number, writer=writer)
    
    # Render with options
    barcode_svg = code.render({
        'write_text': False,
        'module_width': 0.3,
        'module_height': 15.0,
        'quiet_zone': 1.0,
    })
    
    # Parse the barcode SVG
    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    root = ET.fromstring(barcode_svg)
    
    # Extract all rects
    rects = []
    for rect in root.findall('.//{http://www.w3.org/2000/svg}rect'):
        # Ignore the background rect
        style = rect.get('style', '').lower()
        if 'fill:white' in style:
            continue
            
        # Strip "mm" to use standard units
        for attr in ['x', 'y', 'width', 'height']:
            val = rect.get(attr)
            if val and val.endswith('mm'):
                rect.set(attr, val[:-2])
                
        # Set specific fill color for barcode lines
        rect.set('fill', '#0f172a')
        if 'style' in rect.attrib:
            del rect.attrib['style']
            
        rects.append(ET.tostring(rect, encoding='unicode'))
        
    barcode_lines = ''.join(rects)

    # Calculate offset to center the barcode
    # Our barcode width is roughly 35 "units" (mm stripped)
    # We'll translate it to the center of our 400px wide SVG.
    # We will use scale to make it fit nicely.
    
    svg_template = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
    <style>
        .top-text {{ font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #0056b3; letter-spacing: 2px; }}
        .number-text {{ font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #1a202c; letter-spacing: 4px; }}
        .bottom-text {{ font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #0f172a; letter-spacing: 2px; }}
        .border {{ fill: white; stroke: #c0cdd9; stroke-width: 3px; rx: 12px; ry: 12px; }}
        .divider {{ stroke: #dbe3ea; stroke-width: 2px; }}
    </style>

    <!-- Background and Border -->
    <rect x="2" y="2" width="396" height="196" class="border" />

    <!-- Top Text -->
    <text x="30" y="35" class="top-text">{top_text}</text>

    <!-- Top Divider -->
    <line x1="30" y1="50" x2="370" y2="50" class="divider" />

    <!-- Barcode Group -->
    <g transform="translate(35, 60) scale(8.5, 4.5)">
        {barcode_lines}
    </g>

    <!-- Number Text -->
    <text x="200" y="145" class="number-text" text-anchor="middle">{number}</text>

    <!-- Bottom Divider -->
    <line x1="30" y1="160" x2="370" y2="160" class="divider" />

    <!-- Bottom Text -->
    <text x="200" y="185" class="bottom-text" text-anchor="middle">{bottom_text}</text>
</svg>
"""
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(svg_template)
    
    print(f"Label saved to {filename}")

if __name__ == '__main__':
    generate_svg_label("DET-PINE-2L", "2024699900018", "RULERSHIP LTD PTY", "label.svg")
