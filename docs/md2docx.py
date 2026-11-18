"""MANUAL_BOOK_ABSEN.md -> .docx (salinan pola admin-webkarbon/docs/md2docx.py): cover, daftar isi, heading, tabel, kotak placeholder gambar."""
import re, sys
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

src, out = sys.argv[1], sys.argv[2]
IMG, EXT = (sys.argv[3], "jpg") if len(sys.argv) > 3 else ("img", "png")  # argv[3]: folder jpg terkompres untuk upload
text = open(src, encoding="utf-8").read()
meta_raw, body = re.match(r"---\n(.*?)\n---\n(.*)", text, re.S).groups()
meta = dict(l.split(": ", 1) for l in meta_raw.splitlines())
lines = body.splitlines()

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin = sec.top_margin = Cm(3); sec.right_margin = sec.bottom_margin = Cm(2.5)
base = doc.styles["Normal"]; base.font.name = "Times New Roman"; base.font.size = Pt(12)
base.paragraph_format.line_spacing = 1.15; base.paragraph_format.space_after = Pt(6)
for name, size in [("Heading 1", 14), ("Heading 2", 12), ("Heading 3", 12)]:
    st = doc.styles[name]; st.font.name = "Times New Roman"; st.font.size = Pt(size)
    st.font.bold = True; st.font.color.rgb = RGBColor(0, 0, 0)
    st.element.rPr.rFonts.set(qn("w:asciiTheme"), "") if False else None

def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr(); s = OxmlElement("w:shd")
    s.set(qn("w:val"), "clear"); s.set(qn("w:color"), "auto"); s.set(qn("w:fill"), fill); tcPr.append(s)

def runs(p, s):
    """**tebal** dan `kode` jadi run berformat."""
    for part in re.split(r"(\*\*[^*]+\*\*|`[^`]+`)", s):
        if not part: continue
        if part.startswith("**"): p.add_run(part[2:-2]).bold = True
        elif part.startswith("`"): r = p.add_run(part[1:-1]); r.font.name = "Courier New"
        else: p.add_run(part)

def para(s="", align=None, size=None, bold=False, after=None):
    p = doc.add_paragraph(); r = p.add_run(s); r.bold = bold
    if size: r.font.size = Pt(size)
    if align is not None: p.alignment = align
    if after is not None: p.paragraph_format.space_after = Pt(after)
    return p

num_id = None
def set_num(p, nid):
    pPr = p._p.get_or_add_pPr(); numPr = OxmlElement("w:numPr")
    for tag, val in [("w:ilvl", "0"), ("w:numId", str(nid))]:
        e = OxmlElement(tag); e.set(qn("w:val"), val); numPr.append(e)
    pPr.append(numPr)

def restart(p):
    """daftar bernomor baru mulai dari 1: num baru yang memakai abstractNum gaya List Number."""
    global num_id
    numbering = doc.part.numbering_part.element
    style_num = doc.styles["List Number"].element.pPr.numPr.numId.val
    abstract = numbering.num_having_numId(style_num).abstractNumId.val
    num = numbering.add_num(abstract)
    ov = OxmlElement("w:lvlOverride"); ov.set(qn("w:ilvl"), "0")
    so = OxmlElement("w:startOverride"); so.set(qn("w:val"), "1"); ov.append(so); num.append(ov)
    num_id = num.numId; set_num(p, num_id)

def page_break(): doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# ---- cover ----
for _ in range(4): para()
para(meta["instansi"].upper(), WD_ALIGN_PARAGRAPH.CENTER, 14, True)
para(meta["wilayah"], WD_ALIGN_PARAGRAPH.CENTER, 12)
for _ in range(3): para()
para(align=WD_ALIGN_PARAGRAPH.CENTER).runs[0].add_picture("../src/assets/logo-karang-bongkot.png", width=Cm(5))
for _ in range(3): para()
para(meta["judul"].upper(), WD_ALIGN_PARAGRAPH.CENTER, 24, True)
para(meta["subjudul"], WD_ALIGN_PARAGRAPH.CENTER, 16, True)
for _ in range(8): para()
para(meta["versi"], WD_ALIGN_PARAGRAPH.CENTER, 12)
para(meta["tanggal"], WD_ALIGN_PARAGRAPH.CENTER, 12)

