import barcode
from barcode.writer import SVGWriter

Code128 = barcode.get_barcode_class('code128')
writer = SVGWriter()
code = Code128("2024699900018", writer=writer)
svg = code.render({'write_text': False, 'module_width': 0.2, 'module_height': 10.0})
with open("test_barcode_output.svg", "wb") as f:
    f.write(svg)
