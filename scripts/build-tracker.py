"""Rebuild the downloadable A4 tracker: python scripts/build-tracker.py."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor

ROOT = Path(__file__).resolve().parents[1]
out = ROOT / 'downloads' / 'sleep-lab-tracker.pdf'
out.parent.mkdir(exist_ok=True)
c = canvas.Canvas(str(out), pagesize=A4, pageCompression=1, invariant=1)
c.setTitle('Sleep Lab - My sleep experiment')
c.setAuthor("Shayne's Wellbeing Toolkit")
W, H = A4
LEFT, RIGHT = 36, W - 36
ink, soft, line = '#182230', '#536174', '#CCD2DA'
def text(x, y, value, size=9, bold=False, color=ink):
    c.setFillColor(HexColor(color))
    c.setFont('Helvetica-Bold' if bold else 'Helvetica', size)
    c.drawString(x, y, value)
def rule(y, x1=LEFT, x2=RIGHT):
    c.setStrokeColor(HexColor(line)); c.setLineWidth(.5); c.line(x1, y, x2, y)

text(LEFT, 804, "SHAYNE'S WELLBEING TOOLKIT", 8, True, soft)
text(LEFT, 768, 'My sleep experiment', 27, True)
text(LEFT, 748, 'Two phases, at your own pace. Record near waking; gaps are okay.', 10, color=soft)
rule(733)
text(LEFT, 713, 'Name (optional)', 8, color=soft); rule(698, LEFT, 279)
text(304, 713, 'House / year (optional)', 8, color=soft); rule(698, 304, RIGHT)

def week(y, label, subtitle, start):
    text(LEFT, y, label, 12, True)
    text(LEFT, y-16, subtitle, 8.5, color=soft)
    top=y-28
    widths=[62,62,69,62,70,62,57,79.27]
    xs=[LEFT]
    for w in widths: xs.append(xs[-1]+w)
    c.setFillColor(HexColor('#EEF1F5')); c.rect(LEFT,top-32,RIGHT-LEFT,32,fill=1,stroke=0)
    labels=[['Morning','date'],['Lights','out'],['Minutes to','fall asleep'],['Night','wake-ups'],['Awake','minutes**'],['Out of','bed'],['Day felt','1-5'],['Changes','done*']]
    for i,parts in enumerate(labels):
        for j,part in enumerate(parts): text(xs[i]+6,top-12-j*10,part,8,True)
    for row in range(7):
        yy=top-32-row*24
        rule(yy-24)
    for x in xs[1:-1]:
        c.setStrokeColor(HexColor(line));c.line(x,top-32,x,top-200)

week(672, '01  Notice your usual sleep', 'Baseline: record your routine. Review after five entries; keep logging if useful.',1)
week(416, '02  Try your chosen changes', 'Changes phase: mark A, B or C for habits tried. Compare after five entries.',8)
text(LEFT, 169, '* My chosen changes',10,True)
for label,y in [('A',149),('B',128),('C',107)]:
    text(LEFT,y,label,9,True);rule(y-3,LEFT+20,RIGHT)
text(LEFT, 84, 'Day felt: 1 = very low energy, 3 = in between, 5 = very good energy.',8,color=soft)
text(LEFT, 70, '** Total awake after first falling asleep, including before getting up. Estimates are fine.',8,color=soft)
rule(58)
text(LEFT, 43, 'Need support? Talk to your counsellor or a healthcare professional at any point.',8,color=soft)
c.showPage();c.save()
print(out)