# ---- isi ----
headings = [(1 if l.startswith("# ") else 2, l.lstrip("# ").strip()) for l in lines if re.match(r"#{1,2} ", l)]
gambar_bab = {}; bab_no = 0; i = 0
while i < len(lines):
    l = lines[i]
    if l.startswith("# "):
        page_break(); judul = l[2:].strip()
        m = re.match(r"(BAB [IVXL]+) (.*)", judul)
        if m: bab_no += 1
        h = doc.add_heading("", 1); h.alignment = WD_ALIGN_PARAGRAPH.CENTER
        h.add_run(m.group(1) if m else judul)
        if m: h.add_run().add_break(); h.add_run(m.group(2))
    elif l.startswith("## "): doc.add_heading(l[3:].strip(), 2)
    elif l.strip() == "[[DAFTAR_ISI]]":
        for lvl, t in headings:
            if t == "DAFTAR ISI": continue
            p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.left_indent = Cm(0 if lvl == 1 else 1)
            r = p.add_run(t); r.bold = lvl == 1
        n = para("Catatan: untuk daftar isi bernomor halaman, gunakan Sisipkan › Daftar isi di Google Docs/Word lalu hapus daftar ini.", size=9)
        n.runs[0].italic = True
    elif l.startswith("[[GAMBAR"):
        kode, judul, ket = [x.strip() for x in l.strip()[2:-2].replace("GAMBAR", "", 1).split("|")]
        gambar_bab[bab_no] = gambar_bab.get(bab_no, 0) + 1
        p = para(align=WD_ALIGN_PARAGRAPH.CENTER, after=2)
        p.runs[0].add_picture(f"{IMG}/{kode}.{EXT}", height=Cm(11))  # mockup HP tegak
        cap = para(f"Gambar {bab_no}.{gambar_bab[bab_no]} {judul}", WD_ALIGN_PARAGRAPH.CENTER, 10, after=12)
        cap.runs[0].italic = True
    elif l.startswith("|"):
        rows = []
        while i < len(lines) and lines[i].startswith("|"):
            if not re.match(r"\|[-| ]+\|$", lines[i]): rows.append([c.strip() for c in lines[i].strip("|").split("|")])
            i += 1
        t = doc.add_table(rows=len(rows), cols=len(rows[0])); t.style = "Table Grid"
        for ri, row in enumerate(rows):
            for ci, val in enumerate(row):
                cell = t.cell(ri, ci); p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
                runs(p, val)
                for r in p.runs: r.font.size = Pt(10.5); r.bold = r.bold or ri == 0
                if ri == 0: shade(cell, "D9D9D9")
        doc.add_paragraph()
        continue
    elif m := re.match(r"(\s*)(\d+)\. (.*)", l):
        p = doc.add_paragraph(style="List Number" if not m.group(1) else "List Number 2"); runs(p, m.group(3))
        if m.group(2) == "1" and not m.group(1): restart(p)
        elif not m.group(1) and num_id: set_num(p, num_id)
    elif m := re.match(r"(\s*)- (.*)", l):
        p = doc.add_paragraph(style="List Bullet" if not m.group(1) else "List Bullet 2"); runs(p, m.group(2))
    elif l.startswith("> "):
        t = doc.add_table(rows=1, cols=1); t.style = "Table Grid"; c = t.cell(0, 0); shade(c, "FFF8DC")
        p = c.paragraphs[0]; r = p.add_run("Catatan: "); r.bold = True; runs(p, l[2:])
        doc.add_paragraph()
    elif l.strip():
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY; runs(p, l.strip())
    i += 1

# nomor halaman di footer
fp = sec.footer.paragraphs[0]; fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
for tag, txt in [("begin", None), (None, "PAGE"), ("end", None)]:
    r = fp.add_run()
    if tag: e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), tag)
    else: e = OxmlElement("w:instrText"); e.text = txt
    r._r.append(e)
sec.different_first_page_header_footer = True  # cover tanpa nomor
doc.save(out)
print("gambar:", sum(gambar_bab.values()), "heading:", len(headings))
